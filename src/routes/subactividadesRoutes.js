import express from "express";
import multer from "multer";
import { createSubActividad, editSubActividad, getASubActividadesList, getASubActividadesListComponente, getPagedSubActividades, getSubActividadById, hideSubActividad } from "../controllers/subactividadesController.js";

const upload = new multer();
const subactividadesRouter = express.Router();

//Get Paged
subactividadesRouter.post('/paged', upload.any(), getPagedSubActividades);

//Get List
subactividadesRouter.post('/list', upload.any(), getASubActividadesList);

//Get List componente
subactividadesRouter.post('/componente/:id', upload.any(), getASubActividadesListComponente);

//Get By Id
subactividadesRouter.get('/id/:id', getSubActividadById);

//Create
subactividadesRouter.post('/', upload.any(), createSubActividad);

//Update
subactividadesRouter.put('/', upload.any(), editSubActividad);

//Ocultar
subactividadesRouter.delete('/', upload.any(), hideSubActividad);

export default subactividadesRouter;