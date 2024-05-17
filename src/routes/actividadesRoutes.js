import express from "express";
import multer from "multer";
import { createActividad, editActividad, getActividadById, getActividadesList, getPagedActividades, hideActividad } from "../controllers/actividadesController.js";

const upload = new multer();
const actividadesRouter = express.Router();

//Get Paged
actividadesRouter.post('/paged', upload.any(), getPagedActividades);

//Get List
actividadesRouter.post('/list', upload.any(), getActividadesList);

//Get By Id
actividadesRouter.get('/id/:id', getActividadById);

//Create
actividadesRouter.post('/', upload.any(), createActividad);

//Update
actividadesRouter.put('/', upload.any(), editActividad);

//Ocultar
actividadesRouter.delete('/', upload.any(), hideActividad);

export default actividadesRouter;