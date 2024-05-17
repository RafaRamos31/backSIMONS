import express from "express";
import multer from "multer";
import { createCargo, editCargo, getCargoById, getCargosList, getPagedCargos, hideCargo } from "../controllers/cargosController.js";

const upload = new multer();
const cargosRouter = express.Router();

//Get Paged
cargosRouter.post('/paged', upload.any(), getPagedCargos);

//Get List
cargosRouter.post('/list', upload.any(), getCargosList);

//Get By Id
cargosRouter.get('/id/:id', getCargoById);

//Create
cargosRouter.post('/', upload.any(), createCargo);

//Update
cargosRouter.put('/', upload.any(), editCargo);

//Ocultar
cargosRouter.delete('/', upload.any(), hideCargo);

export default cargosRouter;