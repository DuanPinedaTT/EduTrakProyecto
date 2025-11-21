import { useState, useEffect } from 'react'
import { Card, Table, Badge, Form, Row, Col, Alert } from 'react-bootstrap'
import { Doughnut } from 'react-chartjs-2'
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'
import Cargando from '../../componentes/comunes/Cargando'

const MisAsistencias = () => {
  const { usuarioActual } = useAutenticacion()
  const [materias, setMaterias] = useState([])
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('todas')
  const [asistencias, setAsistencias] = useState([])
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    presentes: 0,
    ausentes: 0,
    tardanzas: 0,
    porcentaje: 0
  })
  const [datosGrafica, setDatosGrafica] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarAsistencias()
  }, [materiaSeleccionada])

  const cargarDatos = () => {
    setCargando(true)
    setTimeout(() => {
      const materiasDB = servicio.obtenerMaterias()
      setMaterias(materiasDB)
      setCargando(false)
    }, 500)
  }

  const cargarAsistencias = () => {
    let asists = servicio.obtenerAsistenciasPorEstudiante(usuarioActual.id)
    
    if (materiaSeleccionada !== 'todas') {
      asists = asists.filter(a => a.materiaId === materiaSeleccionada)
    }

    asists.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    setAsistencias(asists)

    const total = asists.length
    const presentes = asists.filter(a => a.estado === 'presente').length
    const ausentes = asists.filter(a => a.estado === 'ausente').length
    const tardanzas = asists.filter(a => a.estado === 'tardanza').length
    const porcentaje = total > 0 ? ((presentes / total) * 100).toFixed(1) : 0

    setEstadisticas({ total, presentes, ausentes, tardanzas, porcentaje })

    setDatosGrafica({
      labels: ['Presente', 'Ausente', 'Tardanza'],
      datasets: [{
        data: [presentes, ausentes, tardanzas],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    })
  }

  const obtenerNombreMateria = (materiaId) => {
    const materia = materias.find(m => m.id === materiaId)
    return materia ? materia.nombre : 'Desconocida'
  }

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'presente':
        return <FaCheckCircle className="text-success me-2" />
      case 'ausente':
        return <FaTimesCircle className="text-danger me-2" />
      case 'tardanza':
        return <FaClock className="text-warning me-2" />
      default:
        return null
    }
  }

  if (cargando) {
    return <Cargando texto="Cargando asistencias..." />
  }

  return (
    <div>
      <h2 className="mb-4">Mis Asistencias</h2>

      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-primary text-center">
            <Card.Body>
              <h6 className="text-muted">Total Registros</h6>
              <h2>{estadisticas.total}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-success text-center">
            <Card.Body>
              <h6 className="text-muted">Presentes</h6>
              <h2 className="text-success">{estadisticas.presentes}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-danger text-center">
            <Card.Body>
              <h6 className="text-muted">Ausentes</h6>
              <h2 className="text-danger">{estadisticas.ausentes}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-info text-center">
            <Card.Body>
              <h6 className="text-muted">% Asistencia</h6>
              <h2 className="text-info">{estadisticas.porcentaje}%</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Distribución de Asistencias</h5>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center">
              {datosGrafica && (
                <div style={{ maxWidth: '300px' }}>
                  <Doughnut data={datosGrafica} />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Filtrar Asistencias</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label><strong>Seleccionar Materia</strong></Form.Label>
                <Form.Select 
                  value={materiaSeleccionada} 
                  onChange={(e) => setMateriaSeleccionada(e.target.value)}
                  size="lg"
                >
                  <option value="todas">Todas las materias</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Alert variant="info" className="mt-3">
                <strong>Estado:</strong>
                {parseFloat(estadisticas.porcentaje) >= 80 ? (
                  <p className="mb-0 mt-2 text-success">
                    <FaCheckCircle className="me-2" />
                    Excelente asistencia
                  </p>
                ) : (
                  <p className="mb-0 mt-2 text-warning">
                    <FaTimesCircle className="me-2" />
                    Debes mejorar tu asistencia
                  </p>
                )}
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0">Historial de Asistencias</h5>
        </Card.Header>
        <Card.Body>
          {asistencias.length > 0 ? (
            <Table striped hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Materia</th>
                  <th>Estado</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.map(asist => (
                  <tr key={asist.id}>
                    <td>{new Date(asist.fecha).toLocaleDateString('es-ES')}</td>
                    <td><Badge bg="info">{obtenerNombreMateria(asist.materiaId)}</Badge></td>
                    <td>
                      <Badge bg={
                        asist.estado === 'presente' ? 'success' :
                        asist.estado === 'ausente' ? 'danger' : 'warning'
                      }>
                        {obtenerIconoEstado(asist.estado)}
                        {asist.estado.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{asist.observacion || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">
              No hay registros de asistencia para mostrar
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default MisAsistencias
