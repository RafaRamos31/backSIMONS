import PermisoRol from '../models/PermisoRol.js';

export async function uploadPermisos(rolId, permisos){
  try {
    const permisosJSON = JSON.parse(permisos)
    //Agregar lista de persmisos al rol base
    for(let categoria in permisosJSON){
      for(let primario in permisosJSON[categoria]){
        for(let secundario in permisosJSON[categoria][primario]){
          const [usuario, created] = await PermisoRol.findOrCreate({
            where: {
              rolId: rolId,
              tipo: categoria,
              permisoPrimario: primario,
              permisoSecundario: secundario,
            },
            defaults: {
              permitido: permisosJSON[categoria][primario][secundario]
            }
          })
          if(!created){
            usuario.update({
              permitido: permisosJSON[categoria][primario][secundario]
            })
          }
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

export const getPermisosRol = async (rolId) => {
  try {
    const permisos = await PermisoRol.findAll({
      where: {
        rolId: rolId
      },
      attributes: ['rolId', 'tipo', 'permisoPrimario', 'permisoSecundario', 'permitido'],
    })

    const permisosJSON = {}
    permisos.map(permiso => {
      let data = permiso.dataValues;

      if(!permisosJSON[data.tipo]){
        permisosJSON[data.tipo] = {}
      }

      if(!permisosJSON[data.tipo][data.permisoPrimario]){
        permisosJSON[data.tipo][data.permisoPrimario] = {}
      }

      permisosJSON[data.tipo][data.permisoPrimario][data.permisoSecundario] = data.permitido;

      return permiso;
    });
    return permisosJSON;
  } catch (error) {
    throw error
  }
}
