import React, { useState, useEffect, useMemo } from 'react';
import '../../estilos/inicio.css';
import heroImg from '../../assets/hotel_lobby_hero.jpg';
import { API_BASE_URL } from '../../config/api';

// Iconos SVG 100% reutilizables
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
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tabGrafica, setTabGrafica] = useState('tarifas');
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [bcvRate, setBcvRate] = useState(872.39);

  useEffect(() => {
    fetch('https://pydolarve.org/api/v1/dollar?page=bcv')
      .then((r) => r.json())
      .then((data) => {
        if (data?.monitors?.usd?.price) setBcvRate(data.monitors.usd.price);
      })
      .catch(() => setBcvRate(872.39));
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resHab, resRes, resHue, resTar, resRol] = await Promise.all([
        fetch(`${API_BASE_URL}/api/habitaciones`).catch(() => null),
        fetch(`${API_BASE_URL}/api/reservas`).catch(() => null),
        fetch(`${API_BASE_URL}/api/huespedes`).catch(() => null),
        fetch(`${API_BASE_URL}/api/tarifas`).catch(() => null),
        fetch(`${API_BASE_URL}/api/roles`).catch(() => null)
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
    return [1];
  }, [rolActualDB, usuario]);

  const tieneAccesoModulo = (idModulo) => modulosAsignados.includes(Number(idModulo));

  const tieneReservas = tieneAccesoModulo(2);
  const tieneHabitaciones = tieneAccesoModulo(5);
  const tieneTarifas = tieneAccesoModulo(6);
  const tieneFinanzas = tieneAccesoModulo(4);
  const tieneAuditoria = tieneAccesoModulo(7);
  const tieneEmergencia = tieneAccesoModulo(8);

  useEffect(() => {
    if (tieneTarifas && !tieneReservas) setTabGrafica('tarifas');
    else if (tieneReservas && !tieneTarifas) setTabGrafica('reservas');
    else if (tieneAuditoria || tieneEmergencia) setTabGrafica('auditoria');
  }, [tieneTarifas, tieneReservas, tieneAuditoria, tieneEmergencia]);

  const totalHab = habitaciones.length;
  const ocupadasCount = habitaciones.filter((h) => (h.estado || '').toLowerCase() === 'ocupada').length;
  const suciasCount = habitaciones.filter((h) => (h.estado || '').toLowerCase() === 'sucia').length;
  const mantenimientoCount = habitaciones.filter((h) => (h.estado || '').toLowerCase() === 'mantenimiento').length;
  const disponiblesCount = habitaciones.filter((h) => (h.estado || '').toLowerCase() === 'disponible').length;
  const porcentajeOcupacion = totalHab > 0 ? ((ocupadasCount / totalHab) * 100).toFixed(1) : '0.0';

  const hoy = new Date();
  const hoyISO = hoy.toISOString().slice(0, 10);
  const fechaTexto = hoy.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  const horaActual = hoy.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  const nombreParaMostrar = usuario?.nombre ? usuario.nombre.split(' ')[0] : 'Administrador';

  const llegadasHoyCount = reservas.filter((r) => r.fecha_checkin && String(r.fecha_checkin).slice(0, 10) === hoyISO).length;
  const salidasHoyCount = reservas.filter((r) => r.fecha_checkout && String(r.fecha_checkout).slice(0, 10) === hoyISO).length;
  const reservasConfirmadas = reservas.filter((r) => (r.estado || '').toUpperCase() === 'CONFIRMADA').length;
  const reservasEnEspera = reservas.filter((r) => ['PENDIENTE', 'EN ESPERA'].includes((r.estado || '').toUpperCase())).length;

  const ingresosDiaReal = reservas
    .filter((r) => r.fecha_checkin && String(r.fecha_checkin).slice(0, 10) === hoyISO)
    .reduce((acc, r) => acc + (parseFloat(r.monto_total || r.monto_pagado || 0) || 0), 0);

  const tarifasActivas = tarifas.filter((t) => (t.estado || '').toLowerCase() === 'activa');
  const preciosTarifas = tarifas.map((t) => parseFloat(t.precio_base || 0)).filter((p) => p > 0);
  const precioPromedioTarifas = preciosTarifas.length > 0 ? (preciosTarifas.reduce((a, b) => a + b, 0) / preciosTarifas.length).toFixed(2) : '0.00';
  const precioMinTarifas = preciosTarifas.length > 0 ? Math.min(...preciosTarifas).toFixed(2) : '0.00';
  const precioMaxTarifas = preciosTarifas.length > 0 ? Math.max(...preciosTarifas).toFixed(2) : '0.00';

  const tarifaMasAlta = useMemo(() => tarifas.length ? tarifas.reduce((max, t) => parseFloat(t.precio_base || 0) > parseFloat(max.precio_base || 0) ? t : max, tarifas[0]) : null, [tarifas]);
  const tarifaMasBaja = useMemo(() => tarifas.length ? tarifas.reduce((min, t) => parseFloat(t.precio_base || 0) < parseFloat(min.precio_base || 0) ? t : min, tarifas[0]) : null, [tarifas]);

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
  const alertasActivasCount = suciasCount + mantenimientoCount;

  const catalogoAccionesRapidas = [
    { id: 'llegada', idModulo: 2, titulo: 'Registrar llegada', descripcion: 'Recibe a tus huéspedes', icono: LogIn, claseColor: 'action-blue', vistaDestino: 'reservas' },
    { id: 'salida', idModulo: 2, titulo: 'Registrar salida', descripcion: 'Finaliza una estadía', icono: LogOut, claseColor: 'action-skyblue', vistaDestino: 'reservas' },
    { id: 'huesped', idModulo: 3, titulo: 'Agregar huésped', descripcion: 'Crea una nueva ficha', icono: UserPlus, claseColor: 'action-teal', vistaDestino: 'huespedes' },
    { id: 'pago', idModulo: 4, titulo: 'Registrar pago', descripcion: 'Gestiona un cobro', icono: CreditCard, claseColor: 'action-green', vistaDestino: 'finanzas' },
    { id: 'habitaciones', idModulo: 5, titulo: 'Estado habitaciones', descripcion: 'Revisión y limpieza', icono: BedDouble, claseColor: 'action-purple', vistaDestino: 'habitaciones' },
    { id: 'tarifas', idModulo: 6, titulo: 'Configurar tarifas', descripcion: 'Precios comerciales', icono: Layers, claseColor: 'action-orange', vistaDestino: 'tarifas' },
    { id: 'auditoria', idModulo: 7, titulo: 'Registro de auditoría', descripcion: 'Supervisar eventos', icono: CheckSquare, claseColor: 'action-slate', vistaDestino: 'auditoria' },
    { id: 'emergencia', idModulo: 8, titulo: 'Control de emergencias', descripcion: 'Protocolos de seguridad', icono: AlertCircle, claseColor: 'action-red', vistaDestino: 'emergencia' },
    { id: 'roles', idModulo: 9, titulo: 'Usuarios y roles', descripcion: 'Gestionar accesos', icono: Shield, claseColor: 'action-indigo', vistaDestino: 'roles' }
  ];

  const accionesPermitidas = catalogoAccionesRapidas.filter((acc) => tieneAccesoModulo(acc.idModulo));

  const reservasMapeadas = useMemo(() => {
    return reservas.map((r, i) => {
      const nombreHuesped = r.nombre_huesped || huespedes.find((h) => String(h.id_huesped) === String(r.id_huesped))?.nombre || `Huésped #${r.id_huesped || i + 1}`;
      const habitacionObj = habitaciones.find((h) => String(h.codigo_habitacion) === String(r.codigo_habitacion));
      const estadoStr = r.estado || 'CONFIRMADA';
      const esEspera = estadoStr.toLowerCase().includes('espera') || estadoStr.toLowerCase().includes('pendiente');

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

  const llegadasFiltradas = reservasMapeadas.filter((item) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return item.nombre.toLowerCase().includes(q) || item.id.toLowerCase().includes(q) || item.habitacion.toLowerCase().includes(q);
  });

  const subtituloBanner = useMemo(() => {
    if (tieneTarifas && !tieneReservas) return 'Gestión estratégica de tarifas comerciales, optimización de precios y rentabilidad del hotel.';
    if (tieneReservas && !tieneTarifas) return 'Control operativo de llegadas, salidas y disponibilidad inmediata de habitaciones.';
    if ((tieneAuditoria || tieneEmergencia) && !tieneReservas && !tieneTarifas) return 'Centro de supervisión, auditoría de eventos y protocolos de respuesta ante emergencias.';
    return 'Un nuevo día para ofrecer una gran estadía. Todo lo que necesitas para gestionar tu hotel, en un solo lugar.';
  }, [tieneTarifas, tieneReservas, tieneAuditoria, tieneEmergencia]);

  const etiquetaContextoBanner = useMemo(() => {
    if (tieneTarifas && !tieneReservas) return 'ESTRATEGIA TARIFARIA Y COMERCIAL';
    if (tieneReservas && !tieneTarifas) return 'RECEPCIÓN Y ATENCIÓN A HUÉSPEDES';
    if ((tieneAuditoria || tieneEmergencia) && !tieneReservas && !tieneTarifas) return 'SEGURIDAD Y SUPERVISIÓN';
    return fechaTexto;
  }, [tieneTarifas, tieneReservas, tieneAuditoria, tieneEmergencia, fechaTexto]);

  return (
    <main className="inicio-vista-container">
      {/* 1. Barra Superior */}
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
          <button type="button" className="btn-inicio-icon" title="Notificaciones">
            <Bell size={18} />
            {alertasActivasCount > 0 && <span className="notification-dot" />}
          </button>
        </div>
      </section>

      {/* 2. Hero Banner */}
      <section className="inicio-welcome-banner">
        <div className="welcome-banner-left">
          <div className="welcome-date-pill">
            <Sun size={15} color="#d97706" />
            <span>{etiquetaContextoBanner}</span>
          </div>
          <h1 className="welcome-title">¡Bienvenido, {nombreParaMostrar}!</h1>
          <p className="welcome-subtitle">{subtituloBanner}</p>
          <div className="welcome-actions">
            {tieneReservas && (
              <button type="button" className="btn-welcome-primary" onClick={() => setVistaActual('reservas')}>
                <Plus size={16} /><span>Nueva reserva</span>
              </button>
            )}
            {tieneTarifas && (
              <button type="button" className={tieneReservas ? 'btn-welcome-secondary' : 'btn-welcome-primary'} onClick={() => setVistaActual('tarifas')}>
                <Layers size={16} /><span>Gestionar tarifas</span>
              </button>
            )}
            {tieneHabitaciones && (
              <button type="button" className="btn-welcome-secondary" onClick={() => setVistaActual('habitaciones')}>
                <span>Ver habitaciones</span>
              </button>
            )}
          </div>
        </div>
        <div className="welcome-banner-right">
          <div className="welcome-image-card">
            <img src={heroImg} alt="Hotel Lobby" className="welcome-hero-image" />
            <div className="welcome-image-badge">
              <Sparkles size={14} color="#2563eb" />
              <span>Cada detalle cuenta.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Acciones Rápidas */}
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
                <article key={acc.id} className="quick-action-card" onClick={() => setVistaActual(acc.vistaDestino)} role="button" tabIndex={0}>
                  <div className={`quick-action-icon-box ${acc.claseColor}`}>
                    <Icono size={20} />
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

      {/* 4. KPIs */}
      <section className="inicio-section-group">
        <div className="inicio-section-header-row">
          <h2 className="inicio-section-title">{tieneTarifas && !tieneReservas ? 'Indicadores comerciales' : 'Tu hotel hoy'}</h2>
          {tieneHabitaciones && (
            <button type="button" className="btn-link-action" onClick={() => setVistaActual('habitaciones')}>
              <span>Ver habitaciones</span><ArrowUpRight size={14} />
            </button>
          )}
        </div>
        <div className="kpis-hotel-grid">
          {tieneHabitaciones && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Habitaciones disponibles</span>
                <div className="kpi-hotel-icon-wrap kpi-blue"><BedDouble size={18} /></div>
              </div>
              <div className="kpi-hotel-value">{disponiblesCount} <span className="kpi-hotel-total">/ {totalHab}</span></div>
              <small className="kpi-hotel-footer">{ocupadasCount} ocupada(s) · {porcentajeOcupacion}% de ocupación</small>
            </article>
          )}
          {tieneTarifas && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Tarifas activas</span>
                <div className="kpi-hotel-icon-wrap kpi-orange"><Layers size={18} /></div>
              </div>
              <div className="kpi-hotel-value">{tarifasActivas.length} <span className="kpi-hotel-total">/ {tarifas.length}</span></div>
              <small className="kpi-hotel-footer">Vigentes para reservas</small>
            </article>
          )}
          {tieneTarifas && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Precio base promedio</span>
                <div className="kpi-hotel-icon-wrap kpi-green"><TrendingUp size={18} /></div>
              </div>
              <div className="kpi-hotel-value">${precioPromedioTarifas}</div>
              <small className="kpi-hotel-footer">Rango: ${precioMinTarifas} -${precioMaxTarifas}</small>
            </article>
          )}
          {tieneReservas && (
            <article className="kpi-hotel-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Llegadas previstas</span>
                <div className="kpi-hotel-icon-wrap kpi-skyblue"><ArrowDownLeft size={18} /></div>
              </div>
              <div className="kpi-hotel-value">{llegadasHoyCount}</div>
              <small className="kpi-hotel-footer">Check-ins programados hoy</small>
            </article>
          )}
          {(tieneHabitaciones || tieneEmergencia) && (
            <article className="kpi-hotel-card alert-card">
              <div className="kpi-hotel-top">
                <span className="kpi-hotel-label">Alerta activa</span>
                <div className="kpi-hotel-icon-wrap kpi-amber"><AlertCircle size={18} /></div>
              </div>
              <div className="kpi-hotel-value">{alertasActivasCount}</div>
              <small className="kpi-hotel-footer alert-link" onClick={() => setVistaActual(tieneEmergencia ? 'emergencia' : 'habitaciones')}>
                {alertasActivasCount > 0 ? `${suciasCount} hab. por limpiar / mantenimiento` : 'Sin alertas operativas'}
              </small>
            </article>
          )}
        </div>
      </section>

      {/* 5. Gráfica Interactiva */}
      {(tieneTarifas || tieneReservas || tieneAuditoria) && (
        <section className="inicio-section-group">
          <div className="figma-chart-card">
            <header className="figma-chart-header">
              <div className="figma-chart-title-group">
                <h3 className="figma-chart-title">{tabGrafica === 'tarifas' ? 'Estructura Comercial de Tarifas' : 'Flujo Operativo de Reservas'}</h3>
                <p className="figma-chart-subtitle">{tabGrafica === 'tarifas' ? 'Tarifa base por noche ($)' : 'Flujo de reservas y ocupación'}</p>
              </div>
              <div className="figma-chart-actions">
                {tieneTarifas && tieneReservas && (
                  <div className="figma-tab-pills">
                    <button type="button" className={`figma-tab-pill ${tabGrafica === 'tarifas' ? 'active' : ''}`} onClick={() => setTabGrafica('tarifas')}>
                      <Layers size={13} /><span>Tarifas</span>
                    </button>
                    <button type="button" className={`figma-tab-pill ${tabGrafica === 'reservas' ? 'active' : ''}`} onClick={() => setTabGrafica('reservas')}>
                      <BarChart2 size={13} /><span>Reservas</span>
                    </button>
                  </div>
                )}
              </div>
            </header>
            <div className="figma-chart-body-grid">
              <div className="figma-chart-col-canvas">
                {(() => {
                  const items = tabGrafica === 'tarifas' ? datosHabitacionesTarifas : datosReservasGrafica;
                  const rawMax = Math.max(...items.map((i) => i.valor), 10);
                  const ceiling = rawMax <= 10 ? 10 : rawMax <= 50 ? 50 : 100;
                  const yLevels = [{ y: 30, val: ceiling }, { y: 80, val: Math.round(ceiling * 0.75) }, { y: 135, val: Math.round(ceiling * 0.5) }, { y: 190, val: 0 }];
                  const startX = 65, endX = 535, slotWidth = (endX - startX) / (items.length || 1), barWidth = 44;

                  return (
                    <svg viewBox="0 0 560 225" className="figma-chart-svg">
                      {yLevels.map((lvl, lIdx) => (
                        <g key={lIdx}>
                          <line x1={startX} y1={lvl.y} x2={endX} y2={lvl.y} stroke="#e5e7eb" strokeWidth="1" />
                          <text x={startX - 10} y={lvl.y + 4} textAnchor="end" className="figma-chart-axis-text">
                            {tabGrafica === 'tarifas' ? `$${lvl.val}` : lvl.val}
                          </text>
                        </g>
                      ))}
                      {items.map((item, idx) => {
                        const barH = ceiling > 0 ? (item.valor / ceiling) * 160 : 0;
                        const centerX = startX + idx * slotWidth + slotWidth / 2;
                        const barX = centerX - barWidth / 2;
                        const barY = 190 - Math.max(barH, 3);
                        const isHovered = hoveredBarIndex === idx;

                        return (
                          <g key={item.id || idx} onMouseEnter={() => setHoveredBarIndex(idx)} onMouseLeave={() => setHoveredBarIndex(null)} className="chart-bar-group">
                            <rect x={barX} y={barY} width={barWidth} height={Math.max(barH, 3)} rx="8" ry="8" className={`chart-bar-rect ${item.isPeak ? 'peak' : ''} ${isHovered ? 'hovered' : ''}`} />
                            {isHovered && (
                              <g>
                                <rect x={centerX - 50} y={barY - 32} width="100" height="24" rx="6" fill="#0f172a" />
                                <text x={centerX} y={barY - 16} textAnchor="middle" fill="#ffffff" fontSize="10.5" fontWeight="700">
                                  {tabGrafica === 'tarifas' ? `$${item.valor.toFixed(2)}` : `${item.valor} res.`}
                                </text>
                              </g>
                            )}
                            <text x={centerX} y="210" textAnchor="middle" className="figma-chart-label-text">{item.dia}</text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
              <div className="figma-chart-col-metrics">
                <div className="figma-metric-card highlight">
                  <span className="figma-metric-label">{tabGrafica === 'tarifas' ? 'Tarifa promedio' : 'Ocupación hotelera'}</span>
                  <strong className="figma-metric-val">{tabGrafica === 'tarifas' ? `$${precioPromedioTarifas}` : `${porcentajeOcupacion}%`}</strong>
                  <span className="figma-metric-sub">{tabGrafica === 'tarifas' ? `Bs. ${(parseFloat(precioPromedioTarifas) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} BCV` : `${ocupadasCount} de ${totalHab} ocupadas`}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Sección Inferior */}
      <section className="inicio-split-grid">
        {tieneReservas && (
          <article className="arrivals-card">
            <header className="arrivals-card-header">
              <div>
                <h3 className="arrivals-title">Próximas llegadas</h3>
                <p className="arrivals-subtitle">Prepara una bienvenida sin contratiempos.</p>
              </div>
              <button type="button" className="btn-link-action" onClick={() => setVistaActual('reservas')}>
                <span>Ver reservas</span><ArrowUpRight size={14} />
              </button>
            </header>
            <div className="arrivals-table-wrapper">
              <table className="arrivals-table">
                <thead>
                  <tr><th>HUÉSPED</th><th>HABITACIÓN</th><th>FECHA</th><th>ESTADO</th></tr>
                </thead>
                <tbody>
                  {llegadasFiltradas.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="guest-cell">
                          <div className="guest-avatar-circle">{item.nombre.slice(0, 2).toUpperCase()}</div>
                          <div className="guest-info"><strong className="guest-name">{item.nombre}</strong><small className="guest-sub">{item.id}</small></div>
                        </div>
                      </td>
                      <td><strong className="room-code">{item.habitacion}</strong></td>
                      <td><span className="time-pill">{item.hora}</span></td>
                      <td><span className={`status-badge ${item.badgeClass}`}>{item.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}

        <article className="reminders-card">
          <header className="reminders-card-header">
            <h3 className="reminders-title">Para tener en cuenta</h3>
          </header>
          <div className="reminders-list">
            {reservasEnEspera > 0 && (
              <div className="reminder-item-row" onClick={() => setVistaActual('reservas')} role="button" tabIndex={0}>
                <div className="reminder-left">
                  <div className="reminder-icon-box blue"><CheckSquare size={17} /></div>
                  <div className="reminder-text"><strong>Revisar reservas</strong><small>{reservasEnEspera} pendientes</small></div>
                </div>
                <ChevronRight size={14} />
              </div>
            )}
          </div>
          <div className="occupancy-progress-block">
            <div className="occupancy-progress-top">
              <span className="occupancy-label">Ocupación actual</span>
              <strong className="occupancy-val">{porcentajeOcupacion}%</strong>
            </div>
            <div className="occupancy-bar-track">
              <div className="occupancy-bar-fill progress-dynamic" style={{ width: `${Math.min(parseFloat(porcentajeOcupacion) || 0, 100)}%` }} />
            </div>
          </div>
        </article>
      </section>

      {/* 7. Pie */}
      <footer className="inicio-footer-credits">
        <span>Sistema de Gestión Hotelera</span>
        <span className="update-status"><span className="green-live-dot" /> Actualizado a las {horaActual}</span>
      </footer>
    </main>
  );
}