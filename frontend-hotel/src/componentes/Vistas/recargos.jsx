import React, { useState, useEffect } from 'react';
import '../../estilos/huespedes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/recargos';

export default function Recargos() {
  // 1. ESTADOS DE DATOS Y FILTROS
  const [recargos, setRecargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCalculo, setFiltroCalculo] = useState('TODOS');

  // 2. ESTADOS DEL MODAL DE FORMULARIO
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR'); // 'CREAR' | 'EDITAR'
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState({});

  // Estado inicial incluyendo el monto
  const estadoInicialForm = {
    id_recargo: null,
    motivo_recargo: '',
    tipo_operacion: 'Porcentaje',
    tipo_calculo: 'Suma',
    monto: ''
  };
  const [formData, setFormData] = useState(estadoInicialForm);

  // 3. ESTADO DEL MODAL DE ALERTAS / NOTIFICACIONES
  const [alerta, setAlerta] = useState({
    abierto: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
    accionConfirmar: null,
    textoConfirmar: 'Aceptar'
  });

  const cargarRecargos = async () => {
    try {
      setLoading(true);
      setErrorTabla(null);
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: No se pudo obtener la lista de recargos.`);
      }
      const datos = await respuesta.json();
      setRecargos(datos);
    } catch (err) {
      setErrorTabla(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRecargos();
  }, []);

  // --- VALIDACIÓN DE FORMULARIO ---
  const validarCampo = (name, value) => {
    let error = '';
    if (name === 'motivo_recargo') {
      if (!value.trim()) error = 'El motivo del recargo es obligatorio.';
    }
    if (name === 'monto') {
      if (value === '' || value === null) error = 'El monto o valor es obligatorio.';
      else if (isNaN(value) || Number(value) < 0) error = 'Debe ingresar un número válido.';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const errorMensaje = validarCampo(name, value);
    setErroresForm((prev) => ({ ...prev, [name]: errorMensaje }));
  };

  const abrirModalCrear = () => {
    setFormData(estadoInicialForm);
    setErroresForm({});
    setModoModal('CREAR');
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (recargo) => {
    setFormData({
      id_recargo: recargo.id_recargo,
      motivo_recargo: recargo.motivo_recargo || '',
      tipo_operacion: recargo.tipo_operacion || 'Porcentaje',
      tipo_calculo: recargo.tipo_calculo || 'Suma',
      monto: recargo.monto !== undefined ? recargo.monto : ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    const url = esCrear ? API_URL : `${API_URL}/${formData.id_recargo}`;
    const metodo = esCrear ? 'POST' : 'PUT';

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json().catch(() => ({}));
        let mensajeError = errData.mensaje || `Error ${respuesta.status}: Fallo al procesar el recargo.`;
        throw new Error(mensajeError);
      }

      cerrarModalForm();
      cargarRecargos();

      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: esCrear ? '¡Recargo Registrado!' : '¡Datos Actualizados!',
        mensaje: esCrear 
          ? 'El nuevo recargo fue guardado correctamente en la base de datos.'
          : 'La información del recargo ha sido actualizada exitosamente.'
      });

    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Procesar Datos',
        mensaje: err.message,
        accionConfirmar: () => handleSubmit(e)
      });
    } finally {
      setGuardando(false);
    }
  };

  const solicitarEliminar = (id, motivo) => {
    setAlerta({
      abierto: true,
      tipo: 'confirmar',
      titulo: 'Confirmar Eliminación',
      mensaje: `¿Está seguro de eliminar el recargo "${motivo}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, Eliminar',
      accionConfirmar: () => ejecutarEliminacion(id)
    });
  };

  const ejecutarEliminacion = async (id) => {
    try {
      const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error('No se pudo eliminar el recargo seleccionado.');

      cargarRecargos();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: '¡Registro Eliminado!',
        mensaje: 'El recargo ha sido eliminado correctamente del sistema.'
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

  const recargosFiltrados = recargos.filter((r) => {
    const coincideBusqueda = r.motivo_recargo?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCalculo = filtroCalculo === 'TODOS' || r.tipo_calculo === filtroCalculo;
    return coincideBusqueda && coincideCalculo;
  });

  return (
    <section className="contenedor-huespedes">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Módulo de Finanzas - Recargos y Descuentos</h1>
        <p className="subtitulo-vista">Gestión de cargos adicionales y deducciones</p>
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
              placeholder="Buscar por motivo de recargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
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

        <button type="button" className="boton-agregar" onClick={abrirModalCrear}>
          <span>+ Nuevo Recargo</span>
        </button>
      </section>

      {/* ESTADO CARGANDO */}
      {loading ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando recargos desde la base de datos...</p>
        </article>
      ) : errorTabla ? (
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarRecargos} className="boton-reintentar-tabla">Reintentar</button>
        </aside>
      ) : (
        /* TABLA DE RECARGOS */
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
                        <button
                          type="button"
                          className="boton-accion"
                          title="Editar Recargo"
                          onClick={() => abrirModalEditar(r)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="boton-accion peligro"
                          title="Eliminar Recargo"
                          onClick={() => solicitarEliminar(r.id_recargo, r.motivo_recargo)}
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
                    No se encontraron recargos registrados.
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
                {modoModal === 'CREAR' ? 'Nuevo Recargo' : 'Editar Recargo'}
              </h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalForm}>
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmit} className="formulario-huesped" noValidate>
              <fieldset className="grupo-campos">
                <legend className="leyenda-formulario">Detalles Financieros</legend>

                <label className="campo ancho-completo">
                  <span className="label-texto">Motivo del Recargo *</span>
                  <input
                    type="text"
                    name="motivo_recargo"
                    placeholder="Ej. Cargo por mascota, servicio nocturno o descuento especial"
                    value={formData.motivo_recargo}
                    onChange={handleChange}
                    className={erroresForm.motivo_recargo ? 'input-error' : ''}
                  />
                  {erroresForm.motivo_recargo && <span className="texto-error-campo">{erroresForm.motivo_recargo}</span>}
                </label>

                <label className="campo medio">
                  <span className="label-texto">Tipo de Operación *</span>
                  <select name="tipo_operacion" value={formData.tipo_operacion} onChange={handleChange}>
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
                    placeholder="Ej. 10.00 o 15"
                    value={formData.monto}
                    onChange={handleChange}
                    className={erroresForm.monto ? 'input-error' : ''}
                  />
                  {erroresForm.monto && <span className="texto-error-campo">{erroresForm.monto}</span>}
                </label>

                <label className="campo ancho-completo">
                  <span className="label-texto">Tipo de Cálculo *</span>
                  <select name="tipo_calculo" value={formData.tipo_calculo} onChange={handleChange}>
                    <option value="Suma">Suma (+)</option>
                    <option value="Resta">Resta (-)</option>
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
                    modoModal === 'CREAR' ? 'Guardar Recargo' : 'Actualizar Datos'
                  )}
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}

      {/* --- MODAL DE ALERTAS PERSONALIZADO --- */}
      {alerta.abierto && (
        <aside className="overlay-modal z-alto">
          <article className="modal-alerta-tarjeta">
            
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