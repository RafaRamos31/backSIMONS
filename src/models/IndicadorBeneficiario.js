import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Beneficiario from './Beneficiario.js';
import Year from './Year.js';
import Indicador from './Indicador.js';

class IndicadorBeneficiario extends Model {}

IndicadorBeneficiario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    beneficiarioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Beneficiario,
        key: 'id'
      }
    },
    yearId: {
      type: DataTypes.INTEGER,
      references: {
        model: Year,
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
    modelName: 'IndicadorBeneficiario',
    tableName: 'indicadoresbeneficiarios'
  },
);

IndicadorBeneficiario.belongsTo(Beneficiario, {foreignKey: 'beneficiarioId'});
IndicadorBeneficiario.belongsTo(Year, {as: 'year', foreignKey: 'yearId'});
IndicadorBeneficiario.belongsTo(Indicador, {as: 'indicador', foreignKey: 'indicadorId'});

export default IndicadorBeneficiario;