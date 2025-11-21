import { useState, useEffect } from 'react'
import { Card, Button, Table, Form, Badge, Alert, Row, Col } from 'react-bootstrap'
import { FaPlus, FaCheck, FaTimes, FaClock } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'
import Cargando from '../../componentes/comunes/Cargando'

const GestionAsistencias = () => {
  const { usuarioActual } = useAutenticacion()
  const [materias, setMaterias] = useState([])
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [estudiantes, setEstudiantes] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (materiaSeleccionada && fecha) {
      cargarAsistencias()
    }
  }, [materiaSeleccionada, fecha])

  const cargarDatos = () => {
    setCargando(true)
    setTimeout(() => {
      const materiasDocente = servicio.obtenerMateriasPorDocente(usuarioActual.id)
      const estudiantesDB = servicio.obtenerUsuariosPorRol('estudiante')
      
      setMaterias(materiasDocente)
      setEstudiantes(estudiantesDB)

      if (materiasDocente.length > 0) {
        setMateriaSeleccionada(materiasDocente[0].id)
      }
      setCargando(false)
    }, 500)
  }

  const cargarAsistencias = () => {
    const asists = servicio.obtenerAsistenciasPorMateria(materiaSeleccionada)
      .filter(a => a.fecha === fecha)
    setAsistencias(asists)
  }

  const registrarAsistenciaRapida = (estudianteId, estado) => {
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
    mostrarAlerta('success', 'Asistencia registrada')
  }

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje })
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' })
    }, 2000)
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

  if (cargando) {
    return <Cargando texto="Cargando asistencias..." />
  }

  return (
    <div>
      <h2 className="mb-4">Gestión de Asistencias</h2>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

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

      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-2">
              <Form.Group>
                <Form.Label>Materia</Form.Label>
                <Form.Select value={materiaSeleccionada} onChange={(e) => setMateriaSeleccionada(e.target.value)}>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} - {m.nivel}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-2">
              <Form.Group>
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
