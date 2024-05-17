import Sector from '../models/Sector.js';
import SectorEvento from '../models/SectoresEvento.js';

export const getSectoresEvento = async (eventoId) => {
  try {
    const sectores = await SectorEvento.findAll({
      where: {
        eventoId: eventoId
      },
      attributes: ['eventoId', 'sectorId'],
      include: [
        {
          model: Sector,
          attributes: ['id', 'nombre'],
          as: 'sector'
        }
      ]
    })

    return sectores.map(sector => sector.dataValues.sector.dataValues);

  } catch (error) {
    throw error
  }
}


export async function uploadSectoresEvento(eventoId, sectores){
  try {
    const sectoresJSON = JSON.parse(sectores)?.data
    //Agregar lista de persmisos al rol base
    sectoresJSON.map(sectorId => (
      SectorEvento.create({
        eventoId: eventoId,
        sectorId: sectorId
      })
    ))
  } catch (error) {
    throw error;
  }
}

export async function deleteSectoresEvento(eventoId){
  try {
    SectorEvento.destroy({
      where: {
        eventoId: eventoId
      }
    })
  } catch (error) {
    throw error;
  }
}
