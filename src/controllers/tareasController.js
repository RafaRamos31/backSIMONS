import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import SubResultado from '../models/SubResultado.js';
import Resultado from '../models/Resultado.js';
import Actividad from '../models/Actividad.js';
import SubActividad from '../models/SubActividad.js';
import { deleteComponentesSubActividad, getComponentesSubActividad, uploadComponentesSubActividad } from './componentesSubActividadController.js';
import ComponenteSubActividad from '../models/ComponentesSubActividad.js';
import Tarea from '../models/Tarea.js';
import Componente from '../models/Componente.js';
import Year from '../models/Year.js';
import Quarter from '../models/Quarter.js';
import TipoEvento from '../models/TipoEvento.js';
import { privateGetSubActividadById } from './subactividadesController.js';
import { privateGetActividadById } from './actividadesController.js';
import { privateGetSubResultadoById } from './subresultadosController.js';
import { privateGetResultadoById } from './resultadosController.js';

//Internos para validacion de claves unicas
async function validateUniquesTarea({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Tarea.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetTareaById(idTarea){
  try {
    return Tarea.findByPk(idTarea);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedTareas = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', componenteId, reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Tareas. ' + auth.payload });

    const tareas = (await Tarea.findAndCountAll({
      limit: Number(pageSize),
      offset: Number(page) * Number(pageSize),
      where: getFilter({filterParams: JSON.parse(filter), componenteId, reviews: JSON.parse(reviews), deleteds: JSON.parse(deleteds)}),
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
        {
          model: Actividad,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'actividad'
        },
        {
          model: SubActividad,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'subactividad'
        },
        {
          model: Componente,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'componente'
        },
        {
          model: Year,
          attributes: ['id', 'nombre'],
          as: 'year'
        },
        {
          model: Quarter,
          attributes: ['id', 'nombre'],
          as: 'quarter'
        },
        {
          model: TipoEvento,
          attributes: ['id', 'nombre'],
          as: 'tipoEvento'
        },
      ]
    }));

    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las tareas: ' + error });
  }
}

//Get list
export const getTareasList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener tareas. ' + auth.payload });

    const tareas = await Tarea.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)}),
      include: [
        {
          model: Quarter,
          attributes: ['id', 'nombre', 'fechaInicio', 'fechaFinal'],
          as: 'quarter'
        },
      ]
    });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de tareas: ' + error });
  }
}

//Get by Id
export const getTareaById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Tarea. ' + auth.payload });

    const tarea = await Tarea.findByPk(id, {
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
        {
          model: Actividad,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'actividad'
        },
        {
          model: SubActividad,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'subactividad'
        },
        {
          model: Componente,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'componente'
        },
        {
          model: Year,
          attributes: ['id', 'nombre'],
          as: 'year'
        },
        {
          model: Quarter,
          attributes: ['id', 'nombre'],
          as: 'quarter'
        },
        {
          model: TipoEvento,
          attributes: ['id', 'nombre'],
          as: 'tipoEvento'
        },
      ]
    });

    if (tarea) {
      res.json(tarea);
    } else {
      res.status(404).json({ error: 'Tarea no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Tarea por ID: ' + error });
  }
}


//Create
export const createTarea = async (req, res) => {
  const { componenteId, subactividadId, nombre, titulo, descripcion, yearId, quarterId, lugar, tipoEventoId, gastosEstimados, 
    eventosEstimados, aprobar } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Tarea. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentNombre = await validateUniquesTarea({nombre})
    if(existentNombre) return res.status(400).json({ error: `Error al crear Tarea. El código ${nombre} ya está en uso.` });

    const subactividad = await privateGetSubActividadById(subactividadId)
    const actividad = await privateGetActividadById(subactividad.dataValues.actividadId)
    const subresultado = await privateGetSubResultadoById(actividad.dataValues.subresultadoId)
    const resultado = await privateGetResultadoById(subresultado.dataValues.resultadoId)

    const baseTarea = await Tarea.create({ 
      //Propiedades de entidad
      nombre,
      titulo,
      descripcion,
      componenteId,
      subactividadId: subactividadId,
      actividadId: actividad.id,
      subresultadoId: subresultado.id,
      resultadoId: resultado.id,
      yearId,
      quarterId,
      lugar,
      tipoEventoId,
      gastosEstimados,
      eventosEstimados,
      //Propiedades de control
      version: '0.1',
      ultimaRevision: '0.1',
      estado: 'En revisión',
      editorId,
      fechaEdicion: new Date(),
      revisorId: null,
      fechaRevision: null,
      eliminadorId: null,
      fechaEliminacion: null,
      observaciones: null,
    });

    if(JSON.parse(aprobar)){
      Tarea.create({ 
        //Propiedades de entidad
        nombre,
        titulo,
        descripcion,
        componenteId,
        subactividadId: subactividadId,
        actividadId: actividad.id,
        subresultadoId: subresultado.id,
        resultadoId: resultado.id,
        yearId,
        quarterId,
        lugar,
        tipoEventoId,
        gastosEstimados,
        eventosEstimados,
        //Propiedades de control
        version: '1.0',
        ultimaRevision: '1.0',
        estado: 'Publicado',
        editorId,
        fechaEdicion: new Date(),
        revisorId: editorId,
        fechaRevision: new Date(),
        eliminadorId: null,
        fechaEliminacion: null,
        observaciones: null,
      });

      baseTarea.update({
        estado: 'Validado',
        revisorId: editorId,
        fechaRevision: new Date(),
      })
    }

    res.status(201).json(baseTarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tarea: ' + error });
  }
}

//Edit
export const editTarea = async (req, res) => {
  try {
    const { idTarea, componenteId, subactividadId, nombre, titulo, descripcion, yearId, quarterId, lugar, tipoEventoId, gastosEstimados, 
      eventosEstimados, aprobar } = req.body;

    const aprobarValue = JSON.parse(aprobar);

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Tarea. ' + auth.payload });

    const editorId = auth.payload.userId;

    const tarea = await privateGetTareaById(idTarea);
    if(!tarea) return res.status(404).json({ error: 'Error al editar la Tarea. Tarea no encontrada' });

    const existentNombre = await validateUniquesTarea({nombre, id: idTarea})
    if(existentNombre) return res.status(400).json({ error: `Error al crear la Tarea. El código ${nombre} ya está en uso.` });

    const subactividad = await privateGetSubActividadById(subactividadId)
    const actividad = await privateGetActividadById(subactividad.dataValues.actividadId)
    const subresultado = await privateGetSubResultadoById(actividad.dataValues.subresultadoId)
    const resultado = await privateGetResultadoById(subresultado.dataValues.resultadoId)

    tarea.update({
      //Propiedades de objeto
      nombre,
      titulo,
      descripcion,
      componenteId,
      subactividadId: subactividadId,
      actividadId: actividad.id,
      subresultadoId: subresultado.id,
      resultadoId: resultado.id,
      yearId,
      quarterId,
      lugar,
      tipoEventoId,
      gastosEstimados,
      eventosEstimados,
      //Propiedades de control
      estado: aprobarValue ? 'Validado' : 'En revisión',
      version: updateVersion(tarea.version),
      ultimaRevision: updateVersion(tarea.version),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: aprobarValue ? new Date() : null,
      revisorId: aprobarValue ? editorId : null,
      observaciones: null
    })

    res.status(201).json(tarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar Tarea: ' + error });
  }
}


//Review
export const reviewTarea = async (req, res) => {

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al revisar Tarea. ' + auth.payload });

  const revisorId = auth.payload.userId;

  const { id: idTarea, aprobado, observaciones=null } = req.body;

  const updateRev = await privateGetTareaById(idTarea);
  if(updateRev===null) return res.status(404).json({ error: 'Error al revisar la Tarea. Tarea no encontrada.' });

  const original = await privateGetTareaById(updateRev.originalId);
  if(!original && updateRev.version.split('.')[0] !== '0') return res.status(404).json({ error: 'Error al revisar la Tarea. Tarea no encontrada.' });

  if(JSON.parse(aprobado)){
    //Actualizar objeto de actualizacion
    //Propiedades de control 
    updateRev.update({
      estado: 'Validado',
      revisorId,
      fechaRevision: new Date(),
      observaciones: observaciones
    })

    if(original){
      //Actualizar objeto publico
      original.update({
        //Propiedades de objeto
        nombre: updateRev.nombre,
        titulo: updateRev.titulo,
        descripcion: updateRev.descripcion,
        componenteId: updateRev.componenteId,
        subactividadId: updateRev.subactividadId,
        actividadId: updateRev.actividadId,
        subresultadoId: updateRev.subresultadoId,
        resultadoId: updateRev.resultadoId,
        yearId: updateRev.yearId,
        quarterId: updateRev.quarterId,
        lugar: updateRev.lugar,
        tipoEventoId: updateRev.tipoEventoId,
        gastosEstimados: updateRev.gastosEstimados,
        eventosEstimados: updateRev.eventosEstimados,
        //Propiedades de control
        version: updateVersion(original.version, true),
        ultimaRevision: updateVersion(original.version, true),
        fechaEdicion: updateRev.fechaEdicion,
        revisorId,
        fechaRevision: new Date(),
        observaciones: null
      })
    }
    else{
      const tarea = await Tarea.create({
        //Propiedades de objeto
        nombre: updateRev.nombre,
        titulo: updateRev.titulo,
        descripcion: updateRev.descripcion,
        componenteId: updateRev.componenteId,
        subactividadId: updateRev.subactividadId,
        actividadId: updateRev.actividadId,
        subresultadoId: updateRev.subresultadoId,
        resultadoId: updateRev.resultadoId,
        yearId: updateRev.yearId,
        quarterId: updateRev.quarterId,
        lugar: updateRev.lugar,
        tipoEventoId: updateRev.tipoEventoId,
        gastosEstimados: updateRev.gastosEstimados,
        eventosEstimados: updateRev.eventosEstimados,
        //Propiedades de control
        version: '1.0',
        ultimaRevision: '1.0',
        estado: 'Publicado',
        editorId: updateRev.editorId,
        fechaEdicion: updateRev.fechaEdicion,
        revisorId,
        fechaRevision: new Date(),
        eliminadorId: null,
        fechaEliminacion: null,
        observaciones: null,
      })
    }
  }
  else{
    //Actualizar objeto de actualizacion
    updateRev.update({
      //Propiedades de control 
      estado: 'Rechazado',
      revisorId,
      fechaRevision: new Date(),
      observaciones: observaciones
    })
  }

  res.json(updateRev);
}


//Hide
export const hideTarea = async (req, res) => {
  const { id: idTarea, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Tarea. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const tarea = await privateGetTareaById(idTarea);
  if(!tarea) return res.status(404).json({ error: 'Error al eliminar la Tarea. Tarea no encontrada.' });

  if(tarea.estado !== 'Eliminado'){
    tarea.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    tarea.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(tarea);
}