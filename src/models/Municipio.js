import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Departamento from './Departamento.js';

class Municipio extends Model {}

Municipio.init(
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
    geocode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 4]
      }
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Departamento,
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
    modelName: 'Municipio',
  },
);

Municipio.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
Municipio.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
Municipio.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });
Municipio.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamentoId' });

export default Municipio;