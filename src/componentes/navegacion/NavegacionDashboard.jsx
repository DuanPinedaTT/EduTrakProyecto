import { Nav } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { useAutenticacion } from '../../contextos/ProveedorAutenticacion'
import { 
  FaHome, FaUsers, FaBook, FaCalendar, FaChartBar, 
  FaClipboardList, FaUserCheck, FaBell, FaComment,
  FaGraduationCap, FaUser, FaSignOutAlt 
} from 'react-icons/fa'

const NavegacionDashboard = ({ abierto, alternar }) => {
  const { usuarioActual, cerrarSesion } = useAutenticacion()
  const location = useLocation()

  const esRutaActiva = (ruta) => {
    return location.pathname === ruta || location.pathname.startsWith(ruta + '/')
  }

  const menusPorRol = {
    administrador: [
      { ruta: '/admin', icono: <FaHome />, texto: 'Dashboard' },
      { ruta: '/admin/usuarios', icono: <FaUsers />, texto: 'Usuarios' },
      { ruta: '/admin/materias', icono: <FaBook />, texto: 'Materias' },
      { ruta: '/admin/periodos', icono: <FaCalendar />, texto: 'Periodos' },
      { ruta: '/admin/reportes', icono: <FaChartBar />, texto: 'Reportes' }
    ],
    docente: [
      { ruta: '/docente', icono: <FaHome />, texto: 'Dashboard' },
      { ruta: '/docente/calificaciones', icono: <FaClipboardList />, texto: 'Calificaciones' },
      { ruta: '/docente/asistencias', icono: <FaUserCheck />, texto: 'Asistencias' },
      { ruta: '/docente/notificaciones', icono: <FaBell />, texto: 'Notificaciones' },
      { ruta: '/docente/observaciones', icono: <FaComment />, texto: 'Observaciones' }
    ],
    estudiante: [
      { ruta: '/estudiante', icono: <FaHome />, texto: 'Dashboard' },
      { ruta: '/estudiante/calificaciones', icono: <FaGraduationCap />, texto: 'Mis Calificaciones' },
      { ruta: '/estudiante/asistencias', icono: <FaUserCheck />, texto: 'Mis Asistencias' },
      { ruta: '/estudiante/notificaciones', icono: <FaBell />, texto: 'Notificaciones' },
      { ruta: '/estudiante/perfil', icono: <FaUser />, texto: 'Mi Perfil' }
    ]
  }

  const opcionesMenu = menusPorRol[usuarioActual?.rol] || []

  const manejarCerrarSesion = () => {
    cerrarSesion()
  }

  if (!abierto) return null

  return (
    <div className="sidebar bg-primary text-white min-vh-100 d-flex flex-column">
      <div className="p-3 border-bottom border-light">
        <h4 className="mb-0">
          <FaGraduationCap className="me-2" />
          EduTrack
        </h4>
        <small className="text-light">{usuarioActual?.nombre}</small>
        <br />
        <small className="badge bg-light text-primary mt-1">
          {usuarioActual?.rol?.toUpperCase()}
        </small>
      </div>
      
      <Nav className="flex-column p-3 flex-grow-1">
        {opcionesMenu.map((opcion) => (
          <Nav.Link
            key={opcion.ruta}
            as={Link}
            to={opcion.ruta}
            className={`text-white mb-2 d-flex align-items-center sidebar-link ${
              esRutaActiva(opcion.ruta) ? 'active-link' : ''
            }`}
          >
            <span className="me-2">{opcion.icono}</span>
            {opcion.texto}
          </Nav.Link>
        ))}
      </Nav>

      <div className="p-3 border-top border-light">
        <button
          className="btn btn-light w-100 d-flex align-items-center justify-content-center"
          onClick={manejarCerrarSesion}
        >
          <FaSignOutAlt className="me-2" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}

export default NavegacionDashboard
