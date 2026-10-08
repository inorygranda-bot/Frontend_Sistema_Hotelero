import React, { useState, useEffect } from 'react';
import '../../estilos/tarifas.css';

// SVG Icons 100% compatibles con React 19 sin librerías externas
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
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    {children}
  </svg>
);

const Layers = (p) => <IconSvg {...p}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></IconSvg>;
const Wallet = (p) => <IconSvg {...p}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></IconSvg>;
const TrendingUp = (p) => <IconSvg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></IconSvg>;
const BedDouble = (p) => <IconSvg {...p}><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></IconSvg>;
const Search = (p) => <IconSvg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></IconSvg>;
const Download = (p) => <IconSvg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></IconSvg>;
const Plus = (p) => <IconSvg {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconSvg>;
const Eye = (p) => <IconSvg {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></IconSvg>;
const Pencil = (p) => <IconSvg {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></IconSvg>;
const Copy = (p) => <IconSvg {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></IconSvg>;
const Trash2 = (p) => <IconSvg {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconSvg>;
const ArrowLeftRight = (p) => <IconSvg {...p}><path d="m9 7-5 5 5 5"/><path d="m15 7 5 5-5 5"/><path d="M4 12h16"/></IconSvg>;
const X = (p) => <IconSvg {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconSvg>;
const Check = (p) => <IconSvg {...p}><polyline points="20 6 9 17 4 12"/></IconSvg>;
const ChevronDown = (p) => <IconSvg {...p}><path d="m6 9 6 6 6-6"/></IconSvg>;
const DollarSign = (p) => <IconSvg {...p}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></IconSvg>;
const RefreshCw = (p) => <IconSvg {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></IconSvg>;

const API_BASE = 'http://localhost:3000/api/tarifas';

export default function Tarifas() {
  // 1. Estados principales de datos
  const [tarifas, setTarifas] = useState([]);
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);

  // 2. Filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroHabitacion, setFiltroHabitacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // 3. Tasa oficial BCV (Cargada en vivo mediante API pública)
  const [bcvRate, setBcvRate] = useState(872.39);
  const [bcvDate, setBcvDate] = useState('Consultando API...');
  const [bcvFuente, setBcvFuente] = useState('Cargando...');
  const [cargandoBcv, setCargandoBcv] = useState(true);
  const [modalBcvAbierto, setModalBcvAbierto] = useState(false);
  const [inputBcvRate, setInputBcvRate] = useState('872.39');
  const [inputBcvDate, setInputBcvDate] = useState('');

  // 4. Modal Formulario Figma (Crear / Editar)
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR'); // 'CREAR' | 'EDITAR'
  const [editId, setEditId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const initialForm = {
    nombre_tarifa: 'Flexible Ejecutiva',
    id_tipo_habitacion: '',
    vigente_desde: '2026-10-01',
    vigente_hasta: '2027-03-31',
    precio_base: '120.00',
    iva: '16',
    ocupacion_base: '2',
    huesped_adicional: '15.00',
    incluye: 'Incluye desayuno. No reembolsable dentro de las 48 horas previas.',
    estado: 'Activa'
  };
  const [formData, setFormData] = useState(initialForm);

  // 5. Modal Ver Detalles
  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [tarifaVer, setTarifaVer] = useState(null);

  // 6. Modal Eliminar
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [tarifaAEliminar, setTarifaAEliminar] = useState(null);

  // 7. Toasts
  const [toasts, setToasts] = useState([]);

  const lanzarToast = (mensaje) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensaje }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // --- CARGAR TASA BCV EN VIVO DESDE LA API ---
  const cargarTasaBcv = async () => {
    try {
      setCargandoBcv(true);
      // Intentar primero a través de nuestro backend (evita CORS y guarda cache)
      let response = await fetch(`${API_BASE}/tasa-bcv`).catch(() => null);

      if (!response || !response.ok) {
        // Fallback directo a DolarAPI pública
        response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      }

      if (response && response.ok) {
        const data = await response.json();
        const tasaReal = parseFloat(data.tasa || data.promedio);
        if (tasaReal && !isNaN(tasaReal)) {
          setBcvRate(tasaReal);
          setInputBcvRate(String(tasaReal));

          // Formatear fecha
          let fechaTexto = 'Hoy';
          if (data.fecha || data.fechaActualizacion) {
            try {
              const d = new Date(data.fecha || data.fechaActualizacion);
              fechaTexto = d.toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
            } catch (e) {
              fechaTexto = 'Hoy';
            }
          }
          setBcvDate(fechaTexto);
          setInputBcvDate(fechaTexto);
          setBcvFuente(data.fuente || 'BCV Oficial');
        }
      }
    } catch (err) {
      console.warn('Error al consultar tasa BCV:', err);
      setBcvDate('Tasa referencial');
    } finally {
      setCargandoBcv(false);
    }
  };

  // --- CARGA DE DATOS DESDE LA API ---
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setErrorTabla(null);

      const [resTarifas, resTipos] = await Promise.all([
        fetch(API_BASE),
        fetch(`${API_BASE}/tipos-habitacion`)
      ]);

      if (!resTarifas.ok || !resTipos.ok) {
        throw new Error('Error al conectar con la base de datos del hotel.');
      }

      const dataTarifas = await resTarifas.json();
      const dataTipos = await resTipos.json();

      setTarifas(dataTarifas);
      setTiposHabitacion(dataTipos);

      if (dataTipos.length > 0 && !formData.id_tipo_habitacion) {
        setFormData((prev) => ({ ...prev, id_tipo_habitacion: dataTipos[0].id_tipo_habitacion }));
      }
    } catch (err) {
      setErrorTabla(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarTasaBcv();
  }, []);

  // --- FORMATEADORES ---
  const formatUSD = (val) => {
    const num = parseFloat(val) || 0;
    return '$ ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatBs = (val) => {
    const num = parseFloat(val) || 0;
    return 'Bs ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // --- CÁLCULOS DINÁMICOS EN TIEMPO REAL ---
  const baseUSD = parseFloat(formData.precio_base) || 0;
  const ivaPorc = parseFloat(formData.iva) || 16;
  const baseBs = baseUSD * bcvRate;
  const ivaUSD = baseUSD * (ivaPorc / 100);
  const totalUSD = baseUSD + ivaUSD;
  const totalBs = totalUSD * bcvRate;

  // Habitación seleccionada
  const habitacionSeleccionadaNombre =
    tiposHabitacion.find((t) => String(t.id_tipo_habitacion) === String(formData.id_tipo_habitacion))?.nombre_tipo ||
    'Habitación Seleccionada';

  // --- GESTIÓN DE FORMULARIO ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const abrirModalCrear = () => {
    setModoModal('CREAR');
    setEditId(null);
    setFormData({
      ...initialForm,
      id_tipo_habitacion: tiposHabitacion[0]?.id_tipo_habitacion || ''
    });
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (tarifa) => {
    setModoModal('EDITAR');
    setEditId(tarifa.id_tarifa);
    setFormData({
      nombre_tarifa: tarifa.nombre_tarifa || '',
      id_tipo_habitacion: tarifa.id_tipo_habitacion || '',
      vigente_desde: tarifa.vigente_desde || '',
      vigente_hasta: tarifa.vigente_hasta || '',
      precio_base: tarifa.precio_base || '0.00',
      iva: tarifa.iva || '16',
      ocupacion_base: String(tarifa.ocupacion_base || '2'),
      huesped_adicional: tarifa.huesped_adicional || '0.00',
      incluye: tarifa.incluye || '',
      estado: tarifa.estado || 'Activa'
    });
    setModalFormAbierto(true);
  };

  const guardarTarifa = async (esBorrador = false) => {
    if (!formData.nombre_tarifa.trim() || !formData.vigente_desde || !formData.vigente_hasta) {
      alert('Por favor completa el nombre de la tarifa y las fechas de vigencia.');
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        ...formData,
        estado: esBorrador ? 'Borrador' : formData.estado || 'Activa'
      };

      const url = modoModal === 'CREAR' ? API_BASE : `${API_BASE}/${editId}`;
      const method = modoModal === 'CREAR' ? 'POST' : 'PUT';

      const respuesta = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(resData.mensaje || 'Error al guardar tarifa.');
      }

      setModalFormAbierto(false);
      lanzarToast(
        modoModal === 'CREAR'
          ? (esBorrador ? 'Tarifa guardada como Borrador.' : 'Tarifa registrada con éxito en el catálogo.')
          : 'Tarifa actualizada correctamente.'
      );
      cargarDatos();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Duplicar tarifa
  const duplicarTarifa = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/duplicar`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo duplicar');
      lanzarToast('Tarifa duplicada exitosamente como Borrador.');
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Eliminar tarifa
  const confirmarEliminar = async () => {
    if (!tarifaAEliminar) return;
    try {
      const res = await fetch(`${API_BASE}/${tarifaAEliminar.id_tarifa}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo eliminar');
      setModalEliminarAbierto(false);
      setTarifaAEliminar(null);
      lanzarToast('Tarifa eliminada permanentemente del catálogo.');
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  // Exportar a CSV
  const exportarCSV = () => {
    if (tarifas.length === 0) return;
    let csv = 'Código;Nombre de la Tarifa;Habitación;Precio_USD;Precio_Bs;IVA;Total_USD;Ocupación;Vigencia;Estado\n';
    tarifasFiltradas.forEach((r) => {
      const bs = ((parseFloat(r.precio_base) || 0) * bcvRate).toFixed(2);
      const total = ((parseFloat(r.precio_base) || 0) * (1 + (parseFloat(r.iva) || 16) / 100)).toFixed(2);
      csv += `"#TAR-${r.id_tarifa}";"${r.nombre_tarifa}";"${r.nombre_habitacion}";"${r.precio_base}";"${bs}";"${r.iva}%";"${total}";"${r.ocupacion_base} huéspedes";"${r.vigente_desde} a ${r.vigente_hasta}";"${r.estado}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Catalogo_Tarifas_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    lanzarToast('Catálogo descargado en formato CSV.');
  };

  // Actualizar tasa BCV
  const aplicarTasaBcv = (e) => {
    e.preventDefault();
    const rate = parseFloat(inputBcvRate);
    if (!rate || rate <= 0) return;
    setBcvRate(rate);
    setBcvDate(inputBcvDate);
    setModalBcvAbierto(false);
    lanzarToast(`Tasa BCV actualizada a 1 USD = ${rate.toFixed(2)} Bs`);
  };

  // --- FILTRADO DE LA TABLA ---
  const tarifasFiltradas = tarifas.filter((item) => {
    const q = busqueda.toLowerCase().trim();
    const matchBusqueda =
      !q ||
      item.nombre_tarifa.toLowerCase().includes(q) ||
      `tar-${item.id_tarifa}`.includes(q) ||
      item.nombre_habitacion.toLowerCase().includes(q);

    const matchHabitacion = !filtroHabitacion || item.nombre_habitacion === filtroHabitacion;
    const matchEstado = !filtroEstado || item.estado.toLowerCase() === filtroEstado.toLowerCase();

    return matchBusqueda && matchHabitacion && matchEstado;
  });

  // --- CÁLCULOS DINÁMICOS BASADOS EN TARIFAS REALES (CERO DATOS ESTÁTICOS) ---
  const tarifasActivas = tarifas.filter((t) => t.estado?.toLowerCase() === 'activa');
  const activasCount = tarifasActivas.length;

  // Ingreso proyectado al mes = suma de tarifas activas × 30 días mensuales
  const ingresosProyectadosMes = tarifasActivas.reduce(
    (acc, t) => acc + (parseFloat(t.precio_base) || 0) * 30,
    0
  );
  const ingresosProyectadosBs = ingresosProyectadosMes * bcvRate;

  // ADR (Tarifa Promedio) dinámico
  const promedioUSD =
    tarifasActivas.length > 0
      ? (tarifasActivas.reduce((acc, t) => acc + (parseFloat(t.precio_base) || 0), 0) / tarifasActivas.length).toFixed(2)
      : '0.00';

  // Mes actual para encabezados dinámicos
  const fechaActual = new Date();
  const nombreMes = fechaActual.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
  const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  return (
    <main className="tarifas-vista-container">
      {/* 1. Header de Página con Tasa Oficial BCV */}
      <section className="rate-page-intro-row">
        <div className="rate-intro-text">
          <h1 className="rate-main-title">Gestión de Tarifas</h1>
          <p className="rate-subtitle">
            Catálogo de tarifas comerciales y condiciones de precios para tus habitaciones.
          </p>
        </div>

        {/* Píldora interactiva de Tasa Oficial BCV */}
        <article
          className="bcv-exchange-badge"
          onClick={() => {
            setInputBcvRate(String(bcvRate));
            setInputBcvDate(bcvDate);
            setModalBcvAbierto(true);
          }}
          title="Tasa oficial anclada a API en vivo. Haz clic para actualizar o simular."
        >
          <div className="bcv-exchange-icon">
            <ArrowLeftRight size={18} />
          </div>
          <div className="bcv-exchange-content">
            <div className="bcv-rate-value">
              1 USD = <span>{bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> Bs
            </div>
            <div className="bcv-rate-date">
              {cargandoBcv ? 'Consultando API oficial...' : `Tasa oficial BCV · ${bcvDate}`}
            </div>
          </div>
        </article>
      </section>

      {/* 2. Tarjetas KPI Superiores (DINÁMICAS Y SIN DATOS ESTÁTICOS) */}
      <section className="kpi-grid">
        <article className="kpi-card">
          <header className="kpi-header">
            <span className="kpi-title">Tarifas Activas</span>
            <Layers size={18} color="#2563eb" />
          </header>
          <h2 className="kpi-value">{activasCount} Tarifas</h2>
          <small className="kpi-subtitle">Vigentes para reservas actuales</small>
        </article>

        <article className="kpi-card">
          <header className="kpi-header">
            <span className="kpi-title">Ingresos Proyectados (Mes)</span>
            <Wallet size={18} color="#16a34a" />
          </header>
          <h2 className="kpi-value">{formatUSD(ingresosProyectadosMes)}</h2>
          <small className="kpi-subtitle">
            Equivalente: <strong style={{ color: '#2563eb' }}>{formatBs(ingresosProyectadosBs)}</strong>
          </small>
        </article>

        <article className="kpi-card">
          <header className="kpi-header">
            <span className="kpi-title">ADR (Tarifa Promedio)</span>
            <TrendingUp size={18} color="#8b5cf6" />
          </header>
          <h2 className="kpi-value">$ {promedioUSD}</h2>
          <small className="kpi-subtitle">Por noche de hospedaje</small>
        </article>

        {/* Ocupación Actual DESHABILITADA (Sin datos estáticos falsos) */}
        <article
          className="kpi-card"
          style={{ opacity: 0.8, backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1' }}
          title="Módulo de Reservas en desarrollo. La ocupación se calculará dinámicamente con los check-in reales."
        >
          <header className="kpi-header">
            <span className="kpi-title" style={{ color: '#64748b' }}>Ocupación Actual</span>
            <BedDouble size={18} color="#94a3b8" />
          </header>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.15rem 0' }}>
            <h2 className="kpi-value" style={{ color: '#94a3b8' }}>-- %</h2>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', backgroundColor: '#e2e8f0', padding: '0.15rem 0.45rem', borderRadius: 4 }}>
              En desarrollo
            </span>
          </div>
          <small className="kpi-subtitle" style={{ color: '#94a3b8' }}>
            Pendiente de módulo Reservas
          </small>
        </article>
      </section>

      {/* 3. Barra de Búsqueda y Filtros */}
      <section className="crud-toolbar">
        <div className="search-filter-group">
          <div className="search-box-wrap">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Buscar por tarifa, código o habitación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="select-filter-wrap">
            <select value={filtroHabitacion} onChange={(e) => setFiltroHabitacion(e.target.value)}>
              <option value="">Habitación: Todas</option>
              {tiposHabitacion.map((t) => (
                <option key={t.id_tipo_habitacion} value={t.nombre_tipo}>
                  {t.nombre_tipo}
                </option>
              ))}
            </select>
            <ChevronDown className="select-arrow" size={14} />
          </div>

          <div className="select-filter-wrap">
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Estado: Todos</option>
              <option value="Activa">Activa</option>
              <option value="Borrador">Borrador</option>
            </select>
            <ChevronDown className="select-arrow" size={14} />
          </div>
        </div>

        <div className="toolbar-actions">
          <button type="button" className="btn-export-csv" onClick={exportarCSV}>
            <Download size={16} />
            <span>Exportar CSV</span>
          </button>

          <button type="button" className="btn-nueva-tarifa" onClick={abrirModalCrear}>
            <Plus size={18} />
            <span>+ Nueva Tarifa</span>
          </button>
        </div>
      </section>

      {/* 4. Tabla Principal del Catálogo de Tarifas */}
      <section className="table-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem auto' }} />
            <p>Cargando catálogo de tarifas...</p>
          </div>
        ) : errorTabla ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#dc2626' }}>
            <p>{errorTabla}</p>
            <button className="btn-action-draft" onClick={cargarDatos} style={{ marginTop: '0.5rem' }}>
              Reintentar
            </button>
          </div>
        ) : tarifasFiltradas.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>No se encontraron tarifas que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre de la Tarifa</th>
                <th>Habitación</th>
                <th>Precio Base (USD)</th>
                <th>Equivalente BCV (Bs)</th>
                <th>Total c/ IVA</th>
                <th>Ocupación</th>
                <th>Vigencia</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarifasFiltradas.map((r) => {
                const precioNum = parseFloat(r.precio_base) || 0;
                const ivaNum = parseFloat(r.iva) || 16;
                const bsCalc = precioNum * bcvRate;
                const totalNum = precioNum * (1 + ivaNum / 100);
                const badgeClass =
                  r.estado?.toLowerCase() === 'activa'
                    ? 'rate-badge-active'
                    : r.estado?.toLowerCase() === 'borrador'
                    ? 'rate-badge-draft'
                    : 'rate-badge-inactive';

                return (
                  <tr key={r.id_tarifa}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>#TAR-{r.id_tarifa}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.nombre_tarifa}</div>
                      <small style={{ color: '#64748b', fontSize: '0.74rem' }}>
                        {r.incluye ? (r.incluye.length > 40 ? r.incluye.substring(0, 40) + '...' : r.incluye) : ''}
                      </small>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{r.nombre_habitacion}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{formatUSD(precioNum)}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>{formatBs(bsCalc)}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#15803d' }}>{formatUSD(totalNum)}</strong>
                    </td>
                    <td>
                      <small style={{ color: '#475569' }}>{r.ocupacion_base} huéspedes</small>
                    </td>
                    <td>
                      <small style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                        {r.vigente_desde} — {r.vigente_hasta}
                      </small>
                    </td>
                    <td>
                      <span className={`rate-badge ${badgeClass}`}>{r.estado}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-table-action"
                          title="Ver detalles"
                          onClick={() => {
                            setTarifaVer(r);
                            setModalVerAbierto(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-table-action"
                          title="Editar tarifa"
                          onClick={() => abrirModalEditar(r)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-table-action"
                          title="Duplicar tarifa"
                          onClick={() => duplicarTarifa(r.id_tarifa)}
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-table-action delete"
                          title="Eliminar tarifa"
                          onClick={() => {
                            setTarifaAEliminar(r);
                            setModalEliminarAbierto(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* 5. Sección Inferior: Resumen de Ingresos y Flujo de Moneda (100% Dinámico) */}
      <section className="analytics-grid">
        <article className="chart-card">
          <header className="chart-card-header">
            <h3 className="chart-card-title">Aporte de Ingresos por Categoría</h3>
            <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Mes de {mesCapitalizado}</small>
          </header>

          <div className="progress-group">
            {tarifasActivas.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No hay tarifas activas registradas en el catálogo.
              </p>
            ) : (
              tarifasActivas.map((t, idx) => {
                const colores = ['#2563eb', '#7c3aed', '#16a34a', '#ea580c', '#06b6d4', '#ec4899', '#f59e0b'];
                const color = colores[idx % colores.length];
                const aporte = (parseFloat(t.precio_base) || 0) * 30;
                const porcentaje =
                  ingresosProyectadosMes > 0 ? ((aporte / ingresosProyectadosMes) * 100).toFixed(1) : 0;

                return (
                  <div key={t.id_tarifa} className="analytics-progress-item">
                    <div className="analytics-item-labels">
                      <span>
                        {t.nombre_habitacion || t.nombre_tarifa} ({formatUSD(t.precio_base)})
                      </span>
                      <span>
                        {formatUSD(aporte)} ({porcentaje}%)
                      </span>
                    </div>
                    <div className="analytics-item-bar">
                      <div
                        className="analytics-fill"
                        style={{ width: `${porcentaje}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        {/* Flujo de Moneda (Basado en Tasa BCV Oficial y Catálogo Real) */}
        <article className="chart-card">
          <header className="chart-card-header">
            <h3 className="chart-card-title">Modalidad de Monedas y Facturación</h3>
            <DollarSign size={20} color="#2563eb" />
          </header>

          <div className="currency-flow-box">
            <div className="currency-flow-card currency-flow-usd">
              <div>
                <strong style={{ color: '#1e3a8a', fontSize: '0.85rem', display: 'block' }}>
                  Divisas USD (Moneda Base Referencial)
                </strong>
                <small style={{ color: '#64748b', fontSize: '0.72rem' }}>
                  {tarifasActivas.length} tarifas activas fijadas en USD · Zelle, Efectivo, Tarjetas
                </small>
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#1e3a8a' }}>Base</strong>
            </div>

            <div className="currency-flow-card currency-flow-bs">
              <div>
                <strong style={{ color: '#14532d', fontSize: '0.85rem', display: 'block' }}>
                  Bolívares VES (Tasa Oficial BCV del Día)
                </strong>
                <small style={{ color: '#64748b', fontSize: '0.72rem' }}>
                  1 USD = {bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs · Punto de Venta, Pago Móvil, Biopago
                </small>
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#14532d' }}>En Vivo</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1rem', lineHeight: 1.4 }}>
            * Facturación en bolívares calculada en tiempo real mediante la API oficial del Banco Central de Venezuela.
          </p>
        </article>
      </section>

      {/* ======================================================================
          6. MODAL PREMIUM FIGMA: NUEVA / EDITAR TARIFA (2 COLUMNAS)
          ====================================================================== */}
      {modalFormAbierto && (
        <div className="modal-overlay" onClick={() => setModalFormAbierto(false)}>
          <div className="modal-figma-card" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <header className="modal-figma-header">
              <div className="modal-header-title-group">
                <h2>{modoModal === 'CREAR' ? 'Nueva tarifa' : 'Editar tarifa'}</h2>
                <p>Define condiciones comerciales y precios para tus habitaciones.</p>
              </div>

              <div className="modal-header-right">
                <div className="bcv-exchange-badge" style={{ padding: '0.45rem 0.85rem' }}>
                  <div className="bcv-exchange-icon" style={{ width: 26, height: 26 }}>
                    <ArrowLeftRight size={14} />
                  </div>
                  <div className="bcv-exchange-content">
                    <div className="bcv-rate-value" style={{ fontSize: '0.825rem' }}>
                      1 USD = {bcvRate.toFixed(2)} Bs
                    </div>
                    <div className="bcv-rate-date" style={{ fontSize: '0.68rem' }}>Tasa oficial BCV</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setModalFormAbierto(false)}
                  aria-label="Cerrar modal"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Cuerpo del Modal: 2 Columnas */}
            <div className="modal-figma-body">
              {/* Columna Izquierda: Formulario */}
              <div className="rate-form-cards">
                {/* Tarjeta 1: Identificación */}
                <section className="rate-card">
                  <h3 className="rate-card-title">Identificación</h3>

                  <div className="rate-form-group">
                    <label className="rate-label">Nombre de la tarifa</label>
                    <input
                      type="text"
                      name="nombre_tarifa"
                      className="rate-input"
                      value={formData.nombre_tarifa}
                      onChange={handleInputChange}
                      placeholder="Ej. Flexible Ejecutiva"
                      required
                    />
                  </div>

                  <div className="rate-form-group" style={{ marginTop: '1rem' }}>
                    <label className="rate-label">Tipo de habitación</label>
                    <div className="rate-select-wrapper">
                      <select
                        name="id_tipo_habitacion"
                        className="rate-select"
                        value={formData.id_tipo_habitacion}
                        onChange={handleInputChange}
                      >
                        {tiposHabitacion.map((t) => (
                          <option key={t.id_tipo_habitacion} value={t.id_tipo_habitacion}>
                            {t.nombre_tipo}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="select-chevron-icon" size={16} />
                    </div>
                  </div>
                </section>

                {/* Tarjeta 2: Vigencia y precio */}
                <section className="rate-card">
                  <h3 className="rate-card-title">Vigencia y precio</h3>

                  <div className="rate-grid-2">
                    <div className="rate-form-group">
                      <label className="rate-label">Vigente desde</label>
                      <input
                        type="date"
                        name="vigente_desde"
                        className="rate-input"
                        value={formData.vigente_desde}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="rate-form-group">
                      <label className="rate-label">Vigente hasta</label>
                      <input
                        type="date"
                        name="vigente_hasta"
                        className="rate-input"
                        value={formData.vigente_hasta}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="rate-grid-2" style={{ marginTop: '1rem' }}>
                    <div className="rate-form-group">
                      <label className="rate-label">Precio base de referencia (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="precio_base"
                        className="rate-input"
                        value={formData.precio_base}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="rate-helper-text">El USD es la moneda de referencia.</span>
                    </div>

                    <div className="rate-form-group">
                      <label className="rate-label">Equivalente calculado (Bs)</label>
                      <input
                        type="text"
                        className="rate-input rate-input-readonly"
                        value={formatBs(baseBs)}
                        readOnly
                      />
                      <span className="rate-helper-text">Se recalcula automáticamente con BCV.</span>
                    </div>
                  </div>
                </section>

                {/* Tarjeta 3: Impuestos y ocupación */}
                <section className="rate-card">
                  <h3 className="rate-card-title">Impuestos y ocupación</h3>

                  <div className="rate-grid-3">
                    <div className="rate-form-group">
                      <label className="rate-label">IVA (%)</label>
                      <input
                        type="number"
                        step="1"
                        name="iva"
                        className="rate-input"
                        value={formData.iva}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="rate-form-group">
                      <label className="rate-label">Ocupación incluida</label>
                      <input
                        type="number"
                        name="ocupacion_base"
                        className="rate-input"
                        value={formData.ocupacion_base}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="rate-form-group">
                      <label className="rate-label">Huésped adicional ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="huesped_adicional"
                        className="rate-input"
                        value={formData.huesped_adicional}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </section>

                {/* Tarjeta 4: Políticas */}
                <section className="rate-card">
                  <h3 className="rate-card-title">Políticas</h3>
                  <div className="rate-form-group">
                    <label className="rate-label">Condiciones</label>
                    <textarea
                      name="incluye"
                      className="rate-input"
                      style={{ minHeight: 70, resize: 'vertical' }}
                      value={formData.incluye}
                      onChange={handleInputChange}
                      placeholder="Condiciones comerciales, desayunos incluidos, políticas de cancelación..."
                    />
                  </div>
                </section>
              </div>

              {/* Columna Derecha: Tarjeta Sticky Vista Previa del Precio */}
              <aside className="rate-preview-card">
                <h3 className="rate-preview-heading">Vista previa del precio</h3>

                <h4 className="rate-preview-title">{formData.nombre_tarifa || 'Nueva Tarifa'}</h4>
                <div className="rate-preview-room">{habitacionSeleccionadaNombre} · por noche</div>

                <div className="rate-preview-price-usd">{formatUSD(baseUSD)}</div>
                <div className="rate-preview-price-bs">{formatBs(baseBs)}</div>

                <p className="rate-preview-disclaimer">
                  Precio antes de IVA. El cobro en bolívares usa la tasa oficial BCV vigente al momento del pago.
                </p>

                {/* Caja BCV interna */}
                <div className="rate-preview-bcv-box">
                  <div className="preview-bcv-icon">
                    <ArrowLeftRight size={16} />
                  </div>
                  <div className="preview-bcv-details">
                    <strong>1 USD = {bcvRate.toFixed(2)} Bs</strong>
                    <small>Tasa oficial BCV · {bcvDate}</small>
                  </div>
                </div>

                {/* Desglose de Totales */}
                <div className="rate-preview-breakdown">
                  <div className="breakdown-row">
                    <span>Base</span>
                    <span>{formatUSD(baseUSD)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>IVA {ivaPorc}%</span>
                    <span>{formatUSD(ivaUSD)}</span>
                  </div>
                  <div className="breakdown-divider" />
                  <div className="breakdown-row breakdown-total">
                    <span>Total estimado</span>
                    <span>{formatUSD(totalUSD)}</span>
                  </div>
                  <div className="breakdown-total-bs-row">
                    <span>Equivalente en Bs:</span>
                    <strong>{formatBs(totalBs)}</strong>
                  </div>
                </div>
              </aside>
            </div>

            {/* Footer de Acciones del Modal */}
            <footer className="modal-figma-footer">
              <button
                type="button"
                className="btn-action-create"
                onClick={() => guardarTarifa(false)}
                disabled={guardando}
              >
                <Check size={16} />
                <span>{guardando ? 'Guardando...' : modoModal === 'CREAR' ? 'Crear tarifa' : 'Guardar cambios'}</span>
              </button>

              <button
                type="button"
                className="btn-action-draft"
                onClick={() => guardarTarifa(true)}
                disabled={guardando}
              >
                Guardar borrador
              </button>

              <button
                type="button"
                className="btn-action-cancel"
                onClick={() => setModalFormAbierto(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ======================================================================
          7. MODAL: DETALLES DE LA TARIFA (VER DETALLES)
          ====================================================================== */}
      {modalVerAbierto && tarifaVer && (
        <div className="modal-overlay" onClick={() => setModalVerAbierto(false)}>
          <div className="modal-small-card" style={{ maxWidth: 520, textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Detalles de la Tarifa</h3>
              <button type="button" className="btn-close-modal" onClick={() => setModalVerAbierto(false)}>
                <X size={16} />
              </button>
            </header>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 8 }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>NOMBRE DE LA TARIFA</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{tarifaVer.nombre_tarifa}</strong>
                <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 500, marginTop: '0.2rem' }}>
                  {tarifaVer.nombre_habitacion}
                </div>
              </div>

              <div className="rate-grid-2">
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>PRECIO BASE (USD)</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{formatUSD(tarifaVer.precio_base)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>EQUIVALENTE BCV (BS)</span>
                  <strong style={{ fontSize: '1.1rem', color: '#2563eb' }}>
                    {formatBs((parseFloat(tarifaVer.precio_base) || 0) * bcvRate)}
                  </strong>
                </div>
              </div>

              <div className="rate-grid-2">
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>VIGENCIA</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {tarifaVer.vigente_desde} — {tarifaVer.vigente_hasta}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>TOTAL ESTIMADO C/ IVA</span>
                  <strong style={{ fontSize: '1.05rem', color: '#16a34a' }}>
                    {formatUSD((parseFloat(tarifaVer.precio_base) || 0) * (1 + (parseFloat(tarifaVer.iva) || 16) / 100))}
                  </strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>CONDICIONES & POLÍTICAS</span>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.825rem', color: '#334155', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  {tarifaVer.incluye || 'Sin condiciones especificadas.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem' }}>
                <button type="button" className="btn-action-cancel" onClick={() => setModalVerAbierto(false)}>
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn-action-create"
                  onClick={() => {
                    setModalVerAbierto(false);
                    abrirModalEditar(tarifaVer);
                  }}
                >
                  <Pencil size={15} /> Editar esta Tarifa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          8. MODAL: CONFIRMAR ELIMINACIÓN
          ====================================================================== */}
      {modalEliminarAbierto && tarifaAEliminar && (
        <div className="modal-overlay" onClick={() => setModalEliminarAbierto(false)}>
          <div className="modal-small-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-delete-icon-box">
              <Trash2 size={26} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              ¿Eliminar Tarifa?
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.45 }}>
              Esta acción <strong>no se puede deshacer</strong>. Se borrará permanentemente la tarifa{' '}
              <strong style={{ color: '#0f172a' }}>"{tarifaAEliminar.nombre_tarifa}"</strong> del catálogo del hotel.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
              <button type="button" className="btn-delete-confirm" onClick={confirmarEliminar}>
                Sí, eliminar tarifa
              </button>
              <button type="button" className="btn-action-cancel" onClick={() => setModalEliminarAbierto(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          9. MODAL: ACTUALIZAR TASA OFICIAL BCV
          ====================================================================== */}
      {modalBcvAbierto && (
        <div className="modal-overlay" onClick={() => setModalBcvAbierto(false)}>
          <div className="modal-small-card" style={{ maxWidth: 440, textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#2563eb" />
                Actualizar Tasa Oficial BCV
              </h3>
              <button type="button" className="btn-close-modal" onClick={() => setModalBcvAbierto(false)}>
                <X size={16} />
              </button>
            </header>

            <form onSubmit={aplicarTasaBcv} style={{ width: '100%' }}>
              <div className="rate-form-group">
                <label className="rate-label">Tasa Oficial (Bs / USD)</label>
                <input
                  type="number"
                  step="0.01"
                  className="rate-input"
                  style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1d4ed8' }}
                  value={inputBcvRate}
                  onChange={(e) => setInputBcvRate(e.target.value)}
                  required
                />
              </div>

              <div className="rate-form-group" style={{ marginTop: '1rem' }}>
                <label className="rate-label">Fecha y Hora de Publicación</label>
                <input
                  type="text"
                  className="rate-input"
                  value={inputBcvDate}
                  onChange={(e) => setInputBcvDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-action-cancel" onClick={() => setModalBcvAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-action-create">
                  <RefreshCw size={15} /> Actualizar Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Toasts flotantes */}
      <aside className="toast-container-fixed">
        {toasts.map((t) => (
          <article key={t.id} className="toast-item">
            <Check size={18} color="#16a34a" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>{t.mensaje}</span>
          </article>
        ))}
      </aside>
    </main>
  );
}
