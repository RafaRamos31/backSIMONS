import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import SubResultado from '../models/SubResultado.js';
import Resultado from '../models/Resultado.js';

//Internos para validacion de claves unicas
async function validateUniquesSubResultado({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return SubResultado.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetSubResultadoById(idSubresultado){
  try {
    return SubResultado.findByPk(idSubresultado);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedSubResultados = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener SubResultados. ' + auth.payload });

    const subresultados = (await SubResultado.findAndCountAll({
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
      ]
    }));
    res.json(subresultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los subresultados: ' + error });
  }
}

//Get list
export const getSubResultadosList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener subresultados. ' + auth.payload });

    const subresultados = await SubResultado.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(subresultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de subresultados: ' + error });
  }
}

//Get by Id
export const getSubResultadoById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener SubResultado. ' + auth.payload });

    const subresultado = await SubResultado.findByPk(id, {
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
      ]
    });

    if (subresultado) {
      res.json(subresultado);
    } else {
      res.status(404).json({ error: 'SubResultado no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subresultado por ID: ' + error });
  }
}


//Create
export const createSubResultado = async (req, res) => {
  const { nombre, descripcion, resultadoId } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear SubResultado. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentNombre = await validateUniquesSubResultado({nombre})
    if(existentNombre) return res.status(400).json({ error: `Error al crear el subresultado. El código ${nombre} ya está en uso.` });

    const subresultado = await SubResultado.create({ 
      //Propiedades de entidad
      nombre, 
      descripcion, 
      resultadoId,
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

    res.status(201).json(subresultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear subresultado: ' + error });
  }
}

//Edit
export const editSubResultado = async (req, res) => {
  try {
    const { idSubresultado, nombre, descripcion, resultadoId } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar SubResultado. ' + auth.payload });

    const editorId = auth.payload.userId;

    const subresultado = await privateGetSubResultadoById(idSubresultado);
    if(!subresultado) return res.status(404).json({ error: 'Error al editar el subresultado. Subresultado no encontrado' });

    const existentNombre = await validateUniquesSubResultado({nombre, id: idSubresultado})
    if(existentNombre) return res.status(400).json({ error: `Error al crear el subresultado. El código ${nombre} ya está en uso.` });

    subresultado.update({
      //Propiedades de objeto
      nombre: nombre,
      descripcion: descripcion,
      resultadoId: resultadoId,
      //Propiedades de control
      version: updateVersion(subresultado.version, true),
      ultimaRevision: updateVersion(subresultado.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(subresultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar subresultado: ' + error });
  }
}


//Hide
export const hideSubResultado = async (req, res) => {
  const { id: idSubresultado, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar SubResultado. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const subresultado = await privateGetSubResultadoById(idSubresultado);
  if(!subresultado) return res.status(404).json({ error: 'Error al eliminar el subresultado. SubResultado no encontrado.' });

  if(subresultado.estado !== 'Eliminado'){
    subresultado.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    subresultado.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(subresultado);
}