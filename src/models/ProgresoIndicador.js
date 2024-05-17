import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Indicador from './Indicador.js';

class ProgresoIndicador extends Model {}

ProgresoIndicador.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    indicadorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Indicador,
        key: 'id'
      }
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quarter: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    progreso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    modelName: 'ProgresoIndicador',
    tableName: 'progresosindicadores'
  },
);

ProgresoIndicador.belongsTo(Indicador, {as: 'indicador', foreignKey: 'indicadorId'});

export default ProgresoIndicador;