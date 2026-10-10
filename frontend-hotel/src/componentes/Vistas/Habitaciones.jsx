import React, { useState, useEffect } from 'react';
import '../../estilos/habitaciones.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/habitaciones';

export default function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  // Modal de detalle
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

  // ====================== CARGAR DATOS ======================
  const cargarHabitaciones = async () => {
    try {
      setLoading(true);
      setErrorTabla(null);
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}: No se pudo obtener las habitaciones.`);
      const datos = await respuesta.json();
      setHabitaciones(datos);
    } catch (err) {
      setErrorTabla(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  // ====================== FILTRADO ======================
  const habitacionesFiltradas = habitaciones.filter((h) => {
    const coincideBusqueda = h.numero?.toString().includes(busqueda.trim());
    const coincideEstado =
      filtroEstado === 'TODAS' ||
      h.estado?.toLowerCase() === filtroEstado.toLowerCase();
    return coincideBusqueda && coincideEstado;
  });

  const contadores = {
    TODAS: habitaciones.length,
    Disponible: habitaciones.filter((h) => h.estado === 'Disponible').length,
    Ocupada: habitaciones.filter((h) => h.estado === 'Ocupada').length,
    Sucia: habitaciones.filter((h) => h.estado === 'Sucia').length,
    'Fuera de servicio': habitaciones.filter((h) => h.estado === 'Fuera de servicio').length
  };

  // ====================== MODAL DETALLE ======================
  const abrirDetalle = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setModalDetalleAbierto(true);
  };

  const cerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setHabitacionSeleccionada(null);
  };

  // ====================== ACCIONES ======================
  const ejecutarAccion = async (endpoint, body = {}) => {
    if (!habitacionSeleccionada) return;

    try {
      const respuesta = await fetch(`${API_URL}/${habitacionSeleccionada.id_habitacion}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!respuesta.ok) {
        const err = await respuesta.json().catch(() => ({}));
        throw new Error(err.mensaje || `Error al ejecutar la acción`);
      }

      await cargarHabitaciones();
      cerrarDetalle();

      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Acción realizada!',
        mensaje: `La habitación ${habitacionSeleccionada.numero} se actualizó correctamente.`
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error',
        mensaje: err.message
      });
    }
  };

  const solicitarCheckOut = () => {
    setAlerta({
      abierto: true,
      tipo: 'confirmar',
      titulo: 'Confirmar Check-out',
      mensaje: `¿Desea realizar el check-out de la habitación ${habitacionSeleccionada?.numero}? La habitación pasará a estado Sucia.`,
      textoConfirmar: 'Sí, Check-out',
      accionConfirmar: () => ejecutarAccion('checkout')
    });
  };

  // ====================== RENDER ======================
  return (
    <section className="contenedor-habitaciones">
      {/* ENCABEZADO */}
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Estado de Habitaciones</h1>
        <p className="subtitulo-vista">Vista general y gestión de todas las habitaciones del hotel</p>
      </header>

      {/* BARRA DE HERRAMIENTAS */}
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
              placeholder="Buscar por habitación..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          <nav className="grupo-filtros-estado">
            {[
              { key: 'TODAS', label: 'Todas', clase: 'filtro-todas' },
              { key: 'Disponible', label: 'Disponibles', clase: 'filtro-disponible' },
              { key: 'Ocupada', label: 'Ocupadas', clase: 'filtro-ocupada' },
              { key: 'Sucia', label: 'Sucias', clase: 'filtro-sucia' },
              { key: 'Fuera de servicio', label: 'Fuera de servicio', clase: 'filtro-fuera' }
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                className={`boton-filtro ${f.clase} ${filtroEstado === f.key ? 'activo' : ''}`}
                onClick={() => setFiltroEstado(f.key)}
              >
                {f.label} ({contadores[f.key] || 0})
              </button>
            ))}
          </nav>
        </section>

        <button type="button" className="boton-agregar">
          <span>+ Nueva Habitación</span>
        </button>
      </section>

      {/* CONTENIDO */}
      {loading ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando habitaciones...</p>
        </article>
      ) : errorTabla ? (
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarHabitaciones} className="boton-reintentar-tabla">
            Reintentar
          </button>
        </aside>
      ) : (
        <section className="grid-habitaciones">
          {habitacionesFiltradas.length > 0 ? (
            habitacionesFiltradas.map((h) => (
              <article key={h.id_habitacion} className="tarjeta-habitacion">
                <header className="cabecera-tarjeta">
                  <h2 className="numero-habitacion">{h.numero}</h2>
                  <span className={`badge-estado badge-${h.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {h.estado}
                  </span>
                </header>

                <p className="tipo-habitacion">{h.tipo}</p>
                <p className="huesped-info">
                  {h.estado === 'Ocupada' && h.nombre_huesped
                    ? h.nombre_huesped
                    : 'Sin huésped asignado'}
                </p>

                <footer className="pie-tarjeta">
                  <button
                    type="button"
                    className="boton-ver-detalles"
                    onClick={() => abrirDetalle(h)}
                  >
                    Ver detalles
                  </button>
                  <button type="button" className="boton-menu" title="Más opciones">
                    ⋮
                  </button>
                </footer>
              </article>
            ))
          ) : (
            <article className="sin-resultados">
              <p>No se encontraron habitaciones con los filtros aplicados.</p>
            </article>
          )}
        </section>
      )}

      {/* ========== MODAL DE DETALLE ========== */}
      {modalDetalleAbierto && habitacionSeleccionada && (
        <aside className="overlay-modal" onClick={cerrarDetalle}>
          <article className="contenido-modal modal-detalle" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                Habitación {habitacionSeleccionada.numero} – {habitacionSeleccionada.tipo}
              </h2>
              <span className={`badge-estado badge-${habitacionSeleccionada.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                {habitacionSeleccionada.estado}
              </span>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarDetalle}>
                &times;
              </button>
            </header>

            <section className="cuerpo-modal-detalle">
              <section className="columna-info">
                <h3>INFORMACIÓN DE HABITACIÓN</h3>
                <ul className="lista-info">
                  <li><span>Piso</span> <strong>Piso {habitacionSeleccionada.piso}</strong></li>
                  <li><span>Capacidad</span> <strong>{habitacionSeleccionada.capacidad}</strong></li>
                  <li><span>Amenidades</span> <strong>{habitacionSeleccionada.amenidades}</strong></li>
                  <li><span>Última limpieza</span> <strong>{habitacionSeleccionada.ultima_limpieza || 'No registrada'}</strong></li>
                </ul>
              </section>

              <section className="columna-estado">
                {habitacionSeleccionada.estado === 'Disponible' && (
                  <>
                    <h3>DISPONIBLE</h3>
                    <p className="icono-estado-grande">✓</p>
                    <p>Habitación libre</p>
                    <p className="texto-secundario">Lista para Check-in o nueva reserva</p>
                    <p className="texto-muted">SIN HUÉSPED ASIGNADO</p>
                    <p className="texto-muted">SIN SALDO PENDIENTE</p>
                  </>
                )}

                {habitacionSeleccionada.estado === 'Ocupada' && (
                  <>
                    <h3>HUÉSPED ACTUAL</h3>
                    <ul className="lista-info">
                      <li><span>Nombre</span> <strong>{habitacionSeleccionada.nombre_huesped || '—'}</strong></li>
                      <li><span>Check-in</span> <strong>{habitacionSeleccionada.check_in || '—'}</strong></li>
                      <li><span>Check-out</span> <strong>{habitacionSeleccionada.check_out || '—'}</strong></li>
                    </ul>
                    <p className="saldo-pendiente">
                      SALDO PENDIENTE<br />
                      <strong className="monto-usd">USD $ {Number(habitacionSeleccionada.saldo_usd || 0).toFixed(2)}</strong><br />
                      <span className="monto-bs">Bs. {Number(habitacionSeleccionada.saldo_bs || 0).toLocaleString('es-VE')}</span>
                      <small>Tasa de cambio oficial: 1 USD = 36.00 Bs</small>
                    </p>
                  </>
                )}

                {habitacionSeleccionada.estado === 'Sucia' && (
                  <>
                    <h3>SUCIA</h3>
                    <p className="texto-secundario">Pendiente de limpieza</p>
                  </>
                )}

                {habitacionSeleccionada.estado === 'Fuera de servicio' && (
                  <>
                    <h3>FUERA DE SERVICIO</h3>
                    <p className="texto-secundario">No disponible temporalmente</p>
                  </>
                )}
              </section>
            </section>

            <footer className="acciones-modal">
              {habitacionSeleccionada.estado === 'Disponible' && (
                <>
                  <button type="button" className="boton-secundario">Ver historial</button>
                  <button type="button" className="boton-secundario">Crear Reserva</button>
                  <button
                    type="button"
                    className="boton-primario"
                    onClick={() => ejecutarAccion('checkin', { nombre_huesped: 'Huésped Temporal' })}
                  >
                    Check-in
                  </button>
                </>
              )}

              {habitacionSeleccionada.estado === 'Ocupada' && (
                <>
                  <button type="button" className="boton-secundario">Extender estadía</button>
                  <button type="button" className="boton-primario" onClick={solicitarCheckOut}>
                    Check-out
                  </button>
                </>
              )}

              {(habitacionSeleccionada.estado === 'Sucia' || habitacionSeleccionada.estado === 'Fuera de servicio') && (
                <button
                  type="button"
                  className="boton-primario"
                  onClick={() => ejecutarAccion('cambiar-estado', { estado: 'Disponible' })}
                >
                  Marcar como Disponible
                </button>
              )}
            </footer>
          </article>
        </aside>
      )}

      {/* ========== MODAL DE ALERTAS ========== */}
      {alerta.abierto && (
        <aside className="overlay-modal z-alto">
          <article className="modal-alerta-tarjeta">
            <header className={`icono-alerta-circulo ${alerta.tipo}`}>
              {alerta.tipo === 'exito' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {alerta.tipo === 'error' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {alerta.tipo === 'confirmar' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                    {alerta.textoConfirmar}
                  </button>
                </>
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