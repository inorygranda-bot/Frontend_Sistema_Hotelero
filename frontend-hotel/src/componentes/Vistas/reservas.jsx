import React, { useState, useEffect } from 'react';
import '../../estilos/reservas.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [form, setForm] = useState({ id: null, cliente: '', habitacion: '', fechaEntrada: '', fechaSalida: '', estado: 'Pendiente' });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    obtenerReservas();
  }, []);

  const obtenerReservas = async () => {
    try {
      const response = await fetch(`${API_URL}/reservas`);
      if (response.ok) {
        const data = await response.json();
        setReservas(data);
      }
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
    }
  };

  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardarReserva = async (e) => {
    e.preventDefault();
    try {
      const metodo = modoEdicion ? 'PUT' : 'POST';
      const url = modoEdicion ? `${API_URL}/reservas/${form.id}` : `${API_URL}/reservas`;

      const response = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        obtenerReservas();
        limpiarFormulario();
        setMostrarModal(false);
      }
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
    }
  };

  const prepararEdicion = (reserva) => {
    setForm(reserva);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const eliminarReserva = async (id) => {
    if (window.confirm('¿Estás segura de que deseas eliminar esta reserva?')) {
      try {
        const response = await fetch(`${API_URL}/reservas/${id}`, { method: 'DELETE' });
        if (response.ok) {
          obtenerReservas();
        }
      } catch (error) {
        console.error('Error al eliminar la reserva:', error);
      }
    }
  };

  const limpiarFormulario = () => {
    setForm({ id: null, cliente: '', habitacion: '', fechaEntrada: '', fechaSalida: '', estado: 'Pendiente' });
    setModoEdicion(false);
  };

  return (
    <div className="reservas-container">
      <div className="header-seccion" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestión de Reservas</h2>
        <button 
          className="btn-nuevo" 
          onClick={() => { limpiarFormulario(); setMostrarModal(true); }}
          style={{ 
            backgroundColor: '#2563eb', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            fontWeight: '600', 
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          + Nueva Reserva
        </button>
      </div>

      <div className="tabla-container">
        <table className="reservas-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Habitación</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length > 0 ? (
              reservas.map((res) => (
                <tr key={res.id}>
                  <td>{res.cliente}</td>
                  <td>{res.habitacion}</td>
                  <td>{res.fechaEntrada}</td>
                  <td>{res.fechaSalida}</td>
                  <td>{res.estado}</td>
                  <td>
                    <button onClick={() => prepararEdicion(res)} className="btn-editar">Editar</button>
                    <button onClick={() => eliminarReserva(res.id)} className="btn-eliminar">Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No hay reservas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ventana Modal ordenada y simétrica */}
      {mostrarModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '25px 30px', borderRadius: '12px', width: '100%', maxWidth: '580px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', position: 'relative' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eaeaea', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>{modoEdicion ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
              <button onClick={() => setMostrarModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            <form onSubmit={guardarReserva} className="reserva-form">
              {/* Fila 1: Cliente y Habitación */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Cliente *</label>
                  <input type="text" name="cliente" value={form.cliente} onChange={manejarCambio} required placeholder="Ej. Ana María Pérez" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Habitación *</label>
                  <input type="text" name="habitacion" value={form.habitacion} onChange={manejarCambio} required placeholder="Ej. 102" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
                </div>
              </div>

              {/* Fila 2: Fechas de Entrada y Salida */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Fecha de Entrada *</label>
                  <input type="date" name="fechaEntrada" value={form.fechaEntrada} onChange={manejarCambio} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Fecha de Salida *</label>
                  <input type="date" name="fechaSalida" value={form.fechaSalida} onChange={manejarCambio} required style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} />
                </div>
              </div>

              {/* Fila 3: Estado */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Estado *</label>
                <select name="estado" value={form.estado} onChange={manejarCambio} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', fontSize: '0.9rem' }}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              {/* Botones de acción */}
              <div className="form-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                <button type="button" onClick={() => setMostrarModal(false)} className="btn-cancelar" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'transparent', color: '#6b7280', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>Cancelar</button>
                <button type="submit" className="btn-guardar" style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
                  {modoEdicion ? 'Actualizar' : 'Guardar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}