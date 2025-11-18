import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProveedorAutenticacion } from './contextos/ProveedorAutenticacion'
import RutaProtegida from './componentes/navegacion/RutaProtegida'
import Login from './paginas/login/Login'

// Páginas Administrador
import DashboardAdmin from './paginas/administrador/DashboardAdmin'
import GestionUsuarios from './paginas/administrador/GestionUsuarios'
import GestionMaterias from './paginas/administrador/GestionMaterias'
import GestionPeriodos from './paginas/administrador/GestionPeriodos'
import Reportes from './paginas/administrador/Reportes'

// Páginas Docente
import DashboardDocente from './paginas/docente/DashboardDocente'
import GestionCalificaciones from './paginas/docente/GestionCalificaciones'
import GestionAsistencias from './paginas/docente/GestionAsistencias'
import GestionNotificaciones from './paginas/docente/GestionNotificaciones'
import GestionObservaciones from './paginas/docente/GestionObservaciones'

// Páginas Estudiante
import DashboardEstudiante from './paginas/estudiante/DashboardEstudiante'
import MisCalificaciones from './paginas/estudiante/MisCalificaciones'
import MisAsistencias from './paginas/estudiante/MisAsistencias'
import MisNotificaciones from './paginas/estudiante/MisNotificaciones'
import MiPerfil from './paginas/estudiante/MiPerfil'

const App = () => {
  return (
    <BrowserRouter>
      <ProveedorAutenticacion>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas Administrador */}
          <Route path="/admin" element={<RutaProtegida rolesPermitidos={['administrador']} />}>
            <Route index element={<DashboardAdmin />} />
            <Route path="usuarios" element={<GestionUsuarios />} />
            <Route path="materias" element={<GestionMaterias />} />
            <Route path="periodos" element={<GestionPeriodos />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>

          {/* Rutas Docente */}
          <Route path="/docente" element={<RutaProtegida rolesPermitidos={['docente']} />}>
            <Route index element={<DashboardDocente />} />
            <Route path="calificaciones" element={<GestionCalificaciones />} />
            <Route path="asistencias" element={<GestionAsistencias />} />
            <Route path="notificaciones" element={<GestionNotificaciones />} />
            <Route path="observaciones" element={<GestionObservaciones />} />
          </Route>

          {/* Rutas Estudiante */}
          <Route path="/estudiante" element={<RutaProtegida rolesPermitidos={['estudiante']} />}>
            <Route index element={<DashboardEstudiante />} />
            <Route path="calificaciones" element={<MisCalificaciones />} />
            <Route path="asistencias" element={<MisAsistencias />} />
            <Route path="notificaciones" element={<MisNotificaciones />} />
            <Route path="perfil" element={<MiPerfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ProveedorAutenticacion>
    </BrowserRouter>
  )
}

export default App
