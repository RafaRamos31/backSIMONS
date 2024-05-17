import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Componente from './Componente.js';
import Evento from './Evento.js';

class ComponenteEvento extends Model {}

ComponenteEvento.init(
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
    modelName: 'ComponenteEvento',
    tableName: 'componenteseventos'
  },
);

ComponenteEvento.belongsTo(Evento, {foreignKey: 'eventoId'});
ComponenteEvento.belongsTo(Componente, {as: 'componente', foreignKey: 'componenteId'});

export default ComponenteEvento;