import { useState, useEffect } from 'react'
import { Card, Row, Col, Badge, Table } from 'react-bootstrap'
import { FaUsers, FaBook, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import * as servicio from '../../servicios/servicioLocalStorage'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const DashboardAdmin = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalEstudiantes: 0,
    totalDocentes: 0,
    totalMaterias: 0,
    estudiantesBajoRendimiento: []
  })

  const [datosGraficas, setDatosGraficas] = useState({
    rendimientoPorMateria: null,
    distribucionRoles: null
  })

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = () => {
    const usuarios = servicio.obtenerUsuarios()
    const materias = servicio.obtenerMaterias()
    const estudiantes = usuarios.filter(u => u.rol === 'estudiante')
    const docentes = usuarios.filter(u => u.rol === 'docente')

    // Calcular estudiantes con bajo rendimiento
    const estudiantesBajo = estudiantes.filter(est => {
      const promedio = parseFloat(servicio.calcularPromedioEstudiante(est.id))
      return promedio > 0 && promedio < 3.0
    }).map(est => ({
      ...est,
      promedio: servicio.calcularPromedioEstudiante(est.id)
    }))

    setEstadisticas({
      totalEstudiantes: estudiantes.length,
      totalDocentes: docentes.length,
      totalMaterias: materias.length,
      estudiantesBajoRendimiento: estudiantesBajo
    })

    // Datos para gráfica de rendimiento por materia
    const materiaStats = materias.map(materia => {
      const calificaciones = servicio.obtenerCalificacionesPorMateria(materia.id)
      if (calificaciones.length === 0) return { materia: materia.nombre, promedio: 0 }
      const suma = calificaciones.reduce((acc, cal) => acc + parseFloat(cal.nota), 0)
      return {
        materia: materia.nombre,
        promedio: (suma / calificaciones.length).toFixed(2)
      }
    })

    setDatosGraficas({
      rendimientoPorMateria: {
        labels: materiaStats.map(m => m.materia),
        datasets: [{
          label: 'Promedio por Materia',
          data: materiaStats.map(m => m.promedio),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      distribucionRoles: {
        labels: ['Estudiantes', 'Docentes', 'Administradores'],
        datasets: [{
          data: [
            estudiantes.length,
            docentes.length,
            usuarios.filter(u => u.rol === 'administrador').length
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ]
        }]
      }
    })
  }

  return (
    <div>
      <h2 className="mb-4">Dashboard Administrador</h2>

      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Estudiantes</h6>
                  <h2 className="mb-0">{estadisticas.totalEstudiantes}</h2>
                </div>
                <FaUsers size={40} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Docentes</h6>
                  <h2 className="mb-0">{estadisticas.totalDocentes}</h2>
                </div>
                <FaChartLine size={40} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-info">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Materias</h6>
                  <h2 className="mb-0">{estadisticas.totalMaterias}</h2>
                </div>
                <FaBook size={40} className="text-info" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficas */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Rendimiento por Materia</h5>
            </Card.Header>
            <Card.Body>
              {datosGraficas.rendimientoPorMateria && (
                <Bar
                  data={datosGraficas.rendimientoPorMateria}
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
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Distribución de Usuarios</h5>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center">
              {datosGraficas.distribucionRoles && (
                <div style={{ maxWidth: '300px' }}>
                  <Doughnut data={datosGraficas.distribucionRoles} />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas de bajo rendimiento */}
      {estadisticas.estudiantesBajoRendimiento.length > 0 && (
        <Card className="shadow-sm border-warning">
          <Card.Header className="bg-warning text-dark">
            <h5 className="mb-0">
              <FaExclamationTriangle className="me-2" />
              Estudiantes con Bajo Rendimiento
            </h5>
          </Card.Header>
          <Card.Body>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Nivel</th>
                  <th>Promedio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {estadisticas.estudiantesBajoRendimiento.map(estudiante => (
                  <tr key={estudiante.id}>
                    <td>{estudiante.nombre}</td>
                    <td>{estudiante.email}</td>
                    <td>{estudiante.nivel}</td>
                    <td>
                      <strong className="text-danger">{estudiante.promedio}</strong>
                    </td>
                    <td>
                      <Badge bg="danger">Requiere Atención</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}

export default DashboardAdmin
