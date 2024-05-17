import GeneralConfig from '../models/GeneralConfig.js';
import { decodeToken } from '../utils/jwtDecoder.js';

export const uploadConfigs = async (req, res) => {
  const {values} = req.body;
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al modificar configuración. ' + auth.payload });
    const configsJSON = JSON.parse(values)
    //Agregar lista de persmisos al rol base
    for(let config in configsJSON){
      const [configLine, created] = await GeneralConfig.findOrCreate({
        where: {
          attributeKey: config,
        },
        defaults: {
          attributeValue: configsJSON[config]
        }
      })
      if(!created){
        configLine.update({
          attributeValue: configsJSON[config]
        })
      }
    }
    res.json(configsJSON);
  } catch (error) {
    throw error;
  }
}

export const getGeneralConfig = async (req, res) => {
  try {
    const auth = decodeToken(req.headers['authorization']);
    if(auth.code !== 200) return res.status(auth.code).json({ error: 'Error al obtener configuración. ' + auth.payload });

    const config = await GeneralConfig.findAll({
      attributes: ['attributeKey', 'attributeValue'],
    })

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración: ' + error });
  }
}
