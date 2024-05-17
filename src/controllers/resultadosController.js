import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Resultado from '../models/Resultado.js';

//Internos para validacion de claves unicas
async function validateUniquesResultados({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Resultado.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetResultadoById(idResultado){
  try {
    return Resultado.findByPk(idResultado);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedResultados = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Resultados. ' + auth.payload });

    const resultados = (await Resultado.findAndCountAll({
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
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los resultados: ' + error });
  }
}

//Get list
export const getResultadosList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Resultados. ' + auth.payload });

    const resultados = await Resultado.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de resultados: ' + error });
  }
}

//Get by Id
export const getResultadoById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Resultado. ' + auth.payload });

    const resultado = await Resultado.findByPk(id, {
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

    if (resultado) {
      res.json(resultado);
    } else {
      res.status(404).json({ error: 'Resultado no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resultado por ID: ' + error });
  }
}

//Create
export const createResultado = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Resultado. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentNombre = await validateUniquesResultados({nombre})
    if(existentNombre) return res.status(400).json({ error: `Error al crear el resultado. El código ${nombre} ya está en uso.` });

    const resultado = await Resultado.create({ 
      //Propiedades de entidad
      nombre, 
      descripcion, 
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

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear resultado: ' + error });
  }
}

//Edit
export const editResultado = async (req, res) => {
  try {
    const { idResultado, nombre, descripcion } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Resultado. ' + auth.payload });

    const editorId = auth.payload.userId;

    const resultado = await privateGetResultadoById(idResultado);
    if(!resultado) return res.status(404).json({ error: 'Error al editar el resultado. Resultado no encontrado' });

    const existentNombre = await validateUniquesResultados({nombre, id: idResultado})
    if(existentNombre) return res.status(400).json({ error: `Error al editar el resultado. El código ${nombre} ya está en uso.` });

    resultado.update({
      //Propiedades de objeto
      nombre: nombre,
      descripcion: descripcion,
      //Propiedades de control
      version: updateVersion(resultado.version, true),
      ultimaRevision: updateVersion(resultado.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar resultado: ' + error });
  }
}


//Hide
export const hideResultado = async (req, res) => {
  const { id: idResultado, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Resultado. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const resultado = await privateGetResultadoById(idResultado);
  if(!resultado) return res.status(404).json({ error: 'Error al eliminar el resultado. Resultado no encontrado.' });

  if(resultado.estado !== 'Eliminado'){
    resultado.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    resultado.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(resultado);
}