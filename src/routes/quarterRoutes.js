import express from "express";
import multer from "multer";
import { createQuarter, editQuarter, getPagedQuarters, getQuarterById, getQuartersList, hideQuarter } from "../controllers/quarterController.js";

const upload = new multer();
const quartersRouter = express.Router();

//Get Paged
quartersRouter.post('/paged', upload.any(), getPagedQuarters);

//Get List
quartersRouter.post('/list', upload.any(), getQuartersList);

//Get By Id
quartersRouter.get('/id/:id', getQuarterById);

//Create
quartersRouter.post('/', upload.any(), createQuarter);

//Update
quartersRouter.put('/', upload.any(), editQuarter);

//Ocultar
quartersRouter.delete('/', upload.any(), hideQuarter);

export default quartersRouter;