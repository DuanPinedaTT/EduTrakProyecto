import { Alert } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'

const AlertaBajoRendimiento = ({ estudiante, promedio, materia = null, onClose }) => {
  return (
    <Alert variant="warning" dismissible onClose={onClose} className="shadow-sm">
      <Alert.Heading>
        <FaExclamationTriangle className="me-2" />
        Alerta de Bajo Rendimiento
      </Alert.Heading>
      <hr />
      <p className="mb-0">
        <strong>Estudiante:</strong> {estudiante}
      </p>
      {materia && (
        <p className="mb-0">
          <strong>Materia:</strong> {materia}
        </p>
      )}
      <p className="mb-0">
        <strong>Promedio:</strong> <span className="text-danger fw-bold">{promedio}</span>
      </p>
      <hr />
      <p className="mb-0 small">
        Este estudiante requiere atención especial. Se recomienda:
      </p>
      <ul className="small mb-0 mt-2">
        <li>Programar tutorías adicionales</li>
        <li>Revisar el plan de estudios personalizado</li>
        <li>Contactar a los padres o acudientes</li>
      </ul>
    </Alert>
  )
}

export default AlertaBajoRendimiento
