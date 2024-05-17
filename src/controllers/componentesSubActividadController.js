import Componente from '../models/Componente.js';
import ComponenteSubActividad from '../models/ComponentesSubActividad.js';

export const getComponentesSubActividad = async (subactividadId) => {
  try {
    const componentes = await ComponenteSubActividad.findAll({
      where: {
        subactividadId: subactividadId
      },
      attributes: ['subactividadId', 'componenteId'],
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


export async function uploadComponentesSubActividad(subactividadId, componentes){
  try {
    const componentesJSON = JSON.parse(componentes)?.data
    //Agregar lista de persmisos al rol base
    componentesJSON.map(componenteId => (
      ComponenteSubActividad.create({
        subactividadId: subactividadId,
        componenteId: componenteId
      })
    ))
  } catch (error) {
    throw error;
  }
}

export async function deleteComponentesSubActividad(subactividadId){
  try {
    ComponenteSubActividad.destroy({
      where: {
        subactividadId: subactividadId
      }
    })
  } catch (error) {
    throw error;
  }
}
