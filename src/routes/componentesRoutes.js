import express from "express";
import multer from "multer";
import { createComponente, editComponente, getComponenteById, getComponentesList, getPagedComponentes, hideComponente } from "../controllers/componentesController.js";

const upload = new multer();
const componentesRoutes = express.Router();

//Get Paged
componentesRoutes.post('/paged', upload.any(), getPagedComponentes);

//Get List
componentesRoutes.post('/list', upload.any(), getComponentesList);

//Get By Id
componentesRoutes.get('/id/:id', getComponenteById);

//Create
componentesRoutes.post('/', upload.any(), createComponente);

//Update
componentesRoutes.put('/', upload.any(), editComponente);

//Ocultar
componentesRoutes.delete('/', upload.any(), hideComponente);

export default componentesRoutes;