import Nivel from '../models/Nivel.js';
import NivelEvento from '../models/NivelesEvento.js';

export const getNivelesEvento = async (eventoId) => {
  try {
    const niveles = await NivelEvento.findAll({
      where: {
        eventoId: eventoId
      },
      attributes: ['eventoId', 'nivelId'],
      include: [
        {
          model: Nivel,
          attributes: ['id', 'nombre'],
          as: 'nivel'
        }
      ]
    })

    return niveles.map(nivel => nivel.dataValues.nivel.dataValues);

  } catch (error) {
    throw error
  }
}


export async function uploadNivelesEvento(eventoId, niveles){
  try {
    const nivelesJSON = JSON.parse(niveles)?.data
    //Agregar lista de persmisos al rol base
    nivelesJSON.map(nivelId => (
      NivelEvento.create({
        eventoId: eventoId,
        nivelId: nivelId
      })
    ))
  } catch (error) {
    throw error;
  }
}

export async function deleteNivelesEvento(eventoId){
  try {
    NivelEvento.destroy({
      where: {
        eventoId: eventoId
      }
    })
  } catch (error) {
    throw error;
  }
}
