import AreaTematica from '../models/AreaTematica.js';
import AreaTematicaSubActividad from '../models/AreaTematicaSubActividad.js';

export const getAreasTematicasSubActividad = async (subactividadId) => {
  try {
    const areasTematicas = await AreaTematicaSubActividad.findAll({
      where: {
        subactividadId: subactividadId
      },
      attributes: ['subactividadId', 'areaTematicaId'],
      include: [
        {
          model: AreaTematica,
          attributes: ['id', 'nombre', 'descripcion'],
          as: 'areaTematica'
        }
      ]
    })

    return areasTematicas.map(area => area.dataValues.areaTematica.dataValues);

  } catch (error) {
    throw error
  }
}


export async function uploadAreasTematicasSubActividad(subactividadId, areasTematicas){
  try {
    const areasTematicasJSON = JSON.parse(areasTematicas)?.data
    //Agregar lista de persmisos al rol base
    areasTematicasJSON.map(areaTematicaId => (
      AreaTematicaSubActividad.create({
        subactividadId: subactividadId,
        areaTematicaId: areaTematicaId
      })
    ))
  } catch (error) {
    throw error;
  }
}

export async function deleteAreasTematicasSubActividad(subactividadId){
  try {
    AreaTematicaSubActividad.destroy({
      where: {
        subactividadId: subactividadId
      }
    })
  } catch (error) {
    throw error;
  }
}
