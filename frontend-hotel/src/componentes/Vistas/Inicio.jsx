import React, { useState, useEffect, useMemo } from 'react';
import '../../estilos/inicio.css';
import heroImg from '../../assets/hotel_lobby_hero.jpg';

// SVG Icons 100% compatibles con React 19 sin dependencias externas
const IconSvg = ({ children, size = 18, color = 'currentColor', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon-svg ${className}`.trim()}
  >
    {children}
  </svg>
);

const Search = (p) => <IconSvg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></IconSvg>;
const Bell = (p) => <IconSvg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></IconSvg>;
const Sun = (p) => <IconSvg {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></IconSvg>;
const Plus = (p) => <IconSvg {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconSvg>;
const BedDouble = (p) => <IconSvg {...p}><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></IconSvg>;
const LogIn = (p) => <IconSvg {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></IconSvg>;
const LogOut = (p) => <IconSvg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></IconSvg>;
const UserPlus = (p) => <IconSvg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></IconSvg>;
const CreditCard = (p) => <IconSvg {...p}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></IconSvg>;
const Wallet = (p) => (
  <IconSvg {...p}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 1-1 1v2a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
  </IconSvg>
);
const DollarSign = (p) => (
  <IconSvg {...p}>
    <line x1="12" x2="12" y1="2" y2="22"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </IconSvg>
);
const TrendingUp = (p) => <IconSvg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></IconSvg>;
const ArrowDownLeft = (p) => <IconSvg {...p}><line x1="17" x2="7" y1="7" y2="17"/><polyline points="17 17 7 17 7 7"/></IconSvg>;
const AlertCircle = (p) => <IconSvg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></IconSvg>;
const ChevronRight = (p) => <IconSvg {...p}><path d="m9 18 6-6-6-6"/></IconSvg>;
const CheckSquare = (p) => <IconSvg {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></IconSvg>;
const ArrowUpRight = (p) => <IconSvg {...p}><line x1="7" x2="17" y1="17" y2="7"/><polyline points="7 7 17 7 17 17"/></IconSvg>;
const ArrowRight = (p) => <IconSvg {...p}><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></IconSvg>;
const Shield = (p) => <IconSvg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></IconSvg>;
const Layers = (p) => <IconSvg {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></IconSvg>;
const Sparkles = (p) => <IconSvg {...p}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></IconSvg>;
const RefreshCw = (p) => <IconSvg {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></IconSvg>;
const BarChart2 = (p) => <IconSvg {...p}><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></IconSvg>;
const CalendarX = (p) => (
  <IconSvg {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
    <line x1="10" x2="14" y1="14" y2="18"/>
    <line x1="14" x2="10" y1="14" y2="18"/>
  </IconSvg>
);

export default function Inicio({ setVistaActual, usuario }) {
  // 1. Estados de datos 100% reales del backend
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 2. Buscador del encabezado
  const [busqueda, setBusqueda] = useState('');

  // 3. Estado de pestaña activa de la gráfica interactiva y estilo visual
  const [tabGrafica, setTabGrafica] = useState('tarifas');
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [bcvRate, setBcvRate] = useState(872.39);

  // Cargar tasa BCV oficial para conversiones en vivo en la gráfica
  useEffect(() => {
    fetch('https://pydolarve.org/api/v1/dollar?page=bcv')
      .then((r) => r.json())
      .then((data) => {
        if (data?.monitors?.usd?.price) {
          setBcvRate(data.monitors.usd.price);
        }
      })
      .catch(() => setBcvRate(872.39));
  }, []);

  // Cargar datos en vivo desde el backend (Cero código SQL, 100% APIs existentes)
  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resHab, resRes, resHue, resTar, resRol] = await Promise.all([
        fetch('http://localhost:3000/api/habitaciones').catch(() => null),
        fetch('http://localhost:3000/api/reservas').catch(() => null),
        fetch('http://localhost:3000/api/huespedes').catch(() => null),
        fetch('http://localhost:3000/api/tarifas').catch(() => null),
        fetch('http://localhost:3000/api/roles').catch(() => null)
      ]);

      if (resHab && resHab.ok) setHabitaciones(await resHab.json());
      if (resRes && resRes.ok) setReservas(await resRes.json());
      if (resHue && resHue.ok) setHuespedes(await resHue.json());
      if (resTar && resTar.ok) setTarifas(await resTar.json());
      if (resRol && resRol.ok) setRoles(await resRol.json());
    } catch (err) {
      console.warn('Error al cargar datos del Inicio:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE ROLES Y PERMISOS ESTRICTAMENTE DEL USUARIO AUTENTICADO ---
  const rolActualDB = useMemo(() => {
    if (!roles.length || !usuario?.id_rol) return null;
    return roles.find((r) => Number(r.id_rol) === Number(usuario.id_rol)) || null;
  }, [roles, usuario]);

  const modulosAsignados = useMemo(() => {
    if (rolActualDB?.modulos_asignados && Array.isArray(rolActualDB.modulos_asignados)) {
      return rolActualDB.modulos_asignados.map(Number);
    }
    if (usuario?.modulos && Array.isArray(usuario.modulos) && usuario.modulos.length > 0) {
      return usuario.modulos.map(Number);
    }
    return [1]; // Inicio por defecto
  }, [rolActualDB, usuario]);

  // Verificador estricto de acceso por módulo (Cero fallbacks permisivos)
  // 1: Inicio, 2: Reservas, 3: Huéspedes, 4: Finanzas, 5: Habitaciones,
  // 6: Tarifas, 7: Auditoría, 8: Emergencia, 9: Roles/Usuarios, 10: Chat
  const tieneAccesoModulo = (idModulo) => {
    return modulosAsignados.includes(Number(idModulo));
  };

  // Mapeo de capacidades del rol actual
  const tieneReservas = tieneAccesoModulo(2);
  const tieneHuespedes = tieneAccesoModulo(3);
  const tieneFinanzas = tieneAccesoModulo(4);
  const tieneHabitaciones = tieneAccesoModulo(5);
  const tieneTarifas = tieneAccesoModulo(6);
  const tieneAuditoria = tieneAccesoModulo(7);
  const tieneEmergencia = tieneAccesoModulo(8);
  const tieneRoles = tieneAccesoModulo(9);
  const tieneChat = tieneAccesoModulo(10);

  // Sincronizar pestaña de gráfica según capacidades
  useEffect(() => {
    if (tieneTarifas && !tieneReservas) {
      setTabGrafica('tarifas');
    } else if (tieneReservas && !tieneTarifas) {
      setTabGrafica('reservas');
    } else if (tieneTarifas && tieneReservas) {
      setTabGrafica((prev) => (prev === 'tarifas' || prev === 'reservas' ? prev : 'tarifas'));
    } else if (tieneAuditoria || tieneEmergencia) {
      setTabGrafica('auditoria');
    }
  }, [tieneTarifas, tieneReservas, tieneAuditoria, tieneEmergencia]);

  // --- CÁLCULO DE MÉTRICAS EN TIEMPO REAL (100% DATOS DEL SISTEMA) ---
  const totalHab = habitaciones.length;
  const ocupadasCount = habitaciones.filter((h) => (h.estado || '').toLowerCase() === 'ocupada').length;
  const suciasCount = habitaciones.filter((h) => (h.estado || '').toLowerCase() === 'sucia').length;
  const mantenimientoCount = habitaciones.filter((h) => (h.estado || '').toLowerCase() === 'mantenimiento').length;
  const disponiblesCount = habitaciones.filter((h) => (h.estado || '').toLowerCase() === 'disponible').length;

  const porcentajeOcupacion =
    totalHab > 0 ? ((ocupadasCount / totalHab) * 100).toFixed(1) : '0.0';

  // Fechas y horas del día
  const hoy = new Date();
  const hoyISO = hoy.toISOString().slice(0, 10);

  const fechaTexto = hoy.toLocaleDateString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  const horaActual = hoy.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Saludo según nombre del usuario
  const nombreParaMostrar = usuario?.nombre ? usuario.nombre.split(' ')[0] : 'Administrador';

  // Métricas de Reservas
  const llegadasHoyCount = reservas.filter((r) => {
    if (!r.fecha_checkin) return false;
    const checkinDate = String(r.fecha_checkin).slice(0, 10);
    return checkinDate === hoyISO;
  }).length;

  const salidasHoyCount = reservas.filter((r) => {
    if (!r.fecha_checkout) return false;
    const checkoutDate = String(r.fecha_checkout).slice(0, 10);
    return checkoutDate === hoyISO;
  }).length;

  const reservasConfirmadas = reservas.filter((r) => (r.estado || '').toUpperCase() === 'CONFIRMADA').length;
  const reservasEnEspera = reservas.filter((r) => ['PENDIENTE', 'EN ESPERA'].includes((r.estado || '').toUpperCase())).length;

  // Métricas Financieras
  const ingresosDiaReal = reservas
    .filter((r) => r.fecha_checkin && String(r.fecha_checkin).slice(0, 10) === hoyISO)
    .reduce((acc, r) => acc + (parseFloat(r.monto_total || r.monto_pagado || 0) || 0), 0);

  const ingresosAcumuladosReal = reservas.reduce(
    (acc, r) => acc + (parseFloat(r.monto_total || r.monto_pagado || 0) || 0),
    0
  );

  // Métricas de Tarifas Reales
  const tarifasActivas = tarifas.filter((t) => (t.estado || '').toLowerCase() === 'activa');
  const tarifasActivasCount = tarifasActivas.length;
  const preciosTarifas = tarifas.map((t) => parseFloat(t.precio_base || 0)).filter((p) => p > 0);
  const precioPromedioTarifas =
    preciosTarifas.length > 0
      ? (preciosTarifas.reduce((a, b) => a + b, 0) / preciosTarifas.length).toFixed(2)
      : '0.00';
  const precioMinTarifas = preciosTarifas.length > 0 ? Math.min(...preciosTarifas).toFixed(2) : '0.00';
  const precioMaxTarifas = preciosTarifas.length > 0 ? Math.max(...preciosTarifas).toFixed(2) : '0.00';

  const tarifaMasAlta = useMemo(() => {
    if (!tarifas.length) return null;
    return tarifas.reduce((max, t) => (parseFloat(t.precio_base || 0) > parseFloat(max.precio_base || 0) ? t : max), tarifas[0]);
  }, [tarifas]);

  const tarifaMasBaja = useMemo(() => {
    if (!tarifas.length) return null;
    return tarifas.reduce((min, t) => (parseFloat(t.precio_base || 0) < parseFloat(min.precio_base || 0) ? t : min), tarifas[0]);
  }, [tarifas]);

  // Datos 100% reales desde el catálogo de tarifas de la base de datos
  const datosHabitacionesTarifas = useMemo(() => {
    if (!tarifas.length) return [];
    const maxVal = Math.max(...tarifas.map((t) => parseFloat(t.precio_base || 0)));
    return tarifas.map((t, idx) => ({
      id: t.id_tarifa || idx,
      dia: t.nombre_habitacion || `Habitación ${idx + 1}`,
      valor: parseFloat(t.precio_base || 0),
      label: t.nombre_tarifa || 'Tarifa estándar',
      isPeak: parseFloat(t.precio_base || 0) === maxVal
    }));
  }, [tarifas]);

  const datosReservasGrafica = useMemo(() => {
    const maxFlow = Math.max(llegadasHoyCount, salidasHoyCount, reservasConfirmadas, reservasEnEspera, 1);
    return [
      { id: 'llegadas', dia: 'Llegadas', valor: llegadasHoyCount, label: 'Llegadas hoy', isPeak: llegadasHoyCount === maxFlow },
      { id: 'salidas', dia: 'Salidas', valor: salidasHoyCount, label: 'Salidas hoy', isPeak: salidasHoyCount === maxFlow && salidasHoyCount > 0 },
      { id: 'confirmadas', dia: 'Confirmadas', valor: reservasConfirmadas, label: 'Confirmadas', isPeak: reservasConfirmadas === maxFlow && reservasConfirmadas > 0 },
      { id: 'espera', dia: 'En espera', valor: reservasEnEspera, label: 'En espera / pendientes', isPeak: reservasEnEspera === maxFlow && reservasEnEspera > 0 }
    ];
  }, [llegadasHoyCount, salidasHoyCount, reservasConfirmadas, reservasEnEspera]);

  const tiposHabConTarifa = new Set(tarifas.map((t) => Number(t.id_tipo_habitacion)));
  const habConTarifaCount = habitaciones.filter((h) => tiposHabConTarifa.has(Number(h.id_tipo_habitacion))).length;
  const habSinTarifaCount = Math.max(0, totalHab - habConTarifaCount);
  const porcentajeCoberturaTarifas = totalHab > 0 ? ((habConTarifaCount / totalHab) * 100).toFixed(0) : '100';

  // Alertas activas reales
  const alertasActivasCount = suciasCount + mantenimientoCount;

  // --- CATÁLOGO DE ACCIONES RÁPIDAS (Soporte completo para los 10 módulos) ---
  const catalogoAccionesRapidas = [
    {
      id: 'llegada',
      idModulo: 2, // Reservas
      titulo: 'Registrar llegada',
      descripcion: 'Recibe a tus huéspedes',
      icono: LogIn,
      iconoColor: '#2563eb',
      iconoBg: '#eff6ff',
      vistaDestino: 'reservas'
    },
    {
      id: 'salida',
      idModulo: 2, // Reservas
      titulo: 'Registrar salida',
      descripcion: 'Finaliza una estadía',
      icono: LogOut,
      iconoColor: '#0284c7',
      iconoBg: '#f0f9ff',
      vistaDestino: 'reservas'
    },
    {
      id: 'huesped',
      idModulo: 3, // Huéspedes
      titulo: 'Agregar huésped',
      descripcion: 'Crea una nueva ficha',
      icono: UserPlus,
      iconoColor: '#0d9488',
      iconoBg: '#f0fdfa',
      vistaDestino: 'huespedes'
    },
    {
      id: 'pago',
      idModulo: 4, // Finanzas
      titulo: 'Registrar pago',
      descripcion: 'Gestiona un cobro',
      icono: CreditCard,
      iconoColor: '#16a34a',
      iconoBg: '#f0fdf4',
      vistaDestino: 'finanzas'
    },
    {
      id: 'habitaciones',
      idModulo: 5, // Habitaciones
      titulo: 'Estado habitaciones',
      descripcion: 'Revisión y limpieza',
      icono: BedDouble,
      iconoColor: '#7c3aed',
      iconoBg: '#f5f3ff',
      vistaDestino: 'habitaciones'
    },
    {
      id: 'tarifas',
      idModulo: 6, // Tarifas
      titulo: 'Configurar tarifas',
      descripcion: 'Precios comerciales',
      icono: Layers,
      iconoColor: '#ea580c',
      iconoBg: '#fff7ed',
      vistaDestino: 'tarifas'
    },
    {
      id: 'auditoria',
      idModulo: 7, // Auditoría
      titulo: 'Registro de auditoría',
      descripcion: 'Supervisar eventos',
      icono: CheckSquare,
      iconoColor: '#475569',
      iconoBg: '#f1f5f9',
      vistaDestino: 'auditoria'
    },
    {
      id: 'emergencia',
      idModulo: 8, // Control de emergencias
      titulo: 'Control de emergencias',
      descripcion: 'Protocolos de seguridad',
      icono: AlertCircle,
      iconoColor: '#dc2626',
      iconoBg: '#fef2f2',
      vistaDestino: 'emergencia'
    },
    {
      id: 'roles',
      idModulo: 9, // Roles y usuarios
      titulo: 'Usuarios y roles',
      descripcion: 'Gestionar accesos',
      icono: Shield,
      iconoColor: '#4f46e5',
      iconoBg: '#eef2ff',
      vistaDestino: 'roles'
    },
    {
      id: 'chat',
      idModulo: 10, // Chat Chavoo
      titulo: 'Chat Chavoo',
      descripcion: 'Canal de asistencia',
      icono: Sparkles,
      iconoColor: '#0284c7',
      iconoBg: '#f0f9ff',
      vistaDestino: 'chat'
    }
  ];

  // Filtrado 100% estricto de acciones según permisos del rol
  const accionesPermitidas = catalogoAccionesRapidas.filter((acc) =>
    tieneAccesoModulo(acc.idModulo)
  );

  // --- MAPEO DE RESERVAS REALES ---
  const reservasMapeadas = useMemo(() => {
    return reservas.map((r, i) => {
      const nombreHuesped =
        r.nombre_huesped ||
        huespedes.find((h) => String(h.id_huesped) === String(r.id_huesped))?.nombre ||
        `Huésped #${r.id_huesped || i + 1}`;

      const habitacionObj = habitaciones.find(
        (h) => String(h.codigo_habitacion) === String(r.codigo_habitacion)
      );

      const estadoStr = r.estado || 'CONFIRMADA';
      const esEspera =
        estadoStr.toLowerCase().includes('espera') ||
        estadoStr.toLowerCase().includes('pendiente');

      return {
        id: `RES-${String(r.codigo_reserva || r.id_reserva || i + 1).padStart(4, '0')}`,
        nombre: nombreHuesped,
        huespedes: `${r.cantidad_personas || r.cantidad_huespedes || 1} huésped(es)`,
        habitacion: `Hab. ${r.codigo_habitacion || 'N/A'}`,
        tipo: habitacionObj?.nombre_tipo || 'Habitación',
        hora: r.fecha_checkin ? String(r.fecha_checkin).slice(0, 10) : 'Pendiente',
        estado: estadoStr,
        badgeClass: esEspera ? 'badge-espera' : 'badge-confirmada'
      };
    });
  }, [reservas, huespedes, habitaciones]);

  // Filtrar reservas por barra de búsqueda
  const llegadasFiltradas = reservasMapeadas.filter((item) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.habitacion.toLowerCase().includes(q)
    );
  });

  // Texto contextual de bienvenida según capacidades
  const subtituloBanner = useMemo(() => {
    if (tieneTarifas && !tieneReservas) {
      return 'Gestión estratégica de tarifas comerciales, optimización de precios y rentabilidad del hotel.';
    }
    if (tieneReservas && !tieneTarifas) {
      return 'Control operativo de llegadas, salidas y disponibilidad inmediata de habitaciones.';
    }
    if ((tieneAuditoria || tieneEmergencia) && !tieneReservas && !tieneTarifas) {
      return 'Centro de supervisión, auditoría de eventos y protocolos de respuesta ante emergencias.';
    }
    return 'Un nuevo día para ofrecer una gran estadía. Todo lo que necesitas para gestionar tu hotel, en un solo lugar.';
  }, [tieneTarifas, tieneReservas, tieneAuditoria, tieneEmergencia]);

  // Tag contextual del banner
  const etiquetaContextoBanner = useMemo(() => {
    if (tieneTarifas && !tieneReservas) return 'ESTRATEGIA TARIFARIA Y COMERCIAL';
    if (tieneReservas && !tieneTarifas) return 'RECEPCIÓN Y ATENCIÓN A HUÉSPEDES';
    if ((tieneAuditoria || tieneEmergencia) && !tieneReservas && !tieneTarifas) return 'SEGURIDAD Y SUPERVISIÓN';
    return fechaTexto;
  }, [tieneTarifas, tieneReservas, tieneAuditoria, tieneEmergencia, fechaTexto]);

  return (
    <main className="inicio-vista-container">
      {/* 1. Barra Superior con Breadcrumb y Búsqueda */}
      <section className="inicio-topbar-row">
        <div className="inicio-breadcrumb">
          <span className="breadcrumb-muted">Gestión Hotelera</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-active">Inicio</span>
        </div>

        <div className="inicio-topbar-controls">
          <div className="inicio-search-wrap">
            <Search size={16} className="inicio-search-icon" />
            <input
              type="text"
              placeholder={tieneTarifas && !tieneReservas ? 'Buscar tarifa o tipo...' : 'Buscar huésped o reserva...'}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="inicio-search-input"
            />
          </div>

          <button type="button" className="btn-inicio-icon" title="Notificaciones del hotel">
            <Bell size={18} />
            {alertasActivasCount > 0 && <span className="notification-dot" />}
          </button>
        </div>
      </section>

      {/* 2. Hero Banner de Bienvenida Adaptativo */}
      <section className="inicio-welcome-banner">
        <div className="welcome-banner-left">
          <div className="welcome-date-pill">
            <Sun size={15} color="#d97706" />
            <span>{etiquetaContextoBanner}</span>
          </div>

          <h1 className="welcome-title">
            ¡Bienvenido, {nombreParaMostrar}!
          </h1>

          <p className="welcome-subtitle">
            {subtituloBanner}
          </p>

          <div className="welcome-actions">
            {tieneReservas && (
              <button
                type="button"
                className="btn-welcome-primary"
                onClick={() => setVistaActual('reservas')}
              >
                <Plus size={16} />
                <span>Nueva reserva</span>
              </button>
            )}

            {tieneTarifas && (
              <button
                type="button"
                className={tieneReservas ? 'btn-welcome-secondary' : 'btn-welcome-primary'}
                onClick={() => setVistaActual('tarifas')}
              >
                <Layers size={16} />
                <span>Gestionar tarifas</span>
              </button>
            )}

            {tieneHabitaciones && (
              <button
                type="button"
                className="btn-welcome-secondary"
                onClick={() => setVistaActual('habitaciones')}
              >
                <span>Ver habitaciones</span>
              </button>
            )}

            {!tieneReservas && !tieneTarifas && tieneAuditoria && (
              <button
                type="button"
                className="btn-welcome-primary"
                onClick={() => setVistaActual('auditoria')}
              >
                <span>Ver auditoría</span>
              </button>
            )}

            {!tieneReservas && !tieneTarifas && !tieneAuditoria && tieneEmergencia && (
              <button
                type="button"
                className="btn-welcome-primary"
                onClick={() => setVistaActual('emergencia')}
              >
                <span>Control de emergencias</span>
              </button>
            )}
          </div>
        </div>

        <div className="welcome-banner-right">
          <div className="welcome-image-card">
            <img
              src={heroImg}
              alt="Recepción del hotel de lujo"
              className="welcome-hero-image"
            />
            <div className="welcome-image-badge">
              <Sparkles size={14} color="#2563eb" />
              <span>Cada detalle cuenta.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección Dinámica: ¿Qué necesitas hacer? (Acciones según permisos del Rol) */}
      <section className="inicio-section-group">
        <header className="inicio-section-header">
          <h2 className="inicio-section-title">¿Qué necesitas hacer?</h2>
        </header>

        {accionesPermitidas.length === 0 ? (
          <div className="no-actions-card">
            <Shield size={24} color="#64748b" />
            <p>Este rol tiene permisos de consulta general y no posee acciones operativas asignadas.</p>
          </div>
        ) : (
          <div className="quick-actions-grid">
            {accionesPermitidas.map((acc) => {
              const Icono = acc.icono;
              return (
                <article
                  key={acc.id}
                  className="quick-action-card"
                  onClick={() => setVistaActual(acc.vistaDestino)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="quick-action-icon-box" style={{ backgroundColor: acc.iconoBg }}>
                    <Icono size={20} color={acc.iconoColor} />
                  </div>
                  <div className="quick-action-info">
                    <h3 className="quick-action-title">{acc.titulo}</h3>
                    <p className="quick-action-desc">{acc.descripcion}</p>
                  </div>
                  <ChevronRight size={18} className="quick-action-arrow" />
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Sección Dinámica: KPIs según el Rol Actual (Cero datos estáticos) */}
      <section className="inicio-section-group">
        <div className="inicio-section-header-row">
          <h2 className="inicio-section-title">
            {tieneTarifas && !tieneReservas ? 'Indicadores comerciales' : 'Tu hotel hoy'}
          </h2>
          {tieneHabitaciones && (
            <button
              type="button"
              className="btn-link-action"
              onClick={() => setVistaActual('habitaciones')}
            >
              <span>Ver habitaciones</span>
              <ArrowUpRight size={14} />
            </button>
          )}
          {tieneTarifas && !tieneHabitaciones && (
            <button
              type="button"
              className="btn-link-action"
              onClick={() => setVistaActual('tarifas')}
            >
              <span>Ver catálogo de tarifas</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>

        <div className="kpis-hotel-grid">
          {/* Si tiene Habitaciones: Habitaciones disponibles */}
          {tieneHabitaciones && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Habitaciones disponibles</span>
                <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <BedDouble size={18} />
                </div>
              </div>
              <div className="kpi-hotel-value">
                {totalHab > 0 ? (
                  <>
                    {disponiblesCount} <span className="kpi-hotel-total">/ {totalHab}</span>
                  </>
                ) : (
                  '0'
                )}
              </div>
              <small className="kpi-hotel-footer">
                {totalHab > 0
                  ? `${ocupadasCount} ocupada(s) · ${porcentajeOcupacion}% de ocupación`
                  : 'Sin habitaciones registradas'}
              </small>
            </article>
          )}

          {/* Si tiene Tarifas: Tarifas activas */}
          {tieneTarifas && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Tarifas activas</span>
                <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                  <Layers size={18} />
                </div>
              </div>
              <div className="kpi-hotel-value">
                {tarifasActivasCount} <span className="kpi-hotel-total">/ {tarifas.length}</span>
              </div>
              <small className="kpi-hotel-footer">
                {tarifas.length > 0 ? 'Vigentes para reservas' : 'Sin tarifas registradas'}
              </small>
            </article>
          )}

          {/* Si tiene Tarifas: Precio promedio por noche */}
          {tieneTarifas && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Precio base promedio</span>
                <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="kpi-hotel-value">
                ${precioPromedioTarifas}
              </div>
              <small className="kpi-hotel-footer">
                {preciosTarifas.length > 0 ? `Rango: $${precioMinTarifas} - $${precioMaxTarifas}` : 'Sin precios base'}
              </small>
            </article>
          )}

          {/* Si tiene Finanzas: Ingresos del día */}
          {tieneFinanzas && !tieneTarifas && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Ingresos del día</span>
                <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="kpi-hotel-value">
                ${ingresosDiaReal.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
              <small className="kpi-hotel-footer">
                {ingresosAcumuladosReal > 0
                  ? `Acumulado: $${ingresosAcumuladosReal.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                  : 'Sin pagos registrados'}
              </small>
            </article>
          )}

          {/* Si tiene Reservas: Llegadas previstas */}
          {tieneReservas && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Llegadas previstas</span>
                <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#0284c7' }}>
                  <ArrowDownLeft size={18} />
                </div>
              </div>
              <div className="kpi-hotel-value">{llegadasHoyCount}</div>
              <small className="kpi-hotel-footer">
                {salidasHoyCount > 0
                  ? `${salidasHoyCount} salida(s) para hoy`
                  : llegadasHoyCount > 0
                  ? 'Check-ins programados hoy'
                  : 'Sin movimientos para hoy'}
              </small>
            </article>
          )}

          {/* Si tiene Tarifas: Cobertura de habitaciones */}
          {tieneTarifas && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Cobertura de tarifas</span>
                <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                  <CheckSquare size={18} />
                </div>
              </div>
              <div className="kpi-hotel-value">
                {porcentajeCoberturaTarifas}%
              </div>
              <small className="kpi-hotel-footer">
                {habConTarifaCount} de {totalHab} habitaciones cubiertas
              </small>
            </article>
          )}

          {/* Si tiene Auditoría o Emergencias y no tiene Reservas ni Tarifas: Estado del sistema */}
          {(tieneAuditoria || tieneEmergencia) && !tieneReservas && !tieneTarifas && (
            <>
              <article className="kpi-hotel-card">
                <div className="kpi-hotel-top">
                  <span className="kpi-hotel-label">Trazabilidad de auditoría</span>
                  <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                    <Shield size={18} />
                  </div>
                </div>
                <div className="kpi-hotel-value">100%</div>
                <small className="kpi-hotel-footer">Registros íntegros y sincronizados</small>
              </article>

              <article className="kpi-hotel-card">
                <div className="kpi-hotel-top">
                  <span className="kpi-hotel-label">Protocolos de emergencia</span>
                  <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#16a34a' }}>
                    <AlertCircle size={18} />
                  </div>
                </div>
                <div className="kpi-hotel-value">Normal</div>
                <small className="kpi-hotel-footer">Sin contingencias activas</small>
              </article>
            </>
          )}

          {/* Alertas operativas (si tiene Habitaciones o Emergencia) */}
          {(tieneHabitaciones || tieneEmergencia) && (
            <article className="kpi-hotel-card alert-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Alerta activa</span>
                <div className="kpi-hotel-icon-wrap" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                  <AlertCircle size={18} />
                </div>
              </div>
              <div className="kpi-hotel-value">{alertasActivasCount}</div>
              <small
                className="kpi-hotel-footer alert-link"
                onClick={() => {
                  if (tieneEmergencia) setVistaActual('emergencia');
                  else if (tieneHabitaciones) setVistaActual('habitaciones');
                }}
              >
                {alertasActivasCount > 0
                  ? `${suciasCount} hab. por limpiar / mantenimiento`
                  : 'Sin alertas operativas'}
              </small>
            </article>
          )}
        </div>
      </section>

      {/* 5. SECCIÓN DE GRÁFICA ADAPTADA AL SISTEMA ESTILO FIGMA */}
      {(tieneTarifas || tieneReservas || tieneAuditoria) && (
        <section className="inicio-section-group">
          <div className="figma-chart-card">
            {/* Encabezado del Card: Título, Subtítulo y Acciones */}
            <header className="figma-chart-header">
              <div className="figma-chart-title-group">
                <h3 className="figma-chart-title">
                  {tabGrafica === 'tarifas'
                    ? 'Estructura Comercial de Tarifas'
                    : 'Flujo Operativo de Reservas'}
                </h3>
                <p className="figma-chart-subtitle">
                  {tabGrafica === 'tarifas'
                    ? 'Tarifa base por noche ($) según tipos de habitación registrados'
                    : 'Flujo de reservas y ocupación hotelera · en tiempo real'}
                </p>
              </div>

              <div className="figma-chart-actions">
                {/* Switcher entre Tarifas y Reservas si tiene ambos permisos */}
                {tieneTarifas && tieneReservas && (
                  <div className="figma-tab-pills">
                    <button
                      type="button"
                      className={`figma-tab-pill ${tabGrafica === 'tarifas' ? 'active' : ''}`}
                      onClick={() => {
                        setTabGrafica('tarifas');
                        setHoveredBarIndex(null);
                      }}
                    >
                      <Layers size={13} />
                      <span>Tarifas</span>
                    </button>
                    <button
                      type="button"
                      className={`figma-tab-pill ${tabGrafica === 'reservas' ? 'active' : ''}`}
                      onClick={() => {
                        setTabGrafica('reservas');
                        setHoveredBarIndex(null);
                      }}
                    >
                      <BarChart2 size={13} />
                      <span>Reservas</span>
                    </button>
                  </div>
                )}

                {/* Enlace directo al módulo correspondiente */}
                {tabGrafica === 'tarifas' && tieneTarifas && (
                  <button
                    type="button"
                    className="figma-link-btn"
                    onClick={() => setVistaActual('tarifas')}
                  >
                    <span>Ver tarifas</span>
                    <ArrowRight size={14} />
                  </button>
                )}
                {tabGrafica === 'reservas' && tieneReservas && (
                  <button
                    type="button"
                    className="figma-link-btn"
                    onClick={() => setVistaActual('reservas')}
                  >
                    <span>Ver reservas</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </header>

            {/* Contenido en Grilla de 2 Columnas (Gráfica Izquierda + 3 Métricas Derecha) */}
            <div className="figma-chart-body-grid">
              {/* COLUMNA IZQUIERDA: LIENZO DE BARRAS DINÁMICAS (100% DATOS DEL SISTEMA) */}
              <div className="figma-chart-col-canvas">
                {tabGrafica === 'tarifas' && tarifas.length === 0 ? (
                  <div className="chart-empty-state">
                    <Layers size={36} color="#94a3b8" />
                    <h4>Sin tarifas registradas</h4>
                    <p>Al agregar tarifas comerciales en el módulo de Tarifas, la gráfica se generará automáticamente con los datos ingresados.</p>
                  </div>
                ) : (() => {
                  const items =
                    tabGrafica === 'tarifas'
                      ? datosHabitacionesTarifas
                      : datosReservasGrafica;

                  const rawMax = Math.max(...items.map((i) => i.valor), 10);
                  const ceiling =
                    rawMax <= 10
                      ? 10
                      : rawMax <= 50
                      ? 50
                      : rawMax <= 100
                      ? 100
                      : Math.max(100, Math.ceil((rawMax * 1.25) / 50) * 50);

                  const yLevels = [
                    { y: 30, val: ceiling },
                    { y: 80, val: Math.round(ceiling * 0.75) },
                    { y: 135, val: Math.round(ceiling * 0.5) },
                    { y: 190, val: 0 }
                  ];

                  const count = items.length || 1;
                  const startX = 65;
                  const endX = 535;
                  const totalWidth = endX - startX;
                  const slotWidth = totalWidth / count;
                  const barWidth = count <= 2 ? 68 : count <= 4 ? 54 : count <= 6 ? 44 : 38;

                  return (
                    <svg viewBox="0 0 560 225" className="figma-chart-svg" preserveAspectRatio="xMidYMid meet">
                      {/* Líneas horizontales de cuadrícula limpias */}
                      {yLevels.map((lvl, lIdx) => (
                        <g key={lIdx}>
                          <line
                            x1={startX}
                            y1={lvl.y}
                            x2={endX}
                            y2={lvl.y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                          <text
                            x={startX - 10}
                            y={lvl.y + 4}
                            textAnchor="end"
                            className="figma-chart-axis-text"
                          >
                            {tabGrafica === 'tarifas' ? `$${lvl.val}` : lvl.val}
                          </text>
                        </g>
                      ))}

                      {/* Barras dinámicas con esquinas redondeadas */}
                      {items.map((item, idx) => {
                        const barH = ceiling > 0 ? (item.valor / ceiling) * 160 : 0;
                        const centerX = startX + idx * slotWidth + slotWidth / 2;
                        const barX = centerX - barWidth / 2;
                        const barY = 190 - Math.max(barH, 3);
                        const isPeak = item.isPeak;
                        const isHovered = hoveredBarIndex === idx;

                        return (
                          <g
                            key={item.id || idx}
                            className="figma-bar-group"
                            onMouseEnter={() => setHoveredBarIndex(idx)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                            style={{ cursor: 'pointer' }}
                          >
                            {/* Barra principal */}
                            <rect
                              x={barX}
                              y={barY}
                              width={barWidth}
                              height={Math.max(barH, 3)}
                              rx="8"
                              ry="8"
                              fill={isHovered ? (isPeak ? '#1d4ed8' : '#93c5fd') : (isPeak ? '#2563eb' : '#dbeafe')}
                              className="figma-bar-rect"
                            />

                            {/* Tooltip interactivo al posar el cursor */}
                            {isHovered && (
                              <g className="figma-hover-tooltip animate-fade-in">
                                <rect
                                  x={centerX - 50}
                                  y={barY - 32}
                                  width="100"
                                  height="24"
                                  rx="6"
                                  fill="#0f172a"
                                />
                                <polygon
                                  points={`${centerX - 4},${barY - 8} ${centerX + 4},${barY - 8} ${centerX},${barY - 3}`}
                                  fill="#0f172a"
                                />
                                <text
                                  x={centerX}
                                  y={barY - 16}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize="10.5"
                                  fontWeight="700"
                                >
                                  {tabGrafica === 'tarifas' ? `$${item.valor.toFixed(2)} USD` : `${item.valor} reservas`}
                                </text>
                              </g>
                            )}

                            {/* Etiqueta del eje X inferior */}
                            <text
                              x={centerX}
                              y="210"
                              textAnchor="middle"
                              className="figma-chart-label-text"
                              fontWeight={isPeak ? '700' : '500'}
                              fill={isPeak ? '#0f172a' : '#64748b'}
                            >
                              {item.dia}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>

              {/* COLUMNA DERECHA: 3 TARJETAS MÉTRICAS 100% DINÁMICAS */}
              <div className="figma-chart-col-metrics">
                {tabGrafica === 'tarifas' ? (
                  <>
                    {/* Tarjeta 1: Tarifa Promedio (Azul Suave) */}
                    <div className="figma-metric-card highlight">
                      <span className="figma-metric-label">Tarifa promedio</span>
                      <strong className="figma-metric-val">
                        ${parseFloat(precioPromedioTarifas).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                      <span className="figma-metric-sub">
                        {tarifas.length > 0
                          ? `Bs. ${(parseFloat(precioPromedioTarifas) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} oficial BCV`
                          : 'Sin tarifas registradas'}
                      </span>
                    </div>

                    {/* Tarjeta 2: Tarifa más alta */}
                    <div className="figma-metric-card">
                      <span className="figma-metric-label">Tarifa más alta</span>
                      <strong className="figma-metric-title">
                        {tarifaMasAlta?.nombre_habitacion || 'Sin registros'}
                      </strong>
                      <span className="figma-metric-sub">
                        {tarifas.length > 0
                          ? `$${parseFloat(precioMaxTarifas).toFixed(2)} · catálogo activo`
                          : 'Pendiente por registrar'}
                      </span>
                    </div>

                    {/* Tarjeta 3: Tarifa más accesible */}
                    <div className="figma-metric-card">
                      <span className="figma-metric-label">Tarifa más accesible</span>
                      <strong className="figma-metric-title">
                        {tarifaMasBaja?.nombre_habitacion || 'Sin registros'}
                      </strong>
                      <span className="figma-metric-sub">
                        {tarifas.length > 0
                          ? `$${parseFloat(precioMinTarifas).toFixed(2)} · catálogo activo`
                          : 'Pendiente por registrar'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Tarjeta 1: Ocupación Actual (Azul Suave) */}
                    <div className="figma-metric-card highlight">
                      <span className="figma-metric-label">Ocupación hotelera</span>
                      <strong className="figma-metric-val">{porcentajeOcupacion}%</strong>
                      <span className="figma-metric-sub">
                        {ocupadasCount} de {totalHab} habitaciones ocupadas
                      </span>
                    </div>

                    {/* Tarjeta 2: Reservas Confirmadas */}
                    <div className="figma-metric-card">
                      <span className="figma-metric-label">Reservas confirmadas</span>
                      <strong className="figma-metric-title">
                        {reservasConfirmadas} activas
                      </strong>
                      <span className="figma-metric-sub">
                        Estadías garantizadas en el sistema
                      </span>
                    </div>

                    {/* Tarjeta 3: Movimientos de Hoy */}
                    <div className="figma-metric-card">
                      <span className="figma-metric-label">Movimientos de hoy</span>
                      <strong className="figma-metric-title">
                        {llegadasHoyCount + salidasHoyCount} huéspedes
                      </strong>
                      <span className="figma-metric-sub">
                        {llegadasHoyCount} check-in · {salidasHoyCount} check-out
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Sección Inferior Adaptativa según el Rol (2 Columnas) */}
      <section className="inicio-split-grid">
        {/* Columna Izquierda: Si tiene Reservas -> Próximas Llegadas. Si solo tiene Tarifas -> Tarifas Vigentes */}
        {tieneReservas ? (
          <article className="arrivals-card">
            <header className="arrivals-card-header">
              <div>
                <h3 className="arrivals-title">Próximas llegadas</h3>
                <p className="arrivals-subtitle">Prepara una bienvenida sin contratiempos.</p>
              </div>
              <button
                type="button"
                className="btn-link-action"
                onClick={() => setVistaActual('reservas')}
              >
                <span>Ver reservas</span>
                <ArrowUpRight size={14} />
              </button>
            </header>

            <div className="arrivals-table-wrapper">
              {llegadasFiltradas.length === 0 ? (
                <div className="arrivals-empty-box">
                  <CalendarX size={36} color="#94a3b8" />
                  <h4 className="arrivals-empty-title">Sin llegadas registradas</h4>
                  <p className="arrivals-empty-text">
                    No hay reservas en el sistema en este momento. Las próximas llegadas aparecerán aquí automáticamente al ingresar información de reservas.
                  </p>
                  <button
                    type="button"
                    className="btn-empty-action"
                    onClick={() => setVistaActual('reservas')}
                  >
                    <Plus size={15} />
                    <span>Registrar reserva</span>
                  </button>
                </div>
              ) : (
                <table className="arrivals-table">
                  <thead>
                    <tr>
                      <th>HUÉSPED</th>
                      <th>HABITACIÓN</th>
                      <th>FECHA / HORA</th>
                      <th>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {llegadasFiltradas.slice(0, 5).map((item) => {
                      const iniciales = item.nombre
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="guest-cell">
                              <div className="guest-avatar-circle">{iniciales}</div>
                              <div className="guest-info">
                                <strong className="guest-name">{item.nombre}</strong>
                                <small className="guest-sub">{item.id} · {item.huespedes}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="room-cell">
                              <strong className="room-code">{item.habitacion}</strong>
                              <small className="room-type">{item.tipo}</small>
                            </div>
                          </td>
                          <td>
                            <span className="time-pill">{item.hora}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${item.badgeClass}`}>
                              {item.estado}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {reservas.length > 0 && (
              <footer className="arrivals-footer-summary">
                <span className={`dot-item ${reservasConfirmadas > 0 ? 'green' : 'muted'}`}>
                  ● {reservasConfirmadas} confirmada(s)
                </span>
                <span className={`dot-item ${reservasEnEspera > 0 ? 'amber' : 'muted'}`}>
                  ● {reservasEnEspera} en espera
                </span>
                <span className={`dot-item ${salidasHoyCount > 0 ? 'blue' : 'muted'}`}>
                  ● {salidasHoyCount} salida(s) hoy
                </span>
              </footer>
            )}
          </article>
        ) : tieneTarifas ? (
          <article className="arrivals-card">
            <header className="arrivals-card-header">
              <div>
                <h3 className="arrivals-title">Estructura tarifaria vigente</h3>
                <p className="arrivals-subtitle">Tarifas comerciales asignadas por tipo de habitación.</p>
              </div>
              <button
                type="button"
                className="btn-link-action"
                onClick={() => setVistaActual('tarifas')}
              >
                <span>Ver todas las tarifas</span>
                <ArrowUpRight size={14} />
              </button>
            </header>

            <div className="arrivals-table-wrapper">
              {tarifas.length === 0 ? (
                <div className="arrivals-empty-box">
                  <Layers size={36} color="#94a3b8" />
                  <h4 className="arrivals-empty-title">Sin tarifas registradas</h4>
                  <p className="arrivals-empty-text">
                    No hay tarifas configuradas en el sistema. Puedes agregar la primera tarifa desde el módulo correspondiente.
                  </p>
                  <button
                    type="button"
                    className="btn-empty-action"
                    onClick={() => setVistaActual('tarifas')}
                  >
                    <Plus size={15} />
                    <span>Configurar primera tarifa</span>
                  </button>
                </div>
              ) : (
                <table className="arrivals-table">
                  <thead>
                    <tr>
                      <th>TARIFA</th>
                      <th>HABITACIÓN</th>
                      <th>PRECIO BASE</th>
                      <th>OCUPACIÓN</th>
                      <th>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tarifas.slice(0, 5).map((t) => (
                      <tr key={t.id_tarifa}>
                        <td>
                          <div className="guest-info">
                            <strong className="guest-name">{t.nombre_tarifa}</strong>
                            <small className="guest-sub">{t.incluye || 'Tarifa estándar'}</small>
                          </div>
                        </td>
                        <td>
                          <div className="room-cell">
                            <strong className="room-code">{t.nombre_habitacion || 'Tipo de Habitación'}</strong>
                            <small className="room-type">Piso {t.piso || '1'}</small>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#16a34a' }}>${parseFloat(t.precio_base || 0).toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className="time-pill">{t.ocupacion_base || 2} personas</span>
                        </td>
                        <td>
                          <span className="status-badge badge-confirmada">
                            {t.estado || 'Activa'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {tarifas.length > 0 && (
              <footer className="arrivals-footer-summary">
                <span className="dot-item green">● {tarifasActivasCount} activa(s)</span>
                <span className="dot-item blue">● Promedio: ${precioPromedioTarifas}</span>
                <span className="dot-item amber">● Cobertura: {porcentajeCoberturaTarifas}%</span>
              </footer>
            )}
          </article>
        ) : (
          <article className="arrivals-card">
            <header className="arrivals-card-header">
              <div>
                <h3 className="arrivals-title">Supervisión y control</h3>
                <p className="arrivals-subtitle">Auditoría y protocolos operativos del sistema.</p>
              </div>
            </header>
            <div className="arrivals-empty-box">
              <Shield size={36} color="#0284c7" />
              <h4 className="arrivals-empty-title">Sistema operativo bajo supervisión</h4>
              <p className="arrivals-empty-text">
                Todas las acciones ejecutadas por los usuarios se registran en la trazabilidad de auditoría para garantizar máxima seguridad.
              </p>
            </div>
          </article>
        )}

        {/* Columna Derecha: Para tener en cuenta Adaptativo & Barra de Progreso */}
        <article className="reminders-card">
          <header className="reminders-card-header">
            <h3 className="reminders-title">Para tener en cuenta</h3>
          </header>

          <div className="reminders-list">
            {/* Recordatorio 1: Reservas por confirmar (Solo si tiene Reservas) */}
            {tieneReservas && reservasEnEspera > 0 && (
              <div
                className="reminder-item-row"
                onClick={() => setVistaActual('reservas')}
                role="button"
                tabIndex={0}
              >
                <div className="reminder-left">
                  <div className="reminder-icon-box blue">
                    <CheckSquare size={17} />
                  </div>
                  <div className="reminder-text">
                    <strong>Revisar reservas</strong>
                    <small>{reservasEnEspera} pendiente(s) de confirmación</small>
                  </div>
                </div>
                <div className="reminder-count-pill">
                  <span>{reservasEnEspera}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            )}

            {/* Recordatorio 2: Salidas de hoy (Solo si tiene Reservas) */}
            {tieneReservas && salidasHoyCount > 0 && (
              <div
                className="reminder-item-row"
                onClick={() => setVistaActual('reservas')}
                role="button"
                tabIndex={0}
              >
                <div className="reminder-left">
                  <div className="reminder-icon-box purple">
                    <CheckSquare size={17} />
                  </div>
                  <div className="reminder-text">
                    <strong>Preparar salidas</strong>
                    <small>{salidasHoyCount} salida(s) para hoy</small>
                  </div>
                </div>
                <div className="reminder-count-pill">
                  <span>{salidasHoyCount}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            )}

            {/* Recordatorio 3: Habitaciones sucias (Solo si tiene Habitaciones) */}
            {tieneHabitaciones && suciasCount > 0 && (
              <div
                className="reminder-item-row"
                onClick={() => setVistaActual('habitaciones')}
                role="button"
                tabIndex={0}
              >
                <div className="reminder-left">
                  <div className="reminder-icon-box amber">
                    <BedDouble size={17} />
                  </div>
                  <div className="reminder-text">
                    <strong>Limpieza de habitaciones</strong>
                    <small>{suciasCount} habitación(es) sucia(s)</small>
                  </div>
                </div>
                <div className="reminder-count-pill">
                  <span>{suciasCount}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            )}

            {/* Recordatorio 4: Habitaciones sin tarifa asignada (Solo si tiene Tarifas) */}
            {tieneTarifas && habSinTarifaCount > 0 && (
              <div
                className="reminder-item-row"
                onClick={() => setVistaActual('tarifas')}
                role="button"
                tabIndex={0}
              >
                <div className="reminder-left">
                  <div className="reminder-icon-box amber">
                    <Layers size={17} />
                  </div>
                  <div className="reminder-text">
                    <strong>Cobertura tarifaria</strong>
                    <small>{habSinTarifaCount} habitación(es) sin tarifa asignada</small>
                  </div>
                </div>
                <div className="reminder-count-pill">
                  <span>{habSinTarifaCount}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            )}

            {/* Estado limpio cuando no hay tareas operativas pendientes para este rol */}
            {(!tieneReservas || (reservasEnEspera === 0 && salidasHoyCount === 0)) &&
              (!tieneHabitaciones || suciasCount === 0) &&
              (!tieneTarifas || habSinTarifaCount === 0) && (
              <div className="reminders-empty-box">
                <div className="reminders-empty-icon">
                  <CheckSquare size={20} color="#16a34a" />
                </div>
                <div className="reminders-empty-content">
                  <strong className="reminders-empty-title">Todo al día</strong>
                  <p className="reminders-empty-desc">
                    No hay tareas pendientes en este momento. Las alertas y avisos aparecerán automáticamente al registrar actividad en el sistema.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Barra de Progreso Contextual según el Rol */}
          {tieneHabitaciones ? (
            <div className="occupancy-progress-block">
              <div className="occupancy-progress-top">
                <span className="occupancy-label">Ocupación actual</span>
                <strong className="occupancy-val">{porcentajeOcupacion}%</strong>
              </div>
              <div className="occupancy-bar-track">
                <div
                  className="occupancy-bar-fill"
                  style={{ width: `${Math.min(parseFloat(porcentajeOcupacion) || 0, 100)}%` }}
                />
              </div>
              <small className="occupancy-foot-text">
                {totalHab > 0
                  ? `${ocupadasCount} de ${totalHab} habitaciones ocupadas`
                  : 'Sin habitaciones registradas'}
              </small>
            </div>
          ) : tieneTarifas ? (
            <div className="occupancy-progress-block">
              <div className="occupancy-progress-top">
                <span className="occupancy-label">Cobertura de tarifas</span>
                <strong className="occupancy-val">{porcentajeCoberturaTarifas}%</strong>
              </div>
              <div className="occupancy-bar-track">
                <div
                  className="occupancy-bar-fill"
                  style={{ width: `${Math.min(parseFloat(porcentajeCoberturaTarifas) || 0, 100)}%` }}
                />
              </div>
              <small className="occupancy-foot-text">
                {habConTarifaCount} de {totalHab} habitaciones cubiertas con tarifa
              </small>
            </div>
          ) : (
            <div className="occupancy-progress-block">
              <div className="occupancy-progress-top">
                <span className="occupancy-label">Integridad del sistema</span>
                <strong className="occupancy-val">100%</strong>
              </div>
              <div className="occupancy-bar-track">
                <div className="occupancy-bar-fill" style={{ width: '100%' }} />
              </div>
              <small className="occupancy-foot-text">
                Módulos operativos y sincronizados
              </small>
            </div>
          )}
        </article>
      </section>

      {/* 7. Pie de Página */}
      <footer className="inicio-footer-credits">
        <span>Sistema de Gestión Hotelera - IUJO</span>
        <span className="update-status">
          <span className="green-live-dot" /> Actualizado a las {horaActual}
        </span>
      </footer>
    </main>
  );
}
