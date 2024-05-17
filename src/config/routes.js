import actividadesRouter from "../routes/actividadesRoutes.js";
import aldeasRouter from "../routes/aldeasRoutes.js";
import areasTematicasRouter from "../routes/areasTematicasRoutes.js";
import beneficiariosRouter from "../routes/beneficiariosRoutes.js";
import cargosRouter from "../routes/cargosRoutes.js";
import caseriosRouter from "../routes/caseriosRoutes.js";
import componentesRoutes from "../routes/componentesRoutes.js";
import departamentoRouter from "../routes/departamentoRoutes.js";
import eventosRouter from "../routes/eventosRoutes.js";
import filesRouter from "../routes/filesRoutes.js";
import configRouter from "../routes/generalConfigRoutes.js";
import indicadoresRouter from "../routes/indicadoresRoutes.js";
import municipiosRouter from "../routes/municipiosRoutes.js";
import nivelesRouter from "../routes/nivelesRoutes.js";
import organizacionesRouter from "../routes/organizacionesRoutes.js";
import quartersRouter from "../routes/quarterRoutes.js";
import resultadosRouter from "../routes/resultadosRoutes.js";
import rolesRouter from "../routes/rolesRouter.js";
import sectoresRouter from "../routes/sectorRoutes.js";
import subactividadesRouter from "../routes/subactividadesRoutes.js";
import subresultadosRouter from "../routes/subresultadosRoutes.js";
import tareasRouter from "../routes/tareasRoutes.js";
import ticketRouter from "../routes/ticketsRoutes.js";
import tiposEventosRouter from "../routes/tiposEventosController.js";
import tiposOrganizacionesRouter from "../routes/tiposOrganizacionRoutes.js";
import usuariosRoutes from "../routes/usuariosRoutes.js";
import yearsRouter from "../routes/yearsRouter.js";

export const setRoutes = (app) => {
  //Configuracion
  app.use('/api/departamentos', departamentoRouter);
  app.use('/api/municipios', municipiosRouter);
  app.use('/api/aldeas', aldeasRouter);
  app.use('/api/caserios', caseriosRouter);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/componentes', componentesRoutes);
  app.use('/api/roles', rolesRouter);
  app.use('/api/tickets', ticketRouter);
  app.use('/api/tiposeventos', tiposEventosRouter);
  app.use('/api/niveles', nivelesRouter);
  app.use('/api/config', configRouter);
  //Clientes
  app.use('/api/sectores', sectoresRouter);
  app.use('/api/tiposorganizaciones', tiposOrganizacionesRouter);
  app.use('/api/cargos', cargosRouter);
  app.use('/api/organizaciones', organizacionesRouter);
  app.use('/api/beneficiarios', beneficiariosRouter);
  //Planificacion
  app.use('/api/resultados', resultadosRouter);
  app.use('/api/subresultados', subresultadosRouter);
  app.use('/api/actividades', actividadesRouter);
  app.use('/api/subactividades', subactividadesRouter);
  app.use('/api/tareas', tareasRouter);
  //Indicadores
  app.use('/api/indicadores', indicadoresRouter);
  app.use('/api/areastematicas', areasTematicasRouter);
  app.use('/api/years', yearsRouter);
  app.use('/api/quarters', quartersRouter);
  //Eventos
  app.use('/api/eventos', eventosRouter);
  app.use('/api/files', filesRouter);

  return app
}