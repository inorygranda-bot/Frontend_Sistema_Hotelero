import React, { useState, useEffect } from 'react';
import '../../estilos/control_emergencia.css';
import XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../../config/api';

const API_EMERGENCIA_URL = `${API_BASE_URL}/api/emergencia`;

export default function ControlEmergencia({ usuario }) {

  const [modalReporteAbierto, setModalReporteAbierto] = useState(false);
  const [formatoReporte, setFormatoReporte] = useState('EXCEL'); // 'EXCEL' | 'PDF' | 'CORREO'
  const [filtroReporteEstadoSeguro, setFiltroReporteEstadoSeguro] = useState('TODOS'); // 'TODOS' | 'SEGURO' | 'PENDIENTE'
  const [filtroReportePiso, setFiltroReportePiso] = useState('TODOS');
  const [filtroReporteBusqueda, setFiltroReporteBusqueda] = useState('');
  const [correoDestino, setCorreoDestino] = useState('');
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  const [estadoEmergencia, setEstadoEmergencia] = useState('NORMAL');
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  const [mensajeAlerta, setMensajeAlerta] = useState('ATENCION: Se ha activado el protocolo de emergencia en el hotel. Por favor, dirijase con calma a la salida de emergencia más cercana.');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [huespedesActivos, setHuespedesActivos] = useState([]);
  const [alertaModal, setAlertaModal] = useState({ abierto: false, tipo: 'exito', titulo: '', mensaje: '' });

  const sincronizarSistema = async () => {
    setCargandoDatos(true);
    try {
      const respEstado = await fetch(`${API_EMERGENCIA_URL}/estado`);
      if (respEstado.ok) {
        const datosEstado = await respEstado.json();
        setEstadoEmergencia(datosEstado.estado || 'NORMAL');
      }

      const respHuespedes = await fetch(`${API_EMERGENCIA_URL}/activos`);
      if (respHuespedes.ok) {
        const datosHuespedes = await respHuespedes.json();
        setHuespedesActivos(Array.isArray(datosHuespedes) ? datosHuespedes.map(h => ({ ...h, seguro: false })) : []);
      }
    } catch (err) {
      console.error('Error al sincronizar datos del sistema:', err);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    sincronizarSistema();
  }, []);

  const pisosUnicosEmergencia = Array.from(
    new Set(huespedesActivos.map((h) => (h.piso || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const huespedesReporteFiltradas = huespedesActivos.filter((h) => {
    const q = filtroReporteBusqueda.trim().toLowerCase();
    const coincideBusqueda =
      !q ||
      h.nombre?.toLowerCase().includes(q) ||
      h.num_documento?.toLowerCase().includes(q) ||
      h.codigo_habitacion?.toString().toLowerCase().includes(q) ||
      (h.telefono || '').toLowerCase().includes(q);

    const coincideEstadoSeguro =
      filtroReporteEstadoSeguro === 'TODOS' ||
      (filtroReporteEstadoSeguro === 'SEGURO' && h.seguro) ||
      (filtroReporteEstadoSeguro === 'PENDIENTE' && !h.seguro);

    const coincidePiso =
      filtroReportePiso === 'TODOS' ||
      (h.piso || '').trim().toLowerCase() === filtroReportePiso.toLowerCase();

    return coincideBusqueda && coincideEstadoSeguro && coincidePiso;
  });

  const exportarExcelEmergencia = () => {
    if (huespedesReporteFiltradas.length === 0) {
      setAlertaModal({ abierto: true, tipo: 'error', titulo: 'Sin registros', mensaje: 'No hay huéspedes con los filtros seleccionados.' });
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const hoy = new Date();
      const fechaStr = hoy.toLocaleDateString('es-VE');

      const estilosTitulo = { font: { name: 'Segoe UI', sz: 14, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "DC2626" } }, alignment: { horizontal: "center" } };
      const estilosHeader = { font: { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "2563EB" } }, alignment: { horizontal: "center" } };
      const estilosCelda = { font: { name: 'Segoe UI', sz: 10, color: { rgb: "0F172A" } }, border: { top: { style: 'thin', color: { rgb: "E2E8F0" } }, bottom: { style: 'thin', color: { rgb: "E2E8F0" } }, left: { style: 'thin', color: { rgb: "E2E8F0" } }, right: { style: 'thin', color: { rgb: "E2E8F0" } } } };

      const headers = ['#', 'Huésped', 'Documento', 'Habitación', 'Piso', 'Teléfono', 'Estado Evacuación'];
      const wsData = [
        [{ v: 'SISTEMA HOTELERO — REPORTE DE EVACUACIÓN Y CONTEO DE HUÉSPEDES', s: estilosTitulo }],
        [{ v: `Fecha: ${fechaStr} | Estado Filtro: [${filtroReporteEstadoSeguro}]`, s: { font: { italic: true } } }],
        [],
        headers.map(h => ({ v: h, s: estilosHeader }))
      ];

      huespedesReporteFiltradas.forEach((h, idx) => {
        wsData.push([
          { v: idx + 1, s: estilosCelda },
          { v: h.nombre, s: { ...estilosCelda, font: { bold: true } } },
          { v: h.num_documento, s: estilosCelda },
          { v: `Hab. ${h.codigo_habitacion}`, s: estilosCelda },
          { v: `Piso ${h.piso}`, s: estilosCelda },
          { v: h.telefono || 'N/A', s: estilosCelda },
          { v: h.seguro ? 'SEGURO / EVACUADO' : 'PENDIENTE', s: { ...estilosCelda, font: { bold: true, color: { rgb: h.seguro ? "15803D" : "B45309" } } } }
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }];
      ws['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 22 }];

      XLSX.utils.book_append_sheet(wb, ws, 'Reporte Emergencia');
      XLSX.writeFile(wb, `Reporte_Emergencia_${hoy.toISOString().slice(0, 10)}.xlsx`);
      setModalReporteAbierto(false);
    } catch (err) {
      console.error(err);
    }
  };

  const exportarReportePDFEmergencia = () => {
    if (huespedesReporteFiltradas.length === 0) {
      setAlertaModal({ abierto: true, tipo: 'error', titulo: 'Sin registros', mensaje: 'No hay huéspedes para generar el PDF.' });
      return;
    }

    try {
      const doc = new jsPDF();
      const hoy = new Date();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text("SISTEMA HOTELERO — REPORTE DE EVACUACIÓN Y EMERGENCIA", 14, 20);

      const headers = [['#', 'Huésped', 'Documento', 'Habitación', 'Piso', 'Estado']];
      const rows = huespedesReporteFiltradas.map((h, i) => [
        i + 1,
        h.nombre,
        h.num_documento,
        `Hab. ${h.codigo_habitacion}`,
        `Piso ${h.piso}`,
        h.seguro ? 'Seguro / Evacuado' : 'Pendiente'
      ]);

      autoTable(doc, {
        startY: 30,
        head: headers,
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 }
      });

      doc.save(`Reporte_Emergencia_${hoy.toISOString().slice(0, 10)}.pdf`);
      setModalReporteAbierto(false);
    } catch (err) {
      console.error(err);
    }
  };

  const enviarReportePorCorreoEmergencia = async () => {
    if (!correoDestino || !correoDestino.trim()) {
      setAlertaModal({ abierto: true, tipo: 'error', titulo: 'Correo Requerido', mensaje: 'Escriba un correo válido.' });
      return;
    }

    setEnviandoCorreo(true);
    try {
      const respuesta = await fetch(`${API_EMERGENCIA_URL}/reporte/correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo_destino: correoDestino,
          estado_seguro: filtroReporteEstadoSeguro,
          piso: filtroReportePiso,
          busqueda: filtroReporteBusqueda
        })
      });

      const resData = await respuesta.json();
      if (!respuesta.ok) throw new Error(resData.mensaje || 'Error al enviar correo.');

      setModalReporteAbierto(false);
      setCorreoDestino('');
      setAlertaModal({ abierto: true, tipo: 'exito', titulo: 'Correo Despachado', mensaje: 'El reporte de emergencia fue enviado con éxito.' });
    } catch (err) {
      setAlertaModal({ abierto: true, tipo: 'error', titulo: 'Error', mensaje: err.message });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const intentarActivarAlerta = async (e) => {
    e.preventDefault();

    if (!usuario || !usuario.id_usuario) {
      setErrorPassword('No se detectó una sesión de usuario válida. Por favor, vuelva a iniciar sesión.');
      return;
    }

    try {
      const respuesta = await fetch(`${API_EMERGENCIA_URL}/activar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          contrasenna_admin: passwordAdmin
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Contraseña de administrador incorrecta.');
      }

      setEstadoEmergencia('ALERTA');
      setModalPasswordAbierto(false);
      setPasswordAdmin('');
      setErrorPassword('');
      await sincronizarSistema();

      setAlertaModal({
        abierto: true,
        tipo: 'error',
        titulo: 'ESTADO DE EMERGENCIA ACTIVADO',
        mensaje: datos.mensaje || 'Se ha registrado la alerta en el sistema y cambiado al modo de seguridad.'
      });
    } catch (err) {
      setErrorPassword(err.message);
    }
  };

  const desactivarAlerta = async () => {
    try {
      const respuesta = await fetch(`${API_EMERGENCIA_URL}/desactivar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: usuario?.id_usuario || 1 })
      });

      if (!respuesta.ok) {
        throw new Error('Error al normalizar el sistema en el servidor.');
      }

      setEstadoEmergencia('NORMAL');
      setHuespedesActivos(prev => prev.map(h => ({ ...h, seguro: false })));
      setAlertaModal({
        abierto: true,
        tipo: 'exito',
        titulo: 'Sistema Normalizado',
        mensaje: 'Se ha desactivado el estado de emergencia con éxito en la red del hotel.'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMarcarSeguro = async (idHuesped) => {
    const huespedActual = huespedesActivos.find(h => h.id_huesped === idHuesped);
    if (!huespedActual) return;

    const nuevoEstadoSeguro = !huespedActual.seguro;

    // Actualizar estado local inmediato
    setHuespedesActivos(prev =>
      prev.map(h => h.id_huesped === idHuesped ? { ...h, seguro: nuevoEstadoSeguro } : h)
    );

    try {
      await fetch(`${API_EMERGENCIA_URL}/marcar-seguro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: usuario?.id_usuario || 1,
          id_huesped: idHuesped,
          seguro: nuevoEstadoSeguro
        })
      });
    } catch (err) {
      console.error('Error al registrar marcaje de seguridad en auditoría:', err);
    }
  };

  const enviarMensajeMasivo = async () => {
    setEnviandoMensaje(true);
    try {
      const respuesta = await fetch(`${API_EMERGENCIA_URL}/mensaje-masivo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: mensajeAlerta,
          id_usuario: usuario?.id_usuario || 1
        })
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.mensaje || 'Error al enviar reporte.');

      setAlertaModal({
        abierto: true,
        tipo: 'exito',
        titulo: 'Reporte Transmitido a Telegram',
        mensaje: datos.mensaje || 'El reporte oficial fue enviado con éxito a la central de seguridad.'
      });
    } catch (err) {
      setAlertaModal({
        abierto: true,
        tipo: 'error',
        titulo: 'Error de Envio',
        mensaje: err.message
      });
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const totalHuespedes = huespedesActivos.length;
  const totalSeguros = huespedesActivos.filter(h => h.seguro).length;
  const porcentajeSeguros = totalHuespedes > 0 ? Math.round((totalSeguros / totalHuespedes) * 100) : 0;

  if (cargandoDatos) {
    return (
      <section className="contenedor-emergencia" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Sincronizando estado del sistema de emergencias...</h2>
      </section>
    );
  }

  return (
    <section className="contenedor-emergencia">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Control de Emergencias y Evacuacion</h1>
        <p className="subtitulo-vista">Gestion de protocolos de seguridad, alertas y reporte de huespedes</p>
      </header>

      {/* BANNER DE ESTADO */}
      <article className={`banner-estado-emergencia ${estadoEmergencia.toLowerCase()}`}>
        <section className="info-estado">
          <h2>
            {estadoEmergencia === 'NORMAL' ? 'Estado del Sistema: Normal' : 'SISTEMA EN ESTADO DE EMERGENCIA / ALERTA'}
          </h2>
          <p>
            {estadoEmergencia === 'NORMAL'
              ? 'Las operaciones hoteleras transcurren con normalidad. Los protocolos de seguridad estan en espera.'
              : 'Protocolo activo. Verifique el reporte de evacuacion y marque a los huespedes seguros.'}
          </p>
        </section>
        <section>
          {estadoEmergencia === 'NORMAL' ? (
            <button
              type="button"
              className="boton-alerta-peligro"
              style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 700, backgroundColor: '#dc2626', color: '#fff' }}
              onClick={() => setModalPasswordAbierto(true)}
            >
              Activar Alerta de Emergencia
            </button>
          ) : (
            <button
              type="button"
              className="boton-guardar"
              onClick={desactivarAlerta}
            >
              Desactivar Emergencia y Normalizar
            </button>
          )}
        </section>
      </article>

      {/* ESTADO NORMAL: GRAFICAS Y METRICAS */}
      {estadoEmergencia === 'NORMAL' && (
        <section className="grid-metricas-emergencia">
          <article className="tarjeta-metrica">
            <span className="titulo-metrica">Huespedes Activos Hospedados</span>
            <span className="valor-metrica">{totalHuespedes}</span>
            <small style={{ color: 'var(--color-texto-secundario)' }}>Listos para reporte inmediato (Check-in activo)</small>
            <div className="barra-progreso-mini">
              <div className="progreso-relleno" style={{ width: '100%' }}></div>
            </div>
          </article>

          <article className="tarjeta-metrica">
            <span className="titulo-metrica">Estado Operativo del Hotel</span>
            <span className="valor-metrica" style={{ fontSize: '1.25rem', color: '#2563eb', marginTop: '0.4rem' }}>Monitoreo Activo</span>
            <small style={{ color: 'var(--color-texto-secundario)' }}>Sin incidencias reportadas</small>
          </article>

          <article className="tarjeta-metrica">
            <span className="titulo-metrica">Estado de Canal Telegram</span>
            <span className="valor-metrica" style={{ fontSize: '1.25rem', color: '#16a34a', marginTop: '0.4rem' }}>Operativo</span>
            <small style={{ color: 'var(--color-texto-secundario)' }}>Central de notificaciones lista</small>
          </article>
        </section>
      )}

      {/* ESTADO DE EMERGENCIA: MENSAJERIA Y REPORTE */}
      {estadoEmergencia === 'ALERTA' && (
        <>
          <article className="tarjeta-mensajeria">
            <h3 className="titulo-seccion-emergencia">Enviar Reporte de Incidente a Telegram (Administrador)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)', margin: 0 }}>
              Este reporte ejecutivo e instructivo será transmitido de forma inmediata al canal de Telegram configurado para la central de seguridad.
            </p>
            <textarea
              className="caja-textarea-mensaje"
              value={mensajeAlerta}
              onChange={(e) => setMensajeAlerta(e.target.value)}
              placeholder="Escriba la instruccion de emergencia para el reporte..."
            />
            <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="boton-guardar"
                onClick={enviarMensajeMasivo}
                disabled={enviandoMensaje}
              >
                {enviandoMensaje ? 'Transmitiendo Reporte...' : 'Enviar Reporte de Emergencia a Telegram'}
              </button>
            </footer>
          </article>

          <article className="tarjeta-tabla">
            <header className="cabecera-tabla-emergencia">
              <h3 className="titulo-seccion-emergencia">Reporte de Evacuacion y Conteo de Huespedes</h3>
              <div className="grupo-acciones-header-reporte">
                <span className="texto-conteo-seguros">
                  Seguros: {totalSeguros} de {totalHuespedes} ({porcentajeSeguros}%)
                </span>
                <button
                  type="button"
                  className="boton-secundario-barra boton-reporte-header"
                  onClick={() => setModalReporteAbierto(true)}
                >
                  Exportar Reporte
                </button>
              </div>
            </header>

            <table className="tabla-seguridad-huespedes">
              <thead>
                <tr>
                  <th>Marcar Seguro</th>
                  <th>Huesped</th>
                  <th>Documento</th>
                  <th>Habitacion</th>
                  <th>Piso</th>
                  <th>Telefono Registrado</th>
                  <th>Estado Actual</th>
                </tr>
              </thead>
              <tbody>
                {huespedesActivos.length > 0 ? (
                  huespedesActivos.map((h) => (
                    <tr key={h.id_huesped} className={h.seguro ? 'fila-huesped-seguro' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox-seguro"
                          checked={h.seguro}
                          onChange={() => toggleMarcarSeguro(h.id_huesped)}
                          title="Marcar como evacuado y seguro"
                        />
                      </td>
                      <td>
                        <strong>{h.nombre}</strong>
                      </td>
                      <td>{h.num_documento}</td>
                      <td>Hab. {h.codigo_habitacion}</td>
                      <td>Piso {h.piso}</td>
                      <td>{h.telefono || 'N/A'}</td>
                      <td>
                        <span className={`badge-estado-seguro ${h.seguro ? 'seguro' : 'pendiente'}`}>
                          {h.seguro ? 'Seguro / Evacuado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="tabla-vacia" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay huéspedes con Check-in activo actualmente en el hotel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </article>
        </>
      )}

      {/* MODAL DE REPORTES DE EMERGENCIA */}
      {modalReporteAbierto && (
        <aside className="overlay-modal" onClick={() => setModalReporteAbierto(false)}>
          <article className="contenido-modal modal-detalle modal-reporte-ancho" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">Generador de Reportes — Emergencia</h2>
              <button type="button" className="boton-cerrar-modal" onClick={() => setModalReporteAbierto(false)}>&times;</button>
            </header>

            <section className="cuerpo-modal-reporte">
              <p className="texto-descripcion-reporte">
                Configure los filtros de evacuación y el formato de salida deseado para el reporte oficial de seguridad.
              </p>

              <div className="contenedor-kpis-resumen">
                <article className="tarjeta-kpi-mini">
                  <span className="kpi-titulo-mini">Registros en Vista</span>
                  <strong className="kpi-valor-mini">{huespedesReporteFiltradas.length}</strong>
                </article>
                <article className="tarjeta-kpi-mini">
                  <span className="kpi-titulo-mini">Estado Evacuación</span>
                  <strong className="kpi-valor-mini">{filtroReporteEstadoSeguro}</strong>
                </article>
              </div>

              <div className="grupo-campos">
                <label className="campo ancho-completo">
                  <span className="label-texto">Filtrar por Estado de Evacuación</span>
                  <select
                    className="select-filtro"
                    value={filtroReporteEstadoSeguro}
                    onChange={(e) => setFiltroReporteEstadoSeguro(e.target.value)}
                  >
                    <option value="TODOS">Todos los Huéspedes</option>
                    <option value="SEGURO">Solo Seguros / Evacuados</option>
                    <option value="PENDIENTE">Solo Pendientes</option>
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
                    {pisosUnicosEmergencia.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Criterio de Búsqueda</span>
                  <input
                    type="text"
                    className="input-busqueda"
                    placeholder="Buscar por nombre, documento o habitación..."
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
              <button type="button" className="boton-cancelar" onClick={() => setModalReporteAbierto(false)}>Cancelar</button>
              <div className="footer-accion-flex">
                {formatoReporte === 'EXCEL' && (
                  <button type="button" className="boton-agregar boton-ancho-completo" onClick={exportarExcelEmergencia}>Descargar Excel</button>
                )}
                {formatoReporte === 'PDF' && (
                  <button type="button" className="boton-agregar boton-ancho-completo" onClick={exportarReportePDFEmergencia}>Descargar PDF</button>
                )}
                {formatoReporte === 'CORREO' && (
                  <button type="button" className="boton-guardar boton-ancho-completo" onClick={enviarReportePorCorreoEmergencia} disabled={enviandoCorreo}>
                    {enviandoCorreo ? 'Enviando...' : 'Enviar Reporte por Correo'}
                  </button>
                )}
              </div>
            </footer>
          </article>
        </aside>
      )}

      {/* MODAL CONTRASEÑA ADMINISTRADOR */}
      {modalPasswordAbierto && (
        <aside className="overlay-modal" onClick={() => setModalPasswordAbierto(false)}>
          <article className="contenido-modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">Autorizacion de Administrador</h2>
              <button type="button" className="boton-cerrar-modal" onClick={() => setModalPasswordAbierto(false)}>&times;</button>
            </header>
            <form onSubmit={intentarActivarAlerta} className="formulario-huesped">
              <fieldset className="grupo-campos" style={{ border: 'none', padding: 0 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)', marginBottom: '1rem' }}>
                  Para activar el estado de emergencia en el sistema, ingrese la contraseña de administrador.
                </p>
                <label className="campo ancho-completo">
                  <span className="label-texto">Contraseña de Administrador *</span>
                  <input
                    type="password"
                    value={passwordAdmin}
                    onChange={(e) => { setPasswordAdmin(e.target.value); setErrorPassword(''); }}
                    placeholder="••••••••"
                    autoFocus
                    className={errorPassword ? 'input-error' : ''}
                  />
                  {errorPassword && <span className="texto-error-campo">{errorPassword}</span>}
                </label>
              </fieldset>
              <footer className="acciones-formulario" style={{ marginTop: '1.25rem', border: 'none', padding: 0 }}>
                <button type="button" className="boton-cancelar" onClick={() => setModalPasswordAbierto(false)}>Cancelar</button>
                <button type="submit" className="boton-alerta-peligro" style={{ backgroundColor: '#dc2626', color: '#fff', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}>
                  Confirmar y Activar Alerta
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}

      {/* MODAL DE ALERTAS GENERALES */}
      {alertaModal.abierto && (
        <aside className="overlay-modal z-alto">
          <article className="modal-alerta-tarjeta">
            <h3 className="titulo-alerta">{alertaModal.titulo}</h3>
            <p className="mensaje-alerta">{alertaModal.mensaje}</p>
            <footer className="acciones-alerta">
              <button
                type="button"
                className="boton-alerta-primario"
                onClick={() => setAlertaModal((prev) => ({ ...prev, abierto: false }))}
              >
                Aceptar
              </button>
            </footer>
          </article>
        </aside>
      )}
    </section>
  );
}