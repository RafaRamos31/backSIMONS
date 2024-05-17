import { Op } from 'sequelize';
import Usuario from '../models/Usuario.js';
import { getFilter, getSorting } from '../utils/queryConstructor.js';
import { updateVersion } from '../utils/versionHelper.js';
import Organizacion from '../models/Organizaciones.js';
import Departamento from '../models/Departamento.js';
import Municipio from '../models/Municipio.js';
import Aldea from '../models/Aldea.js';
import Caserio from '../models/Caserio.js';
import Sector from '../models/Sector.js';
import TipoOrganizacion from '../models/TipoOrganizacion.js';
import { decodeToken } from '../utils/jwtDecoder.js';
import Nivel from '../models/Nivel.js';


//Get internal
export async function privateGetOrganizacionById(idOrganizacion){
  try {
    return Organizacion.findByPk(idOrganizacion);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedOrganizaciones = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener organizaciones. ' + auth.payload });

    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const organizaciones = (await Organizacion.findAndCountAll({
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
          model: Departamento,
          attributes: ['id', 'nombre'],
          as: 'departamento'
        },
        {
          model: Municipio,
          attributes: ['id', 'nombre'],
          as: 'municipio'
        },
        {
          model: Aldea,
          attributes: ['id', 'nombre'],
          as: 'aldea'
        },
        {
          model: Caserio,
          attributes: ['id', 'nombre'],
          as: 'caserio'
        },
        {
          model: Sector,
          attributes: ['id', 'nombre'],
          as: 'sector'
        },
        {
          model: TipoOrganizacion,
          attributes: ['id', 'nombre'],
          as: 'tipoOrganizacion'
        },
        {
          model: Nivel,
          attributes: ['id', 'nombre'],
          as: 'nivel'
        },
    ]}));
    res.json(organizaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos las organizaciones: ' + error });
  }
}

//Get list
export const getOrganizacionesList = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener lista de organizaciones. ' + auth.payload });

    const { filter='{}' } = req.body;

    const organizaciones = await Organizacion.findAll({
      attributes: ['id', 'nombre'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)})
    });
    res.json(organizaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de organizaciones: ' + error });
  }
}

//Get by Id
export const getOrganizacionById = async (req, res) => {
  try {

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Organizacion por ID. ' + auth.payload });

    const { id } = req.params;
    const organizacion = await Organizacion.findByPk(id, {
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
          model: Departamento,
          attributes: ['id', 'nombre'],
          as: 'departamento'
        },
        {
          model: Municipio,
          attributes: ['id', 'nombre'],
          as: 'municipio'
        },
        {
          model: Aldea,
          attributes: ['id', 'nombre'],
          as: 'aldea'
        },
        {
          model: Caserio,
          attributes: ['id', 'nombre'],
          as: 'caserio'
        },
        {
          model: Sector,
          attributes: ['id', 'nombre'],
          as: 'sector'
        },
        {
          model: TipoOrganizacion,
          attributes: ['id', 'nombre'],
          as: 'tipoOrganizacion'
        },
        {
          model: Nivel,
          attributes: ['id', 'nombre'],
          as: 'nivel'
        },
    ]});

    if (organizacion) {
      res.json(organizacion);
    } else {
      res.status(404).json({ error: 'Organización no encontrada.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener organización por ID: ' + error });
  }
}

//Get revisiones
export const getRevisionesOrganizacion = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener revisiones de Organizacion. ' + auth.payload });

    const { id } = req.params;

    const revisiones = await Organizacion.findAll({
      where: {
        estado: { [Op.notIn] : ['Publicado', 'Eliminado']},
        originalId: id
      },
      order: getSorting({defaultSort: ['version', 'DESC']}),
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
          model: Departamento,
          attributes: ['id', 'nombre'],
          as: 'departamento'
        },
        {
          model: Municipio,
          attributes: ['id', 'nombre'],
          as: 'municipio'
        },
        {
          model: Aldea,
          attributes: ['id', 'nombre'],
          as: 'aldea'
        },
        {
          model: Caserio,
          attributes: ['id', 'nombre'],
          as: 'caserio'
        },
        {
          model: Sector,
          attributes: ['id', 'nombre'],
          as: 'sector'
        },
        {
          model: TipoOrganizacion,
          attributes: ['id', 'nombre'],
          as: 'tipoOrganizacion'
        },
        {
          model: Nivel,
          attributes: ['id', 'nombre'],
          as: 'nivel'
        },
    ]})

    res.json(revisiones);

  } catch (error) {
    throw error;
  }
}

//Create
export const createOrganizacion = async (req, res) => {
  const { nombre, codigo, sectorId, tipoOrganizacionId, nivelId, telefono, departamentoId, municipioId, aldeaId,
  caserioId, nombreContacto, telefonoContacto, correoContacto, aprobar=false } = req.body;
  try {

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Organizacion. ' + auth.payload });

    const editorId = auth.payload.userId;

    const baseOrganizacion = await Organizacion.create({ 
      //Propiedades de entidad
      nombre,
      codigo: codigo.length > 0 ? codigo : null,
      sectorId: sectorId.length > 0 ? sectorId : null,
      tipoOrganizacionId: tipoOrganizacionId.length > 0 ? tipoOrganizacionId : null,
      nivelId: nivelId.length > 0 ? nivelId : null,
      telefono: telefono.length > 0 ? telefono : null,
      departamentoId: departamentoId.length > 0 ? departamentoId : null,
      municipioId: municipioId.length > 0 ? municipioId : null,
      aldeaId: aldeaId.length > 0 ? aldeaId : null,
      caserioId: caserioId.length > 0 ? caserioId : null,
      nombreContacto: nombreContacto.length > 0 ? nombreContacto : null,
      telefonoContacto: telefonoContacto.length > 0 ? telefonoContacto : null,
      correoContacto: correoContacto.length > 0 ? correoContacto : null,
      //Propiedades de control
      originalId: null,
      version: '0.1',
      ultimaRevision: '0.1',
      estado: 'En revisión',
      editorId,
      fechaEdicion: new Date(),
      revisorId: null,
      fechaRevision: null,
      eliminadorId: null,
      fechaEliminacion: null,
      observaciones: null,
    });

    if(JSON.parse(aprobar)){
      const organizacion = await Organizacion.create({ 
        //Propiedades de entidad
        nombre,
        codigo: codigo.length > 0 ? codigo : null,
        sectorId: sectorId.length > 0 ? sectorId : null,
        tipoOrganizacionId: tipoOrganizacionId.length > 0 ? tipoOrganizacionId : null,
        nivelId: nivelId.length > 0 ? nivelId : null,
        telefono: telefono.length > 0 ? telefono : null,
        departamentoId: departamentoId.length > 0 ? departamentoId : null,
        municipioId: municipioId.length > 0 ? municipioId : null,
        aldeaId: aldeaId.length > 0 ? aldeaId : null,
        caserioId: caserioId.length > 0 ? caserioId : null,
        nombreContacto: nombreContacto.length > 0 ? nombreContacto : null,
        telefonoContacto: telefonoContacto.length > 0 ? telefonoContacto : null,
        correoContacto: correoContacto.length > 0 ? correoContacto : null,
        //Propiedades de control
        originalId: null,
        version: '1.0',
        ultimaRevision: '1.0',
        estado: 'Publicado',
        editorId,
        fechaEdicion: new Date(),
        revisorId: editorId,
        fechaRevision: new Date(),
        eliminadorId: null,
        fechaEliminacion: null,
        observaciones: null,
      });

      baseOrganizacion.update({
        originalId: organizacion.id,
        estado: 'Validado',
        revisorId: editorId,
        fechaRevision: new Date(),
      })

      organizacion.update({
        originalId: organizacion.id
      })
    }

    res.status(201).json(baseOrganizacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear organizacion: ' + error });
  }
}

//Edit
export const editOrganizacion = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Organizacion. ' + auth.payload });

    const editorId = auth.payload.userId;

    const { idOrganizacion, nombre, codigo, sectorId, tipoOrganizacionId, nivelId, telefono, departamentoId, municipioId, aldeaId,
    caserioId, nombreContacto, telefonoContacto, correoContacto, aprobar=false } = req.body;
  
    const aprobarValue = JSON.parse(aprobar);

    const organizacion = await privateGetOrganizacionById(idOrganizacion);
    if(!organizacion) return res.status(404).json({ error: 'Error al editar la organización. Organización no encontrada' });

    const baseOrganizacion = await Organizacion.create({ 
      //Propiedades de entidad
      nombre,
      codigo: codigo.length > 0 ? codigo : null,
      sectorId: sectorId.length > 0 ? sectorId : null,
      tipoOrganizacionId: tipoOrganizacionId.length > 0 ? tipoOrganizacionId : null,
      nivelId: nivelId.length > 0 ? nivelId : null,
      telefono: telefono.length > 0 ? telefono : null,
      departamentoId: departamentoId.length > 0 ? departamentoId : null,
      municipioId: municipioId.length > 0 ? municipioId : null,
      aldeaId: aldeaId.length > 0 ? aldeaId : null,
      caserioId: caserioId.length > 0 ? caserioId : null,
      nombreContacto: nombreContacto.length > 0 ? nombreContacto : null,
      telefonoContacto: telefonoContacto.length > 0 ? telefonoContacto : null,
      correoContacto: correoContacto.length > 0 ? correoContacto : null,
      //Propiedades de control
      originalId: organizacion.id,
      version: updateVersion(organizacion.ultimaRevision),
      estado: aprobarValue ? 'Validado' : 'En revisión',
      editorId,
      fechaEdicion: new Date(),
      revisorId: aprobarValue ? editorId : null,
      fechaRevision: aprobarValue ? new Date() : null,
      fechaEliminacion: null,
      observaciones: null,
    });

    if(aprobarValue){
      organizacion.update({
        //Propiedades de objeto
        nombre,
        codigo: codigo.length > 0 ? codigo : null,
        sectorId: sectorId.length > 0 ? sectorId : null,
        tipoOrganizacionId: tipoOrganizacionId.length > 0 ? tipoOrganizacionId : null,
        nivelId: nivelId.length > 0 ? nivelId : null,
        telefono: telefono.length > 0 ? telefono : null,
        departamentoId: departamentoId.length > 0 ? departamentoId : null,
        municipioId: municipioId.length > 0 ? municipioId : null,
        aldeaId: aldeaId.length > 0 ? aldeaId : null,
        caserioId: caserioId.length > 0 ? caserioId : null,
        nombreContacto: nombreContacto.length > 0 ? nombreContacto : null,
        telefonoContacto: telefonoContacto.length > 0 ? telefonoContacto : null,
        correoContacto: correoContacto.length > 0 ? correoContacto : null,
        //Propiedades de control
        version: updateVersion(organizacion.version, aprobarValue),
        ultimaRevision: updateVersion(organizacion.version, aprobarValue),
        editorId,
        fechaEdicion: new Date(),
        revisorId: editorId,
        fechaRevision: new Date(),
        observaciones: null
      })
    }
    else{
      organizacion.update({
        ultimaRevision: updateVersion(organizacion.ultimaRevision),
      })
    }

    res.status(201).json(baseOrganizacion);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar organización: ' + error });
  }
}


//Review
export const reviewOrganizacion = async (req, res) => {

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al revisar Organizacion. ' + auth.payload });

  const revisorId = auth.payload.userId;

  const { id: idOrganizacion, aprobado, observaciones=null } = req.body;

  const updateRev = await privateGetOrganizacionById(idOrganizacion);
  if(updateRev===null) return res.status(404).json({ error: 'Error al revisar la Organización. Organización no encontrada.' });

  const original = await privateGetOrganizacionById(updateRev.originalId);
  if(!original && updateRev.version !== '0.1') return res.status(404).json({ error: 'Error al revisar la Organización. Organización no encontrada.' });

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
        codigo: updateRev.codigo,
        sectorId: updateRev.sectorId,
        tipoOrganizacionId: updateRev.tipoOrganizacionId,
        nivelId: updateRev.nivelId,
        telefono: updateRev.telefono,
        departamentoId: updateRev.departamentoId,
        municipioId: updateRev.municipioId,
        aldeaId: updateRev.aldeaId,
        caserioId: updateRev.caserioId,
        nombreContacto: updateRev.nombreContacto,
        telefonoContacto: updateRev.telefonoContacto,
        correoContacto: updateRev.correoContacto,
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
      const organizacion = await Organizacion.create({
        //Propiedades de objeto
        nombre: updateRev.nombre,
        codigo: updateRev.codigo,
        sectorId: updateRev.sectorId,
        tipoOrganizacionId: updateRev.tipoOrganizacionId,
        nivelId: updateRev.nivelId,
        telefono: updateRev.telefono,
        departamentoId: updateRev.departamentoId,
        municipioId: updateRev.municipioId,
        aldeaId: updateRev.aldeaId,
        caserioId: updateRev.caserioId,
        nombreContacto: updateRev.nombreContacto,
        telefonoContacto: updateRev.telefonoContacto,
        correoContacto: updateRev.correoContacto,
        //Propiedades de control
        originalId: null,
        version: '1.0',
        ultimaRevision: '1.0',
        estado: 'Publicado',
        editorId: revisorId,
        fechaEdicion: updateRev.fechaEdicion,
        revisorId,
        fechaRevision: new Date(),
        eliminadorId: null,
        fechaEliminacion: null,
        observaciones: null,
      })
      
      updateRev.update({
        originalId: organizacion.id
      })

      organizacion.update({
        originalId: organizacion.id
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


//Hide
export const hideOrganizacion = async (req, res) => {

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al ocultar Organización. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const { id: idOrganizacion, observaciones=null } = req.body;

  const organizacion = await privateGetOrganizacionById(idOrganizacion);
  if(!organizacion) return res.status(404).json({ error: 'Error al eliminar la organización. Organización no encontrada.' });

  if(organizacion.estado !== 'Eliminado'){
    organizacion.update({
      estado: 'Eliminado',
      eliminadorId,
      fechaEliminacion: new Date(),
      observaciones: observaciones
    })
  }
  else{
    organizacion.update({
      estado: 'Publicado',
      eliminadorId: null,
      fechaEliminacion: null,
      observaciones: null
    })
  }

  res.json(organizacion);
}