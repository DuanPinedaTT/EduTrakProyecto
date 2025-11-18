import { useState, useEffect } from 'react'
import { Card, Button, Table, Modal, Form, Badge, Alert, Row, Col } from 'react-bootstrap'
import { FaPlus, FaEdit, FaCheck, FaTimes, FaClock } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'

const GestionAsistencias = () => {
  const { usuarioActual } = useAutenticacion()
  const [materias, setMaterias] = useState([])
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [estudiantes, setEstudiantes] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [mostrarModalRapido, setMostrarModalRapido] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (materiaSeleccionada && fecha) {
      cargarAsistencias()
    }
  }, [materiaSeleccionada, fecha])

  const cargarDatos = () => {
    const materiasDocente = servicio.obtenerMateriasPorDocente(usuarioActual.id)
    const estudiantesDB = servicio.obtenerUsuariosPorRol('estudiante')
    
    setMaterias(materiasDocente)
    setEstudiantes(estudiantesDB)

    if (materiasDocente.length > 0) {
      setMateriaSeleccionada(materiasDocente[0].id)
    }
  }

  const cargarAsistencias = () => {
    const asists = servicio.obtenerAsistenciasPorMateria(materiaSeleccionada)
      .filter(a => a.fecha === fecha)
    setAsistencias(asists)
  }

  const abrirRegistroRapido = () => {
    setMostrarModalRapido(true)
  }

  const registrarAsistenciaRapida = (estudianteId, estado) => {
    // Verificar si ya existe asistencia para ese estudiante en esa fecha
    const asistenciaExistente = asistencias.find(a => 
      a.estudianteId === estudianteId && 
      a.fecha === fecha && 
      a.materiaId === materiaSeleccionada
    )

    if (asistenciaExistente) {
      servicio.actualizarAsistencia(asistenciaExistente.id, { estado })
    } else {
      servicio.crearAsistencia({
        estudianteId,
        materiaId: materiaSeleccionada,
        fecha,
        estado,
        observacion: ''
      })
    }

    cargarAsistencias()
  }

  const cambiarEstadoAsistencia = (asistenciaId, nuevoEstado) => {
    servicio.actualizarAsistencia(asistenciaId, { estado: nuevoEstado })
    mostrarAlerta('success', 'Asistencia actualizada')
    cargarAsistencias()
  }

  const eliminarAsistencia = (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro de asistencia?')) {
      servicio.eliminarAsistencia(id)
      mostrarAlerta('success', 'Asistencia eliminada')
      cargarAsistencias()
    }
  }

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje })
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' })
    }, 3000)
  }

  const obtenerAsistenciaEstudiante = (estudianteId) => {
    return asistencias.find(a => a.estudianteId === estudianteId)
  }

  const calcularEstadisticas = () => {
    const total = asistencias.length
    const presentes = asistencias.filter(a => a.estado === 'presente').length
    const ausentes = asistencias.filter(a => a.estado === 'ausente').length
    const tardanzas = asistencias.filter(a => a.estado === 'tardanza').length
    const porcentaje = total > 0 ? ((presentes / total) * 100).toFixed(1) : 0

    return { total, presentes, ausentes, tardanzas, porcentaje }
  }

  const stats = calcularEstadisticas()

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'presente': return 'success'
      case 'ausente': return 'danger'
      case 'tardanza': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Asistencias</h2>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

      {/* Estadísticas */}
      <Row className="mb-3">
        <Col md={3} className="mb-2">
          <Card className="shadow-sm border-primary">
            <Card.Body className="text-center">
              <h6 className="text-muted">Total Registros</h6>
              <h3>{stats.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-2">
          <Card className="shadow-sm border-success">
            <Card.Body className="text-center">
              <h6 className="text-muted">Presentes</h6>
              <h3 className="text-success">{stats.presentes}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-2">
          <Card className="shadow-sm border-danger">
            <Card.Body className="text-center">
              <h6 className="text-muted">Ausentes</h6>
              <h3 className="text-danger">{stats.ausentes}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-2">
          <Card className="shadow-sm border-warning">
            <Card.Body className="text-center">
              <h6 className="text-muted">% Asistencia</h6>
              <h3 className="text-info">{stats.porcentaje}%</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="mb-2 d-flex align-items-end">
              <Button variant="primary" onClick={abrirRegistroRapido} className="w-100">
                <FaPlus className="me-2" />
                Registro
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de asistencias */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Lista de Asistencia - {fecha}</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Observación</th>
                <th>Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map(estudiante => {
                const asistencia = obtenerAsistenciaEstudiante(estudiante.id)
                return (
                  <tr key={estudiante.id}>
                    <td><strong>{estudiante.nombre}</strong></td>
                    <td>
                      {asistencia ? (
                        <Badge bg={obtenerColorEstado(asistencia.estado)}>
                          {asistencia.estado.toUpperCase()}
                        </Badge>
                      ) : (
                        <Badge bg="secondary">SIN REGISTRO</Badge>
                      )}
                    </td>
                    <td>{asistencia?.observacion || '-'}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-1"
                        onClick={() => registrarAsistenciaRapida(estudiante.id, 'presente')}
                        title="Marcar presente"
                      >
                        <FaCheck />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="me-1"
                        onClick={() => registrarAsistenciaRapida(estudiante.id, 'ausente')}
                        title="Marcar ausente"
                      >
                        <FaTimes />
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => registrarAsistenciaRapida(estudiante.id, 'tardanza')}
                        title="Marcar tardanza"
                      >
                        <FaClock />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  )
}

export default GestionAsistencias
