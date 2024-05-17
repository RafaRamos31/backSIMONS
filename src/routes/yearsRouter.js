import express from "express";
import multer from "multer";
import { createYear, editYear, getPagedYears, getYearById, getYearsList, hideYear } from "../controllers/yearsController.js";

const upload = new multer();
const yearsRouter = express.Router();

//Get Paged
yearsRouter.post('/paged', upload.any(), getPagedYears);

//Get List
yearsRouter.post('/list', upload.any(), getYearsList);

//Get By Id
yearsRouter.get('/id/:id', getYearById);

//Create
yearsRouter.post('/', upload.any(), createYear);

//Update
yearsRouter.put('/', upload.any(), editYear);

//Ocultar
yearsRouter.delete('/', upload.any(), hideYear);

export default yearsRouter;