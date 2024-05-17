import express from "express";
import multer from "multer";
import { deleteFile, getFile, postFile } from "../controllers/files-controller.js";

const upload = new multer();
const filesRouter = express.Router();

//Get tablero
filesRouter.post('/', upload.any(), getFile);

//Create
filesRouter.put('/', upload.any(), postFile);

//Finalizar
filesRouter.delete('/', upload.any(), deleteFile);

export default filesRouter;