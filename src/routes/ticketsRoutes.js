import express from "express";
import multer from "multer";
import { createTicket, deleteTicket, getTicketbyCode } from "../controllers/ticketsController.js";

const upload = new multer();
const ticketRouter = express.Router();

//Get Paged
ticketRouter.get('/:code', upload.any(), getTicketbyCode);

//Create
ticketRouter.post('/', upload.any(), createTicket);

//Eliminar
ticketRouter.delete('/', upload.any(), deleteTicket);

export default ticketRouter;