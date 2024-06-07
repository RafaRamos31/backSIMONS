import Beneficiario from '../models/Beneficiario.js';
import Cargo from '../models/Cargo.js';
import Departamento from '../models/Departamento.js';
import Municipio from '../models/Municipio.js';
import Organizacion from '../models/Organizaciones.js';
import ParticipanteEvento from '../models/ParticipantesEvento.js';
import Sector from '../models/Sector.js';
import TipoOrganizacion from '../models/TipoOrganizacion.js';

export const getParticipantesEvento = async (eventoId) => {
  try {
    const participantes = await ParticipanteEvento.findAll({
      where: {
        eventoId: eventoId
      },
      attributes: ['eventoId', 'participanteId', 'estado', 'indicadorSeleccionadoId'],
      include: [
        {
          model: Beneficiario,
          as: 'participante',
          include: [
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
          ]
        }
      ]
    })

    return participantes.map(participante => (
      {...participante.dataValues.participante.dataValues, 
        estadoIndicador: participante.dataValues.estado,
        indicadorSeleccionadoId: participante.dataValues.indicadorSeleccionadoId,
      }));

  } catch (error) {
    throw error
  }
}


export async function uploadParticipantesEvento(eventoId, participantes){
  try {
    const participantesJSON = JSON.parse(participantes)?.data
    //Agregar lista de persmisos al rol base
    participantesJSON.map(participanteId => (
      ParticipanteEvento.create({
        eventoId: eventoId,
        participanteId: participanteId
      })
    ))
  } catch (error) {
    throw error;
  }
}

export async function deleteParticipantesEvento(eventoId){
  try {
    ParticipanteEvento.destroy({
      where: {
        eventoId: eventoId
      }
    })
  } catch (error) {
    throw error;
  }
}


export async function setEstadoIndicadores(eventoId, participantes){
  try {
    const participantesJSON = JSON.parse(participantes)?.data

    participantesJSON.map(async participante => {
      const usuario = await ParticipanteEvento.findOne({
        where: {
          eventoId: eventoId,
          participanteId: participante.id,
        }
      })
      usuario.update({
        estado: participante.estadoIndicador,
        indicadorSeleccionadoId: participante.valueIndicador
      })
    })
  } catch (error) {
    throw error;
  }
}