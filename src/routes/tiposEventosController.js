import express from "express";
import multer from "multer";
import { createTipoEvento, editTipoEvento, getPagedTiposEventos, getTipoEventoById, getTiposEventosList, hideTipoEvento } from "../controllers/tiposEventosController.js";

const upload = new multer();
const tiposEventosRouter = express.Router();

//Get Paged
tiposEventosRouter.post('/paged', upload.any(), getPagedTiposEventos);

//Get List
tiposEventosRouter.post('/list', upload.any(), getTiposEventosList);

//Get By Id
tiposEventosRouter.get('/id/:id', getTipoEventoById);

//Create
tiposEventosRouter.post('/', upload.any(), createTipoEvento);

//Update
tiposEventosRouter.put('/', upload.any(), editTipoEvento);

//Ocultar
tiposEventosRouter.delete('/', upload.any(), hideTipoEvento);

export default tiposEventosRouter;