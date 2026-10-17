import React, { useState, useEffect } from 'react';
import '../../estilos/huespedes.css';
import '../../estilos/auditoria.css';

const API_AUDITORIA_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auditoria';

export default function Auditoria() {
  const [registrosAuditoria, setRegistrosAuditoria] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('TODOS');

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  const cargarAuditoria = async () => {
    setCargando(true);
    setErrorTabla(null);
    try {
      const respuesta = await fetch(API_AUDITORIA_URL);
      if (!respuesta.ok) {
        throw new Error('No se pudo obtener el registro de auditoría del servidor.');
      }
      const datos = await respuesta.json();
      if (Array.isArray(datos)) {
        setRegistrosAuditoria(datos);
      }
    } catch (err) {
      console.error("Error al refrescar auditoría:", err);
      setErrorTabla(err.message || 'Error al conectar con la base de datos de auditoría.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAuditoria();
  }, []);

  const abrirDetalle = (registro) => {
    setRegistroSeleccionado(registro);
    setModalDetalleAbierto(true);
  };

  const cerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setRegistroSeleccionado(null);
  };

  const registrosFiltrados = registrosAuditoria.filter((reg) => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto =
      reg.nombre_usuario?.toLowerCase().includes(texto) ||
      reg.correo_usuario?.toLowerCase().includes(texto) ||
      reg.descripcion?.toLowerCase().includes(texto);

    const coincideModulo = filtroModulo === 'TODOS' || reg.modulo?.toUpperCase() === filtroModulo.toUpperCase();

    return coincideTexto && coincideModulo;
  });

  return (
    <section className="contenedor-huespedes contenedor-auditoria">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Auditoría y Trazabilidad del Sistema</h1>
        <p className="subtitulo-vista">Registro detallado de todas las acciones, cambios y accesos de los usuarios</p>
      </header>

      {/* MÉTRICAS RÁPIDAS CON CÁLCULO DIRECTO INLINE */}
      <section className="tarjeta-resumen-auditoria">
        <article className="item-metrica-auditoria">
          <span className="etiqueta-metrica-auditoria">Total de Acciones Registradas</span>
          <strong className="valor-metrica-auditoria">{registrosAuditoria.length}</strong>
          <small className="texto-secundario">Historial general en base de datos</small>
        </article>

        <article className="item-metrica-auditoria">
          <span className="etiqueta-metrica-auditoria">Actividad del Día (Hoy)</span>
          <strong className="valor-metrica-auditoria valor-hoy">
            {
              registrosAuditoria.filter((reg) => {
                if (!reg.fecha_accion) return false;
                const d = new Date(reg.fecha_accion);
                if (isNaN(d.getTime())) return false;
                const hoy = new Date();
                return (
                  d.getFullYear() === hoy.getFullYear() &&
                  d.getMonth() === hoy.getMonth() &&
                  d.getDate() === hoy.getDate()
                );
              }).length
            }
          </strong>
          <small className="texto-secundario">Acciones procesadas hoy</small>
        </article>

        <article className="item-metrica-auditoria">
          <span className="etiqueta-metrica-auditoria">Estado de Monitoreo</span>
          <strong className="valor-metrica-auditoria valor-seguro">Activo y Seguro</strong>
          <small className="texto-secundario">Trazabilidad en tiempo real</small>
        </article>
      </section>

      {/* BARRA DE HERRAMIENTAS Y FILTROS */}
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
              placeholder="Buscar por usuario, correo o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          <label className="caja-filtro">
            <select
              className="select-filtro"
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
            >
              <option value="TODOS">Módulo: Todos</option>
              <option value="Habitaciones">Habitaciones</option>
              <option value="Reservas">Reservas</option>
              <option value="Huéspedes">Huéspedes</option>
              <option value="Finanzas">Finanzas</option>
              <option value="Tarifas">Tarifas</option>
              <option value="Usuarios">Usuarios y Roles</option>
              <option value="Control de emergencia">Control de Emergencia</option>
            </select>
          </label>
        </section>

        <button type="button" className="boton-agregar" onClick={cargarAuditoria}>
          <span>🔄 Actualizar Registro</span>
        </button>
      </section>

      {/* CONTENIDO DE LA TABLA DE AUDITORÍA */}
      {cargando ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando bitácora de auditoría...</p>
        </article>
      ) : errorTabla ? (
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarAuditoria} className="boton-reintentar-tabla">Reintentar</button>
        </aside>
      ) : (
        <article className="tarjeta-tabla">
          <table className="tabla-huespedes">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario Responsable</th>
                <th>Módulo Afectado</th>
                <th>Descripción Detallada</th>
                <th className="texto-derecha">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.length > 0 ? (
                registrosFiltrados.map((reg) => (
                  <tr key={reg.id_auditoria || Math.random()}>
                    <td>
                      <small className="texto-negrita">
                        {reg.fecha_accion ? new Date(reg.fecha_accion).toLocaleString('es-VE') : 'N/A'}
                      </small>
                    </td>
                    <td>
                      <article className="info-persona">
                        <span className="nombre-persona">{reg.nombre_usuario || 'Sistema / Desconocido'}</span>
                        <span className="correo-persona">{reg.correo_usuario || 'N/A'}</span>
                      </article>
                    </td>
                    <td>
                      <span className="badge-modulo">{reg.modulo || 'General'}</span>
                    </td>
                    <td>
                      <p className="descripcion-recortada" title={reg.descripcion}>
                        {reg.descripcion || 'Sin descripción adicional'}
                      </p>
                    </td>
                    <td className="texto-derecha">
                      <button
                        type="button"
                        className="boton-ver-detalles"
                        onClick={() => abrirDetalle(reg)}
                      >
                        Ver Trazabilidad
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="tabla-vacia">
                    No se encontraron registros de auditoría con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>
      )}

      {/* MODAL DE TRAMA / DETALLE DE AUDITORÍA */}
      {modalDetalleAbierto && registroSeleccionado && (
        <aside className="overlay-modal" onClick={cerrarDetalle}>
          <article className="contenido-modal modal-detalle" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <hgroup className="titulo-modal-grupo">
                <h2 className="titulo-modal">Trazabilidad de Auditoría N° #{registroSeleccionado.id_auditoria || '0'}</h2>
                <span className="subtitulo-modal-tipo">Módulo: {registroSeleccionado.modulo}</span>
              </hgroup>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarDetalle}>&times;</button>
            </header>

            <section className="cuerpo-modal-detalle">
              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Información del Evento</h3>
                <section className="grid-info-tarjetas">
                  <article className="item-info-mini">
                    <span className="label-mini">Fecha y Hora</span>
                    <strong className="valor-mini">{new Date(registroSeleccionado.fecha_accion).toLocaleString('es-VE')}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Usuario Responsable</span>
                    <strong className="valor-mini">{registroSeleccionado.nombre_usuario}</strong>
                  </article>
                </section>

                <article className="box-amenidades caja-espaciada">
                  <span className="label-mini">Descripción Completa del Cambio</span>
                  <p className="texto-amenidades texto-espaciado">
                    {registroSeleccionado.descripcion}
                  </p>
                </article>

                {registroSeleccionado.datos_anteriores && (
                  <article className="box-amenidades caja-espaciada">
                    <span className="label-mini">Datos Anteriores (Estado previo)</span>
                    <pre className="bloque-codigo">
                      {typeof registroSeleccionado.datos_anteriores === 'string'
                        ? registroSeleccionado.datos_anteriores
                        : JSON.stringify(registroSeleccionado.datos_anteriores, null, 2)}
                    </pre>
                  </article>
                )}

                {registroSeleccionado.datos_nuevos && (
                  <article className="box-amenidades caja-espaciada">
                    <span className="label-mini">Datos Nuevos (Estado posterior)</span>
                    <pre className="bloque-codigo">
                      {typeof registroSeleccionado.datos_nuevos === 'string'
                        ? registroSeleccionado.datos_nuevos
                        : JSON.stringify(registroSeleccionado.datos_nuevos, null, 2)}
                    </pre>
                  </article>
                )}
              </section>
            </section>

            <footer className="acciones-modal-detalle">
              <button type="button" className="boton-cancelar" onClick={cerrarDetalle}>Cerrar</button>
            </footer>
          </article>
        </aside>
      )}
    </section>
  );
}