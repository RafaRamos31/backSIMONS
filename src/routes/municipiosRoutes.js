import express from "express";
import multer from "multer";
import { createMunicipio, editMunicipio, getMunicipioById, getMunicipiosList, getPagedMunicipios, hideMunicipio } from "../controllers/municipioController.js";

const upload = new multer();
const municipiosRouter = express.Router();

//Get Paged
municipiosRouter.post('/paged', upload.any(), getPagedMunicipios);

//Get List
municipiosRouter.post('/list', upload.any(), getMunicipiosList);

//Get By Id
municipiosRouter.get('/id/:id', getMunicipioById);

//Create
municipiosRouter.post('/', upload.any(), createMunicipio);

//Update
municipiosRouter.put('/', upload.any(), editMunicipio);

//Ocultar
municipiosRouter.delete('/', upload.any(), hideMunicipio);

export default municipiosRouter;