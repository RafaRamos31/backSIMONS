import express from "express";
import multer from "multer";
import { createBeneficiario, editBeneficiario, getBeneficiarioByDNI, getBeneficiarioById, getBeneficiariosList, getBeneficiariosReporte, getPagedBeneficiarios, getRevisionesBeneficiario, hideBeneficiario, reviewBeneficiario } from "../controllers/beneficiariosController.js";

const upload = new multer();
const beneficiariosRouter = express.Router();

//Get Reporte
beneficiariosRouter.post('/reporte', upload.any(), getBeneficiariosReporte);

//Get Paged
beneficiariosRouter.post('/paged', upload.any(), getPagedBeneficiarios);

//Get List
beneficiariosRouter.post('/list', upload.any(), getBeneficiariosList);

//Get By Id
beneficiariosRouter.get('/id/:id', getBeneficiarioById);

//Get By DNI
beneficiariosRouter.get('/dni/:dni', getBeneficiarioByDNI);

//Get Revisiones
beneficiariosRouter.get('/revisiones/:id', getRevisionesBeneficiario);

//Create
beneficiariosRouter.post('/', upload.any(), createBeneficiario);

//Update
beneficiariosRouter.put('/', upload.any(), editBeneficiario);

//Revisar
beneficiariosRouter.put('/revisar', upload.any(), reviewBeneficiario);

//Ocultar
beneficiariosRouter.delete('/', upload.any(), hideBeneficiario);

export default beneficiariosRouter;