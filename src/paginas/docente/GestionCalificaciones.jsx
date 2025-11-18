import { useState, useEffect } from 'react'
import { Card, Button, Table, Modal, Form, Badge, Alert, Row, Col } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'

const GestionCalificaciones = () => {
  const { usuarioActual } = useAutenticacion()
  const [materias, setMaterias] = useState([])
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('')
  const [periodos, setPeriodos] = useState([])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('')
  const [estudiantes, setEstudiantes] = useState([])
  const [calificaciones, setCalificaciones] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [calificacionActual, setCalificacionActual] = useState(null)
  const [validated, setValidated] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })

  const [formulario, setFormulario] = useState({
    estudianteId: '',
    materiaId: '',
    periodoId: '',
    nota: '',
    tipo: 'parcial'
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (materiaSeleccionada && periodoSeleccionado) {
      cargarCalificaciones()
    }
  }, [materiaSeleccionada, periodoSeleccionado])

  const cargarDatos = () => {
    const materiasDocente = servicio.obtenerMateriasPorDocente(usuarioActual.id)
    const periodosDB = servicio.obtenerPeriodos()
    const estudiantesDB = servicio.obtenerUsuariosPorRol('estudiante')
    
    setMaterias(materiasDocente)
    setPeriodos(periodosDB)
    setEstudiantes(estudiantesDB)

    // Seleccionar primera materia y periodo activo por defecto
    if (materiasDocente.length > 0) {
      setMateriaSeleccionada(materiasDocente[0].id)
    }
    const periodoActivo = periodosDB.find(p => p.activo)
    if (periodoActivo) {
      setPeriodoSeleccionado(periodoActivo.id)
    }
  }

  const cargarCalificaciones = () => {
    const califs = servicio.obtenerCalificacionesPorMateria(materiaSeleccionada)
      .filter(c => c.periodoId === periodoSeleccionado)
    setCalificaciones(califs)
  }

  const abrirModalCrear = () => {
    setModoEdicion(false)
    setCalificacionActual(null)
    setFormulario({
      estudianteId: '',
      materiaId: materiaSeleccionada,
      periodoId: periodoSeleccionado,
      nota: '',
      tipo: 'parcial'
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const abrirModalEditar = (calificacion) => {
    setModoEdicion(true)
    setCalificacionActual(calificacion)
    setFormulario({
      estudianteId: calificacion.estudianteId,
      materiaId: calificacion.materiaId,
      periodoId: calificacion.periodoId,
      nota: calificacion.nota,
      tipo: calificacion.tipo
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setCalificacionActual(null)
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

    const nota = parseFloat(formulario.nota)
    if (nota < 0 || nota > 5) {
      mostrarAlerta('danger', 'La nota debe estar entre 0 y 5')
      return
    }

    if (modoEdicion) {
      servicio.actualizarCalificacion(calificacionActual.id, formulario)
      mostrarAlerta('success', 'Calificación actualizada correctamente')
    } else {
      servicio.crearCalificacion(formulario)
      mostrarAlerta('success', 'Calificación registrada correctamente')
      
      // Verificar si es bajo rendimiento
      if (nota < 3.0) {
        mostrarAlerta('warning', 'Alerta: Calificación por debajo del promedio mínimo')
      }
    }

    cargarCalificaciones()
    cerrarModal()
  }

  const eliminarCalificacion = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta calificación?')) {
      servicio.eliminarCalificacion(id)
      mostrarAlerta('success', 'Calificación eliminada correctamente')
      cargarCalificaciones()
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

  const calcularPromedioEstudiante = (estudianteId) => {
    const califs = calificaciones.filter(c => c.estudianteId === estudianteId)
    if (califs.length === 0) return '-'
    const suma = califs.reduce((acc, c) => acc + parseFloat(c.nota), 0)
    return (suma / califs.length).toFixed(2)
  }

  // Agrupar calificaciones por estudiante
  const estudiantesConCalificaciones = estudiantes.map(est => {
    const califsEstudiante = calificaciones.filter(c => c.estudianteId === est.id)
    const promedio = calcularPromedioEstudiante(est.id)
    return {
      ...est,
      calificaciones: califsEstudiante,
      promedio
    }
  }).filter(est => est.calificaciones.length > 0)

  return (
    <div>
      <h2 className="mb-4">Gestión de Calificaciones</h2>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={5} className="mb-2">
              <Form.Group>
                <Form.Label>Materia</Form.Label>
                <Form.Select value={materiaSeleccionada} onChange={(e) => setMateriaSeleccionada(e.target.value)}>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} - {m.nivel}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={5} className="mb-2">
              <Form.Group>
                <Form.Label>Periodo</Form.Label>
                <Form.Select value={periodoSeleccionado} onChange={(e) => setPeriodoSeleccionado(e.target.value)}>
                  {periodos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="mb-2 d-flex align-items-end">
              <Button variant="primary" onClick={abrirModalCrear} className="w-100">
                <FaPlus className="me-2" />
                Nueva
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de calificaciones por estudiante */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Calificaciones Registradas</h5>
        </Card.Header>
        <Card.Body>
          {estudiantesConCalificaciones.length > 0 ? (
            <Table striped hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Estudiante</th>
                  <th>Calificaciones</th>
                  <th>Promedio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesConCalificaciones.map(estudiante => (
                  <tr key={estudiante.id}>
                    <td><strong>{estudiante.nombre}</strong></td>
                    <td>
                      {estudiante.calificaciones.map(cal => (
                        <Badge 
                          key={cal.id} 
                          bg={parseFloat(cal.nota) >= 3.0 ? 'success' : 'danger'}
                          className="me-1"
                        >
                          {cal.nota} ({cal.tipo})
                        </Badge>
                      ))}
                    </td>
                    <td>
                      <Badge bg={parseFloat(estudiante.promedio) >= 3.0 ? 'success' : 'danger'}>
                        {estudiante.promedio}
                      </Badge>
                    </td>
                    <td>
                      {parseFloat(estudiante.promedio) < 3.0 && estudiante.promedio !== '-' ? (
                        <Badge bg="warning">
                          <FaExclamationTriangle className="me-1" />
                          Bajo Rendimiento
                        </Badge>
                      ) : (
                        <Badge bg="success">Aprobado</Badge>
                      )}
                    </td>
                    <td>
                      {estudiante.calificaciones.map(cal => (
                        <div key={cal.id} className="d-inline-block me-1">
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-1"
                            onClick={() => abrirModalEditar(cal)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => eliminarCalificacion(cal.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">No hay calificaciones registradas para esta materia y periodo</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal de formulario */}
      <Modal show={mostrarModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Calificación' : 'Registrar Nueva Calificación'}
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
                disabled={modoEdicion}
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
              <Form.Label>Tipo de Evaluación *</Form.Label>
              <Form.Select
                name="tipo"
                value={formulario.tipo}
                onChange={manejarCambio}
                required
              >
                <option value="parcial">Parcial</option>
                <option value="tarea">Tarea</option>
                <option value="examen">Examen</option>
                <option value="proyecto">Proyecto</option>
                <option value="quiz">Quiz</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nota (0.0 - 5.0) *</Form.Label>
              <Form.Control
                type="number"
                name="nota"
                value={formulario.nota}
                onChange={manejarCambio}
                step="0.1"
                min="0"
                max="5"
                required
              />
              <Form.Control.Feedback type="invalid">
                La nota debe estar entre 0 y 5
              </Form.Control.Feedback>
            </Form.Group>

            {formulario.nota && parseFloat(formulario.nota) < 3.0 && (
              <Alert variant="warning">
                <FaExclamationTriangle className="me-2" />
                Esta calificación está por debajo del promedio mínimo (3.0)
              </Alert>
            )}
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

export default GestionCalificaciones
