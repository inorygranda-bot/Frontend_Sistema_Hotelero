import React, { useState, useEffect } from 'react';
import '../../estilos/reservas.css';
import '../../estilos/habitaciones.css';

const API_RESERVAS_URL = 'http://localhost:3000/api/reservas';
const API_HUESPEDES_URL = 'http://localhost:3000/api/huespedes';
const API_HABITACIONES_URL = 'http://localhost:3000/api/habitaciones';
const API_RECARGOS_URL = 'http://localhost:3000/api/recargos';
const API_TASA_BCV_URL = 'http://localhost:3000/api/tarifas/tasa-bcv';

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [recargosDisponibles, setRecargosDisponibles] = useState([]);
  const [bcvRate, setBcvRate] = useState(875.65);

  const [cargando, setCargando] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR');
  const [pasoFormulario, setPasoFormulario] = useState('EDITANDO'); // 'EDITANDO' o 'CONFIRMANDO'
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState({});

  const estadoInicialFormReserva = {
    codigo_reserva: '',
    id_huesped: '',
    codigo_habitacion: '',
    id_usuario: 1,
    fecha_checkin: '',
    fecha_checkout: '',
    cantidad_huespedes: 1,
    estado: 'PENDIENTE',
    recargos_ids: []
  };

  const [formDataReserva, setFormDataReserva] = useState(estadoInicialFormReserva);
  const [recargoSeleccionTemporal, setRecargoSeleccionTemporal] = useState('');

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const [alerta, setAlerta] = useState({
    abierto: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
    accionConfirmar: null,
    textoConfirmar: 'Aceptar'
  });

  const cargarDatos = async () => {
    setCargando(true);
    setErrorTabla(null);

    try {
      const [respReservas, respHuespedes, respHabitaciones, respRecargos, respBcv] = await Promise.all([
        fetch(API_RESERVAS_URL).catch(() => ({ ok: false })),
        fetch(API_HUESPEDES_URL).catch(() => ({ ok: false })),
        fetch(API_HABITACIONES_URL).catch(() => ({ ok: false })),
        fetch(API_RECARGOS_URL).catch(() => ({ ok: false })),
        fetch(API_TASA_BCV_URL).catch(() => ({ ok: false }))
      ]);

      if (respReservas.ok) {
        const datosReservas = await respReservas.json();
        setReservas(Array.isArray(datosReservas) ? datosReservas : []);
      }

      if (respHuespedes.ok) {
        const datosHuespedes = await respHuespedes.json();
        setHuespedes(Array.isArray(datosHuespedes) ? datosHuespedes : []);
      }

      if (respHabitaciones.ok) {
        const datosHabitaciones = await respHabitaciones.json();
        setHabitaciones(Array.isArray(datosHabitaciones) ? datosHabitaciones : []);
      }

      if (respRecargos.ok) {
        const datosRecargos = await respRecargos.json();
        setRecargosDisponibles(Array.isArray(datosRecargos) ? datosRecargos : []);
      }

      if (respBcv.ok) {
        const bcvData = await respBcv.json();
        if (bcvData.tasa) setBcvRate(parseFloat(bcvData.tasa));
      }
    } catch (err) {
      console.error('Error al cargar datos del módulo de reservas:', err);
      setErrorTabla('No se pudo conectar con el servidor para cargar las reservas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const calcularDetalleFinanciero = (formData) => {
    const habitacionSeleccionada = habitaciones.find(
      (h) => String(h.codigo_habitacion) === String(formData.codigo_habitacion)
    );

    const precioBaseNoche = parseFloat(habitacionSeleccionada?.precio_base || 140);
    const ocupacionBase = habitacionSeleccionada?.ocupacion_base !== undefined && habitacionSeleccionada?.ocupacion_base !== null
      ? parseInt(habitacionSeleccionada.ocupacion_base)
      : 2;
    const cargoHuespedAdicional = parseFloat(habitacionSeleccionada?.huesped_adicional || 15);
    const ivaPorc = parseFloat(habitacionSeleccionada?.iva || 16);

    let noches = 1;
    if (formData.fecha_checkin && formData.fecha_checkout) {
      const fIn = new Date(formData.fecha_checkin + 'T00:00:00');
      const fOut = new Date(formData.fecha_checkout + 'T00:00:00');

      if (!isNaN(fIn.getTime()) && !isNaN(fOut.getTime())) {
        const diffMs = fOut.getTime() - fIn.getTime();
        const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDias > 0) {
          noches = diffDias;
        }
      }
    }

    const cantidadHuespedes = parseInt(formData.cantidad_huespedes || 1);
    const huespedesExtra = Math.max(0, cantidadHuespedes - ocupacionBase);
    const costoExtraTotal = huespedesExtra * cargoHuespedAdicional * noches;
    const subtotalTarifaBase = precioBaseNoche * noches;
    const subtotalAlojamiento = subtotalTarifaBase + costoExtraTotal;

    let totalAjustesCalculados = 0;
    const listaRecargosAplicados = [];
    if (Array.isArray(formData.recargos_ids)) {
      formData.recargos_ids.forEach((idRec) => {
        const recObj = recargosDisponibles.find((r) => String(r.id_recargo) === String(idRec));
        if (recObj) {
          const val = parseFloat(recObj.monto || 0);
          const tipoOp = String(recObj.tipo_operacion || '').toLowerCase();
          const tipoCalc = String(recObj.tipo_calculo || '').toLowerCase();

          let montoItem = tipoOp.includes('porcentaje')
            ? subtotalAlojamiento * (val / 100)
            : val;

          if (tipoCalc.includes('resta') || tipoCalc.includes('descuento')) {
            montoItem = -montoItem;
          }
          totalAjustesCalculados += montoItem;
          listaRecargosAplicados.push({ ...recObj, montoCalculado: montoItem });
        }
      });
    }

    const subtotalConAjustes = Math.max(0, subtotalAlojamiento + totalAjustesCalculados);
    const ivaUSD = subtotalConAjustes * (ivaPorc / 100);
    const totalUSD = subtotalConAjustes + ivaUSD;
    const totalBs = totalUSD * bcvRate;

    return {
      noches,
      precioBaseNoche,
      subtotalTarifaBase,
      huespedesExtra,
      costoExtraTotal,
      listaRecargosAplicados,
      ivaPorc,
      ivaUSD,
      totalUSD,
      totalBs
    };
  };

  const finanzasForm = calcularDetalleFinanciero(formDataReserva);

  const formatUSD = (val) => '$ ' + (parseFloat(val) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (val) => 'Bs ' + (parseFloat(val) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const validarCampoReserva = (nombre, valor, habSeleccionada = null) => {
    let error = '';
    if (nombre === 'id_huesped' && !valor) error = 'Debe seleccionar un huésped.';
    if (nombre === 'codigo_habitacion' && !valor) error = 'Debe seleccionar una habitación.';
    if (nombre === 'fecha_checkin' && !valor) error = 'La fecha de check-in es obligatoria.';
    if (nombre === 'fecha_checkout' && !valor) error = 'La fecha de check-out es obligatoria.';
    if (nombre === 'cantidad_huespedes') {
      if (!valor) error = 'La cantidad es obligatoria.';
      else if (!/^\d+$/.test(valor) || Number(valor) <= 0) error = 'Debe ser mayor a 0.';
      else if (habSeleccionada && Number(valor) > Number(habSeleccionada.capacidad)) {
        error = `Supera la capacidad máxima (${habSeleccionada.capacidad} pers.).`;
      }
    }
    return error;
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    const habSeleccionada = habitaciones.find(
      (h) => String(h.codigo_habitacion) === String(name === 'codigo_habitacion' ? value : formDataReserva.codigo_habitacion)
    );

    setFormDataReserva((prev) => ({ ...prev, [name]: value }));
    const mensajeError = validarCampoReserva(name, value, habSeleccionada);
    setErroresForm((prev) => ({ ...prev, [name]: mensajeError }));
  };

  const agregarRecargoSeleccionado = () => {
    if (!recargoSeleccionTemporal) return;
    const idRec = recargoSeleccionTemporal;
    if (formDataReserva.recargos_ids.includes(idRec)) return;

    setFormDataReserva(prev => ({
      ...prev,
      recargos_ids: [...prev.recargos_ids, idRec]
    }));
    setRecargoSeleccionTemporal('');
  };

  const removerRecargoSeleccionado = (idRec) => {
    setFormDataReserva(prev => ({
      ...prev,
      recargos_ids: prev.recargos_ids.filter(id => String(id) !== String(idRec))
    }));
  };

  const abrirModalCrearReserva = () => {
    setFormDataReserva(estadoInicialFormReserva);
    setRecargoSeleccionTemporal('');
    setErroresForm({});
    setModoModal('CREAR');
    setPasoFormulario('EDITANDO');
    setModalFormAbierto(true);
  };

  const abrirModalEditarReserva = (reserva) => {
    const recargosIdsArray = Array.isArray(reserva.recargos) ? reserva.recargos.map(r => r.id_recargo) : [];
    setFormDataReserva({
      codigo_reserva: reserva.codigo_reserva,
      id_huesped: reserva.id_huesped || '',
      codigo_habitacion: reserva.codigo_habitacion || '',
      id_usuario: reserva.id_usuario || 1,
      fecha_checkin: reserva.fecha_checkin ? reserva.fecha_checkin.split('T')[0] : '',
      fecha_checkout: reserva.fecha_checkout ? reserva.fecha_checkout.split('T')[0] : '',
      cantidad_huespedes: reserva.cantidad_huespedes || 1,
      estado: reserva.estado || 'PENDIENTE',
      recargos_ids: recargosIdsArray
    });
    setRecargoSeleccionTemporal('');
    setErroresForm({});
    setModoModal('EDITAR');
    setPasoFormulario('EDITANDO');
    setModalFormAbierto(true);
    if (modalDetalleAbierto) cerrarDetalle();
  };

  const cerrarModalFormulario = () => {
    if (guardando) return;
    setModalFormAbierto(false);
    setFormDataReserva(estadoInicialFormReserva);
    setErroresForm({});
    setPasoFormulario('EDITANDO');
  };

  const confirmarEliminacionReserva = (codigoReserva) => {
    if (modalDetalleAbierto) cerrarDetalle();
    setAlerta({
      abierto: true,
      tipo: 'confirmar',
      titulo: '¿Eliminar Reserva?',
      mensaje: `¿Estás seguro de eliminar la reserva N° ${codigoReserva}? Esta acción no se puede deshacer.`,
      accionConfirmar: () => eliminarReserva(codigoReserva),
      textoConfirmar: 'Sí, eliminar'
    });
  };

  const eliminarReserva = async (codigoReserva) => {
    try {
      const respuesta = await fetch(`${API_RESERVAS_URL}/${codigoReserva}`, { method: 'DELETE' });
      const data = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(data.mensaje || 'No se pudo eliminar la reserva.');

      cargarDatos();
      setAlerta({ abierto: true, tipo: 'exito', titulo: '¡Reserva Eliminada!', mensaje: 'La reserva fue eliminada con éxito.' });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error al Eliminar', mensaje: err.message });
    }
  };

  const pasarAConfirmacion = (e) => {
    e.preventDefault();
    const habSeleccionada = habitaciones.find(h => String(h.codigo_habitacion) === String(formDataReserva.codigo_habitacion));

    const erroresTemp = {};
    Object.keys(formDataReserva).forEach((key) => {
      if (key === 'recargos_ids') return;
      const err = validarCampoReserva(key, formDataReserva[key], habSeleccionada);
      if (err) erroresTemp[key] = err;
    });

    if (habSeleccionada && Number(formDataReserva.cantidad_huespedes) > Number(habSeleccionada.capacidad)) {
      erroresTemp.cantidad_huespedes = `Supera la capacidad máxima de la habitación (${habSeleccionada.capacidad} pers.).`;
    }

    if (Object.keys(erroresTemp).length > 0) {
      setErroresForm(erroresTemp);
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Formulario Incompleto', mensaje: 'Por favor, revise los campos marcados antes de continuar.' });
      return;
    }

    setPasoFormulario('CONFIRMANDO');
  };

  const enviarFormularioReservaFinal = async () => {
    setGuardando(true);
    const esCrear = modoModal === 'CREAR';
    const url = esCrear ? API_RESERVAS_URL : `${API_RESERVAS_URL}/${formDataReserva.codigo_reserva}`;
    const metodo = esCrear ? 'POST' : 'PUT';

    try {
      const payload = {
        ...formDataReserva,
        monto_pagado: finanzasForm.totalUSD
      };

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const datosRespuesta = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datosRespuesta.mensaje || 'Error al guardar la reserva.');

      cerrarModalFormulario();
      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: esCrear ? '¡Reserva Creada!' : '¡Reserva Actualizada!',
        mensaje: esCrear ? 'La reserva fue registrada correctamente.' : 'Datos actualizados con éxito.'
      });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error al Guardar', mensaje: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const abrirDetalle = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalDetalleAbierto(true);
  };

  const cerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setReservaSeleccionada(null);
  };

  const cambiarEstadoReserva = async (nuevoEstado) => {
    if (!reservaSeleccionada) return;
    try {
      const respuesta = await fetch(`${API_RESERVAS_URL}/${reservaSeleccionada.codigo_reserva}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.mensaje || 'No se pudo actualizar el estado.');

      await cargarDatos();
      cerrarDetalle();
      setAlerta({ abierto: true, tipo: 'exito', titulo: '¡Estado Actualizado!', mensaje: `La reserva ahora está ${nuevoEstado}.` });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error', mensaje: err.message });
    }
  };

  const reservasFiltradas = reservas.filter((r) => {
    const textoBusqueda = busqueda.trim().toLowerCase();
    const coincideCodigo = r.codigo_reserva?.toString().includes(textoBusqueda);
    const coincideHuesped = r.nombre_huesped?.toLowerCase().includes(textoBusqueda);
    const coincideHabitacion = r.codigo_habitacion?.toString().includes(textoBusqueda);
    const coincideEstado = filtroEstado === 'TODAS' || r.estado?.toUpperCase() === filtroEstado.toUpperCase();
    return (coincideCodigo || coincideHuesped || coincideHabitacion) && coincideEstado;
  });

  const huespedSeleccionadoObj = huespedes.find(h => String(h.id_huesped) === String(formDataReserva.id_huesped));
  const habitacionSeleccionadaObj = habitaciones.find(h => String(h.codigo_habitacion) === String(formDataReserva.codigo_habitacion));

  return (
    <section className="contenedor-reservas">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Gestión de Reservas</h1>
        <p className="subtitulo-vista">Control de estancias, check-in, check-out y asignación de habitaciones</p>
      </header>

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
              placeholder="Buscar por N° reserva, huésped o habitación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          <label className="caja-filtro">
            <select className="select-filtro" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="TODAS">Estado: Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="CHECKIN">Check-in</option>
              <option value="CHECKOUT">Check-out</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </label>
        </section>

        <section className="grupo-acciones-barra">
          <button type="button" className="boton-agregar" onClick={abrirModalCrearReserva}>
            <span>+ Nueva Reserva</span>
          </button>
        </section>
      </section>

      {cargando ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando reservas desde la base de datos...</p>
        </article>
      ) : errorTabla ? (
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarDatos} className="boton-reintentar-tabla">Reintentar</button>
        </aside>
      ) : (
        <article className="tarjeta-tabla-reservas">
          <table className="tabla-reservas">
            <thead>
              <tr>
                <th>N° Reserva</th>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Fechas</th>
                <th>Total (USD)</th>
                <th>Total (Bs)</th>
                <th>Estado</th>
                <th className="texto-derecha">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.length > 0 ? (
                reservasFiltradas.map((r) => {
                  const montoUsd = parseFloat(r.monto_pagado || 0);
                  const montoBs = montoUsd * bcvRate;
                  return (
                    <tr key={r.codigo_reserva}>
                      <td><strong className="codigo-reserva">#{r.codigo_reserva}</strong></td>
                      <td><span className="texto-destacado">{r.nombre_huesped || `Huésped ID: ${r.id_huesped}`}</span></td>
                      <td><span>Hab. {r.codigo_habitacion}</span></td>
                      <td><span style={{ fontSize: '0.8rem' }}>{r.fecha_checkin?.split('T')[0]} al {r.fecha_checkout?.split('T')[0]}</span></td>
                      <td><strong>{formatUSD(montoUsd)}</strong></td>
                      <td><span style={{ color: '#2563eb', fontWeight: 600 }}>{formatBs(montoBs)}</span></td>
                      <td><span className={`badge-estado-reserva badge-${r.estado?.toLowerCase()}`}>{r.estado}</span></td>
                      <td className="texto-derecha">
                        <nav className="grupo-acciones">
                          <button type="button" className="boton-accion" title="Ver Detalles" onClick={() => abrirDetalle(r)}>👁️</button>
                          <button type="button" className="boton-accion" title="Editar Reserva" onClick={() => abrirModalEditarReserva(r)}>✏️</button>
                          <button type="button" className="boton-accion peligro" title="Eliminar Reserva" onClick={() => confirmarEliminacionReserva(r.codigo_reserva)}>🗑️</button>
                        </nav>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="8" className="tabla-vacia" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No se encontraron reservas.</td></tr>
              )}
            </tbody>
          </table>
        </article>
      )}

      {modalFormAbierto && (
        <aside className="overlay-modal" onClick={cerrarModalFormulario}>
          <article className="contenido-modal" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                {pasoFormulario === 'EDITANDO' 
                  ? (modoModal === 'CREAR' ? 'Registrar Nueva Reserva' : `Editar Reserva N° ${formDataReserva.codigo_reserva}`)
                  : 'Verificar Desglose y Costos de Reserva'
                }
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalFormulario}>&times;</button>
            </header>

            {pasoFormulario === 'EDITANDO' ? (
              <form onSubmit={pasarAConfirmacion} className="formulario-huesped" noValidate>
                <fieldset className="grupo-campos" style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend className="leyenda-formulario">DETALLES DE LA ESTANCIA</legend>

                  <label className="campo medio" style={{ width: '100%' }}>
                    <span className="label-texto">Huésped *</span>
                    <select name="id_huesped" value={formDataReserva.id_huesped} onChange={manejarCambioFormulario}>
                      <option value="">Seleccione un huésped...</option>
                      {huespedes.map((h) => (<option key={h.id_huesped} value={h.id_huesped}>{h.nombre} ({h.correo || h.telefono})</option>))}
                    </select>
                    {erroresForm.id_huesped && <span className="texto-error-campo">{erroresForm.id_huesped}</span>}
                  </label>

                  <label className="campo medio" style={{ width: '100%' }}>
                    <span className="label-texto">Habitación *</span>
                    <select name="codigo_habitacion" value={formDataReserva.codigo_habitacion} onChange={manejarCambioFormulario}>
                      <option value="">Seleccione una habitación...</option>
                      {habitaciones.map((hab) => (
                        <option key={hab.codigo_habitacion} value={hab.codigo_habitacion}>
                          Hab. {hab.codigo_habitacion} - {hab.nombre_tipo || 'Estándar'} (${hab.precio_base || 120}/noche, Ocupación Base: {hab.ocupacion_base || 2}, Máx. {hab.capacidad} pers.)
                        </option>
                      ))}
                    </select>
                    {erroresForm.codigo_habitacion && <span className="texto-error-campo">{erroresForm.codigo_habitacion}</span>}
                  </label>

                  <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                    <label className="campo">
                      <span className="label-texto">Fecha Check-in *</span>
                      <input type="date" name="fecha_checkin" value={formDataReserva.fecha_checkin} onChange={manejarCambioFormulario} className={erroresForm.fecha_checkin ? 'input-error' : ''} />
                      {erroresForm.fecha_checkin && <span className="texto-error-campo">{erroresForm.fecha_checkin}</span>}
                    </label>

                    <label className="campo">
                      <span className="label-texto">Fecha Check-out *</span>
                      <input type="date" name="fecha_checkout" value={formDataReserva.fecha_checkout} onChange={manejarCambioFormulario} className={erroresForm.fecha_checkout ? 'input-error' : ''} />
                      {erroresForm.fecha_checkout && <span className="texto-error-campo">{erroresForm.fecha_checkout}</span>}
                    </label>
                  </section>

                  <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                    <label className="campo">
                      <span className="label-texto">Cantidad Huéspedes *</span>
                      <input type="number" name="cantidad_huespedes" min="1" value={formDataReserva.cantidad_huespedes} onChange={manejarCambioFormulario} className={erroresForm.cantidad_huespedes ? 'input-error' : ''} />
                      {erroresForm.cantidad_huespedes && <span className="texto-error-campo">{erroresForm.cantidad_huespedes}</span>}
                    </label>

                    <label className="campo">
                      <span className="label-texto">Agregar Recargos / Descuentos</span>
                      <section style={{ display: 'flex', gap: '0.4rem' }}>
                        <select value={recargoSeleccionTemporal} onChange={(e) => setRecargoSeleccionTemporal(e.target.value)} style={{ flex: 1 }}>
                          <option value="">Seleccionar recargo...</option>
                          {recargosDisponibles.map((rec) => (
                            <option key={rec.id_recargo} value={rec.id_recargo}>
                              {rec.motivo_recargo} ({rec.tipo_calculo === 'Suma' ? '+' : '-'}{rec.tipo_operacion?.toLowerCase() === 'porcentaje' ? `${rec.monto}%` : `$${rec.monto}`})
                            </option>
                          ))}
                        </select>
                        <button type="button" className="boton-agregar" onClick={agregarRecargoSeleccionado} style={{ padding: '0 0.75rem' }}>+</button>
                      </section>
                    </label>
                  </section>

                  {formDataReserva.recargos_ids.length > 0 && (
                    <section style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {formDataReserva.recargos_ids.map((idRec) => {
                        const recObj = recargosDisponibles.find(r => String(r.id_recargo) === String(idRec));
                        if (!recObj) return null;
                        return (
                          <span key={idRec} style={{ background: '#e2e8f0', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b' }}>
                            {recObj.motivo_recargo} ({recObj.tipo_calculo === 'Suma' ? '+' : '-'}{recObj.tipo_operacion?.toLowerCase() === 'porcentaje' ? `${recObj.monto}%` : `$${recObj.monto}`})
                            <button type="button" onClick={() => removerRecargoSeleccionado(idRec)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#dc2626' }}>&times;</button>
                          </span>
                        );
                      })}
                    </section>
                  )}
                </fieldset>

                <footer className="acciones-formulario" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', border: 'none', padding: 0 }}>
                  <button type="button" className="boton-cancelar" onClick={cerrarModalFormulario} disabled={guardando}>Cancelar</button>
                  <button type="submit" className="boton-guardar">Revisar Desglose y Continuar &rarr;</button>
                </footer>
              </form>
            ) : (
              /* PASO 2: PANTALLA DE CONFIRMACIÓN Y DESGLOSE DE COSTOS */
              <section className="formulario-huesped">
                <section style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Resumen de la Estancia</h3>
                  
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}>
                    <strong>Huésped:</strong> {huespedSeleccionadoObj?.nombre || 'N/A'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}>
                    <strong>Habitación:</strong> Hab. {formDataReserva.codigo_habitacion} ({habitacionSeleccionadaObj?.nombre_tipo || 'Estándar'})
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}>
                    <strong>Fechas:</strong> Del {formDataReserva.fecha_checkin} al {formDataReserva.fecha_checkout} ({finanzasForm.noches} noche(s))
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                    <strong>Huéspedes:</strong> {formDataReserva.cantidad_huespedes} persona(s)
                  </p>

                  <hr style={{ border: '0', borderTop: '1px solid #cbd5e1', margin: '0.75rem 0' }} />

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Desglose Financiero</h3>
                  
                  <section style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#64748b' }}>
                    <span>Tarifa base ({finanzasForm.noches} x {formatUSD(finanzasForm.precioBaseNoche)}):</span>
                    <strong>{formatUSD(finanzasForm.subtotalTarifaBase)}</strong>
                  </section>

                  {finanzasForm.huespedesExtra > 0 && (
                    <section style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#d97706' }}>
                      <span>Huéspedes extra ({finanzasForm.huespedesExtra}):</span>
                      <strong>+ {formatUSD(finanzasForm.costoExtraTotal)}</strong>
                    </section>
                  )}

                  {finanzasForm.listaRecargosAplicados.map((rec, idx) => (
                    <section key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: rec.tipo_calculo === 'Suma' ? '#dc2626' : '#16a34a' }}>
                      <span>{rec.motivo_recargo}:</span>
                      <strong>{rec.tipo_calculo === 'Suma' ? '+' : '-'}{formatUSD(Math.abs(rec.montoCalculado))}</strong>
                    </section>
                  ))}

                  <section style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#64748b' }}>
                    <span>IVA ({finanzasForm.ivaPorc}%):</span>
                    <strong>{formatUSD(finanzasForm.ivaUSD)}</strong>
                  </section>

                  <hr style={{ border: '0', borderTop: '1px solid #cbd5e1', margin: '0.75rem 0' }} />

                  <section style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    <span>Total a Pagar (USD):</span>
                    <span style={{ color: '#16a34a' }}>{formatUSD(finanzasForm.totalUSD)}</span>
                  </section>

                  <section style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, color: '#2563eb', marginTop: '0.3rem' }}>
                    <span>Total en Bs (BCV):</span>
                    <span>{formatBs(finanzasForm.totalBs)}</span>
                  </section>

                  <small style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>* Tasa BCV: 1 USD = {bcvRate.toFixed(2)} Bs</small>
                </section>

                <footer className="acciones-formulario" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'space-between', border: 'none', padding: 0 }}>
                  <button type="button" className="boton-cancelar" onClick={() => setPasoFormulario('EDITANDO')} disabled={guardando}>&larr; Volver a Editar</button>
                  <button type="button" className="boton-guardar" onClick={enviarFormularioReservaFinal} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Confirmar y Registrar Reserva'}
                  </button>
                </footer>
              </section>
            )}
          </article>
        </aside>
      )}

      {modalDetalleAbierto && reservaSeleccionada && (
        <aside className="overlay-modal" onClick={cerrarDetalle}>
          <article className="contenido-modal modal-detalle" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <hgroup className="titulo-modal-grupo">
                <h2 className="titulo-modal">Reserva N° #{reservaSeleccionada.codigo_reserva}</h2>
                <span className="subtitulo-modal-tipo">Registrada el {reservaSeleccionada.creado_en ? reservaSeleccionada.creado_en.split('T')[0] : 'N/A'}</span>
              </hgroup>
              <span className={`badge-estado-reserva badge-${reservaSeleccionada.estado?.toLowerCase()}`}>{reservaSeleccionada.estado}</span>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarDetalle}>&times;</button>
            </header>

            <section className="cuerpo-modal-detalle">
              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Información de la Estancia</h3>
                <section className="grid-info-tarjetas">
                  <article className="item-info-mini">
                    <span className="label-mini">Huésped</span>
                    <strong className="valor-mini">{reservaSeleccionada.nombre_huesped || `ID: ${reservaSeleccionada.id_huesped}`}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Habitación</span>
                    <strong className="valor-mini">Hab. {reservaSeleccionada.codigo_habitacion}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Check-in</span>
                    <strong className="valor-mini">{reservaSeleccionada.fecha_checkin ? reservaSeleccionada.fecha_checkin.split('T')[0] : 'N/A'}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Check-out</span>
                    <strong className="valor-mini">{reservaSeleccionada.fecha_checkout ? reservaSeleccionada.fecha_checkout.split('T')[0] : 'N/A'}</strong>
                  </article>
                </section>
                <article className="box-amenidades">
                  <span className="label-mini">Detalles Adicionales y Pagos</span>
                  <p className="texto-amenidades">Cantidad de Huéspedes: {reservaSeleccionada.cantidad_huespedes} persona(s)</p>
                  <p className="texto-amenidades">
                    Total: <strong>{formatUSD(reservaSeleccionada.monto_pagado)}</strong> ({formatBs(parseFloat(reservaSeleccionada.monto_pagado || 0) * bcvRate)})
                  </p>
                </article>
              </section>
            </section>

            <footer className="acciones-modal-detalle">
              <button type="button" className="boton-cancelar" onClick={cerrarDetalle}>Cerrar</button>
              <nav className="grupo-botones-derecha">
                <button type="button" className="boton-alerta-reintentar boton-eliminar-detalle" onClick={() => confirmarEliminacionReserva(reservaSeleccionada.codigo_reserva)}>Eliminar</button>
                <button type="button" className="boton-secundario-barra" onClick={() => abrirModalEditarReserva(reservaSeleccionada)}>Editar</button>
                {reservaSeleccionada.estado === 'PENDIENTE' && <button type="button" className="boton-agregar" onClick={() => cambiarEstadoReserva('CONFIRMADA')}>Confirmar</button>}
                {reservaSeleccionada.estado === 'CONFIRMADA' && <button type="button" className="boton-agregar" onClick={() => cambiarEstadoReserva('CHECKIN')}>Check-in</button>}
                {reservaSeleccionada.estado === 'CHECKIN' && <button type="button" className="boton-alerta-reintentar" onClick={() => cambiarEstadoReserva('CHECKOUT')}>Check-out</button>}
              </nav>
            </footer>
          </article>
        </aside>
      )}

      {alerta.abierto && (
        <aside className="overlay-modal z-alto" onClick={(e) => e.stopPropagation()}>
          <article className="modal-alerta-tarjeta">
            <header className={`icono-alerta-circulo ${alerta.tipo}`}>
              {alerta.tipo === 'exito' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
              {alerta.tipo === 'error' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
              {alerta.tipo === 'confirmar' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
            </header>
            <h3 className="titulo-alerta">{alerta.titulo}</h3>
            <p className="mensaje-alerta">{alerta.mensaje}</p>
            <footer className="acciones-alerta">
              {alerta.tipo === 'confirmar' ? (
                <nav className="grupo-botones-alerta-confirmar">
                  <button type="button" className="boton-alerta-secundario" onClick={() => setAlerta((prev) => ({ ...prev, abierto: false }))}>Cancelar</button>
                  <button type="button" className="boton-alerta-peligro" onClick={() => { const accion = alerta.accionConfirmar; setAlerta((prev) => ({ ...prev, abierto: false })); if (accion) accion(); }}>{alerta.textoConfirmar || 'Eliminar'}</button>
                </nav>
              ) : (
                <button type="button" className="boton-alerta-primario" onClick={() => setAlerta((prev) => ({ ...prev, abierto: false }))}>Aceptar</button>
              )}
            </footer>
          </article>
        </aside>
      )}
    </section>
  );
}