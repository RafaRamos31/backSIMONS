import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Nivel from '../models/Nivel.js';


//Get internal
export async function privateGetNivelById(idNivel){
  try {
    return Nivel.findByPk(idNivel);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedNiveles = async (req, res) => {
  try {
    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Niveles. ' + auth.payload });

    const niveles = (await Nivel.findAndCountAll({
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
    res.json(niveles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos los niveles: ' + error });
  }
}

//Get list
export const getNivelesList = async (req, res) => {
  try {
    const { filter='{}' } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Niveles. ' + auth.payload });

    const niveles = await Nivel.findAll({
      attributes: ['id', 'nombre'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(niveles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de niveles: ' + error });
  }
}

//Get by Id
export const getNivelById = async (req, res) => {
  try {
    const { id } = req.params;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Nivel. ' + auth.payload });

    const nivel = await Nivel.findByPk(id, {
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

    if (nivel) {
      res.json(nivel);
    } else {
      res.status(404).json({ error: 'Nivel no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Nivel por ID: ' + error });
  }
}

//Create
export const createNivel = async (req, res) => {
  const { nombre } = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Nivel. ' + auth.payload });

    const editorId = auth.payload.userId;

    const nivel = await Nivel.create({ 
      //Propiedades de entidad
      nombre,
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

    res.status(201).json(nivel);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear Nivel: ' + error });
  }
}

//Edit
export const editNivel = async (req, res) => {
  try {
    const { idNivel, nombre } = req.body;

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Nivel. ' + auth.payload });

    const editorId = auth.payload.userId;

    const nivel = await privateGetNivelById(idNivel);
    if(!nivel) return res.status(404).json({ error: 'Error al editar el nivel. Nivel no encontrado' });

    nivel.update({
      //Propiedades de objeto
      nombre: nombre,
      //Propiedades de control
      version: updateVersion(nivel.version, true),
      ultimaRevision: updateVersion(nivel.version, true),
      fechaEdicion: new Date(),
      editorId: editorId,
      fechaRevision: new Date(),
      revisorId: editorId,
      observaciones: null
    })

    res.status(201).json(nivel);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar nivel: ' + error });
  }
}


//Hide
export const hideNivel = async (req, res) => {
  const { id: idNivel, observaciones=null } = req.body;

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al eliminar Nivel. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const nivel = await privateGetNivelById(idNivel);
  if(!nivel) return res.status(404).json({ error: 'Error al eliminar el nivel. Nivel no encontrado.' });

  if(nivel.estado !== 'Eliminado'){
    nivel.update({
      estado: 'Eliminado',
      fechaEliminacion: new Date(),
      eliminadorId: eliminadorId,
      observaciones: observaciones
    })
  }
  else{
    nivel.update({
      estado: 'Publicado',
      fechaEliminacion: null,
      eliminadorId: null,
      observaciones: null
    })
  }

  res.json(nivel);
}