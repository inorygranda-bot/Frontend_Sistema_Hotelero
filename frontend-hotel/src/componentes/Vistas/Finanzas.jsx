import React, { useState, useEffect } from 'react';
import '../../estilos/huespedes.css';
import '../../estilos/habitaciones.css';

const API_RECARGOS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/recargos';
const API_PAGOS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/pagos';
const API_RESERVAS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/reservas';
const API_BANCOS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/bancos';
const API_TASA_BCV_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/tarifas/tasa-bcv';

export default function Finanzas({ usuario }) {
    const [pestannaActiva, setPestannaActiva] = useState('RECARGOS'); // 'RECARGOS', 'PAGOS' o 'BANCOS'

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

    const estadoInicialRecargo = { id_recargo: null, motivo_recargo: '', tipo_operacion: 'Porcentaje', tipo_calculo: 'Suma', monto: '' };
    const [formDataRecargo, setFormDataRecargo] = useState(estadoInicialRecargo);

    // --- ESTADOS DE BANCOS ---
    const [bancos, setBancos] = useState([]);
    const [modalBancoAbierto, setModalBancoAbierto] = useState(false);
    const [nombreNuevoBanco, setNombreNuevoBanco] = useState('');
    const [errorBanco, setErrorBanco] = useState('');

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

    const estadoInicialPago = {
        codigo_reserva: '',
        metodo_pago: 'Transferencia Bancaria',
        moneda: 'USD',
        monto: '',
        id_banco_destino: '',
        num_referencia: '',
        descripcion: ''
    };
    const [formDataPago, setFormDataPago] = useState(estadoInicialPago);
    const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
    const [reservaSeleccionadaHistorial, setReservaSeleccionadaHistorial] = useState(null);

    const [alerta, setAlerta] = useState({ abierto: false, tipo: 'exito', titulo: '', mensaje: '', accionConfirmar: null });

    const cargarDatosGenerales = async () => {
        try {
            const [respRecargos, respReservas, respPagos, respBancos, respBcv] = await Promise.all([
                fetch(API_RECARGOS_URL).catch(() => ({ ok: false })),
                fetch(API_RESERVAS_URL).catch(() => ({ ok: false })),
                fetch(API_PAGOS_URL).catch(() => ({ ok: false })),
                fetch(API_BANCOS_URL).catch(() => ({ ok: false })),
                fetch(API_TASA_BCV_URL).catch(() => null)
            ]);

            if (respRecargos.ok) setRecargos(await respRecargos.json());
            if (respReservas.ok) setReservas(await respReservas.json());
            if (respPagos.ok) setPagos(await respPagos.json());
            if (respBancos.ok) setBancos(await respBancos.json());

            if (respBcv && respBcv.ok) {
                const dataBcv = await respBcv.json();
                if (dataBcv.tasa) setBcvRate(parseFloat(dataBcv.tasa));
            }
        } catch (err) {
            console.error('Error al cargar finanzas:', err);
        } finally {
            setLoadingRecargos(false);
            setLoadingPagos(false);
        }
    };

    useEffect(() => {
        cargarDatosGenerales();
    }, []);

    const calcularMontoTotal = (res) => {
        if (res.monto_total) return Number(res.monto_total);
        const diffDays = Math.max(1, Math.ceil((new Date(res.fecha_checkout) - new Date(res.fecha_checkin)) / (1000 * 60 * 60 * 24)));
        const precioBase = Number(res.precio_base || 150.00);
        return (diffDays * precioBase) * 1.16;
    };

    const obtenerEstadoPago = (montoPagado, montoTotal) => {
        const pagadoCent = Math.round(Number(montoPagado) * 100);
        const totalCent = Math.round(Number(montoTotal) * 100);
        if (pagadoCent <= 0) return 'Pendiente';
        if (pagadoCent >= totalCent) return 'Pagado';
        return 'Parcial';
    };

    // --- GESTIÓN DE BANCOS ---
    const handleCrearBanco = async (e) => {
        e.preventDefault();
        if (!nombreNuevoBanco.trim()) {
            setErrorBanco('El nombre del banco es obligatorio.');
            return;
        }
        try {
            const idUsuarioActual = usuario?.id_usuario || 1;
            const resp = await fetch(API_BANCOS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre_banco: nombreNuevoBanco, id_usuario: idUsuarioActual })
            });
            if (!resp.ok) throw new Error('No se pudo registrar el banco.');
            setNombreNuevoBanco('');
            setErrorBanco('');
            setModalBancoAbierto(false);
            cargarDatosGenerales();
            setAlerta({ abierto: true, tipo: 'exito', titulo: 'Banco Registrado', mensaje: 'El banco fue agregado al catálogo.' });
        } catch (err) {
            setErrorBanco(err.message);
        }
    };

    const solicitarEliminarBanco = (id, nombre) => {
        setAlerta({
            abierto: true,
            tipo: 'confirmar',
            titulo: 'Eliminar Banco',
            mensaje: `¿Desea eliminar el banco "${nombre}"?`,
            accionConfirmar: async () => {
                const idUsuarioActual = usuario?.id_usuario || 1;
                await fetch(`${API_BANCOS_URL}/${id}?id_usuario=${idUsuarioActual}`, { method: 'DELETE' });
                cargarDatosGenerales();
                setAlerta({ abierto: true, tipo: 'exito', titulo: 'Banco Eliminado', mensaje: 'El banco fue eliminado con éxito.' });
            }
        });
    };

    // --- GESTIÓN DE RECARGOS (CORREGIDA) ---
    const handleSubmitRecargo = async (e) => {
        e.preventDefault();
        setGuardandoRecargo(true);
        const idUsuarioActual = usuario?.id_usuario || 1;
        const url = modoRecargo === 'CREAR' ? API_RECARGOS_URL : `${API_RECARGOS_URL}/${formDataRecargo.id_recargo}`;
        const metodo = modoRecargo === 'CREAR' ? 'POST' : 'PUT';

        try {
            const resp = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formDataRecargo, id_usuario: idUsuarioActual })
            });
            if (!resp.ok) throw new Error('No se pudo guardar el recargo.');

            setModalRecargoAbierto(false);
            cargarDatosGenerales();
            setAlerta({ abierto: true, tipo: 'exito', titulo: 'Operación Exitosa', mensaje: 'El recargo fue guardado correctamente.' });
        } catch (err) {
            setAlerta({ abierto: true, tipo: 'error', titulo: 'Error', mensaje: err.message });
        } finally {
            setGuardandoRecargo(false);
        }
    };

    const solicitarEliminarRecargo = (id, motivo) => {
        setAlerta({
            abierto: true,
            tipo: 'confirmar',
            titulo: 'Eliminar Recargo',
            mensaje: `¿Desea eliminar el recargo "${motivo}"?`,
            accionConfirmar: async () => {
                const idUsuarioActual = usuario?.id_usuario || 1;
                const resp = await fetch(`${API_RECARGOS_URL}/${id}?id_usuario=${idUsuarioActual}`, { method: 'DELETE' });
                if (resp.ok) {
                    cargarDatosGenerales();
                    setAlerta({ abierto: true, tipo: 'exito', titulo: 'Recargo Eliminado', mensaje: 'El recargo fue eliminado.' });
                }
            }
        });
    };

    // --- GESTIÓN DE PAGOS ---
    const handlePagarTodaLaDeuda = () => {
        if (!formDataPago.codigo_reserva) {
            setAlerta({ abierto: true, tipo: 'error', titulo: 'Seleccione Reserva', mensaje: 'Debe seleccionar una reserva primero.' });
            return;
        }
        const reservaSel = reservas.find(r => Number(r.codigo_reserva) === Number(formDataPago.codigo_reserva));
        if (!reservaSel) return;

        const totalPagado = pagos.filter(p => Number(p.codigo_reserva) === Number(reservaSel.codigo_reserva)).reduce((s, p) => s + (p.moneda === 'VES' ? Number(p.monto) / bcvRate : Number(p.monto)), 0);
        const montoTotal = calcularMontoTotal(reservaSel);
        const saldoPendiente = Math.max(0, montoTotal - totalPagado);

        setFormDataPago(prev => ({
            ...prev,
            monto: saldoPendiente.toFixed(2),
            moneda: 'USD'
        }));
    };

    const handleSubmitPago = async (e) => {
        e.preventDefault();
        setGuardandoPago(true);
        const idUsuarioActual = usuario?.id_usuario || 1;

        try {
            const resp = await fetch(API_PAGOS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formDataPago, id_usuario: idUsuarioActual, tasa_bcv: bcvRate })
            });

            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.mensaje || 'No se pudo registrar el pago.');
            }

            setModalPagoAbierto(false);
            cargarDatosGenerales();
            setAlerta({ abierto: true, tipo: 'exito', titulo: 'Pago Exitoso', mensaje: 'El pago se registró y asoció correctamente a la reserva.' });
        } catch (err) {
            setAlerta({ abierto: true, tipo: 'error', titulo: 'Error al Registrar Pago', mensaje: err.message });
        } finally {
            setGuardandoPago(false);
        }
    };

    return (
        <section className="contenedor-huespedes">
            <header className="encabezado-vista">
                <h1 className="titulo-vista">Módulo de Finanzas</h1>
                <p className="subtitulo-vista">Gestión unificada de recargos, transacciones de pago y bancos autorizados</p>
            </header>

            <nav className="pestañas-navegacion">
                <button type="button" className={`boton-pestanna ${pestannaActiva === 'RECARGOS' ? 'activa' : ''}`} onClick={() => setPestannaActiva('RECARGOS')}>
                    Recargos y Descuentos
                </button>
                <button type="button" className={`boton-pestanna ${pestannaActiva === 'PAGOS' ? 'activa' : ''}`} onClick={() => setPestannaActiva('PAGOS')}>
                    Pagos y Transacciones
                </button>
                <button type="button" className={`boton-pestanna ${pestannaActiva === 'BANCOS' ? 'activa' : ''}`} onClick={() => setPestannaActiva('BANCOS')}>
                    Bancos Autorizados
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
                                    placeholder="Buscar recargo..."
                                    value={busquedaRecargo}
                                    onChange={(e) => setBusquedaRecargo(e.target.value)}
                                />
                            </label>
                        </section>
                        <button type="button" className="boton-agregar" onClick={() => { setFormDataRecargo(estadoInicialRecargo); setModoRecargo('CREAR'); setModalRecargoAbierto(true); }}>
                            <span>+ Nuevo Recargo</span>
                        </button>
                    </section>

                    <article className="tarjeta-tabla">
                        <table className="tabla-huespedes">
                            <thead>
                                <tr>
                                    <th>Motivo</th>
                                    <th>Operación</th>
                                    <th>Valor</th>
                                    <th>Cálculo</th>
                                    <th className="texto-derecha">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recargos.filter(r => r.motivo_recargo.toLowerCase().includes(busquedaRecargo.toLowerCase())).map(r => (
                                    <tr key={r.id_recargo}>
                                        <td><strong>{r.motivo_recargo}</strong></td>
                                        <td>{r.tipo_operacion}</td>
                                        <td>{r.tipo_operacion === 'Porcentaje' ? `${r.monto}%` : `$${Number(r.monto).toFixed(2)}`}</td>
                                        <td>{r.tipo_calculo}</td>
                                        <td className="texto-derecha">
                                            <button type="button" className="boton-accion" title="Editar" onClick={() => { setFormDataRecargo(r); setModoRecargo('EDITAR'); setModalRecargoAbierto(true); }}>✏️</button>
                                            <button type="button" className="boton-accion peligro" title="Eliminar" onClick={() => solicitarEliminarRecargo(r.id_recargo, r.motivo_recargo)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </article>
                </section>
            )}

            {/* VISTA 2: PAGOS */}
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
                                    placeholder="Buscar reserva o huésped..."
                                    value={busquedaPago}
                                    onChange={(e) => setBusquedaPago(e.target.value)}
                                />
                            </label>
                        </section>
                        <button type="button" className="boton-agregar" onClick={() => { setFormDataPago(estadoInicialPago); setModalPagoAbierto(true); }}>
                            <span>+ Registrar Pago</span>
                        </button>
                    </section>

                    <article className="tarjeta-tabla">
                        <table className="tabla-huespedes">
                            <thead>
                                <tr>
                                    <th>Reserva</th>
                                    <th>Huésped</th>
                                    <th>Total</th>
                                    <th>Pagado</th>
                                    <th>Saldo Pendiente</th>
                                    <th>Estado</th>
                                    <th className="texto-derecha">Historial</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservas.map(res => {
                                    const totalPagado = pagos.filter(p => Number(p.codigo_reserva) === Number(res.codigo_reserva)).reduce((s, p) => s + (p.moneda === 'VES' ? Number(p.monto) / bcvRate : Number(p.monto)), 0);
                                    const montoTotal = calcularMontoTotal(res);
                                    const saldo = Math.max(0, montoTotal - totalPagado);
                                    const estado = obtenerEstadoPago(totalPagado, montoTotal);

                                    return (
                                        <tr key={res.codigo_reserva}>
                                            <td>N° {res.codigo_reserva}</td>
                                            <td>{res.nombre_huesped}</td>
                                            <td>${montoTotal.toFixed(2)}</td>
                                            <td>${totalPagado.toFixed(2)}</td>
                                            <td>${saldo.toFixed(2)}</td>
                                            <td><span className={`badge-estado ${estado === 'Pagado' ? 'badge-disponible' : 'badge-sucia'}`}>{estado}</span></td>
                                            <td className="texto-derecha">
                                                <button type="button" className="boton-ver-detalles" onClick={() => { setReservaSeleccionadaHistorial(res); setModalHistorialAbierto(true); }}>Ver Pagos</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </article>
                </section>
            )}

            {/* VISTA 3: BANCOS AUTORIZADOS */}
            {pestannaActiva === 'BANCOS' && (
                <section className="contenedor-huespedes">
                    <section className="barra-herramientas">
                        <section className="grupo-controles"></section>
                        <button type="button" className="boton-agregar" onClick={() => setModalBancoAbierto(true)}>
                            <span>+ Agregar Banco</span>
                        </button>
                    </section>

                    <article className="tarjeta-tabla">
                        <table className="tabla-huespedes">
                            <thead>
                                <tr>
                                    <th>ID Banco</th>
                                    <th>Nombre de la Entidad Bancaria</th>
                                    <th className="texto-derecha">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bancos.length > 0 ? (
                                    bancos.map(b => (
                                        <tr key={b.id_banco}>
                                            <td>#{b.id_banco}</td>
                                            <td><strong>{b.nombre_banco}</strong></td>
                                            <td className="texto-derecha">
                                                <button type="button" className="boton-accion peligro" onClick={() => solicitarEliminarBanco(b.id_banco, b.nombre_banco)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="tabla-vacia">No hay bancos registrados en el sistema.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </article>
                </section>
            )}

            {/* MODAL REGISTRAR RECARGO */}
            {modalRecargoAbierto && (
                <aside className="overlay-modal" onClick={() => setModalRecargoAbierto(false)}>
                    <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
                        <header className="encabezado-modal">
                            <h2 className="titulo-modal">{modoRecargo === 'CREAR' ? 'Nuevo Recargo' : 'Editar Recargo'}</h2>
                            <button type="button" className="boton-cerrar-modal" onClick={() => setModalRecargoAbierto(false)}>&times;</button>
                        </header>
                        <form onSubmit={handleSubmitRecargo} className="formulario-huesped">
                            <fieldset className="grupo-campos">
                                <label className="campo ancho-completo">
                                    <span className="label-texto">Motivo *</span>
                                    <input
                                        type="text"
                                        name="motivo_recargo"
                                        placeholder="Ej. Servicio nocturno"
                                        value={formDataRecargo.motivo_recargo}
                                        onChange={(e) => setFormDataRecargo({ ...formDataRecargo, motivo_recargo: e.target.value })}
                                    />
                                </label>
                                <label className="campo medio">
                                    <span className="label-texto">Tipo de Operación *</span>
                                    <select
                                        name="tipo_operacion"
                                        value={formDataRecargo.tipo_operacion}
                                        onChange={(e) => setFormDataRecargo({ ...formDataRecargo, tipo_operacion: e.target.value })}
                                    >
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
                                        placeholder="0.00"
                                        value={formDataRecargo.monto}
                                        onChange={(e) => setFormDataRecargo({ ...formDataRecargo, monto: e.target.value })}
                                    />
                                </label>
                                <label className="campo ancho-completo">
                                    <span className="label-texto">Tipo de Cálculo *</span>
                                    <select
                                        name="tipo_calculo"
                                        value={formDataRecargo.tipo_calculo}
                                        onChange={(e) => setFormDataRecargo({ ...formDataRecargo, tipo_calculo: e.target.value })}
                                    >
                                        <option value="Suma">Suma (+)</option>
                                        <option value="Resta">Resta (-)</option>
                                    </select>
                                </label>
                            </fieldset>
                            <footer className="acciones-formulario">
                                <button type="button" className="boton-cancelar" onClick={() => setModalRecargoAbierto(false)}>Cancelar</button>
                                <button type="submit" className="boton-guardar" disabled={guardandoRecargo}>Guardar</button>
                            </footer>
                        </form>
                    </article>
                </aside>
            )}

            {/* MODAL REGISTRAR BANCO */}
            {modalBancoAbierto && (
                <aside className="overlay-modal" onClick={() => setModalBancoAbierto(false)}>
                    <article className="contenido-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <header className="encabezado-modal">
                            <h2 className="titulo-modal">Registrar Banco Autorizado</h2>
                            <button type="button" className="boton-cerrar-modal" onClick={() => setModalBancoAbierto(false)}>&times;</button>
                        </header>
                        <form onSubmit={handleCrearBanco} className="formulario-huesped">
                            <fieldset className="grupo-campos">
                                <label className="campo ancho-completo">
                                    <span className="label-texto">Nombre del Banco *</span>
                                    <input
                                        type="text"
                                        placeholder="Ej. Banesco"
                                        value={nombreNuevoBanco}
                                        onChange={(e) => setNombreNuevoBanco(e.target.value)}
                                    />
                                    {errorBanco && <span className="texto-error-campo">{errorBanco}</span>}
                                </label>
                            </fieldset>
                            <footer className="acciones-formulario">
                                <button type="button" className="boton-cancelar" onClick={() => setModalBancoAbierto(false)}>Cancelar</button>
                                <button type="submit" className="boton-guardar">Guardar Banco</button>
                            </footer>
                        </form>
                    </article>
                </aside>
            )}

            {/* MODAL REGISTRAR PAGO (Con botón "Pagar toda la deuda") */}
            {modalPagoAbierto && (
                <aside className="overlay-modal" onClick={() => setModalPagoAbierto(false)}>
                    <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
                        <header className="encabezado-modal">
                            <h2 className="titulo-modal">Registrar Pago y Transacción</h2>
                            <button type="button" className="boton-cerrar-modal" onClick={() => setModalPagoAbierto(false)}>&times;</button>
                        </header>
                        <form onSubmit={handleSubmitPago} className="formulario-huesped">
                            <fieldset className="grupo-campos">
                                <label className="campo ancho-completo">
                                    <span className="label-texto">Reserva *</span>
                                    <select
                                        name="codigo_reserva"
                                        value={formDataPago.codigo_reserva}
                                        onChange={(e) => setFormDataPago({ ...formDataPago, codigo_reserva: e.target.value })}
                                    >
                                        <option value="">Seleccione reserva...</option>
                                        {reservas.map(res => (
                                            <option key={res.codigo_reserva} value={res.codigo_reserva}>
                                                Reserva N° {res.codigo_reserva} - {res.nombre_huesped}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Método de Pago *</span>
                                    <select
                                        name="metodo_pago"
                                        value={formDataPago.metodo_pago}
                                        onChange={(e) => setFormDataPago({ ...formDataPago, metodo_pago: e.target.value })}
                                    >
                                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                        <option value="Pago Móvil">Pago Móvil</option>
                                        <option value="Zelle">Zelle</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                    </select>
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Moneda *</span>
                                    <select
                                        name="moneda"
                                        value={formDataPago.moneda}
                                        onChange={(e) => setFormDataPago({ ...formDataPago, moneda: e.target.value })}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="VES">Bolívares (VES)</option>
                                    </select>
                                </label>

                                <label className="campo medio">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="label-texto">Monto *</span>
                                        <button
                                            type="button"
                                            onClick={handlePagarTodaLaDeuda}
                                            style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            [ Pagar toda la deuda ]
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formDataPago.monto}
                                        onChange={(e) => setFormDataPago({ ...formDataPago, monto: e.target.value })}
                                    />
                                </label>

                                {['Transferencia Bancaria', 'Pago Móvil', 'Zelle'].includes(formDataPago.metodo_pago) && (
                                    <>
                                        <label className="campo medio">
                                            <span className="label-texto">Banco Destino Autorizado *</span>
                                            <select
                                                name="id_banco_destino"
                                                value={formDataPago.id_banco_destino}
                                                onChange={(e) => setFormDataPago({ ...formDataPago, id_banco_destino: e.target.value })}
                                            >
                                                <option value="">Seleccione banco receptor...</option>
                                                {bancos.map(b => (
                                                    <option key={b.id_banco} value={b.id_banco}>{b.nombre_banco}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="campo medio">
                                            <span className="label-texto">N° de Referencia Bancaria *</span>
                                            <input
                                                type="text"
                                                placeholder="Ej. 00192837"
                                                value={formDataPago.num_referencia}
                                                onChange={(e) => setFormDataPago({ ...formDataPago, num_referencia: e.target.value })}
                                            />
                                        </label>
                                    </>
                                )}

                                <label className="campo ancho-completo">
                                    <span className="label-texto">Concepto / Descripción *</span>
                                    <input
                                        type="text"
                                        placeholder="Ej. Pago de abono inicial"
                                        value={formDataPago.descripcion}
                                        onChange={(e) => setFormDataPago({ ...formDataPago, descripcion: e.target.value })}
                                    />
                                </label>
                            </fieldset>
                            <footer className="acciones-formulario">
                                <button type="button" className="boton-cancelar" onClick={() => setModalPagoAbierto(false)}>Cancelar</button>
                                <button type="submit" className="boton-guardar" disabled={guardandoPago}>Registrar Transacción</button>
                            </footer>
                        </form>
                    </article>
                </aside>
            )}

            {/* MODAL HISTORIAL DE PAGOS */}
            {modalHistorialAbierto && reservaSeleccionadaHistorial && (
                <aside className="overlay-modal" onClick={() => setModalHistorialAbierto(false)}>
                    <article className="contenido-modal modal-detalle" onClick={(e) => e.stopPropagation()}>
                        <header className="encabezado-modal">
                            <h2 className="titulo-modal">Historial - Reserva N° {reservaSeleccionadaHistorial.codigo_reserva}</h2>
                            <button type="button" className="boton-cerrar-modal" onClick={() => setModalHistorialAbierto(false)}>&times;</button>
                        </header>
                        <section className="cuerpo-modal-detalle">
                            <table className="tabla-huespedes">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Método</th>
                                        <th>Referencia</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagos.filter(p => Number(p.codigo_reserva) === Number(reservaSeleccionadaHistorial.codigo_reserva)).map(p => (
                                        <tr key={p.id_pago}>
                                            <td>{new Date(p.fecha_pago).toLocaleDateString()}</td>
                                            <td>{p.metodo_pago}</td>
                                            <td>{p.num_referencia || 'N/A'}</td>
                                            <td><strong>{Number(p.monto).toFixed(2)} {p.moneda}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                        <footer className="acciones-modal-detalle">
                            <button type="button" className="boton-cancelar" onClick={() => setModalHistorialAbierto(false)}>Cerrar</button>
                        </footer>
                    </article>
                </aside>
            )}

            {/* MODAL DE ALERTAS GLOBAL */}
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
                                    <button type="button" className="boton-alerta-secundario" onClick={() => setAlerta(prev => ({ ...prev, abierto: false }))}>Cancelar</button>
                                    <button type="button" className="boton-alerta-peligro" onClick={() => { setAlerta(prev => ({ ...prev, abierto: false })); if (alerta.accionConfirmar) alerta.accionConfirmar(); }}>Aceptar</button>
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