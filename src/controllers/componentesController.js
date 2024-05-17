import { Op } from 'sequelize';
import Componente from '../models/Componente.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';


//Get internal
export async function privateGetComponenteById(idComponente){
  try {
    return Componente.findByPk(idComponente);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedComponentes = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Componentes. ' + auth.payload });

    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const componentes = (await Componente.findAndCountAll({
      limit: Number(pageSize),
      offset: Number(page) * Number(pageSize),
      where: getFilter({filterParams: JSON.parse(filter), reviews: JSON.parse(reviews), deleteds: JSON.parse(deleteds)}),
      order: getSorting({sort: JSON.parse(sort), defaultSort: ['nombre', 'ASC'], reviews: JSON.parse(reviews)})
    }));
    res.json(componentes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los componentes: ' + error });
  }
}

//Get list
export const getComponentesList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener lista de Componentes. ' + auth.payload });

    const componentes = await Componente.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(componentes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de componentes: ' + error });
  }
}

//Get by Id
export const getComponenteById = async (req, res) => {
  const { id } = req.params;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Componente por Id. ' + auth.payload });

    const componente = await Componente.findByPk(id);

    if (componente) {
      res.json(componente);
    } else {
      res.status(404).json({ error: 'Componente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener componente por ID: ' + error });
  }
}

//Create
export const createComponente = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Componentes. ' + auth.payload });

    const componente = await Componente.create({ 
      //Propiedades de entidad
      nombre, 
      descripcion, 
      //Propiedades de control
      version: '1.0',
      ultimaRevision: '1.0',
      estado: 'Publicado',
      fechaEdicion: new Date(),
      fechaRevision: new Date(),
      fechaEliminacion: null,
      observaciones: null,
    });

    res.status(201).json(componente);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear componente: ' + error });
  }
}

//Edit
export const editComponente = async (req, res) => {
  const { idComponente, nombre, descripcion } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Componente. ' + auth.payload });

    const componente = await privateGetComponenteById(idComponente);
    if(!componente) return res.status(404).json({ error: 'Error al editar el componente. Componente no encontrado' });

    componente.update({
      //Propiedades de objeto
      nombre: nombre,
      descripcion: descripcion,
      //Propiedades de control
      version: updateVersion(componente.version, true),
      ultimaRevision: updateVersion(componente.version, true),
      fechaEdicion: new Date(),
      fechaRevision: new Date(),
      observaciones: null
    })

    res.status(201).json(componente);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar componente: ' + error });
  }
}


//Hide
export const hideComponente = async (req, res) => {
  const { id: idComponente, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Componente. ' + auth.payload });

  const componente = await privateGetComponenteById(idComponente);
  if(!componente) return res.status(404).json({ error: 'Error al eliminar el componente. Componente no encontrado.' });

  if(componente.estado !== 'Eliminado'){
    componente.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      observaciones: observaciones
    })
  }
  else{
    componente.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      observaciones: null
    })
  }

  res.json(componente);
}