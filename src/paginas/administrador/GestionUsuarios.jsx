import { useState, useEffect } from 'react'
import { Card, Button, Table, Modal, Form, Badge, Alert, InputGroup } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import * as servicio from '../../servicios/servicioLocalStorage'
import Buscador from '../../componentes/comunes/Buscador'
import ModalConfirmacion from '../../componentes/comunes/ModalConfirmacion'
import Cargando from '../../componentes/comunes/Cargando'

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [validated, setValidated] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false)
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)
  const [cargando, setCargando] = useState(true)

  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'estudiante',
    telefono: '',
    direccion: '',
    nivel: ''
  })

  useEffect(() => {
    cargarUsuarios()
  }, [])

  useEffect(() => {
    filtrarUsuarios()
  }, [usuarios, busqueda, filtroRol])

  const cargarUsuarios = () => {
    setCargando(true)
    setTimeout(() => {
      const usuariosDB = servicio.obtenerUsuarios()
      setUsuarios(usuariosDB)
      setCargando(false)
    }, 500)
  }

  const filtrarUsuarios = () => {
    let resultado = [...usuarios]

    // Filtrar por búsqueda
    if (busqueda) {
      resultado = resultado.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    // Filtrar por rol
    if (filtroRol !== 'todos') {
      resultado = resultado.filter(u => u.rol === filtroRol)
    }

    setUsuariosFiltrados(resultado)
  }

  const abrirModalCrear = () => {
    setModoEdicion(false)
    setUsuarioActual(null)
    setFormulario({
      nombre: '',
      email: '',
      password: '',
      rol: 'estudiante',
      telefono: '',
      direccion: '',
      nivel: ''
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true)
    setUsuarioActual(usuario)
    setFormulario({
      nombre: usuario.nombre,
      email: usuario.email,
      password: usuario.password,
      rol: usuario.rol,
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      nivel: usuario.nivel || ''
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setUsuarioActual(null)
    setValidated(false)
  }

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

    if (modoEdicion) {
      servicio.actualizarUsuario(usuarioActual.id, formulario)
      mostrarAlerta('success', 'Usuario actualizado correctamente')
    } else {
      servicio.crearUsuario(formulario)
      mostrarAlerta('success', 'Usuario creado correctamente')
    }

    cargarUsuarios()
    cerrarModal()
  }

  const confirmarEliminar = (usuario) => {
    setUsuarioAEliminar(usuario)
    setMostrarModalConfirmacion(true)
  }

  const eliminarUsuario = () => {
    if (usuarioAEliminar) {
      servicio.eliminarUsuario(usuarioAEliminar.id)
      mostrarAlerta('success', 'Usuario eliminado correctamente')
      cargarUsuarios()
      setMostrarModalConfirmacion(false)
      setUsuarioAEliminar(null)
    }
  }

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje })
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' })
    }, 3000)
  }

  const obtenerColorRol = (rol) => {
    switch (rol) {
      case 'administrador': return 'danger'
      case 'docente': return 'primary'
      case 'estudiante': return 'success'
      default: return 'secondary'
    }
  }

  const manejarBusqueda = (termino) => {
    setBusqueda(termino)
  }

  if (cargando) {
    return <Cargando texto="Cargando usuarios..." />
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <Button variant="primary" onClick={abrirModalCrear}>
          <FaPlus className="me-2" />
          Nuevo Usuario
        </Button>
      </div>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <div className="row">
            <div className="col-md-6 mb-2">
              <Buscador
                placeholder="Buscar por nombre o email..."
                onBuscar={manejarBusqueda}
                valorInicial={busqueda}
              />
            </div>
            <div className="col-md-6 mb-2">
              <Form.Select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                <option value="todos">Todos los roles</option>
                <option value="administrador">Administradores</option>
                <option value="docente">Docentes</option>
                <option value="estudiante">Estudiantes</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla de usuarios */}
      <Card className="shadow-sm">
        <Card.Body>
          <Table striped hover responsive>
            <thead className="table-primary">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Nivel</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <Badge bg={obtenerColorRol(usuario.rol)}>
                        {usuario.rol.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{usuario.telefono || '-'}</td>
                    <td>{usuario.nivel || '-'}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirModalEditar(usuario)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmarEliminar(usuario)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de formulario */}
      <Modal show={mostrarModal} onHide={cerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={manejarSubmit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6 mb-3">
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
              </div>

              <div className="col-md-6 mb-3">
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
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Contraseña *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formulario.password}
                    onChange={manejarCambio}
                    required
                    minLength={6}
                  />
                  <Form.Control.Feedback type="invalid">
                    La contraseña debe tener al menos 6 caracteres
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Rol *</Form.Label>
                  <Form.Select
                    name="rol"
                    value={formulario.rol}
                    onChange={manejarCambio}
                    required
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="administrador">Administrador</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={manejarCambio}
                  />
                </Form.Group>
              </div>

              {formulario.rol === 'estudiante' && (
                <div className="col-md-6 mb-3">
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
                </div>
              )}

              <div className="col-12 mb-3">
                <Form.Group>
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="direccion"
                    value={formulario.direccion}
                    onChange={manejarCambio}
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {modoEdicion ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <ModalConfirmacion
        mostrar={mostrarModalConfirmacion}
        onCerrar={() => setMostrarModalConfirmacion(false)}
        onConfirmar={eliminarUsuario}
        titulo="Confirmar Eliminación"
        mensaje={`¿Está seguro que desea eliminar al usuario ${usuarioAEliminar?.nombre}? Esta acción no se puede deshacer.`}
        textoBotonConfirmar="Eliminar"
        variante="danger"
      />
    </div>
  )
}

export default GestionUsuarios
