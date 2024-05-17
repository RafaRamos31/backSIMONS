import express from "express";
import multer from "multer";
import { createSubResultado, editSubResultado, getPagedSubResultados, getSubResultadoById, getSubResultadosList, hideSubResultado } from "../controllers/subresultadosController.js";

const upload = new multer();
const subresultadosRouter = express.Router();

//Get Paged
subresultadosRouter.post('/paged', upload.any(), getPagedSubResultados);

//Get List
subresultadosRouter.post('/list', upload.any(), getSubResultadosList);

//Get By Id
subresultadosRouter.get('/id/:id', getSubResultadoById);

//Create
subresultadosRouter.post('/', upload.any(), createSubResultado);

//Update
subresultadosRouter.put('/', upload.any(), editSubResultado);

//Ocultar
subresultadosRouter.delete('/', upload.any(), hideSubResultado);

export default subresultadosRouter;