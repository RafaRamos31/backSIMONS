import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import SubResultado from '../models/SubResultado.js';
import Resultado from '../models/Resultado.js';
import Actividad from '../models/Actividad.js';

//Internos para validacion de claves unicas
async function validateUniquesActividad({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Actividad.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetActividadById(idActividad){
  try {
    return Actividad.findByPk(idActividad);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedActividades = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Actividades. ' + auth.payload });

    const actividades = (await Actividad.findAndCountAll({
      limit: Number(pageSize),
      offset: Number(page) * Number(pageSize),
      where: getFilter({filterParams: JSON.parse(filter), reviews: JSON.parse(reviews), deleteds: JSON.parse(deleteds)}),
      order: getSorting({sort: JSON.parse(sort), defaultSort: ['nombre', 'ASC'], reviews: JSON.parse(reviews)}),
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
          model: Resultado,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'resultado'
        },
        {
          model: SubResultado,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'subresultado'
        },
      ]
    }));
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos las actividades: ' + error });
  }
}

//Get list
export const getActividadesList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener actividades. ' + auth.payload });

    const actividades = await Actividad.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de actividades: ' + error });
  }
}

//Get by Id
export const getActividadById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Actividades. ' + auth.payload });

    const actividad = await Actividad.findByPk(id, {
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
          model: Resultado,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'resultado'
        },
        {
          model: SubResultado,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'subresultado'
        },
      ]
    });

    if (actividad) {
      res.json(actividad);
    } else {
      res.status(404).json({ error: 'Actividad no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Actividad por ID: ' + error });
  }
}


//Create
export const createActividad = async (req, res) => {
  const { nombre, descripcion, resultadoId, subresultadoId } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Actividad. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentNombre = await validateUniquesActividad({nombre})
    if(existentNombre) return res.status(400).json({ error: `Error al crear la Actividad. El código ${nombre} ya está en uso.` });

    const actividad = await Actividad.create({ 
      //Propiedades de entidad
      nombre, 
      descripcion, 
      resultadoId,
      subresultadoId,
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

    res.status(201).json(actividad);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear actividad: ' + error });
  }
}

//Edit
export const editActividad = async (req, res) => {
  try {
    const { idActividad, nombre, descripcion, resultadoId, subresultadoId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Actividad. ' + auth.payload });

    const editorId = auth.payload.userId;

    const actividad = await privateGetActividadById(idActividad);
    if(!actividad) return res.status(404).json({ error: 'Error al editar la actividad. Actividad no encontrada' });

    const existentNombre = await validateUniquesActividad({nombre, id: idActividad})
    if(existentNombre) return res.status(400).json({ error: `Error al crear la actividad. El código ${nombre} ya está en uso.` });

    actividad.update({
      //Propiedades de objeto
      nombre: nombre,
      descripcion: descripcion,
      resultadoId: resultadoId,
      subresultadoId: subresultadoId,
      //Propiedades de control
      version: updateVersion(actividad.version, true),
      ultimaRevision: updateVersion(actividad.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(actividad);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar actividad: ' + error });
  }
}


//Hide
export const hideActividad = async (req, res) => {
  const { id: idActividad, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Actividad. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const actividad = await privateGetActividadById(idActividad);
  if(!actividad) return res.status(404).json({ error: 'Error al eliminar la actividad. Actividad no encontrada.' });

  if(actividad.estado !== 'Eliminado'){
    actividad.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    actividad.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(actividad);
}