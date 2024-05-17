import express from "express";
import multer from "multer";
import { createCaserio, editCaserio, getCaserioById, getCaseriosList, getPagedCaserios, hideCaserio } from "../controllers/caseriosController.js";

const upload = new multer();
const caseriosRouter = express.Router();

//Get Paged
caseriosRouter.post('/paged', upload.any(), getPagedCaserios);

//Get List
caseriosRouter.post('/list', upload.any(), getCaseriosList);

//Get By Id
caseriosRouter.get('/id/:id', getCaserioById);

//Create
caseriosRouter.post('/', upload.any(), createCaserio);

//Update
caseriosRouter.put('/', upload.any(), editCaserio);

//Ocultar
caseriosRouter.delete('/', upload.any(), hideCaserio);

export default caseriosRouter;