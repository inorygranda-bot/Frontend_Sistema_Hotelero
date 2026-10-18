import React, { useState, useEffect } from 'react';
import XLSX from 'xlsx-js-style';
import '../../estilos/tarifas.css';

// SVG Icons 100% compatibles con React sin librerías externas
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

const Layers = (p) => <IconSvg {...p}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></IconSvg>;
const Wallet = (p) => <IconSvg {...p}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></IconSvg>;
const TrendingUp = (p) => <IconSvg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></IconSvg>;
const BedDouble = (p) => <IconSvg {...p}><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></IconSvg>;
const Search = (p) => <IconSvg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></IconSvg>;
const Plus = (p) => <IconSvg {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconSvg>;
const Eye = (p) => <IconSvg {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></IconSvg>;
const Pencil = (p) => <IconSvg {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></IconSvg>;
const Trash2 = (p) => <IconSvg {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconSvg>;
const ArrowLeftRight = (p) => <IconSvg {...p}><path d="m9 7-5 5 5 5"/><path d="m15 7 5 5-5 5"/><path d="M4 12h16"/></IconSvg>;
const X = (p) => <IconSvg {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconSvg>;
const Check = (p) => <IconSvg {...p}><polyline points="20 6 9 17 4 12"/></IconSvg>;
const ChevronDown = (p) => <IconSvg {...p}><path d="m6 9 6 6 6-6"/></IconSvg>;
const DollarSign = (p) => <IconSvg {...p}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></IconSvg>;
const RefreshCw = (p) => <IconSvg {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></IconSvg>;
const FileSpreadsheet = (p) => (
  <IconSvg {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="M8 13h2"/>
    <path d="M14 13h2"/>
    <path d="M8 17h2"/>
    <path d="M14 17h2"/>
  </IconSvg>
);

const API_BASE = 'http://localhost:3000/api/tarifas';

export default function Tarifas() {
  const [tarifas, setTarifas] = useState([]);
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroHabitacion, setFiltroHabitacion] = useState('');
  const [filtroTemporada, setFiltroTemporada] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [bcvRate, setBcvRate] = useState(872.39);
  const [bcvDate, setBcvDate] = useState('Consultando API...');
  const [cargandoBcv, setCargandoBcv] = useState(true);
  const [modalBcvAbierto, setModalBcvAbierto] = useState(false);
  const [inputBcvRate, setInputBcvRate] = useState('872.39');
  const [inputBcvDate, setInputBcvDate] = useState('');

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR');
  const [editId, setEditId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const initialForm = {
    nombre_tarifa: 'Flexible Ejecutiva',
    id_tipo_habitacion: '',
    id_temporada: '',
    precio_base: '120.00',
    iva: '16',
    ocupacion_base: '2',
    huesped_adicional: '15.00',
    incluye: 'Incluye desayuno. No reembolsable dentro de las 48 horas previas.',
    estado: 'Activa'
  };
  const [formData, setFormData] = useState(initialForm);

  // Modal para definir nueva temporada (Fechas Alta / Baja)
  const [modalTemporadaAbierto, setModalTemporadaAbierto] = useState(false);
  const [formTemporada, setFormTemporada] = useState({
    nombre_temporada: '',
    dia_inicio: 1,
    mes_inicio: 1,
    dia_fin: 31,
    mes_fin: 12,
    descripcion: ''
  });

  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [tarifaVer, setTarifaVer] = useState(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [tarifaAEliminar, setTarifaAEliminar] = useState(null);
  const [modalLimiteAbierto, setModalLimiteAbierto] = useState(false);
  const [toasts, setToasts] = useState([]);

  const lanzarToast = (mensaje) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensaje }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const cargarTasaBcv = async () => {
    try {
      setCargandoBcv(true);
      let response = await fetch(`${API_BASE}/tasa-bcv`).catch(() => null);
      if (!response || !response.ok) {
        response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      }
      if (response && response.ok) {
        const data = await response.json();
        const tasaReal = parseFloat(data.tasa || data.promedio);
        if (tasaReal && !isNaN(tasaReal)) {
          setBcvRate(tasaReal);
          setInputBcvRate(String(tasaReal));
          let fechaTexto = 'Hoy';
          if (data.fecha || data.fechaActualizacion) {
            try {
              const d = new Date(data.fecha || data.fechaActualizacion);
              fechaTexto = d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
            } catch (e) {
              fechaTexto = 'Hoy';
            }
          }
          setBcvDate(fechaTexto);
          setInputBcvDate(fechaTexto);
        }
      }
    } catch (err) {
      console.warn('Error al consultar tasa BCV:', err);
    } finally {
      setCargandoBcv(false);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setErrorTabla(null);

      const [resTarifas, resTipos, resTemp, resHabitaciones, resReservas] = await Promise.all([
        fetch(API_BASE),
        fetch(`${API_BASE}/tipos-habitacion`),
        fetch(`${API_BASE}/temporadas`),
        fetch('http://localhost:3000/api/habitaciones').catch(() => null),
        fetch('http://localhost:3000/api/reservas').catch(() => null)
      ]);

      if (!resTarifas.ok || !resTipos.ok || !resTemp.ok) {
        throw new Error('Error al conectar con la base de datos del hotel.');
      }

      const dataTarifas = await resTarifas.json();
      const dataTipos = await resTipos.json();
      const dataTemp = await resTemp.json();

      setTarifas(dataTarifas);
      setTiposHabitacion(dataTipos);
      setTemporadas(dataTemp);

      if (resHabitaciones && resHabitaciones.ok) {
        setHabitaciones(await resHabitaciones.json());
      }
      if (resReservas && resReservas.ok) {
        setReservas(await resReservas.json());
      }

      if (dataTipos.length > 0 && !formData.id_tipo_habitacion) {
        setFormData((prev) => ({ 
          ...prev, 
          id_tipo_habitacion: dataTipos[0].id_tipo_habitacion,
          id_temporada: dataTemp[0]?.id_temporada || ''
        }));
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

  const formatUSD = (val) => '$ ' + (parseFloat(val) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (val) => 'Bs ' + (parseFloat(val) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const baseUSD = parseFloat(formData.precio_base) || 0;
  const ivaPorc = parseFloat(formData.iva) || 16;
  const baseBs = baseUSD * bcvRate;
  const ivaUSD = baseUSD * (ivaPorc / 100);
  const totalUSD = baseUSD + ivaUSD;

  const habitacionSeleccionadaNombre =
    tiposHabitacion.find((t) => String(t.id_tipo_habitacion) === String(formData.id_tipo_habitacion))?.nombre_tipo || 'Habitación';

  const temporadaSeleccionadaNombre =
    temporadas.find((t) => String(t.id_temporada) === String(formData.id_temporada))?.nombre_temporada || 'Temporada';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const abrirModalCrear = () => {
    setModoModal('CREAR');
    setEditId(null);
    setFormData({
      ...initialForm,
      id_tipo_habitacion: tiposHabitacion[0]?.id_tipo_habitacion || '',
      id_temporada: temporadas[0]?.id_temporada || ''
    });
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (tarifa) => {
    setModoModal('EDITAR');
    setEditId(tarifa.id_tarifa);
    setFormData({
      nombre_tarifa: tarifa.nombre_tarifa || '',
      id_tipo_habitacion: tarifa.id_tipo_habitacion || '',
      id_temporada: tarifa.id_temporada || '',
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
    if (!formData.nombre_tarifa.trim() || !formData.id_tipo_habitacion || !formData.id_temporada) {
      lanzarToast('Por favor completa el nombre, el tipo de habitación y la temporada.');
      return;
    }

    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      setGuardando(true);
      const payload = {
        ...formData,
        estado: esBorrador ? 'Borrador' : formData.estado || 'Activa',
        id_usuario: idUsuarioActual
      };

      const url = modoModal === 'CREAR' ? API_BASE : `${API_BASE}/${editId}`;
      const method = modoModal === 'CREAR' ? 'POST' : 'PUT';

      const respuesta = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await respuesta.json();
      if (!respuesta.ok) throw new Error(resData.mensaje || 'Error al guardar tarifa.');

      setModalFormAbierto(false);
      lanzarToast(modoModal === 'CREAR' ? 'Tarifa registrada con éxito.' : 'Tarifa actualizada correctamente.');
      cargarDatos();
    } catch (err) {
      lanzarToast(err.message || 'Error al guardar tarifa.');
    } finally {
      setGuardando(false);
    }
  };

  const guardarTemporada = async (e) => {
    e.preventDefault();
    if (!formTemporada.nombre_temporada.trim()) {
      lanzarToast('El nombre de la temporada es obligatorio.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/temporadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formTemporada)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al registrar temporada');
      lanzarToast('Temporada configurada exitosamente.');
      setModalTemporadaAbierto(false);
      setFormTemporada({ nombre_temporada: '', dia_inicio: 1, mes_inicio: 1, dia_fin: 31, mes_fin: 12, descripcion: '' });
      cargarDatos();
    } catch (err) {
      lanzarToast(err.message || 'Error al guardar temporada');
    }
  };

  const confirmarEliminar = async () => {
    if (!tarifaAEliminar) return;
    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      const res = await fetch(`${API_BASE}/${tarifaAEliminar.id_tarifa}?id_usuario=${idUsuarioActual}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo eliminar');
      setModalEliminarAbierto(false);
      setTarifaAEliminar(null);
      lanzarToast('Tarifa eliminada permanentemente.');
      cargarDatos();
    } catch (err) {
      lanzarToast(err.message || 'Error al eliminar');
    }
  };

  const exportarExcel = () => {
    if (!tarifasFiltradas || tarifasFiltradas.length === 0) {
      lanzarToast('No hay tarifas para exportar.');
      return;
    }
    try {
      const wb = XLSX.utils.book_new();
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const horaStr = hoy.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

      const headers = ['Código', 'Nombre de la Tarifa', 'Habitación / Tipo', 'Temporada', 'Precio Base (USD)', 'Equivalente BCV (Bs.)', 'IVA (%)', 'Total c/ IVA (USD)', 'Total c/ IVA (Bs.)', 'Estado', 'Servicios'];
      const rows = [];

      tarifasFiltradas.forEach((r) => {
        const precioBase = parseFloat(r.precio_base) || 0;
        const ivaP = parseFloat(r.iva) || 16;
        const precioBs = precioBase * bcvRate;
        const tUSD = precioBase * (1 + ivaP / 100);
        const tBs = tUSD * bcvRate;

        rows.push([
          `#TAR-${r.id_tarifa}`, r.nombre_tarifa || '', r.nombre_habitacion || '', r.nombre_temporada || '', precioBase, precioBs, `${ivaP}%`, tUSD, tBs, r.estado || 'Activa', r.incluye || ''
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet([
        ['SISTEMA HOTELERO — CATÁLOGO DE TARIFAS Y TEMPORADAS'],
        [`Generado: ${fechaStr} ${horaStr} | Tasa BCV: 1 USD = ${bcvRate.toFixed(2)} Bs.`],
        [],
        headers,
        ...rows
      ]);

      XLSX.utils.book_append_sheet(wb, ws, 'Catálogo de Tarifas');
      XLSX.writeFile(wb, `Tarifas_Hotel_${hoy.toISOString().slice(0, 10)}.xlsx`);
      lanzarToast('Catálogo exportado exitosamente.');
    } catch (err) {
      lanzarToast('Error al generar Excel.');
    }
  };

  const aplicarTasaBcv = (e) => {
    e.preventDefault();
    const rate = parseFloat(inputBcvRate);
    if (!rate || rate <= 0) return;
    setBcvRate(rate);
    setBcvDate(inputBcvDate);
    setModalBcvAbierto(false);
    lanzarToast(`Tasa BCV actualizada a 1 USD = ${rate.toFixed(2)} Bs`);
  };

  const tarifasFiltradas = tarifas.filter((item) => {
    const q = busqueda.toLowerCase().trim();
    const matchBusqueda = !q || item.nombre_tarifa.toLowerCase().includes(q) || `tar-${item.id_tarifa}`.includes(q) || item.nombre_habitacion.toLowerCase().includes(q);
    const matchHabitacion = !filtroHabitacion || item.nombre_habitacion === filtroHabitacion;
    const matchTemporada = !filtroTemporada || String(item.id_temporada) === filtroTemporada;
    const matchEstado = !filtroEstado || item.estado.toLowerCase() === filtroEstado.toLowerCase();
    return matchBusqueda && matchHabitacion && matchTemporada && matchEstado;
  });

  const tarifasActivas = tarifas.filter((t) => t.estado?.toLowerCase() === 'activa');
  const ingresosProyectadosMes = tarifasActivas.reduce((acc, t) => acc + (parseFloat(t.precio_base) || 0) * 30, 0);
  const ingresosProyectadosBs = ingresosProyectadosMes * bcvRate;
  const promedioUSD = tarifasActivas.length > 0 ? (tarifasActivas.reduce((acc, t) => acc + (parseFloat(t.precio_base) || 0), 0) / tarifasActivas.length).toFixed(2) : '0.00';

  const totalHabitaciones = habitaciones.length;
  const hoyISO = new Date().toISOString().slice(0, 10);
  const habitacionesOcupadasSet = new Set();
  habitaciones.forEach((hab) => { if (hab.estado?.toLowerCase() === 'ocupada') habitacionesOcupadasSet.add(String(hab.codigo_habitacion)); });
  reservas.forEach((res) => {
    if (['CHECKIN', 'CONFIRMADA', 'PENDIENTE'].includes((res.estado || '').toUpperCase())) {
      if (res.fecha_checkin && res.fecha_checkout && hoyISO >= String(res.fecha_checkin).slice(0, 10) && hoyISO <= String(res.fecha_checkout).slice(0, 10)) {
        habitacionesOcupadasSet.add(String(res.codigo_habitacion));
      }
    }
  });

  const cantOcupadas = Math.min(totalHabitaciones, habitacionesOcupadasSet.size);
  const porcentajeOcupacion = totalHabitaciones > 0 ? Math.round((cantOcupadas / totalHabitaciones) * 100) : 0;
  const mesCapitalizado = new Date().toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });

  return (
    <main className="tarifas-vista-container">
      <section className="rate-page-intro-row">
        <section className="rate-intro-text">
          <h1 className="rate-main-title">Gestión de Tarifas</h1>
          <p className="rate-subtitle">Catálogo de tarifas comerciales y temporadas para tus habitaciones.</p>
        </section>

        <article className="bcv-exchange-badge" onClick={() => { setInputBcvRate(String(bcvRate)); setInputBcvDate(bcvDate); setModalBcvAbierto(true); }}>
          <section className="bcv-exchange-icon"><ArrowLeftRight size={18} /></section>
          <section className="bcv-exchange-content">
            <span className="bcv-rate-value">1 USD = <span>{bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> Bs</span>
            <span className="bcv-rate-date">{cargandoBcv ? 'Consultando API...' : `Tasa oficial BCV · ${bcvDate}`}</span>
          </section>
        </article>
      </section>

      <section className="kpi-grid">
        <article className="kpi-card">
          <header className="kpi-header">
            <span className="kpi-title">Tarifas Activas</span>
            <Layers size={18} color="#2563eb" />
          </header>
          <h2 className="kpi-value">{tarifasActivas.length} Tarifas</h2>
          <span className="kpi-subtitle">Vigentes para reservas actuales</span>
        </article>

        <article className="kpi-card">
          <header className="kpi-header">
            <span className="kpi-title">Ingresos Proyectados (Mes)</span>
            <Wallet size={18} color="#16a34a" />
          </header>
          <h2 className="kpi-value">{formatUSD(ingresosProyectadosMes)}</h2>
          <span className="kpi-subtitle">Equivalente: <strong className="kpi-equiv-bs">{formatBs(ingresosProyectadosBs)}</strong></span>
        </article>

        <article className="kpi-card">
          <header className="kpi-header">
            <span className="kpi-title">ADR (Tarifa Promedio)</span>
            <TrendingUp size={18} color="#8b5cf6" />
          </header>
          <h2 className="kpi-value">$ {promedioUSD}</h2>
          <span className="kpi-subtitle">Por noche de hospedaje</span>
        </article>

        <article className="kpi-card">
          <header className="kpi-header">
            <span className="kpi-title">Ocupación Actual</span>
            <BedDouble size={18} color="#0284c7" />
          </header>
          <section className="kpi-value-row">
            <h2 className="kpi-value">{porcentajeOcupacion}%</h2>
            <span className={`kpi-badge-ocupacion ${porcentajeOcupacion >= 80 ? 'kpi-badge-ocupacion-alta' : porcentajeOcupacion >= 40 ? 'kpi-badge-ocupacion-media' : 'kpi-badge-ocupacion-normal'}`}>
              {porcentajeOcupacion >= 80 ? 'Alta Demanda' : 'Activa'}
            </span>
          </section>
          <span className="kpi-subtitle">{cantOcupadas} de {totalHabitaciones} hab. ocupadas</span>
        </article>
      </section>

      <section className="crud-toolbar">
        <section className="search-filter-group">
          <label className="search-box-wrap">
            <Search className="search-icon" size={16} />
            <input type="text" placeholder="Buscar por tarifa, código o habitación..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </label>

          <label className="select-filter-wrap">
            <select value={filtroHabitacion} onChange={(e) => setFiltroHabitacion(e.target.value)}>
              <option value="">Habitación: Todas</option>
              {tiposHabitacion.map((t) => (
                <option key={t.id_tipo_habitacion} value={t.nombre_tipo}>{t.nombre_tipo}</option>
              ))}
            </select>
            <ChevronDown className="select-arrow" size={14} />
          </label>

          <label className="select-filter-wrap">
            <select value={filtroTemporada} onChange={(e) => setFiltroTemporada(e.target.value)}>
              <option value="">Temporada: Todas</option>
              {temporadas.map((temp) => (
                <option key={temp.id_temporada} value={temp.id_temporada}>{temp.nombre_temporada}</option>
              ))}
            </select>
            <ChevronDown className="select-arrow" size={14} />
          </label>

          <label className="select-filter-wrap">
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Estado: Todos</option>
              <option value="Activa">Activa</option>
              <option value="Borrador">Borrador</option>
            </select>
            <ChevronDown className="select-arrow" size={14} />
          </label>
        </section>

        <section className="toolbar-actions">
          <button type="button" className="btn-export-excel" onClick={exportarExcel}>
            <FileSpreadsheet size={16} />
            <span>Exportar Excel</span>
          </button>
          <button type="button" className="btn-secundario-barra" onClick={() => setModalTemporadaAbierto(true)}>
            <span>+ Definir Temporada</span>
          </button>
          <button type="button" className="btn-nueva-tarifa" onClick={abrirModalCrear}>
            <Plus size={18} />
            <span>+ Nueva Tarifa</span>
          </button>
        </section>
      </section>

      <section className="table-card">
        {loading ? (
          <section className="table-state-box">
            <RefreshCw className="animate-spin spin-icon" size={24} />
            <p>Cargando catálogo de tarifas...</p>
          </section>
        ) : errorTabla ? (
          <section className="table-state-box table-state-error">
            <p>{errorTabla}</p>
            <button type="button" className="btn-action-draft btn-retry" onClick={cargarDatos}>Reintentar</button>
          </section>
        ) : tarifasFiltradas.length === 0 ? (
          <section className="table-state-box table-state-empty">
            <p className="table-empty-text">No se encontraron tarifas registradas.</p>
          </section>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre de la Tarifa</th>
                <th>Habitación</th>
                <th>Temporada</th>
                <th>Precio Base (USD)</th>
                <th>Equivalente BCV (Bs)</th>
                <th>Total c/ IVA</th>
                <th>Ocupación</th>
                <th>Estado</th>
                <th className="th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tarifasFiltradas.map((r) => {
                const precioNum = parseFloat(r.precio_base) || 0;
                const ivaNum = parseFloat(r.iva) || 16;
                const totalNum = precioNum * (1 + ivaNum / 100);
                return (
                  <tr key={r.id_tarifa}>
                    <td><strong className="table-rate-id">#TAR-{r.id_tarifa}</strong></td>
                    <td>
                      <strong className="table-rate-title">{r.nombre_tarifa}</strong>
                      <small className="table-rate-desc">{r.incluye ? (r.incluye.length > 40 ? r.incluye.substring(0, 40) + '...' : r.incluye) : ''}</small>
                    </td>
                    <td><span className="table-room-name">{r.nombre_habitacion}</span></td>
                    <td><span className="rate-badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>{r.nombre_temporada || 'General'}</span></td>
                    <td><strong className="table-price-base">{formatUSD(precioNum)}</strong></td>
                    <td><span className="table-price-bs">{formatBs(precioNum * bcvRate)}</span></td>
                    <td><strong className="table-price-total">{formatUSD(totalNum)}</strong></td>
                    <td><small className="table-occupancy">{r.ocupacion_base} huéspedes</small></td>
                    <td><span className={`rate-badge ${r.estado?.toLowerCase() === 'activa' ? 'rate-badge-active' : 'rate-badge-draft'}`}>{r.estado}</span></td>
                    <td>
                      <nav className="table-actions">
                        <button type="button" className="btn-table-action" onClick={() => { setTarifaVer(r); setModalVerAbierto(true); }}><Eye size={16} /></button>
                        <button type="button" className="btn-table-action" onClick={() => abrirModalEditar(r)}><Pencil size={16} /></button>
                        <button type="button" className="btn-table-action delete" onClick={() => { setTarifaAEliminar(r); setModalEliminarAbierto(true); }}><Trash2 size={16} /></button>
                      </nav>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="analytics-grid">
        <article className="chart-card">
          <header className="chart-card-header">
            <h3 className="chart-card-title">Aporte de Ingresos por Categoría</h3>
            <span className="chart-card-subtitle">{mesCapitalizado}</span>
          </header>
          <section className="progress-group">
            {tarifasActivas.length === 0 ? (
              <p className="analytics-empty-message">No hay tarifas activas registradas.</p>
            ) : (
              tarifasActivas.map((t, idx) => {
                const colores = ['#2563eb', '#7c3aed', '#16a34a', '#ea580c', '#06b6d4', '#ec4899', '#f59e0b'];
                const aporte = (parseFloat(t.precio_base) || 0) * 30;
                const porcentaje = ingresosProyectadosMes > 0 ? ((aporte / ingresosProyectadosMes) * 100).toFixed(1) : 0;
                return (
                  <article key={t.id_tarifa} className="analytics-progress-item">
                    <section className="analytics-item-labels">
                      <span>{t.nombre_habitacion || t.nombre_tarifa}</span>
                      <span>{formatUSD(aporte)} ({porcentaje}%)</span>
                    </section>
                    <section className="analytics-item-bar">
                      <article className="analytics-fill" style={{ width: `${porcentaje}%`, backgroundColor: colores[idx % colores.length] }} />
                    </section>
                  </article>
                );
              })
            )}
          </section>
        </article>

        <article className="chart-card">
          <header className="chart-card-header">
            <h3 className="chart-card-title">Modalidad de Monedas y Facturación</h3>
            <DollarSign size={20} color="#2563eb" />
          </header>
          <section className="currency-flow-box">
            <article className="currency-flow-card currency-flow-usd">
              <section>
                <strong className="currency-title-usd">Divisas USD (Moneda Base Referencial)</strong>
                <small className="currency-desc">{tarifasActivas.length} tarifas activas fijadas en USD</small>
              </section>
              <strong className="currency-tag-usd">Base</strong>
            </article>
            <article className="currency-flow-card currency-flow-bs">
              <section>
                <strong className="currency-title-bs">Bolívares VES (Tasa Oficial BCV)</strong>
                <small className="currency-desc">1 USD = {bcvRate.toFixed(2)} Bs · Punto de Venta, Pago Móvil</small>
              </section>
              <strong className="currency-tag-bs">En Vivo</strong>
            </article>
          </section>
        </article>
      </section>

      {/* MODAL CREAR / EDITAR TARIFA */}
      {modalFormAbierto && (
        <section className="overlay-modal" onClick={() => setModalFormAbierto(false)}>
          <article className="modal-figma-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-figma-header">
              <section className="modal-header-title-group">
                <h2>{modoModal === 'CREAR' ? 'Nueva tarifa' : 'Editar tarifa'}</h2>
                <p>Define condiciones comerciales y selecciona la temporada y habitación.</p>
              </section>
              <button type="button" className="btn-close-modal" onClick={() => setModalFormAbierto(false)}><X size={18} /></button>
            </header>

            <section className="modal-figma-body">
              <section className="rate-form-cards">
                <article className="rate-card">
                  <h3 className="rate-card-title">Identificación y Configuración</h3>
                  <label className="rate-form-group">
                    <span className="rate-label">Nombre de la tarifa</span>
                    <input type="text" name="nombre_tarifa" className="rate-input" value={formData.nombre_tarifa} onChange={handleInputChange} required />
                  </label>

                  <section className="rate-grid-2 form-group-spaced">
                    <label className="rate-form-group">
                      <span className="rate-label">Tipo de habitación</span>
                      <select name="id_tipo_habitacion" className="rate-select" value={formData.id_tipo_habitacion} onChange={handleInputChange}>
                        {tiposHabitacion.map((t) => (
                          <option key={t.id_tipo_habitacion} value={t.id_tipo_habitacion}>{t.nombre_tipo}</option>
                        ))}
                      </select>
                    </label>

                    <label className="rate-form-group">
                      <span className="rate-label">Temporada aplicable</span>
                      <select name="id_temporada" className="rate-select" value={formData.id_temporada} onChange={handleInputChange}>
                        {temporadas.map((temp) => (
                          <option key={temp.id_temporada} value={temp.id_temporada}>{temp.nombre_temporada}</option>
                        ))}
                      </select>
                    </label>
                  </section>
                </article>

                <article className="rate-card">
                  <h3 className="rate-card-title">Precio y Ocupación</h3>
                  <section className="rate-grid-2">
                    <label className="rate-form-group">
                      <span className="rate-label">Precio base (USD)</span>
                      <input type="number" step="0.01" name="precio_base" className="rate-input" value={formData.precio_base} onChange={handleInputChange} required />
                    </label>
                    <label className="rate-form-group">
                      <span className="rate-label">Equivalente (Bs)</span>
                      <input type="text" className="rate-input rate-input-readonly" value={formatBs(baseBs)} readOnly />
                    </label>
                  </section>
                </article>

                <article className="rate-card">
                  <h3 className="rate-card-title">Políticas</h3>
                  <label className="rate-form-group">
                    <span className="rate-label">Condiciones / Incluye</span>
                    <textarea name="incluye" className="rate-input rate-textarea" value={formData.incluye} onChange={handleInputChange} />
                  </label>
                </article>
              </section>

              <aside className="rate-preview-card">
                <h3 className="rate-preview-heading">Vista previa del precio</h3>
                <h4 className="rate-preview-title">{formData.nombre_tarifa || 'Nueva Tarifa'}</h4>
                <p className="rate-preview-room">{habitacionSeleccionadaNombre} · {temporadaSeleccionadaNombre}</p>
                <strong className="rate-preview-price-usd">{formatUSD(baseUSD)}</strong>
                <p className="rate-preview-price-bs">{formatBs(baseBs)}</p>
                <section className="rate-preview-breakdown">
                  <section className="breakdown-row"><span>Base</span><span>{formatUSD(baseUSD)}</span></section>
                  <section className="breakdown-row"><span>IVA {ivaPorc}%</span><span>{formatUSD(ivaUSD)}</span></section>
                  <section className="breakdown-divider" />
                  <section className="breakdown-row breakdown-total"><span>Total</span><span>{formatUSD(totalUSD)}</span></section>
                </section>
              </aside>
            </section>

            <footer className="modal-figma-footer">
              <button type="button" className="btn-action-cancel" onClick={() => setModalFormAbierto(false)}>Cancelar</button>
              <button type="button" className="btn-action-create" onClick={() => guardarTarifa(false)} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar tarifa'}
              </button>
            </footer>
          </article>
        </section>
      )}

      {/* MODAL DEFINIR TEMPORADA (ALTA / BAJA) */}
      {modalTemporadaAbierto && (
        <section className="overlay-modal" onClick={() => setModalTemporadaAbierto(false)}>
          <article className="modal-small-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', textAlign: 'left' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Definir Temporada (Alta / Baja)</h3>
              <button type="button" className="btn-close-modal" onClick={() => setModalTemporadaAbierto(false)}><X size={16} /></button>
            </header>
            <form onSubmit={guardarTemporada} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <label className="rate-form-group">
                <span className="rate-label">Nombre de la Temporada</span>
                <input type="text" className="rate-input" placeholder="Ej. Temporada Alta - Diciembre" value={formTemporada.nombre_temporada} onChange={(e) => setFormTemporada({ ...formTemporada, nombre_temporada: e.target.value })} required />
              </label>
              <section className="rate-grid-2">
                <label className="rate-form-group">
                  <span className="rate-label">Día Inicio</span>
                  <input type="number" className="rate-input" value={formTemporada.dia_inicio} onChange={(e) => setFormTemporada({ ...formTemporada, dia_inicio: parseInt(e.target.value) })} min="1" max="31" />
                </label>
                <label className="rate-form-group">
                  <span className="rate-label">Mes Inicio (1-12)</span>
                  <input type="number" className="rate-input" value={formTemporada.mes_inicio} onChange={(e) => setFormTemporada({ ...formTemporada, mes_inicio: parseInt(e.target.value) })} min="1" max="12" />
                </label>
              </section>
              <section className="rate-grid-2">
                <label className="rate-form-group">
                  <span className="rate-label">Día Fin</span>
                  <input type="number" className="rate-input" value={formTemporada.dia_fin} onChange={(e) => setFormTemporada({ ...formTemporada, dia_fin: parseInt(e.target.value) })} min="1" max="31" />
                </label>
                <label className="rate-form-group">
                  <span className="rate-label">Mes Fin (1-12)</span>
                  <input type="number" className="rate-input" value={formTemporada.mes_fin} onChange={(e) => setFormTemporada({ ...formTemporada, mes_fin: parseInt(e.target.value) })} min="1" max="12" />
                </label>
              </section>
              <label className="rate-form-group">
                <span className="rate-label">Descripción</span>
                <textarea className="rate-input" placeholder="Detalles de la temporada..." value={formTemporada.descripcion} onChange={(e) => setFormTemporada({ ...formTemporada, descripcion: e.target.value })} />
              </label>
              <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-action-cancel" onClick={() => setModalTemporadaAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-action-create">Guardar Temporada</button>
              </footer>
            </form>
          </article>
        </section>
      )}

      {/* MODAL VER DETALLES */}
      {modalVerAbierto && tarifaVer && (
        <section className="overlay-modal" onClick={() => setModalVerAbierto(false)}>
          <article className="modal-small-card modal-detalles-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-detalles-header">
              <h3 className="modal-detalles-title">Detalles de la Tarifa</h3>
              <button type="button" className="btn-close-modal" onClick={() => setModalVerAbierto(false)}><X size={16} /></button>
            </header>
            <section className="modal-detalles-body">
              <section className="modal-detalles-highlight">
                <span className="detalles-label">TARIFA</span>
                <strong className="detalles-nombre">{tarifaVer.nombre_tarifa}</strong>
                <span className="detalles-habitacion">{tarifaVer.nombre_habitacion} · {tarifaVer.nombre_temporada}</span>
              </section>
              <section className="rate-grid-2">
                <article><span className="detalles-label">PRECIO BASE</span><strong className="detalles-valor-usd">{formatUSD(tarifaVer.precio_base)}</strong></article>
                <article><span className="detalles-label">EQUIVALENTE BCV</span><strong className="detalles-valor-bs">{formatBs((parseFloat(tarifaVer.precio_base) || 0) * bcvRate)}</strong></article>
              </section>
              <footer className="modal-detalles-actions">
                <button type="button" className="btn-action-cancel" onClick={() => setModalVerAbierto(false)}>Cerrar</button>
              </footer>
            </section>
          </article>
        </section>
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminarAbierto && tarifaAEliminar && (
        <section className="overlay-modal" onClick={() => setModalEliminarAbierto(false)}>
          <article className="modal-small-card" onClick={(e) => e.stopPropagation()}>
            <section className="modal-delete-icon-box"><Trash2 size={26} /></section>
            <h3 className="modal-delete-title">¿Eliminar Tarifa?</h3>
            <p className="modal-delete-text">Esta acción no se puede deshacer. Se borrará la tarifa <strong>"{tarifaAEliminar.nombre_tarifa}"</strong>.</p>
            <section className="modal-delete-actions">
              <button type="button" className="btn-delete-confirm" onClick={confirmarEliminar}>Sí, eliminar</button>
              <button type="button" className="btn-action-cancel" onClick={() => setModalEliminarAbierto(false)}>Cancelar</button>
            </section>
          </article>
        </section>
      )}

      {/* MODAL TASA BCV */}
      {modalBcvAbierto && (
        <section className="overlay-modal" onClick={() => setModalBcvAbierto(false)}>
          <article className="modal-small-card modal-bcv-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-bcv-header">
              <h3 className="modal-bcv-title"><TrendingUp size={18} color="#2563eb" /> Actualizar Tasa BCV</h3>
              <button type="button" className="btn-close-modal" onClick={() => setModalBcvAbierto(false)}><X size={16} /></button>
            </header>
            <form onSubmit={aplicarTasaBcv} className="modal-bcv-form">
              <label className="rate-form-group">
                <span className="rate-label">Tasa Oficial (Bs / USD)</span>
                <input type="number" step="0.01" className="rate-input rate-input-bcv" value={inputBcvRate} onChange={(e) => setInputBcvRate(e.target.value)} required />
              </label>
              <footer className="modal-bcv-actions">
                <button type="button" className="btn-action-cancel" onClick={() => setModalBcvAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-action-create"><RefreshCw size={15} /> Actualizar</button>
              </footer>
            </form>
          </article>
        </section>
      )}

      <aside className="toast-container-fixed">
        {toasts.map((t) => (
          <article key={t.id} className="toast-item">
            <Check size={18} color="#16a34a" />
            <span className="toast-text">{t.mensaje}</span>
          </article>
        ))}
      </aside>
    </main>
  );
}