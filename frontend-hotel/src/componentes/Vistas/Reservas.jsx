import React, { useState, useEffect } from 'react';
import '../../estilos/reservas.css';
import '../../estilos/habitaciones.css';

const API_RESERVAS_URL = 'http://localhost:3000/api/reservas';
const API_RESERVAS_TELEGRAM_URL = 'http://localhost:3000/api/reservas/telegram';
const API_HUESPEDES_URL = 'http://localhost:3000/api/huespedes';
const API_HABITACIONES_URL = 'http://localhost:3000/api/habitaciones';
const API_RECARGOS_URL = 'http://localhost:3000/api/recargos';
const API_TEMPORADAS_URL = 'http://localhost:3000/api/tarifas/temporadas';
const API_TARIFAS_URL = 'http://localhost:3000/api/tarifas';
const API_TASA_BCV_URL = 'http://localhost:3000/api/tarifas/tasa-bcv';

export default function Reservas() {
  const [pestannaActiva, setPestannaActiva] = useState('RESERVAS');

  const [reservas, setReservas] = useState([]);
  const [reservasTelegram, setReservasTelegram] = useState([]);
  const [huespedes, setHuespedes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [recargosDisponibles, setRecargosDisponibles] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [tarifasCatalogo, setTarifasCatalogo] = useState([]);
  const [bcvRate, setBcvRate] = useState(875.65);
  const [personalizarMensaje, setPersonalizarMensaje] = useState(false);
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');

  const [cargando, setCargando] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  // --- NUEVOS ESTADOS PARA CHECK-IN Y REGISTRO DIRECTO ---
  const [modalCheckinAbierto, setModalCheckinAbierto] = useState(false);
  const [reservaParaCheckin, setReservaParaCheckin] = useState(null);
  const [formDataCheckin, setFormDataCheckin] = useState({
    cantidad_acompanantes: 0,
    cantidad_maletas: 0,
    observaciones: ''
  });

  const [modalRegistroDirectoAbierto, setModalRegistroDirectoAbierto] = useState(false);
  const [pasoDirecto, setPasoDirecto] = useState('EDITANDO');
  const [formDataDirecto, setFormDataDirecto] = useState({
    id_huesped: '',
    codigo_habitacion: '',
    fecha_checkin: new Date().toISOString().split('T')[0],
    fecha_checkout: '',
    cantidad_huespedes: 1,
    cantidad_maletas: 0,
    observaciones: '',
    recargos_ids: []
  });
  const [recargoDirectoTemporal, setRecargoDirectoTemporal] = useState('');

  const [reservaTelegramSeleccionada, setReservaTelegramSeleccionada] = useState(null);
  const [modalTelegramAbierto, setModalTelegramAbierto] = useState(false);
  const [mensajeNotificacionBot, setMensajeNotificacionBot] = useState('');
  const [enviandoMensajeBot, setEnviandoMensajeBot] = useState(false);

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR');
  const [pasoFormulario, setPasoFormulario] = useState('EDITANDO');
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
      const [respReservas, respTelegram, respHuespedes, respHabitaciones, respRecargos, respTemporadas, respTarifas, respBcv] = await Promise.all([
        fetch(API_RESERVAS_URL).catch(() => ({ ok: false })),
        fetch(API_RESERVAS_TELEGRAM_URL).catch(() => ({ ok: false })),
        fetch(API_HUESPEDES_URL).catch(() => ({ ok: false })),
        fetch(API_HABITACIONES_URL).catch(() => ({ ok: false })),
        fetch(API_RECARGOS_URL).catch(() => ({ ok: false })),
        fetch(API_TEMPORADAS_URL).catch(() => ({ ok: false })),
        fetch(API_TARIFAS_URL).catch(() => ({ ok: false })),
        fetch(API_TASA_BCV_URL).catch(() => ({ ok: false }))
      ]);

      if (respReservas.ok) {
        const datosReservas = await respReservas.json();
        setReservas(Array.isArray(datosReservas) ? datosReservas : []);
      }

      if (respTelegram.ok) {
        const datosTelegram = await respTelegram.json();
        setReservasTelegram(Array.isArray(datosTelegram) ? datosTelegram : []);
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

      if (respTemporadas.ok) {
        const datosTemp = await respTemporadas.json();
        setTemporadas(Array.isArray(datosTemp) ? datosTemp : []);
      }

      if (respTarifas.ok) {
        const datosTarifas = await respTarifas.json();
        setTarifasCatalogo(Array.isArray(datosTarifas) ? datosTarifas : []);
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

  const abrirModalRegistroDirecto = () => {
    setFormDataDirecto({
      id_huesped: '',
      codigo_habitacion: '',
      fecha_checkin: new Date().toISOString().split('T')[0],
      fecha_checkout: '',
      cantidad_huespedes: 1,
      cantidad_maletas: 0,
      observaciones: '',
      recargos_ids: []
    });
    setRecargoDirectoTemporal('');
    setPasoDirecto('EDITANDO');
    setModalRegistroDirectoAbierto(true);
  };

  const agregarRecargoDirecto = () => {
    if (!recargoDirectoTemporal) return;
    if (formDataDirecto.recargos_ids.includes(recargoDirectoTemporal)) return;

    setFormDataDirecto((prev) => ({
      ...prev,
      recargos_ids: [...prev.recargos_ids, recargoDirectoTemporal]
    }));
    setRecargoDirectoTemporal('');
  };

  const removerRecargoDirecto = (idRec) => {
    setFormDataDirecto((prev) => ({
      ...prev,
      recargos_ids: prev.recargos_ids.filter((id) => String(id) !== String(idRec))
    }));
  };

  const abrirModalCheckin = (reserva) => {
    setReservaParaCheckin(reserva);
    const cantHuespedes = parseInt(reserva.cantidad_huespedes || 1);
    setFormDataCheckin({
      cantidad_acompanantes: Math.max(0, cantHuespedes - 1),
      cantidad_maletas: 0,
      observaciones: ''
    });
    if (modalDetalleAbierto) cerrarDetalle();
    setModalCheckinAbierto(true);
  };

  const calcularDetalleFinanciero = (formData) => {
    const habitacionSeleccionada = habitaciones.find(
      (h) => String(h.codigo_habitacion) === String(formData.codigo_habitacion)
    );

    let precioBaseNoche = parseFloat(habitacionSeleccionada?.precio_base || 120);
    let ocupacionBase = habitacionSeleccionada?.ocupacion_base !== undefined && habitacionSeleccionada?.ocupacion_base !== null
      ? parseInt(habitacionSeleccionada.ocupacion_base)
      : 2;
    let cargoHuespedAdicional = parseFloat(habitacionSeleccionada?.huesped_adicional || 15);
    let ivaPorc = parseFloat(habitacionSeleccionada?.iva || 16);
    let temporadaAplicadaNombre = 'Temporada normal (Base)';

    if (formData.fecha_checkin && habitacionSeleccionada) {
      const [yearCheckin, monthCheckin, dayCheckin] = formData.fecha_checkin.split('-').map(Number);
      const fechaCheckinReal = new Date(Date.UTC(yearCheckin, monthCheckin - 1, dayCheckin));

      const temporadaEncontrada = temporadas.find((temp) => {
        if (!temp.fecha_inicio || !temp.fecha_fin || temp.fecha_inicio === 'N/A' || temp.fecha_fin === 'N/A') {
          return false;
        }

        const [mIni, dIni] = temp.fecha_inicio.split('-').map(Number);
        const [mFin, dFin] = temp.fecha_fin.split('-').map(Number);

        if (!mIni || !dIni || !mFin || !dFin) return false;

        let fechaInicioTemp = new Date(Date.UTC(yearCheckin, mIni - 1, dIni));
        let fechaFinTemp = new Date(Date.UTC(yearCheckin, mFin - 1, dFin));

        if (mIni > mFin) {
          if (monthCheckin >= mIni) {
            fechaFinTemp = new Date(Date.UTC(yearCheckin + 1, mFin - 1, dFin));
          } else {
            fechaInicioTemp = new Date(Date.UTC(yearCheckin - 1, mIni - 1, dIni));
          }
        }

        return fechaCheckinReal >= fechaInicioTemp && fechaCheckinReal <= fechaFinTemp;
      });

      let idTemporadaObjetivo = null;

      if (temporadaEncontrada) {
        temporadaAplicadaNombre = temporadaEncontrada.nombre_temporada;
        idTemporadaObjetivo = temporadaEncontrada.id_temporada;
      } else {
        const temporadaNormal = temporadas.find((t) =>
          t.fecha_inicio === 'N/A' ||
          t.nombre_temporada.toLowerCase().includes('temporada normal') ||
          t.nombre_temporada.toLowerCase().includes('baja')
        );
        if (temporadaNormal) {
          temporadaAplicadaNombre = temporadaNormal.nombre_temporada;
          idTemporadaObjetivo = temporadaNormal.id_temporada;
        }
      }

      if (idTemporadaObjetivo) {
        const tarifaCoincidente = tarifasCatalogo.find((t) => {
          const matchTipo = String(t.id_tipo_habitacion) === String(habitacionSeleccionada.id_tipo_habitacion);
          const matchEstado = t.estado?.toLowerCase() === 'activa';
          const matchTemp = Array.isArray(t.id_temporadas)
            ? t.id_temporadas.some(idT => String(idT) === String(idTemporadaObjetivo))
            : String(t.id_temporada) === String(idTemporadaObjetivo);

          return matchTipo && matchEstado && matchTemp;
        });

        if (tarifaCoincidente) {
          precioBaseNoche = parseFloat(tarifaCoincidente.precio_base || precioBaseNoche);
          ocupacionBase = parseInt(tarifaCoincidente.ocupacion_base || ocupacionBase);
          cargoHuespedAdicional = parseFloat(tarifaCoincidente.huesped_adicional || cargoHuespedAdicional);
          ivaPorc = parseFloat(tarifaCoincidente.iva || ivaPorc);
        } else {
          const tarifaGenerica = tarifasCatalogo.find((t) =>
            String(t.id_tipo_habitacion) === String(habitacionSeleccionada.id_tipo_habitacion) &&
            t.estado?.toLowerCase() === 'activa'
          );
          if (tarifaGenerica) {
            precioBaseNoche = parseFloat(tarifaGenerica.precio_base || precioBaseNoche);
            ocupacionBase = parseInt(tarifaGenerica.ocupacion_base || ocupacionBase);
            cargoHuespedAdicional = parseFloat(tarifaGenerica.huesped_adicional || cargoHuespedAdicional);
            ivaPorc = parseFloat(tarifaGenerica.iva || ivaPorc);
          }
        }
      }
    }

    let noches = 1;
    if (formData.fecha_checkin && formData.fecha_checkout) {
      const fIn = new Date(formData.fecha_checkin + 'T00:00:00');
      const fOut = new Date(formData.fecha_checkout + 'T00:00:00');

      if (!isNaN(fIn.getTime()) && !isNaN(fOut.getTime())) {
        const diffMs = fOut.getTime() - fIn.getTime();
        const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDias > 0) noches = diffDias;
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

          let montoItem = tipoOp.includes('porcentaje') ? subtotalAlojamiento * (val / 100) : val;
          if (tipoCalc.includes('resta') || tipoCalc.includes('descuento')) montoItem = -montoItem;

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
      totalBs,
      temporadaAplicadaNombre
    };
  };

  const finanzasForm = calcularDetalleFinanciero(formDataReserva);
  const finanzasDirecto = calcularDetalleFinanciero(formDataDirecto);
  const huespedDirectoObj = huespedes.find((h) => String(h.id_huesped) === String(formDataDirecto.id_huesped));

  const formatUSD = (val) => '$ ' + (parseFloat(val) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (val) => 'Bs ' + (parseFloat(val) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cerrarModalCheckin = () => {
    setModalCheckinAbierto(false);
    setReservaParaCheckin(null);
  };

  const manejarCambioCheckin = (e) => {
    const { name, value } = e.target;
    setFormDataCheckin((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCheckinFinal = async (e) => {
    e.preventDefault();
    if (!reservaParaCheckin) return;

    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      // Preparado para el backend: Guardará el registro en la tabla checkin y actualizará la reserva a CHECKIN
      const payload = {
        codigo_reserva: reservaParaCheckin.codigo_reserva,
        id_usuario: idUsuarioActual,
        ...formDataCheckin
      };

      // Simulación de envío al futuro endpoint de check-in / backend
      console.log('Datos de check-in a registrar:', payload);

      // Cambiamos el estado de la reserva a CHECKIN y registramos el check-in
      const respuesta = await fetch(`http://localhost:3000/api/reservas/${reservaParaCheckin.codigo_reserva}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'CHECKIN', id_usuario: idUsuarioActual })
      });

      if (!respuesta.ok) throw new Error('No se pudo completar el check-in.');

      await cargarDatos();
      cerrarModalCheckin();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Check-in Realizado!',
        mensaje: `El check-in de la reserva N° ${reservaParaCheckin.codigo_reserva} se guardó con éxito y la habitación pasó a estado Ocupada.`
      });
    } catch (error) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error en Check-in', mensaje: error.message });
    }
  };

  const cerrarModalRegistroDirecto = () => {
    setModalRegistroDirectoAbierto(false);
  };

  const manejarCambioDirecto = (e) => {
    const { name, value } = e.target;
    setFormDataDirecto((prev) => ({ ...prev, [name]: value }));
  };

  const guardarRegistroDirectoFinal = async (e) => {
    e.preventDefault();
    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      // Ahora enviamos el monto calculado y los recargos correspondientes a la BD
      const payload = {
        id_huesped: formDataDirecto.id_huesped,
        codigo_habitacion: formDataDirecto.codigo_habitacion,
        id_usuario: idUsuarioActual,
        fecha_checkin: formDataDirecto.fecha_checkin,
        fecha_checkout: formDataDirecto.fecha_checkout,
        cantidad_huespedes: formDataDirecto.cantidad_huespedes,
        estado: 'CHECKIN',
        cantidad_maletas: formDataDirecto.cantidad_maletas,
        observaciones: formDataDirecto.observaciones,
        monto_pagado: finanzasDirecto.totalUSD, // <--- Aquí se envía el total calculado del resumen
        recargos_ids: formDataDirecto.recargos_ids // <--- Se envían los recargos seleccionados
      };

      const respuesta = await fetch(API_RESERVAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.mensaje || 'Error al registrar la llegada directa.');

      await cargarDatos();
      cerrarModalRegistroDirecto();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Llegada y Check-in Registrados!',
        mensaje: 'Se creó la reserva con su monto respectivo y se ejecutó el check-in correctamente.'
      });
    } catch (error) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error', mensaje: error.message });
    }
  };

  const validarCampoReserva = (nombre, valor, habSeleccionada = null) => {
    let error = '';
    const hoyStr = new Date().toISOString().split('T')[0];

    if (nombre === 'id_huesped' && !valor) error = 'Debe seleccionar un huésped.';
    if (nombre === 'codigo_habitacion' && !valor) error = 'Debe seleccionar una habitación.';

    if (nombre === 'fecha_checkin') {
      if (!valor) error = 'La fecha de check-in es obligatoria.';
      else if (valor < hoyStr) error = 'La fecha de entrada no puede ser una fecha pasada.';
    }

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
    setGuardando(false);
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
    setGuardando(false);
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
    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      const respuesta = await fetch(`${API_RESERVAS_URL}/${codigoReserva}?id_usuario=${idUsuarioActual}`, { method: 'DELETE' });
      const data = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(data.mensaje || 'No se pudo eliminar la reserva.');

      cargarDatos();
      setAlerta({ abierto: true, tipo: 'exito', titulo: '¡Reserva Eliminada!', mensaje: 'La reserva fue eliminada con éxito.' });
    } catch (err) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error al Eliminar', mensaje: err.message });
    }
  };

  const pasarAConfirmacion = (e) => {
    if (e) e.preventDefault();
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

  const enviarFormularioReservaFinal = async (e) => {
    if (e) e.preventDefault();
    if (guardando) return;

    setGuardando(true);

    const esCrear = modoModal === 'CREAR';
    const url = esCrear ? API_RESERVAS_URL : `${API_RESERVAS_URL}/${formDataReserva.codigo_reserva}`;
    const metodo = esCrear ? 'POST' : 'PUT';
    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      const payload = {
        ...formDataReserva,
        monto_pagado: finanzasForm.totalUSD,
        id_usuario: idUsuarioActual
      };

      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const datosRespuesta = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datosRespuesta.mensaje || 'Error al guardar la reserva.');

      setModalFormAbierto(false);
      setFormDataReserva(estadoInicialFormReserva);
      setPasoFormulario('EDITANDO');
      await cargarDatos();

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

  const cambiarEstadoReservaTelegram = async (nuevoEstado) => {
    if (!reservaTelegramSeleccionada) return;
    const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
    const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

    try {
      const payload = {
        estado: nuevoEstado,
        id_usuario: idUsuarioActual
      };

      if (personalizarMensaje && mensajePersonalizado.trim()) {
        payload.mensaje_personalizado = mensajePersonalizado.trim();
      }

      const respuesta = await fetch(`${API_RESERVAS_URL}/${reservaTelegramSeleccionada.codigo_reserva}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(datos.mensaje || 'Error al actualizar estado.');

      await cargarDatos();
      cerrarModalTelegram();
      setAlerta({ abierto: true, tipo: 'exito', titulo: '¡Estado Actualizado!', mensaje: `Reserva actualizada a ${nuevoEstado}, mensaje enviado y trasladada al panel normal.` });
    } catch (error) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error', mensaje: error.message });
    }
  };

  const abrirModalTelegram = (reserva) => {
    setReservaTelegramSeleccionada(reserva);
    setModalTelegramAbierto(true);
  };

  const cerrarModalTelegram = () => {
    setModalTelegramAbierto(false);
    setReservaTelegramSeleccionada(null);
    setPersonalizarMensaje(false);
    setMensajePersonalizado('');
  };

  const enviarNotificacionManualBot = async (evento) => {
    evento.preventDefault();
    if (!mensajeNotificacionBot.trim() || !reservaTelegramSeleccionada) return;

    setEnviandoMensajeBot(true);
    try {
      const respuesta = await fetch(`${API_RESERVAS_TELEGRAM_URL}/${reservaTelegramSeleccionada.codigo_reserva}/notificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: mensajeNotificacionBot.trim() })
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.mensaje || 'Error al enviar notificación.');

      await cargarDatos();
      setMensajeNotificacionBot('');
      setAlerta({ abierto: true, tipo: 'exito', titulo: 'Mensaje Transmitido', mensaje: 'La notificación fue enviada con éxito al chat de Telegram.' });
    } catch (error) {
      setAlerta({ abierto: true, tipo: 'error', titulo: 'Error de Transmisión', mensaje: error.message });
    } finally {
      setEnviandoMensajeBot(false);
    }
  };

  const reservasFiltradas = reservas.filter((r) => {
    const textoBusqueda = busqueda.trim().toLowerCase();
    const coincideCodigo = r.codigo_reserva?.toString().includes(textoBusqueda);
    const coincideHuesped = r.nombre_huesped?.toLowerCase().includes(textoBusqueda);
    const coincideHabitacion = r.codigo_habitacion?.toString().includes(textoBusqueda);
    const coincideEstado = filtroEstado === 'TODAS' || r.estado?.toUpperCase() === filtroEstado.toUpperCase();

    let coincideFechas = true;
    const checkinReserva = r.fecha_checkin ? r.fecha_checkin.split('T')[0] : '';
    const checkoutReserva = r.fecha_checkout ? r.fecha_checkout.split('T')[0] : '';

    if (filtroFechaInicio && filtroFechaFin) {

      coincideFechas = checkinReserva <= filtroFechaFin && checkoutReserva >= filtroFechaInicio;
    } else if (filtroFechaInicio) {
      coincideFechas = checkinReserva >= filtroFechaInicio;
    } else if (filtroFechaFin) {
      coincideFechas = checkoutReserva <= filtroFechaFin;
    }

    return (coincideCodigo || coincideHuesped || coincideHabitacion) && coincideEstado && coincideFechas;
  });

  const reservasTelegramFiltradas = reservasTelegram.filter((r) => {
    const textoBusqueda = busqueda.trim().toLowerCase();
    const coincideCodigo = r.codigo_reserva?.toString().includes(textoBusqueda);
    const coincideHuesped = r.nombre_huesped?.toLowerCase().includes(textoBusqueda);
    const coincideUsuario = r.usuario_telegram?.toLowerCase().includes(textoBusqueda);
    const coincideEstado = filtroEstado === 'TODAS' || r.estado?.toUpperCase() === filtroEstado.toUpperCase();
    return (coincideCodigo || coincideHuesped || coincideUsuario) && coincideEstado;
  });

  const huespedSeleccionadoObj = huespedes.find(h => String(h.id_huesped) === String(formDataReserva.id_huesped));
  const habitacionSeleccionadaObj = habitaciones.find(h => String(h.codigo_habitacion) === String(formDataReserva.codigo_habitacion));

  return (
    <section className="contenedor-reservas">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Gestión de Reservas</h1>
        <p className="subtitulo-vista">Control de estancias, reservas hoteleras y canal de Telegram</p>
      </header>

      {/* Pestañas de Navegación del Módulo (idéntico al estilo de Habitaciones.jsx) */}
      <nav className="pestañas-navegacion">
        <button
          type="button"
          className={`boton-pestanna ${pestannaActiva === 'RESERVAS' ? 'activa' : ''}`}
          onClick={() => setPestannaActiva('RESERVAS')}
        >
          Todas las Reservas
        </button>
        <button
          type="button"
          className={`boton-pestanna ${pestannaActiva === 'TELEGRAM' ? 'activa' : ''}`}
          onClick={() => setPestannaActiva('TELEGRAM')}
        >
          Reservas Vía Telegram Bot {reservasTelegram.length > 0 && `(${reservasTelegram.length})`}
        </button>
      </nav>

      <section className="barra-herramientas barra-herramientas-reservas">
        {/* Fila 1: Búsqueda, Estado y Botón de Nueva Reserva */}
        <section className="grupo-controles grupo-controles-reservas">
          <label className="caja-busqueda caja-busqueda-reservas">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input
              type="search"
              className="input-busqueda"
              placeholder={pestannaActiva === 'RESERVAS' ? "Buscar por N° reserva, huésped o habitación..." : "Buscar por usuario de Telegram o huésped..."}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          <div className="contenedor-select-reservas">
            <select className="select-filtro" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="TODAS">Estado: Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="CHECKIN">Check-in</option>
              <option value="CHECKOUT">Check-out</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>
        </section>

        {/* Fila 2: Rango de Fechas y Botones de Acción */}
        <section className="fila-inferior-reservas">
          <div className="contenedor-fechas-reservas">
            <span className="etiqueta-rango-fechas">Rango de Fechas (Check-in):</span>

            <label className="label-fecha-reservas">
              <span>Desde:</span>
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="input-fecha-reservas"
              />
            </label>

            <label className="label-fecha-reservas">
              <span>Hasta:</span>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="input-fecha-reservas"
              />
            </label>
          </div>

          <div className="contenedor-botones-reservas">
            {(filtroFechaInicio || filtroFechaFin || busqueda || filtroEstado !== 'TODAS') && (
              <button
                type="button"
                onClick={() => { setFiltroFechaInicio(''); setFiltroFechaFin(''); setBusqueda(''); setFiltroEstado('TODAS'); }}
                className="boton-limpiar-filtros-reserva"
              >
                Limpiar Filtros
              </button>
            )}

            {pestannaActiva === 'RESERVAS' && (
              <nav className="grupo-botones-acciones-reserva">
                <button type="button" className="boton-secundario-barra" onClick={abrirModalRegistroDirecto}>
                  <span>Registrar Llegada Directa</span>
                </button>
                <button type="button" className="boton-agregar" onClick={abrirModalCrearReserva}>
                  <span>+ Nueva Reserva</span>
                </button>
              </nav>
            )}
          </div>
        </section>
      </section>

      {cargando ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando información desde la base de datos...</p>
        </article>
      ) : errorTabla ? (
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarDatos} className="boton-reintentar-tabla">Reintentar</button>
        </aside>
      ) : pestannaActiva === 'RESERVAS' ? (
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
      ) : (
        /* PESTAÑA TELEGRAM CONECTADA A BD */
        <article className="tarjeta-tabla-reservas">
          <table className="tabla-reservas">
            <thead>
              <tr>
                <th>N° Reserva</th>
                <th>Huésped / Telegram</th>
                <th>Habitación</th>
                <th>Fechas</th>
                <th>Total (USD)</th>
                <th>Estado</th>
                <th className="texto-derecha">Gestión Bot</th>
              </tr>
            </thead>
            <tbody>
              {reservasTelegramFiltradas.length > 0 ? (
                reservasTelegramFiltradas.map((reserva) => (
                  <tr key={reserva.codigo_reserva}>
                    <td><strong className="codigo-reserva">#{reserva.codigo_reserva}</strong></td>
                    <td>
                      <strong className="texto-destacado">{reserva.nombre_huesped}</strong>
                      <p style={{ fontSize: '0.8rem', color: '#2563eb', margin: 0 }}>{reserva.usuario_telegram}</p>
                    </td>
                    <td>Hab. {reserva.codigo_habitacion}</td>
                    <td><span style={{ fontSize: '0.8rem' }}>{reserva.fecha_checkin?.split('T')[0]} al {reserva.fecha_checkout?.split('T')[0]}</span></td>
                    <td><strong>{formatUSD(reserva.monto_pagado)}</strong></td>
                    <td><span className={`badge-estado-reserva badge-${reserva.estado?.toLowerCase()}`}>{reserva.estado}</span></td>
                    <td className="texto-derecha">
                      <button
                        type="button"
                        className="boton-guardar"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => abrirModalTelegram(reserva)}
                      >
                        Gestionar y Notificar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="tabla-vacia" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No hay reservas registradas desde Telegram en la base de datos.</td></tr>
              )}
            </tbody>
          </table>
        </article>
      )}

      {/* MODAL CREAR / EDITAR RESERVA */}
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
                          Hab. {hab.codigo_habitacion} - {hab.nombre_tipo || 'Estándar'} (Máx. {hab.capacidad} pers.)
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
                </fieldset>

                <footer className="acciones-formulario" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', border: 'none', padding: 0 }}>
                  <button type="button" className="boton-cancelar" onClick={cerrarModalFormulario} disabled={guardando}>Cancelar</button>
                  <button type="submit" className="boton-guardar">Revisar Desglose y Continuar &rarr;</button>
                </footer>
              </form>
            ) : (
              <div className="formulario-huesped">
                <section style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Resumen de la Estancia</h3>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}><strong>Huésped:</strong> {huespedSeleccionadoObj?.nombre || 'N/A'}</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}><strong>Habitación:</strong> Hab. {formDataReserva.codigo_habitacion}</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem' }}><strong>Fechas:</strong> Del {formDataReserva.fecha_checkin} al {formDataReserva.fecha_checkout} ({finanzasForm.noches} noche(s))</p>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}><strong>Total a Pagar (USD):</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{formatUSD(finanzasForm.totalUSD)}</span></p>
                </section>

                <footer className="acciones-formulario" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'space-between', border: 'none', padding: 0 }}>
                  <button type="button" className="boton-cancelar" onClick={() => setPasoFormulario('EDITANDO')} disabled={guardando}>&larr; Volver</button>
                  <button type="button" className="boton-guardar" onClick={enviarFormularioReservaFinal} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Confirmar y Registrar Reserva'}
                  </button>
                </footer>
              </div>
            )}
          </article>
        </aside>
      )}

      {/* MODAL DE GESTIÓN Y NOTIFICACIÓN TELEGRAM */}
      {modalTelegramAbierto && reservaTelegramSeleccionada && (
        <aside className="overlay-modal" onClick={cerrarModalTelegram}>
          <article className="contenido-modal modal-detalle modal-telegram-ancho" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <hgroup className="titulo-modal-grupo">
                <h2 className="titulo-modal">Reserva Bot N° #{reservaTelegramSeleccionada.codigo_reserva}</h2>
                <span className="subtitulo-modal-tipo">Telegram: {reservaTelegramSeleccionada.usuario_telegram}</span>
              </hgroup>
              <span className={`badge-estado-reserva badge-${reservaTelegramSeleccionada.estado?.toLowerCase()}`}>{reservaTelegramSeleccionada.estado}</span>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalTelegram}>&times;</button>
            </header>

            <section className="cuerpo-modal-detalle cuerpo-modal-telegram">
              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Detalles del Huésped y Estancia</h3>
                <section className="grid-info-tarjetas">
                  <article className="item-info-mini">
                    <span className="label-mini">Huésped</span>
                    <strong className="valor-mini">{reservaTelegramSeleccionada.nombre_huesped}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Habitación</span>
                    <strong className="valor-mini">Hab. {reservaTelegramSeleccionada.codigo_habitacion}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Fechas</span>
                    <strong className="valor-mini">{reservaTelegramSeleccionada.fecha_checkin?.split('T')[0]} al {reservaTelegramSeleccionada.fecha_checkout?.split('T')[0]}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Monto</span>
                    <strong className="valor-mini">{formatUSD(reservaTelegramSeleccionada.monto_pagado)}</strong>
                  </article>
                </section>
              </section>

              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Configuración de Mensaje</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={personalizarMensaje}
                    onChange={(e) => setPersonalizarMensaje(e.target.checked)}
                  />
                  Personalizar mensaje para el chat
                </label>

                {personalizarMensaje && (
                  <textarea
                    rows="2"
                    className="textarea-notificacion"
                    placeholder="Escribe el mensaje personalizado..."
                    value={mensajePersonalizado}
                    onChange={(e) => setMensajePersonalizado(e.target.value)}
                  />
                )}
              </section>

              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Acciones de la Reserva</h3>
                <div className="grupo-acciones-modal-telegram">
                  <button
                    type="button"
                    className="boton-guardar"
                    onClick={() => cambiarEstadoReservaTelegram('CONFIRMADA')}
                  >
                    Confirmar Reserva
                  </button>
                  <button
                    type="button"
                    className="boton-alerta-reintentar"
                    onClick={() => cambiarEstadoReservaTelegram('CANCELADA')}
                  >
                    Cancelar Reserva
                  </button>
                </div>
              </section>
            </section>

            <footer className="acciones-modal-detalle">
              <button type="button" className="boton-cancelar" onClick={cerrarModalTelegram}>Cerrar</button>
            </footer>
          </article>
        </aside>
      )}

      {/* MODAL DETALLE ESTÁNDAR */}
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
                {reservaSeleccionada.estado === 'CONFIRMADA' && (
                  <button type="button" className="boton-agregar" onClick={() => abrirModalCheckin(reservaSeleccionada)}>
                    Realizar Check-in
                  </button>
                )}
                {reservaSeleccionada.estado === 'CHECKIN' && <button type="button" className="boton-alerta-reintentar" onClick={() => cambiarEstadoReserva('CHECKOUT')}>Check-out</button>}
              </nav>
            </footer>
          </article>
        </aside>
      )}

      {/* MODAL DE ALERTAS GENERALES */}
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

      {/* MODAL DE REGISTRO DE CHECK-IN */}
      {modalCheckinAbierto && reservaParaCheckin && (
        <aside className="overlay-modal" onClick={cerrarModalCheckin}>
          <article className="contenido-modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">Realizar Check-in (Reserva N° #{reservaParaCheckin.codigo_reserva})</h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalCheckin}>&times;</button>
            </header>

            <form onSubmit={guardarCheckinFinal} className="formulario-huesped" noValidate>
              <fieldset className="grupo-campos" style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend className="leyenda-formulario">DATOS DE ENTRADA Y EQUIPAJE</legend>

                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                  <strong>Huésped:</strong> {reservaParaCheckin.nombre_huesped} | <strong>Habitación:</strong> Hab. {reservaParaCheckin.codigo_habitacion}
                </p>

                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                  <label className="campo">
                    <span className="label-texto">Cantidad de Acompañantes</span>
                    <input type="number" min="0" name="cantidad_acompanantes" value={formDataCheckin.cantidad_acompanantes} onChange={manejarCambioCheckin} />
                  </label>

                  <label className="campo">
                    <span className="label-texto">Cantidad de Maletas</span>
                    <input type="number" min="0" name="cantidad_maletas" value={formDataCheckin.cantidad_maletas} onChange={manejarCambioCheckin} />
                  </label>
                </section>

                <label className="campo" style={{ width: '100%', marginTop: '0.75rem' }}>
                  <span className="label-texto">Observaciones / Novedades</span>
                  <textarea rows="3" name="observaciones" value={formDataCheckin.observaciones} onChange={manejarCambioCheckin} placeholder="Notas sobre el estado de la habitación o peticiones del huésped..." className="textarea-notificacion" style={{ height: '80px' }} />
                </label>
              </fieldset>

              <footer className="acciones-formulario" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', border: 'none', padding: 0 }}>
                <button type="button" className="boton-cancelar" onClick={cerrarModalCheckin}>Cancelar</button>
                <button type="submit" className="boton-guardار">Guardar Check-in y Ocupar Habitación</button>
              </footer>
            </form>
          </article>
        </aside>
      )}

      {/* MODAL DE REGISTRO DIRECTO EN HOTEL (SIN RESERVA PREVIA) */}
      {modalRegistroDirectoAbierto && (
        <aside className="overlay-modal" onClick={cerrarModalRegistroDirecto}>
          <article className="contenido-modal modal-ancho-medio" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                {pasoDirecto === 'EDITANDO'
                  ? 'Registro Directo en Hotel (Check-in Inmediato)'
                  : 'Verificar Desglose y Costos de Llegada Directa'}
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalRegistroDirecto}>&times;</button>
            </header>

            {pasoDirecto === 'EDITANDO' ? (
              <form onSubmit={(e) => { e.preventDefault(); setPasoDirecto('CONFIRMANDO'); }} className="formulario-huesped" noValidate>
                <fieldset className="grupo-campos-limpio">
                  <legend className="leyenda-formulario">DATOS DE LA ESTANCIA Y LLEGADA DIRECTA</legend>

                  <label className="campo campo-ancho-total">
                    <span className="label-texto">Huésped Titular *</span>
                    <select name="id_huesped" value={formDataDirecto.id_huesped} onChange={manejarCambioDirecto} required>
                      <option value="">Seleccione un huésped...</option>
                      {huespedes.map((h) => (
                        <option key={h.id_huesped} value={h.id_huesped}>
                          {h.nombre} ({h.correo || h.telefono})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="campo campo-ancho-total">
                    <span className="label-texto">Habitación *</span>
                    <select name="codigo_habitacion" value={formDataDirecto.codigo_habitacion} onChange={manejarCambioDirecto} required>
                      <option value="">Seleccione una habitación disponible...</option>
                      {habitaciones.map((hab) => (
                        <option key={hab.codigo_habitacion} value={hab.codigo_habitacion}>
                          Hab. {hab.codigo_habitacion} - {hab.nombre_tipo || 'Estándar'} (Máx. {hab.capacidad} pers.)
                        </option>
                      ))}
                    </select>
                  </label>

                  <section className="grid-dos-columnas">
                    <label className="campo">
                      <span className="label-texto">Fecha Check-in *</span>
                      <input type="date" name="fecha_checkin" value={formDataDirecto.fecha_checkin} onChange={manejarCambioDirecto} required />
                    </label>

                    <label className="campo">
                      <span className="label-texto">Fecha Check-out *</span>
                      <input type="date" name="fecha_checkout" value={formDataDirecto.fecha_checkout} onChange={manejarCambioDirecto} required />
                    </label>
                  </section>

                  <section className="grid-dos-columnas espacio-superior-corto">
                    <label className="campo">
                      <span className="label-texto">Total Huéspedes *</span>
                      <input
                        type="number"
                        min="1"
                        name="cantidad_huespedes"
                        value={formDataDirecto.cantidad_huespedes}
                        onChange={(e) => {
                          const cant = parseInt(e.target.value || 1);
                          setFormDataDirecto((prev) => ({
                            ...prev,
                            cantidad_huespedes: cant
                          }));
                        }}
                        required
                      />
                    </label>

                    <label className="campo">
                      <span className="label-texto">Cantidad de Maletas</span>
                      <input type="number" min="0" name="cantidad_maletas" value={formDataDirecto.cantidad_maletas} onChange={manejarCambioDirecto} />
                    </label>
                  </section>

                  <section className="grid-una-columna espacio-superior-corto">
                    <label className="campo">
                      <span className="label-texto">Agregar Recargos / Descuentos</span>
                      <section className="contenedor-input-accion">
                        <select value={recargoDirectoTemporal} onChange={(e) => setRecargoDirectoTemporal(e.target.value)} className="select-flexible">
                          <option value="">Seleccionar recargo...</option>
                          {recargosDisponibles.map((rec) => (
                            <option key={rec.id_recargo} value={rec.id_recargo}>
                              {rec.motivo_recargo} ({rec.tipo_calculo === 'Suma' ? '+' : '-'}{rec.tipo_operacion?.toLowerCase() === 'porcentaje' ? `${rec.monto}%` : `$${rec.monto}`})
                            </option>
                          ))}
                        </select>
                        <button type="button" className="boton-agregar boton-ancho-fijo" onClick={agregarRecargoDirecto}>+</button>
                      </section>
                    </label>

                    {formDataDirecto.recargos_ids.length > 0 && (
                      <ul className="lista-etiquetas-recargos">
                        {formDataDirecto.recargos_ids.map((idR) => {
                          const objR = recargosDisponibles.find((r) => String(r.id_recargo) === String(idR));
                          return (
                            <li key={idR} className="item-etiqueta-recargo">
                              <span>{objR?.motivo_recargo}</span>
                              <button type="button" onClick={() => removerRecargoDirecto(idR)} className="boton-remover-recargo">&times;</button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>

                  <label className="campo campo-ancho-total espacio-superior-corto">
                    <span className="label-texto">Observaciones / Novedades de Entrada</span>
                    <textarea rows="2" name="observaciones" value={formDataDirecto.observaciones} onChange={manejarCambioDirecto} placeholder="Notas sobre el pago directo o peticiones especiales..." className="textarea-notificacion textarea-altura-corta" />
                  </label>
                </fieldset>

                <footer className="acciones-formulario acciones-formulario-limpio">
                  <button type="button" className="boton-cancelar" onClick={cerrarModalRegistroDirecto}>Cancelar</button>
                  <button type="submit" className="boton-guardar">Revisar Desglose y Continuar &rarr;</button>
                </footer>
              </form>
            ) : (
              <div className="formulario-huesped">
                <section className="tarjeta-resumen-estancia">
                  <h3 className="titulo-resumen-estancia">Resumen de Llegada Directa y Check-in</h3>
                  <p className="texto-resumen-item"><strong>Huésped:</strong> {huespedDirectoObj?.nombre || 'N/A'}</p>
                  <p className="texto-resumen-item"><strong>Habitación:</strong> Hab. {formDataDirecto.codigo_habitacion}</p>
                  <p className="texto-resumen-item"><strong>Fechas:</strong> Del {formDataDirecto.fecha_checkin} al {formDataDirecto.fecha_checkout} ({finanzasDirecto.noches} noche(s))</p>
                  <p className="texto-resumen-item"><strong>Acompañantes:</strong> {Math.max(0, parseInt(formDataDirecto.cantidad_huespedes || 1) - 1)} persona(s)</p>
                  <p className="texto-resumen-item"><strong>Maletas:</strong> {formDataDirecto.cantidad_maletas} equipaje(s)</p>
                  <p className="texto-resumen-item"><strong>Monto Total (USD):</strong> <span className="monto-usd-destacado">{formatUSD(finanzasDirecto.totalUSD)}</span></p>
                  <p className="texto-resumen-item"><strong>Monto Total (Bs):</strong> <span className="monto-bs-destacado">{formatBs(finanzasDirecto.totalBs)}</span></p>
                </section>

                <footer className="acciones-formulario acciones-formulario-distribuido">
                  <button type="button" className="boton-cancelar" onClick={() => setPasoDirecto('EDITANDO')}>&larr; Volver</button>
                  <button type="button" className="boton-guardar" onClick={guardarRegistroDirectoFinal}>
                    Confirmar, Registrar y Ocupar Habitación
                  </button>
                </footer>
              </div>
            )}
          </article>
        </aside>
      )}
    </section>
  );
}