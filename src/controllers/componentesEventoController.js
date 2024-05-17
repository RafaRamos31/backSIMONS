import Componente from '../models/Componente.js';
import ComponenteEvento from '../models/ComponentesEvento.js';

export const getComponentesEvento = async (eventoId) => {
  try {
    const componentes = await ComponenteEvento.findAll({
      where: {
        eventoId: eventoId
      },
      attributes: ['eventoId', 'componenteId'],
      include: [
        {
          model: Componente,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'componente'
        }
      ]
    })

    return componentes.map(componente => componente.dataValues.componente.dataValues);

  } catch (error) {
    throw error
  }
}


export async function uploadComponentesEvento(eventoId, componentes){
  try {
    const componentesJSON = JSON.parse(componentes)?.data
    //Agregar lista de persmisos al rol base
    componentesJSON.map(componenteId => (
      ComponenteEvento.create({
        eventoId: eventoId,
        componenteId: componenteId
      })
    ))
  } catch (error) {
    throw error;
  }
}

export async function deleteComponentesEvento(eventoId){
  try {
    ComponenteEvento.destroy({
      where: {
        eventoId: eventoId
      }
    })
  } catch (error) {
    throw error;
  }
}
