import { useState, useEffect } from 'react'
import { Card, Button, Table, Modal, Form, Badge, Alert, Row, Col } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash, FaThumbsUp, FaThumbsDown } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'

const GestionObservaciones = () => {
  const { usuarioActual } = useAutenticacion()
  const [materias, setMaterias] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [observaciones, setObservaciones] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [observacionActual, setObservacionActual] = useState(null)
  const [validated, setValidated] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })
  const [filtroMateria, setFiltroMateria] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState('todas')

  const [formulario, setFormulario] = useState({
    estudianteId: '',
    materiaId: '',
    observacion: '',
    tipo: 'positiva'
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = () => {
    const materiasDocente = servicio.obtenerMateriasPorDocente(usuarioActual.id)
    const estudiantesDB = servicio.obtenerUsuariosPorRol('estudiante')
    setMaterias(materiasDocente)
    setEstudiantes(estudiantesDB)
    
    const todasObservaciones = servicio.obtenerObservaciones()
    const observacionesDocente = todasObservaciones.filter(o => o.docenteId === usuarioActual.id)
    setObservaciones(observacionesDocente)
  }

  const abrirModalCrear = () => {
    setModoEdicion(false)
    setObservacionActual(null)
    setFormulario({
      estudianteId: '',
      materiaId: materias.length > 0 ? materias[0].id : '',
      observacion: '',
      tipo: 'positiva'
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const abrirModalEditar = (obs) => {
    setModoEdicion(true)
    setObservacionActual(obs)
    setFormulario({
      estudianteId: obs.estudianteId,
      materiaId: obs.materiaId,
      observacion: obs.observacion,
      tipo: obs.tipo
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setObservacionActual(null)
    setValidated(false)
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setFormulario(prev => ({ ...prev, [name]: value }))
  }

  const manejarSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    const datosObservacion = {
      ...formulario,
      docenteId: usuarioActual.id
    }

    if (modoEdicion) {
      servicio.actualizarObservacion(observacionActual.id, datosObservacion)
      mostrarAlerta('success', 'Observación actualizada correctamente')
    } else {
      servicio.crearObservacion(datosObservacion)
      mostrarAlerta('success', 'Observación registrada correctamente')
    }

    cargarDatos()
    cerrarModal()
  }

  const eliminarObservacion = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta observación?')) {
      servicio.eliminarObservacion(id)
      mostrarAlerta('success', 'Observación eliminada')
      cargarDatos()
    }
  }

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje })
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' })
    }, 3000)
  }

  const obtenerNombreEstudiante = (estudianteId) => {
    const estudiante = estudiantes.find(e => e.id === estudianteId)
    return estudiante ? estudiante.nombre : 'Desconocido'
  }

  const obtenerNombreMateria = (materiaId) => {
    const materia = materias.find(m => m.id === materiaId)
    return materia ? materia.nombre : 'Desconocida'
  }

  const observacionesFiltradas = observaciones.filter(obs => {
    if (filtroMateria !== 'todas' && obs.materiaId !== filtroMateria) return false
    if (filtroTipo !== 'todas' && obs.tipo !== filtroTipo) return false
    return true
  })

  return (
    <div>
      <h2 className="mb-4">Gestión de Observaciones</h2>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Registra observaciones sobre el comportamiento y desempeño de los estudiantes
        </p>
        <Button variant="primary" onClick={abrirModalCrear}>
          <FaPlus className="me-2" />
          Nueva Observación
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-2">
              <Form.Group>
                <Form.Label>Filtrar por Materia</Form.Label>
                <Form.Select value={filtroMateria} onChange={(e) => setFiltroMateria(e.target.value)}>
                  <option value="todas">Todas las materias</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-2">
              <Form.Group>
                <Form.Label>Filtrar por Tipo</Form.Label>
                <Form.Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                  <option value="todas">Todas</option>
                  <option value="positiva">Positivas</option>
                  <option value="negativa">Negativas</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Observaciones Registradas</h5>
        </Card.Header>
        <Card.Body>
          {observacionesFiltradas.length > 0 ? (
            <Table striped hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Estudiante</th>
                  <th>Materia</th>
                  <th>Tipo</th>
                  <th>Observación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {observacionesFiltradas.map(obs => (
                  <tr key={obs.id}>
                    <td>{new Date(obs.fecha).toLocaleDateString('es-ES')}</td>
                    <td><strong>{obtenerNombreEstudiante(obs.estudianteId)}</strong></td>
                    <td>
                      <Badge bg="info">{obtenerNombreMateria(obs.materiaId)}</Badge>
                    </td>
                    <td>
                      <Badge bg={obs.tipo === 'positiva' ? 'success' : 'danger'}>
                        {obs.tipo === 'positiva' ? (
                          <>
                            <FaThumbsUp className="me-1" />
                            POSITIVA
                          </>
                        ) : (
                          <>
                            <FaThumbsDown className="me-1" />
                            NEGATIVA
                          </>
                        )}
                      </Badge>
                    </td>
                    <td>{obs.observacion}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirModalEditar(obs)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarObservacion(obs.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">No hay observaciones registradas</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal de formulario */}
      <Modal show={mostrarModal} onHide={cerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Observación' : 'Nueva Observación'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={manejarSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Estudiante *</Form.Label>
              <Form.Select
                name="estudianteId"
                value={formulario.estudianteId}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccione un estudiante</option>
                {estudiantes.map(est => (
                  <option key={est.id} value={est.id}>{est.nombre}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Debe seleccionar un estudiante
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Materia *</Form.Label>
              <Form.Select
                name="materiaId"
                value={formulario.materiaId}
                onChange={manejarCambio}
                required
              >
                {materias.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} - {m.nivel}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Debe seleccionar una materia
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo de Observación *</Form.Label>
              <Form.Select
                name="tipo"
                value={formulario.tipo}
                onChange={manejarCambio}
                required
              >
                <option value="positiva">Positiva</option>
                <option value="negativa">Negativa</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Observación *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="observacion"
                value={formulario.observacion}
                onChange={manejarCambio}
                placeholder="Describe la observación sobre el estudiante..."
                required
              />
              <Form.Control.Feedback type="invalid">
                La observación es requerida
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {modoEdicion ? 'Actualizar' : 'Registrar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default GestionObservaciones
