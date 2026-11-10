import React, { useState, useEffect } from 'react';
import XLSX from 'xlsx-js-style';
import '../../estilos/habitaciones.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_HABITACIONES_URL = 'http://localhost:3000/api/habitaciones';
const API_TIPOS_URL = 'http://localhost:3000/api/tipos-habitacion';

export default function Habitaciones() {

  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [formatoReporte, setFormatoReporte] = useState('EXCEL'); // 'EXCEL' | 'PDF' | 'CORREO'
  const [filtroReporteEstado, setFiltroReporteEstado] = useState('TODAS');
  const [filtroReporteTipo, setFiltroReporteTipo] = useState('TODOS');
  const [filtroReportePiso, setFiltroReportePiso] = useState('TODOS');
  const [filtroReporteBusqueda, setFiltroReporteBusqueda] = useState('');
  const [correoDestino, setCorreoDestino] = useState('');
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  const [pestannaActiva, setPestannaActiva] = useState('HABITACIONES');
  const [habitaciones, setHabitaciones] = useState([]);
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroPiso, setFiltroPiso] = useState('TODOS');

  // Estados del modal de formulario de Habitaciones (Crear / Editar)
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR');
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState({});

  const estadoInicialFormHabitacion = {
    codigo_habitacion: '',
    id_tipo_habitacion: '',
    piso: '',
    capacidad: '',
    estado: 'Disponible',
    amenidades: ''
  };

  const [formDataHabitacion, setFormDataHabitacion] = useState(estadoInicialFormHabitacion);

  const [modalTipoAbierto, setModalTipoAbierto] = useState(false);
  const [modoTipoModal, setModoTipoModal] = useState('CREAR');
  const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);
  const [guardandoTipo, setGuardandoTipo] = useState(false);
  const [erroresTipoForm, setErroresTipoForm] = useState({});
  const estadoInicialFormTipo = {
    nombre_tipo: '',
    descripcion: '',
    precio_base: '100.00'
  };
  const [formDataTipo, setFormDataTipo] = useState(estadoInicialFormTipo);

  // Modal de detalle de habitación
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);

  // Modal de alertas
  const [alerta, setAlerta] = useState({
    abierto: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
    accionConfirmar: null,
    textoConfirmar: 'Aceptar'
  });

  const obtenerIdUsuarioActual = () => {
    try {
      const sesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
      if (sesion.id_usuario) return Number(sesion.id_usuario);
      if (sesion.usuario && sesion.usuario.id_usuario) return Number(sesion.usuario.id_usuario);
    } catch (e) {
      console.error("Error leyendo localStorage:", e);
    }
    return 1;
  };

  const cargarDatos = async () => {
   setLoading(true);
    setErrorTabla(null);

    try {
      // 1. AGREGA ESTO: Construir los parámetros con los filtros actuales
      const params = new URLSearchParams({
        estado: filtroEstado,
        tipo: filtroTipo,
        piso: filtroPiso,
        busqueda: busqueda
      });

      // 2. MODIFICA EL FETCH para incluir los query parameters:
      const respHabitaciones = await fetch(`${API_HABITACIONES_URL}?${params.toString()}`);
      if (respHabitaciones.ok) {
        const datosHabitaciones = await respHabitaciones.json();
        setHabitaciones(Array.isArray(datosHabitaciones) ? datosHabitaciones : []);
      } else {
        setHabitaciones([]);
      }
    } catch (errHab) {
      console.error('Error al cargar habitaciones:', errHab);
      setHabitaciones([]);
    }

    try {
      const respTipos = await fetch(API_TIPOS_URL);
      if (respTipos.ok) {
        const datosTipos = await respTipos.json();
        setTiposHabitacion(Array.isArray(datosTipos) ? datosTipos : []);
      } else {
        setTiposHabitacion([]);
      }
    } catch (errTipos) {
      console.error('Error al cargar tipos de habitación:', errTipos);
      setTiposHabitacion([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado, filtroTipo, filtroPiso, busqueda]);

  const validarCampoHabitacion = (nombre, valor) => {
    let error = '';
    if (nombre === 'codigo_habitacion') {
      if (!valor && valor !== 0) error = 'El número de habitación es obligatorio.';
      else if (!/^\d+$/.test(valor)) error = 'Solo se permiten números.';
    }
    if (nombre === 'id_tipo_habitacion' && !valor) error = 'Seleccione un tipo de habitación.';
    if (nombre === 'piso' && !valor.trim()) error = 'El piso es obligatorio.';
    if (nombre === 'capacidad') {
      if (!valor) error = 'La capacidad es obligatoria.';
      else if (!/^\d+$/.test(valor) || Number(valor) <= 0) error = 'Debe ser mayor a 0.';
    }
    if (nombre === 'amenidades' && !valor.trim()) error = 'Indique las amenidades.';
    return error;
  };

  const handleChangeHabitacion = (e) => {
    const { name, value } = e.target;
    setFormDataHabitacion((prev) => ({ ...prev, [name]: value }));
    const errorMensaje = validarCampoHabitacion(name, value);
    setErroresForm((prev) => ({ ...prev, [name]: errorMensaje }));
  };

  const validarCampoTipo = (nombre, valor) => {
    let error = '';
    if (nombre === 'nombre_tipo' && !valor.trim()) error = 'El nombre es obligatorio.';
    if (nombre === 'descripcion' && !valor.trim()) error = 'La descripción es obligatoria.';
    return error;
  };

  const handleChangeTipo = (e) => {
    const { name, value } = e.target;
    setFormDataTipo((prev) => ({ ...prev, [name]: value }));
    const errorMensaje = validarCampoTipo(name, value);
    setErroresTipoForm((prev) => ({ ...prev, [name]: errorMensaje }));
  };

  const abrirModalCrearHabitacion = () => {
    setFormDataHabitacion(estadoInicialFormHabitacion);
    setErroresForm({});
    setModoModal('CREAR');
    setModalFormAbierto(true);
  };

  const abrirModalEditarHabitacion = (habitacion) => {
    setFormDataHabitacion({
      codigo_habitacion: habitacion.codigo_habitacion,
      id_tipo_habitacion: habitacion.id_tipo_habitacion || '',
      piso: habitacion.piso || '',
      capacidad: habitacion.capacidad || '',
      estado: habitacion.estado || 'Disponible',
      amenidades: habitacion.amenidades || ''
    });
    setErroresForm({});
    setModoModal('EDITAR');
    setModalFormAbierto(true);
    if (modalDetalleAbierto) cerrarDetalle();
  };

  const cerrarModalFormHabitacion = () => {
    if (guardando) return;
    setModalFormAbierto(false);
    setFormDataHabitacion(estadoInicialFormHabitacion);
    setErroresForm({});
  };

  const confirmarEliminacionHabitacion = (codigoHabitacion) => {
    if (modalDetalleAbierto) cerrarDetalle();
    setAlerta({
      abierto: true,
      tipo: 'confirmar',
      titulo: '¿Eliminar Habitación?',
      mensaje: `¿Estás seguro de que deseas eliminar la habitación N° ${codigoHabitacion}? Esta acción no se puede deshacer.`,
      accionConfirmar: () => eliminarHabitacion(codigoHabitacion),
      textoConfirmar: 'Sí, eliminar'
    });
  };

  const eliminarHabitacion = async (codigoHabitacion) => {
    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(`${API_HABITACIONES_URL}/${codigoHabitacion}?id_usuario=${idUsuarioActual}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || 'No se pudo eliminar la habitación.');
      }

      cerrarDetalle();
      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Habitación Eliminada!',
        mensaje: data.mensaje || 'La habitación fue eliminada exitosamente.'
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Eliminar',
        mensaje: err.message
      });
    }
  };

  const handleSubmitHabitacion = async (e) => {
    e.preventDefault();
    const erroresTemp = {};
    Object.keys(formDataHabitacion).forEach((key) => {
      const err = validarCampoHabitacion(key, formDataHabitacion[key]);
      if (err) erroresTemp[key] = err;
    });

    if (Object.keys(erroresTemp).length > 0) {
      setErroresForm(erroresTemp);
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Formulario Incompleto',
        mensaje: 'Por favor, revise los campos marcados antes de guardar la habitación.'
      });
      return;
    }

    setGuardando(true);
    const esCrear = modoModal === 'CREAR';
    const url = esCrear ? API_HABITACIONES_URL : `${API_HABITACIONES_URL}/${formDataHabitacion.codigo_habitacion}`;
    const metodo = esCrear ? 'POST' : 'PUT';
    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formDataHabitacion,
          id_usuario: idUsuarioActual
        })
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json().catch(() => ({}));
        throw new Error(errData.mensaje || 'Error al guardar la habitación.');
      }

      cerrarModalFormHabitacion();
      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: esCrear ? '¡Habitación Creada!' : '¡Habitación Actualizada!',
        mensaje: esCrear ? 'La habitación fue registrada correctamente.' : 'Datos actualizados.'
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Guardar',
        mensaje: err.message
      });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoOperativo = async (nuevoEstado) => {
    if (!habitacionSeleccionada) return;

    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(`${API_HABITACIONES_URL}/${habitacionSeleccionada.codigo_habitacion}/cambiar-estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
          id_usuario: idUsuarioActual
        })
      });

      const resData = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resData.mensaje || 'Error al cambiar el estado.');
      }

      await cargarDatos();
      cerrarDetalle();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Estado Actualizado!',
        mensaje: `Habitación N° ${habitacionSeleccionada.codigo_habitacion} marcada como "${nuevoEstado}".`
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error en la Operación',
        mensaje: err.message
      });
    }
  };

  const abrirModalCrearTipo = () => {
    setFormDataTipo(estadoInicialFormTipo);
    setErroresTipoForm({});
    setModoTipoModal('CREAR');
    setTipoSeleccionadoId(null);
    setModalTipoAbierto(true);
  };

  const abrirModalEditarTipo = (tipo) => {
    setFormDataTipo({
      nombre_tipo: tipo.nombre_tipo || '',
      descripcion: tipo.descripcion || ''
    });
    setErroresTipoForm({});
    setModoTipoModal('EDITAR');
    setTipoSeleccionadoId(tipo.id_tipo_habitacion);
    setModalTipoAbierto(true);
  };

  const cerrarModalTipo = () => {
    if (guardandoTipo) return;
    setModalTipoAbierto(false);
    setFormDataTipo(estadoInicialFormTipo);
    setErroresTipoForm({});
  };

  const handleSubmitTipo = async (e) => {
    e.preventDefault();
    const erroresTemp = {};
    Object.keys(formDataTipo).forEach((key) => {
      const err = validarCampoTipo(key, formDataTipo[key]);
      if (err) erroresTemp[key] = err;
    });

    if (Object.keys(erroresTemp).length > 0) {
      setErroresTipoForm(erroresTemp);
      return;
    }

    setGuardandoTipo(true);
    const esCrear = modoTipoModal === 'CREAR';
    const url = esCrear ? API_TIPOS_URL : `${API_TIPOS_URL}/${tipoSeleccionadoId}`;
    const metodo = esCrear ? 'POST' : 'PUT';
    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formDataTipo,
          id_usuario: idUsuarioActual
        })
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json().catch(() => ({}));
        throw new Error(errData.mensaje || 'No se pudo guardar el tipo de habitación.');
      }

      cerrarModalTipo();
      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: esCrear ? '¡Tipo Registrado!' : '¡Tipo Actualizado!',
        mensaje: esCrear ? 'El nuevo tipo de habitación fue guardado con éxito.' : 'Se actualizaron los datos del tipo de habitación.'
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Registrar Tipo',
        mensaje: err.message
      });
    } finally {
      setGuardandoTipo(false);
    }
  };

  const confirmarEliminacionTipo = (tipo) => {
    setAlerta({
      abierto: true,
      tipo: 'confirmar',
      titulo: '¿Eliminar Tipo de Habitación?',
      mensaje: `¿Estás seguro de eliminar el tipo "${tipo.nombre_tipo}"? Si hay habitaciones asociadas, el sistema bloqueará la acción.`,
      accionConfirmar: () => eliminarTipo(tipo.id_tipo_habitacion),
      textoConfirmar: 'Sí, eliminar'
    });
  };

  const eliminarTipo = async (idTipo) => {
    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(`${API_TIPOS_URL}/${idTipo}?id_usuario=${idUsuarioActual}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || 'No se pudo eliminar el tipo de habitación.');
      }

      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Tipo Eliminado!',
        mensaje: data.mensaje || 'Tipo de habitación eliminado exitosamente.'
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Eliminar',
        mensaje: err.message
      });
    }
  };

  const pisosUnicos = Array.from(
    new Set(habitaciones.map((h) => (h.piso || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const hayFiltrosHabitaciones =
    busqueda.trim() !== '' ||
    filtroEstado !== 'TODAS' ||
    filtroTipo !== 'TODOS' ||
    filtroPiso !== 'TODOS';

  const limpiarFiltrosHabitaciones = () => {
    setBusqueda('');
    setFiltroEstado('TODAS');
    setFiltroTipo('TODOS');
    setFiltroPiso('TODOS');
  };

  const habitacionesFiltradas = habitaciones.filter((h) => {
    const q = busqueda.trim().toLowerCase();
    const coincideBusqueda =
      !q ||
      h.codigo_habitacion?.toString().toLowerCase().includes(q) ||
      (h.nombre_tipo || h.tipo || '').toLowerCase().includes(q) ||
      (h.nombre_huesped || '').toLowerCase().includes(q) ||
      (h.amenidades || '').toLowerCase().includes(q);

    const coincideEstado =
      filtroEstado === 'TODAS' ||
      h.estado?.toLowerCase() === filtroEstado.toLowerCase();

    const nombreTipoHab = (h.nombre_tipo || h.tipo || '').trim();
    const coincideTipo =
      filtroTipo === 'TODOS' ||
      nombreTipoHab.toLowerCase() === filtroTipo.toLowerCase();

    const pisoHab = (h.piso || '').trim();
    const coincidePiso =
      filtroPiso === 'TODOS' ||
      pisoHab.toLowerCase() === filtroPiso.toLowerCase();

    return coincideBusqueda && coincideEstado && coincideTipo && coincidePiso;
  });

  const tiposFiltrados = tiposHabitacion.filter((t) =>
    t.nombre_tipo?.toLowerCase().includes(busqueda.trim().toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const abrirDetalle = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setModalDetalleAbierto(true);
  };

  const cerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setHabitacionSeleccionada(null);
  };

  const habitacionesReporteFiltradas = habitaciones.filter((h) => {
    const q = filtroReporteBusqueda.trim().toLowerCase();
    const coincideBusqueda =
      !q ||
      h.codigo_habitacion?.toString().toLowerCase().includes(q) ||
      (h.nombre_tipo || h.tipo || '').toLowerCase().includes(q) ||
      (h.nombre_huesped || '').toLowerCase().includes(q) ||
      (h.amenidades || '').toLowerCase().includes(q);

    const coincideEstado =
      filtroReporteEstado === 'TODAS' ||
      h.estado?.toLowerCase() === filtroReporteEstado.toLowerCase();

    const nombreTipoHab = (h.nombre_tipo || h.tipo || '').trim();
    const coincideTipo =
      filtroReporteTipo === 'TODOS' ||
      nombreTipoHab.toLowerCase() === filtroReporteTipo.toLowerCase();

    const pisoHab = (h.piso || '').trim();
    const coincidePiso =
      filtroReportePiso === 'TODOS' ||
      pisoHab.toLowerCase() === filtroReportePiso.toLowerCase();

    return coincideBusqueda && coincideEstado && coincideTipo && coincidePiso;
  });

  const exportarExcelHabitaciones = async () => {
    try {
      const urlReporte = `${API_HABITACIONES_URL}/reporte/excel?estado=${encodeURIComponent(filtroReporteEstado)}&tipo=${encodeURIComponent(filtroReporteTipo)}&piso=${encodeURIComponent(filtroReportePiso)}&busqueda=${encodeURIComponent(filtroReporteBusqueda || '')}`;
      const respuesta = await fetch(urlReporte);
      if (!respuesta.ok) throw new Error('No se pudo obtener la data para el Excel.');
      const datos = await respuesta.json();

      if (!datos || datos.length === 0) {
        setAlerta({
          abierto: true,
          tipo: 'error',
          titulo: 'Sin registros',
          mensaje: 'No hay habitaciones disponibles con los filtros seleccionados para generar el reporte Excel.'
        });
        return;
      }

      const wb = XLSX.utils.book_new();
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const horaStr = hoy.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
      const folioFecha = hoy.toISOString().slice(0, 10).replace(/-/g, '');

      let nombreAutor = 'Administración Hotelera';
      try {
        const sesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
        nombreAutor = sesion.nombre || sesion.usuario?.nombre || 'Administración Hotelera';
      } catch (e) {
        nombreAutor = 'Administración Hotelera';
      }

      const estilosTitulo = {
        font: { name: 'Segoe UI', sz: 14, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E3A8A" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      const estilosSubtitulo = {
        font: { name: 'Segoe UI', sz: 10, italic: true, color: { rgb: "334155" } },
        fill: { fgColor: { rgb: "F1F5F9" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      const estilosHeader = {
        font: { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2563EB" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: "CBD5E1" } },
          bottom: { style: 'thin', color: { rgb: "CBD5E1" } },
          left: { style: 'thin', color: { rgb: "CBD5E1" } },
          right: { style: 'thin', color: { rgb: "CBD5E1" } }
        }
      };

      const estilosGrupo = {
        font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "1E3A8A" } },
        fill: { fgColor: { rgb: "DBEAFE" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          top: { style: 'thin', color: { rgb: "93C5FD" } },
          bottom: { style: 'thin', color: { rgb: "93C5FD" } },
          left: { style: 'thin', color: { rgb: "93C5FD" } },
          right: { style: 'thin', color: { rgb: "93C5FD" } }
        }
      };

      const estilosCelda = {
        font: { name: 'Segoe UI', sz: 10, color: { rgb: "0F172A" } },
        alignment: { vertical: "center" },
        border: {
          top: { style: 'thin', color: { rgb: "E2E8F0" } },
          bottom: { style: 'thin', color: { rgb: "E2E8F0" } },
          left: { style: 'thin', color: { rgb: "E2E8F0" } },
          right: { style: 'thin', color: { rgb: "E2E8F0" } }
        }
      };

      const estilosCeldaNumero = {
        ...estilosCelda,
        alignment: { horizontal: "right", vertical: "center" },
        numFmt: "$#,##0.00"
      };

      const estilosCeldaCentro = {
        ...estilosCelda,
        alignment: { horizontal: "center", vertical: "center" }
      };

      const estilosSubtotal = {
        font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "0F172A" } },
        fill: { fgColor: { rgb: "F1F5F9" } },
        alignment: { horizontal: "right", vertical: "center" },
        border: {
          top: { style: 'thin', color: { rgb: "94A3B8" } },
          bottom: { style: 'medium', color: { rgb: "64748B" } },
          left: { style: 'thin', color: { rgb: "CBD5E1" } },
          right: { style: 'thin', color: { rgb: "CBD5E1" } }
        }
      };

      const estilosGranTotal = {
        font: { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: "1E3A8A" } },
        fill: { fgColor: { rgb: "E0E7FF" } },
        alignment: { horizontal: "right", vertical: "center" },
        border: {
          top: { style: 'thin', color: { rgb: "1E3A8A" } },
          bottom: { style: 'double', color: { rgb: "1E3A8A" } },
          left: { style: 'thin', color: { rgb: "93C5FD" } },
          right: { style: 'thin', color: { rgb: "93C5FD" } }
        }
      };

      const estilosPieControl = {
        font: { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: "64748B" } },
        alignment: { horizontal: "right", vertical: "center" }
      };

      const headers = [
        'Código Hab.',
        'Piso',
        'Tipo de Habitación',
        'Capacidad',
        'Estado',
        'Huésped Actual',
        'Check-in',
        'Check-out',
        'Tarifa Base (USD)'
      ];

      const crearFilaCombinada = (texto, estilo, numCols = 9) => {
        const fila = [{ v: texto, s: estilo }];
        for (let i = 1; i < numCols; i++) {
          fila.push({ v: '', s: estilo });
        }
        return fila;
      };

      const filtrosAplicados = [];
      if (filtroReporteTipo !== 'TODOS') filtrosAplicados.push(`Tipo: ${filtroReporteTipo}`);
      if (filtroReportePiso !== 'TODOS') filtrosAplicados.push(`Piso: ${filtroReportePiso}`);
      if (filtroReporteEstado !== 'TODAS') filtrosAplicados.push(`Estado: ${filtroReporteEstado}`);
      if (filtroReporteBusqueda.trim()) filtrosAplicados.push(`Búsqueda: "${filtroReporteBusqueda.trim()}"`);
      const resumenFiltros = filtrosAplicados.length > 0 ? filtrosAplicados.join(' • ') : 'Todos los registros';

      const wsData = [
        crearFilaCombinada('SISTEMA HOTELERO — INFORME DE OCUPACIÓN Y ESTADO DE HABITACIONES', estilosTitulo, 9),
        crearFilaCombinada(`Generado el: ${fechaStr} ${horaStr} | Período: Corte en tiempo real | Módulo: Habitaciones | Filtros: [${resumenFiltros}] | Emitido por: ${nombreAutor} | Folio: #HAB-${folioFecha} | Pág. 1 de 1`, estilosSubtitulo, 9),
        [],
        headers.map((h) => ({ v: h, s: estilosHeader }))
      ];

      const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
      ];

      const gruposPorTipo = {};
      datos.forEach((h) => {
        const tipoKey = (h.tipo_habitacion || 'Sin Tipo Asignado').trim();
        if (!gruposPorTipo[tipoKey]) {
          gruposPorTipo[tipoKey] = [];
        }
        gruposPorTipo[tipoKey].push(h);
      });

      let totalHabGeneral = 0;
      let totalOcupadasGeneral = 0;
      let totalDisponiblesGeneral = 0;
      let granTotalTarifaUSD = 0;

      Object.entries(gruposPorTipo).forEach(([tipoNombre, listaGrupo]) => {
        const filaGrupoIdx = wsData.length;
        wsData.push(
          crearFilaCombinada(
            `▸ TIPO DE HABITACIÓN: ${tipoNombre.toUpperCase()} (${listaGrupo.length} ${listaGrupo.length === 1 ? 'habitación' : 'habitaciones'})`,
            estilosGrupo,
            9
          )
        );
        merges.push({ s: { r: filaGrupoIdx, c: 0 }, e: { r: filaGrupoIdx, c: 8 } });

        let ocupadasGrupo = 0;
        let disponiblesGrupo = 0;
        let sumaTarifaGrupo = 0;

        listaGrupo.forEach((h, idx) => {
          const precioBase = parseFloat(h.precio_base) || 0;
          const estadoActual = h.estado || 'Disponible';
          const estadoLower = estadoActual.toLowerCase();

          if (estadoLower === 'ocupada') {
            ocupadasGrupo++;
            totalOcupadasGeneral++;
          } else if (estadoLower === 'disponible') {
            disponiblesGrupo++;
            totalDisponiblesGeneral++;
          }

          sumaTarifaGrupo += precioBase;
          granTotalTarifaUSD += precioBase;
          totalHabGeneral++;

          let colorEstado = "15803D"; 
          if (estadoLower === 'ocupada') colorEstado = "1D4ED8"; 
          else if (estadoLower === 'sucia') colorEstado = "B45309"; 
          else if (estadoLower.includes('fuera')) colorEstado = "BE123C"; 

          const filaEstilo = idx % 2 === 0
            ? { fill: { fgColor: { rgb: "FFFFFF" } } }
            : { fill: { fgColor: { rgb: "F8FAFC" } } };

          const tieneHuesped = estadoLower === 'ocupada' && h.nombre_huesped;

          wsData.push([
            { v: `Hab. ${h.clave}`, s: { ...estilosCeldaCentro, ...filaEstilo, font: { ...estilosCeldaCentro.font, bold: true } } },
            { v: String(h.piso || 'N/A'), s: { ...estilosCeldaCentro, ...filaEstilo } },
            { v: tipoNombre, s: { ...estilosCelda, ...filaEstilo } },
            { v: `${h.capacidad || 1} pers.`, s: { ...estilosCeldaCentro, ...filaEstilo } },
            { v: estadoActual, s: { ...estilosCeldaCentro, ...filaEstilo, font: { ...estilosCeldaCentro.font, bold: true, color: { rgb: colorEstado } } } },
            { v: tieneHuesped ? h.nombre_huesped : '—', s: { ...estilosCelda, ...filaEstilo } },
            { v: estadoLower === 'ocupada' && h.fecha_checkin ? h.fecha_checkin : '—', s: { ...estilosCeldaCentro, ...filaEstilo } },
            { v: estadoLower === 'ocupada' && h.fecha_checkout ? h.fecha_checkout : '—', s: { ...estilosCeldaCentro, ...filaEstilo } },
            { v: precioBase, t: 'n', s: { ...estilosCeldaNumero, ...filaEstilo, font: { ...estilosCeldaNumero.font, bold: true } } }
          ]);
        });

        const filaSubtotalIdx = wsData.length;
        const otrasGrupo = listaGrupo.length - ocupadasGrupo - disponiblesGrupo;
        const textoSubtotal = `Subtotal ${tipoNombre}: ${listaGrupo.length} hab.  |  Ocupadas: ${ocupadasGrupo}  •  Disponibles: ${disponiblesGrupo}${otrasGrupo > 0 ? `  •  Mant./Sucia: ${otrasGrupo}` : ''}  |  Subtotal Tarifa Base (USD):`;

        const filaSub = [];
        for (let c = 0; c < 8; c++) {
          filaSub.push({ v: c === 0 ? textoSubtotal : '', s: estilosSubtotal });
        }
        filaSub.push({
          v: sumaTarifaGrupo,
          t: 'n',
          s: { ...estilosSubtotal, numFmt: "$#,##0.00" }
        });

        wsData.push(filaSub);
        merges.push({ s: { r: filaSubtotalIdx, c: 0 }, e: { r: filaSubtotalIdx, c: 7 } });
      });

      wsData.push([]);

      const porcentajeOcupacionGlobal = totalHabGeneral > 0
        ? ((totalOcupadasGeneral / totalHabGeneral) * 100).toFixed(1)
        : '0.0';

      const filaGranTotalIdx = wsData.length;
      const textoGranTotal = `GRAN TOTAL CONSOLIDADO — Total Hab.: ${totalHabGeneral}  |  Ocupadas: ${totalOcupadasGeneral}  |  Disponibles: ${totalDisponiblesGeneral}  |  Ocupación Global: ${porcentajeOcupacionGlobal}%  |  Total Recaudable (USD):`;

      const filaTotalGeneral = [];
      for (let c = 0; c < 8; c++) {
        filaTotalGeneral.push({ v: c === 0 ? textoGranTotal : '', s: estilosGranTotal });
      }
      filaTotalGeneral.push({
        v: granTotalTarifaUSD,
        t: 'n',
        s: { ...estilosGranTotal, numFmt: "$#,##0.00" }
      });

      wsData.push(filaTotalGeneral);
      merges.push({ s: { r: filaGranTotalIdx, c: 0 }, e: { r: filaGranTotalIdx, c: 7 } });

      const filaPieIdx = wsData.length;
      wsData.push(
        crearFilaCombinada(
          `Documento de Control Interno — Autoría: ${nombreAutor} | Folio: #HAB-${folioFecha} | Página 1 de 1`,
          estilosPieControl,
          9
        )
      );
      merges.push({ s: { r: filaPieIdx, c: 0 }, e: { r: filaPieIdx, c: 8 } });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!merges'] = merges;
      ws['!cols'] = [
        { wch: 14 },
        { wch: 12 },
        { wch: 24 },
        { wch: 14 },
        { wch: 18 },
        { wch: 28 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Ocupación Habitaciones');
      XLSX.writeFile(wb, `Reporte_Habitaciones_${hoy.toISOString().slice(0, 10)}.xlsx`);
      setModalReporteAbierto(false);

      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Reporte Exportado!',
        mensaje: 'El informe operativo de habitaciones se ha generado y descargado exitosamente.'
      });
    } catch (err) {
      console.error('Error al exportar Excel de habitaciones:', err);
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Exportar',
        mensaje: err.message || 'Ocurrió un error al intentar generar el reporte en Excel.'
      });
    }
  };

  const exportarReportePDFHabitaciones = async () => {
    try {
      const urlReporte = `${API_HABITACIONES_URL}/reporte/excel?estado=${encodeURIComponent(filtroReporteEstado)}&tipo=${encodeURIComponent(filtroReporteTipo)}&piso=${encodeURIComponent(filtroReportePiso)}&busqueda=${encodeURIComponent(filtroReporteBusqueda || '')}`;
      const respuesta = await fetch(urlReporte);
      if (!respuesta.ok) throw new Error('No se pudo obtener la data para el PDF.');
      const datos = await respuesta.json();

      if (!datos || datos.length === 0) {
        setAlerta({ abierto: true, tipo: 'error', titulo: 'Sin registros', mensaje: 'No hay datos para generar el PDF con los filtros seleccionados.' });
        return;
      }

      const doc = new jsPDF();
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString('es-VE');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("SISTEMA HOTELERO — INFORME OPERATIVO DE HABITACIONES", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Fecha de emisión: ${fechaStr} | Estado: [${filtroReporteEstado}] | Tipo: [${filtroReporteTipo}]`, 14, 26);

      const totalHabitaciones = datos.length;
      const totalRecaudable = datos.reduce((acc, curr) => acc + parseFloat(curr.precio_base || 0), 0);

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 32, 182, 16, 2, 2, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Habitaciones: ${totalHabitaciones}`, 18, 42);
      doc.text(`Tarifa Base Acumulada: $${totalRecaudable.toFixed(2)} USD`, 100, 42);

      const headers = [['Hab.', 'Piso', 'Tipo de Habitación', 'Capacidad', 'Estado', 'Tarifa Base']];
      const rows = datos.map(h => [
        `Hab. ${h.clave}`,
        `Piso ${h.piso}`,
        h.tipo_habitacion,
        `${h.capacidad} pers.`,
        h.estado,
        `$${parseFloat(h.precio_base || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 54,
        head: headers,
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      doc.save(`Reporte_Habitaciones_${hoy.toISOString().slice(0, 10)}.pdf`);
      setModalReporteAbierto(false);

      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡PDF Generado!',
        mensaje: 'El informe operativo en formato PDF se descargó correctamente.'
      });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error al generar PDF', mensaje: err.message });
    }
  };

  const enviarReportePorCorreoHabitaciones = async () => {
    if (!correoDestino || !correoDestino.trim()) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Correo Requerido', mensaje: 'Por favor, escriba una dirección de correo válida.' });
      return;
    }

    setEnviandoCorreo(true);
    try {
      const respuesta = await fetch(`${API_HABITACIONES_URL}/reporte/correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo_destino: correoDestino,
          estado: filtroReporteEstado,
          tipo: filtroReporteTipo,
          piso: filtroReportePiso,
          busqueda: filtroReporteBusqueda
        })
      });

      const resData = await respuesta.json();
      if (!respuesta.ok) throw new Error(resData.mensaje || 'Error al enviar el correo.');

      setModalReporteAbierto(false);
      setCorreoDestino('');
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Correo Despachado!',
        mensaje: 'El reporte de habitaciones fue enviado exitosamente a la bandeja de entrada.'
      });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error de Envío', mensaje: err.message });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  return (
    <section className="contenedor-habitaciones">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Gestión de Habitaciones</h1>
        <p className="subtitulo-vista">Control de estado, tipologías y mantenimiento hotelero</p>
      </header>

      <nav className="pestañas-navegacion">
        <button
          type="button"
          className={`boton-pestanna ${pestannaActiva === 'HABITACIONES' ? 'activa' : ''}`}
          onClick={() => setPestannaActiva('HABITACIONES')}
        >
          Habitaciones
        </button>
        <button
          type="button"
          className={`boton-pestanna ${pestannaActiva === 'TIPOS' ? 'activa' : ''}`}
          onClick={() => setPestannaActiva('TIPOS')}
        >
          Tipos de Habitación
        </button>
      </nav>

      <section className="barra-herramientas">
        <section className="grupo-controles" style={{ flexWrap: 'wrap' }}>
          <label className="caja-busqueda">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input
              type="search"
              className="input-busqueda"
              placeholder={pestannaActiva === 'HABITACIONES' ? "Buscar por N° hab., huésped o amenidad..." : "Buscar tipo de habitación..."}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          {pestannaActiva === 'HABITACIONES' && (
            <>
              <label className="caja-filtro">
                <select
                  className="select-filtro"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="TODOS">Tipo: Todos</option>
                  {tiposHabitacion.map((t) => (
                    <option key={t.id_tipo_habitacion} value={t.nombre_tipo}>
                      {t.nombre_tipo}
                    </option>
                  ))}
                </select>
              </label>

              <label className="caja-filtro">
                <select
                  className="select-filtro"
                  value={filtroPiso}
                  onChange={(e) => setFiltroPiso(e.target.value)}
                >
                  <option value="TODOS">Piso: Todos</option>
                  {pisosUnicos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>

              <label className="caja-filtro">
                <select
                  className="select-filtro"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="TODAS">Estado: Todos</option>
                  <option value="Disponible">Disponibles</option>
                  <option value="Ocupada">Ocupadas</option>
                  <option value="Sucia">Sucias</option>
                  <option value="Fuera de servicio">Fuera de servicio</option>
                </select>
              </label>

              {hayFiltrosHabitaciones && (
                <button
                  type="button"
                  className="boton-secundario-barra"
                  onClick={limpiarFiltrosHabitaciones}
                  title="Restablecer todos los filtros"
                  style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </>
          )}
        </section>

        <section className="grupo-acciones-barra">
          {pestannaActiva === 'HABITACIONES' && (
            <button
              type="button"
              className="btn-export-excel"
              onClick={() => {
                setFiltroReporteEstado(filtroEstado);
                setFiltroReporteTipo(filtroTipo);
                setFiltroReportePiso(filtroPiso);
                setFiltroReporteBusqueda(busqueda);
                setModalReporteAbierto(true);
              }}
            >
              <span>Exportar Reporte</span>
            </button>
          )}
          <button type="button" className="boton-secundario-barra" onClick={abrirModalCrearTipo}>
            <span>+ Tipo de Habitación</span>
          </button>
          <button type="button" className="boton-agregar" onClick={abrirModalCrearHabitacion}>
            <span>+ Nueva Habitación</span>
          </button>
        </section>
      </section>

      {loading ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando información desde la base de datos...</p>
        </article>
      ) : errorTabla ? (
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarDatos} className="boton-reintentar-tabla">
            Reintentar
          </button>
        </aside>
      ) : pestannaActiva === 'HABITACIONES' ? (
        <section className="grid-habitaciones">
          {habitacionesFiltradas.length > 0 ? (
            habitacionesFiltradas.map((h) => (
              <article key={h.codigo_habitacion} className="tarjeta-habitacion">
                <header className="cabecera-tarjeta">
                  <h2 className="numero-habitacion">Hab. {h.codigo_habitacion}</h2>
                  <span className={`badge-estado badge-${h.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {h.estado}
                  </span>
                </header>

                <p className="tipo-habitacion">{h.nombre_tipo || h.tipo || 'Habitación Hotelera'}</p>
                <p className="huesped-info">
                  {h.estado === 'Ocupada' && h.nombre_huesped
                    ? `Huésped: ${h.nombre_huesped}`
                    : `Piso ${h.piso} • Capacidad: ${h.capacidad} pers.`}
                </p>

                <footer className="pie-tarjeta">
                  <button
                    type="button"
                    className="boton-ver-detalles"
                    onClick={() => abrirDetalle(h)}
                  >
                    Ver detalles
                  </button>
                  <nav className="grupo-acciones-tarjeta">
                    <button
                      type="button"
                      className="boton-menu boton-eliminar-tarjeta"
                      title="Eliminar Habitación"
                      onClick={() => {
                        confirmarEliminacionHabitacion(h.codigo_habitacion);
                      }}
                    >
                      🗑️
                    </button>
                    <button
                      type="button"
                      className="boton-menu"
                      title="Editar Habitación"
                      onClick={() => abrirModalEditarHabitacion(h)}
                    >
                      ✏️
                    </button>
                  </nav>
                </footer>
              </article>
            ))
          ) : (
            <article className="sin-resultados">
              <p>No se encontraron habitaciones registradas con los filtros aplicados.</p>
            </article>
          )}
        </section>
      ) : (
        <article className="tarjeta-tabla">
          <table className="tabla-huespedes">
            <thead>
              <tr>
                <th>Nombre del Tipo</th>
                <th>Descripción / Detalles</th>
                <th className="texto-derecha">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiposFiltrados.length > 0 ? (
                tiposFiltrados.map((tipo) => (
                  <tr key={tipo.id_tipo_habitacion}>
                    <td>
                      <strong className="nombre-persona">{tipo.nombre_tipo}</strong>
                    </td>
                    <td>
                      <p className="correo-persona">{tipo.descripcion}</p>
                    </td>
                    <td className="texto-derecha">
                      <nav className="grupo-acciones">
                        <button
                          type="button"
                          className="boton-accion"
                          title="Editar Tipo"
                          onClick={() => abrirModalEditarTipo(tipo)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="boton-accion peligro"
                          title="Eliminar Tipo"
                          onClick={() => confirmarEliminacionTipo(tipo)}
                        >
                          🗑️
                        </button>
                      </nav>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="tabla-vacia">
                    No se encontraron tipos de habitación registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>
      )}

      {/* MODAL CREAR/EDITAR HABITACIÓN */}
      {modalFormAbierto && (
        <aside className="overlay-modal" onClick={cerrarModalFormHabitacion}>
          <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                {modoModal === 'CREAR' ? 'Registrar Nueva Habitación' : `Editar Habitación N° ${formDataHabitacion.codigo_habitacion}`}
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalFormHabitacion}>
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmitHabitacion} className="formulario-huesped" noValidate>
              <fieldset className="grupo-campos">
                <legend className="leyenda-formulario">Detalles de la Habitación</legend>

                <label className="campo medio">
                  <span className="label-texto">N° de Habitación (Código) *</span>
                  <input
                    type="number"
                    name="codigo_habitacion"
                    placeholder="Ej. 101"
                    value={formDataHabitacion.codigo_habitacion}
                    onChange={handleChangeHabitacion}
                    disabled={modoModal === 'EDITAR'}
                    className={erroresForm.codigo_habitacion ? 'input-error' : ''}
                  />
                  {erroresForm.codigo_habitacion && <span className="texto-error-campo">{erroresForm.codigo_habitacion}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Tipo de Habitación *</span>
                  <select name="id_tipo_habitacion" value={formDataHabitacion.id_tipo_habitacion} onChange={handleChangeHabitacion}>
                    <option value="">Seleccione un tipo...</option>
                    {tiposHabitacion.map((t) => (
                      <option key={t.id_tipo_habitacion} value={t.id_tipo_habitacion}>
                        {t.nombre_tipo}
                      </option>
                    ))}
                  </select>
                  {erroresForm.id_tipo_habitacion && <span className="texto-error-campo">{erroresForm.id_tipo_habitacion}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Piso *</span>
                  <input
                    type="text"
                    name="piso"
                    placeholder="Ej. Piso 1"
                    value={formDataHabitacion.piso}
                    onChange={handleChangeHabitacion}
                    className={erroresForm.piso ? 'input-error' : ''}
                  />
                  {erroresForm.piso && <span className="texto-error-campo">{erroresForm.piso}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Capacidad (Personas) *</span>
                  <input
                    type="number"
                    name="capacidad"
                    placeholder="Ej. 2"
                    value={formDataHabitacion.capacidad}
                    onChange={handleChangeHabitacion}
                    className={erroresForm.capacidad ? 'input-error' : ''}
                  />
                  {erroresForm.capacidad && <span className="texto-error-campo">{erroresForm.capacidad}</span>}
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Estado Operativo</span>
                  <select
                    name="estado"
                    value={formDataHabitacion.estado}
                    onChange={handleChangeHabitacion}
                    disabled={formDataHabitacion.estado === 'Ocupada'}
                  >
                    {formDataHabitacion.estado === 'Ocupada' ? (
                      <option value="Ocupada">Ocupada (Gestionada desde Reservas)</option>
                    ) : (
                      <>
                        <option value="Disponible">Disponible</option>
                        <option value="Sucia">Sucia</option>
                        <option value="Fuera de servicio">Fuera de servicio</option>
                      </>
                    )}
                  </select>
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Amenidades y Comodidades *</span>
                  <input
                    type="text"
                    name="amenidades"
                    placeholder="Ej. Aire acondicionado, TV por cable, Wi-Fi"
                    value={formDataHabitacion.amenidades}
                    onChange={handleChangeHabitacion}
                    className={erroresForm.amenidades ? 'input-error' : ''}
                  />
                  {erroresForm.amenidades && <span className="texto-error-campo">{erroresForm.amenidades}</span>}
                </label>
              </fieldset>

              <footer className="acciones-formulario">
                <button type="button" className="boton-cancelar" onClick={cerrarModalFormHabitacion} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar" disabled={guardando}>
                  {guardando ? (
                    <span className="flex-cargando">
                      <span className="spinner-pequeño"></span> Guardando...
                    </span>
                  ) : (
                    modoModal === 'CREAR' ? 'Guardar Habitación' : 'Actualizar Habitación'
                  )}
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}

      {/* MODAL DETALLE DE HABITACIÓN */}
      {modalDetalleAbierto && habitacionSeleccionada && (
        <aside className="overlay-modal" onClick={cerrarDetalle}>
          <article className="contenido-modal modal-detalle" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <hgroup className="titulo-modal-grupo">
                <h2 className="titulo-modal">Habitación N° {habitacionSeleccionada.codigo_habitacion}</h2>
                <span className="subtitulo-modal-tipo">
                  {habitacionSeleccionada.nombre_tipo || habitacionSeleccionada.tipo || 'Tipo Estándar'}
                </span>
              </hgroup>
              <span className={`badge-estado badge-${habitacionSeleccionada.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                {habitacionSeleccionada.estado}
              </span>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarDetalle}>
                &times;
              </button>
            </header>

            <section className="cuerpo-modal-detalle">
              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Información General</h3>
                <section className="grid-info-tarjetas">
                  <article className="item-info-mini">
                    <span className="label-mini">Piso</span>
                    <strong className="valor-mini">{habitacionSeleccionada.piso || 'N/A'}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Capacidad</span>
                    <strong className="valor-mini">{habitacionSeleccionada.capacidad} Personas</strong>
                  </article>
                </section>
                <article className="box-amenidades">
                  <span className="label-mini">Amenidades e Instalaciones</span>
                  <p className="texto-amenidades">{habitacionSeleccionada.amenidades || 'Sin especificaciones adicionales'}</p>
                </article>
              </section>

              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Estado de Operación</h3>

                {habitacionSeleccionada.estado === 'Disponible' && (
                  <article className="estado-indicador disponible">
                    <span className="icono-estado-circulo">✓</span>
                    <section className="texto-estado-info">
                      <strong>Disponible</strong>
                      <p>Lista para asignación mediante el módulo de Reservas.</p>
                    </section>
                  </article>
                )}

                {habitacionSeleccionada.estado === 'Ocupada' && (
                  <article className="estado-indicador ocupada">
                    <span className="icono-estado-circulo">👤</span>
                    <section className="texto-estado-info">
                      <strong>Huésped Registrado:</strong>
                      <p className="nombre-huesped-detalle">
                        {habitacionSeleccionada.nombre_huesped || 'Huésped Registrado'}
                      </p>
                      {habitacionSeleccionada.fecha_checkout && (
                        <small>Check-out previsto: {habitacionSeleccionada.fecha_checkout}</small>
                      )}
                    </section>
                  </article>
                )}

                {habitacionSeleccionada.estado === 'Sucia' && (
                  <article className="estado-indicador sucia">
                    <span className="icono-estado-circulo">🧹</span>
                    <section className="texto-estado-info">
                      <strong>Pendiente de Limpieza</strong>
                      <p>Marcar como "Disponible" una vez aseada.</p>
                    </section>
                  </article>
                )}

                {habitacionSeleccionada.estado === 'Fuera de servicio' && (
                  <article className="estado-indicador fuera">
                    <span className="icono-estado-circulo">🛠️</span>
                    <section className="texto-estado-info">
                      <strong>En Mantenimiento</strong>
                      <p>Bloqueada temporalmente por reparaciones.</p>
                    </section>
                  </article>
                )}

                {/* Acciones de cambio rápido de mantenimiento si NO está Ocupada */}
                {habitacionSeleccionada.estado !== 'Ocupada' && (
                  <article style={{ marginTop: '1rem' }}>
                    <span className="label-mini">Cambiar Estado de Mantenimiento:</span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {habitacionSeleccionada.estado !== 'Disponible' && (
                        <button
                          type="button"
                          className="boton-secundario-barra"
                          onClick={() => cambiarEstadoOperativo('Disponible')}
                        >
                          Marcar Disponible
                        </button>
                      )}
                      {habitacionSeleccionada.estado !== 'Sucia' && (
                        <button
                          type="button"
                          className="boton-secundario-barra"
                          onClick={() => cambiarEstadoOperativo('Sucia')}
                        >
                          Marcar Sucia
                        </button>
                      )}
                      {habitacionSeleccionada.estado !== 'Fuera de servicio' && (
                        <button
                          type="button"
                          className="boton-secundario-barra"
                          onClick={() => cambiarEstadoOperativo('Fuera de servicio')}
                        >
                          Marcar Fuera de Servicio
                        </button>
                      )}
                    </div>
                  </article>
                )}
              </section>
            </section>

            <footer className="acciones-modal-detalle">
              <button
                type="button"
                className="boton-cancelar"
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>

              <nav className="grupo-botones-derecha">
                <button
                  type="button"
                  className="boton-alerta-reintentar boton-eliminar-detalle"
                  onClick={() => {
                    confirmarEliminacionHabitacion(habitacionSeleccionada.codigo_habitacion);
                  }}
                >
                  Eliminar
                </button>

                <button
                  type="button"
                  className="boton-secundario-barra"
                  onClick={() => abrirModalEditarHabitacion(habitacionSeleccionada)}
                >
                  Editar
                </button>
              </nav>
            </footer>
          </article>
        </aside>
      )}

      {/* MODAL CREAR / EDITAR TIPO DE HABITACIÓN */}
      {modalTipoAbierto && (
        <aside className="overlay-modal" onClick={cerrarModalTipo}>
          <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                {modoTipoModal === 'CREAR' ? 'Registrar Nuevo Tipo de Habitación' : 'Editar Tipo de Habitación'}
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalTipo}>
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmitTipo} className="formulario-huesped" noValidate>
              <fieldset className="grupo-campos">
                <legend className="leyenda-formulario">Información y Tarifa Base</legend>

                <label className="campo ancho-completo">
                  <span className="label-texto">Nombre del Tipo *</span>
                  <input
                    type="text"
                    name="nombre_tipo"
                    placeholder="Ej. Suite Presidencial, Matrimonial, Doble"
                    value={formDataTipo.nombre_tipo}
                    onChange={handleChangeTipo}
                    className={erroresTipoForm.nombre_tipo ? 'input-error' : ''}
                  />
                </label>

                {modoTipoModal === 'CREAR' && (
                  <label className="campo ancho-completo">
                    <span className="label-texto">Precio Base Inicial (USD) *</span>
                    <input
                      type="number"
                      step="0.01"
                      name="precio_base"
                      placeholder="Ej. 120.00"
                      value={formDataTipo.precio_base}
                      onChange={handleChangeTipo}
                      className="rate-input"
                    />
                    <small className="rate-helper-text" style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                      Se creará automáticamente la tarifa comercial para la "Temporada normal".
                    </small>
                  </label>
                )}

                <label className="campo ancho-completo">
                  <span className="label-texto">Descripción / Detalles *</span>
                  <textarea
                    name="descripcion"
                    rows="3"
                    placeholder="Describe las características generales de este tipo de habitación..."
                    value={formDataTipo.descripcion}
                    onChange={handleChangeTipo}
                    className={erroresTipoForm.descripcion ? 'input-error' : ''}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </label>
              </fieldset>

              <footer className="acciones-formulario">
                <button type="button" className="boton-cancelar" onClick={cerrarModalTipo} disabled={guardandoTipo}>
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar" disabled={guardandoTipo}>
                  {guardandoTipo ? (
                    <span className="flex-cargando">
                      <span className="spinner-pequeño"></span> Guardando...
                    </span>
                  ) : (
                    modoTipoModal === 'CREAR' ? 'Guardar Tipo y Tarifa' : 'Actualizar Tipo'
                  )}
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}

      {/* --- MODAL PANEL DE PERSONALIZACIÓN Y FILTROS DE REPORTE --- */}
      {modalReporteAbierto && (
        <aside className="overlay-modal" onClick={() => setModalReporteAbierto(false)}>
          <article className="contenido-modal modal-detalle modal-reporte-ancho" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">Generador de Reportes — Habitaciones</h2>
              <button type="button" className="boton-cerrar-modal" onClick={() => setModalReporteAbierto(false)}>
                &times;
              </button>
            </header>

            <section className="cuerpo-modal-reporte">
              <p className="texto-descripcion-reporte">
                Configure los filtros, tipo, piso y el formato de salida deseado para el reporte operativo de habitaciones.
              </p>

              <div className="contenedor-kpis-resumen">
                <article className="tarjeta-kpi-mini">
                  <span className="kpi-titulo-mini">Registros en Vista</span>
                  <strong className="kpi-valor-mini">{habitacionesReporteFiltradas.length}</strong>
                </article>
                <article className="tarjeta-kpi-mini">
                  <span className="kpi-titulo-mini">Estado Seleccionado</span>
                  <strong className="kpi-valor-mini">{filtroReporteEstado}</strong>
                </article>
              </div>

              <div className="grupo-campos">
                <label className="campo ancho-completo">
                  <span className="label-texto">Filtrar por Estado</span>
                  <select
                    className="select-filtro"
                    value={filtroReporteEstado}
                    onChange={(e) => setFiltroReporteEstado(e.target.value)}
                  >
                    <option value="TODAS">Todos los Estados</option>
                    <option value="Disponible">Disponibles</option>
                    <option value="Ocupada">Ocupadas</option>
                    <option value="Sucia">Sucias</option>
                    <option value="Fuera de servicio">Fuera de servicio</option>
                  </select>
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Tipo de Habitación</span>
                  <select
                    className="select-filtro"
                    value={filtroReporteTipo}
                    onChange={(e) => setFiltroReporteTipo(e.target.value)}
                  >
                    <option value="TODOS">Todos los Tipos</option>
                    {tiposHabitacion.map((t) => (
                      <option key={t.id_tipo_habitacion} value={t.nombre_tipo}>
                        {t.nombre_tipo}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Piso</span>
                  <select
                    className="select-filtro"
                    value={filtroReportePiso}
                    onChange={(e) => setFiltroReportePiso(e.target.value)}
                  >
                    <option value="TODOS">Todos los Pisos</option>
                    {pisosUnicos.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Criterio de Búsqueda</span>
                  <input
                    type="text"
                    className="input-busqueda"
                    placeholder="Filtrar por N° hab., huésped o amenidad..."
                    value={filtroReporteBusqueda}
                    onChange={(e) => setFiltroReporteBusqueda(e.target.value)}
                  />
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Formato de Salida</span>
                  <div className="grupo-opciones-reporte">
                    <button
                      type="button"
                      className={`boton-opcion-formato ${formatoReporte === 'EXCEL' ? 'activo' : ''}`}
                      onClick={() => setFormatoReporte('EXCEL')}
                    >
                      Excel
                    </button>
                    <button
                      type="button"
                      className={`boton-opcion-formato ${formatoReporte === 'PDF' ? 'activo' : ''}`}
                      onClick={() => setFormatoReporte('PDF')}
                    >
                      PDF
                    </button>
                    <button
                      type="button"
                      className={`boton-opcion-formato ${formatoReporte === 'CORREO' ? 'activo' : ''}`}
                      onClick={() => setFormatoReporte('CORREO')}
                    >
                      Correo
                    </button>
                  </div>
                </label>

                {formatoReporte === 'CORREO' && (
                  <label className="campo ancho-completo">
                    <span className="label-texto">Correo Destinatario *</span>
                    <input
                      type="email"
                      className="input-busqueda"
                      placeholder="ejemplo@correo.com"
                      value={correoDestino}
                      onChange={(e) => setCorreoDestino(e.target.value)}
                    />
                  </label>
                )}
              </div>
            </section>

            <footer className="acciones-modal-detalle">
              <button
                type="button"
                className="boton-cancelar"
                onClick={() => setModalReporteAbierto(false)}
              >
                Cancelar
              </button>

              <div className="contenedor-accion-principal">
                {formatoReporte === 'EXCEL' && (
                  <button
                    type="button"
                    className="boton-agregar boton-ancho-completo"
                    onClick={exportarExcelHabitaciones}
                  >
                    Descargar Excel
                  </button>
                )}
                {formatoReporte === 'PDF' && (
                  <button
                    type="button"
                    className="boton-agregar boton-ancho-completo"
                    onClick={exportarReportePDFHabitaciones}
                  >
                    Descargar PDF
                  </button>
                )}
                {formatoReporte === 'CORREO' && (
                  <button
                    type="button"
                    className="boton-guardar boton-ancho-completo"
                    onClick={enviarReportePorCorreoHabitaciones}
                    disabled={enviandoCorreo}
                  >
                    {enviandoCorreo ? 'Enviando...' : 'Enviar Reporte por Correo'}
                  </button>
                )}
              </div>
            </footer>
          </article>
        </aside>
      )}

      {/* MODAL ALERTA */}
      {alerta.abierto && (
        <aside className="overlay-modal z-alto">
          <article className="modal-alerta-tarjeta">
            <header className={`icono-alerta-circulo ${alerta.tipo}`}>
              {alerta.tipo === 'exito' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              )}
              {alerta.tipo === 'error' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              )}
              {alerta.tipo === 'confirmar' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              )}
            </header>
            <h3 className="titulo-alerta">{alerta.titulo}</h3>
            <p className="mensaje-alerta">{alerta.mensaje}</p>
            <footer className="acciones-alerta">
              {alerta.tipo === 'confirmar' ? (
                <nav className="grupo-botones-alerta-confirmar">
                  <button
                    type="button"
                    className="boton-alerta-secundario"
                    onClick={() => setAlerta((prev) => ({ ...prev, abierto: false }))}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="boton-alerta-peligro"
                    onClick={() => {
                      setAlerta((prev) => ({ ...prev, abierto: false }));
                      if (alerta.accionConfirmar) alerta.accionConfirmar();
                    }}
                  >
                    {alerta.textoConfirmar || 'Eliminar'}
                  </button>
                </nav>
              ) : (
                <button
                  type="button"
                  className="boton-alerta-primario"
                  onClick={() => setAlerta((prev) => ({ ...prev, abierto: false }))}
                >
                  Aceptar
                </button>
              )}
            </footer>
          </article>
        </aside>
      )}
    </section>
  );
}