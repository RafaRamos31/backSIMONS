import { Op } from 'sequelize';

export const getFilter = ({filterParams, reviews=false, deleteds=false, digitar=false, componenteId=null}) => {

  let filter = {}
  if(!digitar){
    if(reviews){
      filter = {estado: { [Op.in] : ['En revisión', 'Validado', 'Rechazado']}}
    }
    else if(deleteds){
      filter = {estado: { [Op.in]: ['Publicado', 'Eliminado']}}
    }
    else{
      filter = {estado: { [Op.in]: ['Publicado']}}
    }
  }
  else{
    filter = {estadoDigitacion: { [Op.in]: ['Pendiente', 'Finalizado', 'En Curso']}}
  }

  if(componenteId){
    filter['componenteId'] = componenteId
  }
  
  if(filterParams.value){
    if(filterParams.operator === 'contains'){
      filter[filterParams.field] = { [Op.regexp]: filterParams.value}
    }
    if(filterParams.operator === 'is'){
      filter[filterParams.field] = filterParams.value;
    }
  }

  return filter;
}

export const getSorting = ({sort=null, defaultSort, reviews=false}) => {
  //Sorting
  if(sort && sort.field && sort.sort){
    return [[sort.field, sort.sort === 'desc' ? 'DESC' : 'ASC']];
  }

  if(reviews){
    return [['fechaEdicion', 'DESC']]
  }

  return [defaultSort];
}