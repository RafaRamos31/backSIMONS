import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Evento from './Evento.js';
import Sector from './Sector.js';

class SectorEvento extends Model {}

SectorEvento.init(
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
    sectorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Sector,
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
    modelName: 'SectorEvento',
    tableName: 'sectoreseventos'
  },
);

SectorEvento.belongsTo(Evento, {foreignKey: 'eventoId'});
SectorEvento.belongsTo(Sector, {as: 'sector', foreignKey: 'sectorId'});

export default SectorEvento;