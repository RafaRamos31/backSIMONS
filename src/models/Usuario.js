import sequelize from '../config/db.js';
import { DataTypes, Model } from 'sequelize';
import Componente from './Componente.js';
import Rol from './Rol.js';

class Usuario extends Model {}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    componenteId: {
      type: DataTypes.INTEGER,
      references: {
        model: Componente,
        key: 'id'
      }
    },
    rolId: {
      type: DataTypes.INTEGER,
      references: {
        model: Rol,
        key: 'id'
      }
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'Usuario',
  },
);

Usuario.belongsTo(Componente, {as: 'componente', foreignKey: 'componenteId'});
Usuario.belongsTo(Rol, {as: 'rol', foreignKey: 'rolId'});
Usuario.belongsTo(Usuario, { as: 'editor', foreignKey: 'editorId' });
Usuario.belongsTo(Usuario, { as: 'revisor', foreignKey: 'revisorId' });
Usuario.belongsTo(Usuario, { as: 'eliminador', foreignKey: 'eliminadorId' });

export default Usuario;