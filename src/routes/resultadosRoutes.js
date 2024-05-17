import express from "express";
import multer from "multer";
import { createResultado, editResultado, getPagedResultados, getResultadoById, getResultadosList, hideResultado } from "../controllers/resultadosController.js";

const upload = new multer();
const resultadosRouter = express.Router();

//Get Paged
resultadosRouter.post('/paged', upload.any(), getPagedResultados);

//Get List
resultadosRouter.post('/list', upload.any(), getResultadosList);

//Get By Id
resultadosRouter.get('/id/:id', getResultadoById);

//Create
resultadosRouter.post('/', upload.any(), createResultado);

//Update
resultadosRouter.put('/', upload.any(), editResultado);

//Ocultar
resultadosRouter.delete('/', upload.any(), hideResultado);

export default resultadosRouter;