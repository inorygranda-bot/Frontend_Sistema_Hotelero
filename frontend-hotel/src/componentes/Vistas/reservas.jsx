import React, { useState, useEffect } from 'react';
import '../../estilos/reservas.css'; // O el archivo de estilos correspondiente

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/reservas';

export default function Reservas() {
  // 1. ESTADOS DE DATOS Y FILTROS
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorTabla, setErrorTabla] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  // 2. ESTADOS DEL MODAL DE FORMULARIO
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('CREAR'); // 'CREAR' | 'EDITAR'
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState({});

  // Estado inicial del formulario de reservas
  const estadoInicialForm = {
    id_reserva: null,
    id_huesped: '',
    id_habitacion: '',
    fecha_ingreso: '',
    fecha_salida: '',
    estado: 'PENDIENTE'
  };
  const [formData, setFormData] = useState(estadoInicialForm);

  // 3. ESTADO DEL MODAL DE ALERTAS/NOTIFICACIONES
  const [alerta, setAlerta] = useState({
    abierto: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
    accionConfirmar: null,
    textoConfirmar: 'Aceptar'
  });

  // Cargar lista de reservas desde el Backend (GET)
  const cargarReservas = async () => {
    try {
      setLoading(true);
      setErrorTabla(null);
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: No se pudo obtener la lista de reservas.`);
      }
      const datos = await respuesta.json();
      setReservas(datos);
    } catch (err) {
      setErrorTabla(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  // --- MANEJADOR DE CAMBIOS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const abrirModalCrear = () => {
    setFormData(estadoInicialForm);
    setErroresForm({});
    setModoModal('CREAR');
    setModalFormAbierto(true);
  };

  const cerrarModalForm = () => {
    if (guardando) return;
    setModalFormAbierto(false);
    setFormData(estadoInicialForm);
    setErroresForm({});
  };

  // --- PREPARAR EDICIÓN ---
  const prepararEdicion = (reserva) => {
    setFormData({
      id_reserva: reserva.id_reserva,
      id_huesped: reserva.id_huesped || '',
      id_habitacion: reserva.id_habitacion || '',
      fecha_ingreso: reserva.fecha_ingreso || '',
      fecha_salida: reserva.fecha_salida || '',
      estado: reserva.estado || 'PENDIENTE'
    });
    setErroresForm({});
    setModoModal('EDITAR');
    setModalFormAbierto(true);
  };

  // --- FILTRAR RESERVAS ---
  const reservasFiltradas = reservas.filter((r) => {
    const textoBusqueda = busqueda.toLowerCase();
    const idReservaStr = String(r.id_reserva || '').toLowerCase();
    const huespedStr = String(r.nombre_huesped || r.id_huesped || '').toLowerCase();
    const habitacionStr = String(r.id_habitacion || '').toLowerCase();
    
    return (
      idReservaStr.includes(textoBusqueda) ||
      huespedStr.includes(textoBusqueda) ||
      habitacionStr.includes(textoBusqueda)
    );
  });

  // --- SUBMIT (CREAR Y EDITAR) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const esCrear = modoModal === 'CREAR';
    const url = esCrear ? API_URL : `${API_URL}/${formData.id_reserva}`;
    const metodo = esCrear ? 'POST' : 'PUT';

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!respuesta.ok) {
        throw new Error('Fallo al procesar la reserva en el servidor.');
      }

      cerrarModalForm();
      cargarReservas();
      setAlerta({
        abierto: true,
        tipo: 'exito',
        titulo: esCrear ? '¡Reserva Registrada!' : '¡Reserva Actualizada!',
        mensaje: 'La operación se realizó exitosamente.'
      });
    } catch (err) {
      setAlerta({
        abierto: true,
        tipo: 'error',
        titulo: 'Error al Procesar',
        mensaje: err.message
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="contenedor-huespedes">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Gestión de Reservas</h1>
        <p className="subtitulo-vista">Control y seguimiento de habitaciones reservadas</p>
      </header>

      {/* Barra de herramientas */}
      <section className="barra-herramientas">
        <section className="grupo-controles">
          <input
            type="search"
            className="input-busqueda"
            placeholder="Buscar reserva..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </section>
        <button type="button" className="boton-agregar" onClick={abrirModalCrear}>
          <span>+ Nueva Reserva</span>
        </button>
      </section>

      {/* ESTADO CARGANDO / TABLA */}
      {loading ? (
        <article className="caja-cargando">
          <span className="spinner"></span>
          <p>Cargando reservas...</p>
        </article>
      ) : errorTabla ? (
        <aside className="mensaje-error">
          <p>⚠️ {errorTabla}</p>
          <button onClick={cargarReservas} className="boton-reintentar-tabla">Reintentar</button>
        </aside>
      ) : (
        <article className="tarjeta-tabla">
          <table className="tabla-huespedes">
            <thead>
              <tr>
                <th>ID Reserva</th>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Ingreso</th>
                <th>Salida</th>
                <th>Estado</th>
                <th className="texto-derecha">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.length > 0 ? (
                reservasFiltradas.map((r) => (
                  <tr key={r.id_reserva}>
                    <td>#{r.id_reserva}</td>
                    <td>{r.nombre_huesped || r.id_huesped}</td>
                    <td>Hab. {r.id_habitacion}</td>
                    <td>{r.fecha_ingreso}</td>
                    <td>{r.fecha_salida}</td>
                    <td>
                      <span className={`badge-estado ${r.estado?.toLowerCase()}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="texto-derecha">
                      <button 
                        className="boton-accion" 
                        title="Editar"
                        onClick={() => prepararEdicion(r)}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="tabla-vacia">No se encontraron reservas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </article>
      )}

      {/* MODAL DE FORMULARIO (CREAR / EDITAR) */}
      {modalFormAbierto && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <header className="modal-header">
              <h2>{modoModal === 'CREAR' ? 'Nueva Reserva' : 'Editar Reserva'}</h2>
              <button type="button" className="boton-cerrar-modal" onClick={cerrarModalForm}>&times;</button>
            </header>

            <form onSubmit={handleSubmit} className="form-reserva-modal">
              <div className="grupo-input">
                <label>ID Huésped</label>
                <input
                  type="text"
                  name="id_huesped"
                  value={formData.id_huesped}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese ID del huésped"
                />
              </div>

              <div className="grupo-input">
                <label>ID Habitación</label>
                <input
                  type="text"
                  name="id_habitacion"
                  value={formData.id_habitacion}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese ID de habitación"
                />
              </div>

              <div className="grupo-input">
                <label>Fecha de Ingreso</label>
                <input
                  type="date"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grupo-input">
                <label>Fecha de Salida</label>
                <input
                  type="date"
                  name="fecha_salida"
                  value={formData.fecha_salida}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grupo-input">
                <label>Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CONFIRMADA">CONFIRMADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </div>

              <footer className="modal-footer">
                <button type="button" className="boton-secundario" onClick={cerrarModalForm} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="boton-primario" disabled={guardando}>
                  {guardando ? 'Guardando...' : (modoModal === 'CREAR' ? 'Registrar' : 'Actualizar')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}