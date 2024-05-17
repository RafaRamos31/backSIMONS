import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Year from '../models/Year.js';
import { Op } from 'sequelize';
import moment from 'moment';
import Quarter from '../models/Quarter.js';

//Internos para validacion de claves unicas
async function validateUniquesQuarter({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Quarter.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetQuarterById(idQuarter){
  try {
    return Quarter.findByPk(idQuarter);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedQuarters = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Trimestres. ' + auth.payload });

    const quarters = (await Quarter.findAndCountAll({
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
          model: Year,
          attributes: ['id', 'nombre', 'fechaInicio', 'fechaFinal'],
          as: 'year'
        }
      ]
    }));
    res.json(quarters);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los trimestres: ' + error });
  }
}

//Get list
export const getQuartersList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Trimestres. ' + auth.payload });

    const quarters = await Quarter.findAll({
      attributes: ['id', 'nombre', 'fechaInicio', 'fechaFinal'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(quarters);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de trimestres: ' + error });
  }
}

//Get by Id
export const getQuarterById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Trimestre. ' + auth.payload });

    const quarter = await Quarter.findByPk(id, {
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
          model: Year,
          attributes: ['id', 'nombre', 'fechaInicio', 'fechaFinal'],
          as: 'year'
        }
      ]
    });

    if (quarter) {
      res.json(quarter);
    } else {
      res.status(404).json({ error: 'Trimestre no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener trimestre por ID: ' + error });
  }
}

//Create
export const createQuarter = async (req, res) => {
  const { nombre, fechaInicio: baseFechaInicio, fechaFinal: baseFechaFinal, yearId, timezone } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Trimestre. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentName = await validateUniquesQuarter({nombre})
    if(existentName) return res.status(400).json({ error: `Error al crear el trimestre. El nombre ${nombre} ya está en uso.` });

    const fechaInicio = moment(baseFechaInicio).startOf('day').subtract(6, 'h')
    const fechaFinal = moment(baseFechaFinal).endOf('day')

    const quarter = await Quarter.create({ 
      //Propiedades de entidad
      nombre,
      fechaInicio: fechaInicio.format('YYYY-MM-DD HH:mm:ss'),
      fechaFinal: fechaFinal.format('YYYY-MM-DD HH:mm:ss'),
      yearId,
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

    res.status(201).json(quarter);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear trimestre: ' + error });
  }
}

//Edit
export const editQuarter = async (req, res) => {
  try {
    const { idQuarter, nombre, fechaInicio: baseFechaInicio, fechaFinal: baseFechaFinal, yearId, timezone } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Trimestre. ' + auth.payload });

    const editorId = auth.payload.userId;

    const quarter = await privateGetQuarterById(idQuarter);
    if(!quarter) return res.status(404).json({ error: 'Error al editar el trimestre. Trimestre no encontrado' });

    const existentName = await validateUniquesQuarter({nombre, id: idQuarter})
    if(existentName) return res.status(400).json({ error: `Error al crear el trimestre. El nombre ${nombre} ya está en uso.` });

    const fechaInicio = moment(baseFechaInicio).startOf('day').subtract(6, 'h')
    const fechaFinal = moment(baseFechaFinal).endOf('day')

    quarter.update({
      //Propiedades de objeto
      nombre: nombre,
      fechaInicio: fechaInicio.format('YYYY-MM-DD HH:mm:ss'),
      fechaFinal: fechaFinal.format('YYYY-MM-DD HH:mm:ss'),
      yearId,
      //Propiedades de control
      version: updateVersion(quarter.version, true),
      ultimaRevision: updateVersion(quarter.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(quarter);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar trimestre: ' + error });
  }
}


//Hide
export const hideQuarter = async (req, res) => {
  const { id: idQuarter, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Trimestre. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const quarter = await privateGetQuarterById(idQuarter);
  if(!quarter) return res.status(404).json({ error: 'Error al eliminar el trimestre. Trimestre no encontrado.' });

  if(quarter.estado !== 'Eliminado'){
    quarter.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    quarter.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(quarter);
}