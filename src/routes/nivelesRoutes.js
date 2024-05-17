import express from "express";
import multer from "multer";
import { createTipoEvento, editTipoEvento, getPagedTiposEventos, getTipoEventoById, getTiposEventosList, hideTipoEvento } from "../controllers/tiposEventosController.js";
import { createNivel, editNivel, getNivelById, getNivelesList, getPagedNiveles, hideNivel } from "../controllers/nivelesController.js";

const upload = new multer();
const nivelesRouter = express.Router();

//Get Paged
nivelesRouter.post('/paged', upload.any(), getPagedNiveles);

//Get List
nivelesRouter.post('/list', upload.any(), getNivelesList);

//Get By Id
nivelesRouter.get('/id/:id', getNivelById);

//Create
nivelesRouter.post('/', upload.any(), createNivel);

//Update
nivelesRouter.put('/', upload.any(), editNivel);

//Ocultar
nivelesRouter.delete('/', upload.any(), hideNivel);

export default nivelesRouter;