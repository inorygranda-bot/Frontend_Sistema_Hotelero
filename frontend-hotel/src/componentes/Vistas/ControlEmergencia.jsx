import React, { useState, useEffect } from 'react';
import '../../estilos/control_emergencia.css';

export default function ControlEmergencia({ usuario }) {
  const [estadoEmergencia, setEstadoEmergencia] = useState('NORMAL'); // 'NORMAL' | 'ALERTA'
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  
  const [mensajeAlerta, setMensajeAlerta] = useState('ATENCION: Se ha activado el protocolo de emergencia en el hotel. Por favor, dirijase con calma a la salida de emergencia más cercana.');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  const [huespedesActivos, setHuespedesActivos] = useState([]);

  const [alertaModal, setAlertaModal] = useState({ abierto: false, tipo: 'exito', titulo: '', mensaje: '' });

  const cargarHuespedesActivos = async () => {
    try {
      const respuesta = await fetch('http://localhost:3000/api/emergencia/activos');
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setHuespedesActivos(Array.isArray(datos) ? datos.map(h => ({ ...h, seguro: false })) : []);
      }
    } catch (err) {
      console.error('Error al cargar huéspedes activos:', err);
    }
  };

  useEffect(() => {
    cargarHuespedesActivos();
  }, []);

  const intentarActivarAlerta = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://localhost:3000/api/emergencia/activar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: usuario?.id_usuario || 1,
          contrasenna_admin: passwordAdmin,
          mensaje_emitido: mensajeAlerta
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Contraseña de administrador incorrecta.');
      }

      setEstadoEmergencia('ALERTA');
      setModalPasswordAbierto(false);
      setPasswordAdmin('');
      setErrorPassword('');
      await cargarHuespedesActivos();

      setAlertaModal({
        abierto: true,
        tipo: 'error',
        titulo: 'ESTADO DE EMERGENCIA ACTIVADO',
        mensaje: datos.mensaje || 'Se ha registrado la alerta en el sistema y cambiado al modo de seguridad.'
      });
    } catch (err) {
      setErrorPassword(err.message);
    }
  };

  const desactivarAlerta = () => {
    setEstadoEmergencia('NORMAL');
    setHuespedesActivos(prev => prev.map(h => ({ ...h, seguro: false })));
    setAlertaModal({
      abierto: true,
      tipo: 'exito',
      titulo: 'Sistema Normalizado',
      mensaje: 'Se ha desactivado el estado de emergencia con éxito.'
    });
  };

  const toggleMarcarSeguro = (idHuesped) => {
    setHuespedesActivos(prev =>
      prev.map(h => h.id_huesped === idHuesped ? { ...h, seguro: !h.seguro } : h)
    );
  };

  const enviarMensajeMasivo = async () => {
    setEnviandoMensaje(true);
    try {
      const respuesta = await fetch('http://localhost:3000/api/emergencia/mensaje-masivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: mensajeAlerta })
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.mensaje || 'Error al enviar reporte.');

      setAlertaModal({
        abierto: true,
        tipo: 'exito',
        titulo: 'Reporte Transmitido a Telegram',
        mensaje: datos.mensaje || 'El reporte oficial fue enviado con éxito a la central de seguridad.'
      });
    } catch (err) {
      setAlertaModal({
        abierto: true,
        tipo: 'error',
        titulo: 'Error de Envio',
        mensaje: err.message
      });
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const totalHuespedes = huespedesActivos.length;
  const totalSeguros = huespedesActivos.filter(h => h.seguro).length;
  const porcentajeSeguros = totalHuespedes > 0 ? Math.round((totalSeguros / totalHuespedes) * 100) : 0;

  return (
    <section className="contenedor-emergencia">
      <header className="encabezado-vista">
        <h1 className="titulo-vista">Control de Emergencias y Evacuacion</h1>
        <p className="subtitulo-vista">Gestion de protocolos de seguridad, alertas y reporte de huespedes</p>
      </header>

      {/* BANNER DE ESTADO */}
      <article className={`banner-estado-emergencia ${estadoEmergencia.toLowerCase()}`}>
        <section className="info-estado">
          <h2>
            {estadoEmergencia === 'NORMAL' ? 'Estado del Sistema: Normal' : 'SISTEMA EN ESTADO DE EMERGENCIA / ALERTA'}
          </h2>
          <p>
            {estadoEmergencia === 'NORMAL' 
              ? 'Las operaciones hoteleras transcurren con normalidad. Los protocolos de seguridad estan en espera.' 
              : 'Protocolo activo. Verifique el reporte de evacuacion y marque a los huespedes seguros.'}
          </p>
        </section>
        <section>
          {estadoEmergencia === 'NORMAL' ? (
            <button
              type="button"
              className="boton-alerta-peligro"
              style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 700, backgroundColor: '#dc2626', color: '#fff' }}
              onClick={() => setModalPasswordAbierto(true)}
            >
              Activar Alerta de Emergencia
            </button>
          ) : (
            <button
              type="button"
              className="boton-guardar"
              onClick={desactivarAlerta}
            >
              Desactivar Emergencia y Normalizar
            </button>
          )}
        </section>
      </article>

      {/* ESTADO NORMAL: GRAFICAS Y METRICAS */}
      {estadoEmergencia === 'NORMAL' && (
        <section className="grid-metricas-emergencia">
          <article className="tarjeta-metrica">
            <span className="titulo-metrica">Huespedes Activos Hospedados</span>
            <span className="valor-metrica">{totalHuespedes}</span>
            <small style={{ color: 'var(--color-texto-secundario)' }}>Listos para reporte inmediato (Check-in activo)</small>
            <div className="barra-progreso-mini">
              <div className="progreso-relleno" style={{ width: '100%' }}></div>
            </div>
          </article>

          <article className="tarjeta-metrica">
            <span className="titulo-metrica">Estado Operativo del Hotel</span>
            <span className="valor-metrica" style={{ fontSize: '1.25rem', color: '#2563eb', marginTop: '0.4rem' }}>Monitoreo Activo</span>
            <small style={{ color: 'var(--color-texto-secundario)' }}>Sin incidencias reportadas</small>
          </article>

          <article className="tarjeta-metrica">
            <span className="titulo-metrica">Estado de Canal Telegram</span>
            <span className="valor-metrica" style={{ fontSize: '1.25rem', color: '#16a34a', marginTop: '0.4rem' }}>Operativo</span>
            <small style={{ color: 'var(--color-texto-secundario)' }}>Central de notificaciones lista</small>
          </article>
        </section>
      )}

      {/* ESTADO DE EMERGENCIA: MENSAJERIA Y REPORTE */}
      {estadoEmergencia === 'ALERTA' && (
        <>
          <article className="tarjeta-mensajeria">
            <h3 className="titulo-seccion-emergencia">Enviar Reporte de Incidente a Telegram (Administrador)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)', margin: 0 }}>
              Este reporte ejecutivo e instructivo será transmitido de forma inmediata al canal de Telegram configurado para la central de seguridad.
            </p>
            <textarea
              className="caja-textarea-mensaje"
              value={mensajeAlerta}
              onChange={(e) => setMensajeAlerta(e.target.value)}
              placeholder="Escriba la instruccion de emergencia para el reporte..."
            />
            <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="boton-guardar"
                onClick={enviarMensajeMasivo}
                disabled={enviandoMensaje}
              >
                {enviandoMensaje ? 'Transmitiendo Reporte...' : 'Enviar Reporte de Emergencia a Telegram'}
              </button>
            </footer>
          </article>

          <article className="tarjeta-tabla">
            <header style={{ padding: '1.25rem 1rem 0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="titulo-seccion-emergencia">Reporte de Evacuacion y Conteo de Huespedes</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>
                Seguros: {totalSeguros} de {totalHuespedes} ({porcentajeSeguros}%)
              </span>
            </header>

            <table className="tabla-seguridad-huespedes">
              <thead>
                <tr>
                  <th>Marcar Seguro</th>
                  <th>Huesped</th>
                  <th>Documento</th>
                  <th>Habitacion</th>
                  <th>Telefono Registrado</th>
                  <th>Estado Actual</th>
                </tr>
              </thead>
              <tbody>
                {huespedesActivos.length > 0 ? (
                  huespedesActivos.map((h) => (
                    <tr key={h.id_huesped} className={h.seguro ? 'fila-huesped-seguro' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox-seguro"
                          checked={h.seguro}
                          onChange={() => toggleMarcarSeguro(h.id_huesped)}
                          title="Marcar como evacuado y seguro"
                        />
                      </td>
                      <td>
                        <strong>{h.nombre}</strong>
                      </td>
                      <td>{h.num_documento}</td>
                      <td>Hab. {h.codigo_habitacion}</td>
                      <td>{h.telefono || 'N/A'}</td>
                      <td>
                        <span className={`badge-estado-seguro ${h.seguro ? 'seguro' : 'pendiente'}`}>
                          {h.seguro ? 'Seguro / Evacuado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="tabla-vacia" style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay huéspedes con Check-in activo actualmente en el hotel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </article>
        </>
      )}

      {/* MODAL CONTRASEÑA ADMINISTRADOR */}
      {modalPasswordAbierto && (
        <aside className="overlay-modal" onClick={() => setModalPasswordAbierto(false)}>
          <article className="contenido-modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <header className="encabezado-modal">
              <h2 className="titulo-modal">Autorizacion de Administrador</h2>
              <button type="button" className="boton-cerrar-modal" onClick={() => setModalPasswordAbierto(false)}>&times;</button>
            </header>
            <form onSubmit={intentarActivarAlerta} className="formulario-huesped">
              <fieldset className="grupo-campos" style={{ border: 'none', padding: 0 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-secundario)', marginBottom: '1rem' }}>
                  Para activar el estado de emergencia en el sistema, ingrese la contraseña de administrador.
                </p>
                <label className="campo ancho-completo">
                  <span className="label-texto">Contraseña de Administrador *</span>
                  <input
                    type="password"
                    value={passwordAdmin}
                    onChange={(e) => { setPasswordAdmin(e.target.value); setErrorPassword(''); }}
                    placeholder="••••••••"
                    autoFocus
                    className={errorPassword ? 'input-error' : ''}
                  />
                  {errorPassword && <span className="texto-error-campo">{errorPassword}</span>}
                </label>
              </fieldset>
              <footer className="acciones-formulario" style={{ marginTop: '1.25rem', border: 'none', padding: 0 }}>
                <button type="button" className="boton-cancelar" onClick={() => setModalPasswordAbierto(false)}>Cancelar</button>
                <button type="submit" className="boton-alerta-peligro" style={{ backgroundColor: '#dc2626', color: '#fff', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}>
                  Confirmar y Activar Alerta
                </button>
              </footer>
            </form>
          </article>
        </aside>
      )}

      {/* MODAL DE ALERTAS GENERALES */}
      {alertaModal.abierto && (
        <aside className="overlay-modal z-alto">
          <article className="modal-alerta-tarjeta">
            <h3 className="titulo-alerta">{alertaModal.titulo}</h3>
            <p className="mensaje-alerta">{alertaModal.mensaje}</p>
            <footer className="acciones-alerta">
              <button
                type="button"
                className="boton-alerta-primario"
                onClick={() => setAlertaModal((prev) => ({ ...prev, abierto: false }))}
              >
                Aceptar
              </button>
            </footer>
          </article>
        </aside>
      )}
    </section>
  );
}