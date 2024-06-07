import { Op } from 'sequelize';

export const getFilter = ({filterParams, reviews=false, deleteds=false, digitar=false, consolidar=false, componenteId=null, quarterId=null}) => {

  let filter = {}
  if(!digitar && !consolidar){
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
    if(digitar){
      filter = {estadoDigitacion: { [Op.in]: ['Pendiente', 'Finalizado', 'Rechazado', 'En Curso']}}
    }
    if(consolidar){
      filter = {estadoConsolidado: { [Op.in]: ['Pendiente', 'Finalizado']}}
    }
  }

  if(componenteId){
    filter['componenteId'] = componenteId
  }

  if(quarterId){
    filter['quarterId'] = quarterId
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