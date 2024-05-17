import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Resultado from '../models/Resultado.js';
import AreaTematica from '../models/AreaTematica.js';
import { deleteIndicadoresAreaTematica, getIndicadoresAreaTematica, uploadIndicadoresAreaTematica } from './indicadoresAreaTematicaController.js';

//Internos para validacion de claves unicas
async function validateUniquesAreasTematicas({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return AreaTematica.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetAreaTematicaById(idAreaTematica){
  try {
    return AreaTematica.findByPk(idAreaTematica);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedAreasTematicas = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Áreas Temáticas. ' + auth.payload });

    const areas = (await AreaTematica.findAndCountAll({
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

    const count = areas.count
    const rows = await populateArrays(areas.rows)

    res.json({count, rows});
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las áreas temáticas: ' + error });
  }
}

const populateArrays = async (areas) => {
  const areasArray = [];
  for(let area of areas){
    const indicadores = await getIndicadoresAreaTematica(area.dataValues.id)
    //const areasTematicas = await getComponentesSubActividad(subactividad.dataValues.id)
    areasArray.push({
      ...area.dataValues,
      indicadores: indicadores,
      //areasTematicas: areasTematicas
    })
  }
  return areasArray;
}


//Get list
export const getAreasTematicasList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Áreas Temáticas. ' + auth.payload });

    const areas = await AreaTematica.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de áreas temáticas: ' + error });
  }
}

//Get by Id
export const getAreaTematicaById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener área temática. ' + auth.payload });

    const areaTematica = await AreaTematica.findByPk(id, {
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

    if (areaTematica) {
      const indicadores = await getIndicadoresAreaTematica(id )
      res.json({...areaTematica.dataValues, indicadores});
    } else {
      res.status(404).json({ error: 'Área Temática no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener área temática por ID: ' + error });
  }
}

//Create
export const createAreaTematica = async (req, res) => {
  const { nombre, descripcion, indicadores } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Área Temática. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentNombre = await validateUniquesAreasTematicas({nombre})
    if(existentNombre) return res.status(400).json({ error: `Error al crear Área Temática. El código ${nombre} ya está en uso.` });

    const area = await AreaTematica.create({ 
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

    uploadIndicadoresAreaTematica(area.id, indicadores)

    res.status(201).json(area);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear Área Temática: ' + error });
  }
}

//Edit
export const editAreaTematica = async (req, res) => {
  try {
    const { idAreaTematica, nombre, descripcion, indicadores } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Área Temática. ' + auth.payload });

    const editorId = auth.payload.userId;

    const area = await privateGetAreaTematicaById(idAreaTematica);
    if(!area) return res.status(404).json({ error: 'Error al editar el Área Temática. Área Temática no encontrada' });

    const existentNombre = await validateUniquesAreasTematicas({nombre, id: idAreaTematica})
    if(existentNombre) return res.status(400).json({ error: `Error al editar el Área Temática. El código ${nombre} ya está en uso.` });

    area.update({
      //Propiedades de objeto
      nombre: nombre,
      descripcion: descripcion,
      //Propiedades de control
      version: updateVersion(area.version, true),
      ultimaRevision: updateVersion(area.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    //Se eliminan los indicadores anteriores
    await deleteIndicadoresAreaTematica(area.id);

    //Se agregan los indicadores a la tabla de indicadores de area tematica
    uploadIndicadoresAreaTematica(area.id, indicadores)

    res.status(201).json(area);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar Área Temática: ' + error });
  }
}


//Hide
export const hideAreaTematica = async (req, res) => {
  const { id: idAreaTematica, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Área Temática. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const area = await privateGetAreaTematicaById(idAreaTematica);
  if(!area) return res.status(404).json({ error: 'Error al eliminar Área Temática. Área Temática no encontrado.' });

  if(area.estado !== 'Eliminado'){
    area.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    area.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(area);
}