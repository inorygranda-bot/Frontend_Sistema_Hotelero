import React, { useState, useEffect } from 'react';
import '../../estilos/huespedes.css';
import '../../estilos/habitaciones.css';

const API_RECARGOS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/recargos';
const API_PAGOS_URL = 'http://localhost:3000/api/pagos';
const API_RESERVAS_URL = 'http://localhost:3000/api/reservas';
const API_TASA_BCV_URL = 'http://localhost:3000/api/tarifas/tasa-bcv';

export default function Finanzas({ usuario }) {
    const [pestannaActiva, setPestannaActiva] = useState('RECARGOS'); // 'RECARGOS' o 'PAGOS'

    // --- TASA OFICIAL BCV ---
    const [bcvRate, setBcvRate] = useState(872.39);

    // --- ESTADOS DE RECARGOS ---
    const [recargos, setRecargos] = useState([]);
    const [loadingRecargos, setLoadingRecargos] = useState(true);
    const [errorRecargos, setErrorRecargos] = useState(null);
    const [busquedaRecargo, setBusquedaRecargo] = useState('');
    const [filtroCalculo, setFiltroCalculo] = useState('TODOS');
    const [modalRecargoAbierto, setModalRecargoAbierto] = useState(false);
    const [modoRecargo, setModoRecargo] = useState('CREAR');
    const [guardandoRecargo, setGuardandoRecargo] = useState(false);
    const [erroresRecargo, setErroresRecargo] = useState({});

    const estadoInicialRecargo = {
        id_recargo: null,
        motivo_recargo: '',
        tipo_operacion: 'Porcentaje',
        tipo_calculo: 'Suma',
        monto: ''
    };
    const [formDataRecargo, setFormDataRecargo] = useState(estadoInicialRecargo);

    // --- ESTADOS DE PAGOS Y RESERVAS ---
    const [reservas, setReservas] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [loadingPagos, setLoadingPagos] = useState(true);
    const [errorPagos, setErrorPagos] = useState(null);

    const [busquedaPago, setBusquedaPago] = useState('');
    const [filtroEstadoPago, setFiltroEstadoPago] = useState('TODOS');
    const [filtroEstadoReserva, setFiltroEstadoReserva] = useState('TODAS');

    const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
    const [guardandoPago, setGuardandoPago] = useState(false);
    const [erroresPago, setErroresPago] = useState({});

    const estadoInicialPago = {
        codigo_reserva: '',
        metodo_pago: 'Efectivo',
        moneda: 'USD',
        monto: '',
        banco_destino: '',
        num_referencia: '',
        descripcion: ''
    };
    const [formDataPago, setFormDataPago] = useState(estadoInicialPago);

    const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
    const [reservaSeleccionadaHistorial, setReservaSeleccionadaHistorial] = useState(null);

    const [alerta, setAlerta] = useState({
        abierto: false,
        tipo: 'exito',
        titulo: '',
        mensaje: '',
        accionConfirmar: null,
        textoConfirmar: 'Aceptar'
    });

    const cargarTasaBcv = async () => {
        try {
            let respuesta = await fetch(API_TASA_BCV_URL).catch(() => null);
            if (!respuesta || !respuesta.ok) {
                respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
            }
            if (respuesta && respuesta.ok) {
                const datos = await respuesta.json();
                const tasaReal = parseFloat(datos.tasa || datos.promedio);
                if (tasaReal && !isNaN(tasaReal)) {
                    setBcvRate(tasaReal);
                }
            }
        } catch (err) {
            console.warn('No se pudo actualizar la tasa BCV:', err);
        }
    };

    const cargarRecargos = async () => {
        try {
            setLoadingRecargos(true);
            setErrorRecargos(null);
            const respuesta = await fetch(API_RECARGOS_URL);
            if (!respuesta.ok) throw new Error('No se pudo obtener la lista de recargos.');
            const datos = await respuesta.json();
            setRecargos(Array.isArray(datos) ? datos : []);
        } catch (err) {
            setErrorRecargos(err.message || 'Error al conectar con el servidor.');
        } finally {
            setLoadingRecargos(false);
        }
    };

    const cargarPagosYReservas = async () => {
        try {
            setLoadingPagos(true);
            setErrorPagos(null);

            const [respReservas, respPagos] = await Promise.all([
                fetch(API_RESERVAS_URL).catch(() => ({ ok: false })),
                fetch(API_PAGOS_URL).catch(() => ({ ok: false }))
            ]);

            if (respReservas.ok) {
                const datosReservas = await respReservas.json();
                setReservas(Array.isArray(datosReservas) ? datosReservas : []);
            } else {
                setReservas([]);
            }

            if (respPagos.ok) {
                const datosPagos = await respPagos.json();
                setPagos(Array.isArray(datosPagos) ? datosPagos : []);
            } else {
                setPagos([]);
            }
        } catch (err) {
            setErrorPagos('Error al cargar la información financiera de reservas.');
        } finally {
            setLoadingPagos(false);
        }
    };

    useEffect(() => {
        cargarRecargos();
        cargarPagosYReservas();
        cargarTasaBcv();
    }, []);

    // Cálculo preciso del monto total de la reserva basado en noches y precio base
    const calcularMontoTotal = (res) => {
        if (res.monto_total) return Number(res.monto_total);
        if (!res.fecha_checkin || !res.fecha_checkout) return Number(res.precio_base || 150.00);
        
        const checkin = new Date(res.fecha_checkin);
        const checkout = new Date(res.fecha_checkout);
        const diffTime = checkout - checkin;
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const precioBase = Number(res.precio_base || 150.00);
        const ivaPorc = Number(res.iva || 16);

        const subtotal = diffDays * precioBase;
        const iva = subtotal * (ivaPorc / 100);
        return subtotal + iva;
    };

    const obtenerEstadoPago = (montoPagado, montoTotal) => {
        const pagadoCentavos = Math.round(Number(montoPagado) * 100);
        const totalCentavos = Math.round(Number(montoTotal) * 100);

        if (pagadoCentavos <= 0) return 'Pendiente';
        if (pagadoCentavos >= totalCentavos) return 'Pagado';
        return 'Parcial';
    };

    // --- VALIDACIONES RECARGO ---
    const validarCampoRecargo = (name, value) => {
        let error = '';
        if (name === 'motivo_recargo' && !value.trim()) error = 'El motivo del recargo es obligatorio.';
        if (name === 'monto') {
            if (value === '' || value === null) error = 'El monto o valor es obligatorio.';
            else if (isNaN(value) || Number(value) < 0) error = 'Debe ingresar un número válido.';
        }
        return error;
    };

    const handleChangeRecargo = (e) => {
        const { name, value } = e.target;
        setFormDataRecargo((prev) => ({ ...prev, [name]: value }));
        const errorMensaje = validarCampoRecargo(name, value);
        setErroresRecargo((prev) => ({ ...prev, [name]: errorMensaje }));
    };

    const abrirModalCrearRecargo = () => {
        setFormDataRecargo(estadoInicialRecargo);
        setErroresRecargo({});
        setModoRecargo('CREAR');
        setModalRecargoAbierto(true);
    };

    const abrirModalEditarRecargo = (recargo) => {
        setFormDataRecargo({
            id_recargo: recargo.id_recargo,
            motivo_recargo: recargo.motivo_recargo || '',
            tipo_operacion: recargo.tipo_operacion || 'Porcentaje',
            tipo_calculo: recargo.tipo_calculo || 'Suma',
            monto: recargo.monto !== undefined ? recargo.monto : ''
        });
        setErroresRecargo({});
        setModoRecargo('EDITAR');
        setModalRecargoAbierto(true);
    };

    const cerrarModalRecargo = () => {
        if (guardandoRecargo) return;
        setModalRecargoAbierto(false);
        setFormDataRecargo(estadoInicialRecargo);
        setErroresRecargo({});
    };

    const handleSubmitRecargo = async (e) => {
        e.preventDefault();
        const erroresTemp = {};
        Object.keys(formDataRecargo).forEach((key) => {
            const err = validarCampoRecargo(key, formDataRecargo[key]);
            if (err) erroresTemp[key] = err;
        });

        if (Object.keys(erroresTemp).length > 0) {
            setErroresRecargo(erroresTemp);
            return;
        }

        setGuardandoRecargo(true);
        const esCrear = modoRecargo === 'CREAR';
        const url = esCrear ? API_RECARGOS_URL : `${API_RECARGOS_URL}/${formDataRecargo.id_recargo}`;
        const metodo = esCrear ? 'POST' : 'PUT';
        const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
        const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

        try {

            const payload = {
                ...formDataRecargo,
                id_usuario: idUsuarioActual 
            };

            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                const errData = await respuesta.json().catch(() => ({}));
                throw new Error(errData.mensaje || 'Fallo al procesar el recargo.');
            }

            cerrarModalRecargo();
            cargarRecargos();
            setAlerta({
                abierto: true,
                tipo: 'exito',
                titulo: esCrear ? '¡Recargo Registrado!' : '¡Datos Actualizados!',
                mensaje: 'La operación se completó correctamente.'
            });
        } catch (err) {
            setAlerta({
                abierto: true,
                tipo: 'error',
                titulo: 'Error al Procesar Recargo',
                mensaje: err.message
            });
        } finally {
            setGuardandoRecargo(false);
        }
    };

    const solicitarEliminarRecargo = (id, motivo) => {
        setAlerta({
            abierto: true,
            tipo: 'confirmar',
            titulo: 'Confirmar Eliminación',
            mensaje: `¿Está seguro de eliminar el recargo "${motivo}"?`,
            textoConfirmar: 'Sí, Eliminar',
            accionConfirmar: () => ejecutarEliminacionRecargo(id)
        });
    };

    const ejecutarEliminacionRecargo = async (id) => {
        // 👇 OBTENER SESIÓN ACTIVA
        const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
        const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

        try {
            const respuesta = await fetch(`${API_RECARGOS_URL}/${id}?id_usuario=${idUsuarioActual}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!respuesta.ok) throw new Error('No se pudo eliminar el recargo.');
            cargarRecargos();
            setAlerta({
                abierto: true,
                tipo: 'exito',
                titulo: '¡Registro Eliminado!',
                mensaje: 'El recargo ha sido eliminado correctamente.'
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

    // --- VALIDACIONES PAGO ---
    const validarCampoPago = (name, value) => {
        let error = '';
        if (name === 'codigo_reserva' && !value) error = 'Debe seleccionar una reserva.';
        if (name === 'monto') {
            if (value === '' || value === null) error = 'El monto del pago es obligatorio.';
            else if (isNaN(value) || Number(value) <= 0) error = 'Debe ingresar un monto válido mayor a 0.';
        }
        if (name === 'metodo_pago' && !value) error = 'Seleccione el método de pago.';
        return error;
    };

    const handleChangePago = (e) => {
        const { name, value } = e.target;
        setFormDataPago((prev) => ({ ...prev, [name]: value }));
        const errorMensaje = validarCampoPago(name, value);
        setErroresPago((prev) => ({ ...prev, [name]: errorMensaje }));
    };

    const abrirModalRegistrarPago = () => {
        setFormDataPago(estadoInicialPago);
        setErroresPago({});
        setModalPagoAbierto(true);
    };

    const cerrarModalPago = () => {
        if (guardandoPago) return;
        setModalPagoAbierto(false);
        setFormDataPago(estadoInicialPago);
        setErroresPago({});
    };

    const handleSubmitPago = async (e) => {
        e.preventDefault();
        const erroresTemp = {};
        Object.keys(formDataPago).forEach((key) => {
            const err = validarCampoPago(key, formDataPago[key]);
            if (err) erroresTemp[key] = err;
        });

        if (Object.keys(erroresTemp).length > 0) {
            setErroresPago(erroresTemp);
            return;
        }

        setGuardandoPago(true);

        // 👇 OBTENER SESIÓN ACTIVA
        const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
        const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

        const payload = {
            ...formDataPago,
            id_usuario: idUsuarioActual, // <-- Enviamos el usuario responsable real en lugar de prop fija
            tasa_bcv: bcvRate
        };

        try {
            const respuesta = await fetch(API_PAGOS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                const errData = await respuesta.json().catch(() => ({}));
                throw new Error(errData.mensaje || 'No se pudo registrar el pago en la base de datos.');
            }

            cerrarModalPago();
            cargarPagosYReservas();
            setAlerta({
                abierto: true,
                tipo: 'exito',
                titulo: '¡Pago Registrado Exitosamente!',
                mensaje: 'El pago se asoció correctamente y se recalculó el saldo.'
            });
        } catch (err) {
            setAlerta({
                abierto: true,
                tipo: 'error',
                titulo: 'Error al Registrar Pago',
                mensaje: err.message
            });
        } finally {
            setGuardandoPago(false);
        }
    };

    const abrirHistorialPagos = (reserva) => {
        setReservaSeleccionadaHistorial(reserva);
        setModalHistorialAbierto(true);
    };

    const cerrarHistorialPagos = () => {
        setModalHistorialAbierto(false);
        setReservaSeleccionadaHistorial(null);
    };

    // --- FILTRADOS ---
    const recargosFiltrados = recargos.filter((r) => {
        const coincideBusqueda = r.motivo_recargo?.toLowerCase().includes(busquedaRecargo.toLowerCase());
        const coincideCalculo = filtroCalculo === 'TODOS' || r.tipo_calculo === filtroCalculo;
        return coincideBusqueda && coincideCalculo;
    });

    const reservasFiltradas = reservas.filter((res) => {
        const coincideBusqueda =
            res.codigo_reserva?.toString().includes(busquedaPago.trim()) ||
            res.nombre_huesped?.toLowerCase().includes(busquedaPago.toLowerCase()) ||
            res.codigo_habitacion?.toString().includes(busquedaPago.trim());

        const totalPagadoReal = pagos
            .filter((p) => Number(p.codigo_reserva) === Number(res.codigo_reserva))
            .reduce((suma, p) => {
                const m = Number(p.monto || 0);
                return suma + (p.moneda?.toUpperCase() === 'VES' ? m / bcvRate : m);
            }, 0);

        const montoTotal = calcularMontoTotal(res);
        const estadoPago = obtenerEstadoPago(totalPagadoReal, montoTotal);

        const coincideEstadoPago =
            filtroEstadoPago === 'TODOS' || estadoPago === filtroEstadoPago;

        const coincideEstadoReserva =
            filtroEstadoReserva === 'TODAS' ||
            res.estado?.toUpperCase() === filtroEstadoReserva.toUpperCase();

        return coincideBusqueda && coincideEstadoPago && coincideEstadoReserva;
    });

    const montoNum = parseFloat(formDataPago.monto) || 0;
    const equivalenteCalculado =
        formDataPago.moneda === 'VES'
            ? `Equivalente en deuda USD: $ ${(montoNum / (bcvRate || 1)).toFixed(2)} (Tasa BCV: ${bcvRate.toFixed(2)} Bs)`
            : `Equivalente estimado: Bs ${(montoNum * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <section className="contenedor-huespedes">
            <header className="encabezado-vista">
                <h1 className="titulo-vista">Módulo de Finanzas</h1>
                <p className="subtitulo-vista">Gestión de recargos, descuentos y pagos asociados a reservas</p>
            </header>

            {/* Pestañas de Navegación */}
            <nav className="pestañas-navegacion">
                <button
                    type="button"
                    className={`boton-pestanna ${pestannaActiva === 'RECARGOS' ? 'activa' : ''}`}
                    onClick={() => setPestannaActiva('RECARGOS')}
                >
                    Recargos y Descuentos
                </button>
                <button
                    type="button"
                    className={`boton-pestanna ${pestannaActiva === 'PAGOS' ? 'activa' : ''}`}
                    onClick={() => setPestannaActiva('PAGOS')}
                >
                    Pagos y Avances de Reservas
                </button>
            </nav>

            {/* VISTA 1: RECARGOS */}
            {pestannaActiva === 'RECARGOS' && (
                <section className="contenedor-huespedes">
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
                                    placeholder="Buscar por motivo de recargo..."
                                    value={busquedaRecargo}
                                    onChange={(e) => setBusquedaRecargo(e.target.value)}
                                />
                            </label>

                            <label className="caja-filtro">
                                <select
                                    className="select-filtro"
                                    value={filtroCalculo}
                                    onChange={(e) => setFiltroCalculo(e.target.value)}
                                >
                                    <option value="TODOS">Cálculo: Todos</option>
                                    <option value="Suma">Suma (+)</option>
                                    <option value="Resta">Resta (-)</option>
                                </select>
                            </label>
                        </section>

                        <button type="button" className="boton-agregar" onClick={abrirModalCrearRecargo}>
                            <span>+ Nuevo Recargo</span>
                        </button>
                    </section>

                    {loadingRecargos ? (
                        <article className="caja-cargando">
                            <span className="spinner"></span>
                            <p>Cargando recargos...</p>
                        </article>
                    ) : errorRecargos ? (
                        <aside className="mensaje-error">
                            <p>⚠️ {errorRecargos}</p>
                            <button onClick={cargarRecargos} className="boton-reintentar-tabla">Reintentar</button>
                        </aside>
                    ) : (
                        <article className="tarjeta-tabla">
                            <table className="tabla-huespedes">
                                <thead>
                                    <tr>
                                        <th>Motivo del Recargo</th>
                                        <th>Tipo de Operación</th>
                                        <th>Monto / Valor</th>
                                        <th>Tipo de Cálculo</th>
                                        <th className="texto-derecha">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recargosFiltrados.length > 0 ? (
                                        recargosFiltrados.map((r) => (
                                            <tr key={r.id_recargo}>
                                                <td>
                                                    <article className="info-persona">
                                                        <span className="nombre-persona">{r.motivo_recargo}</span>
                                                    </article>
                                                </td>
                                                <td>
                                                    <span className="badge-documento">{r.tipo_operacion}</span>
                                                </td>
                                                <td>
                                                    <span className="texto-telefono">
                                                        {r.tipo_operacion === 'Porcentaje' ? `${r.monto}%` : `$${Number(r.monto).toFixed(2)}`}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge-estado ${r.tipo_calculo === 'Suma' ? 'badge-disponible' : 'badge-fuera-de-servicio'}`}>
                                                        {r.tipo_calculo === 'Suma' ? '➕ Suma' : '➖ Resta'}
                                                    </span>
                                                </td>
                                                <td className="texto-derecha">
                                                    <section className="grupo-acciones">
                                                        <button type="button" className="boton-accion" title="Editar" onClick={() => abrirModalEditarRecargo(r)}>✏️</button>
                                                        <button type="button" className="boton-accion peligro" title="Eliminar" onClick={() => solicitarEliminarRecargo(r.id_recargo, r.motivo_recargo)}>🗑️</button>
                                                    </section>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="tabla-vacia">No se encontraron recargos registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </article>
                    )}
                </section>
            )}

            {/* VISTA 2: PAGOS Y AVANCES DE RESERVAS */}
            {pestannaActiva === 'PAGOS' && (
                <section className="contenedor-huespedes">
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
                                    placeholder="Buscar N° reserva, huésped o hab..."
                                    value={busquedaPago}
                                    onChange={(e) => setBusquedaPago(e.target.value)}
                                />
                            </label>

                            <label className="caja-filtro">
                                <select
                                    className="select-filtro"
                                    value={filtroEstadoPago}
                                    onChange={(e) => setFiltroEstadoPago(e.target.value)}
                                >
                                    <option value="TODOS">Pago: Todos</option>
                                    <option value="Pendiente">Pendiente ($0)</option>
                                    <option value="Parcial">Abonado (Parcial)</option>
                                    <option value="Pagado">Completado (Pagado)</option>
                                </select>
                            </label>

                            <label className="caja-filtro">
                                <select
                                    className="select-filtro"
                                    value={filtroEstadoReserva}
                                    onChange={(e) => setFiltroEstadoReserva(e.target.value)}
                                >
                                    <option value="TODAS">Reserva: Todas</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="CONFIRMADA">Confirmada</option>
                                    <option value="CHECKIN">Check-in</option>
                                    <option value="CHECKOUT">Check-out</option>
                                    <option value="CANCELADA">Cancelada</option>
                                </select>
                            </label>
                        </section>

                        <button type="button" className="boton-agregar" onClick={abrirModalRegistrarPago}>
                            <span>+ Registrar Pago</span>
                        </button>
                    </section>

                    {loadingPagos ? (
                        <article className="caja-cargando">
                            <span className="spinner"></span>
                            <p>Cargando información de pagos y reservas...</p>
                        </article>
                    ) : errorPagos ? (
                        <aside className="mensaje-error">
                            <p>⚠️ {errorPagos}</p>
                            <button onClick={cargarPagosYReservas} className="boton-reintentar-tabla">Reintentar</button>
                        </aside>
                    ) : (
                        <article className="tarjeta-tabla">
                            <table className="tabla-huespedes">
                                <thead>
                                    <tr>
                                        <th>N° Reserva</th>
                                        <th>Huésped</th>
                                        <th>Habitación</th>
                                        <th>Monto Total</th>
                                        <th>Monto Pagado</th>
                                        <th>Saldo Pendiente</th>
                                        <th>Estado de Pago</th>
                                        <th className="texto-derecha">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservasFiltradas.length > 0 ? (
                                        reservasFiltradas.map((res) => {
                                            const totalPagadoReal = pagos
                                                .filter((p) => Number(p.codigo_reserva) === Number(res.codigo_reserva))
                                                .reduce((suma, p) => {
                                                    const m = Number(p.monto || 0);
                                                    return suma + (p.moneda?.toUpperCase() === 'VES' ? m / bcvRate : m);
                                                }, 0);

                                            const montoTotal = calcularMontoTotal(res);
                                            const montoPagado = totalPagadoReal;
                                            const saldoPendiente = Math.max(0, montoTotal - montoPagado);
                                            const saldoFinal = saldoPendiente < 0.01 ? 0 : saldoPendiente;
                                            const estadoPago = obtenerEstadoPago(montoPagado, montoTotal);

                                            return (
                                                <tr key={res.codigo_reserva}>
                                                    <td>
                                                        <strong>N° {res.codigo_reserva}</strong>
                                                    </td>
                                                    <td>
                                                        <article className="info-persona">
                                                            <span className="nombre-persona">{res.nombre_huesped || 'Huésped N° ' + res.id_huesped}</span>
                                                            <small className="correo-persona">{res.correo || ''}</small>
                                                        </article>
                                                    </td>
                                                    <td>
                                                        <span className="badge-documento">Hab. {res.codigo_habitacion}</span>
                                                    </td>
                                                    <td>
                                                        <strong className="texto-telefono">${montoTotal.toFixed(2)}</strong>
                                                    </td>
                                                    <td>
                                                        <strong className="texto-telefono badge-disponible">${montoPagado.toFixed(2)}</strong>
                                                    </td>
                                                    <td>
                                                        <strong className={`texto-telefono ${saldoFinal === 0 ? 'badge-disponible' : 'badge-sucia'}`}>
                                                            ${saldoFinal.toFixed(2)}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <span className={`badge-estado ${estadoPago === 'Pagado' ? 'badge-disponible' : estadoPago === 'Parcial' ? 'badge-sucia' : 'badge-fuera-de-servicio'}`}>
                                                            {estadoPago}
                                                        </span>
                                                    </td>
                                                    <td className="texto-derecha">
                                                        <section className="grupo-acciones">
                                                            <button
                                                                type="button"
                                                                className="boton-ver-detalles"
                                                                onClick={() => abrirHistorialPagos(res)}
                                                            >
                                                                Ver Avances
                                                            </button>
                                                        </section>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="tabla-vacia">No se encontraron reservas con los filtros seleccionados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </article>
                    )}
                </section>
            )}

            {/* --- MODAL FORMULARIO RECARGO --- */}
            {modalRecargoAbierto && (
                <aside className="overlay-modal" onClick={cerrarModalRecargo}>
                    <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
                        <header className="encabezado-modal">
                            <h2 className="titulo-modal">
                                {modoRecargo === 'CREAR' ? 'Nuevo Recargo' : 'Editar Recargo'}
                            </h2>
                            <button type="button" className="boton-cerrar-modal" onClick={cerrarModalRecargo}>&times;</button>
                        </header>

                        <form onSubmit={handleSubmitRecargo} className="formulario-huesped" noValidate>
                            <fieldset className="grupo-campos">
                                <legend className="leyenda-formulario">Detalles del Recargo</legend>

                                <label className="campo ancho-completo">
                                    <span className="label-texto">Motivo del Recargo *</span>
                                    <input
                                        type="text"
                                        name="motivo_recargo"
                                        placeholder="Ej. Cargo por mascota, servicio nocturno o descuento"
                                        value={formDataRecargo.motivo_recargo}
                                        onChange={handleChangeRecargo}
                                        className={erroresRecargo.motivo_recargo ? 'input-error' : ''}
                                    />
                                    {erroresRecargo.motivo_recargo && <span className="texto-error-campo">{erroresRecargo.motivo_recargo}</span>}
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Tipo de Operación *</span>
                                    <select name="tipo_operacion" value={formDataRecargo.tipo_operacion} onChange={handleChangeRecargo}>
                                        <option value="Porcentaje">Porcentaje (%)</option>
                                        <option value="Monto Fijo">Monto Fijo ($)</option>
                                    </select>
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Monto / Valor *</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="monto"
                                        placeholder="Ej. 10.00"
                                        value={formDataRecargo.monto}
                                        onChange={handleChangeRecargo}
                                        className={erroresRecargo.monto ? 'input-error' : ''}
                                    />
                                    {erroresRecargo.monto && <span className="texto-error-campo">{erroresRecargo.monto}</span>}
                                </label>

                                <label className="campo ancho-completo">
                                    <span className="label-texto">Tipo de Cálculo *</span>
                                    <select name="tipo_calculo" value={formDataRecargo.tipo_calculo} onChange={handleChangeRecargo}>
                                        <option value="Suma">Suma (+)</option>
                                        <option value="Resta">Resta (-)</option>
                                    </select>
                                </label>
                            </fieldset>

                            <footer className="acciones-formulario">
                                <button type="button" className="boton-cancelar" onClick={cerrarModalRecargo} disabled={guardandoRecargo}>Cancelar</button>
                                <button type="submit" className="boton-guardar" disabled={guardandoRecargo}>
                                    {guardandoRecargo ? 'Guardando...' : (modoRecargo === 'CREAR' ? 'Guardar Recargo' : 'Actualizar Datos')}
                                </button>
                            </footer>
                        </form>
                    </article>
                </aside>
            )}

            {/* --- MODAL HISTORIAL DE PAGOS / AVANCES --- */}
            {modalHistorialAbierto && reservaSeleccionadaHistorial && (
                <aside className="overlay-modal" onClick={cerrarHistorialPagos}>
                    <article className="contenido-modal modal-detalle modal-detalle-scrollable" onClick={(e) => e.stopPropagation()}>
                        <header className="encabezado-modal">
                            <hgroup className="titulo-modal-grupo">
                                <h2 className="titulo-modal">Avances de Pago - Reserva N° {reservaSeleccionadaHistorial.codigo_reserva}</h2>
                                <span className="subtitulo-modal-tipo">Huésped: {reservaSeleccionadaHistorial.nombre_huesped || 'General'}</span>
                            </hgroup>
                            <button type="button" className="boton-cerrar-modal" onClick={cerrarHistorialPagos}>&times;</button>
                        </header>

                        <section className="cuerpo-modal-detalle cuerpo-modal-scrollable">
                            <section className="seccion-bloque-detalle">
                                <h3 className="titulo-seccion-detalle">Pagos Registrados</h3>
                                {pagos.filter(p => Number(p.codigo_reserva) === Number(reservaSeleccionadaHistorial.codigo_reserva)).length > 0 ? (
                                    <div className="contenedor-tabla-modal">
                                        <table className="tabla-huespedes">
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Método</th>
                                                    <th>Referencia</th>
                                                    <th>Monto Original</th>
                                                    <th>Equiv. USD</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pagos
                                                    .filter(p => Number(p.codigo_reserva) === Number(reservaSeleccionadaHistorial.codigo_reserva))
                                                    .map(p => {
                                                        const montoP = Number(p.monto);
                                                        const esBs = p.moneda?.toUpperCase() === 'VES';
                                                        const equivUSD = esBs ? montoP / bcvRate : montoP;

                                                        return (
                                                            <tr key={p.id_pago}>
                                                                <td><small>{new Date(p.fecha_pago).toLocaleDateString()}</small></td>
                                                                <td><span className="badge-documento">{p.metodo_pago}</span></td>
                                                                <td><small>{p.num_referencia || 'N/A'}</small></td>
                                                                <td><strong>{montoP.toFixed(2)} {p.moneda}</strong></td>
                                                                <td><strong className="badge-disponible">${equivUSD.toFixed(2)}</strong></td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="tabla-vacia">No hay pagos registrados para esta reserva.</p>
                                )}
                            </section>
                        </section>

                        <footer className="acciones-modal-detalle">
                            <button type="button" className="boton-cancelar" onClick={cerrarHistorialPagos}>Cerrar</button>
                        </footer>
                    </article>
                </aside>
            )}

            {/* --- MODAL REGISTRAR PAGO --- */}
            {modalPagoAbierto && (
                <aside className="overlay-modal" onClick={cerrarModalPago}>
                    <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
                        <header className="encabezado-modal">
                            <h2 className="titulo-modal">Registrar Nuevo Pago a Reserva</h2>
                            <button type="button" className="boton-cerrar-modal" onClick={cerrarModalPago}>&times;</button>
                        </header>

                        <form onSubmit={handleSubmitPago} className="formulario-huesped" noValidate>
                            <fieldset className="grupo-campos">
                                <legend className="leyenda-formulario">
                                    Datos del Pago (Tasa BCV actual: {bcvRate.toFixed(2)} Bs/USD)
                                </legend>

                                <label className="campo ancho-completo">
                                    <span className="label-texto">Seleccionar Reserva *</span>
                                    <select
                                        name="codigo_reserva"
                                        value={formDataPago.codigo_reserva}
                                        onChange={handleChangePago}
                                        className={erroresPago.codigo_reserva ? 'input-error' : ''}
                                    >
                                        <option value="">Seleccione una reserva...</option>
                                        {reservas.map((res) => (
                                            <option key={res.codigo_reserva} value={res.codigo_reserva}>
                                                Reserva N° {res.codigo_reserva} - {res.nombre_huesped || ('Huésped ' + res.id_huesped)} (Hab. {res.codigo_habitacion})
                                            </option>
                                        ))}
                                    </select>
                                    {erroresPago.codigo_reserva && <span className="texto-error-campo">{erroresPago.codigo_reserva}</span>}
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Método de Pago *</span>
                                    <select name="metodo_pago" value={formDataPago.metodo_pago} onChange={handleChangePago}>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                                        <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                        <option value="Pago Móvil">Pago Móvil</option>
                                        <option value="Zelle">Zelle</option>
                                    </select>
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Moneda *</span>
                                    <select name="moneda" value={formDataPago.moneda} onChange={handleChangePago}>
                                        <option value="USD">USD ($)</option>
                                        <option value="VES">Bolívares (VES)</option>
                                        <option value="EUR">Euros (€)</option>
                                    </select>
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Monto a Pagar *</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="monto"
                                        placeholder="Ej. 50.00"
                                        value={formDataPago.monto}
                                        onChange={handleChangePago}
                                        className={erroresPago.monto ? 'input-error' : ''}
                                    />
                                    {formDataPago.monto !== '' && (
                                        <small className="texto-ayuda-conversion">
                                            💱 {equivalenteCalculado}
                                        </small>
                                    )}
                                    {erroresPago.monto && <span className="texto-error-campo">{erroresPago.monto}</span>}
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Banco Destino</span>
                                    <input
                                        type="text"
                                        name="banco_destino"
                                        placeholder="Ej. Banco de Venezuela / Banesco"
                                        value={formDataPago.banco_destino}
                                        onChange={handleChangePago}
                                    />
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">N° de Referencia</span>
                                    <input
                                        type="text"
                                        name="num_referencia"
                                        placeholder="Ej. 12345678"
                                        value={formDataPago.num_referencia}
                                        onChange={handleChangePago}
                                    />
                                </label>

                                <label className="campo ancho-completo">
                                    <span className="label-texto">Descripción / Concepto *</span>
                                    <input
                                        type="text"
                                        name="descripcion"
                                        placeholder="Ej. Abono inicial de reserva o pago total"
                                        value={formDataPago.descripcion}
                                        onChange={handleChangePago}
                                    />
                                </label>
                            </fieldset>

                            <footer className="acciones-formulario">
                                <button type="button" className="boton-cancelar" onClick={cerrarModalPago} disabled={guardandoPago}>Cancelar</button>
                                <button type="submit" className="boton-guardar" disabled={guardandoPago}>
                                    {guardandoPago ? 'Registrando...' : 'Guardar y Asociar Pago'}
                                </button>
                            </footer>
                        </form>
                    </article>
                </aside>
            )}

            {/* --- MODAL DE ALERTAS --- */}
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
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            )}
                        </header>
                        <h3 className="titulo-alerta">{alerta.titulo}</h3>
                        <p className="mensaje-alerta">{alerta.mensaje}</p>
                        <footer className="acciones-alerta">
                            {alerta.tipo === 'confirmar' ? (
                                <nav className="grupo-botones-alerta-confirmar">
                                    <button type="button" className="boton-alerta-secundario" onClick={() => setAlerta(prev => ({ ...prev, abierto: false }))}>Cancelar</button>
                                    <button type="button" className="boton-alerta-peligro" onClick={() => { setAlerta(prev => ({ ...prev, abierto: false })); if (alerta.accionConfirmar) alerta.accionConfirmar(); }}>{alerta.textoConfirmar || 'Aceptar'}</button>
                                </nav>
                            ) : (
                                <button type="button" className="boton-alerta-primario" onClick={() => setAlerta(prev => ({ ...prev, abierto: false }))}>Aceptar</button>
                            )}
                        </footer>
                    </article>
                </aside>
            )}
        </section>
    );
}