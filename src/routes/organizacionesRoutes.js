import express from "express";
import multer from "multer";
import { createOrganizacion, editOrganizacion, getOrganizacionById, getOrganizacionesList, getPagedOrganizaciones, getRevisionesOrganizacion, hideOrganizacion, reviewOrganizacion } from "../controllers/organizacionesController.js";

const upload = new multer();
const organizacionesRouter = express.Router();

//Get Paged
organizacionesRouter.post('/paged', upload.any(), getPagedOrganizaciones);

//Get List
organizacionesRouter.post('/list', upload.any(), getOrganizacionesList);

//Get By Id
organizacionesRouter.get('/id/:id', getOrganizacionById);

//Get Revisiones
organizacionesRouter.get('/revisiones/:id', getRevisionesOrganizacion);

//Create
organizacionesRouter.post('/', upload.any(), createOrganizacion);

//Update
organizacionesRouter.put('/', upload.any(), editOrganizacion);

//Revisar
organizacionesRouter.put('/revisar', upload.any(), reviewOrganizacion);

//Ocultar
organizacionesRouter.delete('/', upload.any(), hideOrganizacion);

export default organizacionesRouter;