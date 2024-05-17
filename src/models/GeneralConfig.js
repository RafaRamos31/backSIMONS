import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';

class GeneralConfig extends Model {}

GeneralConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    attributeKey: {
      type: DataTypes.STRING,
      allowNull: false
    },
    attributeValue: {
      type: DataTypes.STRING,
      allowNull: false
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
    modelName: 'GeneralConfig',
    tableName: 'generalconfigs'
  },
);

export default GeneralConfig;