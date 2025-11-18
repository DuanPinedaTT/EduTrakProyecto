import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { FaGraduationCap, FaEnvelope, FaLock } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import { inicializarDatos } from '../../servicios/servicioLocalStorage'
import { datosIniciales } from '../../utils/datosIniciales'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [validated, setValidated] = useState(false)
  const { iniciarSesion } = useAutenticacion()
  const navigate = useNavigate()

  // Inicializar datos de prueba al cargar el componente
  useState(() => {
    inicializarDatos(datosIniciales)
  }, [])

  const manejarSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    setError('')
    const resultado = iniciarSesion(email, password)

    if (resultado.exito) {
      // Redirigir según rol
      switch (resultado.usuario.rol) {
        case 'administrador':
          navigate('/admin')
          break
        case 'docente':
          navigate('/docente')
          break
        case 'estudiante':
          navigate('/estudiante')
          break
        default:
          navigate('/')
      }
    } else {
      setError(resultado.mensaje)
    }
  }

  return (
    <div className="login-page min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <FaGraduationCap size={60} className="text-primary mb-3" />
                  <h2 className="fw-bold text-primary">EduTrack</h2>
                  <p className="text-muted">Sistema de Gestión Académica</p>
                </div>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={manejarSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaEnvelope className="me-2" />
                      Correo Electrónico
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="usuario@edutrack.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Por favor ingrese un correo válido
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FaLock className="me-2" />
                      Contraseña
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Form.Control.Feedback type="invalid">
                      La contraseña debe tener al menos 6 caracteres
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 mb-3">
                    Iniciar Sesión
                  </Button>
                </Form>

                <hr />

                <div className="text-center">
                  <small className="text-muted">Usuarios de prueba:</small>
                  <div className="mt-2">
                    <small className="d-block">
                      <strong>Admin:</strong> admin@edutrack.com / admin123
                    </small>
                    <small className="d-block">
                      <strong>Docente:</strong> docente@edutrack.com / docente123
                    </small>
                    <small className="d-block">
                      <strong>Estudiante:</strong> estudiante@edutrack.com / estudiante123
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login
