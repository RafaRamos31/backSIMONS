import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Resultado from './Resultado.js';
import SubResultado from './SubResultado.js';
import Actividad from './Actividad.js';
import Componente from './Componente.js';
import Year from './Year.js';
import Quarter from './Quarter.js';
import TipoEvento from './TipoEvento.js';
import SubActividad from './SubActividad.js';

class Tarea extends Model {}

Tarea.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    componenteId: {
      type: DataTypes.INTEGER,
      references: {
        model: Componente,
        key: 'id'
      }
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
    subactividadId: {
      type: DataTypes.INTEGER,
      references: {
        model: SubActividad,
        key: 'id'
      }
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    yearId: {
      type: DataTypes.INTEGER,
      references: {
        model: Year,
        key: 'id'
      }
    },
    quarterId: {
      type: DataTypes.INTEGER,
      references: {
        model: Quarter,
        key: 'id'
      }
    },
    lugar: {
      type: DataTypes.STRING,
    },
    tipoEventoId: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoEvento,
        key: 'id'
      }
    },
    gastosEstimados: {
      type: DataTypes.NUMBER,
    },
    gastosRealizados: {
      type: DataTypes.NUMBER,
      defaultValue: 0
    },
    eventosEstimados: {
      type: DataTypes.NUMBER,
    },
    eventosRealizados: {
      type: DataTypes.NUMBER,
      defaultValue: 0
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
    modelName: 'Tarea',
    tableName: 'tareas'
  },
);

Tarea.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
Tarea.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
Tarea.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });
Tarea.belongsTo(Resultado, { as: 'resultado', foreignKey: 'resultadoId' });
Tarea.belongsTo(SubResultado, { as: 'subresultado', foreignKey: 'subresultadoId' });
Tarea.belongsTo(Actividad, { as: 'actividad', foreignKey: 'actividadId' });
Tarea.belongsTo(SubActividad, { as: 'subactividad', foreignKey: 'subactividadId' });
Tarea.belongsTo(Componente, { as: 'componente', foreignKey: 'componenteId' });
Tarea.belongsTo(Year, { as: 'year', foreignKey: 'yearId' });
Tarea.belongsTo(Quarter, { as: 'quarter', foreignKey: 'quarterId' });
Tarea.belongsTo(TipoEvento, { as: 'tipoEvento', foreignKey: 'tipoEventoId' });

export default Tarea;