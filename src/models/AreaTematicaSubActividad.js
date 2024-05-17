import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import SubActividad from './SubActividad.js';
import AreaTematica from './AreaTematica.js';

class AreaTematicaSubActividad extends Model {}

AreaTematicaSubActividad.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    subactividadId: {
      type: DataTypes.INTEGER,
      references: {
        model: SubActividad,
        key: 'id'
      }
    },
    areaTematicaId: {
      type: DataTypes.INTEGER,
      references: {
        model: AreaTematica,
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
    modelName: 'AreaTematicaSubActividad',
    tableName: 'areastematicassubactividades'
  },
);

AreaTematicaSubActividad.belongsTo(SubActividad, {foreignKey: 'subactividadId'});
AreaTematicaSubActividad.belongsTo(AreaTematica, {as: 'areaTematica', foreignKey: 'areaTematicaId'});

export default AreaTematicaSubActividad;