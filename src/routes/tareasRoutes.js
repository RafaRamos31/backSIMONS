import express from "express";
import multer from "multer";
import { createTarea, editTarea, getPagedTareas, getTareaById, getTareasList, hideTarea, reviewTarea } from "../controllers/tareasController.js";

const upload = new multer();
const tareasRouter = express.Router();

//Get Paged
tareasRouter.post('/paged', upload.any(), getPagedTareas);

//Get List
tareasRouter.post('/list', upload.any(), getTareasList);

//Get By Id
tareasRouter.get('/id/:id', getTareaById);

//Create
tareasRouter.post('/', upload.any(), createTarea);

//Update
tareasRouter.put('/', upload.any(), editTarea);

//Revisar
tareasRouter.put('/revisar', upload.any(), reviewTarea);

//Ocultar
tareasRouter.delete('/', upload.any(), hideTarea);

export default tareasRouter;