import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';

//Se obtienen las variables de entorno
dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE, 
  process.env.DB_USERNAME, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false
  }
);

export default sequelize;
