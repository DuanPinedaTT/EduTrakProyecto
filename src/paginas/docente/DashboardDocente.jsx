import { useState, useEffect } from 'react'
import { Card, Row, Col, Badge, Table, Alert } from 'react-bootstrap'
import { FaBook, FaUsers, FaExclamationTriangle, FaChartLine } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'
import Cargando from '../../componentes/comunes/Cargando'
import AlertaBajoRendimiento from '../../componentes/comunes/AlertaBajoRendimiento'

const DashboardDocente = () => {
  const { usuarioActual } = useAutenticacion()
  const [estadisticas, setEstadisticas] = useState({
    materiasAsignadas: [],
    totalEstudiantes: 0,
    estudiantesBajoRendimiento: [],
    promedioGeneral: 0
  })
  const [cargando, setCargando] = useState(true)
  const [alertasVisibles, setAlertasVisibles] = useState({})

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = () => {
    setCargando(true)
    
    setTimeout(() => {
      const materias = servicio.obtenerMateriasPorDocente(usuarioActual.id)
      const todosEstudiantes = servicio.obtenerUsuariosPorRol('estudiante')
      
      const estudiantesConCalificaciones = new Set()
      let sumaPromedios = 0
      let contadorPromedios = 0

      materias.forEach(materia => {
        const calificaciones = servicio.obtenerCalificacionesPorMateria(materia.id)
        calificaciones.forEach(cal => {
          estudiantesConCalificaciones.add(cal.estudianteId)
        })
      })

      const estudiantesBajo = []
      materias.forEach(materia => {
        const calificaciones = servicio.obtenerCalificacionesPorMateria(materia.id)
        const estudiantesPorMateria = {}

        calificaciones.forEach(cal => {
          if (!estudiantesPorMateria[cal.estudianteId]) {
            estudiantesPorMateria[cal.estudianteId] = []
          }
          estudiantesPorMateria[cal.estudianteId].push(parseFloat(cal.nota))
        })

        Object.keys(estudiantesPorMateria).forEach(estudianteId => {
          const notas = estudiantesPorMateria[estudianteId]
          const promedio = notas.reduce((sum, nota) => sum + nota, 0) / notas.length
          
          if (promedio < 3.0) {
            const estudiante = todosEstudiantes.find(e => e.id === estudianteId)
            if (estudiante && !estudiantesBajo.find(e => e.id === estudianteId)) {
              estudiantesBajo.push({
                ...estudiante,
                materia: materia.nombre,
                promedio: promedio.toFixed(2)
              })
            }
          }

          sumaPromedios += promedio
          contadorPromedios++
        })
      })

      setEstadisticas({
        materiasAsignadas: materias,
        totalEstudiantes: estudiantesConCalificaciones.size,
        estudiantesBajoRendimiento: estudiantesBajo,
        promedioGeneral: contadorPromedios > 0 ? (sumaPromedios / contadorPromedios).toFixed(2) : 0
      })

      const alertasIniciales = {}
      estudiantesBajo.forEach(est => {
        alertasIniciales[est.id] = true
      })
      setAlertasVisibles(alertasIniciales)

      setCargando(false)
    }, 800)
  }

  const cerrarAlerta = (estudianteId) => {
    setAlertasVisibles(prev => ({
      ...prev,
      [estudianteId]: false
    }))
  }

  if (cargando) {
    return <Cargando texto="Cargando información..." tamaño="grande" />
  }

  return (
    <div>
      <h2 className="mb-4">Dashboard Docente</h2>
      <Alert variant="info">
        <strong>Bienvenido/a, {usuarioActual.nombre}</strong>
        <p className="mb-0 mt-2">Aquí encontrarás un resumen de tus actividades académicas</p>
      </Alert>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Materias Asignadas</h6>
                  <h2 className="mb-0">{estadisticas.materiasAsignadas.length}</h2>
                </div>
                <FaBook size={40} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Estudiantes</h6>
                  <h2 className="mb-0">{estadisticas.totalEstudiantes}</h2>
                </div>
                <FaUsers size={40} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-info">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Promedio General</h6>
                  <h2 className="mb-0">{estadisticas.promedioGeneral}</h2>
                </div>
                <FaChartLine size={40} className="text-info" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Mis Materias</h5>
        </Card.Header>
        <Card.Body>
          {estadisticas.materiasAsignadas.length > 0 ? (
            <Row>
              {estadisticas.materiasAsignadas.map(materia => (
                <Col md={6} lg={4} key={materia.id} className="mb-3">
                  <Card className="h-100 border-primary">
                    <Card.Body>
                      <h5 className="text-primary">{materia.nombre}</h5>
                      <p className="mb-1">
                        <strong>Código:</strong> <Badge bg="info">{materia.codigo}</Badge>
                      </p>
                      <p className="mb-1">
                        <strong>Nivel:</strong> {materia.nivel}
                      </p>
                      <p className="mb-0">
                        <strong>Horas/Semana:</strong> {materia.horasSemanales}h
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-center text-muted">No tienes materias asignadas</p>
          )}
        </Card.Body>
      </Card>

      {estadisticas.estudiantesBajoRendimiento.length > 0 && (
        <div>
          <h4 className="mb-3">
            <FaExclamationTriangle className="text-warning me-2" />
            Estudiantes que Requieren Atención
          </h4>
          {estadisticas.estudiantesBajoRendimiento.map(estudiante => (
            alertasVisibles[estudiante.id] && (
              <AlertaBajoRendimiento
                key={estudiante.id}
                estudiante={estudiante.nombre}
                promedio={estudiante.promedio}
                materia={estudiante.materia}
                onClose={() => cerrarAlerta(estudiante.id)}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardDocente
