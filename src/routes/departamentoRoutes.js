import express from "express";
import multer from "multer";
import { createDepartamento, editDepartamento, getDepartamentoById, getDepartamentosList, getPagedDepartamentos, hideDepartamento } from "../controllers/departamentoController.js";

const upload = new multer();
const departamentoRouter = express.Router();

//Get Paged
departamentoRouter.post('/paged', upload.any(), getPagedDepartamentos);

//Get List
departamentoRouter.post('/list', upload.any(), getDepartamentosList);

//Get By Id
departamentoRouter.get('/id/:id', getDepartamentoById);

//Create
departamentoRouter.post('/', upload.any(), createDepartamento);

//Update
departamentoRouter.put('/', upload.any(), editDepartamento);

//Ocultar
departamentoRouter.delete('/', upload.any(), hideDepartamento);

export default departamentoRouter;