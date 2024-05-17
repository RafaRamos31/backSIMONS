import { Op } from 'sequelize';
import Departamento from '../models/Departamento.js'
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import { getPermisosRol } from './permisosRolesController.js';
import Municipio from '../models/Municipio.js';

//Internos para validacion de claves unicas
async function validateUniquesMunicipio({id=null, geocode = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Municipio.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetMunicipioById(idMunicipio){
  try {
    return Municipio.findByPk(idMunicipio);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedMunicipios = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Municipios. ' + auth.payload });

    const municipios = (await Municipio.findAndCountAll({
      limit: Number(pageSize),
      offset: Number(page) * Number(pageSize),
      where: getFilter({filterParams: JSON.parse(filter), reviews: JSON.parse(reviews), deleteds: JSON.parse(deleteds)}),
      order: getSorting({sort: JSON.parse(sort), defaultSort: ['geocode', 'ASC'], reviews: JSON.parse(reviews)}),
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'editor',
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
      ]
    }));
    res.json(municipios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los municipios: ' + error });
  }
}

//Get list
export const getMunicipiosList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Municipios. ' + auth.payload });

    const municipios = await Municipio.findAll({
      attributes: ['id', 'nombre', 'geocode'],
      order: getSorting({defaultSort: ['geocode', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(municipios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de municipios: ' + error });
  }
}

//Get by Id
export const getMunicipioById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Municipio. ' + auth.payload });

    const municipio = await Municipio.findByPk(id, {
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
      ]
    });

    if (municipio) {
      res.json(municipio);
    } else {
      res.status(404).json({ error: 'Municipio no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener municipio por ID: ' + error });
  }
}


//Create
export const createMunicipio = async (req, res) => {
  const { nombre, geocode, departamentoId } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Municipio. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentGeocode = await validateUniquesMunicipio({geocode})
    if(existentGeocode) return res.status(400).json({ error: `Error al crear el municipio. El geocode ${geocode} ya está en uso.` });

    const municipio = await Municipio.create({ 
      //Propiedades de entidad
      nombre: nombre.toUpperCase(), 
      geocode, 
      departamentoId,
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

    res.status(201).json(municipio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear municipio: ' + error });
  }
}

//Edit
export const editMunicipio = async (req, res) => {
  try {
    const { idMunicipio, nombre, geocode, departamentoId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Municipio. ' + auth.payload });

    const editorId = auth.payload.userId;

    const municipio = await privateGetMunicipioById(idMunicipio);
    if(!municipio) return res.status(404).json({ error: 'Error al editar el municipio. Municipio no encontrado' });

    const existentGeocode = await validateUniquesMunicipio({geocode, id: idMunicipio})
    if(existentGeocode) return res.status(400).json({ error: `Error al crear el municipio. El geocode ${geocode} ya está en uso.` });

    municipio.update({
      //Propiedades de objeto
      nombre: nombre.toUpperCase(),
      geocode: geocode,
      departamentoId: departamentoId,
      //Propiedades de control
      version: updateVersion(municipio.version, true),
      ultimaRevision: updateVersion(municipio.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(municipio);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar municipio: ' + error });
  }
}


//Hide
export const hideMunicipio = async (req, res) => {
  const { id: idMunicipio, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Municipio. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const municipio = await privateGetMunicipioById(idMunicipio);
  if(!municipio) return res.status(404).json({ error: 'Error al eliminar el municipio. Municipio no encontrado.' });

  if(municipio.estado !== 'Eliminado'){
    municipio.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    municipio.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(municipio);
}