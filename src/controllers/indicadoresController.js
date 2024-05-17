import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Indicador from '../models/Indicador.js';
import { getProgresosIndicador, uploadMetas } from './progresosIndicadoresController.js';

//Internos para validacion de claves unicas
async function validateUniquesIndicador({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Indicador.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetIndicadorById(indicadorId){
  try {
    return Indicador.findByPk(indicadorId);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedIndicador = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Indicadores. ' + auth.payload });

    const indicadores = (await Indicador.findAndCountAll({
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

    const count = indicadores.count
    const rows = await populateArrays(indicadores.rows)

    res.json({count, rows});
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los indicadores: ' + error });
  }
}

const populateArrays = async (indicadores) => {
  const indicadoresArray = [];
  for(let indicador of indicadores){
    const progresos = await getProgresosIndicador(indicador.dataValues.id)
    //const areasTematicas = await getComponentesSubActividad(subactividad.dataValues.id)
    indicadoresArray.push({
      ...indicador.dataValues,
      ...progresos
      //areasTematicas: areasTematicas
    })
  }
  return indicadoresArray;
}


//Get list
export const getIndicadoresList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Indicadores. ' + auth.payload });

    const indicadores = await Indicador.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(indicadores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de indicadores: ' + error });
  }
}

//Get by Id
export const getIndicadorById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Indicador. ' + auth.payload });

    const indicador = await Indicador.findByPk(id, {
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

    if (indicador) {
      const progresos = await getProgresosIndicador(indicador.dataValues.id);
      res.json({...indicador.dataValues, ...progresos});
    } else {
      res.status(404).json({ error: 'Indicador no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener indicador por ID: ' + error });
  }
}

//Create
export const createIndicador = async (req, res) => {
  const { nombre, descripcion, tipoIndicador, frecuencia, medida, metas } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Indicador. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentNombre = await validateUniquesIndicador({nombre})
    if(existentNombre) return res.status(400).json({ error: `Error al crear el Indicador. El código ${nombre} ya está en uso.` });

    const indicador = await Indicador.create({ 
      //Propiedades de entidad
      nombre,
      descripcion,
      tipoIndicador,
      frecuencia,
      medida,
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

    const progresos = await uploadMetas(indicador.id, metas)

    res.status(201).json({...indicador.dataValues, ...progresos});
  } catch (error) {
    res.status(500).json({ error: 'Error al crear indicador: ' + error });
  }
}

//Edit
export const editIndicador = async (req, res) => {
  try {
    const { idIndicador, nombre, descripcion, tipoIndicador, frecuencia, medida, metas } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Indicador. ' + auth.payload });

    const editorId = auth.payload.userId;

    const indicador = await privateGetIndicadorById(idIndicador);
    if(!indicador) return res.status(404).json({ error: 'Error al editar el indicador. Indicador no encontrado' });

    const existentNombre = await validateUniquesIndicador({nombre, id: idIndicador})
    if(existentNombre) return res.status(400).json({ error: `Error al crear el Indicador. El código ${nombre} ya está en uso.` });

    indicador.update({
      //Propiedades de objeto
      nombre,
      descripcion,
      tipoIndicador,
      frecuencia,
      medida,
      //Propiedades de control
      version: updateVersion(indicador.version, true),
      ultimaRevision: updateVersion(indicador.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    const progresos = await uploadMetas(indicador.id, metas)

    res.status(201).json({...indicador.dataValues, ...progresos});

  } catch (error) {
    res.status(500).json({ error: 'Error al editar indicador: ' + error });
  }
}


//Hide
export const hideIndicador = async (req, res) => {
  const { id: idIndicador, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Indicador. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const indicador = await privateGetIndicadorById(idIndicador);
  if(!indicador) return res.status(404).json({ error: 'Error al eliminar el indicador. Indicador no encontrado.' });

  if(indicador.estado !== 'Eliminado'){
    indicador.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    indicador.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(indicador);
}