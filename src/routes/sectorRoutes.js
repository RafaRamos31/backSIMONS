import express from "express";
import multer from "multer";
import { createSector, editSector, getPagedSectores, getSectorById, getSectoresList, hideSector } from "../controllers/sectoresController.js";

const upload = new multer();
const sectoresRouter = express.Router();

//Get Paged
sectoresRouter.post('/paged', upload.any(), getPagedSectores);

//Get List
sectoresRouter.post('/list', upload.any(), getSectoresList);

//Get By Id
sectoresRouter.get('/id/:id', getSectorById);

//Create
sectoresRouter.post('/', upload.any(), createSector);

//Update
sectoresRouter.put('/', upload.any(), editSector);

//Ocultar
sectoresRouter.delete('/', upload.any(), hideSector);

export default sectoresRouter;