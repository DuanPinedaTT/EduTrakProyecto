import { useState, useEffect } from 'react'
import { Card, Row, Col, Badge, Table, Alert } from 'react-bootstrap'
import { FaGraduationCap, FaChartLine, FaBell, FaCheckCircle } from 'react-icons/fa'
import { Line } from 'react-chartjs-2'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'

const DashboardEstudiante = () => {
  const { usuarioActual } = useAutenticacion()
  const [estadisticas, setEstadisticas] = useState({
    promedioGeneral: 0,
    totalCalificaciones: 0,
    porcentajeAsistencia: 0,
    notificacionesSinLeer: 0
  })
  const [datosGrafica, setDatosGrafica] = useState(null)
  const [ultimasCalificaciones, setUltimasCalificaciones] = useState([])
  const [materiasConPromedios, setMateriasConPromedios] = useState([])

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = () => {
    // Calificaciones
    const calificaciones = servicio.obtenerCalificacionesPorEstudiante(usuarioActual.id)
    const promedio = servicio.calcularPromedioEstudiante(usuarioActual.id)
    
    // Asistencias
    const porcentaje = servicio.calcularPorcentajeAsistencia(usuarioActual.id)
    
    // Notificaciones sin leer
    const notificaciones = servicio.obtenerNotificaciones()
    const sinLeer = notificaciones.filter(n => !n.leida).length

    // Últimas 5 calificaciones
    const ultimas = calificaciones
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)
    
    setUltimasCalificaciones(ultimas)

    setEstadisticas({
      promedioGeneral: promedio,
      totalCalificaciones: calificaciones.length,
      porcentajeAsistencia: porcentaje,
      notificacionesSinLeer: sinLeer
    })

    // Calcular promedios por materia
    const materias = servicio.obtenerMaterias()
    const promediosPorMateria = materias.map(materia => {
      const califsMateria = calificaciones.filter(c => c.materiaId === materia.id)
      if (califsMateria.length === 0) return null
      
      const suma = califsMateria.reduce((acc, c) => acc + parseFloat(c.nota), 0)
      const prom = (suma / califsMateria.length).toFixed(2)
      
      return {
        materia: materia.nombre,
        promedio: parseFloat(prom)
      }
    }).filter(m => m !== null)

    setMateriasConPromedios(promediosPorMateria)

    // Datos para gráfica
    if (promediosPorMateria.length > 0) {
      setDatosGrafica({
        labels: promediosPorMateria.map(m => m.materia),
        datasets: [{
          label: 'Mi Promedio por Materia',
          data: promediosPorMateria.map(m => m.promedio),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        }]
      })
    }
  }

  const obtenerNombreMateria = (materiaId) => {
    const materia = servicio.obtenerMateriaPorId(materiaId)
    return materia ? materia.nombre : 'Desconocida'
  }

  return (
    <div>
      <h2 className="mb-4">Mi Dashboard</h2>
      <Alert variant="info">
        <strong>¡Hola, {usuarioActual.nombre}!</strong>
        <p className="mb-0 mt-2">Aquí encontrarás un resumen de tu desempeño académico</p>
      </Alert>

      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm border-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Promedio General</h6>
                  <h2 className="mb-0">{estadisticas.promedioGeneral}</h2>
                </div>
                <FaGraduationCap size={40} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Calificaciones</h6>
                  <h2 className="mb-0">{estadisticas.totalCalificaciones}</h2>
                </div>
                <FaChartLine size={40} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm border-info">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">% Asistencia</h6>
                  <h2 className="mb-0">{estadisticas.porcentajeAsistencia}%</h2>
                </div>
                <FaCheckCircle size={40} className="text-info" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="h-100 shadow-sm border-warning">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Notificaciones</h6>
                  <h2 className="mb-0">{estadisticas.notificacionesSinLeer}</h2>
                </div>
                <FaBell size={40} className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfica de rendimiento */}
      {datosGrafica && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Mi Rendimiento por Materia</h5>
          </Card.Header>
          <Card.Body>
            <Line
              data={datosGrafica}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5
                  }
                }
              }}
            />
          </Card.Body>
        </Card>
      )}

      <Row>
        {/* Últimas calificaciones */}
        <Col lg={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Últimas Calificaciones</h5>
            </Card.Header>
            <Card.Body>
              {ultimasCalificaciones.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Nota</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasCalificaciones.map(cal => (
                      <tr key={cal.id}>
                        <td>{obtenerNombreMateria(cal.materiaId)}</td>
                        <td>
                          <Badge bg={parseFloat(cal.nota) >= 3.0 ? 'success' : 'danger'}>
                            {cal.nota}
                          </Badge>
                        </td>
                        <td><Badge bg="info">{cal.tipo}</Badge></td>
                        <td>{new Date(cal.fecha).toLocaleDateString('es-ES')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center text-muted">No hay calificaciones registradas</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Promedios por materia */}
        <Col lg={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Mis Promedios</h5>
            </Card.Header>
            <Card.Body>
              {materiasConPromedios.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Promedio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiasConPromedios.map((item, index) => (
                      <tr key={index}>
                        <td><strong>{item.materia}</strong></td>
                        <td>
                          <Badge bg={item.promedio >= 3.0 ? 'success' : 'danger'}>
                            {item.promedio}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={item.promedio >= 3.0 ? 'success' : 'warning'}>
                            {item.promedio >= 3.0 ? 'Aprobado' : 'Requiere Mejora'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center text-muted">No hay promedios disponibles</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardEstudiante
