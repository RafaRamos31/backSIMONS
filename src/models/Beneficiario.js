import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Usuario from './Usuario.js';
import Sector from './Sector.js';
import TipoOrganizacion from './TipoOrganizacion.js';
import Departamento from './Departamento.js';
import Municipio from './Municipio.js';
import Aldea from './Aldea.js';
import Caserio from './Caserio.js';
import Organizacion from './Organizaciones.js';
import Cargo from './Cargo.js';

class Beneficiario extends Model {}

Beneficiario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
    },
    dni: {
      type: DataTypes.STRING,
    },
    sexo: {
      type: DataTypes.STRING,
    },
    fechaNacimiento: {
      type: DataTypes.DATE
    },
    telefono: {
      type: DataTypes.STRING,
    },
    tipoBeneficiario: {
      type: DataTypes.STRING,
    },
    sectorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Sector,
        key: 'id'
      }
    },
    tipoOrganizacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: TipoOrganizacion,
        key: 'id'
      }
    },
    organizacionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Organizacion,
        key: 'id'
      }
    },
    cargoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Cargo,
        key: 'id'
      }
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      references: {
        model: Departamento,
        key: 'id'
      }
    },
    municipioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Municipio,
        key: 'id'
      }
    },
    aldeaId: {
      type: DataTypes.INTEGER,
      references: {
        model: Aldea,
        key: 'id'
      }
    },
    caserioId: {
      type: DataTypes.INTEGER,
      references: {
        model: Caserio,
        key: 'id'
      }
    },
    originalId: {
      type: DataTypes.INTEGER,
      references: {
        model: Beneficiario,
        key: 'id'
      }
    },
    version: {
      type: DataTypes.STRING,
    },
    ultimaRevision: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.STRING,
    },
    fechaEdicion: {
      type: DataTypes.DATE
    },
    editorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaRevision: {
      type: DataTypes.DATE
    },
    revisorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    fechaEliminacion: {
      type: DataTypes.DATE
    },
    eliminadorId: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    observaciones: {
      type: DataTypes.STRING,
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
    modelName: 'Beneficiario'
  },
);

Beneficiario.belongsTo(Sector, { as: 'sector', foreignKey: 'sectorId' });
Beneficiario.belongsTo(TipoOrganizacion, { as: 'tipoOrganizacion', foreignKey: 'tipoOrganizacionId' });
Beneficiario.belongsTo(Organizacion, { as: 'organizacion', foreignKey: 'organizacionId' });
Beneficiario.belongsTo(Cargo, { as: 'cargo', foreignKey: 'cargoId' });
Beneficiario.belongsTo(Departamento, { as: 'departamento', foreignKey: 'departamentoId' });
Beneficiario.belongsTo(Municipio, { as: 'municipio', foreignKey: 'municipioId' });
Beneficiario.belongsTo(Aldea, { as: 'aldea', foreignKey: 'aldeaId' });
Beneficiario.belongsTo(Caserio, { as: 'caserio', foreignKey: 'caserioId' });
Beneficiario.belongsTo(Beneficiario, {foreignKey: 'originalId'});
Beneficiario.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
Beneficiario.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
Beneficiario.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });

export default Beneficiario;