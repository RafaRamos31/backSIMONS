import express from "express";
import multer from "multer";
import { createRol, editRol, getPagedRoles, getRolById, getRolesList, hideRol } from "../controllers/rolesController.js";

const upload = new multer();
const rolesRouter = express.Router();

//Get Paged
rolesRouter.post('/paged', upload.any(), getPagedRoles);

//Get List
rolesRouter.post('/list', upload.any(), getRolesList);

//Get By Id
rolesRouter.get('/id/:id', getRolById);

//Create
rolesRouter.post('/', upload.any(), createRol);

//Update
rolesRouter.put('/', upload.any(), editRol);

//Ocultar
rolesRouter.delete('/', upload.any(), hideRol);

export default rolesRouter;