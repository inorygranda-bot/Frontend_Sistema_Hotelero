import React, { useState, useEffect } from 'react';
import '../../estilos/huespedes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/huespedes';

export default function Huespedes() {
  // Estados para la consulta de datos (GET)
  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // Estados para el Modal y Operaciones (POST / PUT / DELETE)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR'); // 'CREAR' | 'EDITAR'
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tipo: 'exito' | 'error', texto: '' }

  // Estado del formulario
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

  // 1. READ (GET): Obtener lista de huéspedes
  const cargarHuespedes = async () => {
    try {
      setLoading(true);
      setError(null);
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: No se pudo obtener la lista de huéspedes.`);
      }
      const datos = await respuesta.json();
      setHuespedes(datos);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHuespedes();
  }, []);

  // Handlers para el Modal y Formulario
  const abrirModalCrear = () => {
    setFormData(estadoInicialForm);
    setModoModal('CREAR');
    setModalAbierto(true);
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
    setModoModal('EDITAR');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalAbierto(false);
    setFormData(estadoInicialForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. CREATE (POST) & UPDATE (PUT): Guardar datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setFeedback(null);

    const esCrear = modoModal === 'CREAR';
    const url = esCrear ? API_URL : `${API_URL}/${formData.id_huesped}`;
    const metodo = esCrear ? 'POST' : 'PUT';

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        throw new Error(errorData.mensaje || `Error ${respuesta.status}: Fallo al procesar solicitud.`);
      }

      setFeedback({
        tipo: 'exito',
        texto: esCrear ? '¡Huésped registrado con éxito!' : '¡Datos de huésped actualizados!'
      });

      cerrarModal();
      cargarHuespedes(); // Refresco automático tras mutaciones exitosas
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  // 3. DELETE: Eliminar o Inactivar registro
  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al huésped "${nombre}"?`)) return;

    try {
      setFeedback(null);
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: No se pudo eliminar el huésped.`);
      }

      setFeedback({ tipo: 'exito', texto: 'Registro eliminado correctamente.' });
      cargarHuespedes(); // Refresco automático
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err.message });
    }
  };

  // Filtrado reactivo en cliente
  const huespedesFiltrados = huespedes.filter((h) => {
    const coincideBusqueda =
      h.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.num_documento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.correo?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado =
      filtroEstado === 'TODOS' || h.estado === filtroEstado;

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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icono-busqueda">
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

        <button type="button" className="boton-agregar" onClick={abrirModalCrear}>
          <span>+ Agregar Huésped</span>
        </button>
      </section>

      {/* Banner de Feedback (Success / Error global) */}
      {feedback && (
        <aside className={`mensaje-feedback ${feedback.tipo}`}>
          <p>{feedback.tipo === 'exito' ? '✅' : '⚠️️'} {feedback.texto}</p>
          <button type="button" onClick={() => setFeedback(null)} className="boton-cerrar-alerta">×</button>
        </aside>
      )}

      {/* Estado Error Global */}
      {error && (
        <aside className="mensaje-error">
          <p>⚠️ {error}</p>
          <button onClick={cargarHuespedes} className="boton-reintentar">Reintentar</button>
        </aside>
      )}

      {/* Estado Cargando (Loading) */}
      {loading ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando huéspedes desde la base de datos...</p>
        </article>
      ) : (
        /* Estado Éxito: Renderizado de Tabla */
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
                          onClick={() => handleEliminar(h.id_huesped, h.nombre)}
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
                    {error ? 'No se pudieron cargar los datos.' : 'No se encontraron huéspedes registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>
      )}

      {/* MODAL SEMÁNTICO DE FORMULARIO (Crear / Editar) */}
      {modalAbierto && (
        <aside className="overlay-modal" onClick={cerrarModal}>
          <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                {modoModal === 'CREAR' ? 'Nuevo Huésped' : 'Editar Huésped'}
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModal}>
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmit} className="formulario-huesped">
              <fieldset className="grupo-campos">
                <legend className="leyenda-formulario">Datos Personales</legend>

                <label className="campo ancho-completo">
                  <span className="label-texto">Nombre Completo *</span>
                  <input
                    type="text"
                    name="nombre"
                    required
                    placeholder="Ej. Ana María Pérez"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
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
                    required
                    placeholder="Ej. 26123456"
                    value={formData.num_documento}
                    onChange={handleChange}
                  />
                </label>

                <label className="campo medio">
                  <span className="label-texto">Correo Electrónico *</span>
                  <input
                    type="email"
                    name="correo"
                    required
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={handleChange}
                  />
                </label>

                <label className="campo medio">
                  <span className="label-texto">Teléfono</span>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Ej. 04121234567"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
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
                  onClick={cerrarModal}
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
    </section>
  );
}