import express from "express";
import multer from "multer";
import { createTipoOrganizacion, editTipoOrganizacion, getPagedTiposOrganizacion, getTipoOrganizacionById, getTiposOrganizacionesList, hideTipoOrganizacion } from "../controllers/tiposOrganizacionController.js";

const upload = new multer();
const tiposOrganizacionesRouter = express.Router();

//Get Paged
tiposOrganizacionesRouter.post('/paged', upload.any(), getPagedTiposOrganizacion);

//Get List
tiposOrganizacionesRouter.post('/list', upload.any(), getTiposOrganizacionesList);

//Get By Id
tiposOrganizacionesRouter.get('/id/:id', getTipoOrganizacionById);

//Create
tiposOrganizacionesRouter.post('/', upload.any(), createTipoOrganizacion);

//Update
tiposOrganizacionesRouter.put('/', upload.any(), editTipoOrganizacion);

//Ocultar
tiposOrganizacionesRouter.delete('/', upload.any(), hideTipoOrganizacion);

export default tiposOrganizacionesRouter;