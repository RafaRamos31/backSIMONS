import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import Ticket from '../models/Ticket.js';

//Get
export const getTicketbyCode = async (req, res) => {
  const { code } = req.params;
  try {
    const ticket = await Ticket.findOne({
      where: {
        code
      }
    });

    if(!ticket) return res.status(404).send('Ticket no encontrado.');

    const tokenUser = {
      register: true
    }
    const token = jwt.sign(tokenUser, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({token});

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ticket: ' + error });
  }
}

//Create
export const createTicket = async (req, res) => {
  const ticket = await Ticket.create({ 
    code: uuidv4()
  });

  res.status(201).json(ticket);
}

//Delete
export const deleteTicket = async (req, res) => {
  try {
    const { code } = req.body;

    const ticket = await Ticket.findOne({
      where: {
        code: code
      }
    });

    if(!ticket) return res.status(404).send('Ticket no encontrado.');

    ticket.destroy();

    res.status(201).json(ticket);

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ticket: ' + error });
  }
}