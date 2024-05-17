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
import Beneficiario from '../models/Beneficiario.js';
import Cargo from '../models/Cargo.js';
import { privateGetOrganizacionById } from './organizacionesController.js';
import { privateGetCargoById } from './cargosController.js';
import { privateGetDepartamentoById } from './departamentoController.js';
import { privateGetMunicipioById } from './municipioController.js';
import { privateGetAldeaById } from './aldeasController.js';
import { privateGetCaserioById } from './caseriosController.js';
import { privateGetSectorById } from './sectoresController.js';
import { privateGetTipoOrganizacionById } from './tiposOrganizacionController.js';


//Internos para validacion de claves unicas
async function validateUniquesBeneficiario({id=null, dni = null}){
  let filter = {estado: { [Op.in] : ['Publicado', 'Eliminado']}}

  if(id){
    filter = {...filter, id: {[Op.not]: id }}
  }

  if(dni){
    filter = {...filter, dni: dni}
  }

  return Beneficiario.findOne({
    where: filter
  });
}

//Get internal
export async function privateGetBeneficiarioById(idBeneficiario){
  try {
    return Beneficiario.findByPk(idBeneficiario);
  } catch (error) {
    throw error;
  }
}

//Get paged
export const getPagedBeneficiarios = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener beneficiarios. ' + auth.payload });

    const { page, pageSize, sort='{}', filter='{}', reviews=false, deleteds=false } = req.body;

    const beneficiarios = (await Beneficiario.findAndCountAll({
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
          model: Organizacion,
          attributes: ['id', 'nombre'],
          as: 'organizacion'
        },
        {
          model: Cargo,
          attributes: ['id', 'nombre'],
          as: 'cargo'
        },
    ]}));
    res.json(beneficiarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener todos las beneficiarios: ' + error });
  }
}

//Get list
export const getBeneficiariosList = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener lista de beneficiarios. ' + auth.payload });

    const { filter='{}' } = req.body;

    const beneficiarios = await Beneficiario.findAll({
      attributes: ['id', 'nombre'],
      order: getSorting({defaultSort: ['nombre', 'ASC']}),
      where: getFilter({filterParams: JSON.parse(filter)}),
      limit: 50,
    });
    res.json(beneficiarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lista de beneficiarios: ' + error });
  }
}

//Get by Id
export const getBeneficiarioById = async (req, res) => {
  try {

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Beneficiario por ID. ' + auth.payload });

    const { id } = req.params;
    const beneficiario = await Beneficiario.findByPk(id, {
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
          model: Organizacion,
          attributes: ['id', 'nombre'],
          as: 'organizacion'
        },
        {
          model: Cargo,
          attributes: ['id', 'nombre'],
          as: 'cargo'
        },
    ]});

    if (beneficiario) {
      res.json(beneficiario);
    } else {
      res.status(404).json({ error: 'Beneficiario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener beneficiario por ID: ' + error });
  }
}


//Get by DNI
export const getBeneficiarioByDNI = async (req, res) => {
  try {

    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener Beneficiario por DNI. ' + auth.payload });

    const { dni } = req.params;
    const beneficiario = await Beneficiario.findOne({
      where: {estado: { [Op.in] : ['Publicado', 'Eliminado']}, dni: { [Op.eq]: dni}},
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
          model: Organizacion,
          attributes: ['id', 'nombre'],
          as: 'organizacion'
        },
        {
          model: Cargo,
          attributes: ['id', 'nombre'],
          as: 'cargo'
        },
    ]});

    if (beneficiario) {
      res.json(beneficiario);
    } else {
      res.status(404).json({ error: 'Beneficiario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener beneficiario por DNI: ' + error });
  }
}


//Get revisiones
export const getRevisionesBeneficiario = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener revisiones de Beneficiario. ' + auth.payload });

    const { id } = req.params;

    const revisiones = await Beneficiario.findAll({
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
          model: Organizacion,
          attributes: ['id', 'nombre'],
          as: 'organizacion'
        },
        {
          model: Cargo,
          attributes: ['id', 'nombre'],
          as: 'cargo'
        },
    ]})

    res.json(revisiones);

  } catch (error) {
    throw error;
  }
}

//Create
export const createBeneficiario = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al crear Beneficiario. ' + auth.payload });

    const { nombre, dni, sexo, fechaNacimiento, telefono, tipoBeneficiario, sectorId, tipoOrganizacionId, organizacionId, cargoId, 
      departamentoId, municipioId, aldeaId, caserioId, aprobar=false } = req.body;

    const existentDNI = await validateUniquesBeneficiario({dni})
    if(existentDNI) return res.status(400).json({ error: `Error al crear el Beneficiario. El DNI ${dni} ya está en uso.` });

    const editorId = auth.payload.userId;

    const sector = await privateGetSectorById(sectorId);
    const tipoOrganizacion = await privateGetTipoOrganizacionById(tipoOrganizacionId);
    const organizacion = await privateGetOrganizacionById(organizacionId);
    const cargo = await privateGetCargoById(cargoId);
    const departamento = await privateGetDepartamentoById(departamentoId);
    const municipio = await privateGetMunicipioById(municipioId);
    const aldea = await privateGetAldeaById(aldeaId);
    const caserio = await privateGetCaserioById(caserioId);

    const baseBeneficiario = await Beneficiario.create({ 
      //Propiedades de entidad
      nombre: nombre.length > 0 ? nombre.toUpperCase() : null,
      dni: dni.length > 0 ? dni : null,
      sexo: sexo.length > 0 ? sexo : null,
      fechaNacimiento: fechaNacimiento.length > 0 ? fechaNacimiento : null,
      telefono: telefono.length > 0 ? telefono : null,
      tipoBeneficiario: tipoBeneficiario.length > 0 ? tipoBeneficiario : null,
      sectorId: sectorId.length > 0 ? sectorId : null,
      tipoOrganizacionId: tipoOrganizacionId.length > 0 ? tipoOrganizacionId : null,
      organizacionId: organizacionId.length > 0 ? organizacionId : null,
      cargoId: cargoId.length > 0 ? cargoId : null,
      departamentoId: departamentoId.length > 0 ? departamentoId : null,
      municipioId: municipioId.length > 0 ? municipioId : null,
      aldeaId: aldeaId.length > 0 ? aldeaId : null,
      caserioId: caserioId.length > 0 ? caserioId : null,
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
      const beneficiario = await Beneficiario.create({ 
        //Propiedades de entidad
        nombre: nombre.length > 0 ? nombre.toUpperCase() : null,
        dni: dni.length > 0 ? dni : null,
        sexo: sexo.length > 0 ? sexo : null,
        fechaNacimiento: fechaNacimiento.length > 0 ? fechaNacimiento : null,
        telefono: telefono.length > 0 ? telefono : null,
        tipoBeneficiario: tipoBeneficiario.length > 0 ? tipoBeneficiario : null,
        sectorId: sectorId.length > 0 ? sectorId : null,
        tipoOrganizacionId: tipoOrganizacionId.length > 0 ? tipoOrganizacionId : null,
        organizacionId: organizacionId.length > 0 ? organizacionId : null,
        cargoId: cargoId.length > 0 ? cargoId : null,
        departamentoId: departamentoId.length > 0 ? departamentoId : null,
        municipioId: municipioId.length > 0 ? municipioId : null,
        aldeaId: aldeaId.length > 0 ? aldeaId : null,
        caserioId: caserioId.length > 0 ? caserioId : null,
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

      baseBeneficiario.update({
        originalId: beneficiario.id,
        estado: 'Validado',
        revisorId: editorId,
        fechaRevision: new Date(),
      })

      beneficiario.update({
        originalId: beneficiario.id
      })
    }

    res.status(201).json({...baseBeneficiario.dataValues, sector, tipoOrganizacion, organizacion, cargo, departamento, municipio, aldea, caserio});
  } catch (error) {
    res.status(500).json({ error: 'Error al crear beneficiario: ' + error });
  }
}

//Edit
export const editBeneficiario = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al editar Beneficiario. ' + auth.payload });

    const editorId = auth.payload.userId;

    const { idBeneficiario, nombre, dni, sexo, fechaNacimiento, telefono, tipoBeneficiario, sectorId, tipoOrganizacionId, organizacionId, cargoId, 
      departamentoId, municipioId, aldeaId, caserioId, aprobar=false } = req.body;
    
    const existentDNI = await validateUniquesBeneficiario({dni, id: idBeneficiario})
    if(existentDNI) return res.status(400).json({ error: `Error al crear el Beneficiario. El DNI ${dni} ya está en uso.` });
  
    const aprobarValue = JSON.parse(aprobar);

    const beneficiario = await privateGetBeneficiarioById(idBeneficiario);
    if(!beneficiario) return res.status(404).json({ error: 'Error al editar beneficiario. Beneficiario no encontrado' });

    const sector = await privateGetSectorById(sectorId);
    const tipoOrganizacion = await privateGetTipoOrganizacionById(tipoOrganizacionId);
    const organizacion = await privateGetOrganizacionById(organizacionId);
    const cargo = await privateGetCargoById(cargoId);
    const departamento = await privateGetDepartamentoById(departamentoId);
    const municipio = await privateGetMunicipioById(municipioId);
    const aldea = await privateGetAldeaById(aldeaId);
    const caserio = await privateGetCaserioById(caserioId);

    const baseBeneficiario = await Beneficiario.create({ 
      //Propiedades de entidad
      nombre: nombre.length > 0 ? nombre.toUpperCase() : null,
      dni: dni.length > 0 ? dni : null,
      sexo: sexo.length > 0 ? sexo : null,
      fechaNacimiento: fechaNacimiento.length > 0 ? fechaNacimiento : null,
      telefono: telefono.length > 0 ? telefono : null,
      tipoBeneficiario: tipoBeneficiario.length > 0 ? tipoBeneficiario : null,
      sectorId: sectorId.length > 0 ? sectorId : null,
      tipoOrganizacionId: tipoOrganizacionId.length > 0 ? tipoOrganizacionId : null,
      organizacionId: organizacionId.length > 0 ? organizacionId : null,
      cargoId: cargoId.length > 0 ? cargoId : null,
      departamentoId: departamentoId.length > 0 ? departamentoId : null,
      municipioId: municipioId.length > 0 ? municipioId : null,
      aldeaId: aldeaId.length > 0 ? aldeaId : null,
      caserioId: caserioId.length > 0 ? caserioId : null,
      //Propiedades de control
      originalId: beneficiario.id,
      version: updateVersion(beneficiario.ultimaRevision),
      estado: aprobarValue ? 'Validado' : 'En revisión',
      editorId,
      fechaEdicion: new Date(),
      revisorId: aprobarValue ? editorId : null,
      fechaRevision: aprobarValue ? new Date() : null,
      fechaEliminacion: null,
      observaciones: null,
    });

    if(aprobarValue){
      beneficiario.update({
        //Propiedades de objeto
        nombre: nombre.length > 0 ? nombre.toUpperCase() : null,
        dni: dni.length > 0 ? dni : null,
        sexo: sexo.length > 0 ? sexo : null,
        fechaNacimiento: fechaNacimiento.length > 0 ? fechaNacimiento : null,
        telefono: telefono.length > 0 ? telefono : null,
        tipoBeneficiario: tipoBeneficiario.length > 0 ? tipoBeneficiario : null,
        sectorId: sectorId.length > 0 ? sectorId : null,
        tipoOrganizacionId: tipoOrganizacionId.length > 0 ? tipoOrganizacionId : null,
        organizacionId: organizacionId.length > 0 ? organizacionId : null,
        cargoId: cargoId.length > 0 ? cargoId : null,
        departamentoId: departamentoId.length > 0 ? departamentoId : null,
        municipioId: municipioId.length > 0 ? municipioId : null,
        aldeaId: aldeaId.length > 0 ? aldeaId : null,
        caserioId: caserioId.length > 0 ? caserioId : null,
        //Propiedades de control
        version: updateVersion(beneficiario.version, aprobarValue),
        ultimaRevision: updateVersion(beneficiario.version, aprobarValue),
        editorId,
        fechaEdicion: new Date(),
        revisorId: editorId,
        fechaRevision: new Date(),
        observaciones: null
      })
    }
    else{
      beneficiario.update({
        ultimaRevision: updateVersion(beneficiario.ultimaRevision),
      })
    }

    res.status(201).json({...baseBeneficiario.dataValues, sector, tipoOrganizacion, organizacion, cargo, departamento, municipio, aldea, caserio});
  } catch (error) {
    res.status(500).json({ error: 'Error al editar beneficiario: ' + error });
  }
}


//Review
export const reviewBeneficiario = async (req, res) => {

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al revisar Beneficiario. ' + auth.payload });

  const revisorId = auth.payload.userId;

  const { id: idBeneficiario, aprobado, observaciones=null } = req.body;

  const updateRev = await privateGetBeneficiarioById(idBeneficiario);
  if(updateRev===null) return res.status(404).json({ error: 'Error al revisar Beneficiario. Beneficiario no encontrado.' });

  const original = await privateGetBeneficiarioById(updateRev.originalId);
  if(!original && updateRev.version !== '0.1') return res.status(404).json({ error: 'Error al revisar Beneficiario. Beneficiario no encontrado.' });

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
        dni: updateRev.dni,
        sexo: updateRev.sexo,
        fechaNacimiento: updateRev.fechaNacimiento,
        telefono: updateRev.telefono,
        tipoBeneficiario: updateRev.tipoBeneficiario,
        sectorId: updateRev.sectorId,
        tipoOrganizacionId: updateRev.tipoOrganizacionId,
        organizacionId: updateRev.organizacionId,
        cargoId: updateRev.cargoId,
        departamentoId: updateRev.departamentoId,
        municipioId: updateRev.municipioId,
        aldeaId: updateRev.aldeaId,
        caserioId: updateRev.caserioId,
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
      const beneficiario = await Beneficiario.create({
        //Propiedades de objeto
        nombre: updateRev.nombre,
        dni: updateRev.dni,
        sexo: updateRev.sexo,
        fechaNacimiento: updateRev.fechaNacimiento,
        telefono: updateRev.telefono,
        tipoBeneficiario: updateRev.tipoBeneficiario,
        sectorId: updateRev.sectorId,
        tipoOrganizacionId: updateRev.tipoOrganizacionId,
        organizacionId: updateRev.organizacionId,
        cargoId: updateRev.cargoId,
        departamentoId: updateRev.departamentoId,
        municipioId: updateRev.municipioId,
        aldeaId: updateRev.aldeaId,
        caserioId: updateRev.caserioId,
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
        originalId: beneficiario.id
      })

      beneficiario.update({
        originalId: beneficiario.id
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
export const hideBeneficiario = async (req, res) => {

  const auth = decodeToken(req.headers['authorization']);
  if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al ocultar Beneficiario. ' + auth.payload });

  const eliminadorId = auth.payload.userId;

  const { id: idBeneficiario, observaciones=null } = req.body;

  const beneficiario = await privateGetBeneficiarioById(idBeneficiario);
  if(!beneficiario) return res.status(404).json({ error: 'Error al eliminar beneficiario. Beneficiario no encontrado.' });

  if(beneficiario.estado !== 'Eliminado'){
    beneficiario.update({
      estado: 'Eliminado',
      eliminadorId,
      fechaEliminacion: new Date(),
      observaciones: observaciones
    })
  }
  else{
    beneficiario.update({
      estado: 'Publicado',
      eliminadorId: null,
      fechaEliminacion: null,
      observaciones: null
    })
  }

  res.json(beneficiario);
}