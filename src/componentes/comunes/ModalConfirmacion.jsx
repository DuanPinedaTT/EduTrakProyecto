import { Modal, Button } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'

const ModalConfirmacion = ({ 
  mostrar, 
  onCerrar, 
  onConfirmar, 
  titulo = 'Confirmar Acción',
  mensaje = '¿Está seguro que desea realizar esta acción?',
  textoBotonConfirmar = 'Confirmar',
  textoBotonCancelar = 'Cancelar',
  variante = 'danger'
}) => {
  return (
    <Modal show={mostrar} onHide={onCerrar} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaExclamationTriangle className="text-warning me-2" />
          {titulo}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{mensaje}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCerrar}>
          {textoBotonCancelar}
        </Button>
        <Button variant={variante} onClick={onConfirmar}>
          {textoBotonConfirmar}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalConfirmacion
