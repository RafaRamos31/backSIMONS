import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Resultado from './Resultado.js';
import SubResultado from './SubResultado.js';
import Actividad from './Actividad.js';

class SubActividad extends Model {}

SubActividad.init(
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
    actividadId: {
      type: DataTypes.INTEGER,
      references: {
        model: Actividad,
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
    modelName: 'SubActividad',
    tableName: 'subactividades'
  },
);

SubActividad.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
SubActividad.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
SubActividad.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });
SubActividad.belongsTo(Resultado, { as: 'resultado', foreignKey: 'resultadoId' });
SubActividad.belongsTo(SubResultado, { as: 'subresultado', foreignKey: 'subresultadoId' });
SubActividad.belongsTo(Actividad, { as: 'actividad', foreignKey: 'actividadId' });

export default SubActividad;