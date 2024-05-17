import Indicador from '../models/Indicador.js';
import IndicadorAreaTematica from '../models/IndicadorAreaTematica.js';

export const getIndicadoresAreaTematica = async (areaTematicaId) => {
  try {
    const indicadores = await IndicadorAreaTematica.findAll({
      where: {
        areaTematicaId: areaTematicaId
      },
      attributes: ['areaTematicaId', 'indicadorId'],
      include: [
        {
          model: Indicador,
          attributes: ['id', 'nombre', 'descripcion', 'medida'],
          as: 'indicador'
        }
      ]
    })

    return indicadores.map(indicador => indicador.dataValues.indicador.dataValues);

  } catch (error) {
    throw error
  }
}


export async function uploadIndicadoresAreaTematica(areaTematicaId, indicadores){
  try {
    const indicadoresJSON = JSON.parse(indicadores)?.data
    //Agregar lista de persmisos al rol base
    indicadoresJSON.map(indicadorId => (
      IndicadorAreaTematica.create({
        areaTematicaId: areaTematicaId,
        indicadorId: indicadorId
      })
    ))
  } catch (error) {
    throw error;
  }
}

export async function deleteIndicadoresAreaTematica(areaTematicaId){
  try {
    IndicadorAreaTematica.destroy({
      where: {
        areaTematicaId: areaTematicaId
      }
    })
  } catch (error) {
    throw error;
  }
}
