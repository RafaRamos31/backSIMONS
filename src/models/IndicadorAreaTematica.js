import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import AreaTematica from './AreaTematica.js';
import Indicador from './Indicador.js';

class IndicadorAreaTematica extends Model {}

IndicadorAreaTematica.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    areaTematicaId: {
      type: DataTypes.INTEGER,
      references: {
        model: AreaTematica,
        key: 'id'
      }
    },
    indicadorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Indicador,
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
    modelName: 'IndicadorAreaTematica',
    tableName: 'indicadoresareastematicas'
  },
);

IndicadorAreaTematica.belongsTo(AreaTematica, {foreignKey: 'areaTematicaId'});
IndicadorAreaTematica.belongsTo(Indicador, {as: 'indicador', foreignKey: 'indicadorId'});

export default IndicadorAreaTematica;