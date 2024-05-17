import express from "express";
import multer from "multer";
import { getGeneralConfig, uploadConfigs } from "../controllers/generalConfigController.js";

const upload = new multer();
const configRouter = express.Router();

//Get
configRouter.get('/', getGeneralConfig);

//Update
configRouter.put('/', upload.any(), uploadConfigs);

export default configRouter;