import { useState, useEffect } from 'react'
import { Card, Table, Badge, Form, Row, Col, Alert } from 'react-bootstrap'
import { Bar } from 'react-chartjs-2'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'

const MisCalificaciones = () => {
  const { usuarioActual } = useAutenticacion()
  const [materias, setMaterias] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('')
  const [calificaciones, setCalificaciones] = useState([])
  const [datosGrafica, setDatosGrafica] = useState(null)
  const [promedioGeneral, setPromedioGeneral] = useState(0)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarCalificaciones()
  }, [periodoSeleccionado])

  const cargarDatos = () => {
    const materiasDB = servicio.obtenerMaterias()
    const periodosDB = servicio.obtenerPeriodos()
    
    setMaterias(materiasDB)
    setPeriodos(periodosDB)

    // Seleccionar periodo activo por defecto
    const periodoActivo = periodosDB.find(p => p.activo)
    if (periodoActivo) {
      setPeriodoSeleccionado(periodoActivo.id)
    } else if (periodosDB.length > 0) {
      setPeriodoSeleccionado(periodosDB[0].id)
    }
  }

  const cargarCalificaciones = () => {
    let califs = servicio.obtenerCalificacionesPorEstudiante(usuarioActual.id)
    
    if (periodoSeleccionado) {
      califs = califs.filter(c => c.periodoId === periodoSeleccionado)
    }

    setCalificaciones(califs)

    // Calcular promedio general
    if (califs.length > 0) {
      const suma = califs.reduce((acc, c) => acc + parseFloat(c.nota), 0)
      setPromedioGeneral((suma / califs.length).toFixed(2))
    } else {
      setPromedioGeneral(0)
    }

    // Agrupar por materia para la gráfica
    const promedioPorMateria = {}
    califs.forEach(cal => {
      if (!promedioPorMateria[cal.materiaId]) {
        promedioPorMateria[cal.materiaId] = []
      }
      promedioPorMateria[cal.materiaId].push(parseFloat(cal.nota))
    })

    const labels = []
    const datos = []

    Object.keys(promedioPorMateria).forEach(materiaId => {
      const materia = materias.find(m => m.id === materiaId)
      if (materia) {
        const notas = promedioPorMateria[materiaId]
        const promedio = (notas.reduce((sum, n) => sum + n, 0) / notas.length).toFixed(2)
        labels.push(materia.nombre)
        datos.push(parseFloat(promedio))
      }
    })

    if (labels.length > 0) {
      setDatosGrafica({
        labels,
        datasets: [{
          label: 'Promedio por Materia',
          data: datos,
          backgroundColor: datos.map(d => d >= 3.0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'),
          borderColor: datos.map(d => d >= 3.0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
          borderWidth: 1
        }]
      })
    } else {
      setDatosGrafica(null)
    }
  }

  const obtenerNombreMateria = (materiaId) => {
    const materia = materias.find(m => m.id === materiaId)
    return materia ? materia.nombre : 'Desconocida'
  }

  const calcularPromedioPorMateria = (materiaId) => {
    const califsMateria = calificaciones.filter(c => c.materiaId === materiaId)
    if (califsMateria.length === 0) return '-'
    const suma = califsMateria.reduce((acc, c) => acc + parseFloat(c.nota), 0)
    return (suma / califsMateria.length).toFixed(2)
  }

  // Agrupar calificaciones por materia
  const materiasConCalificaciones = materias.map(materia => {
    const califsMateria = calificaciones.filter(c => c.materiaId === materia.id)
    if (califsMateria.length === 0) return null
    
    return {
      materia,
      calificaciones: califsMateria,
      promedio: calcularPromedioPorMateria(materia.id)
    }
  }).filter(m => m !== null)

  return (
    <div>
      <h2 className="mb-4">Mis Calificaciones</h2>

      {/* Resumen */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-primary">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-2">Promedio General del Periodo</h6>
              <h1 className={parseFloat(promedioGeneral) >= 3.0 ? 'text-success' : 'text-danger'}>
                {promedioGeneral}
              </h1>
              <Badge bg={parseFloat(promedioGeneral) >= 3.0 ? 'success' : 'warning'}>
                {parseFloat(promedioGeneral) >= 3.0 ? 'APROBADO' : 'REQUIERE MEJORA'}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-info">
            <Card.Body>
              <Form.Group>
                <Form.Label><strong>Seleccionar Periodo</strong></Form.Label>
                <Form.Select value={periodoSeleccionado} onChange={(e) => setPeriodoSeleccionado(e.target.value)}>
                  <option value="">Todos los periodos</option>
                  {periodos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.activo && '(Activo)'}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfica */}
      {datosGrafica && (
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Gráfica de Rendimiento</h5>
          </Card.Header>
          <Card.Body>
            <Bar
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

      {/* Calificaciones por materia */}
      {materiasConCalificaciones.length > 0 ? (
        materiasConCalificaciones.map(item => (
          <Card key={item.materia.id} className="mb-3 shadow-sm">
            <Card.Header className="bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{item.materia.nombre}</h5>
                <Badge bg="light" text="dark">
                  Promedio: {item.promedio}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Nota</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {item.calificaciones.map(cal => (
                    <tr key={cal.id}>
                      <td>{new Date(cal.fecha).toLocaleDateString('es-ES')}</td>
                      <td><Badge bg="info">{cal.tipo}</Badge></td>
                      <td>
                        <Badge bg={parseFloat(cal.nota) >= 3.0 ? 'success' : 'danger'}>
                          {cal.nota}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={parseFloat(cal.nota) >= 3.0 ? 'success' : 'warning'}>
                          {parseFloat(cal.nota) >= 3.0 ? 'Aprobado' : 'Necesita Refuerzo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Alert variant="info">
          No hay calificaciones registradas para el periodo seleccionado
        </Alert>
      )}
    </div>
  )
}

export default MisCalificaciones
