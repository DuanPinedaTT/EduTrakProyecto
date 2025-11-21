import { useState, useEffect } from 'react'
import { Card, Button, Table, Form, Row, Col, Badge } from 'react-bootstrap'
import { FaDownload, FaFilePdf, FaFileExcel, FaChartBar } from 'react-icons/fa'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import * as servicio from '../../servicios/servicioLocalStorage'
import Cargando from '../../componentes/comunes/Cargando'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const Reportes = () => {
  const [periodos, setPeriodos] = useState([])
  const [materias, setMaterias] = useState([])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('')
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('')
  const [tipoReporte, setTipoReporte] = useState('general')
  const [datosReporte, setDatosReporte] = useState(null)
  const [estudiantesReporte, setEstudiantesReporte] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (tipoReporte) {
      generarReporte()
    }
  }, [tipoReporte, periodoSeleccionado, materiaSeleccionada])

  const cargarDatos = () => {
    const periodosDB = servicio.obtenerPeriodos()
    const materiasDB = servicio.obtenerMaterias()
    setPeriodos(periodosDB)
    setMaterias(materiasDB)
    
    const periodoActivo = periodosDB.find(p => p.activo)
    if (periodoActivo) {
      setPeriodoSeleccionado(periodoActivo.id)
    }
  }

  const generarReporte = () => {
    setCargando(true)
    
    setTimeout(() => {
      const estudiantes = servicio.obtenerUsuariosPorRol('estudiante')
      
      if (tipoReporte === 'general') {
        generarReporteGeneral(estudiantes)
      } else if (tipoReporte === 'materia' && materiaSeleccionada) {
        generarReportePorMateria(estudiantes)
      } else if (tipoReporte === 'asistencia') {
        generarReporteAsistencia(estudiantes)
      }
      
      setCargando(false)
    }, 800)
  }

  const generarReporteGeneral = (estudiantes) => {
    const estudiantesConDatos = estudiantes.map(est => {
      const promedio = servicio.calcularPromedioEstudiante(est.id, periodoSeleccionado)
      const porcentajeAsistencia = servicio.calcularPorcentajeAsistencia(est.id)
      return {
        ...est,
        promedio: parseFloat(promedio) || 0,
        asistencia: parseFloat(porcentajeAsistencia) || 0
      }
    })

    setEstudiantesReporte(estudiantesConDatos)

    setDatosReporte({
      labels: estudiantesConDatos.map(e => e.nombre.split(' ')[0]),
      datasets: [
        {
          label: 'Promedio',
          data: estudiantesConDatos.map(e => e.promedio),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    })
  }

  const generarReportePorMateria = (estudiantes) => {
    const materia = servicio.obtenerMateriaPorId(materiaSeleccionada)
    if (!materia) return

    const estudiantesConDatos = estudiantes.map(est => {
      const calificaciones = servicio.obtenerCalificacionesPorEstudiante(est.id)
        .filter(c => c.materiaId === materiaSeleccionada)
      
      if (periodoSeleccionado) {
        const califs = calificaciones.filter(c => c.periodoId === periodoSeleccionado)
        const promedio = califs.length > 0 
          ? (califs.reduce((sum, c) => sum + parseFloat(c.nota), 0) / califs.length).toFixed(2)
          : '0.00'
        return { ...est, promedio: parseFloat(promedio) }
      }
      
      const promedio = calificaciones.length > 0
        ? (calificaciones.reduce((sum, c) => sum + parseFloat(c.nota), 0) / calificaciones.length).toFixed(2)
        : '0.00'
      return { ...est, promedio: parseFloat(promedio) }
    }).filter(e => e.promedio > 0)

    setEstudiantesReporte(estudiantesConDatos)

    setDatosReporte({
      labels: estudiantesConDatos.map(e => e.nombre.split(' ')[0]),
      datasets: [
        {
          label: `Promedio en ${materia.nombre}`,
          data: estudiantesConDatos.map(e => e.promedio),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    })
  }

  const generarReporteAsistencia = (estudiantes) => {
    const estudiantesConDatos = estudiantes.map(est => {
      const asistencias = servicio.obtenerAsistenciasPorEstudiante(est.id)
      const total = asistencias.length
      const presentes = asistencias.filter(a => a.estado === 'presente').length
      const ausentes = asistencias.filter(a => a.estado === 'ausente').length
      const tardanzas = asistencias.filter(a => a.estado === 'tardanza').length
      const porcentaje = total > 0 ? ((presentes / total) * 100).toFixed(1) : 0

      return {
        ...est,
        totalAsistencias: total,
        presentes,
        ausentes,
        tardanzas,
        porcentaje: parseFloat(porcentaje)
      }
    })

    setEstudiantesReporte(estudiantesConDatos)

    setDatosReporte({
      labels: estudiantesConDatos.map(e => e.nombre.split(' ')[0]),
      datasets: [
        {
          label: '% Asistencia',
          data: estudiantesConDatos.map(e => e.porcentaje),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    })
  }

  const exportarCSV = () => {
    let csv = ''
    let encabezados = []
    let filas = []

    if (tipoReporte === 'general') {
      encabezados = ['Nombre', 'Email', 'Nivel', 'Promedio', '% Asistencia']
      filas = estudiantesReporte.map(e => 
        [e.nombre, e.email, e.nivel || '-', e.promedio, e.asistencia].join(',')
      )
    } else if (tipoReporte === 'materia') {
      encabezados = ['Nombre', 'Email', 'Nivel', 'Promedio']
      filas = estudiantesReporte.map(e => 
        [e.nombre, e.email, e.nivel || '-', e.promedio].join(',')
      )
    } else if (tipoReporte === 'asistencia') {
      encabezados = ['Nombre', 'Total', 'Presentes', 'Ausentes', 'Tardanzas', '% Asistencia']
      filas = estudiantesReporte.map(e => 
        [e.nombre, e.totalAsistencias, e.presentes, e.ausentes, e.tardanzas, e.porcentaje].join(',')
      )
    }

    csv = encabezados.join(',') + '\n' + filas.join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportarJSON = () => {
    const datos = servicio.exportarDatos()
    const blob = new Blob([datos], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `edutrack_backup_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const importarJSON = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (evento) => {
        const resultado = servicio.importarDatos(evento.target.result)
        if (resultado) {
          alert('Datos importados correctamente')
          window.location.reload()
        } else {
          alert('Error al importar datos')
        }
      }
      reader.readAsText(file)
    }
  }

  const imprimirReporte = () => {
    window.print()
  }

  return (
    <div>
      <h2 className="mb-4">Reportes y Estadísticas</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FaChartBar className="me-2" />
            Configuración de Reporte
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Tipo de Reporte</Form.Label>
                <Form.Select value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value)}>
                  <option value="general">Reporte General</option>
                  <option value="materia">Por Materia</option>
                  <option value="asistencia">Asistencias</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Periodo</Form.Label>
                <Form.Select value={periodoSeleccionado} onChange={(e) => setPeriodoSeleccionado(e.target.value)}>
                  <option value="">Todos los periodos</option>
                  {periodos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {tipoReporte === 'materia' && (
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Materia</Form.Label>
                  <Form.Select value={materiaSeleccionada} onChange={(e) => setMateriaSeleccionada(e.target.value)}>
                    <option value="">Seleccione una materia</option>
                    {materias.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>

          <div className="d-flex gap-2 mt-3">
            <Button variant="success" onClick={exportarCSV}>
              <FaFileExcel className="me-2" />
              Exportar CSV
            </Button>
            <Button variant="danger" onClick={imprimirReporte}>
              <FaFilePdf className="me-2" />
              Imprimir/PDF
            </Button>
            <Button variant="info" onClick={exportarJSON}>
              <FaDownload className="me-2" />
              Exportar Datos
            </Button>
            <Button variant="warning" as="label" htmlFor="importar-archivo">
              <FaDownload className="me-2" />
              Importar Datos
              <input
                id="importar-archivo"
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={importarJSON}
              />
            </Button>
          </div>
        </Card.Body>
      </Card>

      {cargando ? (
        <Cargando texto="Generando reporte..." tamaño="grande" />
      ) : (
        <>
          {datosReporte && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Visualización Gráfica</h5>
              </Card.Header>
              <Card.Body>
                <Bar
                  data={datosReporte}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: tipoReporte === 'asistencia' ? 100 : 5
                      }
                    }
                  }}
                />
              </Card.Body>
            </Card>
          )}

          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Datos Detallados</h5>
            </Card.Header>
            <Card.Body>
              {estudiantesReporte.length > 0 ? (
                <Table striped hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Nivel</th>
                      {tipoReporte === 'general' && (
                        <>
                          <th>Promedio</th>
                          <th>% Asistencia</th>
                          <th>Estado</th>
                        </>
                      )}
                      {tipoReporte === 'materia' && (
                        <>
                          <th>Promedio</th>
                          <th>Estado</th>
                        </>
                      )}
                      {tipoReporte === 'asistencia' && (
                        <>
                          <th>Total</th>
                          <th>Presentes</th>
                          <th>Ausentes</th>
                          <th>Tardanzas</th>
                          <th>%</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantesReporte.map(estudiante => (
                      <tr key={estudiante.id}>
                        <td><strong>{estudiante.nombre}</strong></td>
                        <td>{estudiante.email}</td>
                        <td>{estudiante.nivel || '-'}</td>
                        {tipoReporte === 'general' && (
                          <>
                            <td>
                              <Badge bg={estudiante.promedio >= 3.0 ? 'success' : 'danger'}>
                                {estudiante.promedio.toFixed(2)}
                              </Badge>
                            </td>
                            <td>{estudiante.asistencia}%</td>
                            <td>
                              <Badge bg={estudiante.promedio >= 3.0 ? 'success' : 'warning'}>
                                {estudiante.promedio >= 3.0 ? 'Aprobado' : 'Bajo Rendimiento'}
                              </Badge>
                            </td>
                          </>
                        )}
                        {tipoReporte === 'materia' && (
                          <>
                            <td>
                              <Badge bg={estudiante.promedio >= 3.0 ? 'success' : 'danger'}>
                                {estudiante.promedio.toFixed(2)}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={estudiante.promedio >= 3.0 ? 'success' : 'warning'}>
                                {estudiante.promedio >= 3.0 ? 'Aprobado' : 'Necesita Refuerzo'}
                              </Badge>
                            </td>
                          </>
                        )}
                        {tipoReporte === 'asistencia' && (
                          <>
                            <td>{estudiante.totalAsistencias}</td>
                            <td><Badge bg="success">{estudiante.presentes}</Badge></td>
                            <td><Badge bg="danger">{estudiante.ausentes}</Badge></td>
                            <td><Badge bg="warning">{estudiante.tardanzas}</Badge></td>
                            <td>
                              <strong className={estudiante.porcentaje >= 80 ? 'text-success' : 'text-danger'}>
                                {estudiante.porcentaje}%
                              </strong>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center text-muted">No hay datos disponibles para mostrar</p>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  )
}

export default Reportes
