import Usuario from '../models/Usuario.js';
import TipoOrganizacion from '../models/TipoOrganizacion.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import { getPermisosRol } from './permisosRolesController.js';
import Sector from '../models/Sector.js';
import Cargo from '../models/Cargo.js';

//Get internal
export async function privateGetCargoById(idCargo){
  try {
    return Cargo.findByPk(idCargo);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedCargos = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Cargos. ' + auth.payload });

    const cargos = (await Cargo.findAndCountAll({
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
    res.json(cargos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los cargos: ' + error });
  }
}

//Get list
export const getCargosList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Cargos. ' + auth.payload });

    const cargos = await Cargo.findAll({
      attributes: ['id', 'nombre'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(cargos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de cargos: ' + error });
  }
}

//Get by Id
export const getCargoById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Cargo. ' + auth.payload });

    const cargo = await Cargo.findByPk(id, {
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

    if (cargo) {
      res.json(cargo);
    } else {
      res.status(404).json({ error: 'Cargo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Cargo por ID: ' + error });
  }
}

//Create
export const createCargo = async (req, res) => {
  const { nombre, sectorId } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Cargo. ' + auth.payload });

    const editorId = auth.payload.userId;

    const cargo = await Cargo.create({ 
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

    res.status(201).json(cargo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear Cargo: ' + error });
  }
}

//Edit
export const editCargo = async (req, res) => {
  try {
    const { idCargo, nombre, sectorId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Cargo. ' + auth.payload });

    const editorId = auth.payload.userId;

    const cargo = await privateGetCargoById(idCargo);
    if(!cargo) return res.status(404).json({ error: 'Error al editar el Cargo. Cargo no encontrado' });

    cargo.update({
      //Propiedades de objeto
      nombre: nombre,
      sectorId: sectorId,
      //Propiedades de control
      version: updateVersion(cargo.version, true),
      ultimaRevision: updateVersion(cargo.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(cargo);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar cargo: ' + error });
  }
}


//Hide
export const hideCargo = async (req, res) => {
  const { id: idCargo, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Cargo. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const cargo = await privateGetCargoById(idCargo);
  if(!cargo) return res.status(404).json({ error: 'Error al eliminar el cargo. Cargo no encontrado.' });

  if(cargo.estado !== 'Eliminado'){
    cargo.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    cargo.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(cargo);
}