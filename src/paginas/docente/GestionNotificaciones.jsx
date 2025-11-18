import { useState, useEffect } from 'react'
import { Card, Button, Table, Modal, Form, Badge, Alert, Row, Col } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash, FaBell } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'

const GestionNotificaciones = () => {
  const { usuarioActual } = useAutenticacion()
  const [materias, setMaterias] = useState([])
  const [notificaciones, setNotificaciones] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [notificacionActual, setNotificacionActual] = useState(null)
  const [validated, setValidated] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })

  const [formulario, setFormulario] = useState({
    materiaId: '',
    titulo: '',
    mensaje: '',
    tipo: 'tarea'
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = () => {
    const materiasDocente = servicio.obtenerMateriasPorDocente(usuarioActual.id)
    setMaterias(materiasDocente)
    
    // Obtener notificaciones del docente
    const todasNotificaciones = servicio.obtenerNotificaciones()
    const notificacionesDocente = todasNotificaciones.filter(n => n.docenteId === usuarioActual.id)
    setNotificaciones(notificacionesDocente)
  }

  const abrirModalCrear = () => {
    setModoEdicion(false)
    setNotificacionActual(null)
    setFormulario({
      materiaId: materias.length > 0 ? materias[0].id : '',
      titulo: '',
      mensaje: '',
      tipo: 'tarea'
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const abrirModalEditar = (notificacion) => {
    setModoEdicion(true)
    setNotificacionActual(notificacion)
    setFormulario({
      materiaId: notificacion.materiaId,
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      tipo: notificacion.tipo
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setNotificacionActual(null)
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

    const datosNotificacion = {
      ...formulario,
      docenteId: usuarioActual.id
    }

    if (modoEdicion) {
      servicio.actualizarNotificacion(notificacionActual.id, datosNotificacion)
      mostrarAlerta('success', 'Notificación actualizada correctamente')
    } else {
      servicio.crearNotificacion(datosNotificacion)
      mostrarAlerta('success', 'Notificación enviada correctamente')
    }

    cargarDatos()
    cerrarModal()
  }

  const eliminarNotificacion = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta notificación?')) {
      servicio.eliminarNotificacion(id)
      mostrarAlerta('success', 'Notificación eliminada')
      cargarDatos()
    }
  }

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje })
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' })
    }, 3000)
  }

  const obtenerNombreMateria = (materiaId) => {
    const materia = materias.find(m => m.id === materiaId)
    return materia ? materia.nombre : 'Desconocida'
  }

  const obtenerColorTipo = (tipo) => {
    switch (tipo) {
      case 'tarea': return 'primary'
      case 'evaluacion': return 'danger'
      case 'proyecto': return 'warning'
      case 'evento': return 'info'
      default: return 'secondary'
    }
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Notificaciones</h2>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">
          Crea y administra notificaciones para tus estudiantes
        </p>
        <Button variant="primary" onClick={abrirModalCrear}>
          <FaPlus className="me-2" />
          Nueva Notificación
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaBell className="me-2" />
            Mis Notificaciones
          </h5>
        </Card.Header>
        <Card.Body>
          {notificaciones.length > 0 ? (
            <Table striped hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Materia</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Mensaje</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notificaciones.map(notif => (
                  <tr key={notif.id}>
                    <td>{new Date(notif.fecha).toLocaleDateString('es-ES')}</td>
                    <td>
                      <Badge bg="info">{obtenerNombreMateria(notif.materiaId)}</Badge>
                    </td>
                    <td><strong>{notif.titulo}</strong></td>
                    <td>
                      <Badge bg={obtenerColorTipo(notif.tipo)}>
                        {notif.tipo.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      {notif.mensaje.length > 50 
                        ? notif.mensaje.substring(0, 50) + '...' 
                        : notif.mensaje}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirModalEditar(notif)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarNotificacion(notif.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted">No hay notificaciones registradas</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal de formulario */}
      <Modal show={mostrarModal} onHide={cerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Notificación' : 'Nueva Notificación'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={manejarSubmit}>
          <Modal.Body>
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
              <Form.Label>Tipo de Notificación *</Form.Label>
              <Form.Select
                name="tipo"
                value={formulario.tipo}
                onChange={manejarCambio}
                required
              >
                <option value="tarea">Tarea</option>
                <option value="evaluacion">Evaluación</option>
                <option value="proyecto">Proyecto</option>
                <option value="evento">Evento</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={formulario.titulo}
                onChange={manejarCambio}
                placeholder="Ej: Tarea de Matemáticas - Capítulo 5"
                required
              />
              <Form.Control.Feedback type="invalid">
                El título es requerido
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mensaje *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="mensaje"
                value={formulario.mensaje}
                onChange={manejarCambio}
                placeholder="Describe los detalles de la notificación..."
                required
              />
              <Form.Control.Feedback type="invalid">
                El mensaje es requerido
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {modoEdicion ? 'Actualizar' : 'Enviar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}

export default GestionNotificaciones
