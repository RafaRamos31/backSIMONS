import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Evento from './Evento.js';
import Beneficiario from './Beneficiario.js';

class ParticipanteEvento extends Model {}

ParticipanteEvento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    eventoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Evento,
        key: 'id'
      }
    },
    participanteId: {
      type: DataTypes.INTEGER,
      references: {
        model: Beneficiario,
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.STRING,
    },
    indicadorSeleccionadoId: {
      type: DataTypes.INTEGER,
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
    modelName: 'ParticipanteEvento',
    tableName: 'participanteseventos'
  },
);

ParticipanteEvento.belongsTo(Evento, {foreignKey: 'eventoId'});
ParticipanteEvento.belongsTo(Beneficiario, {as: 'participante', foreignKey: 'participanteId'});

export default ParticipanteEvento;