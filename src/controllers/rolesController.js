import { Op } from 'sequelize';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import Rol from '../models/Rol.js';
import { getPermisosRol, uploadPermisos } from './permisosRolesController.js';
import { decodeToken } from '../utils/jwtDecoder.js';


//Get internal
export async function privateGetRolById(idRol){
  try {
    return Rol.findByPk(idRol);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedRoles = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Roles. ' + auth.payload });

    const roles = (await Rol.findAndCountAll({
      limit: Number(pageSize),
      offset: Number(page) * Number(pageSize),
      where: getFilter({filterParams: JSON.parse(filter), reviews: JSON.parse(reviews), deleteds: JSON.parse(deleteds)}),
      order: getSorting({sort: JSON.parse(sort), defaultSort: ['nombre', 'ASC'], reviews: JSON.parse(reviews)}),
    }));
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los componentes: ' + error });
  }
}

//Get list
export const getRolesList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener lista de Roles. ' + auth.payload });

    const roles = await Rol.findAll({
      attributes: ['id', 'nombre'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de roles: ' + error });
  }
}

//Get by Id
export const getRolById = async (req, res) => {
  const { id } = req.params;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Rol. ' + auth.payload });

    const rol = await Rol.findByPk(id);

    const permisos = await getPermisosRol(id)

    if (rol) {
      res.json({...rol.dataValues, permisos});
    } else {
      res.status(404).json({ error: 'Rol no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Rol por ID: ' + error });
  }
}

//Create
export const createRol = async (req, res) => {
  const { nombre, permisos } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Rol. ' + auth.payload });

    const rol = await Rol.create({ 
      //Propiedades de entidad
      nombre,
      //Propiedades de control
      version: '1.0',
      ultimaRevision: '1.0',
      estado: 'Publicado',
      fechaEdicion: new Date(),
      fechaRevision: new Date(),
      fechaEliminacion: null,
      observaciones: null,
    });

    //Se agregan los permisos a la tabla de permisos de rol
    uploadPermisos(rol.id, permisos)

    res.status(201).json(rol);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear rol: ' + error });
  }
}

//Edit
export const editRol = async (req, res) => {
  const { idRol, nombre, permisos } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Rol. ' + auth.payload });

    const rol = await privateGetRolById(idRol);
    if(!rol) return res.status(404).json({ error: 'Error al editar el rol. Rol no encontrado' });

    rol.update({
      //Propiedades de objeto
      nombre,
      //Propiedades de control
      version: updateVersion(rol.version, true),
      ultimaRevision: updateVersion(rol.version, true),
      fechaEdicion: new Date(),
      fechaRevision: new Date(),
      observaciones: null
    })

    //Se agregan los permisos a la tabla de permisos de rol
    uploadPermisos(rol.id, permisos)

    res.status(201).json(rol);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar rol: ' + error });
  }
}


//Hide
export const hideRol = async (req, res) => {
  const { id: idRol, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Rol. ' + auth.payload });

  const rol = await privateGetRolById(idRol);
  if(!rol) return res.status(404).json({ error: 'Error al eliminar el rol. Rol no encontrado.' });

  if(rol.estado !== 'Eliminado'){
    rol.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      observaciones: observaciones
    })
  }
  else{
    rol.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      observaciones: null
    })
  }

  res.json(rol);
}