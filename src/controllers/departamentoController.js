import { Op } from 'sequelize';
import Departamento from '../models/Departamento.js'
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';

//Internos para validacion de claves unicas
async function validateUniquesDepartamento({id=null, geocode = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Departamento.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetDepartamentoById(idDepartamento){
  try {
    return Departamento.findByPk(idDepartamento);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedDepartamentos = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Departamentos. ' + auth.payload });

    const departamentos = (await Departamento.findAndCountAll({
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
        }
      ]
    }));
    res.json(departamentos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los departamentos: ' + error });
  }
}

//Get list
export const getDepartamentosList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Departamentos. ' + auth.payload });

    const departamentos = await Departamento.findAll({
      attributes: ['id', 'nombre', 'geocode'],
      order: getSorting({defaultSort: ['geocode', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(departamentos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de departamentos: ' + error });
  }
}

//Get by Id
export const getDepartamentoById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Departamento. ' + auth.payload });

    const departamento = await Departamento.findByPk(id, {
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
      ]
    });

    if (departamento) {
      res.json(departamento);
    } else {
      res.status(404).json({ error: 'Departamento no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener departamento por ID: ' + error });
  }
}

//Create
export const createDepartamento = async (req, res) => {
  const { nombre, geocode } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Departamento. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentGeocode = await validateUniquesDepartamento({geocode})
    if(existentGeocode) return res.status(400).json({ error: `Error al crear el departamento. El geocode ${geocode} ya está en uso.` });

    const departamento = await Departamento.create({ 
      //Propiedades de entidad
      nombre: nombre.toUpperCase(), 
      geocode, 
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

    res.status(201).json(departamento);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear departamento: ' + error });
  }
}

//Edit
export const editDepartamento = async (req, res) => {
  try {
    const { idDepartamento, nombre, geocode } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Departamento. ' + auth.payload });

    const editorId = auth.payload.userId;

    const departamento = await privateGetDepartamentoById(idDepartamento);
    if(!departamento) return res.status(404).json({ error: 'Error al editar el departamento. Departamento no encontrado' });

    const existentGeocode = await validateUniquesDepartamento({geocode, id: idDepartamento})
    if(existentGeocode) return res.status(400).json({ error: `Error al crear el departamento. El geocode ${geocode} ya está en uso.` });

    departamento.update({
      //Propiedades de objeto
      nombre: nombre.toUpperCase(),
      geocode: geocode,
      //Propiedades de control
      version: updateVersion(departamento.version, true),
      ultimaRevision: updateVersion(departamento.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(departamento);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar departamento: ' + error });
  }
}


//Hide
export const hideDepartamento = async (req, res) => {
  const { id: idDepartamento, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Departamento. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const departamento = await privateGetDepartamentoById(idDepartamento);
  if(!departamento) return res.status(404).json({ error: 'Error al eliminar el departamento. Departamento no encontrado.' });

  if(departamento.estado !== 'Eliminado'){
    departamento.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    departamento.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(departamento);
}