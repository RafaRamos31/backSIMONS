import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import SubResultado from '../models/SubResultado.js';
import Resultado from '../models/Resultado.js';
import Actividad from '../models/Actividad.js';
import SubActividad from '../models/SubActividad.js';
import { deleteComponentesSubActividad, getComponentesSubActividad, uploadComponentesSubActividad } from './componentesSubActividadController.js';
import ComponenteSubActividad from '../models/ComponentesSubActividad.js';
import { deleteAreasTematicasSubActividad, getAreasTematicasSubActividad, uploadAreasTematicasSubActividad } from './areasTematicasSubActividadController.js';

//Internos para validacion de claves unicas
async function validateUniquesSubActividad({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return SubActividad.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetSubActividadById(idSubactividad){
  try {
    return SubActividad.findByPk(idSubactividad);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedSubActividades = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener SubActividades. ' + auth.payload });

    const subactividades = (await SubActividad.findAndCountAll({
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
        {
          model: SubResultado,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'subresultado'
        },
        {
          model: Actividad,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'actividad'
        },
      ]
    }));

    const count = subactividades.count
    const rows = await populateArrays(subactividades.rows)

    res.json({count, rows});
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todas las subactividades: ' + error });
  }
}

const populateArrays = async (subactividades) => {
  const subactividadesArray = [];
  for(let subactividad of subactividades){
    const componentes = await getComponentesSubActividad(subactividad.dataValues.id)
    const areasTematicas = await getAreasTematicasSubActividad(subactividad.dataValues.id)
    subactividadesArray.push({
      ...subactividad.dataValues,
      componentes: componentes,
      areasTematicas: areasTematicas
    })
  }
  return subactividadesArray;
}

//Get list
export const getASubActividadesList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener subactividades. ' + auth.payload });

    const subactividades = await SubActividad.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(subactividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de subactividades: ' + error });
  }
}


//Get list componente
export const getASubActividadesListComponente = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener subactividades. ' + auth.payload });

    const subactividadesIds = await ComponenteSubActividad.findAll({
      where: {
        componenteId: id
      }
    });

    const subactividades = []
    for(let id of subactividadesIds){
      const subactividad = await SubActividad.findByPk(id.subactividadId, {
        attributes: ['id', 'nombre', 'descripcion']
      })
      subactividades.push(subactividad)
    }

    res.json(subactividades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de subactividades: ' + error });
  }
}



//Get by Id
export const getSubActividadById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener SubActividades. ' + auth.payload });

    const subactividad = await SubActividad.findByPk(id, {
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
        {
          model: SubResultado,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'subresultado'
        },
        {
          model: Actividad,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'actividad'
        },
      ]
    });

    const componentes = await getComponentesSubActividad(id)
    const areasTematicas = await getAreasTematicasSubActividad(id)

    if (subactividad) {
      res.json({...subactividad.dataValues, componentes, areasTematicas});
    } else {
      res.status(404).json({ error: 'SubActividad no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener SubActividad por ID: ' + error });
  }
}


//Create
export const createSubActividad = async (req, res) => {
  const { nombre, descripcion, resultadoId, subresultadoId, actividadId, componentes, areasTematicas } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear SubActividad. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentNombre = await validateUniquesSubActividad({nombre})
    if(existentNombre) return res.status(400).json({ error: `Error al crear la SubActividad. El código ${nombre} ya está en uso.` });

    const subactividad = await SubActividad.create({ 
      //Propiedades de entidad
      nombre, 
      descripcion, 
      resultadoId,
      subresultadoId,
      actividadId,
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

    //Se agregan los componentes a la tabla de componentes de subactividad
    uploadComponentesSubActividad(subactividad.id, componentes)

    //Se agregan las areas tematicas a la tabla de areas tematicas de subactividad
    uploadAreasTematicasSubActividad(subactividad.id, areasTematicas)

    res.status(201).json(subactividad);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear subactividad: ' + error });
  }
}

//Edit
export const editSubActividad = async (req, res) => {
  try {
    const { idSubActividad, nombre, descripcion, resultadoId, subresultadoId, actividadId, componentes, areasTematicas } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar SubActividad. ' + auth.payload });

    const editorId = auth.payload.userId;

    const subactividad = await privateGetSubActividadById(idSubActividad);
    if(!subactividad) return res.status(404).json({ error: 'Error al editar la SubActividad. SubActividad no encontrada' });

    const existentNombre = await validateUniquesSubActividad({nombre, id: idSubActividad})
    if(existentNombre) return res.status(400).json({ error: `Error al crear la SubActividad. El código ${nombre} ya está en uso.` });

    subactividad.update({
      //Propiedades de objeto
      nombre: nombre,
      descripcion: descripcion,
      resultadoId: resultadoId,
      subresultadoId: subresultadoId,
      actividadId: actividadId,
      //Propiedades de control
      version: updateVersion(subactividad.version, true),
      ultimaRevision: updateVersion(subactividad.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    //Se eliminan los componentes anteriores
    await deleteComponentesSubActividad(subactividad.id);

    //Se eliminan las areas tematicas anteriores
    await deleteAreasTematicasSubActividad(subactividad.id);

    //Se agregan los componentes a la tabla de componentes de subactividad
    uploadComponentesSubActividad(subactividad.id, componentes)

    //Se agregan las areas tematicas a la tabla de areas tematicas de subactividad
    uploadAreasTematicasSubActividad(subactividad.id, areasTematicas)

    res.status(201).json(subactividad);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar SubActividad: ' + error });
  }
}


//Hide
export const hideSubActividad = async (req, res) => {
  const { id: idSubactividad, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar SubActividad. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const subactividad = await privateGetSubActividadById(idSubactividad);
  if(!subactividad) return res.status(404).json({ error: 'Error al eliminar la SubActividad. SubActividad no encontrada.' });

  if(subactividad.estado !== 'Eliminado'){
    subactividad.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    subactividad.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(subactividad);
}