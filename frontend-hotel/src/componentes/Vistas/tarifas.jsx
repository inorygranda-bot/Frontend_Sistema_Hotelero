import React, { useState, useEffect } from 'react';
import XLSX from 'xlsx-js-style';
import '../../estilos/tarifas.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const Layers = (p) => <IconSvg {...p}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></IconSvg>;
const Wallet = (p) => <IconSvg {...p}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></IconSvg>;
const TrendingUp = (p) => <IconSvg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></IconSvg>;
const BedDouble = (p) => <IconSvg {...p}><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" /><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M12 4v6" /><path d="M2 18h20" /></IconSvg>;
const Search = (p) => <IconSvg {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></IconSvg>;
const Plus = (p) => <IconSvg {...p}><path d="M5 12h14" /><path d="M12 5v14" /></IconSvg>;
const Eye = (p) => <IconSvg {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></IconSvg>;
const Pencil = (p) => <IconSvg {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></IconSvg>;
const Trash2 = (p) => <IconSvg {...p}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></IconSvg>;
const ArrowLeftRight = (p) => <IconSvg {...p}><path d="m9 7-5 5 5 5" /><path d="m15 7 5 5-5 5" /><path d="M4 12h16" /></IconSvg>;
const X = (p) => <IconSvg {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></IconSvg>;
const Check = (p) => <IconSvg {...p}><polyline points="20 6 9 17 4 12" /></IconSvg>;
const ChevronDown = (p) => <IconSvg {...p}><path d="m6 9 6 6 6-6" /></IconSvg>;
const DollarSign = (p) => <IconSvg {...p}><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></IconSvg>;
const RefreshCw = (p) => <IconSvg {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></IconSvg>;
const FileSpreadsheet = (p) => (
  <IconSvg {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M8 13h2" />
    <path d="M14 13h2" />
    <path d="M8 17h2" />
    <path d="M14 17h2" />
  </IconSvg>
);

const API_BASE = 'http://localhost:3000/api/tarifas';
const API_TEMPORADAS_BASE = 'http://localhost:3000/api/temporadas';

export default function Tarifas() {

  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [formatoReporte, setFormatoReporte] = useState('EXCEL'); // 'EXCEL' | 'PDF' | 'CORREO'
  const [filtroReporteBusqueda, setFiltroReporteBusqueda] = useState('');
  const [filtroReporteHabitacion, setFiltroReporteHabitacion] = useState('');
  const [filtroReporteTemporada, setFiltroReporteTemporada] = useState('');
  const [filtroReporteEstado, setFiltroReporteEstado] = useState('TODOS');
  const [correoDestino, setCorreoDestino] = useState('');
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

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

  const [modalTemporadaAbierto, setModalTemporadaAbierto] = useState(false);
  const [rangosTemporadaAlta, setRangosTemporadaAlta] = useState([]);
  const [nuevoRango, setNuevoRango] = useState({
    nombre_temporada: '',
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: ''
  });

  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [tarifaVer, setTarifaVer] = useState(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [tarifaAEliminar, setTarifaAEliminar] = useState(null);
  const [toasts, setToasts] = useState([]);

  const tarifasReporteFiltradas = tarifas.filter((item) => {
    const q = filtroReporteBusqueda.toLowerCase().trim();
    const matchBusqueda = !q || item.nombre_tarifa.toLowerCase().includes(q) || `tar-${item.id_tarifa}`.includes(q) || item.nombre_habitacion.toLowerCase().includes(q);
    const matchHabitacion = !filtroReporteHabitacion || item.nombre_habitacion === filtroReporteHabitacion;
    const matchTemporada = !filtroReporteTemporada || String(item.id_temporada) === filtroReporteTemporada;
    const matchEstado = filtroReporteEstado === 'TODOS' || item.estado.toLowerCase() === filtroReporteEstado.toLowerCase();
    return matchBusqueda && matchHabitacion && matchTemporada && matchEstado;
  });

  const exportarExcelTarifas = () => {
    if (!tarifasReporteFiltradas || tarifasReporteFiltradas.length === 0) {
      lanzarToast('No hay tarifas disponibles con los filtros seleccionados para generar el Excel.', 'error');
      return;
    }
    try {
      const wb = XLSX.utils.book_new();
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const horaStr = hoy.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

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

      const estilosCeldaNumero = { ...estilosCelda, alignment: { horizontal: "right", vertical: "center" }, numFmt: "$#,##0.00" };
      const estilosCeldaCentro = { ...estilosCelda, alignment: { horizontal: "center", vertical: "center" } };

      const headers = ['Código', 'Nombre de la Tarifa', 'Habitación / Tipo', 'Temporada', 'Precio Base (USD)', 'Equiv. BCV (Bs.)', 'IVA (%)', 'Total c/ IVA (USD)', 'Total c/ IVA (Bs.)', 'Estado', 'Servicios / Incluye'];

      const filtrosAplicados = [];
      if (filtroReporteHabitacion) filtrosAplicados.push(`Habitación: ${filtroReporteHabitacion}`);
      if (filtroReporteTemporada) filtrosAplicados.push(`Temporada ID: ${filtroReporteTemporada}`);
      if (filtroReporteEstado !== 'TODOS') filtrosAplicados.push(`Estado: ${filtroReporteEstado}`);
      if (filtroReporteBusqueda.trim()) filtrosAplicados.push(`Búsqueda: "${filtroReporteBusqueda.trim()}"`);
      const resumenFiltros = filtrosAplicados.length > 0 ? filtrosAplicados.join(' • ') : 'Todos los registros';

      const wsData = [
        [{ v: 'SISTEMA HOTELERO — INFORME COMERCIAL DE TARIFAS Y TEMPORADAS', s: estilosTitulo }],
        [{ v: `Generado: ${fechaStr} ${horaStr} | Filtros: [${resumenFiltros}] | Tasa Oficial BCV: 1 USD = ${bcvRate.toFixed(2)} Bs.`, s: estilosSubtitulo }],
        [],
        headers.map(h => ({ v: h, s: estilosHeader }))
      ];

      tarifasReporteFiltradas.forEach((r, index) => {
        const precioBase = parseFloat(r.precio_base) || 0;
        const ivaP = parseFloat(r.iva) || 16;
        const precioBs = precioBase * bcvRate;
        const tUSD = precioBase * (1 + ivaP / 100);
        const tBs = tUSD * bcvRate;

        const filaEstilo = index % 2 === 0 ? { fill: { fgColor: { rgb: "FFFFFF" } } } : { fill: { fgColor: { rgb: "F8FAFC" } } };

        wsData.push([
          { v: `#TAR-${r.id_tarifa}`, s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: r.nombre_tarifa || '', s: { ...estilosCelda, ...filaEstilo, font: { ...estilosCelda.font, bold: true } } },
          { v: r.nombre_habitacion || '', s: { ...estilosCelda, ...filaEstilo } },
          { v: r.nombre_temporada || 'General', s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: precioBase, s: { ...estilosCeldaNumero, ...filaEstilo } },
          { v: precioBs, s: { ...estilosCeldaNumero, ...filaEstilo, numFmt: "Bs #,##0.00" } },
          { v: `${ivaP}%`, s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: tUSD, s: { ...estilosCeldaNumero, ...filaEstilo, font: { ...estilosCeldaNumero.font, bold: true } } },
          { v: tBs, s: { ...estilosCeldaNumero, ...filaEstilo, numFmt: "Bs #,##0.00", font: { ...estilosCeldaNumero.font, bold: true } } },
          { v: r.estado || 'Activa', s: { ...estilosCeldaCentro, ...filaEstilo, font: { ...estilosCeldaCentro.font, color: { rgb: r.estado?.toLowerCase() === 'activa' ? "15803D" : "B45309" }, bold: true } } },
          { v: r.incluye || '', s: { ...estilosCelda, ...filaEstilo } }
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } }];
      ws['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 35 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Informe Tarifas');
      XLSX.writeFile(wb, `Reporte_Tarifas_${hoy.toISOString().slice(0, 10)}.xlsx`);
      setModalReporteAbierto(false);
      lanzarToast('Informe Excel exportado exitosamente.');
    } catch (err) {
      console.error(err);
      lanzarToast('Error al generar Excel estilizado.', 'error');
    }
  };

  const exportarReportePDFTarifas = () => {
    if (!tarifasReporteFiltradas || tarifasReporteFiltradas.length === 0) {
      lanzarToast('No hay tarifas disponibles con los filtros seleccionados para generar el PDF.', 'error');
      return;
    }
    try {
      const doc = new jsPDF();
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString('es-VE');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("SISTEMA HOTELERO — INFORME COMERCIAL DE TARIFAS", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Fecha de emisión: ${fechaStr} | Estado: [${filtroReporteEstado}] | Tasa BCV: ${bcvRate.toFixed(2)} Bs.`, 14, 26);

      const totalTarifas = tarifasReporteFiltradas.length;
      const promedioPrecio = totalTarifas > 0 ? (tarifasReporteFiltradas.reduce((acc, curr) => acc + (parseFloat(curr.precio_base) || 0), 0) / totalTarifas).toFixed(2) : '0.00';

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 32, 182, 16, 2, 2, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Tarifas: ${totalTarifas}`, 18, 42);
      doc.text(`Precio Promedio Base: $${promedioPrecio} USD`, 100, 42);

      const headers = [['Código', 'Nombre de Tarifa', 'Habitación', 'Temporada', 'Precio Base', 'Estado']];
      const rows = tarifasReporteFiltradas.map(r => [
        `#TAR-${r.id_tarifa}`,
        r.nombre_tarifa,
        r.nombre_habitacion,
        r.nombre_temporada || 'General',
        `$${parseFloat(r.precio_base || 0).toFixed(2)}`,
        r.estado
      ]);

      autoTable(doc, {
        startY: 54,
        head: headers,
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      doc.save(`Reporte_Tarifas_${hoy.toISOString().slice(0, 10)}.pdf`);
      setModalReporteAbierto(false);
      lanzarToast('Informe en PDF generado correctamente.');
    } catch (err) {
      lanzarToast('Error al generar PDF: ' + err.message, 'error');
    }
  };

  const enviarReportePorCorreoTarifas = async () => {
    if (!correoDestino || !correoDestino.trim()) {
      lanzarToast('Por favor, escriba una dirección de correo válida.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoDestino)) {
      lanzarToast('El formato del correo electrónico no es válido.', 'error');
      return;
    }
    if (!tarifasReporteFiltradas || tarifasReporteFiltradas.length === 0) {
      lanzarToast('No hay registros para enviar con los filtros seleccionados.', 'error');
      return;
    }

    setEnviandoCorreo(true);
    try {
      const respuesta = await fetch(`${API_BASE}/reporte/correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo_destino: correoDestino,
          estado: filtroReporteEstado,
          habitacion: filtroReporteHabitacion,
          temporada: filtroReporteTemporada,
          busqueda: filtroReporteBusqueda
        })
      });

      const resData = await respuesta.json();
      if (!respuesta.ok) throw new Error(resData.mensaje || 'Error al enviar el correo.');

      setModalReporteAbierto(false);
      setCorreoDestino('');
      lanzarToast('El informe de tarifas fue enviado exitosamente al correo.');
    } catch (err) {
      lanzarToast(err.message || 'Error al despachar el correo electrónico.', 'error');
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const lanzarToast = (mensaje, tipo = 'exito') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
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

  const agregarRangoAlta = () => {
    if (!nuevoRango.nombre_temporada.trim() || !nuevoRango.fecha_inicio || !nuevoRango.fecha_fin) {
      lanzarToast('Por favor ingresa un nombre y el rango de fechas (Inicio y Fin).', 'error');
      return;
    }

    setRangosTemporadaAlta((prev) => [...prev, { ...nuevoRango, id: Date.now() }]);
    setNuevoRango({ nombre_temporada: '', fecha_inicio: '', fecha_fin: '', descripcion: '' });
    lanzarToast('Rango de Temporada agregado a la lista.');
  };

  const eliminarRangoAlta = (id) => {
    setRangosTemporadaAlta((prev) => prev.filter((r) => r.id !== id));
  };

  const eliminarTemporadaServidor = async (idTemporada) => {
    try {
      const res = await fetch(`${API_TEMPORADAS_BASE}/${idTemporada}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'No se pudo eliminar la temporada');
      lanzarToast('Temporada eliminada correctamente.');
      cargarDatos();
    } catch (err) {
      lanzarToast(err.message, 'error');
    }
  };

  const abrirModalCrear = () => {
    setModoModal('CREAR');
    setEditId(null);
    setFormData({
      ...initialForm,
      id_tipo_habitacion: tiposHabitacion[0]?.id_tipo_habitacion || '',
      id_temporada: temporadas[0]?.id_temporada || '',
      estado: 'Activa'
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
      lanzarToast('Por favor completa el nombre, el tipo de habitación y la temporada.', 'error');
      return;
    }

    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;
    const precioNum = parseFloat(formData.precio_base);

    if (isNaN(precioNum) || precioNum <= 0) {
      lanzarToast('El precio base debe ser mayor a cero (0). No se puede guardar con valor 0 o negativo.', 'error');
      return;
    }

    if (!formData.nombre_tarifa.trim() || !formData.id_tipo_habitacion || !formData.id_temporada) {
      lanzarToast('Por favor completa el nombre, el tipo de habitación y la temporada.', 'error');
      return;
    }

    try {
      setGuardando(true);
      const estadoFinal = esBorrador ? 'Borrador' : 'Activa';

      const payload = {
        ...formData,
        estado: estadoFinal,
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
      lanzarToast(err.message || 'Error al guardar tarifa.', 'error');
    } finally {
      setGuardando(false);
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
      lanzarToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const exportarExcel = () => {
    if (!tarifasFiltradas || tarifasFiltradas.length === 0) {
      lanzarToast('No hay tarifas para exportar.', 'error');
      return;
    }
    try {
      const wb = XLSX.utils.book_new();
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const horaStr = hoy.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

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

      const estilosCeldaNumero = { ...estilosCelda, alignment: { horizontal: "right", vertical: "center" }, numFmt: "$#,##0.00" };
      const estilosCeldaCentro = { ...estilosCelda, alignment: { horizontal: "center", vertical: "center" } };

      const headers = ['Código', 'Nombre de la Tarifa', 'Habitación / Tipo', 'Temporada', 'Precio Base (USD)', 'Equiv. BCV (Bs.)', 'IVA (%)', 'Total c/ IVA (USD)', 'Total c/ IVA (Bs.)', 'Estado', 'Servicios / Incluye'];

      const wsData = [
        [{ v: 'SISTEMA HOTELERO — CATÁLOGO DE TARIFAS Y TEMPORADAS', s: estilosTitulo }],
        [{ v: `Generado: ${fechaStr} ${horaStr} | Tasa Oficial BCV: 1 USD = ${bcvRate.toFixed(2)} Bs.`, s: estilosSubtitulo }],
        [],
        headers.map(h => ({ v: h, s: estilosHeader }))
      ];

      let sumaTotalUSD = 0;
      let sumaTotalBs = 0;

      tarifasFiltradas.forEach((r, index) => {
        const precioBase = parseFloat(r.precio_base) || 0;
        const ivaP = parseFloat(r.iva) || 16;
        const precioBs = precioBase * bcvRate;
        const tUSD = precioBase * (1 + ivaP / 100);
        const tBs = tUSD * bcvRate;

        sumaTotalUSD += tUSD;
        sumaTotalBs += tBs;

        const filaEstilo = index % 2 === 0 ? { fill: { fgColor: { rgb: "FFFFFF" } } } : { fill: { fgColor: { rgb: "F8FAFC" } } };

        wsData.push([
          { v: `#TAR-${r.id_tarifa}`, s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: r.nombre_tarifa || '', s: { ...estilosCelda, ...filaEstilo, font: { ...estilosCelda.font, bold: true } } },
          { v: r.nombre_habitacion || '', s: { ...estilosCelda, ...filaEstilo } },
          { v: r.nombre_temporada || 'General', s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: precioBase, s: { ...estilosCeldaNumero, ...filaEstilo } },
          { v: precioBs, s: { ...estilosCeldaNumero, ...filaEstilo, numFmt: "Bs #,##0.00" } },
          { v: `${ivaP}%`, s: { ...estilosCeldaCentro, ...filaEstilo } },
          { v: tUSD, s: { ...estilosCeldaNumero, ...filaEstilo, font: { ...estilosCeldaNumero.font, bold: true } } },
          { v: tBs, s: { ...estilosCeldaNumero, ...filaEstilo, numFmt: "Bs #,##0.00", font: { ...estilosCeldaNumero.font, bold: true } } },
          { v: r.estado || 'Activa', s: { ...estilosCeldaCentro, ...filaEstilo, font: { ...estilosCeldaCentro.font, color: { rgb: r.estado?.toLowerCase() === 'activa' ? "15803D" : "B45309" }, bold: true } } },
          { v: r.incluye || '', s: { ...estilosCelda, ...filaEstilo } }
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } }];
      ws['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 35 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Catálogo de Tarifas');
      XLSX.writeFile(wb, `Tarifas_Hotel_${hoy.toISOString().slice(0, 10)}.xlsx`);
      lanzarToast('Catálogo profesional exportado a Excel con éxito.');
    } catch (err) {
      console.error(err);
      lanzarToast('Error al generar Excel estilizado.', 'error');
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
                <option key={temp.id_temporada} value={temp.id_temporada}>
                  {temp.nombre_temporada}
                </option>
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
          <button
            type="button"
            className="btn-export-excel"
            onClick={() => {
              setFiltroReporteBusqueda(busqueda);
              setFiltroReporteHabitacion(filtroHabitacion);
              setFiltroReporteTemporada(filtroTemporada);
              setFiltroReporteEstado(filtroEstado || 'TODOS');
              setModalReporteAbierto(true);
            }}
          >
            <span>Exportar Reporte</span>
          </button>
          <button type="button" className="btn-secundario-barra" onClick={() => setModalTemporadaAbierto(true)}>
            <span>Gestionar Temporadas</span>
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
                const esBorrador = r.estado?.toLowerCase() === 'borrador';
                return (
                  <tr key={r.id_tarifa}>
                    <td><strong className="table-rate-id">#TAR-{r.id_tarifa}</strong></td>
                    <td>
                      <strong className="table-rate-title">{r.nombre_tarifa}</strong>
                      <small className="table-rate-desc">{r.incluye ? (r.incluye.length > 40 ? r.incluye.substring(0, 40) + '...' : r.incluye) : ''}</small>
                    </td>
                    <td><span className="table-room-name">{r.nombre_habitacion}</span></td>
                    <td><span className="rate-badge">{r.nombre_temporada || 'Temporada Baja (General)'}</span></td>
                    <td><strong className="table-price-base">{formatUSD(precioNum)}</strong></td>
                    <td><span className="table-price-bs">{formatBs(precioNum * bcvRate)}</span></td>
                    <td><strong className="table-price-total">{formatUSD(totalNum)}</strong></td>
                    <td><small className="table-occupancy">{r.ocupacion_base} huéspedes</small></td>
                    <td><span className={`rate-badge ${esBorrador ? 'rate-badge-draft' : 'rate-badge-active'}`}>{r.estado}</span></td>
                    <td>
                      {/* Dentro del mapeo de tarifas (tarifasFiltradas.map) */}
                      {(() => {
                        const esTarifaProtegida = r.nombre_temporada && (
                          r.nombre_temporada.toLowerCase().includes('temporada normal') ||
                          r.nombre_temporada.toLowerCase().includes('temporada baja')
                        );
                        return (
                          <nav className="table-actions">
                            <button type="button" className="btn-table-action" onClick={() => { setTarifaVer(r); setModalVerAbierto(true); }} title="Ver detalles"><Eye size={16} /></button>
                            <button type="button" className="btn-table-action" onClick={() => abrirModalEditar(r)} title="Editar tarifa"><Pencil size={16} /></button>
                            {!esTarifaProtegida ? (
                              <button type="button" className="btn-table-action delete" onClick={() => { setTarifaAEliminar(r); setModalEliminarAbierto(true); }} title="Eliminar tarifa"><Trash2 size={16} /></button>
                            ) : (
                              <span title="Tarifa base protegida (No eliminable)" style={{ padding: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                <Trash2 size={16} style={{ opacity: 0.4, cursor: 'not-allowed' }} />
                              </span>
                            )}
                          </nav>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>


      {/* MODAL CREAR / EDITAR TARIFA */}
      {modalFormAbierto && (
        <section className="modal-overlay" onClick={() => setModalFormAbierto(false)}>
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

                  <section className="rate-grid-2 form-group-spaced" style={{ marginTop: '1rem' }}>
                    <label className="rate-form-group">
                      <span className="rate-label">Tipo de habitación</span>
                      <select name="id_tipo_habitacion" className="rate-select" value={formData.id_tipo_habitacion} onChange={handleInputChange}>
                        {tiposHabitacion.map((t) => (
                          <option key={t.id_tipo_habitacion} value={t.id_tipo_habitacion}>{t.nombre_tipo}</option>
                        ))}
                      </select>
                    </label>

                    <label className="rate-form-group">
                      <span className="rate-label">Temporada aplicable *</span>
                      <select name="id_temporada" className="rate-select" value={formData.id_temporada} onChange={handleInputChange} required>
                        <option value="">Selecciona una temporada...</option>
                        {temporadas.map((temp) => (
                          <option key={temp.id_temporada} value={temp.id_temporada}>
                            {temp.nombre_temporada} ({temp.fecha_inicio} al {temp.fecha_fin})
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>
                </article>

                <article className="rate-card">
                  <h3 className="rate-card-title">Precio, Ocupación y Huésped Extra</h3>
                  <section className="rate-grid-2">
                    <label className="rate-form-group">
                      <span className="rate-label">Precio base (USD) *</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        name="precio_base"
                        className={`rate-input ${parseFloat(formData.precio_base) <= 0 ? 'input-error-rojo' : ''}`}
                        value={formData.precio_base}
                        onChange={handleInputChange}
                        required
                      />
                      {parseFloat(formData.precio_base) <= 0 && (
                        <span className="texto-error-input">
                          El precio no puede ser cero ni negativo.
                        </span>
                      )}
                    </label>
                    <label className="rate-form-group">
                      <span className="rate-label">Equivalente (Bs)</span>
                      <input type="text" className="rate-input rate-input-readonly" value={formatBs(baseBs)} readOnly />
                    </label>
                  </section>

                  <section className="rate-grid-2" style={{ marginTop: '1rem' }}>
                    <label className="rate-form-group">
                      <span className="rate-label">Ocupación Base (Personas)</span>
                      <input type="number" name="ocupacion_base" className="rate-input" value={formData.ocupacion_base} onChange={handleInputChange} min="1" required />
                    </label>
                    <label className="rate-form-group">
                      <span className="rate-label">Costo Huésped Adicional (USD)</span>
                      <input type="number" step="0.01" name="huesped_adicional" className="rate-input" value={formData.huesped_adicional} onChange={handleInputChange} min="0" required />
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
              <button type="button" className="btn-action-draft" onClick={() => guardarTarifa(true)} disabled={guardando}>Guardar como Borrador</button>
              <button
                type="button"
                className="btn-action-create"
                onClick={() => guardarTarifa(false)}
                disabled={guardando || parseFloat(formData.precio_base) <= 0}
              >
                {guardando ? 'Guardando...' : 'Guardar tarifa activa'}
              </button>
            </footer>
          </article>
        </section>
      )}

      {modalReporteAbierto && (
        <section className="modal-overlay" onClick={() => setModalReporteAbierto(false)}>
          <article className="modal-figma-card modal-figma-card-reporte" onClick={(e) => e.stopPropagation()}>
            <header className="modal-figma-header">
              <section className="modal-header-title-group">
                <h2>Generador de Reportes — Tarifas</h2>
                <p>Configure los filtros y el formato de salida deseado.</p>
              </section>
              <button type="button" className="btn-close-modal" onClick={() => setModalReporteAbierto(false)}><X size={18} /></button>
            </header>

            <section className="modal-figma-body modal-figma-body-reporte">
              <section className="rate-card reporte-kpi-container">
                <article className="reporte-kpi-box">
                  <span className="rate-label">Registros en Vista</span>
                  <strong className="reporte-kpi-value-general">{tarifasReporteFiltradas.length}</strong>
                </article>
                <article className="reporte-kpi-box">
                  <span className="rate-label">Estado Seleccionado</span>
                  <strong className="reporte-kpi-value-activo">{filtroReporteEstado}</strong>
                </article>
              </section>

              <section className="rate-card reporte-form-card-column">
                <label className="rate-form-group">
                  <span className="rate-label">Filtrar por Estado</span>
                  <select className="rate-select" value={filtroReporteEstado} onChange={(e) => setFiltroReporteEstado(e.target.value)}>
                    <option value="TODOS">Todos los Estados</option>
                    <option value="Activa">Activa</option>
                    <option value="Borrador">Borrador</option>
                  </select>
                </label>

                <label className="rate-form-group">
                  <span className="rate-label">Habitación / Tipo</span>
                  <select className="rate-select" value={filtroReporteHabitacion} onChange={(e) => setFiltroReporteHabitacion(e.target.value)}>
                    <option value="">Habitación: Todas</option>
                    {tiposHabitacion.map((t) => (
                      <option key={t.id_tipo_habitacion} value={t.nombre_tipo}>{t.nombre_tipo}</option>
                    ))}
                  </select>
                </label>

                <label className="rate-form-group">
                  <span className="rate-label">Temporada</span>
                  <select className="rate-select" value={filtroReporteTemporada} onChange={(e) => setFiltroReporteTemporada(e.target.value)}>
                    <option value="">Temporada: Todas</option>
                    {temporadas.map((temp) => (
                      <option key={temp.id_temporada} value={temp.id_temporada}>{temp.nombre_temporada}</option>
                    ))}
                  </select>
                </label>

                <label className="rate-form-group">
                  <span className="rate-label">Criterio de Búsqueda</span>
                  <input type="text" className="rate-input" placeholder="Buscar por tarifa o código..." value={filtroReporteBusqueda} onChange={(e) => setFiltroReporteBusqueda(e.target.value)} />
                </label>

                <label className="rate-form-group">
                  <span className="rate-label">Formato de Salida</span>
                  <div className="reporte-format-buttons">
                    <button type="button" className={`btn-action-cancel reporte-format-btn ${formatoReporte === 'EXCEL' ? 'btn-action-create' : ''}`} onClick={() => setFormatoReporte('EXCEL')}>Excel</button>
                    <button type="button" className={`btn-action-cancel reporte-format-btn ${formatoReporte === 'PDF' ? 'btn-action-create' : ''}`} onClick={() => setFormatoReporte('PDF')}>PDF</button>
                    <button type="button" className={`btn-action-cancel reporte-format-btn ${formatoReporte === 'CORREO' ? 'btn-action-create' : ''}`} onClick={() => setFormatoReporte('CORREO')}>Correo</button>
                  </div>
                </label>

                {formatoReporte === 'CORREO' && (
                  <label className="rate-form-group">
                    <span className="rate-label">Correo Destinatario *</span>
                    <input type="email" className="rate-input" placeholder="ejemplo@correo.com" value={correoDestino} onChange={(e) => setCorreoDestino(e.target.value)} required />
                  </label>
                )}
              </section>
            </section>

            <footer className="modal-figma-footer">
              <button type="button" className="btn-action-cancel" onClick={() => setModalReporteAbierto(false)}>Cancelar</button>
              {formatoReporte === 'EXCEL' && (
                <button type="button" className="btn-action-create" onClick={exportarExcelTarifas}>Descargar Excel</button>
              )}
              {formatoReporte === 'PDF' && (
                <button type="button" className="btn-action-create" onClick={exportarReportePDFTarifas}>Descargar PDF</button>
              )}
              {formatoReporte === 'CORREO' && (
                <button type="button" className="btn-action-create" onClick={enviarReportePorCorreoTarifas} disabled={enviandoCorreo}>
                  {enviandoCorreo ? 'Enviando...' : 'Enviar Reporte por Correo'}
                </button>
              )}
            </footer>
          </article>
        </section>
      )}
      
      {/* MODAL GESTIÓN DE TEMPORADAS (CREAR Y ELIMINAR TEMPORADAS) */}
      {modalTemporadaAbierto && (
        <section className="modal-overlay" onClick={() => setModalTemporadaAbierto(false)}>
          <article className="modal-figma-card modal-temporadas-card" onClick={(e) => e.stopPropagation()}>
            <header className="modal-figma-header">
              <section className="modal-header-title-group">
                <h2>Gestión de Temporadas</h2>
                <p>Configura los rangos de fechas para temporadas especiales y administra tu calendario.</p>
              </section>
              <button type="button" className="btn-close-modal" onClick={() => setModalTemporadaAbierto(false)}><X size={18} /></button>
            </header>

            <section className="modal-figma-body temporadas-body-grid">
              {/* Columna Izquierda: Formulario para registrar temporada */}
              <article className="rate-card temporada-form-card">
                <h3 className="rate-card-title">+ Registrar Nueva Temporada</h3>
                <section className="rate-form-group" style={{ gap: '0.85rem' }}>
                  <label className="rate-form-group">
                    <span className="rate-label">Nombre de la Temporada</span>
                    <input
                      type="text"
                      className="rate-input"
                      placeholder="Ej. Temporada Navideña, Vacaciones..."
                      value={nuevoRango.nombre_temporada}
                      onChange={(e) => setNuevoRango({ ...nuevoRango, nombre_temporada: e.target.value })}
                    />
                  </label>

                  <section className="rate-grid-2">
                    <label className="rate-form-group">
                      <span className="rate-label">Fecha Inicio</span>
                      <input
                        type="date"
                        className="rate-input"
                        value={nuevoRango.fecha_inicio}
                        onChange={(e) => setNuevoRango({ ...nuevoRango, fecha_inicio: e.target.value })}
                      />
                    </label>
                    <label className="rate-form-group">
                      <span className="rate-label">Fecha Fin</span>
                      <input
                        type="date"
                        className="rate-input"
                        value={nuevoRango.fecha_fin}
                        onChange={(e) => setNuevoRango({ ...nuevoRango, fecha_fin: e.target.value })}
                      />
                    </label>
                  </section>

                  <button
                    type="button"
                    className="btn-nueva-tarifa"
                    style={{ marginTop: '0.5rem', justifyContent: 'center', width: '100%' }}
                    onClick={async () => {
                      if (!nuevoRango.nombre_temporada.trim() || !nuevoRango.fecha_inicio || !nuevoRango.fecha_fin) {
                        lanzarToast('Completa todos los campos de la temporada.', 'error');
                        return;
                      }
                      try {
                        const res = await fetch(API_TEMPORADAS_BASE, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(nuevoRango)
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.mensaje || 'Error al crear temporada');
                        lanzarToast('Temporada creada con éxito.');
                        setNuevoRango({ nombre_temporada: '', fecha_inicio: '', fecha_fin: '', descripcion: '' });
                        cargarDatos();
                      } catch (err) {
                        lanzarToast(err.message, 'error');
                      }
                    }}
                  >
                    Guardar Temporada
                  </button>
                </section>
              </article>

              {/* Columna Derecha: Listado de Temporadas Actuales */}
              <article className="rate-card temporada-list-card">
                <h3 className="rate-card-title">Temporadas Existentes ({temporadas.length})</h3>
                {temporadas.length === 0 ? (
                  <p className="rate-helper-text">No hay temporadas registradas actualmente.</p>
                ) : (
                  <ul className="lista-temporadas-gestion-clean">
                    {temporadas.map((temp) => {
                      const esProtegida = temp.nombre_temporada.toLowerCase().includes('temporada normal') ||
                        temp.nombre_temporada.toLowerCase().includes('baja') || temp.fecha_inicio === 'N/A';
                      return (
                        <li key={temp.id_temporada} className="item-temporada-gestion-clean">
                          <div className="temporada-info-gestion">
                            <span className="nombre-temporada-gestion">
                              {temp.nombre_temporada}
                            </span>
                            <span className="rate-helper-text">Rango: <strong>{temp.fecha_inicio}</strong> al <strong>{temp.fecha_fin}</strong></span>
                          </div>
                          {!esProtegida ? (
                            <button
                              type="button"
                              onClick={() => eliminarTemporadaServidor(temp.id_temporada)}
                              className="btn-eliminar-temporada-clean"
                              title="Eliminar Temporada"
                            >
                              <Trash2 size={15} /> <span>Eliminar</span>
                            </button>
                          ) : (
                            <span className="badge-protegida-clean" title="Temporada base del sistema protegida">Protegida</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            </section>

            <footer className="modal-figma-footer">
              <button type="button" className="btn-action-cancel" onClick={() => setModalTemporadaAbierto(false)}>Cerrar</button>
            </footer>
          </article>
        </section>
      )}

      {/* MODAL VER DETALLES */}
      {modalVerAbierto && tarifaVer && (
        <section className="modal-overlay" onClick={() => setModalVerAbierto(false)}>
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

      {/* MODAL ELIMINAR TARIFA */}
      {modalEliminarAbierto && tarifaAEliminar && (
        <section className="modal-overlay" onClick={() => setModalEliminarAbierto(false)}>
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
        <section className="modal-overlay" onClick={() => setModalBcvAbierto(false)}>
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
            {t.tipo === 'error' ? <X size={18} color="#ef4444" /> : <Check size={18} color="#16a34a" />}
            <span className="toast-text">{t.mensaje}</span>
          </article>
        ))}
      </aside>
    </main>
  );
}