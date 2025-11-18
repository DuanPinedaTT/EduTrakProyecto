import { useState, useEffect } from 'react'
import { Card, Button, Table, Modal, Form, Badge, Alert, InputGroup } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import * as servicio from '../../servicios/servicioLocalStorage'

const GestionMaterias = () => {
  const [materias, setMaterias] = useState([])
  const [materiasFiltradas, setMateriasFiltradas] = useState([])
  const [docentes, setDocentes] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [materiaActual, setMateriaActual] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [validated, setValidated] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false)
  const [materiaAEliminar, setMateriaAEliminar] = useState(null)

  const [formulario, setFormulario] = useState({
    nombre: '',
    codigo: '',
    nivel: '',
    docenteId: '',
    horasSemanales: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    filtrarMaterias()
  }, [materias, busqueda])

  const cargarDatos = () => {
    const materiasDB = servicio.obtenerMaterias()
    const docentesDB = servicio.obtenerUsuariosPorRol('docente')
    setMaterias(materiasDB)
    setDocentes(docentesDB)
  }

  const filtrarMaterias = () => {
    let resultado = [...materias]

    if (busqueda) {
      resultado = resultado.filter(m =>
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.nivel.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    setMateriasFiltradas(resultado)
  }

  const abrirModalCrear = () => {
    setModoEdicion(false)
    setMateriaActual(null)
    setFormulario({
      nombre: '',
      codigo: '',
      nivel: '',
      docenteId: '',
      horasSemanales: ''
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const abrirModalEditar = (materia) => {
    setModoEdicion(true)
    setMateriaActual(materia)
    setFormulario({
      nombre: materia.nombre,
      codigo: materia.codigo,
      nivel: materia.nivel,
      docenteId: materia.docenteId,
      horasSemanales: materia.horasSemanales
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setMateriaActual(null)
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
      servicio.actualizarMateria(materiaActual.id, formulario)
      mostrarAlerta('success', 'Materia actualizada correctamente')
    } else {
      servicio.crearMateria(formulario)
      mostrarAlerta('success', 'Materia creada correctamente')
    }

    cargarDatos()
    cerrarModal()
  }

  const confirmarEliminar = (materia) => {
    setMateriaAEliminar(materia)
    setMostrarModalConfirmacion(true)
  }

  const eliminarMateria = () => {
    if (materiaAEliminar) {
      servicio.eliminarMateria(materiaAEliminar.id)
      mostrarAlerta('success', 'Materia eliminada correctamente')
      cargarDatos()
      setMostrarModalConfirmacion(false)
      setMateriaAEliminar(null)
    }
  }

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje })
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' })
    }, 3000)
  }

  const obtenerNombreDocente = (docenteId) => {
    const docente = docentes.find(d => d.id === docenteId)
    return docente ? docente.nombre : 'Sin asignar'
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Materias</h2>
        <Button variant="primary" onClick={abrirModalCrear}>
          <FaPlus className="me-2" />
          Nueva Materia
        </Button>
      </div>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por nombre, código o nivel..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Table striped hover responsive>
            <thead className="table-primary">
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Nivel</th>
                <th>Docente</th>
                <th>Horas/Semana</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiasFiltradas.length > 0 ? (
                materiasFiltradas.map(materia => (
                  <tr key={materia.id}>
                    <td>
                      <Badge bg="info">{materia.codigo}</Badge>
                    </td>
                    <td><strong>{materia.nombre}</strong></td>
                    <td>{materia.nivel}</td>
                    <td>{obtenerNombreDocente(materia.docenteId)}</td>
                    <td>{materia.horasSemanales}h</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirModalEditar(materia)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmarEliminar(materia)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No se encontraron materias
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de formulario */}
      <Modal show={mostrarModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Materia' : 'Crear Nueva Materia'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={manejarSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Materia *</Form.Label>
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

            <Form.Group className="mb-3">
              <Form.Label>Código *</Form.Label>
              <Form.Control
                type="text"
                name="codigo"
                value={formulario.codigo}
                onChange={manejarCambio}
                placeholder="Ej: MAT-101"
                required
              />
              <Form.Control.Feedback type="invalid">
                El código es requerido
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nivel/Grado *</Form.Label>
              <Form.Control
                type="text"
                name="nivel"
                value={formulario.nivel}
                onChange={manejarCambio}
                placeholder="Ej: 10°, 11°"
                required
              />
              <Form.Control.Feedback type="invalid">
                El nivel es requerido
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Docente Asignado *</Form.Label>
              <Form.Select
                name="docenteId"
                value={formulario.docenteId}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccione un docente</option>
                {docentes.map(docente => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombre}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Debe seleccionar un docente
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Horas Semanales *</Form.Label>
              <Form.Control
                type="number"
                name="horasSemanales"
                value={formulario.horasSemanales}
                onChange={manejarCambio}
                min="1"
                max="10"
                required
              />
              <Form.Control.Feedback type="invalid">
                Las horas semanales son requeridas (1-10)
              </Form.Control.Feedback>
            </Form.Group>
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

      {/* Modal de confirmación */}
      <Modal show={mostrarModalConfirmacion} onHide={() => setMostrarModalConfirmacion(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar la materia <strong>{materiaAEliminar?.nombre}</strong>?
          Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalConfirmacion(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarMateria}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default GestionMaterias
