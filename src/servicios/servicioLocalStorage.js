// Servicio completo para manejar localStorage con CRUD

// ===== USUARIOS =====
export const obtenerUsuarios = () => {
  const datos = localStorage.getItem('usuarios')
  return datos ? JSON.parse(datos) : []
}

export const guardarUsuarios = (usuarios) => {
  localStorage.setItem('usuarios', JSON.stringify(usuarios))
}

export const crearUsuario = (usuario) => {
  const usuarios = obtenerUsuarios()
  const nuevoUsuario = {
    ...usuario,
    id: Date.now().toString(),
    fechaRegistro: new Date().toISOString().split('T')[0]
  }
  usuarios.push(nuevoUsuario)
  guardarUsuarios(usuarios)
  return nuevoUsuario
}

export const actualizarUsuario = (id, datosActualizados) => {
  const usuarios = obtenerUsuarios()
  const indice = usuarios.findIndex(u => u.id === id)
  if (indice !== -1) {
    usuarios[indice] = { ...usuarios[indice], ...datosActualizados }
    guardarUsuarios(usuarios)
    return usuarios[indice]
  }
  return null
}

export const eliminarUsuario = (id) => {
  const usuarios = obtenerUsuarios()
  const usuariosFiltrados = usuarios.filter(u => u.id !== id)
  guardarUsuarios(usuariosFiltrados)
  return true
}

export const obtenerUsuarioPorId = (id) => {
  const usuarios = obtenerUsuarios()
  return usuarios.find(u => u.id === id)
}

export const obtenerUsuariosPorRol = (rol) => {
  const usuarios = obtenerUsuarios()
  return usuarios.filter(u => u.rol === rol)
}

// ===== MATERIAS =====
export const obtenerMaterias = () => {
  const datos = localStorage.getItem('materias')
  return datos ? JSON.parse(datos) : []
}

export const guardarMaterias = (materias) => {
  localStorage.setItem('materias', JSON.stringify(materias))
}

export const crearMateria = (materia) => {
  const materias = obtenerMaterias()
  const nuevaMateria = {
    ...materia,
    id: Date.now().toString()
  }
  materias.push(nuevaMateria)
  guardarMaterias(materias)
  return nuevaMateria
}

export const actualizarMateria = (id, datosActualizados) => {
  const materias = obtenerMaterias()
  const indice = materias.findIndex(m => m.id === id)
  if (indice !== -1) {
    materias[indice] = { ...materias[indice], ...datosActualizados }
    guardarMaterias(materias)
    return materias[indice]
  }
  return null
}

export const eliminarMateria = (id) => {
  const materias = obtenerMaterias()
  const materiasFiltradas = materias.filter(m => m.id !== id)
  guardarMaterias(materiasFiltradas)
  return true
}

export const obtenerMateriaPorId = (id) => {
  const materias = obtenerMaterias()
  return materias.find(m => m.id === id)
}

export const obtenerMateriasPorDocente = (docenteId) => {
  const materias = obtenerMaterias()
  return materias.filter(m => m.docenteId === docenteId)
}

// ===== CALIFICACIONES =====
export const obtenerCalificaciones = () => {
  const datos = localStorage.getItem('calificaciones')
  return datos ? JSON.parse(datos) : []
}

export const guardarCalificaciones = (calificaciones) => {
  localStorage.setItem('calificaciones', JSON.stringify(calificaciones))
}

export const crearCalificacion = (calificacion) => {
  const calificaciones = obtenerCalificaciones()
  const nuevaCalificacion = {
    ...calificacion,
    id: Date.now().toString(),
    fecha: new Date().toISOString().split('T')[0]
  }
  calificaciones.push(nuevaCalificacion)
  guardarCalificaciones(calificaciones)
  return nuevaCalificacion
}

export const actualizarCalificacion = (id, datosActualizados) => {
  const calificaciones = obtenerCalificaciones()
  const indice = calificaciones.findIndex(c => c.id === id)
  if (indice !== -1) {
    calificaciones[indice] = { ...calificaciones[indice], ...datosActualizados }
    guardarCalificaciones(calificaciones)
    return calificaciones[indice]
  }
  return null
}

export const eliminarCalificacion = (id) => {
  const calificaciones = obtenerCalificaciones()
  const calificacionesFiltradas = calificaciones.filter(c => c.id !== id)
  guardarCalificaciones(calificacionesFiltradas)
  return true
}

export const obtenerCalificacionesPorEstudiante = (estudianteId) => {
  const calificaciones = obtenerCalificaciones()
  return calificaciones.filter(c => c.estudianteId === estudianteId)
}

export const obtenerCalificacionesPorMateria = (materiaId) => {
  const calificaciones = obtenerCalificaciones()
  return calificaciones.filter(c => c.materiaId === materiaId)
}

export const calcularPromedioEstudiante = (estudianteId, periodoId = null) => {
  let calificaciones = obtenerCalificacionesPorEstudiante(estudianteId)
  if (periodoId) {
    calificaciones = calificaciones.filter(c => c.periodoId === periodoId)
  }
  if (calificaciones.length === 0) return 0
  const suma = calificaciones.reduce((acc, cal) => acc + parseFloat(cal.nota), 0)
  return (suma / calificaciones.length).toFixed(2)
}

// ===== ASISTENCIAS =====
export const obtenerAsistencias = () => {
  const datos = localStorage.getItem('asistencias')
  return datos ? JSON.parse(datos) : []
}

export const guardarAsistencias = (asistencias) => {
  localStorage.setItem('asistencias', JSON.stringify(asistencias))
}

export const crearAsistencia = (asistencia) => {
  const asistencias = obtenerAsistencias()
  const nuevaAsistencia = {
    ...asistencia,
    id: Date.now().toString(),
    fecha: asistencia.fecha || new Date().toISOString().split('T')[0]
  }
  asistencias.push(nuevaAsistencia)
  guardarAsistencias(asistencias)
  return nuevaAsistencia
}

export const actualizarAsistencia = (id, datosActualizados) => {
  const asistencias = obtenerAsistencias()
  const indice = asistencias.findIndex(a => a.id === id)
  if (indice !== -1) {
    asistencias[indice] = { ...asistencias[indice], ...datosActualizados }
    guardarAsistencias(asistencias)
    return asistencias[indice]
  }
  return null
}

export const eliminarAsistencia = (id) => {
  const asistencias = obtenerAsistencias()
  const asistenciasFiltradas = asistencias.filter(a => a.id !== id)
  guardarAsistencias(asistenciasFiltradas)
  return true
}

export const obtenerAsistenciasPorEstudiante = (estudianteId) => {
  const asistencias = obtenerAsistencias()
  return asistencias.filter(a => a.estudianteId === estudianteId)
}

export const obtenerAsistenciasPorMateria = (materiaId) => {
  const asistencias = obtenerAsistencias()
  return asistencias.filter(a => a.materiaId === materiaId)
}

export const calcularPorcentajeAsistencia = (estudianteId, materiaId = null) => {
  let asistencias = obtenerAsistenciasPorEstudiante(estudianteId)
  if (materiaId) {
    asistencias = asistencias.filter(a => a.materiaId === materiaId)
  }
  if (asistencias.length === 0) return 0
  const presentes = asistencias.filter(a => a.estado === 'presente').length
  return ((presentes / asistencias.length) * 100).toFixed(1)
}

// ===== PERIODOS =====
export const obtenerPeriodos = () => {
  const datos = localStorage.getItem('periodos')
  return datos ? JSON.parse(datos) : []
}

export const guardarPeriodos = (periodos) => {
  localStorage.setItem('periodos', JSON.stringify(periodos))
}

export const crearPeriodo = (periodo) => {
  const periodos = obtenerPeriodos()
  const nuevoPeriodo = {
    ...periodo,
    id: Date.now().toString()
  }
  periodos.push(nuevoPeriodo)
  guardarPeriodos(periodos)
  return nuevoPeriodo
}

export const actualizarPeriodo = (id, datosActualizados) => {
  const periodos = obtenerPeriodos()
  const indice = periodos.findIndex(p => p.id === id)
  if (indice !== -1) {
    periodos[indice] = { ...periodos[indice], ...datosActualizados }
    guardarPeriodos(periodos)
    return periodos[indice]
  }
  return null
}

export const eliminarPeriodo = (id) => {
  const periodos = obtenerPeriodos()
  const periodosFiltrados = periodos.filter(p => p.id !== id)
  guardarPeriodos(periodosFiltrados)
  return true
}

export const obtenerPeriodoActivo = () => {
  const periodos = obtenerPeriodos()
  return periodos.find(p => p.activo === true)
}

// ===== NOTIFICACIONES =====
export const obtenerNotificaciones = () => {
  const datos = localStorage.getItem('notificaciones')
  return datos ? JSON.parse(datos) : []
}

export const guardarNotificaciones = (notificaciones) => {
  localStorage.setItem('notificaciones', JSON.stringify(notificaciones))
}

export const crearNotificacion = (notificacion) => {
  const notificaciones = obtenerNotificaciones()
  const nuevaNotificacion = {
    ...notificacion,
    id: Date.now().toString(),
    fecha: new Date().toISOString().split('T')[0],
    leida: false
  }
  notificaciones.push(nuevaNotificacion)
  guardarNotificaciones(notificaciones)
  return nuevaNotificacion
}

export const actualizarNotificacion = (id, datosActualizados) => {
  const notificaciones = obtenerNotificaciones()
  const indice = notificaciones.findIndex(n => n.id === id)
  if (indice !== -1) {
    notificaciones[indice] = { ...notificaciones[indice], ...datosActualizados }
    guardarNotificaciones(notificaciones)
    return notificaciones[indice]
  }
  return null
}

export const eliminarNotificacion = (id) => {
  const notificaciones = obtenerNotificaciones()
  const notificacionesFiltradas = notificaciones.filter(n => n.id !== id)
  guardarNotificaciones(notificacionesFiltradas)
  return true
}

export const obtenerNotificacionesPorMateria = (materiaId) => {
  const notificaciones = obtenerNotificaciones()
  return notificaciones.filter(n => n.materiaId === materiaId)
}

export const marcarNotificacionComoLeida = (id) => {
  return actualizarNotificacion(id, { leida: true })
}

// ===== OBSERVACIONES =====
export const obtenerObservaciones = () => {
  const datos = localStorage.getItem('observaciones')
  return datos ? JSON.parse(datos) : []
}

export const guardarObservaciones = (observaciones) => {
  localStorage.setItem('observaciones', JSON.stringify(observaciones))
}

export const crearObservacion = (observacion) => {
  const observaciones = obtenerObservaciones()
  const nuevaObservacion = {
    ...observacion,
    id: Date.now().toString(),
    fecha: new Date().toISOString().split('T')[0]
  }
  observaciones.push(nuevaObservacion)
  guardarObservaciones(observaciones)
  return nuevaObservacion
}

export const actualizarObservacion = (id, datosActualizados) => {
  const observaciones = obtenerObservaciones()
  const indice = observaciones.findIndex(o => o.id === id)
  if (indice !== -1) {
    observaciones[indice] = { ...observaciones[indice], ...datosActualizados }
    guardarObservaciones(observaciones)
    return observaciones[indice]
  }
  return null
}

export const eliminarObservacion = (id) => {
  const observaciones = obtenerObservaciones()
  const observacionesFiltradas = observaciones.filter(o => o.id !== id)
  guardarObservaciones(observacionesFiltradas)
  return true
}

export const obtenerObservacionesPorEstudiante = (estudianteId) => {
  const observaciones = obtenerObservaciones()
  return observaciones.filter(o => o.estudianteId === estudianteId)
}

// ===== UTILIDADES =====
export const inicializarDatos = (datosIniciales) => {
  if (!localStorage.getItem('usuarios')) {
    guardarUsuarios(datosIniciales.usuarios)
  }
  if (!localStorage.getItem('materias')) {
    guardarMaterias(datosIniciales.materias)
  }
  if (!localStorage.getItem('calificaciones')) {
    guardarCalificaciones(datosIniciales.calificaciones)
  }
  if (!localStorage.getItem('asistencias')) {
    guardarAsistencias(datosIniciales.asistencias)
  }
  if (!localStorage.getItem('periodos')) {
    guardarPeriodos(datosIniciales.periodos)
  }
  if (!localStorage.getItem('notificaciones')) {
    guardarNotificaciones(datosIniciales.notificaciones)
  }
  if (!localStorage.getItem('observaciones')) {
    guardarObservaciones(datosIniciales.observaciones)
  }
}

export const limpiarTodosDatos = () => {
  localStorage.removeItem('usuarios')
  localStorage.removeItem('materias')
  localStorage.removeItem('calificaciones')
  localStorage.removeItem('asistencias')
  localStorage.removeItem('periodos')
  localStorage.removeItem('notificaciones')
  localStorage.removeItem('observaciones')
}

export const exportarDatos = () => {
  const datos = {
    usuarios: obtenerUsuarios(),
    materias: obtenerMaterias(),
    calificaciones: obtenerCalificaciones(),
    asistencias: obtenerAsistencias(),
    periodos: obtenerPeriodos(),
    notificaciones: obtenerNotificaciones(),
    observaciones: obtenerObservaciones()
  }
  return JSON.stringify(datos, null, 2)
}

export const importarDatos = (datosJSON) => {
  try {
    const datos = JSON.parse(datosJSON)
    if (datos.usuarios) guardarUsuarios(datos.usuarios)
    if (datos.materias) guardarMaterias(datos.materias)
    if (datos.calificaciones) guardarCalificaciones(datos.calificaciones)
    if (datos.asistencias) guardarAsistencias(datos.asistencias)
    if (datos.periodos) guardarPeriodos(datos.periodos)
    if (datos.notificaciones) guardarNotificaciones(datos.notificaciones)
    if (datos.observaciones) guardarObservaciones(datos.observaciones)
    return true
  } catch (error) {
    console.error('Error al importar datos:', error)
    return false
  }
}
