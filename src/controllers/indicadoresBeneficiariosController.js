import IndicadorBeneficiario from '../models/IndicadorBeneficiario.js';

export const getIndicadoresBeneficiario = async (beneficiarioId) => {
  try {
    const indicadoresBeneficiario = await IndicadorBeneficiario.findAll({
      where: {
        beneficiarioId: beneficiarioId
      },
      attributes: ['beneficiarioId', 'yearId', 'indicadorId']
    })

    const indicadoresJSON = {}
    indicadoresBeneficiario.map(indicador => {
      let data = indicador.dataValues;

      if(!indicadoresJSON[data.yearId]){
        indicadoresJSON[data.yearId] = []
      }

      indicadoresJSON[data.yearId].push(data.indicadorId)

      return indicadoresJSON;
    });
    return indicadoresJSON;
  } catch (error) {
    throw error
  }
}


export async function uploadIndicadoresBeneficiarios(yearId, participantes){
  try {
    const participantesJSON = JSON.parse(participantes)?.data

    participantesJSON.map(participante => (
      IndicadorBeneficiario.create({
        beneficiarioId: participante.id,
        yearId: yearId,
        indicadorId: participante.valueIndicador
      })
    ))
  } catch (error) {
    throw error;
  }
}