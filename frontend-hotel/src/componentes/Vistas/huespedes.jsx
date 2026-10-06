import React, { useState, useEffect } from 'react';
import '../../estilos/huespedes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/huespedes';

export default function Huespedes() {
  // 1. ESTADOS DE DATOS Y FILTROS
  const [huespedes, setHuespedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // 2. ESTADOS DEL MODAL DE FORMULARIO
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR'); // 'CREAR' | 'EDITAR'
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState({});

  // Estado inicial del formulario
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

  // 3. ESTADO DEL MODAL DE ALERTAS/NOTIFICACIONES (Éxito, Error, Confirmar)
  const [alerta, setAlerta] = useState({
    abierto: false,
    tipo: 'exito', // 'exito' | 'error' | 'confirmar'
    titulo: '',
    mensaje: '',
    accionConfirmar: null,
    textoConfirmar: 'Aceptar'
  });

  // Cargar lista de huéspedes desde el Backend (GET)
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

  useEffect(() => {
    cargarHuespedes();
  }, []);

  // --- VALIDACIÓN DE FORMULARIO EN TIEMPO REAL ---
  const validarCampo = (name, value) => {
    let error = '';
    if (name === 'nombre') {
      if (!value.trim()) error = 'El nombre es obligatorio.';
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) error = 'Solo se permiten letras.';
    }
    if (name === 'num_documento') {
      if (!value.trim()) error = 'El número de documento es obligatorio.';
      else if (!/^\d+$/.test(value)) error = 'Solo se permiten números.';
    }
    if (name === 'correo') {
      if (!value.trim()) error = 'El correo es obligatorio.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Formato de correo inválido.';
    }
    if (name === 'telefono' && value.trim()) {
      if (!/^\d+$/.test(value)) error = 'Solo se permiten números en el teléfono.';
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

  // --- SUBMIT (CREAR Y EDITAR) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos antes de enviar
    const erroresTemp = {};
    Object.keys(formData).forEach((key) => {
      const err = validarCampo(key, formData[key]);
      if (err) erroresTemp[key] = err;
    });

    if (Object.keys(erroresTemp).length > 0) {
      setErroresForm(erroresTemp);
      return;
    }

    setGuardando(true);
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
        const errData = await respuesta.json().catch(() => ({}));
        let mensajeError = errData.mensaje || `Error ${respuesta.status}: Fallo al procesar.`;
        if (respuesta.status === 400) mensajeError = 'Verifique los campos obligatorios o la duplicidad del documento.';
        else if (respuesta.status === 404) mensajeError = 'El huésped no existe o fue removido.';
        else if (respuesta.status === 500) mensajeError = 'Error interno del servidor. Intente más tarde.';

        throw new Error(mensajeError);
      }

      // Éxito: cerrar modal de formulario y mostrar Modal de Exito
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
        accionConfirmar: () => handleSubmit(e) // Reintentar
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
    try {
      const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error('No se pudo eliminar el registro seleccionado.');

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

        <button type="button" className="boton-agregar" onClick={abrirModalCrear}>
          <span>+ Agregar Huésped</span>
        </button>
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
                  <span className="label-texto">Teléfono</span>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Ej. 04121234567"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={erroresForm.telefono ? 'input-error' : ''}
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

      {/* --- MODAL DE ALERTAS PERSONALIZADO (ÉXITO, ERROR Y CONFIRMACIÓN) --- */}
      {alerta.abierto && (
        <aside className="overlay-modal z-alto">
          <article className="modal-alerta-tarjeta">
            
            {/* Ícono dinámico */}
            <header className={`icono-alerta-circulo ${alerta.tipo}`}>
              {alerta.tipo === 'exito' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {alerta.tipo === 'error' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
              {alerta.tipo === 'confirmar' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
            </header>

            <h3 className="titulo-alerta">{alerta.titulo}</h3>
            <p className="mensaje-alerta">{alerta.mensaje}</p>

            {/* Acciones según tipo de alerta */}
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
                <>
                  {alerta.accionConfirmar && (
                    <button
                      type="button"
                      className="boton-alerta-reintentar"
                      onClick={() => {
                        setAlerta((prev) => ({ ...prev, abierto: false }));
                        alerta.accionConfirmar();
                      }}
                    >
                      Reintentar
                    </button>
                  )}
                  <button
                    type="button"
                    className="boton-alerta-secundario"
                    onClick={() => setAlerta((prev) => ({ ...prev, abierto: false }))}
                  >
                    Cerrar
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