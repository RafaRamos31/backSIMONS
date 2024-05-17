import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import SubActividad from './SubActividad.js';
import Componente from './Componente.js';

class ComponenteSubActividad extends Model {}

ComponenteSubActividad.init(
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
    componenteId: {
      type: DataTypes.INTEGER,
      references: {
        model: Componente,
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
    modelName: 'ComponenteSubActividad',
    tableName: 'componentessubactividades'
  },
);

ComponenteSubActividad.belongsTo(SubActividad, {foreignKey: 'subactividadId'});
ComponenteSubActividad.belongsTo(Componente, {as: 'componente', foreignKey: 'componenteId'});

export default ComponenteSubActividad;