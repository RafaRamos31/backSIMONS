import express from "express";
import multer from "multer";
import { consolidarEvento, createEvento, editEvento, editFinalizarEvento, finalizarEvento, getEventoConsolidarById, getEventoFinalizarById, getEventoParticipantesById, getEventosTablero, getPagedEventosConsolidar, getPagedEventosDigitar, participantesEvento, reportarEvento, revisarParticipantes, toggleEvento } from "../controllers/eventosController.js";

const upload = new multer();
const eventosRouter = express.Router();

//Get tablero
eventosRouter.post('/tablero', upload.any(), getEventosTablero);

//Get tablero
eventosRouter.post('/tablero/toggle', upload.any(), toggleEvento);

//Get individual finalizar
eventosRouter.get('/finalizar/:id', upload.any(), getEventoFinalizarById);

//Get individual participantes
eventosRouter.get('/participantes/:id', upload.any(), getEventoParticipantesById);

//Get individual participantes
eventosRouter.get('/consolidar/:id', upload.any(), getEventoConsolidarById);

//Get digitar
eventosRouter.post('/paged/digitar', upload.any(), getPagedEventosDigitar);

//Get consolidar
eventosRouter.post('/paged/consolidar', upload.any(), getPagedEventosConsolidar);

//Create inicial
eventosRouter.post('/crear', upload.any(), createEvento);

//Edit inicial
eventosRouter.put('/crear', upload.any(), editEvento);

//Finalizar
eventosRouter.post('/finalizar', upload.any(), finalizarEvento);

//Editar Finalizar
eventosRouter.put('/finalizar', upload.any(), editFinalizarEvento);

//Put reportar
eventosRouter.put('/reportar', upload.any(), reportarEvento);

//Digitalizar
eventosRouter.post('/digitalizar', upload.any(), participantesEvento);

//Edit Digitalizar
eventosRouter.put('/digitalizar', upload.any(), revisarParticipantes);

//Consolidar
eventosRouter.post('/consolidar', upload.any(), consolidarEvento);

export default eventosRouter;