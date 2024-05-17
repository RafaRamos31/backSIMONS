import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';

class TipoEvento extends Model {}

TipoEvento.init(
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
    modelName: 'TipoEvento',
    tableName: 'TiposEventos'
  },
);

TipoEvento.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
TipoEvento.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
TipoEvento.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });

export default TipoEvento;