import ColaboradorEvento from '../models/ColaboradoresEvento.js';
import Usuario from '../models/Usuario.js';

export const getColaboradoresEvento = async (eventoId) => {
  try {
    const componentes = await ColaboradorEvento.findAll({
      where: {
        eventoId: eventoId
      },
      attributes: ['eventoId', 'colaboradorId'],
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre'],
          as: 'colaborador'
        }
      ]
    })

    return componentes.map(componente => componente.dataValues.colaborador.dataValues);

  } catch (error) {
    throw error
  }
}


export async function uploadColaboradoresEvento(eventoId, colaboradores){
  try {
    const colaboradoresJSON = JSON.parse(colaboradores)?.data
    //Agregar lista de persmisos al rol base
    colaboradoresJSON.map(colaboradorId => (
      ColaboradorEvento.create({
        eventoId: eventoId,
        colaboradorId: colaboradorId
      })
    ))
  } catch (error) {
    throw error;
  }
}

export async function deleteColaboradoresEvento(eventoId){
  try {
    ColaboradorEvento.destroy({
      where: {
        eventoId: eventoId
      }
    })
  } catch (error) {
    throw error;
  }
}
