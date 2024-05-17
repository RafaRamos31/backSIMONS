import express from "express";
import multer from "multer";
import { createAldea, editAldea, getAldeaById, getAldeasList, getPagedAldeas, hideAldea } from "../controllers/aldeasController.js";

const upload = new multer();
const aldeasRouter = express.Router();

//Get Paged
aldeasRouter.post('/paged', upload.any(), getPagedAldeas);

//Get List
aldeasRouter.post('/list', upload.any(), getAldeasList);

//Get By Id
aldeasRouter.get('/id/:id', getAldeaById);

//Create
aldeasRouter.post('/', upload.any(), createAldea);

//Update
aldeasRouter.put('/', upload.any(), editAldea);

//Ocultar
aldeasRouter.delete('/', upload.any(), hideAldea);

export default aldeasRouter;