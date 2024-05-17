import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import TipoEvento from '../models/TipoEvento.js';


//Get internal
export async function privateGetTipoEventoById(idTipoEvento){
  try {
    return TipoEvento.findByPk(idTipoEvento);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedTiposEventos = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Tipos de Evento. ' + auth.payload });

    const tiposEventos = (await TipoEvento.findAndCountAll({
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
        }
      ]
    }));
    res.json(tiposEventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los tipos de evento: ' + error });
  }
}

//Get list
export const getTiposEventosList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Tipos de eventos. ' + auth.payload });

    const tiposEventos = await TipoEvento.findAll({
      attributes: ['id', 'nombre'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(tiposEventos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de Tipos de eventos: ' + error });
  }
}

//Get by Id
export const getTipoEventoById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Tipo de evento. ' + auth.payload });

    const tipoEvento = await TipoEvento.findByPk(id, {
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

    if (tipoEvento) {
      res.json(tipoEvento);
    } else {
      res.status(404).json({ error: 'Tipo de evento no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipo de evento por ID: ' + error });
  }
}

//Create
export const createTipoEvento = async (req, res) => {
  const { nombre } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Tipo de evento. ' + auth.payload });

    const editorId = auth.payload.userId;

    const tipoEvento = await TipoEvento.create({ 
      //Propiedades de entidad
      nombre,
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

    res.status(201).json(tipoEvento);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear Tipo de Evento: ' + error });
  }
}

//Edit
export const editTipoEvento = async (req, res) => {
  try {
    const { idTipoEvento, nombre } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Tipo de Evento. ' + auth.payload });

    const editorId = auth.payload.userId;

    const tipoEvento = await privateGetTipoEventoById(idTipoEvento);
    if(!tipoEvento) return res.status(404).json({ error: 'Error al editar el tipo de evento. Tipo de Evento no encontrado' });

    tipoEvento.update({
      //Propiedades de objeto
      nombre: nombre,
      //Propiedades de control
      version: updateVersion(tipoEvento.version, true),
      ultimaRevision: updateVersion(tipoEvento.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(tipoEvento);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar tipo de evento: ' + error });
  }
}


//Hide
export const hideTipoEvento = async (req, res) => {
  const { id: idTipoEvento, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Tipo de Evento. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const tipoEvento = await privateGetTipoEventoById(idTipoEvento);
  if(!tipoEvento) return res.status(404).json({ error: 'Error al eliminar el tipo de evento. Tipo de Evento no encontrado.' });

  if(tipoEvento.estado !== 'Eliminado'){
    tipoEvento.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    tipoEvento.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(tipoEvento);
}