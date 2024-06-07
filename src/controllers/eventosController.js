import Usuario from '../models/Usuario.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Tarea from '../models/Tarea.js';
import Evento from '../models/Evento.js';
import { deleteComponentesEvento, getComponentesEvento, uploadComponentesEvento } from './componentesEventoController.js';
import { deleteColaboradoresEvento, getColaboradoresEvento, getEventosByColaborador, uploadColaboradoresEvento } from './colaboradoresEventoController.js';
import moment from 'moment';
import { deleteSectoresEvento, getSectoresEvento, uploadSectoresEvento } from './sectoresEventoController.js';
import { deleteNivelesEvento, getNivelesEvento, uploadNivelesEvento } from './nivelesEventoController.js';
import { privateGetTareaById } from './tareasController.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { deleteParticipantesEvento, getParticipantesEvento, setEstadoIndicadores, uploadParticipantesEvento } from './participantesEventoController.js';
import TipoEvento from '../models/TipoEvento.js';
import Municipio from '../models/Municipio.js';
import AreaTematica from '../models/AreaTematica.js';
import { privateGetAreaTematicaById } from './areasTematicasController.js';
import Quarter from '../models/Quarter.js';
import { getIndicadoresAreaTematica } from './indicadoresAreaTematicaController.js';
import { getIndicadoresBeneficiario, uploadIndicadoresBeneficiarios } from './indicadoresBeneficiariosController.js';
import { privateGetQuarterById } from './quarterController.js';
import { privateGetYearById } from './yearsController.js';
import { sumarProgresos } from './progresosIndicadoresController.js';


//Get internal
export async function privateGetEventoById(idEvento){
  try {
    return Evento.findByPk(idEvento, {
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'organizador'
        },
        {
          model: Tarea,
          attributes: ['id', 'nombre', 'titulo'],
          as: 'tarea'
        },
        {
          model: Municipio,
          attributes: ['id', 'nombre'],
          as: 'municipio'
        },
      ]
    });
  } catch (error) {
    throw error;
  }
}

//Get paged digitar
export const getPagedEventosDigitar = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Componentes. ' + auth.payload });

    const { page, pageSize, sort='{}', filter='{}', reviews=false } = req.body;

    const eventos = (await Evento.findAndCountAll({
      limit: Number(pageSize),
      offset: Number(page) * Number(pageSize),
      where: getFilter({filterParams: JSON.parse(filter), digitar:true}),
      order: getSorting({sort: JSON.parse(sort), defaultSort: ['fechaCreacion', 'DESC'], reviews: JSON.parse(reviews)}),
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'organizador'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'responsableCreacion'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'responsableFinalizacion'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'responsableDigitacion'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'revisorDigitacion'
        },
      ]
    }));
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los eventos a digitar: ' + error });
  }
}


//Get paged digitar
export const getPagedEventosConsolidar = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Componentes. ' + auth.payload });

    const { page, pageSize, sort='{}', filter='{}', reviews=false } = req.body;

    const eventos = (await Evento.findAndCountAll({
      limit: Number(pageSize),
      offset: Number(page) * Number(pageSize),
      where: getFilter({filterParams: JSON.parse(filter), consolidar:true}),
      order: getSorting({sort: JSON.parse(sort), defaultSort: ['fechaCreacion', 'DESC'], reviews: JSON.parse(reviews)}),
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'organizador'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'responsableConsolidado'
        },
        {
          model: Quarter,
          attributes: ['id', 'nombre'],
          as: 'quarter'
        },
      ]
    }));
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los eventos a digitar: ' + error });
  }
}


//Get tablero
export const getEventosTablero = async (req, res) => {
  try {
    const { quarterId, componenteId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener eventos. ' + auth.payload });

    const eventosComponente = await Evento.findAll({
      attributes: ['id', 'tareaId', 'componenteEncargadoId', 'quarterId', 'areaTematicaId', 'departamentoId', 'municipioId', 'aldeaId', 'caserioId',
      'nombre', 'fechaInicio', 'fechaFinal', 'estadoRealizacion', 'estadoRevisionFinalizacion'],
      where: {
        quarterId: quarterId,
        componenteEncargadoId: componenteId
      },
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'organizador'
        },
        {
          model: Tarea,
          attributes: ['id', 'nombre', 'titulo'],
          as: 'tarea'
        },
        {
          model: Municipio,
          attributes: ['id', 'nombre'],
          as: 'municipio'
        },
      ]
    });

    let eventosColaboracion = [];

    if(componenteId == auth.payload.userComponente.id){
      const listColaboraciones = await getEventosByColaborador(auth.payload.userId)
      eventosColaboracion = await getEventosColaborador(listColaboraciones)
    }
    
    const eventos = eventosComponente.concat(eventosColaboracion)
    const populatedEventos = await populateArrays(eventos)

    res.json(populatedEventos);

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener eventos: ' + error });
  }
}

const getEventosColaborador = async (eventosList) => {
  const eventosArray = [];
  for(let eventColaborador of eventosList){
    const evento = await privateGetEventoById(eventColaborador.eventoId)
    eventosArray.push(evento)
  }
  return eventosArray;
}


const populateArrays = async (eventos) => {
  const eventosArray = [];
  for(let evento of eventos){
    const colaboradores = await getColaboradoresEvento(evento.dataValues.id)
    const componentes = await getComponentesEvento(evento.dataValues.id)
    eventosArray.push({
      ...evento.dataValues,
      colaboradores: colaboradores,
      componentes: componentes
    })
  }
  return eventosArray;
}


//Toggle estado tablero
export const toggleEvento = async (req, res) => {
  try {
    const { idEvento, estado } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar evento. ' + auth.payload });

    const evento = await Evento.findByPk(idEvento);

    evento.update({
      estadoRealizacion: estado
    })

    res.json(evento);

  } catch (error) {
    res.status(500).json({ error: 'Error al editar evento: ' + error });
  }
}


//Get individual finalizar
export const getEventoFinalizarById = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al revisar evento. ' + auth.payload });

    const { id } = req.params;

    const evento = (await Evento.findByPk(id,  {
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'responsableCreacion'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'responsableFinalizacion'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'revisorFinalizacion'
        },
        {
          model: TipoEvento,
          attributes: ['id', 'nombre'],
          as: 'tipoEvento'
        },
        {
          model: Tarea,
          attributes: ['id', 'nombre', 'titulo'],
          as: 'tarea'
        },
        {
          model: AreaTematica,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'areaTematica'
        }
      ]
    }));

    const sectores = await getSectoresEvento(evento.dataValues.id)
    const niveles = await getNivelesEvento(evento.dataValues.id)

    res.json({...evento.dataValues, sectores, niveles});
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evento por Id: ' + error });
  }
}

//Get individual participantes
export const getEventoParticipantesById = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al revisar evento. ' + auth.payload });

    const responsableDigitacionId = auth.payload.userId;

    const { id } = req.params;

    const evento = await Evento.findByPk(id, {
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'responsableDigitacion'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'revisorDigitacion'
        },
        {
          model: Tarea,
          attributes: ['id', 'nombre', 'titulo'],
          as: 'tarea'
        },
        {
          model: AreaTematica,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'areaTematica'
        },
        {
          model: Quarter,
          attributes: ['id', 'nombre'],
          as: 'quarter'
        }
      ]
    });

    if(evento.dataValues.estadoDigitacion === 'Pendiente'){
      await evento.update({
        estadoDigitacion: 'En Curso',
        responsableDigitacionId,
        fechaDigitacion: new Date()
      })
    }
    
    const participantes = await getParticipantesEvento(evento.dataValues.id)

    res.json({...evento.dataValues, participantes});
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evento por Id: ' + error });
  }
}


//Get individual consolidar
export const getEventoConsolidarById = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al revisar evento. ' + auth.payload });

    const { id } = req.params;

    const evento = await Evento.findByPk(id, {
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'responsableDigitacion'
        },
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'revisorDigitacion'
        },
        {
          model: Tarea,
          attributes: ['id', 'nombre', 'titulo'],
          as: 'tarea'
        },
        {
          model: AreaTematica,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'areaTematica'
        },
        {
          model: Quarter,
          attributes: ['id', 'nombre', 'yearId'],
          as: 'quarter'
        }
      ]
    });

    const participantesBase = await getParticipantesEvento(evento.dataValues.id)
    const participantes = await populateIndicadores(participantesBase);

    const indicadores = await getIndicadoresAreaTematica(evento.dataValues.areaTematicaId)

    res.json({...evento.dataValues, participantes, indicadores});
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener evento por Id: ' + error });
  }
}

const populateIndicadores = async (participantesBase) => {
  const participantesArray = [];
  for(let participante of participantesBase){
    const indicadores = await getIndicadoresBeneficiario(participante.id)

    participantesArray.push({
      ...participante,
      indicadores: indicadores
    })
  }
  return participantesArray;
}


//Create
export const createEvento = async (req, res) => {
  const { tareaId, nombre, areaTematicaId,  fechaInicio: baseFechaInicio, fechaFinal: baseFechaFinal, timezone, departamentoId, municipioId, 
    aldeaId, caserioId, organizadorId, componentes, colaboradores } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Evento. ' + auth.payload });

    const responsableCreacionId = auth.payload.userId;

    const fechaInicio = moment(baseFechaInicio).subtract(6, 'h')
    const fechaFinal = moment(baseFechaFinal).subtract(6, 'h')

    const tarea = await privateGetTareaById(tareaId)

    const evento = await Evento.create({ 
      //Propiedades de entidad
      tareaId,
      componenteEncargadoId: tarea.dataValues.componenteId,
      quarterId: tarea.dataValues.quarterId,
      nombre,
      areaTematicaId,
      fechaInicio: fechaInicio.format('YYYY-MM-DD HH:mm:ss'),
      fechaFinal: fechaFinal.format('YYYY-MM-DD HH:mm:ss'),
      departamentoId,
      municipioId,
      aldeaId,
      caserioId,
      organizadorId,
      fechaCreacion: new Date(),
      responsableCreacionId: responsableCreacionId,
      estadoRealizacion: 'Pendiente'
    });

    //Se agregan los componentes a la tabla de componentes de evento
    uploadComponentesEvento(evento.id, componentes)

    //Se agregan los colaboradores a la tabla de colaboradores de evento
    uploadColaboradoresEvento(evento.id, colaboradores)

    //Actualizar eventos realizados en tarea
    tarea.update({
      eventosRealizados: tarea.dataValues.eventosRealizados + 1
    })

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear evento: ' + error });
  }
}


//Edit
export const editEvento = async (req, res) => {
  const { idEvento, tareaId, nombre, areaTematicaId, fechaInicio: baseFechaInicio, fechaFinal: baseFechaFinal, departamentoId, municipioId, 
    aldeaId, caserioId, organizadorId, componentes, colaboradores } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Evento. ' + auth.payload });

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return res.status(404).json({ error: 'Error al editar el evento. Evento no encontrado.' });

    const responsableCreacionId = auth.payload.userId;

    const fechaInicio = moment(baseFechaInicio).subtract(6, 'h')
    const fechaFinal = moment(baseFechaFinal).subtract(6, 'h')

    const tarea = await privateGetTareaById(tareaId)

    evento.update({ 
      //Propiedades de entidad
      tareaId,
      componenteEncargadoId: tarea.dataValues.componenteId,
      quarterId: tarea.dataValues.quarterId,
      nombre,
      areaTematicaId,
      fechaInicio: fechaInicio.format('YYYY-MM-DD HH:mm:ss'),
      fechaFinal: fechaFinal.format('YYYY-MM-DD HH:mm:ss'),
      departamentoId,
      municipioId,
      aldeaId,
      caserioId,
      organizadorId,
      fechaCreacion: new Date(),
      responsableCreacionId: responsableCreacionId
    });

    //Se agregan los componentes a la tabla de componentes de evento
    await deleteComponentesEvento(evento.id);
    uploadComponentesEvento(evento.id, componentes);

    //Se agregan los colaboradores a la tabla de colaboradores de evento
    await deleteColaboradoresEvento(evento.id);
    uploadColaboradoresEvento(evento.id, colaboradores);

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar evento: ' + error });
  }
}


//Finalizar
export const finalizarEvento = async (req, res) => {
  const { idEvento, numeroFormulario, participantesHombres, participantesMujeres, participantesComunitarios, participantesInstitucionales, 
    totalDias, totalHoras, tipoEventoId, sectores, niveles, logros, compromisos, enlaceFormulario, enlaceFotografias, anotaciones } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Evento. ' + auth.payload });

    const responsableFinalizacionId = auth.payload.userId;

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return res.status(404).json({ error: 'Error al editar el evento. Evento no encontrado.' });

    evento.update({ 
      //Propiedades de entidad
      numeroFormulario,
      participantesHombres,
      participantesMujeres,
      participantesComunitarios,
      participantesInstitucionales,
      totalDias,
      totalHoras,
      tipoEventoId,
      logros,
      compromisos,
      enlaceFormulario,
      enlaceFotografias,
      anotaciones,
      fechaFinalizacionEvento: new Date(),
      responsableFinalizacionId,
      estadoRealizacion: 'Finalizado',
      estadoRevisionFinalizacion: 'Pendiente',
      estadoDigitacion: 'Pendiente'
    });

    //Se agregan los sectores a la tabla de sectores de evento
    uploadSectoresEvento(evento.id, sectores)

    //Se agregan los niveles a la tabla de niveles de evento
    uploadNivelesEvento(evento.id, niveles)

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Error al finalizar evento: ' + error });
  }
}

//EditFinalizar
export const editFinalizarEvento = async (req, res) => {
  const { idEvento, numeroFormulario, participantesHombres, participantesMujeres, participantesComunitarios, participantesInstitucionales, 
    totalDias, totalHoras, tipoEventoId, sectores, niveles, logros, compromisos, enlaceFormulario, enlaceFotografias, anotaciones } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Evento. ' + auth.payload });

    const responsableFinalizacionId = auth.payload.userId;

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return res.status(404).json({ error: 'Error al editar el evento. Evento no encontrado.' });

    evento.update({ 
      //Propiedades de entidad
      numeroFormulario,
      participantesHombres,
      participantesMujeres,
      participantesComunitarios,
      participantesInstitucionales,
      totalDias,
      totalHoras,
      tipoEventoId,
      logros,
      compromisos,
      enlaceFormulario,
      enlaceFotografias,
      anotaciones,
      fechaFinalizacionEvento: new Date(),
      responsableFinalizacionId,
      estadoRealizacion: 'Finalizado',
      estadoDigitacion: 'Pendiente',
      responsableDigitacionId: null,
      fechaDigitacion: null,
      estadoRevisionFinalizacion: 'Pendiente',
      revisorFinalizacionId: null,
      fechaRevisionFinalizacion: null,
      observacionesFinalizacion: null
    });

    //Se agregan los sectores a la tabla de sectores de evento
    await deleteSectoresEvento(evento.id);
    uploadSectoresEvento(evento.id, sectores);

    //Se agregan los niveles a la tabla de niveles de evento
    await deleteNivelesEvento(evento.id);
    uploadNivelesEvento(evento.id, niveles);

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Error al finalizar evento: ' + error });
  }
}


//Edit
export const reportarEvento = async (req, res) => {
  const { id: idEvento, observaciones } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Evento. ' + auth.payload });

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return res.status(404).json({ error: 'Error al editar el evento. Evento no encontrado.' });

    const revisorFinalizacionId = auth.payload.userId;

    evento.update({ 
      //Propiedades de entidad
      revisorFinalizacionId,
      estadoRevisionFinalizacion: 'Rechazado',
      estadoDigitacion: 'Rechazado',
      observacionesFinalizacion: observaciones,
      fechaRevisionFinalizacion: new Date(),
    });

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar evento: ' + error });
  }
}


//Participantes
export const participantesEvento = async (req, res) => {
  const { idEvento, registradosHombres, registradosMujeres, registradosComunitarios, registradosInstitucionales, participantes } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Evento. ' + auth.payload });

    const responsableDigitacionId = auth.payload.userId;

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return res.status(404).json({ error: 'Error al editar el evento. Evento no encontrado.' });

    evento.update({ 
      //Propiedades de entidad
      registradosHombres,
      registradosMujeres,
      registradosComunitarios,
      registradosInstitucionales,
      fechaDigitacion: new Date(),
      responsableDigitacionId,
      estadoDigitacion: 'Finalizado',
      revisorFinalizacionId: responsableDigitacionId,
      estadoRevisionFinalizacion: 'Validado',
      observacionesFinalizacion: null,
      fechaRevisionFinalizacion: new Date(),
      estadoRevisionDigitacion: 'Pendiente',
      observacionesFinalizacion: null,
      fechaRevisionDigitacion: null,
      revisorDigitacionId: null
    });

    //Se agregan los participantes a la tabla de participantes de evento
    await deleteParticipantesEvento(evento.id)
    uploadParticipantesEvento(evento.id, participantes)

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar participantes del evento: ' + error });
  }
}


//Participantes
export const revisarParticipantes = async (req, res) => {
  const { id: idEvento, aprobado, observaciones } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al revisar Evento. ' + auth.payload });

    const revisorDigitacionId = auth.payload.userId;

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return res.status(404).json({ error: 'Error al revisar el evento. Evento no encontrado.' });

    evento.update({ 
      //Propiedades de entidad
      revisorDigitacionId,
      estadoRevisionDigitacion: aprobado,
      fechaRevisionDigitacion: new Date(),
      observacionesDigitacion: observaciones,
      estadoConsolidado: aprobado === 'Aprobado' ? 'Pendiente' : null
    });

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Error al revisar participantes del evento: ' + error });
  }
}


//Participantes
export const consolidarEvento = async (req, res) => {
  const { idEvento, conteo, indParticipantes, presupuesto, indPresupuesto } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Evento. ' + auth.payload });

    const responsableConsolidadoId = auth.payload.userId;

    const evento = await privateGetEventoById(idEvento);
    if(!evento) return res.status(404).json({ error: 'Error al consolidar el evento. Evento no encontrado.' });

    //Set estado de indicadores
    setEstadoIndicadores(idEvento, indParticipantes)

    //Aumentar indicadores de beneficiario
    const quarter = await privateGetQuarterById(evento.dataValues.quarterId)
    uploadIndicadoresBeneficiarios(quarter.dataValues.yearId, indParticipantes)

    //Sumar progresos de indicadores
    sumarProgresos(quarter.dataValues.nombre.split('-')[0], quarter.dataValues.nombre.split('-')[1], conteo)

    //Finalizar estado de evento
    evento.update({ 
      estadoConsolidado: 'Finalizado',
      responsableConsolidadoId: responsableConsolidadoId,
      fechaConsolidado: new Date()
    });

    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Error al consolidar el evento: ' + error });
  }
}