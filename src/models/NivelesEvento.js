import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Evento from './Evento.js';
import Nivel from './Nivel.js';

class NivelEvento extends Model {}

NivelEvento.init(
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
    nivelId: {
      type: DataTypes.INTEGER,
      references: {
        model: Nivel,
        key: 'id'
      }
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
    modelName: 'NivelEvento',
    tableName: 'niveleseventos'
  },
);

NivelEvento.belongsTo(Evento, {foreignKey: 'eventoId'});
NivelEvento.belongsTo(Nivel, {as: 'nivel', foreignKey: 'nivelId'});

export default NivelEvento;