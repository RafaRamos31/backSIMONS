import Usuario from '../models/Usuario.js';
import Sector from '../models/Sector.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import { getPermisosRol } from './permisosRolesController.js';


//Get internal
export async function privateGetSectorById(idSector){
  try {
    return Sector.findByPk(idSector);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedSectores = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Sectores. ' + auth.payload });

    const sectores = (await Sector.findAndCountAll({
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
    res.json(sectores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los sectores: ' + error });
  }
}

//Get list
export const getSectoresList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Sectores. ' + auth.payload });

    const sectores = await Sector.findAll({
      attributes: ['id', 'nombre'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(sectores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de sectores: ' + error });
  }
}

//Get by Id
export const getSectorById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Sector. ' + auth.payload });

    const sector = await Sector.findByPk(id, {
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

    if (sector) {
      res.json(sector);
    } else {
      res.status(404).json({ error: 'Sector no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sector por ID: ' + error });
  }
}

//Create
export const createSector = async (req, res) => {
  const { nombre } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Sector. ' + auth.payload });

    const editorId = auth.payload.userId;

    const sector = await Sector.create({ 
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

    res.status(201).json(sector);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear sector: ' + error });
  }
}

//Edit
export const editSector = async (req, res) => {
  try {
    const { idSector, nombre } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Sector. ' + auth.payload });

    const editorId = auth.payload.userId;

    const sector = await privateGetSectorById(idSector);
    if(!sector) return res.status(404).json({ error: 'Error al editar el sector. Sector no encontrado' });

    sector.update({
      //Propiedades de objeto
      nombre: nombre,
      //Propiedades de control
      version: updateVersion(sector.version, true),
      ultimaRevision: updateVersion(sector.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(sector);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar sector: ' + error });
  }
}


//Hide
export const hideSector = async (req, res) => {
  const { id: idSector, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Sector. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const sector = await privateGetSectorById(idSector);
  if(!sector) return res.status(404).json({ error: 'Error al eliminar el sector. Sector no encontrado.' });

  if(sector.estado !== 'Eliminado'){
    sector.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    sector.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(sector);
}