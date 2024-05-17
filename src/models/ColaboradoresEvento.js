import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Componente from './Componente.js';
import Evento from './Evento.js';
import Usuario from './Usuario.js';

class ColaboradorEvento extends Model {}

ColaboradorEvento.init(
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
    colaboradorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
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
    modelName: 'ColaboradorEvento',
    tableName: 'colaboradoreseventos'
  },
);

ColaboradorEvento.belongsTo(Evento, {foreignKey: 'eventoId'});
ColaboradorEvento.belongsTo(Usuario, {as: 'colaborador', foreignKey: 'colaboradorId'});

export default ColaboradorEvento;