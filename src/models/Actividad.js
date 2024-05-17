import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Resultado from './Resultado.js';
import SubResultado from './SubResultado.js';

class Actividad extends Model {}

Actividad.init(
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
    subresultadoId: {
      type: DataTypes.INTEGER,
      references: {
        model: SubResultado,
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
    modelName: 'Actividad',
    tableName: 'Actividades'
  },
);

Actividad.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
Actividad.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
Actividad.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });
Actividad.belongsTo(Resultado, { as: 'resultado', foreignKey: 'resultadoId' });
Actividad.belongsTo(SubResultado, { as: 'subresultado', foreignKey: 'subresultadoId' });

export default Actividad;