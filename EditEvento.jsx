import { useContext, useEffect, useState } from "react";
import useForm from "../../hooks/useForm.js";
import { Button, Card, CloseButton, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { ToastContext } from "../../contexts/ToastContext.js";
import { useFetchGet, useFetchGetBody, useFetchPutBody } from "../../hooks/useFetch.js";
import { UserContext } from "../../contexts/UserContext.js";
import { AvatarGroup, Box, Chip, FormControl, ListItemText, ListSubheader, MenuItem, Select, Tooltip } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { InputAutocomplete } from "../../components/InputAutocomplete.jsx";
import { CrearDepartamento } from "./CrearDepartamento.jsx";
import { CrearMunicipio } from "./CrearMunicipio.jsx";
import { CrearAldea } from "./CrearAldea.jsx";
import { CrearCaserio } from "./CrearCaserio.jsx";
import { AvatarChip } from "../../components/AvatarChip.jsx";
import { AvatarIcon } from "../../components/AvatarIcon.jsx";


export const EditEvento = ({handleClose, setRefetch, evento}) => {

  const { user } = useContext(UserContext);

  //Toast
  const {setShowToast, actualizarTitulo, setContent, setVariant} = useContext(ToastContext)

  //Formulario
  const { values, handleChange, setValues } = useForm({
    idEvento: evento.id,
    tareaId: evento.tareaId,
    nombre: evento.nombre,
    areaTematicaId: evento.areaTematicaId,
    fechaInicio: moment(evento.fechaInicio).add(6, 'h'),
    fechaFinal: moment(evento.fechaFinal).add(6, 'h'),
    departamentoId: evento.departamentoId,
    municipioId: evento.municipioId,
    aldeaId: evento.aldeaId,
    caserioId: evento.caserioId,
    organizador: evento.organizador,
    componentes: evento.componentes.map(c => c.id),
    colaboradores: evento.colaboradores,
    aprobarComponente: false
  });

  const handleToggleDate = (value, param) => {
    const timezone = moment(values.fechaInicio).format('Z');
    if(param === 'fechaInicio'){
      setValues({ ...values, fechaInicio: value, timezone });
    }
    if(param === 'fechaFinal'){
      setValues({ ...values, fechaFinal: value, timezone });
    }
  }

  //Componentes
  const findParamsComponentes = {
    sort: '{}',
    filter: '{}'
  }
  const [componentes, setComponentes] = useState([])
  const { data: componentesData, isLoading: isLoadingComponentes, error: errorComponentes} = useFetchGetBody('componentes/list', findParamsComponentes);

  useEffect(() => {
    if(componentesData && !isLoadingComponentes){
      setComponentes(componentesData)
    } 
  }, [componentesData, isLoadingComponentes, errorComponentes])


  //Usuarios
  const findParamsUsuarios = {
    sort: '{}',
    filter: '{}'
  }
  const [usuarios, setUsuarios] = useState([])
  const { data: usuariosData, isLoading: isLoadingUsuarios, error: errorUsuarios} = useFetchGetBody('usuarios/list', findParamsUsuarios);

  useEffect(() => {
    if(usuariosData && !isLoadingUsuarios && componentesData && !isLoadingComponentes){
      const groupedUsuarios = []
      for(let componente of componentesData){
        groupedUsuarios.push({
          id: componente.id,
          usuarios: usuariosData.filter(u => u.componenteId === componente.id)
        })
      }
      setUsuarios(groupedUsuarios)
    } 
  }, [usuariosData, isLoadingUsuarios, errorUsuarios, componentesData, isLoadingComponentes])


  //Tareas
  const [findParamsTareas, setFindParamsTareas] = useState({
    sort: '{}',
    filter: '{}'
  })
  const [tareas, setTareas] = useState([])
  const [queryTareas, setQueryTareas] = useState('')
  const { data: tareasData, isLoading: isLoadingTareas, setRefetch: setRefetchTareas } = useFetchGetBody(queryTareas, findParamsTareas);

  useEffect(() => {
    if(user && user.userComponente){
      setFindParamsTareas({
        sort: '{}',
        filter: JSON.stringify({
          operator: 'is',
          field: 'componenteId',
          value: user.userComponente.id
        })
      })
      setQueryTareas('tareas/list');
      setRefetchTareas(true);
    }
  // eslint-disable-next-line
  }, [setRefetchTareas, user])


  //Fechas
  const [minDate, setMinDate] = useState()
  const [maxDate, setMaxDate] = useState()

  useEffect(() => {
    if(values.tareaId.length !== 0 && tareas.length > 0){
      const quarter = tareas.find(t => t.id === values.tareaId)?.quarter
      setMinDate(moment(quarter.fechaInicio).add(6, 'h'))
      setMaxDate(moment(quarter.fechaFinal).add(6, 'h'))
    }
  
  }, [values.tareaId, tareas])

  
  //SubActividad y Areas Tematicas
  const [areas, setAreas] = useState([])
  const [queryTarea, setQueryTarea] = useState('')
  const { data: dataTarea, isLoading: isLoadingTarea, error: errorTarea, setRefetch: setRefetchTarea } = useFetchGet(queryTarea);

  const [querySubactividad, setQuerySubactividad] = useState('')
  const { data: dataSubactividad, isLoading: isLoadingSubactividad, error: errorSubActividad, setRefetch: setRefetchSubactividad } = useFetchGet(querySubactividad);

  useEffect(() => {
    if(dataTarea && !isLoadingTarea && values.tareaId){
      setQuerySubactividad(`subactividades/id/${dataTarea?.subactividad?.id}`)
      setRefetchSubactividad(true)
    } 
  }, [dataTarea, isLoadingTarea, errorTarea, setRefetchSubactividad, values.tareaId])

  useEffect(() => {
    if(dataSubactividad && !isLoadingSubactividad && values.tareaId){
      setAreas(dataSubactividad?.areasTematicas)
    } 
  }, [dataSubactividad, isLoadingSubactividad, errorSubActividad, values.tareaId])

   //Editar Lista de Areas Tematicas en Formulario
  useEffect(() => {
    if(values.tareaId && values.tareaId.length !== 0){
      setQueryTarea(`tareas/id/${values.tareaId}`);
      setRefetchTarea(true);
    }
    else{
      setAreas([])
    }
    // eslint-disable-next-line
  }, [values.tareaId, setValues, setRefetchSubactividad])

  //Accion Update manual
  useEffect(() => {
    if(tareasData && !isLoadingTareas){
      setTareas(tareasData)
    } 
  }, [tareasData, isLoadingTareas])
  

  //Departamento
  const findParamsDepto = {
    sort: '{}',
    filter: '{}'
  }
  const [deptos, setDeptos] = useState([])
  const { data: deptoData, isLoading: isLoadingDeptos, error: errorDeptos, setRefetch: setRefetchDeptos } = useFetchGetBody('departamentos/list', findParamsDepto);
  
  //Indicador actualizando con boton departamento
  const [updatingDepto, setUpdatingDepto] = useState(false);

  //Accion Update manual
  const handleUpdateDepto = () => {
    setUpdatingDepto(true);
    setRefetchDeptos(true);
  }
  
  useEffect(() => {
    if(deptoData && !isLoadingDeptos){
      setDeptos(deptoData)
      setUpdatingDepto(false)
    } 
  }, [deptoData, isLoadingDeptos, errorDeptos])

  //Municipio
  const [findParamsMunicipios, setFindParamsMunicipios] = useState({
    sort: '{}',
    filter: '{}'
  })
  const [municipios, setMunicipios] = useState([])
  const [queryMunicipios, setQueryMunicipios] = useState('')
  const { data: muniData, isLoading: isLoadingMuni, error: errorMuni, setRefetch: setRefetchMuni } = useFetchGetBody(queryMunicipios, findParamsMunicipios);
  
  //Indicador actualizando con boton departamento
  const [updatingMunicipios, setUpdatingMunicipios] = useState(false);

  //Accion Update manual
  const handleUpdateMunicipios = () => {
    setUpdatingMunicipios(true);
    setRefetchMuni(true);
  }
  
  useEffect(() => {
    if(muniData && !isLoadingMuni && values.departamentoId){
      setMunicipios(muniData)
      setUpdatingMunicipios(false)
    } 
  }, [muniData, isLoadingMuni, errorMuni, values.departamentoId])

  //Editar Lista de Municipios en Formulario
  useEffect(() => {
    if(values.departamentoId && values.departamentoId.length !== 0){
      setFindParamsMunicipios({
        sort: '{}',
        filter: JSON.stringify({
          operator: 'is',
          field: 'departamentoId',
          value: values.departamentoId
        })
      })
      setQueryMunicipios('municipios/list');
      setRefetchMuni(true)
    }
    else{
      setMunicipios([])
    }
    // eslint-disable-next-line
  }, [values.departamentoId, setValues, setRefetchMuni])

  //Aldea
  const [findParamsAldea, setFindParamsAldea] = useState({
    sort: '{}',
    filter: '{}'
  })
  const [aldeas, setAldeas] = useState([])
  const [queryAldeas, setQueryAldeas] = useState('')
  const { data: aldeasData, isLoading: isLoadingAldeas, error: errorAldeas, setRefetch: setRefetchAldeas } = useFetchGetBody(queryAldeas, findParamsAldea);
  
  useEffect(() => {
    if(aldeasData && !isLoadingAldeas && values.municipioId){
      setAldeas(aldeasData)
      setUpdatingAldeas(false)
    } 
  }, [aldeasData, isLoadingAldeas, errorAldeas, values.municipioId])

  //Editar Lista de Aldeas en Formulario
  useEffect(() => {
    if(values.municipioId && values.municipioId.length !== 0){
      setFindParamsAldea({
        sort: '{}',
        filter: JSON.stringify({
          operator: 'is',
          field: 'municipioId',
          value: values.municipioId
        })
      })
      setQueryAldeas('aldeas/list')
      setRefetchAldeas(true)
    }
    else{
      setAldeas([])
    }
    // eslint-disable-next-line
  }, [values.municipioId, setValues, setRefetchAldeas])

  //Indicador actualizando con boton departamento
  const [updatingAldeas, setUpdatingAldeas] = useState(false);

  //Accion Update manual
  const handleUpdateAldeas = () => {
    setUpdatingAldeas(true);
    setRefetchAldeas(true);
  }

  //Caserios
  const [findParamsCaserios, setFindParamsCaserios] = useState({
    sort: '{}',
    filter: '{}'
  })
  const [caserios, setCaserios] = useState([])
  const [queryCaserios, setQueryCaserios] = useState('')
  const { data: caseriosData, isLoading: isLoadingCaserios, error: errorCaserios, setRefetch: setRefetchCaserios } = useFetchGetBody(queryCaserios, findParamsCaserios);
  
  useEffect(() => {
    if(caseriosData && !isLoadingCaserios && values.aldeaId){
      setCaserios(caseriosData)
      setUpdatingCaserios(false)
    } 
  }, [caseriosData, isLoadingCaserios, errorCaserios, values.aldeaId])

  //Editar Lista de Caserios en Formulario
  useEffect(() => {
    if(values.aldeaId && values.aldeaId.length !== 0){
      setFindParamsCaserios({
        sort: '{}',
        filter: JSON.stringify({
          operator: 'is',
          field: 'aldeaId',
          value: values.aldeaId
        })
      })
      setQueryCaserios('caserios/list')
      setRefetchCaserios(true)
    }
    else{
      setCaserios([])
    }
    // eslint-disable-next-line
  }, [values.aldeaId, setRefetchCaserios])

  //Indicador actualizando con boton departamento
  const [updatingCaserios, setUpdatingCaserios] = useState(false);

  //Accion Update manual
  const handleUpdateCaserios = () => {
    setUpdatingCaserios(true);
    setRefetchCaserios(true);
  }


  //Envio asincrono de formulario
  const { setSend, send, data, isLoading, error } = useFetchPutBody('eventos/crear', {...values,
    fechaInicio: moment(values.fechaInicio).format('YYYY-MM-DD HH:mm'),
    fechaFinal: moment(values.fechaFinal).format('YYYY-MM-DD HH:mm'),
    organizadorId: values.organizador?.id,
    componentes: JSON.stringify({data: values.componentes}),
    colaboradores: JSON.stringify({data: values.colaboradores.map(colaborador => colaborador.id)}),
  }) 

  const handleCreate = (e) => {
    e.preventDefault();
    setSend(true)
    setCharging(true)
  }

  //Boton de carga
  const [charging, setCharging] = useState(false);

  //Accion al completar correctamente
  const handleSuccess = () => {
    handleClose()
    setRefetch(true)
    setShowToast(true)
    actualizarTitulo('Tarea Creada')
    setContent('Tarea guardada correctamente.')
    setVariant('success')
  }

  //Efecto al enviar el formulario
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if(error){
      setErrorMessage(error)
      setCharging(false)
    }
    if(data){
      handleSuccess();
    }
  // eslint-disable-next-line
  }, [send, data, isLoading, error])

  return (
    <Card style={{border: 'none'}}>
    <Card.Header className="d-flex justify-content-between align-items-center" style={{backgroundColor: 'var(--main-green)', color: 'white'}}>
      <h4 className="my-1">Editar Evento</h4>
      <CloseButton onClick={handleClose}/>
    </Card.Header>
    <Card.Body>
      <Form onSubmit={handleCreate}>

      <Form.Group as={Row} className="mb-3 my-auto">
          <Form.Label className="my-auto" column sm="4">
            Tarea:
          </Form.Label>
          <Col sm="8">
            <InputGroup>
              <FormControl className="w-100">
                <Select
                  id="tareaId"
                  name="tareaId"
                  onChange={handleChange}
                  value={values.tareaId}
                >
                  {tareas && tareas.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <Tooltip title={item.titulo} placement="right" arrow followCursor>
                        <ListItemText primary={item.nombre} />
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </InputGroup>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="4" className="my-auto">
            Título:
          </Form.Label>
          <Col sm="8">
            <Form.Control id='nombre' name='nombre'  as="textarea" rows={2} maxLength={200} value={values.nombre} autoComplete='off' onChange={handleChange}/>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 my-auto">
          <Form.Label className="my-auto" column sm="4">
            Área Temática:
          </Form.Label>
          <Col sm="8">
            <InputGroup>
              <FormControl className="w-100">
                <Select
                  id="areaTematicaId"
                  name="areaTematicaId"
                  onChange={handleChange}
                  value={values.areaTematicaId}
                >
                  {areas && areas.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <Tooltip title={item.descripcion} placement="right" arrow followCursor>
                        <ListItemText primary={item.nombre} />
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </InputGroup>
          </Col>
        </Form.Group>

        <LocalizationProvider dateAdapter={AdapterMoment}>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="4" className="my-auto">
              Fecha de Inicio:
            </Form.Label>
            <Col sm="8">
              <DateTimePicker 
              format="DD/MM/YYYY - hh:mm a"
              id='fechaInicio'
              name='fechaInicio'
              minDateTime={minDate}
              maxDateTime={maxDate}
              value={moment(values.fechaInicio)}
              onChange={(value) => handleToggleDate(value, 'fechaInicio')}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="4" className="my-auto">
              Fecha Finalización:
            </Form.Label>
            <Col sm="8">
              <DateTimePicker 
              format="DD/MM/YYYY - hh:mm a"
              id='fechaFinal'
              name='fechaFinal'
              minDateTime={minDate}
              maxDateTime={maxDate}
              value={moment(values.fechaFinal)}
              onChange={(value) => handleToggleDate(value, 'fechaFinal')}
              />
            </Col>
          </Form.Group>

        </LocalizationProvider>

        <Card>
          <Card.Header>
            <h5>Ubicación</h5>
          </Card.Header>
          <Card.Body className='p-4'>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="4" className="my-auto">
                Departamento:
              </Form.Label>
              <Col sm="8" className="my-auto">
                  <InputGroup>
                    <InputAutocomplete 
                      valueList={deptos} 
                      value={values.departamentoId}
                      name={'departamentoId'}
                      setValues={setValues}
                      setRefetch={setRefetchDeptos}
                      ModalCreate={CrearDepartamento}
                    />
                  {
                    !updatingDepto ? 
                    <Button variant="light" onClick={handleUpdateDepto}>
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                    : <Button variant="light">
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Cargando...</span>
                    </Button>
                  }
                </InputGroup>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="4" className="my-auto">
                Municipio:
              </Form.Label>
              <Col sm="8">
                <InputGroup>
                    <InputAutocomplete 
                      valueList={municipios} 
                      value={values.municipioId}
                      name={'municipioId'}
                      setValues={setValues}
                      setRefetch={setRefetchMuni}
                      ModalCreate={CrearMunicipio}
                    />
                  {
                    !updatingMunicipios ? 
                    <Button variant="light" onClick={handleUpdateMunicipios}>
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                    : <Button variant="light">
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Cargando...</span>
                    </Button>
                  }
                </InputGroup>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="4" className="my-auto">
                Aldea:
              </Form.Label>
              <Col sm="8">
                <InputGroup>
                    <InputAutocomplete 
                      valueList={aldeas} 
                      value={values.aldeaId}
                      name={'aldeaId'}
                      setValues={setValues}
                      setRefetch={setRefetchAldeas}
                      ModalCreate={CrearAldea}
                    />
                  {
                    !updatingAldeas ? 
                    <Button variant="light" onClick={handleUpdateAldeas}>
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                    : <Button variant="light">
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Cargando...</span>
                    </Button>
                  }
                </InputGroup>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="4" className="my-auto">
                Caserio:
              </Form.Label>
              <Col sm="8">
                <InputGroup>
                    <InputAutocomplete 
                      valueList={caserios} 
                      value={values.caserioId}
                      name={'caserioId'}
                      setValues={setValues}
                      setRefetch={setRefetchCaserios}
                      ModalCreate={CrearCaserio}
                    />
                  {
                    !updatingCaserios ? 
                    <Button variant="light" onClick={handleUpdateCaserios}>
                      <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                    : <Button variant="light">
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Cargando...</span>
                    </Button>
                  }
                </InputGroup>
              </Col>
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className='my-4'>
        <Card.Header>
          <h5>Coordinación</h5>
        </Card.Header>
        <Card.Body className='p-4'>

        <Form.Group as={Row} className="mb-3 my-auto">
          <Form.Label className="my-auto" column sm="4">
            Organizador:
          </Form.Label>
          <Col sm="8">
            <InputGroup>
              <FormControl className="w-100">
                <Select
                  id="organizador"
                  name="organizador"
                  onChange={handleChange}
                  value={values.organizador}
                  renderValue={(value) => (
                    <AvatarChip id={value?.id} name={value?.nombre} link={false}/>
                  )}
                >
                  {usuarios && usuarios.filter(componente => componente.id === user.userComponente.id).map((componente, index) => (
                    [
                      // eslint-disable-next-line
                      <ListSubheader key={index}>{componentes.find(c => c.id == componente.id)?.nombre}</ListSubheader>,
                      ...componente.usuarios?.map(usuario => (
                        <MenuItem key={usuario.id} value={usuario}>
                          <AvatarChip id={usuario.id} name={usuario.nombre} link={false}/>
                        </MenuItem>
                      ))
                    ]
                  ))}
                </Select>
              </FormControl>
            </InputGroup>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 my-auto">
          <Form.Label className="my-auto" column sm="4">
            Componentes:
          </Form.Label>
          <Col sm="8">
            <InputGroup>
              <FormControl className="w-100">
                <Select
                  id="componentes"
                  name="componentes"
                  multiple
                  onChange={handleChange}
                  value={values.componentes}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={componentes.find(componente => componente.id === value)?.nombre} />
                      ))}
                    </Box>
                  )}
                >
                  {componentes && componentes.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <Tooltip title={item.descripcion} placement="right" arrow followCursor>
                        <ListItemText primary={item.nombre} />
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </InputGroup>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3 my-auto">
          <Form.Label className="my-auto" column sm="4">
            Colaboradores:
          </Form.Label>
          <Col sm="8">
            <InputGroup>
              <FormControl className="w-100">
                <Select
                  id="colaboradores"
                  name="colaboradores"
                  onChange={handleChange}
                  multiple
                  value={values.colaboradores}
                  renderValue={(selected) => (
                    <AvatarGroup max={6} style={{flexDirection: 'row-reverse', justifyContent: 'left'}}>
                      {
                        selected.map((usuario) => (
                          <AvatarIcon id={usuario.id} name={usuario.nombre}/>
                        ))
                      }
                    </AvatarGroup>
                  )}
                >
                  {usuarios && usuarios.filter(componente => values.componentes.includes(componente.id)).map((componente, index) => (
                    [
                      <ListSubheader key={index}>{componentes.find(c => c.id === componente.id)?.nombre}</ListSubheader>,
                      ...componente.usuarios?.map(usuario => (
                        <MenuItem key={usuario.id} value={usuario}>
                          <AvatarChip id={usuario.id} name={usuario.nombre} link={false}/>
                        </MenuItem>
                      ))
                    ]
                  ))}
                  
                </Select>
              </FormControl>
            </InputGroup>
          </Col>
        </Form.Group>

          </Card.Body>
        </Card>

      </Form>
      <p style={{color: 'red'}}>{errorMessage}</p>
    </Card.Body>
    <Card.Footer className="d-flex justify-content-between align-items-center">
      {
        <div></div>
      }
      {
        !charging ?
        <Button style={{borderRadius: '5px', padding: '0.5rem 2rem', width: '9rem', marginLeft: '1rem'}} variant="secondary" onClick={handleCreate}>
          Enviar
        </Button>
        :
        <Button style={{borderRadius: '5px', padding: '0.5rem 2rem', width: '9rem', marginLeft: '1rem'}} variant="secondary">
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span className="visually-hidden">Cargando...</span>
        </Button>
      }
    </Card.Footer>
  </Card>
  )
}
