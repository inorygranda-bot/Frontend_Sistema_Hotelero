import React, { useState } from 'react';
import '../../estilos/login.css';

const API_LOGIN_URL = 'http://localhost:3000/api/usuarios/login';

export default function Login({ onIniciarSesion }) {
  const [correo, setCorreo] = useState('');
  const [contrasenna, setContrasenna] = useState('');
  const [mostrarContrasenna, setMostrarContrasenna] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo.trim() || !contrasenna.trim()) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    setCargando(true);

    // Controlador de tiempo límite (Timeout) de 6 segundos por seguridad
    const controlador = new AbortController();
    const idTimeout = setTimeout(() => controlador.abort(), 6000);

    try {
      const respuesta = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasenna }),
        signal: controlador.signal
      });

      clearTimeout(idTimeout);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Correo o contraseña incorrectos.');
      }

      localStorage.setItem('sesion_activa', JSON.stringify(datos.usuario));
      onIniciarSesion(datos.usuario);

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('El servidor tardó demasiado en responder. Verifique que el backend esté encendido.');
      } else {
        setError(err.message || 'Error al conectar con el servidor.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="contenedor-login">
      <section className="tarjeta-login">
        <header className="encabezado-login">
          <h1 className="titulo-login">Sistema Hotelero</h1>
          <p className="subtitulo-login">Ingrese sus credenciales para acceder</p>
        </header>

        <form onSubmit={handleSubmit} className="formulario-login" noValidate>
          {error && <aside className="alerta-error-login">{error}</aside>}

          <label className="campo-login">
            <span className="etiqueta-campo">Correo Electrónico</span>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@hotel.com"
              required
            />
          </label>

          <label className="campo-login">
            <span className="etiqueta-campo">Contraseña</span>
            <section className="contenedor-input-password">
              <input
                type={mostrarContrasenna ? 'text' : 'password'}
                value={contrasenna}
                onChange={(e) => setContrasenna(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="boton-toggle-password"
                onClick={() => setMostrarContrasenna(!mostrarContrasenna)}
                title={mostrarContrasenna ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarContrasenna ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </section>
          </label>

          <button type="submit" className="boton-ingresar" disabled={cargando}>
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </section>
    </main>
  );
}