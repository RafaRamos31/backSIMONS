import express from "express";
import multer from "multer";
import { createUsuario, editUsuario, getPagedUsuarios, getUsuarioById, getUsuariosListComponente, hideUsuario, loginUser, reviewUsuario, verifyUser } from "../controllers/usuariosController.js";

const upload = new multer();
const usuariosRoutes = express.Router();

//Login
usuariosRoutes.post('/login', upload.any(), loginUser);

//Verify
usuariosRoutes.get('/verify', upload.any(), verifyUser);

//Get Paged
usuariosRoutes.post('/paged', upload.any(), getPagedUsuarios);

//Get List Componente
usuariosRoutes.post('/list', upload.any(), getUsuariosListComponente);

//Get By Id
usuariosRoutes.get('/id/:id', getUsuarioById);

//Create
usuariosRoutes.post('/', upload.any(), createUsuario);

//Update
usuariosRoutes.put('/', upload.any(), editUsuario);

//Review
usuariosRoutes.put('/revisar', upload.any(), reviewUsuario);

//Ocultar
usuariosRoutes.delete('/', upload.any(), hideUsuario);

export default usuariosRoutes;