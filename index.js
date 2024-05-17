import express from "express";
import cors from "cors";
import { setRoutes } from "./src/config/routes.js";

//Se inicializa un servidor Express para la navegacion entre rutas al acceder a la API
const app = express();

// Habilitar CORS
app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Rutas
setRoutes(app)

//Se establece el puerto de acceso a la API
app.listen({port: 4000});