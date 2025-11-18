export const datosIniciales = {
  usuarios: [
    {
      id: '1',
      nombre: 'Admin Principal',
      email: 'admin@edutrack.com',
      password: 'admin123',
      rol: 'administrador',
      telefono: '3001234567',
      direccion: 'Calle Principal 123',
      fechaRegistro: '2025-01-01'
    },
    {
      id: '2',
      nombre: 'María González',
      email: 'docente@edutrack.com',
      password: 'docente123',
      rol: 'docente',
      telefono: '3009876543',
      direccion: 'Avenida Educación 456',
      fechaRegistro: '2025-01-05'
    },
    {
      id: '3',
      nombre: 'Carlos Ramírez',
      email: 'carlos.ramirez@edutrack.com',
      password: 'docente123',
      rol: 'docente',
      telefono: '3007654321',
      direccion: 'Calle Académica 789',
      fechaRegistro: '2025-01-06'
    },
    {
      id: '4',
      nombre: 'Juan Pérez',
      email: 'estudiante@edutrack.com',
      password: 'estudiante123',
      rol: 'estudiante',
      telefono: '3005551234',
      direccion: 'Calle Estudiantes 321',
      fechaRegistro: '2025-01-10',
      nivel: '10°'
    },
    {
      id: '5',
      nombre: 'Ana Martínez',
      email: 'ana.martinez@edutrack.com',
      password: 'estudiante123',
      rol: 'estudiante',
      telefono: '3005552345',
      direccion: 'Carrera 50 #25-30',
      fechaRegistro: '2025-01-10',
      nivel: '10°'
    },
    {
      id: '6',
      nombre: 'Luis Torres',
      email: 'luis.torres@edutrack.com',
      password: 'estudiante123',
      rol: 'estudiante',
      telefono: '3005553456',
      direccion: 'Calle 80 #15-20',
      fechaRegistro: '2025-01-11',
      nivel: '10°'
    },
    {
      id: '7',
      nombre: 'Sofia Díaz',
      email: 'sofia.diaz@edutrack.com',
      password: 'estudiante123',
      rol: 'estudiante',
      telefono: '3005554567',
      direccion: 'Avenida 68 #40-50',
      fechaRegistro: '2025-01-11',
      nivel: '11°'
    },
    {
      id: '8',
      nombre: 'Pedro Sánchez',
      email: 'pedro.sanchez@edutrack.com',
      password: 'estudiante123',
      rol: 'estudiante',
      telefono: '3005555678',
      direccion: 'Transversal 30 #10-15',
      fechaRegistro: '2025-01-12',
      nivel: '11°'
    }
  ],
  materias: [
    {
      id: '1',
      nombre: 'Matemáticas',
      codigo: 'MAT-101',
      nivel: '10°',
      docenteId: '2',
      horasSemanales: 5
    },
    {
      id: '2',
      nombre: 'Física',
      codigo: 'FIS-101',
      nivel: '10°',
      docenteId: '2',
      horasSemanales: 4
    },
    {
      id: '3',
      nombre: 'Química',
      codigo: 'QUI-101',
      nivel: '11°',
      docenteId: '3',
      horasSemanales: 4
    },
    {
      id: '4',
      nombre: 'Español',
      codigo: 'ESP-101',
      nivel: '10°',
      docenteId: '3',
      horasSemanales: 4
    }
  ],
  calificaciones: [
    {
      id: '1',
      estudianteId: '4',
      materiaId: '1',
      periodoId: '1',
      nota: 4.5,
      fecha: '2025-02-01',
      tipo: 'parcial'
    },
    {
      id: '2',
      estudianteId: '4',
      materiaId: '2',
      periodoId: '1',
      nota: 4.0,
      fecha: '2025-02-05',
      tipo: 'tarea'
    },
    {
      id: '3',
      estudianteId: '5',
      materiaId: '1',
      periodoId: '1',
      nota: 3.8,
      fecha: '2025-02-01',
      tipo: 'parcial'
    },
    {
      id: '4',
      estudianteId: '5',
      materiaId: '4',
      periodoId: '1',
      nota: 4.2,
      fecha: '2025-02-03',
      tipo: 'examen'
    },
    {
      id: '5',
      estudianteId: '6',
      materiaId: '1',
      periodoId: '1',
      nota: 2.8,
      fecha: '2025-02-01',
      tipo: 'parcial'
    },
    {
      id: '6',
      estudianteId: '7',
      materiaId: '3',
      periodoId: '1',
      nota: 4.7,
      fecha: '2025-02-04',
      tipo: 'proyecto'
    },
    {
      id: '7',
      estudianteId: '8',
      materiaId: '3',
      periodoId: '1',
      nota: 3.5,
      fecha: '2025-02-04',
      tipo: 'proyecto'
    }
  ],
  asistencias: [
    {
      id: '1',
      estudianteId: '4',
      materiaId: '1',
      fecha: '2025-02-01',
      estado: 'presente',
      observacion: ''
    },
    {
      id: '2',
      estudianteId: '4',
      materiaId: '1',
      fecha: '2025-02-02',
      estado: 'presente',
      observacion: ''
    },
    {
      id: '3',
      estudianteId: '5',
      materiaId: '1',
      fecha: '2025-02-01',
      estado: 'presente',
      observacion: ''
    },
    {
      id: '4',
      estudianteId: '5',
      materiaId: '1',
      fecha: '2025-02-02',
      estado: 'ausente',
      observacion: 'Cita médica'
    },
    {
      id: '5',
      estudianteId: '6',
      materiaId: '1',
      fecha: '2025-02-01',
      estado: 'tardanza',
      observacion: 'Llegó 15 minutos tarde'
    },
    {
      id: '6',
      estudianteId: '7',
      materiaId: '3',
      fecha: '2025-02-03',
      estado: 'presente',
      observacion: ''
    },
    {
      id: '7',
      estudianteId: '8',
      materiaId: '3',
      fecha: '2025-02-03',
      estado: 'presente',
      observacion: ''
    }
  ],
  periodos: [
    {
      id: '1',
      nombre: 'Primer Periodo 2025',
      fechaInicio: '2025-01-15',
      fechaFin: '2025-03-30',
      activo: true
    },
    {
      id: '2',
      nombre: 'Segundo Periodo 2025',
      fechaInicio: '2025-04-01',
      fechaFin: '2025-06-15',
      activo: false
    }
  ],
  notificaciones: [
    {
      id: '1',
      docenteId: '2',
      materiaId: '1',
      titulo: 'Examen de Matemáticas',
      mensaje: 'El examen del primer periodo será el próximo viernes 21 de febrero. Repasar capítulos 1 al 5.',
      fecha: '2025-02-10',
      tipo: 'evaluacion'
    },
    {
      id: '2',
      docenteId: '2',
      materiaId: '2',
      titulo: 'Tarea de Física',
      mensaje: 'Resolver los ejercicios de la página 45 para la próxima clase.',
      fecha: '2025-02-11',
      tipo: 'tarea'
    },
    {
      id: '3',
      docenteId: '3',
      materiaId: '3',
      titulo: 'Proyecto de Química',
      mensaje: 'Recordatorio: La entrega del proyecto de química es el 25 de febrero.',
      fecha: '2025-02-12',
      tipo: 'proyecto'
    }
  ],
  observaciones: [
    {
      id: '1',
      estudianteId: '4',
      docenteId: '2',
      materiaId: '1',
      observacion: 'Excelente participación en clase y comprensión de los temas',
      tipo: 'positiva',
      fecha: '2025-02-05'
    },
    {
      id: '2',
      estudianteId: '6',
      docenteId: '2',
      materiaId: '1',
      observacion: 'Necesita reforzar los conceptos de álgebra. Se recomienda tutoría adicional.',
      tipo: 'negativa',
      fecha: '2025-02-06'
    },
    {
      id: '3',
      estudianteId: '7',
      docenteId: '3',
      materiaId: '3',
      observacion: 'Demostró gran creatividad en el proyecto de química',
      tipo: 'positiva',
      fecha: '2025-02-08'
    }
  ]
}
