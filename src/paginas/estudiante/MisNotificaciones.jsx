import { useState, useEffect } from 'react'
import { Card, Badge, ListGroup, Form, Alert, Button } from 'react-bootstrap'
import { FaBell, FaCheckCircle, FaFilter } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'

const MisNotificaciones = () => {
  const { usuarioActual } = useAutenticacion()
  const [notificaciones, setNotificaciones] = useState([])
  const [materias, setMaterias] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [filtroMateria, setFiltroMateria] = useState('todas')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = () => {
    const todasNotificaciones = servicio.obtenerNotificaciones()
    const materiasDB = servicio.obtenerMaterias()
    
    // Ordenar por fecha descendente
    todasNotificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    
    setNotificaciones(todasNotificaciones)
    setMaterias(materiasDB)
  }

  const marcarComoLeida = (id) => {
    servicio.marcarNotificacionComoLeida(id)
    cargarDatos()
  }

  const obtenerNombreMateria = (materiaId) => {
    const materia = materias.find(m => m.id === materiaId)
    return materia ? materia.nombre : 'General'
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

  const notificacionesFiltradas = notificaciones.filter(notif => {
    if (filtroTipo !== 'todas' && notif.tipo !== filtroTipo) return false
    if (filtroMateria !== 'todas' && notif.materiaId !== filtroMateria) return false
    return true
  })

  const notificacionesSinLeer = notificaciones.filter(n => !n.leida).length

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Notificaciones</h2>
        <Badge bg="warning" className="fs-5">
          <FaBell className="me-2" />
          {notificacionesSinLeer} Sin leer
        </Badge>
      </div>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaFilter className="me-2" />
            Filtros
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6 mb-2">
              <Form.Group>
                <Form.Label>Tipo de Notificación</Form.Label>
                <Form.Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                  <option value="todas">Todas</option>
                  <option value="tarea">Tareas</option>
                  <option value="evaluacion">Evaluaciones</option>
                  <option value="proyecto">Proyectos</option>
                  <option value="evento">Eventos</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6 mb-2">
              <Form.Group>
                <Form.Label>Materia</Form.Label>
                <Form.Select value={filtroMateria} onChange={(e) => setFiltroMateria(e.target.value)}>
                  <option value="todas">Todas las materias</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Lista de notificaciones */}
      {notificacionesFiltradas.length > 0 ? (
        <ListGroup>
          {notificacionesFiltradas.map(notif => (
            <ListGroup.Item 
              key={notif.id}
              className={`mb-2 shadow-sm ${!notif.leida ? 'border-warning border-2' : ''}`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <Badge bg={obtenerColorTipo(notif.tipo)} className="me-2">
                      {notif.tipo.toUpperCase()}
                    </Badge>
                    <Badge bg="info" className="me-2">
                      {obtenerNombreMateria(notif.materiaId)}
                    </Badge>
                    {!notif.leida && (
                      <Badge bg="warning">
                        NUEVA
                      </Badge>
                    )}
                  </div>
                  <h5 className="mb-2">{notif.titulo}</h5>
                  <p className="mb-2 text-muted">{notif.mensaje}</p>
                  <small className="text-muted">
                    Fecha: {new Date(notif.fecha).toLocaleDateString('es-ES')}
                  </small>
                </div>
                {!notif.leida && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => marcarComoLeida(notif.id)}
                    className="ms-3"
                  >
                    <FaCheckCircle className="me-1" />
                    Marcar leída
                  </Button>
                )}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info">
          <FaBell className="me-2" />
          No hay notificaciones para mostrar con los filtros seleccionados
        </Alert>
      )}
    </div>
  )
}

export default MisNotificaciones
