import { useState, useEffect } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { FaUser, FaSave } from 'react-icons/fa'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import * as servicio from '../../servicios/servicioLocalStorage'

const MiPerfil = () => {
  const { usuarioActual, actualizarUsuarioActual } = useAutenticacion()
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    nivel: ''
  })
  const [validated, setValidated] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })

  useEffect(() => {
    if (usuarioActual) {
      setFormulario({
        nombre: usuarioActual.nombre || '',
        email: usuarioActual.email || '',
        telefono: usuarioActual.telefono || '',
        direccion: usuarioActual.direccion || '',
        nivel: usuarioActual.nivel || ''
      })
    }
  }, [usuarioActual])

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setFormulario(prev => ({ ...prev, [name]: value }))
  }

  const manejarSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    // Actualizar en localStorage
    servicio.actualizarUsuario(usuarioActual.id, formulario)
    
    // Actualizar en el contexto
    actualizarUsuarioActual(formulario)

    mostrarAlerta('success', 'Perfil actualizado correctamente')
    setValidated(false)
  }

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje })
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' })
    }, 3000)
  }

  return (
    <div>
      <h2 className="mb-4">Mi Perfil</h2>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Información Personal
              </h5>
            </Card.Header>
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={manejarSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Nombre Completo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formulario.nombre}
                        onChange={manejarCambio}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        El nombre es requerido
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formulario.email}
                        onChange={manejarCambio}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese un email válido
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formulario.telefono}
                        onChange={manejarCambio}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Nivel/Grado</Form.Label>
                      <Form.Control
                        type="text"
                        name="nivel"
                        value={formulario.nivel}
                        onChange={manejarCambio}
                        placeholder="Ej: 10°, 11°"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Dirección</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="direccion"
                        value={formulario.direccion}
                        onChange={manejarCambio}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit">
                    <FaSave className="me-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Información de la Cuenta</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Rol:</strong> Estudiante</p>
              <p><strong>ID:</strong> {usuarioActual?.id}</p>
              <p><strong>Fecha de Registro:</strong> {usuarioActual?.fechaRegistro}</p>
              <Alert variant="warning" className="mt-3">
                <small>
                  Si necesitas cambiar tu contraseña, contacta al administrador del sistema.
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default MiPerfil
