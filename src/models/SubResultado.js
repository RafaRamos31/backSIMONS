import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Resultado from './Resultado.js';

class SubResultado extends Model {}

SubResultado.init(
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
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resultadoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Resultado,
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
    modelName: 'SubResultado',
    tableName: 'subresultados'
  },
);

SubResultado.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
SubResultado.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
SubResultado.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });
SubResultado.belongsTo(Resultado, { as: 'resultado', foreignKey: 'resultadoId' });

export default SubResultado;