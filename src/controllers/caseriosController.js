import { Op } from 'sequelize';
import Departamento from '../models/Departamento.js'
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import { getPermisosRol } from './permisosRolesController.js';
import Municipio from '../models/Municipio.js';
import Aldea from '../models/Aldea.js';
import Caserio from '../models/Caserio.js';

//Internos para validacion de claves unicas
async function validateUniquesCaserio({id=null, geocode = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Caserio.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetCaserioById(idCaserio){
  try {
    return Caserio.findByPk(idCaserio);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedCaserios = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Caserios. ' + auth.payload });

    const caserios = (await Caserio.findAndCountAll({
      limit: Number(pageSize),
      offset: Number(page) * Number(pageSize),
      where: getFilter({filterParams: JSON.parse(filter), reviews: JSON.parse(reviews), deleteds: JSON.parse(deleteds)}),
      order: getSorting({sort: JSON.parse(sort), defaultSort: ['geocode', 'ASC'], reviews: JSON.parse(reviews)}),
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'editor'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'revisor'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'eliminador'
        },
        {
          model: Departamento,
          attributes: ['id', 'nombre', 'geocode'],
          as: 'departamento'
        },
        {
          model: Municipio,
          attributes: ['id', 'nombre', 'geocode'],
          as: 'municipio'
        },
        {
          model: Aldea,
          attributes: ['id', 'nombre', 'geocode'],
          as: 'aldea'
        },
      ]
    }));
    res.json(caserios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los caserios: ' + error });
  }
}

//Get list
export const getCaseriosList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Caserios. ' + auth.payload });

    const caserios = await Caserio.findAll({
      attributes: ['id', 'nombre', 'geocode'],
      order: getSorting({defaultSort: ['geocode', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(caserios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de caserios: ' + error });
  }
}

//Get by Id
export const getCaserioById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Caserio. ' + auth.payload });

    const caserio = await Caserio.findByPk(id, {
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'editor'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'revisor'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'eliminador'
        },
        {
          model: Departamento,
          attributes: ['id', 'nombre', 'geocode'],
          as: 'departamento'
        },
        {
          model: Municipio,
          attributes: ['id', 'nombre', 'geocode'],
          as: 'municipio'
        },
        {
          model: Aldea,
          attributes: ['id', 'nombre', 'geocode'],
          as: 'aldea'
        },
      ]
    });

    if (caserio) {
      res.json(caserio);
    } else {
      res.status(404).json({ error: 'Caserio no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener caserio por ID: ' + error });
  }
}


//Create
export const createCaserio = async (req, res) => {
  const { nombre, geocode, departamentoId, municipioId, aldeaId } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Caserio. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentGeocode = await validateUniquesCaserio({geocode})
    if(existentGeocode) return res.status(400).json({ error: `Error al crear el Caserio. El geocode ${geocode} ya está en uso.` });

    const caserio = await Caserio.create({ 
      //Propiedades de entidad
      nombre: nombre.toUpperCase(), 
      geocode, 
      departamentoId,
      municipioId,
      aldeaId,
      //Propiedades de control
      version: '1.0',
      ultimaRevision: '1.0',
      estado: 'Publicado',
      fechaEdicion: new Date(),
      editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null,
    });

    res.status(201).json(caserio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear caserio: ' + error });
  }
}

//Edit
export const editCaserio = async (req, res) => {
  try {
    const { idCaserio, nombre, geocode, departamentoId, municipioId, aldeaId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Caserio. ' + auth.payload });

    const editorId = auth.payload.userId;

    const caserio = await privateGetCaserioById(idCaserio);
    if(!caserio) return res.status(404).json({ error: 'Error al editar el Caserio. Caserio no encontrado' });

    const existentGeocode = await validateUniquesCaserio({geocode, id: idCaserio})
    if(existentGeocode) return res.status(400).json({ error: `Error al crear el Caserio. El geocode ${geocode} ya está en uso.` });

    caserio.update({
      //Propiedades de objeto
      nombre: nombre.toUpperCase(),
      geocode: geocode,
      departamentoId: departamentoId,
      municipioId: municipioId,
      aldeaId: aldeaId,
      //Propiedades de control
      version: updateVersion(caserio.version, true),
      ultimaRevision: updateVersion(caserio.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(caserio);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar caserio: ' + error });
  }
}


//Hide
export const hideCaserio = async (req, res) => {
  const { id: idCaserio, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Caserio. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const caserio = await privateGetCaserioById(idCaserio);
  if(!caserio) return res.status(404).json({ error: 'Error al eliminar el caserio. Caserio no encontrado.' });

  if(caserio.estado !== 'Eliminado'){
    caserio.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    caserio.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(caserio);
}