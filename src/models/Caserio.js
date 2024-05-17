import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Departamento from './Departamento.js';
import Municipio from './Municipio.js';
import Aldea from './Aldea.js';

class Caserio extends Model {}

Caserio.init(
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
        len: [9, 9]
      }
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
    modelName: 'Caserio',
  },
);

Caserio.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
Caserio.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
Caserio.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });
Caserio.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamentoId' });
Caserio.belongsTo(Municipio, { as: 'municipio', foreignKey: 'municipioId' });
Caserio.belongsTo(Aldea, { as: 'aldea', foreignKey: 'aldeaId' });

export default Caserio;