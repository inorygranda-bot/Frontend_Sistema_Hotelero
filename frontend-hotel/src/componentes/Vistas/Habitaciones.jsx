import React, { useState, useEffect } from 'react';
import '../../estilos/habitaciones.css';

const API_HABITACIONES_URL = 'http://localhost:3000/api/habitaciones';
const API_TIPOS_URL = 'http://localhost:3000/api/tipos-habitacion';

export default function Habitaciones() {
  const [pestannaActiva, setPestannaActiva] = useState('HABITACIONES');
  const [habitaciones, setHabitaciones] = useState([]);
  const [tiposHabitacion, setTiposHabitacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  // Estados del modal de formulario de Habitaciones (Crear / Editar)
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR');
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState({});

  const estadoInicialFormHabitacion = {
    codigo_habitacion: '',
    id_tipo_habitacion: '',
    piso: '',
    capacidad: '',
    estado: 'Disponible',
    amenidades: ''
  };

  const [formDataHabitacion, setFormDataHabitacion] = useState(estadoInicialFormHabitacion);

  // Estados del modal de formulario de Tipos de Habitación (Crear / Editar)
  const [modalTipoAbierto, setModalTipoAbierto] = useState(false);
  const [modoTipoModal, setModoTipoModal] = useState('CREAR');
  const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);
  const [guardandoTipo, setGuardandoTipo] = useState(false);
  const [erroresTipoForm, setErroresTipoForm] = useState({});
  const estadoInicialFormTipo = {
    nombre_tipo: '',
    descripcion: ''
  };
  const [formDataTipo, setFormDataTipo] = useState(estadoInicialFormTipo);

  // Modal de detalle de habitación
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

  // Función helper para obtener el ID de usuario de forma 100% segura
  const obtenerIdUsuarioActual = () => {
    try {
      // Buscamos primero en 'sesion_activa' que es como guardas la sesión actual
      const sesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
      
      // Verificamos si el id_usuario existe directamente
      if (sesion.id_usuario) {
        return Number(sesion.id_usuario);
      }
      // Si está anidado
      if (sesion.usuario && sesion.usuario.id_usuario) {
        return Number(sesion.usuario.id_usuario);
      }
    } catch (e) {
      console.error("Error leyendo localStorage:", e);
    }
    
    return 1;
  };

  const cargarDatos = async () => {
    setLoading(true);
    setErrorTabla(null);

    try {
      const respHabitaciones = await fetch(API_HABITACIONES_URL);
      if (respHabitaciones.ok) {
        const datosHabitaciones = await respHabitaciones.json();
        setHabitaciones(Array.isArray(datosHabitaciones) ? datosHabitaciones : []);
      } else {
        setHabitaciones([]);
      }
    } catch (errHab) {
      console.error('Error al cargar habitaciones:', errHab);
      setHabitaciones([]);
    }

    try {
      const respTipos = await fetch(API_TIPOS_URL);
      if (respTipos.ok) {
        const datosTipos = await respTipos.json();
        setTiposHabitacion(Array.isArray(datosTipos) ? datosTipos : []);
      } else {
        setTiposHabitacion([]);
      }
    } catch (errTipos) {
      console.error('Error al cargar tipos de habitación:', errTipos);
      setTiposHabitacion([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const validarCampoHabitacion = (nombre, valor) => {
    let error = '';
    if (nombre === 'codigo_habitacion') {
      if (!valor && valor !== 0) error = 'El número de habitación es obligatorio.';
      else if (!/^\d+$/.test(valor)) error = 'Solo se permiten números.';
    }
    if (nombre === 'id_tipo_habitacion' && !valor) error = 'Seleccione un tipo de habitación.';
    if (nombre === 'piso' && !valor.trim()) error = 'El piso es obligatorio.';
    if (nombre === 'capacidad') {
      if (!valor) error = 'La capacidad es obligatoria.';
      else if (!/^\d+$/.test(valor) || Number(valor) <= 0) error = 'Debe ser mayor a 0.';
    }
    if (nombre === 'amenidades' && !valor.trim()) error = 'Indique las amenidades.';
    return error;
  };

  const handleChangeHabitacion = (e) => {
    const { name, value } = e.target;
    setFormDataHabitacion((prev) => ({ ...prev, [name]: value }));
    const errorMensaje = validarCampoHabitacion(name, value);
    setErroresForm((prev) => ({ ...prev, [name]: errorMensaje }));
  };

  const validarCampoTipo = (nombre, valor) => {
    let error = '';
    if (nombre === 'nombre_tipo' && !valor.trim()) error = 'El nombre es obligatorio.';
    if (nombre === 'descripcion' && !valor.trim()) error = 'La descripción es obligatoria.';
    return error;
  };

  const handleChangeTipo = (e) => {
    const { name, value } = e.target;
    setFormDataTipo((prev) => ({ ...prev, [name]: value }));
    const errorMensaje = validarCampoTipo(name, value);
    setErroresTipoForm((prev) => ({ ...prev, [name]: errorMensaje }));
  };

  const abrirModalCrearHabitacion = () => {
    setFormDataHabitacion(estadoInicialFormHabitacion);
    setErroresForm({});
    setModoModal('CREAR');
    setModalFormAbierto(true);
  };

  const abrirModalEditarHabitacion = (habitacion) => {
    setFormDataHabitacion({
      codigo_habitacion: habitacion.codigo_habitacion,
      id_tipo_habitacion: habitacion.id_tipo_habitacion || '',
      piso: habitacion.piso || '',
      capacidad: habitacion.capacidad || '',
      estado: habitacion.estado || 'Disponible',
      amenidades: habitacion.amenidades || ''
    });
    setErroresForm({});
    setModoModal('EDITAR');
    setModalFormAbierto(true);
    if (modalDetalleAbierto) cerrarDetalle();
  };

  const cerrarModalFormHabitacion = () => {
    if (guardando) return;
    setModalFormAbierto(false);
    setFormDataHabitacion(estadoInicialFormHabitacion);
    setErroresForm({});
  };

  const confirmarEliminacionHabitacion = (codigoHabitacion) => {
    if (modalDetalleAbierto) cerrarDetalle();
    setAlerta({
      abierto: true,
      tipo: 'confirmar',
      titulo: '¿Eliminar Habitación?',
      mensaje: `¿Estás seguro de que deseas eliminar la habitación N° ${codigoHabitacion}? Esta acción no se puede deshacer.`,
      accionConfirmar: () => eliminarHabitacion(codigoHabitacion),
      textoConfirmar: 'Sí, eliminar'
    });
  };

  const eliminarHabitacion = async (codigoHabitacion) => {
    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(`${API_HABITACIONES_URL}/${codigoHabitacion}?id_usuario=${idUsuarioActual}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || 'No se pudo eliminar la habitación.');
      }

      cerrarDetalle();
      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Habitación Eliminada!',
        mensaje: data.mensaje || 'La habitación fue eliminada exitosamente.'
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

  const handleSubmitHabitacion = async (e) => {
    e.preventDefault();
    const erroresTemp = {};
    Object.keys(formDataHabitacion).forEach((key) => {
      const err = validarCampoHabitacion(key, formDataHabitacion[key]);
      if (err) erroresTemp[key] = err;
    });

    if (Object.keys(erroresTemp).length > 0) {
      setErroresForm(erroresTemp);
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Formulario Incompleto',
        mensaje: 'Por favor, revise los campos marcados antes de guardar la habitación.'
      });
      return;
    }

    setGuardando(true);
    const esCrear = modoModal === 'CREAR';
    const url = esCrear ? API_HABITACIONES_URL : `${API_HABITACIONES_URL}/${formDataHabitacion.codigo_habitacion}`;
    const metodo = esCrear ? 'POST' : 'PUT';
    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formDataHabitacion,
          id_usuario: idUsuarioActual
        })
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json().catch(() => ({}));
        throw new Error(errData.mensaje || 'Error al guardar la habitación.');
      }

      cerrarModalFormHabitacion();
      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: esCrear ? '¡Habitación Creada!' : '¡Habitación Actualizada!',
        mensaje: esCrear ? 'La habitación fue registrada correctamente.' : 'Datos actualizados.'
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Guardar',
        mensaje: err.message
      });
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCrearTipo = () => {
    setFormDataTipo(estadoInicialFormTipo);
    setErroresTipoForm({});
    setModoTipoModal('CREAR');
    setTipoSeleccionadoId(null);
    setModalTipoAbierto(true);
  };

  const abrirModalEditarTipo = (tipo) => {
    setFormDataTipo({
      nombre_tipo: tipo.nombre_tipo || '',
      descripcion: tipo.descripcion || ''
    });
    setErroresTipoForm({});
    setModoTipoModal('EDITAR');
    setTipoSeleccionadoId(tipo.id_tipo_habitacion);
    setModalTipoAbierto(true);
  };

  const cerrarModalTipo = () => {
    if (guardandoTipo) return;
    setModalTipoAbierto(false);
    setFormDataTipo(estadoInicialFormTipo);
    setErroresTipoForm({});
  };

  const handleSubmitTipo = async (e) => {
    e.preventDefault();
    const erroresTemp = {};
    Object.keys(formDataTipo).forEach((key) => {
      const err = validarCampoTipo(key, formDataTipo[key]);
      if (err) erroresTemp[key] = err;
    });

    if (Object.keys(erroresTemp).length > 0) {
      setErroresTipoForm(erroresTemp);
      return;
    }

    setGuardandoTipo(true);
    const esCrear = modoTipoModal === 'CREAR';
    const url = esCrear ? API_TIPOS_URL : `${API_TIPOS_URL}/${tipoSeleccionadoId}`;
    const metodo = esCrear ? 'POST' : 'PUT';
    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formDataTipo,
          id_usuario: idUsuarioActual
        })
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json().catch(() => ({}));
        throw new Error(errData.mensaje || 'No se pudo guardar el tipo de habitación.');
      }

      cerrarModalTipo();
      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: esCrear ? '¡Tipo Registrado!' : '¡Tipo Actualizado!',
        mensaje: esCrear ? 'El nuevo tipo de habitación fue guardado con éxito.' : 'Se actualizaron los datos del tipo de habitación.'
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Registrar Tipo',
        mensaje: err.message
      });
    } finally {
      setGuardandoTipo(false);
    }
  };

  const confirmarEliminacionTipo = (tipo) => {
    setAlerta({
      abierto: true,
      tipo: 'confirmar',
      titulo: '¿Eliminar Tipo de Habitación?',
      mensaje: `¿Estás seguro de eliminar el tipo "${tipo.nombre_tipo}"? Si hay habitaciones asociadas, el sistema bloqueará la acción.`,
      accionConfirmar: () => eliminarTipo(tipo.id_tipo_habitacion),
      textoConfirmar: 'Sí, eliminar'
    });
  };

  const eliminarTipo = async (idTipo) => {
    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(`${API_TIPOS_URL}/${idTipo}?id_usuario=${idUsuarioActual}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || 'No se pudo eliminar el tipo de habitación.');
      }

      cargarDatos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Tipo Eliminado!',
        mensaje: data.mensaje || 'Tipo de habitación eliminado exitosamente.'
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

  const habitacionesFiltradas = habitaciones.filter((h) => {
    const coincideBusqueda = h.codigo_habitacion?.toString().includes(busqueda.trim());
    const coincideEstado =
      filtroEstado === 'TODAS' ||
      h.estado?.toLowerCase() === filtroEstado.toLowerCase();
    return coincideBusqueda && coincideEstado;
  });

  const tiposFiltrados = tiposHabitacion.filter((t) =>
    t.nombre_tipo?.toLowerCase().includes(busqueda.trim().toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const abrirDetalle = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setModalDetalleAbierto(true);
  };

  const cerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setHabitacionSeleccionada(null);
  };

  const ejecutarAccion = async (endpoint, body = {}) => {
    if (!habitacionSeleccionada) return;

    const idUsuarioActual = obtenerIdUsuarioActual();

    try {
      const respuesta = await fetch(`${API_HABITACIONES_URL}/${habitacionSeleccionada.codigo_habitacion}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          id_usuario: idUsuarioActual
        })
      });

      if (!respuesta.ok) {
        const err = await respuesta.json().catch(() => ({}));
        throw new Error(err.mensaje || 'Error al ejecutar la acción.');
      }

      await cargarDatos();
      cerrarDetalle();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Operación Exitosa!',
        mensaje: `Habitación N° ${habitacionSeleccionada.codigo_habitacion} actualizada.`
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error en la Operación',
        mensaje: err.message
      });
    }
  };

  return (
    <section className="contenedor-habitaciones">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Gestión de Habitaciones</h1>
        <p className="subtitulo-vista">Control de estado, tipologías y ocupación hotelera</p>
      </header>

      <nav className="pestañas-navegacion">
        <button
          type="button"
          className={`boton-pestanna ${pestannaActiva === 'HABITACIONES' ? 'activa' : ''}`}
          onClick={() => setPestannaActiva('HABITACIONES')}
        >
          Habitaciones
        </button>
        <button
          type="button"
          className={`boton-pestanna ${pestannaActiva === 'TIPOS' ? 'activa' : ''}`}
          onClick={() => setPestannaActiva('TIPOS')}
        >
          Tipos de Habitación
        </button>
      </nav>

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
              placeholder={pestannaActiva === 'HABITACIONES' ? "Buscar por N° de habitación..." : "Buscar tipo de habitación..."}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>

          {pestannaActiva === 'HABITACIONES' && (
            <label className="caja-filtro">
              <select
                className="select-filtro"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="TODAS">Estado: Todos</option>
                <option value="Disponible">Disponibles</option>
                <option value="Ocupada">Ocupadas</option>
                <option value="Sucia">Sucias</option>
                <option value="Fuera de servicio">Fuera de servicio</option>
              </select>
            </label>
          )}
        </section>

        <section className="grupo-acciones-barra">
          <button type="button" className="boton-secundario-barra" onClick={abrirModalCrearTipo}>
            <span>+ Tipo de Habitación</span>
          </button>
          <button type="button" className="boton-agregar" onClick={abrirModalCrearHabitacion}>
            <span>+ Nueva Habitación</span>
          </button>
        </section>
      </section>

      {loading ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando información desde la base de datos...</p>
        </article>
      ) : errorTabla ? (
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarDatos} className="boton-reintentar-tabla">
            Reintentar
          </button>
        </aside>
      ) : pestannaActiva === 'HABITACIONES' ? (
        <section className="grid-habitaciones">
          {habitacionesFiltradas.length > 0 ? (
            habitacionesFiltradas.map((h) => (
              <article key={h.codigo_habitacion} className="tarjeta-habitacion">
                <header className="cabecera-tarjeta">
                  <h2 className="numero-habitacion">Hab. {h.codigo_habitacion}</h2>
                  <span className={`badge-estado badge-${h.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {h.estado}
                  </span>
                </header>

                <p className="tipo-habitacion">{h.nombre_tipo || h.tipo || 'Habitación Hotelera'}</p>
                <p className="huesped-info">
                  {h.estado === 'Ocupada' && h.nombre_huesped
                    ? `Huésped: ${h.nombre_huesped}`
                    : `Piso ${h.piso} • Capacidad: ${h.capacidad} pers.`}
                </p>

                <footer className="pie-tarjeta">
                  <button
                    type="button"
                    className="boton-ver-detalles"
                    onClick={() => abrirDetalle(h)}
                  >
                    Ver detalles
                  </button>
                  <nav className="grupo-acciones-tarjeta">
                    <button
                      type="button"
                      className="boton-menu boton-eliminar-tarjeta"
                      title="Eliminar Habitación"
                      onClick={() => {
                        confirmarEliminacionHabitacion(h.codigo_habitacion);
                      }}
                    >
                      🗑️
                    </button>
                    <button
                      type="button"
                      className="boton-menu"
                      title="Editar Habitación"
                      onClick={() => abrirModalEditarHabitacion(h)}
                    >
                      ✏️
                    </button>
                  </nav>
                </footer>
              </article>
            ))
          ) : (
            <article className="sin-resultados">
              <p>No se encontraron habitaciones registradas con los filtros aplicados.</p>
            </article>
          )}
        </section>
      ) : (
        <article className="tarjeta-tabla">
          <table className="tabla-huespedes">
            <thead>
              <tr>
                <th>Nombre del Tipo</th>
                <th>Descripción / Detalles</th>
                <th className="texto-derecha">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiposFiltrados.length > 0 ? (
                tiposFiltrados.map((tipo) => (
                  <tr key={tipo.id_tipo_habitacion}>
                    <td>
                      <strong className="nombre-persona">{tipo.nombre_tipo}</strong>
                    </td>
                    <td>
                      <p className="correo-persona">{tipo.descripcion}</p>
                    </td>
                    <td className="texto-derecha">
                      <nav className="grupo-acciones">
                        <button
                          type="button"
                          className="boton-accion"
                          title="Editar Tipo"
                          onClick={() => abrirModalEditarTipo(tipo)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="boton-accion peligro"
                          title="Eliminar Tipo"
                          onClick={() => confirmarEliminacionTipo(tipo)}
                        >
                          🗑️
                        </button>
                      </nav>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="tabla-vacia">
                    No se encontraron tipos de habitación registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>
      )}

      {modalFormAbierto && (
        <aside className="overlay-modal" onClick={cerrarModalFormHabitacion}>
          <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                {modoModal === 'CREAR' ? 'Registrar Nueva Habitación' : `Editar Habitación N° ${formDataHabitacion.codigo_habitacion}`}
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalFormHabitacion}>
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmitHabitacion} className="formulario-huesped" noValidate>
              <fieldset className="grupo-campos">
                <legend className="leyenda-formulario">Detalles de la Habitación</legend>

                <label className="campo medio">
                  <span className="label-texto">N° de Habitación (Código) *</span>
                  <input
                    type="number"
                    name="codigo_habitacion"
                    placeholder="Ej. 101"
                    value={formDataHabitacion.codigo_habitacion}
                    onChange={handleChangeHabitacion}
                    disabled={modoModal === 'EDITAR'}
                    className={erroresForm.codigo_habitacion ? 'input-error' : ''}
                  />
                  {erroresForm.codigo_habitacion && <span className="texto-error-campo">{erroresForm.codigo_habitacion}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Tipo de Habitación *</span>
                  <select name="id_tipo_habitacion" value={formDataHabitacion.id_tipo_habitacion} onChange={handleChangeHabitacion}>
                    <option value="">Seleccione un tipo...</option>
                    {tiposHabitacion.map((t) => (
                      <option key={t.id_tipo_habitacion} value={t.id_tipo_habitacion}>
                        {t.nombre_tipo}
                      </option>
                    ))}
                  </select>
                  {erroresForm.id_tipo_habitacion && <span className="texto-error-campo">{erroresForm.id_tipo_habitacion}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Piso *</span>
                  <input
                    type="text"
                    name="piso"
                    placeholder="Ej. Piso 1"
                    value={formDataHabitacion.piso}
                    onChange={handleChangeHabitacion}
                    className={erroresForm.piso ? 'input-error' : ''}
                  />
                  {erroresForm.piso && <span className="texto-error-campo">{erroresForm.piso}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Capacidad (Personas) *</span>
                  <input
                    type="number"
                    name="capacidad"
                    placeholder="Ej. 2"
                    value={formDataHabitacion.capacidad}
                    onChange={handleChangeHabitacion}
                    className={erroresForm.capacidad ? 'input-error' : ''}
                  />
                  {erroresForm.capacidad && <span className="texto-error-campo">{erroresForm.capacidad}</span>}
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Estado Inicial</span>
                  <select name="estado" value={formDataHabitacion.estado} onChange={handleChangeHabitacion}>
                    <option value="Disponible">Disponible</option>
                    <option value="Ocupada">Ocupada</option>
                    <option value="Sucia">Sucia</option>
                    <option value="Fuera de servicio">Fuera de servicio</option>
                  </select>
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Amenidades y Comodidades *</span>
                  <input
                    type="text"
                    name="amenidades"
                    placeholder="Ej. Aire acondicionado, TV por cable, Wi-Fi"
                    value={formDataHabitacion.amenidades}
                    onChange={handleChangeHabitacion}
                    className={erroresForm.amenidades ? 'input-error' : ''}
                  />
                  {erroresForm.amenidades && <span className="texto-error-campo">{erroresForm.amenidades}</span>}
                </label>
              </fieldset>

              <footer className="acciones-formulario">
                <button type="button" className="boton-cancelar" onClick={cerrarModalFormHabitacion} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar" disabled={guardando}>
                  {guardando ? (
                    <span className="flex-cargando">
                      <span className="spinner-pequeño"></span> Guardando...
                    </span>
                  ) : (
                    modoModal === 'CREAR' ? 'Guardar Habitación' : 'Actualizar Habitación'
                  )}
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}

      {modalTipoAbierto && (
        <aside className="overlay-modal" onClick={cerrarModalTipo}>
          <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">
                {modoTipoModal === 'CREAR' ? 'Registrar Nuevo Tipo de Habitación' : 'Editar Tipo de Habitación'}
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalTipo}>
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmitTipo} className="formulario-huesped" noValidate>
              <fieldset className="grupo-campos">
                <legend className="leyenda-formulario">Detalles de Tipología</legend>

                <label className="campo ancho-completo">
                  <span className="label-texto">Nombre del Tipo *</span>
                  <input
                    type="text"
                    name="nombre_tipo"
                    placeholder="Ej. Suite Ejecutiva, Doble Deluxe..."
                    value={formDataTipo.nombre_tipo}
                    onChange={handleChangeTipo}
                    className={erroresTipoForm.nombre_tipo ? 'input-error' : ''}
                  />
                  {erroresTipoForm.nombre_tipo && <span className="texto-error-campo">{erroresTipoForm.nombre_tipo}</span>}
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Descripción *</span>
                  <input
                    type="text"
                    name="descripcion"
                    placeholder="Ej. Habitación amplia con vista al mar..."
                    value={formDataTipo.descripcion}
                    onChange={handleChangeTipo}
                    className={erroresTipoForm.descripcion ? 'input-error' : ''}
                  />
                  {erroresTipoForm.descripcion && <span className="texto-error-campo">{erroresTipoForm.descripcion}</span>}
                </label>
              </fieldset>

              <footer className="acciones-formulario">
                <button type="button" className="boton-cancelar" onClick={cerrarModalTipo} disabled={guardandoTipo}>
                  Cancelar
                </button>
                <button type="submit" className="boton-guardar" disabled={guardandoTipo}>
                  {guardandoTipo ? (
                    <span className="flex-cargando">
                      <span className="spinner-pequeño"></span> Guardando...
                    </span>
                  ) : (
                    modoTipoModal === 'CREAR' ? 'Guardar Tipo' : 'Actualizar Tipo'
                  )}
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}

      {modalDetalleAbierto && habitacionSeleccionada && (
        <aside className="overlay-modal" onClick={cerrarDetalle}>
          <article className="contenido-modal modal-detalle" onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <hgroup className="titulo-modal-grupo">
                <h2 className="titulo-modal">Habitación N° {habitacionSeleccionada.codigo_habitacion}</h2>
                <span className="subtitulo-modal-tipo">
                  {habitacionSeleccionada.nombre_tipo || habitacionSeleccionada.tipo || 'Tipo Estándar'}
                </span>
              </hgroup>
              <span className={`badge-estado badge-${habitacionSeleccionada.estado?.toLowerCase().replace(/\s+/g, '-')}`}>
                {habitacionSeleccionada.estado}
              </span>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarDetalle}>
                &times;
              </button>
            </header>

            <section className="cuerpo-modal-detalle">
              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Información General</h3>
                <section className="grid-info-tarjetas">
                  <article className="item-info-mini">
                    <span className="label-mini">Piso</span>
                    <strong className="valor-mini">{habitacionSeleccionada.piso || 'N/A'}</strong>
                  </article>
                  <article className="item-info-mini">
                    <span className="label-mini">Capacidad</span>
                    <strong className="valor-mini">{habitacionSeleccionada.capacidad} Personas</strong>
                  </article>
                </section>
                <article className="box-amenidades">
                  <span className="label-mini">Amenidades e Instalaciones</span>
                  <p className="texto-amenidades">{habitacionSeleccionada.amenidades || 'Sin especificaciones adicionales'}</p>
                </article>
              </section>

              <section className="seccion-bloque-detalle">
                <h3 className="titulo-seccion-detalle">Estado Actual</h3>

                {habitacionSeleccionada.estado === 'Disponible' && (
                  <article className="estado-indicador disponible">
                    <span className="icono-estado-circulo">✓</span>
                    <section className="texto-estado-info">
                      <strong>Disponible y Preparada</strong>
                      <p>Lista para check-in inmediato de huéspedes.</p>
                    </section>
                  </article>
                )}

                {habitacionSeleccionada.estado === 'Ocupada' && (
                  <article className="estado-indicador ocupada">
                    <span className="icono-estado-circulo">👤</span>
                    <section className="texto-estado-info">
                      <strong>Huésped Registrado:</strong>
                      <p className="nombre-huesped-detalle">
                        {habitacionSeleccionada.nombre_huesped || 'Huésped Registrado'}
                      </p>
                      {habitacionSeleccionada.fecha_checkout && (
                        <small>Check-out previsto: {habitacionSeleccionada.fecha_checkout}</small>
                      )}
                    </section>
                  </article>
                )}

                {habitacionSeleccionada.estado === 'Sucia' && (
                  <article className="estado-indicador sucia">
                    <span className="icono-estado-circulo">🧹</span>
                    <section className="texto-estado-info">
                      <strong>Pendiente de Limpieza</strong>
                      <p>Requiere mantenimiento antes de asignarse.</p>
                    </section>
                  </article>
                )}

                {habitacionSeleccionada.estado === 'Fuera de servicio' && (
                  <article className="estado-indicador fuera">
                    <span className="icono-estado-circulo">🛠️</span>
                    <section className="texto-estado-info">
                      <strong>En Mantenimiento</strong>
                      <p>Bloqueada temporalmente por reparaciones.</p>
                    </section>
                  </article>
                )}
              </section>
            </section>

            <footer className="acciones-modal-detalle">
              <button
                type="button"
                className="boton-cancelar"
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>

              <nav className="grupo-botones-derecha">
                <button
                  type="button"
                  className="boton-alerta-reintentar boton-eliminar-detalle"
                  onClick={() => {
                    confirmarEliminacionHabitacion(habitacionSeleccionada.codigo_habitacion);
                  }}
                >
                  Eliminar
                </button>

                <button
                  type="button"
                  className="boton-secundario-barra"
                  onClick={() => abrirModalEditarHabitacion(habitacionSeleccionada)}
                >
                  Editar
                </button>

                {habitacionSeleccionada.estado === 'Disponible' && (
                  <button
                    type="button"
                    className="boton-agregar"
                    onClick={() => ejecutarAccion('checkin', { estado: 'Ocupada' })}
                  >
                    Check-in
                  </button>
                )}

                {habitacionSeleccionada.estado === 'Ocupada' && (
                  <button
                    type="button"
                    className="boton-alerta-reintentar"
                    onClick={() => ejecutarAccion('checkout', { estado: 'Sucia' })}
                  >
                    Check-out
                  </button>
                )}
              </nav>
            </footer>
          </article>
        </aside>
      )}

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
                    {alerta.textoConfirmar || 'Eliminar'}
                  </button>
                </nav>
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