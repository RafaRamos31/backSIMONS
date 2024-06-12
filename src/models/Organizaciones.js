import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Sector from './Sector.js';
import TipoOrganizacion from './TipoOrganizacion.js';
import Departamento from './Departamento.js';
import Municipio from './Municipio.js';

class Organizacion extends Model {}

Organizacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codigo: {
      type: DataTypes.STRING,
    },
    sectorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Sector,
        key: 'id'
      },
    },
    tipoOrganizacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoOrganizacion,
        key: 'id'
      },
    },
    tipoSector: {
      type: DataTypes.STRING,
    },
    telefono: {
      type: DataTypes.STRING,
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Departamento,
        key: 'id'
      }
    },
    municipioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Municipio,
        key: 'id'
      }
    },
    nombreContacto: {
      type: DataTypes.STRING,
    },
    telefonoContacto: {
      type: DataTypes.STRING,
    },
    correoContacto: {
      type: DataTypes.STRING,
    },
    originalId: {
      type: DataTypes.INTEGER,
      references: {
        model: Organizacion,
        key: 'id'
      }
    },
    version: {
      type: DataTypes.STRING,
    },
    ultimaRevision: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.STRING,
    },
    fechaEdicion: {
      type: DataTypes.DATE
    },
    editorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaRevision: {
      type: DataTypes.DATE
    },
    revisorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaEliminacion: {
      type: DataTypes.DATE
    },
    eliminadorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    observaciones: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  },  
  {
    sequelize, 
    modelName: 'Organizacion',
    tableName: 'organizaciones'
  },
);

Organizacion.belongsTo(Sector, { as: 'sector', foreignKey: 'sectorId' });
Organizacion.belongsTo(TipoOrganizacion, { as: 'tipoOrganizacion', foreignKey: 'tipoOrganizacionId' });
Organizacion.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamentoId' });
Organizacion.belongsTo(Municipio, { as: 'municipio', foreignKey: 'municipioId' });
Organizacion.belongsTo(Organizacion, {foreignKey: 'originalId'});
Organizacion.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
Organizacion.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
Organizacion.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });

export default Organizacion;