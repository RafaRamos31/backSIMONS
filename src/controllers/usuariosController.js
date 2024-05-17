import { createHash } from 'crypto';
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { Op } from 'sequelize';
import { privateGetComponenteById } from './componentesController.js';
import { getPermisosRol } from './permisosRolesController.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Rol from '../models/Rol.js';
import Componente from '../models/Componente.js';
import { updateVersion } from '../utils/versionHelper.js';

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

//Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({
      where: {
        correo: { [Op.eq] : email},
        password: { [Op.eq] : hashPassword(password)},
        estado: { [Op.eq] : 'Publicado'},
      }
    })
    if(!usuario) return res.status(404).json({ error: 'Los datos ingresados no son válidos.' });
    
    const tokenUser = {
      userId: usuario.id,
      userName: usuario.nombre,
      userEmail: usuario.correo,
      userComponente: await privateGetComponenteById(usuario.componenteId),
      userRolId: usuario.rolId,
      userPermisos: await getPermisosRol(usuario.rolId)
    }
    const token = jwt.sign(tokenUser, process.env.JWT_SECRET, { expiresIn: '12h' });

    res.json({token});

  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al hacer el login: ' + error });
  }
}

export const verifyUser = async (req, res) => {
  try {
    const authorizationHeader = req.headers['authorization'];
    const auth = decodeToken(authorizationHeader);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Ocurrió un error al verificar el login: ' + auth.payload });

    res.json({user: auth.payload});

  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al verificar el login: ' + error });
  }
}


//Internos para validacion de claves unicas
async function validateUniquesUsuario({id=null, dni=null, correo=null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(dni){
    filter = {...filter, dni: {[Op.eq]: dni }}
  }

  if(correo){
    filter = {...filter, correo: {[Op.eq]: correo }}
  }

  return Usuario.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetUsuarioById(idUsuario){
  try {
    return Usuario.findByPk(idUsuario);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedUsuarios = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const usuarios = (await Usuario.findAndCountAll({
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
          model: Rol,
          attributes: ['id', 'nombre'],
          as: 'rol'
        },
        {
          model: Componente,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'componente'
        }
      ]
    }));
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los usuarios: ' + error });
  }
}


//Get list
export const getUsuariosListComponente = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'componenteId'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)}),
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de usuarios: ' + error });
  }
}



//Get by Id
export const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id, {
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
          model: Rol,
          attributes: ['id', 'nombre'],
          as: 'rol'
        },
        {
          model: Componente,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'componente'
        }
      ]
    });

    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario por ID: ' + error });
  }
}

//Create
export const createUsuario = async (req, res) => {
  const { nombre, dni, telefono, componenteId, correo, password, confirmPassword } = req.body;
  try {

    if(password !== confirmPassword) return res.status(400).json({ error: `Las contraseñas proporcionadas no coinciden.` });

    const existentDNI = await validateUniquesUsuario({dni})
    if(existentDNI) return res.status(400).json({ error: `Error al crear Usuario. El DNI ${dni} ya está en uso.` });

    const existentCorreo = await validateUniquesUsuario({correo})
    if(existentCorreo) return res.status(400).json({ error: `Error al crear Usuario. El correo electrónico ${correo} ya está en uso.` });

    const usuario = await Usuario.create({ 
      //Propiedades de entidad
      nombre, 
      dni,
      telefono,
      componenteId,
      correo,
      password: hashPassword(password),  
      //Propiedades de control
      originalId: null,
      version: '0.1',
      ultimaRevision: '0.1',
      estado: 'En revisión',
      fechaEdicion: new Date(),
      editorId: null,
      fechaRevision: null,
      revisorId: null,
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null,
    });

    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario: ' + error });
  }
}

//Review
export const reviewUsuario = async (req, res) => {

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al revisar Usuario. ' + auth.payload });

  const revisorId = auth.payload.userId;

  const { id: idUsuario, rolId, aprobado, observaciones=null } = req.body;

  const updateRev = await privateGetUsuarioById(idUsuario);
  if(updateRev===null) return res.status(404).json({ error: 'Error al revisar Usuario. Usuario no encontrado.' });

  const original = await privateGetUsuarioById(updateRev.originalId);
  if(!original && updateRev.version !== '0.1') return res.status(404).json({ error: 'Error al revisar Usuario. Usuario no encontrado.' });

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
        dni: updateRev.dni,
        telefono: updateRev.telefono,
        rolId: rolId,
        componenteId: updateRev.componenteId,
        correo: updateRev.correo,
        password: updateRev.password, 
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
      const usuario = await Usuario.create({
        //Propiedades de objeto
        nombre: updateRev.nombre,
        dni: updateRev.dni,
        telefono: updateRev.telefono,
        rolId: rolId,
        componenteId: updateRev.componenteId,
        correo: updateRev.correo,
        password: updateRev.password, 
        //Propiedades de control
        version: '1.0',
        ultimaRevision: '1.0',
        estado: 'Publicado',
        fechaEdicion: updateRev.fechaEdicion,
        revisorId,
        fechaRevision: new Date(),
        eliminadorId: null,
        fechaEliminacion: null,
        observaciones: null,
      })
      
      updateRev.update({
        editorId: usuario.id,
        rolId: rolId
      })

      usuario.update({
        editorId: usuario.id
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


//Edit
export const editUsuario = async (req, res) => {
  try {
    const { idUsuario, componenteId, rolId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Usuario. ' + auth.payload });

    const editorId = auth.payload.userId;

    const usuario = await privateGetUsuarioById(idUsuario);
    if(!usuario) return res.status(404).json({ error: 'Error al editar el Usuario. Usuario no encontrado' });

    usuario.update({
      //Propiedades de objeto
      componenteId: componenteId,
      rolId: rolId,
      //Propiedades de control
      version: updateVersion(usuario.version, true),
      ultimaRevision: updateVersion(usuario.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar Usuario: ' + error });
  }
}


//Hide
export const hideUsuario = async (req, res) => {
  const { id: idUsuario, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Usuario. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const usuario = await privateGetUsuarioById(idUsuario);
  if(!usuario) return res.status(404).json({ error: 'Error al eliminar el usuario. Usuario no encontrado.' });

  if(usuario.estado !== 'Eliminado'){
    usuario.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    usuario.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(usuario);
}