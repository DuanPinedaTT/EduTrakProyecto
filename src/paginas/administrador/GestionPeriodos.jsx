import { useState, useEffect } from 'react'
import { Card, Button, Table, Modal, Form, Badge, Alert } from 'react-bootstrap'
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import * as servicio from '../../servicios/servicioLocalStorage'
import ModalConfirmacion from '../../componentes/comunes/ModalConfirmacion'
import Cargando from '../../componentes/comunes/Cargando'

const GestionPeriodos = () => {
  const [periodos, setPeriodos] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [periodoActual, setPeriodoActual] = useState(null)
  const [validated, setValidated] = useState(false)
  const [alerta, setAlerta] = useState({ mostrar: false, tipo: '', mensaje: '' })
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false)
  const [periodoAEliminar, setPeriodoAEliminar] = useState(null)
  const [cargando, setCargando] = useState(true)

  const [formulario, setFormulario] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    activo: false
  })

  useEffect(() => {
    cargarPeriodos()
  }, [])

  const cargarPeriodos = () => {
    setCargando(true)
    setTimeout(() => {
      const periodosDB = servicio.obtenerPeriodos()
      setPeriodos(periodosDB)
      setCargando(false)
    }, 500)
  }

  const abrirModalCrear = () => {
    setModoEdicion(false)
    setPeriodoActual(null)
    setFormulario({
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      activo: false
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const abrirModalEditar = (periodo) => {
    setModoEdicion(true)
    setPeriodoActual(periodo)
    setFormulario({
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      activo: periodo.activo
    })
    setValidated(false)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setPeriodoActual(null)
    setValidated(false)
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    setFormulario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const manejarSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    if (new Date(formulario.fechaFin) <= new Date(formulario.fechaInicio)) {
      mostrarAlerta('danger', 'La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    if (formulario.activo) {
      const todosPeriodos = servicio.obtenerPeriodos()
      todosPeriodos.forEach(p => {
        if (p.activo) {
          servicio.actualizarPeriodo(p.id, { activo: false })
        }
      })
    }

    if (modoEdicion) {
      servicio.actualizarPeriodo(periodoActual.id, formulario)
      mostrarAlerta('success', 'Periodo actualizado correctamente')
    } else {
      servicio.crearPeriodo(formulario)
      mostrarAlerta('success', 'Periodo creado correctamente')
    }

    cargarPeriodos()
    cerrarModal()
  }

  const confirmarEliminar = (periodo) => {
    setPeriodoAEliminar(periodo)
    setMostrarModalConfirmacion(true)
  }

  const eliminarPeriodo = () => {
    if (periodoAEliminar) {
      servicio.eliminarPeriodo(periodoAEliminar.id)
      mostrarAlerta('success', 'Periodo eliminado correctamente')
      cargarPeriodos()
      setMostrarModalConfirmacion(false)
      setPeriodoAEliminar(null)
    }
  }

  const alternarEstado = (periodo) => {
    if (!periodo.activo) {
      periodos.forEach(p => {
        if (p.activo) {
          servicio.actualizarPeriodo(p.id, { activo: false })
        }
      })
    }
    servicio.actualizarPeriodo(periodo.id, { activo: !periodo.activo })
    cargarPeriodos()
    mostrarAlerta('success', `Periodo ${!periodo.activo ? 'activado' : 'desactivado'} correctamente`)
  }

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ mostrar: true, tipo, mensaje })
    setTimeout(() => {
      setAlerta({ mostrar: false, tipo: '', mensaje: '' })
    }, 3000)
  }

  if (cargando) {
    return <Cargando texto="Cargando periodos académicos..." />
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Periodos Académicos</h2>
        <Button variant="primary" onClick={abrirModalCrear}>
          <FaPlus className="me-2" />
          Nuevo Periodo
        </Button>
      </div>

      {alerta.mostrar && (
        <Alert variant={alerta.tipo} dismissible onClose={() => setAlerta({ ...alerta, mostrar: false })}>
          {alerta.mensaje}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Table striped hover responsive>
            <thead className="table-primary">
              <tr>
                <th>Nombre del Periodo</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periodos.length > 0 ? (
                periodos.map(periodo => (
                  <tr key={periodo.id}>
                    <td><strong>{periodo.nombre}</strong></td>
                    <td>{new Date(periodo.fechaInicio).toLocaleDateString('es-ES')}</td>
                    <td>{new Date(periodo.fechaFin).toLocaleDateString('es-ES')}</td>
                    <td>
                      <Badge bg={periodo.activo ? 'success' : 'secondary'}>
                        {periodo.activo ? (
                          <>
                            <FaCheckCircle className="me-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="me-1" />
                            Inactivo
                          </>
                        )}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant={periodo.activo ? 'secondary' : 'success'}
                        size="sm"
                        className="me-2"
                        onClick={() => alternarEstado(periodo)}
                      >
                        {periodo.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => abrirModalEditar(periodo)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmarEliminar(periodo)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No hay periodos académicos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={cerrarModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modoEdicion ? 'Editar Periodo' : 'Crear Nuevo Periodo'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={manejarSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Periodo *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={manejarCambio}
                placeholder="Ej: Primer Periodo 2025"
                required
              />
              <Form.Control.Feedback type="invalid">
                El nombre es requerido
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de Inicio *</Form.Label>
              <Form.Control
                type="date"
                name="fechaInicio"
                value={formulario.fechaInicio}
                onChange={manejarCambio}
                required
              />
              <Form.Control.Feedback type="invalid">
                La fecha de inicio es requerida
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de Fin *</Form.Label>
              <Form.Control
                type="date"
                name="fechaFin"
                value={formulario.fechaFin}
                onChange={manejarCambio}
                required
              />
              <Form.Control.Feedback type="invalid">
                La fecha de fin es requerida
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="activo"
                label="Periodo Activo (se desactivarán los demás)"
                checked={formulario.activo}
                onChange={manejarCambio}
              />
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

      <ModalConfirmacion
        mostrar={mostrarModalConfirmacion}
        onCerrar={() => setMostrarModalConfirmacion(false)}
        onConfirmar={eliminarPeriodo}
        titulo="Confirmar Eliminación"
        mensaje={`¿Está seguro que desea eliminar el periodo ${periodoAEliminar?.nombre}? Esta acción no se puede deshacer.`}
        textoBotonConfirmar="Eliminar"
        variante="danger"
      />
    </div>
  )
}

export default GestionPeriodos
