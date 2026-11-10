import React, { useState, useEffect } from 'react';
import '../../estilos/huespedes.css';
import XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../../config/api';

const API_URL = `${API_BASE_URL}/api/huespedes`;

export default function Huespedes() {

  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const [correoDestino, setCorreoDestino] = useState('');
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR');
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState({});

  const [formatoReporte, setFormatoReporte] = useState('EXCEL'); // 'EXCEL' | 'PDF' | 'CORREO'

  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [filtroReporteEstado, setFiltroReporteEstado] = useState('TODOS');
  const [filtroReporteBusqueda, setFiltroReporteBusqueda] = useState('');

  const estadoInicialForm = {
    id_huesped: null,
    nombre: '',
    tipo_documento: 'V',
    num_documento: '',
    correo: '',
    telefono: '',
    estado: 'ACTIVO'
  };
  const [formData, setFormData] = useState(estadoInicialForm);

  const [alerta, setAlerta] = useState({
    abierto: false,
    tipo: 'exito', // 'exito' | 'error' | 'confirmar'
    titulo: '',
    mensaje: '',
    accionConfirmar: null,
    textoConfirmar: 'Aceptar'
  });

  const exportarReportePDFHuespedes = async () => {
    try {
      const urlReporte = `${API_URL}/reporte/excel?estado=${filtroReporteEstado}&busqueda=${encodeURIComponent(filtroReporteBusqueda)}`;
      const respuesta = await fetch(urlReporte);
      if (!respuesta.ok) throw new Error('No se pudo obtener la data para el PDF.');
      const datos = await respuesta.json();

      if (!datos || datos.length === 0) {
        setAlerta({ abierto: true, tipo: 'error', titulo: 'Sin registros', mensaje: 'No hay datos para generar el PDF.' });
        return;
      }

      const doc = new jsPDF();
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString('es-VE');

      // Membrete Oficial
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("SISTEMA HOTELERO — INFORME DE HUÉSPEDES", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Fecha de emisión: ${fechaStr} | Filtro: [Estado: ${filtroReporteEstado}]`, 14, 26);

      // Bloque de KPIs
      const totalHuespedes = datos.length;
      const totalRecaudado = datos.reduce((acc, curr) => acc + parseFloat(curr.total_gastado || 0), 0);

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 32, 182, 16, 2, 2, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Huéspedes: ${totalHuespedes}`, 18, 42);
      doc.text(`Monto Histórico Total: $${totalRecaudado.toFixed(2)} USD`, 110, 42);

      // Tabla de Datos
      const headers = [['ID', 'Documento', 'Nombre y Apellido', 'Teléfono', 'Estado', 'Total Gastado']];
      const rows = datos.map(h => [
        h.id_huesped,
        `${h.tipo_documento}-${h.num_documento}`,
        h.nombre,
        h.telefono || 'N/A',
        h.estado,
        `$${parseFloat(h.total_gastado || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 54,
        head: headers,
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 }
      });

      doc.save(`Reporte_Huespedes_${hoy.toISOString().slice(0, 10)}.pdf`);
      setModalReporteAbierto(false);

      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡PDF Generado!',
        mensaje: 'El reporte ejecutivo en formato PDF se descargó correctamente.'
      });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error al generar PDF', mensaje: err.message });
    }
  };

  const enviarReportePorCorreo = async () => {
    if (!correoDestino || !correoDestino.trim()) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Correo Requerido', mensaje: 'Por favor, escriba una dirección de correo válida.' });
      return;
    }

    setEnviandoCorreo(true);
    try {
      const respuesta = await fetch(`${API_URL}/reporte/correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo_destino: correoDestino,
          estado: filtroReporteEstado,
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
        mensaje: 'El reporte ejecutivo fue enviado exitosamente a la bandeja de entrada.'
      });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error de Envío', mensaje: err.message });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const cargarHuespedes = async () => {
    try {
      setLoading(true);
      setErrorTabla(null);
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: No se pudo obtener la lista de huéspedes.`);
      }
      const datos = await respuesta.json();
      setHuespedes(datos);
    } catch (err) {
      setErrorTabla(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const exportarReporteExcelHuespedes = async () => {
    try {
      // Consultar al backend pasando los filtros activos del panel de reporte
      const urlReporte = `${API_URL}/reporte/excel?estado=${filtroReporteEstado}&busqueda=${encodeURIComponent(filtroReporteBusqueda)}`;
      const respuesta = await fetch(urlReporte);
      if (!respuesta.ok) throw new Error('No se pudo generar el reporte avanzado de huéspedes.');

      const datos = await respuesta.json();
      if (!datos || datos.length === 0) {
        setAlerta({
          abierto: true,
          tipo: 'error',
          titulo: 'Sin datos para exportar',
          mensaje: 'No hay registros que coincidan con los filtros seleccionados para generar el Excel.'
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

      // Estilos institucionales
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

      const estilosCeldaCentro = {
        ...estilosCelda,
        alignment: { horizontal: "center", vertical: "center" }
      };

      const estilosCeldaNumero = {
        ...estilosCelda,
        alignment: { horizontal: "right", vertical: "center" },
        numFmt: "$#,##0.00"
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

      const headers = [
        'ID Huésped',
        'Tipo Doc.',
        'N° Documento',
        'Nombre y Apellido',
        'Teléfono',
        'Correo Electrónico',
        'Estado',
        'Total Reservas',
        'Total Consumido (USD)'
      ];

      const crearFilaCombinada = (texto, estilo, numCols = 9) => {
        const fila = [{ v: texto, s: estilo }];
        for (let i = 1; i < numCols; i++) {
          fila.push({ v: '', s: estilo });
        }
        return fila;
      };

      const resumenFiltros = `Estado: ${filtroReporteEstado} ${filtroReporteBusqueda ? `| Búsqueda: "${filtroReporteBusqueda}"` : ''}`;

      const wsData = [
        crearFilaCombinada('SISTEMA HOTELERO — REPORTE OFICIAL DE GESTIÓN DE HUÉSPEDES', estilosTitulo, 9),
        crearFilaCombinada(`Generado el: ${fechaStr} ${horaStr} | Filtros aplicados: [${resumenFiltros}] | Emitido por: ${nombreAutor} | Folio: #HUES-${folioFecha}`, estilosSubtitulo, 9),
        [],
        headers.map((h) => ({ v: h, s: estilosHeader }))
      ];

      const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }
      ];

      let sumaTotalGastado = 0;
      let totalReservasGlobal = 0;

      datos.forEach((h, idx) => {
        const gastado = parseFloat(h.total_gastado) || 0;
        const numReservas = parseInt(h.total_reservas) || 0;
        sumaTotalGastado += gastado;
        totalReservasGlobal += numReservas;

        const filaEstilo = idx % 2 === 0
          ? { fill: { fgColor: { rgb: "FFFFFF" } } }
          : { fill: { fgColor: { rgb: "F8FAFC" } } };

        wsData.push([
          { v: h.id_huesped, s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: h.tipo_documento, s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: String(h.num_documento), s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: h.nombre, s: { ...estilosCelda, ...filaEstilo, font: { ...estilosCelda.font, bold: true } } },
          { v: h.telefono || 'N/A', s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: h.correo || 'N/A', s: { ...estilosCelda, ...filaEstilo } },
          { v: h.estado, s: { ...estilosCeldaCentro, ...filaEstilo, font: { ...estilosCeldaCentro.font, bold: true, color: { rgb: h.estado === 'ACTIVO' ? '15803D' : '64748B' } } } },
          { v: numReservas, t: 'n', s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: gastado, t: 'n', s: { ...estilosCeldaNumero, ...filaEstilo } }
        ]);
      });

      wsData.push([]);

      const filaTotalIdx = wsData.length;
      const textoGranTotal = `TOTALES GENERALES — Total Huéspedes: ${datos.length}  |  Total Reservas Históricas: ${totalReservasGlobal}  |  Monto Total Acumulado (USD):`;

      const filaTotal = [];
      for (let c = 0; c < 8; c++) {
        filaTotal.push({ v: c === 0 ? textoGranTotal : '', s: estilosGranTotal });
      }
      filaTotal.push({
        v: sumaTotalGastado,
        t: 'n',
        s: { ...estilosGranTotal, numFmt: "$#,##0.00" }
      });

      wsData.push(filaTotal);
      merges.push({ s: { r: filaTotalIdx, c: 0 }, e: { r: filaTotalIdx, c: 7 } });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!merges'] = merges;
      ws['!cols'] = [
        { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 28 }, { wch: 12 }, { wch: 16 }, { wch: 22 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Reporte Huéspedes');
      XLSX.writeFile(wb, `Reporte_Huespedes_${hoy.toISOString().slice(0, 10)}.xlsx`);

      setModalReporteAbierto(false);
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Reporte Excel Generado!',
        mensaje: 'El informe detallado de huéspedes con filtros aplicados se descargó con éxito.'
      });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error de Exportación', mensaje: err.message });
    }
  };

  useEffect(() => {
    cargarHuespedes();
  }, []);

  const validarCampo = (name, value) => {
    let error = '';
    if (name === 'nombre') {
      if (!value || !value.trim()) error = 'El nombre es obligatorio.';
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) error = 'Solo se permiten letras.';
    }
    if (name === 'num_documento') {
      if (!value || !value.trim()) error = 'El número de documento es obligatorio.';
      else if (!/^\d+$/.test(value)) error = 'Solo se permiten números.';
    }
    if (name === 'correo') {
      if (!value || !value.trim()) error = 'El correo es obligatorio.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Formato de correo inválido.';
    }
    if (name === 'telefono') {
      if (!value || !value.trim()) error = 'El teléfono es obligatorio.';
      else if (!/^\d+$/.test(value)) error = 'Solo se permiten números en el teléfono.';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar en tiempo de captura
    const errorMensaje = validarCampo(name, value);
    setErroresForm((prev) => ({ ...prev, [name]: errorMensaje }));
  };

  // Abrir y cerrar modal de formulario
  const abrirModalCrear = () => {
    setFormData(estadoInicialForm);
    setErroresForm({});
    setModoModal('CREAR');
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (huesped) => {
    setFormData({
      id_huesped: huesped.id_huesped,
      nombre: huesped.nombre || '',
      tipo_documento: huesped.tipo_documento || 'V',
      num_documento: huesped.num_documento || '',
      correo: huesped.correo || '',
      telefono: huesped.telefono || '',
      estado: huesped.estado || 'ACTIVO'
    });
    setErroresForm({});
    setModoModal('EDITAR');
    setModalFormAbierto(true);
  };

  const cerrarModalForm = () => {
    if (guardando) return;
    setModalFormAbierto(false);
    setFormData(estadoInicialForm);
    setErroresForm({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Declarar el objeto de errores primero
    const erroresTemp = {};

    // 2. Validar cada campo obligatorio de forma explícita
    const errNombre = validarCampo('nombre', formData.nombre);
    if (errNombre) erroresTemp.nombre = errNombre;

    const errDoc = validarCampo('num_documento', formData.num_documento);
    if (errDoc) erroresTemp.num_documento = errDoc;

    const errCorreo = validarCampo('correo', formData.correo);
    if (errCorreo) erroresTemp.correo = errCorreo;

    const errTel = validarCampo('telefono', formData.telefono);
    if (errTel) erroresTemp.telefono = errTel;

    // 3. Si hay errores, mostrarlos en pantalla y detener el envío
    if (Object.keys(erroresTemp).length > 0) {
      setErroresForm(erroresTemp);
      return;
    }

    setGuardando(true);
    const esCrear = modoModal === 'CREAR';
    const url = esCrear ? API_URL : `${API_URL}/${formData.id_huesped}`;
    const metodo = esCrear ? 'POST' : 'PUT';

    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      const payload = {
        ...formData,
        id_usuario: idUsuarioActual
      };

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json().catch(() => ({}));
        let mensajeError = errData.mensaje || `Error ${respuesta.status}: Fallo al procesar.`;
        if (respuesta.status === 400) mensajeError = errData.mensaje || 'Verifique los campos obligatorios o la duplicidad del documento.';
        else if (respuesta.status === 404) mensajeError = 'El huésped no existe o fue removido.';
        else if (respuesta.status === 500) mensajeError = 'Error interno del servidor. Intente más tarde.';

        throw new Error(mensajeError);
      }

      cerrarModalForm();
      cargarHuespedes();

      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: esCrear ? '¡Huésped Registrado!' : '¡Datos Actualizados!',
        mensaje: esCrear
          ? 'Los datos del huésped fueron guardados correctamente en la base de datos.'
          : 'La información del huésped ha sido actualizada exitosamente.'
      });

    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Procesar Datos',
        mensaje: err.message,
        accionConfirmar: () => { }
      });
    } finally {
      setGuardando(false);
    }
  };

  // --- ELIMINAR REGISTRO CON CONFIRMACIÓN ---
  const solicitarEliminar = (id, nombre) => {
    setAlerta({
      abierto: true,
      tipo: 'confirmar',
      titulo: 'Confirmar Eliminación',
      mensaje: `¿Está seguro de eliminar al huésped "${nombre}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, Eliminar',
      accionConfirmar: () => ejecutarEliminacion(id)
    });
  };

  const ejecutarEliminacion = async (id) => {
    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      const respuesta = await fetch(`${API_URL}/${id}?id_usuario=${idUsuarioActual}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const resData = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(resData.mensaje || 'No se pudo eliminar el registro seleccionado.');

      cargarHuespedes();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Registro Eliminado!',
        mensaje: 'El huésped ha sido eliminado correctamente del sistema.'
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

  // Filtrado reactivo en cliente
  const huespedesFiltrados = huespedes.filter((h) => {
    const coincideBusqueda =
      h.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.num_documento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.correo?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = filtroEstado === 'TODOS' || h.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  return (
    <section className="contenedor-huespedes">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Directorio de Huéspedes</h1>
        <p className="subtitulo-vista">Gestión y control de clientes</p>
      </header>

      {/* Barra de herramientas */}
      <section className="barra-herramientas">
        <section className="grupo-controles">
          <label className="caja-busqueda">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input
              type="search"
              className="input-busqueda"
              placeholder="Buscar por nombre, correo o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          <label className="caja-filtro">
            <select
              className="select-filtro"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="TODOS">Estado: Todos</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </label>
        </section>

        <div className="contenedor-acciones-superior">
          <button
            type="button"
            onClick={() => {
              setFiltroReporteEstado(filtroEstado);
              setFiltroReporteBusqueda(busqueda);
              setModalReporteAbierto(true);
            }}
            className="btn-export-excel"
          >
            <span>Exportar Reporte</span>
          </button>

          <button type="button" className="boton-agregar" onClick={abrirModalCrear}>
            <span>+ Agregar Huésped</span>
          </button>
        </div>
      </section>

      {/* ESTADO CARGANDO (Loading) */}
      {loading ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando huéspedes desde la base de datos...</p>
        </article>
      ) : errorTabla ? (
        /* ESTADO ERROR TABLA */
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarHuespedes} className="boton-reintentar-tabla">Reintentar</button>
        </aside>
      ) : (
        /* ESTADO ÉXITO: TABLA DE DATOS */
        <article className="tarjeta-tabla">
          <table className="tabla-huespedes">
            <thead>
              <tr>
                <th>Huésped</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th className="texto-derecha">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {huespedesFiltrados.length > 0 ? (
                huespedesFiltrados.map((h) => (
                  <tr key={h.id_huesped}>
                    <td>
                      <article className="info-persona">
                        <span className="nombre-persona">{h.nombre}</span>
                        <span className="correo-persona">{h.correo}</span>
                      </article>
                    </td>
                    <td>
                      <span className="badge-documento">
                        {h.tipo_documento ? `${h.tipo_documento}-` : ''}{h.num_documento}
                      </span>
                    </td>
                    <td>
                      <span className="texto-telefono">{h.telefono || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge-estado ${h.estado?.toLowerCase()}`}>
                        <span className="punto-estado"></span>
                        {h.estado}
                      </span>
                    </td>
                    <td className="texto-derecha">
                      <section className="grupo-acciones">
                        <button
                          type="button"
                          className="boton-accion"
                          title="Editar Huésped"
                          onClick={() => abrirModalEditar(h)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="boton-accion peligro"
                          title="Eliminar Huésped"
                          onClick={() => solicitarEliminar(h.id_huesped, h.nombre)}
                        >
                          🗑️
                        </button>
                      </section>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="tabla-vacia">
                    No se encontraron huéspedes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>
      )}

      {/* --- MODAL FORMULARIO (CREAR / EDITAR) --- */}
      {modalFormAbierto && (
        <aside className="overlay-modal" onClick={cerrarModalForm}>
          <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                {modoModal === 'CREAR' ? 'Nuevo Huésped' : 'Editar Huésped'}
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalForm}>
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmit} className="formulario-huesped" noValidate>
              <fieldset className="grupo-campos">
                <legend className="leyenda-formulario">Datos Personales</legend>

                <label className="campo ancho-completo">
                  <span className="label-texto">Nombre Completo *</span>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Ej. Ana María Pérez"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={erroresForm.nombre ? 'input-error' : ''}
                  />
                  {erroresForm.nombre && <span className="texto-error-campo">{erroresForm.nombre}</span>}
                </label>

                <label className="campo tercio">
                  <span className="label-texto">Tipo *</span>
                  <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                    <option value="V">V (Venezolano)</option>
                    <option value="E">E (Extranjero)</option>
                    <option value="P">P (Pasaporte)</option>
                    <option value="J">J (Jurídico)</option>
                  </select>
                </label>

                <label className="campo dos-tercios">
                  <span className="label-texto">Número de Documento *</span>
                  <input
                    type="text"
                    name="num_documento"
                    placeholder="Ej. 26123456"
                    value={formData.num_documento}
                    onChange={handleChange}
                    className={erroresForm.num_documento ? 'input-error' : ''}
                  />
                  {erroresForm.num_documento && <span className="texto-error-campo">{erroresForm.num_documento}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Correo Electrónico *</span>
                  <input
                    type="email"
                    name="correo"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    className={erroresForm.correo ? 'input-error' : ''}
                  />
                  {erroresForm.correo && <span className="texto-error-campo">{erroresForm.correo}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Teléfono *</span>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Ej. 04121234567"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={erroresForm.telefono ? 'input-error' : ''}
                    required
                  />
                  {erroresForm.telefono && <span className="texto-error-campo">{erroresForm.telefono}</span>}
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Estado del Registro</span>
                  <select name="estado" value={formData.estado} onChange={handleChange}>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </label>
              </fieldset>

              <footer className="acciones-formulario">
                <button
                  type="button"
                  className="boton-cancelar"
                  onClick={cerrarModalForm}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-guardar"
                  disabled={guardando}
                >
                  {guardando ? (
                    <span className="flex-cargando">
                      <span className="spinner-pequeño"></span> Guardando...
                    </span>
                  ) : (
                    modoModal === 'CREAR' ? 'Guardar Huésped' : 'Actualizar Datos'
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
          <article className="contenido-modal modal-detalle" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">Generador de Reportes — Huéspedes</h2>
              <button type="button" className="boton-cerrar-modal" onClick={() => setModalReporteAbierto(false)}>
                &times;
              </button>
            </header>

            <section className="cuerpo-modal-reporte">
              <p className="texto-descripcion-reporte">
                Configure los filtros y el formato de salida deseado para el reporte gerencial.
              </p>

              <div className="contenedor-kpis-resumen">
                <article className="tarjeta-kpi-mini">
                  <span className="kpi-titulo-mini">Registros en Vista</span>
                  <strong className="kpi-valor-mini">{huespedesFiltrados.length}</strong>
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
                    className="contenedor-filtro-reporte"
                    value={filtroReporteEstado}
                    onChange={(e) => setFiltroReporteEstado(e.target.value)}
                  >
                    <option value="TODOS">Todos los Estados</option>
                    <option value="ACTIVO">Solo Activos</option>
                    <option value="INACTIVO">Solo Inactivos</option>
                  </select>
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Criterio de Búsqueda</span>
                  <input
                    type="text"
                    className="input-reporte-texto"
                    placeholder="Filtrar por nombre, cédula o correo..."
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

                {/* El campo de correo aparece dinámicamente solo si se selecciona la opción de Correo */}
                {formatoReporte === 'CORREO' && (
                  <label className="campo ancho-completo">
                    <span className="label-texto">Correo Destinatario *</span>
                    <input
                      type="email"
                      className="input-reporte-texto"
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
                    className="btn-export-excel boton-ancho-completo"
                    onClick={exportarReporteExcelHuespedes}
                  >
                    Descargar Excel
                  </button>
                )}
                {formatoReporte === 'PDF' && (
                  <button
                    type="button"
                    className="btn-export-pdf boton-ancho-completo"
                    onClick={exportarReportePDFHuespedes}
                  >
                    Descargar PDF
                  </button>
                )}
                {formatoReporte === 'CORREO' && (
                  <button
                    type="button"
                    className="btn-enviar-correo boton-ancho-completo"
                    onClick={enviarReportePorCorreo}
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

      {/* --- MODAL DE ALERTAS PERSONALIZADO --- */}
      {alerta.abierto && (
        <aside className="overlay-modal z-alto">
          <article className="modal-alerta-tarjeta">
            <header className={`icono-alerta-circulo ${alerta.tipo}`}>
              {alerta.tipo === 'exito' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {alerta.tipo === 'error' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {alerta.tipo === 'confirmar' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </header>

            <h3 className="titulo-alerta">{alerta.titulo}</h3>
            <p className="mensaje-alerta">{alerta.mensaje}</p>

            <footer className="acciones-alerta">
              {alerta.tipo === 'confirmar' ? (
                <>
                  <button
                    type="button"
                    className="boton-alerta-secundario"
                    onClick={() => setAlerta((prev) => ({ ...prev, abierto: false }))}
                  >
                    Conservar Registro
                  </button>
                  <button
                    type="button"
                    className="boton-alerta-peligro"
                    onClick={() => {
                      setAlerta((prev) => ({ ...prev, abierto: false }));
                      if (alerta.accionConfirmar) alerta.accionConfirmar();
                    }}
                  >
                    {alerta.textoConfirmar || 'Sí, Eliminar'}
                  </button>
                </>
              ) : alerta.tipo === 'error' ? (
                <button
                  type="button"
                  className="boton-alerta-secundario"
                  onClick={() => setAlerta((prev) => ({ ...prev, abierto: false }))}
                >
                  Cerrar
                </button>
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