import express from "express";
import multer from "multer";
import { createAreaTematica, editAreaTematica, getAreaTematicaById, getAreasTematicasList, getPagedAreasTematicas, hideAreaTematica } from "../controllers/areasTematicasController.js";

const upload = new multer();
const areasTematicasRouter = express.Router();

//Get Paged
areasTematicasRouter.post('/paged', upload.any(), getPagedAreasTematicas);

//Get List
areasTematicasRouter.post('/list', upload.any(), getAreasTematicasList);

//Get By Id
areasTematicasRouter.get('/id/:id', getAreaTematicaById);

//Create
areasTematicasRouter.post('/', upload.any(), createAreaTematica);

//Update
areasTematicasRouter.put('/', upload.any(), editAreaTematica);

//Ocultar
areasTematicasRouter.delete('/', upload.any(), hideAreaTematica);

export default areasTematicasRouter;