import ProgresoIndicador from '../models/ProgresoIndicador.js';

export async function uploadMetas(indicadorId, metas){
  try {
    const metasJSON = JSON.parse(metas)
    //Agregar lista de persmisos al rol base
    for(let year in metasJSON){
      for(let quarter in metasJSON[year]){
        const [progresoIndicador, created] = await ProgresoIndicador.findOrCreate({
          where: {
            indicadorId: indicadorId,
            year: year,
            quarter: quarter,
          },
          defaults: {
            meta: metasJSON[year][quarter],
            progreso: 0
          }
        })
        if(!created){
          progresoIndicador.update({
            meta: metasJSON[year][quarter]
          })
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

export const getProgresosIndicador = async (indicadorId) => {
  try {
    const progresosIndicador = await ProgresoIndicador.findAll({
      where: {
        indicadorId: indicadorId
      },
      attributes: ['indicadorId', 'year', 'quarter', 'meta', 'progreso']
    })

    const metasJSON = {}
    const progresosJSON = {}
    progresosIndicador.map(progreso => {
      let data = progreso.dataValues;

      if(!metasJSON[data.year]){
        metasJSON[data.year] = {}
      }

      if(!progresosJSON[data.year]){
        progresosJSON[data.year] = {}
      }

      metasJSON[data.year][data.quarter] = data.meta;
      progresosJSON[data.year][data.quarter] = data.progreso;

      return {metas: metasJSON, progresos: progresosJSON};
    });
    return {metas: metasJSON, progresos: progresosJSON};
  } catch (error) {
    throw error
  }
}


export async function sumarProgresos(year, quarter, conteo){
  try {
    const conteosJSON = JSON.parse(conteo)
    //Agregar lista de persmisos al rol base
    for(let indicador in conteosJSON){
      //Meta trimestre
      const progresoIndicadorTrimestre = await ProgresoIndicador.findOne({
        where: {
          indicadorId: indicador,
          year: year,
          quarter: quarter,
        }})
        progresoIndicadorTrimestre.update({
        progreso: progresoIndicadorTrimestre.dataValues.progreso + conteosJSON[indicador]['Valid']
      })
      //Meta anual
      const progresoIndicadorAnual = await ProgresoIndicador.findOne({
        where: {
          indicadorId: indicador,
          year: year,
          quarter: 'Total',
        }})
        progresoIndicadorAnual.update({
        progreso: progresoIndicadorAnual.dataValues.progreso + conteosJSON[indicador]['Valid']
      })
      //Meta LOP T1
      const progresoIndicadorLOPT1 = await ProgresoIndicador.findOne({
        where: {
          indicadorId: indicador,
          year: 'LOP',
          quarter: 'T1',
        }})
        progresoIndicadorLOPT1.update({
        progreso: progresoIndicadorLOPT1.dataValues.progreso + conteosJSON[indicador]['Valid']
      })
      //Meta LOP T2
      const progresoIndicadorLOPT2 = await ProgresoIndicador.findOne({
        where: {
          indicadorId: indicador,
          year: 'LOP',
          quarter: 'T2',
        }})
        progresoIndicadorLOPT2.update({
        progreso: progresoIndicadorLOPT2.dataValues.progreso + conteosJSON[indicador]['Valid']
      })
      //Meta LOP T3
      const progresoIndicadorLOPT3 = await ProgresoIndicador.findOne({
        where: {
          indicadorId: indicador,
          year: 'LOP',
          quarter: 'T3',
        }})
        progresoIndicadorLOPT3.update({
        progreso: progresoIndicadorLOPT3.dataValues.progreso + conteosJSON[indicador]['Valid']
      })
      //Meta LOP T4
      const progresoIndicadorLOPT4 = await ProgresoIndicador.findOne({
        where: {
          indicadorId: indicador,
          year: 'LOP',
          quarter: 'T4',
        }})
        progresoIndicadorLOPT4.update({
        progreso: progresoIndicadorLOPT4.dataValues.progreso + conteosJSON[indicador]['Valid']
      })
      //Meta LOP TOTAL
      const progresoIndicadorLOP = await ProgresoIndicador.findOne({
        where: {
          indicadorId: indicador,
          year: 'LOP',
          quarter: 'Total',
        }})
        progresoIndicadorLOP.update({
        progreso: progresoIndicadorLOP.dataValues.progreso + conteosJSON[indicador]['Valid']
      })
    }
  } catch (error) {
    throw error;
  }
}