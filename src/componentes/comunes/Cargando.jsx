const Cargando = ({ texto = 'Cargando...', tamaño = 'normal' }) => {
  const obtenerTamaño = () => {
    switch (tamaño) {
      case 'pequeño':
        return { width: '1.5rem', height: '1.5rem' }
      case 'grande':
        return { width: '4rem', height: '4rem' }
      default:
        return { width: '3rem', height: '3rem' }
    }
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <div 
        className="spinner-border text-primary mb-3" 
        role="status"
        style={obtenerTamaño()}
      >
        <span className="visually-hidden">{texto}</span>
      </div>
      <p className="text-muted">{texto}</p>
    </div>
  )
}

export default Cargando
