import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Rol from './Rol.js';

class PermisoRol extends Model {}

PermisoRol.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rolId: {
      type: DataTypes.INTEGER,
      references: {
        model: Rol,
        key: 'id'
      }
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permisoPrimario: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permisoSecundario: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permitido: {
      type: DataTypes.BOOLEAN,
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
    modelName: 'PermisoRol',
    tableName: 'permisosRoles'
  },
);

PermisoRol.belongsTo(Rol, {foreignKey: 'rolId'});

export default PermisoRol;