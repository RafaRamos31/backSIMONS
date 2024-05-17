import Usuario from '../models/Usuario.js';
import TipoOrganizacion from '../models/TipoOrganizacion.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import { getPermisosRol } from './permisosRolesController.js';
import Sector from '../models/Sector.js';

//Get internal
export async function privateGetTipoOrganizacionById(idTipoOrganizacion){
  try {
    return TipoOrganizacion.findByPk(idTipoOrganizacion);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedTiposOrganizacion = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Tipos de Organización. ' + auth.payload });

    const tiposOrganizacion = (await TipoOrganizacion.findAndCountAll({
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
          model: Sector,
          attributes: ['id', 'nombre'],
          as: 'sector'
        }
      ]
    }));
    res.json(tiposOrganizacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los tipos de organización: ' + error });
  }
}

//Get list
export const getTiposOrganizacionesList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Tipos de Organizaciones. ' + auth.payload });

    const tiposOrganizaciones = await TipoOrganizacion.findAll({
      attributes: ['id', 'nombre'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(tiposOrganizaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de tipos de organizaciones: ' + error });
  }
}

//Get by Id
export const getTipoOrganizacionById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Tipo de Organización. ' + auth.payload });

    const tipoOrganizacion = await TipoOrganizacion.findByPk(id, {
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
          model: Sector,
          attributes: ['id', 'nombre'],
          as: 'sector'
        },
      ]
    });

    if (tipoOrganizacion) {
      res.json(tipoOrganizacion);
    } else {
      res.status(404).json({ error: 'Tipo de Organización no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Tipo de Organización por ID: ' + error });
  }
}

//Create
export const createTipoOrganizacion = async (req, res) => {
  const { nombre, sectorId } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Tipo de Organización. ' + auth.payload });

    const editorId = auth.payload.userId;

    const tipoOrganizacion = await TipoOrganizacion.create({ 
      //Propiedades de entidad
      nombre, 
      sectorId, 
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

    res.status(201).json(tipoOrganizacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tipo de organización: ' + error });
  }
}

//Edit
export const editTipoOrganizacion = async (req, res) => {
  try {
    const { idTipoOrganizacion, nombre, sectorId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Tipo de Organización. ' + auth.payload });

    const editorId = auth.payload.userId;

    const tipoOrganizacion = await privateGetTipoOrganizacionById(idTipoOrganizacion);
    if(!tipoOrganizacion) return res.status(404).json({ error: 'Error al editar el Tipo de Organización. Tipo de Organización no encontrado' });

    tipoOrganizacion.update({
      //Propiedades de objeto
      nombre: nombre,
      sectorId: sectorId,
      //Propiedades de control
      version: updateVersion(tipoOrganizacion.version, true),
      ultimaRevision: updateVersion(tipoOrganizacion.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(tipoOrganizacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar tipo de organización: ' + error });
  }
}


//Hide
export const hideTipoOrganizacion = async (req, res) => {
  const { id: idTipoOrganizacion, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Tipo de Organización. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const tipoOrganizacion = await privateGetTipoOrganizacionById(idTipoOrganizacion);
  if(!tipoOrganizacion) return res.status(404).json({ error: 'Error al eliminar el tipo de organización. Tipo de organización no encontrado.' });

  if(tipoOrganizacion.estado !== 'Eliminado'){
    tipoOrganizacion.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    tipoOrganizacion.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(tipoOrganizacion);
}