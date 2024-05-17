import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Year from '../models/Year.js';
import { Op } from 'sequelize';
import moment from 'moment';

//Internos para validacion de claves unicas
async function validateUniquesYear({id=null, nombre = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(nombre){
    filter = {...filter, nombre: nombre}
  }

  return Year.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetYearById(idYear){
  try {
    return Year.findByPk(idYear);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedYears = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Años fiscales. ' + auth.payload });

    const years = (await Year.findAndCountAll({
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
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los años fiscales: ' + error });
  }
}

//Get list
export const getYearsList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Años Fiscales. ' + auth.payload });

    const years = await Year.findAll({
      attributes: ['id', 'nombre', 'fechaInicio', 'fechaFinal'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de años fiscales: ' + error });
  }
}

//Get by Id
export const getYearById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Año Fiscal. ' + auth.payload });

    const year = await Year.findByPk(id, {
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

    if (year) {
      res.json(year);
    } else {
      res.status(404).json({ error: 'Año fiscal no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener año fiscal por ID: ' + error });
  }
}

//Create
export const createYear = async (req, res) => {
  const { nombre, fechaInicio: baseFechaInicio, fechaFinal: baseFechaFinal, timezone } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Año Fiscal. ' + auth.payload });

    const editorId = auth.payload.userId;

    const existentName = await validateUniquesYear({nombre})
    if(existentName) return res.status(400).json({ error: `Error al crear el año fiscal. El nombre ${nombre} ya está en uso.` });

    const fechaInicio = moment(baseFechaInicio).startOf('day').subtract(6, 'h')
    const fechaFinal = moment(baseFechaFinal).endOf('day')

    const year = await Year.create({ 
      //Propiedades de entidad
      nombre,
      fechaInicio: fechaInicio.format('YYYY-MM-DD HH:mm:ss'),
      fechaFinal: fechaFinal.format('YYYY-MM-DD HH:mm:ss'),
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

    res.status(201).json(year);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear año fiscal: ' + error });
  }
}

//Edit
export const editYear = async (req, res) => {
  try {
    const { idYear, nombre, fechaInicio: baseFechaInicio, fechaFinal: baseFechaFinal, timezone } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Año fiscal. ' + auth.payload });

    const editorId = auth.payload.userId;

    const year = await privateGetYearById(idYear);
    if(!year) return res.status(404).json({ error: 'Error al editar el año fiscal. Año fiscal no encontrado' });

    const existentName = await validateUniquesYear({nombre, id: idYear})
    if(existentName) return res.status(400).json({ error: `Error al crear el año fiscal. El nombre ${nombre} ya está en uso.` });

    const fechaInicio = moment(baseFechaInicio).startOf('day').subtract(6, 'h')
    const fechaFinal = moment(baseFechaFinal).endOf('day')

    year.update({
      //Propiedades de objeto
      nombre: nombre,
      fechaInicio: fechaInicio.format('YYYY-MM-DD HH:mm:ss'),
      fechaFinal: fechaFinal.format('YYYY-MM-DD HH:mm:ss'),
      //Propiedades de control
      version: updateVersion(year.version, true),
      ultimaRevision: updateVersion(year.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(year);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar año fiscal: ' + error });
  }
}


//Hide
export const hideYear = async (req, res) => {
  const { id: idYear, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Año fiscal. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const year = await privateGetYearById(idYear);
  if(!year) return res.status(404).json({ error: 'Error al eliminar el año fiscal. Año fiscal no encontrado.' });

  if(year.estado !== 'Eliminado'){
    year.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    year.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(year);
}