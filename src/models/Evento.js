import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Componente from './Componente.js';
import TipoEvento from './TipoEvento.js';
import Tarea from './Tarea.js';
import Departamento from './Departamento.js';
import Municipio from './Municipio.js';
import Aldea from './Aldea.js';
import Caserio from './Caserio.js';
import Quarter from './Quarter.js';
import AreaTematica from './AreaTematica.js';

class Evento extends Model {}

Evento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tareaId: {
      type: DataTypes.INTEGER,
      references: {
        model: Tarea,
        key: 'id'
      }
    },
    componenteEncargadoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Componente,
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
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    areaTematicaId: {
      type: DataTypes.INTEGER,
      references: {
        model: AreaTematica,
        key: 'id'
      }
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFinal: {
      type: DataTypes.DATE,
      allowNull: false,
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
    aldeaId: {
      type: DataTypes.INTEGER,
      references: {
        model: Aldea,
        key: 'id'
      }
    },
    caserioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Caserio,
        key: 'id'
      }
    },
    organizadorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaCreacion: {
      type: DataTypes.DATE
    },
    responsableCreacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    //Finalizacion
    numeroFormulario: {
      type: DataTypes.STRING,
    },
    participantesHombres: {
      type: DataTypes.NUMBER,
    },
    participantesMujeres: {
      type: DataTypes.NUMBER,
    },
    participantesComunitarios: {
      type: DataTypes.NUMBER,
    },
    participantesInstitucionales: {
      type: DataTypes.NUMBER,
    },
    totalDias: {
      type: DataTypes.NUMBER,
    },
    totalHoras: {
      type: DataTypes.NUMBER,
    },
    tipoEventoId: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoEvento,
        key: 'id'
      }
    },
    logros: {
      type: DataTypes.STRING,
    },
    compromisos: {
      type: DataTypes.STRING,
    },
    enlaceFormulario: {
      type: DataTypes.STRING,
    },
    enlaceFotografias: {
      type: DataTypes.STRING,
    },
    estadoRealizacion: {
      type: DataTypes.STRING,
    },
    responsableFinalizacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaFinalizacionEvento: {
      type: DataTypes.DATE
    },
    estadoRevisionFinalizacion: {
      type: DataTypes.STRING,
    },
    revisorFinalizacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaRevisionFinalizacion: {
      type: DataTypes.DATE
    },
    observacionesFinalizacion: {
      type: DataTypes.STRING,
    },
    //Digitacion
    registradosHombres: {
      type: DataTypes.NUMBER,
    },
    registradosMujeres: {
      type: DataTypes.NUMBER,
    },
    registradosComunitarios: {
      type: DataTypes.NUMBER,
    },
    registradosInstitucionales: {
      type: DataTypes.NUMBER,
    },
    estadoDigitacion: {
      type: DataTypes.STRING,
    },
    responsableDigitacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaDigitacion: {
      type: DataTypes.DATE
    },
    estadoRevisionDigitacion: {
      type: DataTypes.STRING,
    },
    revisorDigitacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaRevisionDigitacion: {
      type: DataTypes.DATE
    },
    observacionesDigitacion: {
      type: DataTypes.STRING,
    },
    //Consolidado
    estadoConsolidado: {
      type: DataTypes.STRING,
    },
    responsableConsolidadoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaConsolidado: {
      type: DataTypes.DATE
    },
    //System
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
    modelName: 'Evento',
    tableName: 'eventos'
  },
);

Evento.belongsTo(Tarea, { as: 'tarea', foreignKey: 'tareaId' });
Evento.belongsTo(Componente, { as: 'componenteEncargado', foreignKey: 'componenteEncargadoId' });
Evento.belongsTo(Quarter, { as: 'quarter', foreignKey: 'quarterId' });
Evento.belongsTo(AreaTematica, { as: 'areaTematica', foreignKey: 'areaTematicaId' });
Evento.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamentoId' });
Evento.belongsTo(Municipio, { as: 'municipio', foreignKey: 'municipioId' });
Evento.belongsTo(Aldea, { as: 'aldea', foreignKey: 'aldeaId' });
Evento.belongsTo(Caserio, { as: 'caserio', foreignKey: 'caserioId' });
Evento.belongsTo(Usuario, { as: 'organizador', foreignKey: 'organizadorId' });
Evento.belongsTo(Usuario, { as: 'responsableCreacion', foreignKey: 'responsableCreacionId' });
Evento.belongsTo(TipoEvento, { as: 'tipoEvento', foreignKey: 'tipoEventoId' });
Evento.belongsTo(Usuario, { as: 'responsableFinalizacion', foreignKey: 'responsableFinalizacionId' });
Evento.belongsTo(Usuario, { as: 'revisorFinalizacion', foreignKey: 'revisorFinalizacionId' });
Evento.belongsTo(Usuario, { as: 'responsableDigitacion', foreignKey: 'responsableDigitacionId' });
Evento.belongsTo(Usuario, { as: 'revisorDigitacion', foreignKey: 'revisorDigitacionId' });
Evento.belongsTo(Usuario, { as: 'responsableConsolidado', foreignKey: 'responsableConsolidadoId' });

export default Evento;