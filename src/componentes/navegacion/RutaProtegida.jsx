import { Navigate, Outlet } from 'react-router-dom'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import LayoutDashboard from '../layout/LayoutDashboard'

const RutaProtegida = ({ rolesPermitidos }) => {
  const { usuarioActual, estaAutenticado } = useAutenticacion()

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }

  if (!rolesPermitidos.includes(usuarioActual.rol)) {
    return <Navigate to="/login" replace />
  }

  return (
    <LayoutDashboard>
      <Outlet />
    </LayoutDashboard>
  )
}

export default RutaProtegida
