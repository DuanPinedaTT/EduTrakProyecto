import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as servicioStorage from '../servicios/servicioLocalStorage'

const ContextoAutenticacion = createContext()

export const useAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacion)
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de ProveedorAutenticacion')
  }
  return contexto
}

export const ProveedorAutenticacion = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Verificar si hay sesión activa
    const usuarioGuardado = localStorage.getItem('usuarioActual')
    if (usuarioGuardado) {
      setUsuarioActual(JSON.parse(usuarioGuardado))
    }
    setCargando(false)
  }, [])

  const iniciarSesion = (email, password) => {
    const usuarios = servicioStorage.obtenerUsuarios()
    const usuario = usuarios.find(u => u.email === email && u.password === password)
    
    if (usuario) {
      const usuarioSinPassword = { ...usuario }
      delete usuarioSinPassword.password
      setUsuarioActual(usuarioSinPassword)
      localStorage.setItem('usuarioActual', JSON.stringify(usuarioSinPassword))
      return { exito: true, usuario: usuarioSinPassword }
    }
    
    return { exito: false, mensaje: 'Credenciales incorrectas' }
  }

  const cerrarSesion = () => {
    setUsuarioActual(null)
    localStorage.removeItem('usuarioActual')
  }

  const actualizarUsuarioActual = (datosActualizados) => {
    const usuarioActualizado = { ...usuarioActual, ...datosActualizados }
    setUsuarioActual(usuarioActualizado)
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado))
  }

  const valor = {
    usuarioActual,
    iniciarSesion,
    cerrarSesion,
    actualizarUsuarioActual,
    estaAutenticado: !!usuarioActual
  }

  if (cargando) {
    return <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  }

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}
