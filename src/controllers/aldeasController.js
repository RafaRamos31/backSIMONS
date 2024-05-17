import { Op } from 'sequelize';
import Departamento from '../models/Departamento.js'
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import { getPermisosRol } from './permisosRolesController.js';
import Municipio from '../models/Municipio.js';
import Aldea from '../models/Aldea.js';

//Internos para validacion de claves unicas
async function validateUniquesAldea({id=null, geocode = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(geocode){
    filter = {...filter, geocode: geocode}
  }

  return Aldea.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetAldeaById(idAldea){
  try {
    return Aldea.findByPk(idAldea);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedAldeas = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Aldeas. ' + auth.payload });

    const aldeas = (await Aldea.findAndCountAll({
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
      ]
    }));
    res.json(aldeas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las aldeas: ' + error });
  }
}

//Get list
export const getAldeasList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Aldeas. ' + auth.payload });

    const aldeas = await Aldea.findAll({
      attributes: ['id', 'nombre', 'geocode'],
      order: getSorting({defaultSort: ['geocode', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(aldeas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de aldeas: ' + error });
  }
}

//Get by Id
export const getAldeaById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Aldea. ' + auth.payload });

    const aldea = await Aldea.findByPk(id, {
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
      ]
    });

    if (aldea) {
      res.json(aldea);
    } else {
      res.status(404).json({ error: 'Aldea no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener aldea por ID: ' + error });
  }
}


//Create
export const createAldea = async (req, res) => {
  const { nombre, geocode, departamentoId, municipioId } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Aldea. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentGeocode = await validateUniquesAldea({geocode})
    if(existentGeocode) return res.status(400).json({ error: `Error al crear la Aldea. El geocode ${geocode} ya está en uso.` });

    const aldea = await Aldea.create({ 
      //Propiedades de entidad
      nombre: nombre.toUpperCase(), 
      geocode, 
      departamentoId,
      municipioId,
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

    res.status(201).json(aldea);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear aldea: ' + error });
  }
}

//Edit
export const editAldea = async (req, res) => {
  try {
    const { idAldea, nombre, geocode, departamentoId, municipioId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Aldea. ' + auth.payload });

    const editorId = auth.payload.userId;

    const aldea = await privateGetAldeaById(idAldea);
    if(!aldea) return res.status(404).json({ error: 'Error al editar la Aldea. Aldea no encontrada' });

    const existentGeocode = await validateUniquesAldea({geocode, id: idAldea})
    if(existentGeocode) return res.status(400).json({ error: `Error al crear la Aldea. El geocode ${geocode} ya está en uso.` });

    aldea.update({
      //Propiedades de objeto
      nombre: nombre.toUpperCase(),
      geocode: geocode,
      departamentoId: departamentoId,
      municipioId: municipioId,
      //Propiedades de control
      version: updateVersion(aldea.version, true),
      ultimaRevision: updateVersion(aldea.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(aldea);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar aldea: ' + error });
  }
}


//Hide
export const hideAldea = async (req, res) => {
  const { id: idAldea, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Aldea. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const aldea = await privateGetAldeaById(idAldea);
  if(!aldea) return res.status(404).json({ error: 'Error al eliminar la aldea. Aldea no encontrada.' });

  if(aldea.estado !== 'Eliminado'){
    aldea.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    aldea.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(aldea);
}