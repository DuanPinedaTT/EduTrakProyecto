import { useState } from 'react'
import { InputGroup, Form, Button } from 'react-bootstrap'
import { FaSearch, FaTimes } from 'react-icons/fa'

const Buscador = ({ 
  placeholder = 'Buscar...', 
  onBuscar, 
  valorInicial = '',
  className = '' 
}) => {
  const [busqueda, setBusqueda] = useState(valorInicial)

  const manejarCambio = (e) => {
    const valor = e.target.value
    setBusqueda(valor)
    onBuscar(valor)
  }

  const limpiarBusqueda = () => {
    setBusqueda('')
    onBuscar('')
  }

  return (
    <InputGroup className={className}>
      <InputGroup.Text>
        <FaSearch />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={busqueda}
        onChange={manejarCambio}
      />
      {busqueda && (
        <Button 
          variant="outline-secondary" 
          onClick={limpiarBusqueda}
          title="Limpiar búsqueda"
        >
          <FaTimes />
        </Button>
      )}
    </InputGroup>
  )
}

export default Buscador
