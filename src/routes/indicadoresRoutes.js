import express from "express";
import multer from "multer";
import { createIndicador, editIndicador, getIndicadorById, getIndicadoresList, getPagedIndicador, hideIndicador } from "../controllers/indicadoresController.js";

const upload = new multer();
const indicadoresRouter = express.Router();

//Get Paged
indicadoresRouter.post('/paged', upload.any(), getPagedIndicador);

//Get List
indicadoresRouter.post('/list', upload.any(), getIndicadoresList);

//Get By Id
indicadoresRouter.get('/id/:id', getIndicadorById);

//Create
indicadoresRouter.post('/', upload.any(), createIndicador);

//Update
indicadoresRouter.put('/', upload.any(), editIndicador);

//Ocultar
indicadoresRouter.delete('/', upload.any(), hideIndicador);

export default indicadoresRouter;