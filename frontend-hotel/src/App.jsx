import React, { useState, useEffect } from 'react';
import Login from './componentes/Vistas/Login'; 
import MenuLateral from './componentes/menu_lateral';
import Cabecera from './componentes/cabecera';
import Inicio from './componentes/Vistas/Inicio';
import Huespedes from './componentes/Vistas/huespedes';
import Tarifas from './componentes/Vistas/tarifas';
import Habitaciones from './componentes/Vistas/Habitaciones';
import Finanzas from './componentes/Vistas/Finanzas';
import GestionUsuariosRoles from './componentes/Vistas/GestionUsuariosRoles';
import Reservas from './componentes/Vistas/Reservas';
import './App.css';

export default function App() {
  const [sesionActiva, setSesionActiva] = useState(null);
  const [menuColapsado, setMenuColapsado] = useState(false);
  const [vistaActual, setVistaActual] = useState('inicio');

  // Sincronizar y verificar sesión activa en tiempo real con la base de datos
  useEffect(() => {
    const sincronizarSesionConBackend = async () => {
      const sesionGuardada = localStorage.getItem('sesion_activa');
      if (!sesionGuardada) return;

      try {
        const parsed = JSON.parse(sesionGuardada);
        setSesionActiva(parsed);

        // Consultar el estado más reciente de roles y usuarios en el backend
        const [respRoles, respUsuarios] = await Promise.all([
          fetch('http://localhost:3000/api/roles').catch(() => null),
          fetch('http://localhost:3000/api/usuarios').catch(() => null)
        ]);

        if (respRoles && respRoles.ok) {
          const roles = await respRoles.json();
          const rolActual = roles.find((r) => Number(r.id_rol) === Number(parsed.id_rol));

          let usuarioActual = null;
          if (respUsuarios && respUsuarios.ok) {
            const usuarios = await respUsuarios.json();
            usuarioActual = usuarios.find((u) => Number(u.id_usuario) === Number(parsed.id_usuario));
          }

          if (rolActual) {
            const sesionActualizada = {
              ...parsed,
              nombre_rol: rolActual.nombre || parsed.nombre_rol,
              modulos: rolActual.modulos_asignados || parsed.modulos || [1],
              funciones: rolActual.funciones_asignadas || parsed.funciones || [],
              ...(usuarioActual ? { nombre: usuarioActual.nombre, correo: usuarioActual.correo } : {})
            };

            setSesionActiva(sesionActualizada);
            localStorage.setItem('sesion_activa', JSON.stringify(sesionActualizada));
          }
        }
      } catch (err) {
        console.warn('Error al sincronizar sesión activa:', err);
      }
    };

    sincronizarSesionConBackend();

    // Escuchar evento personalizado para actualización inmediata de permisos
    const handleActualizar = () => sincronizarSesionConBackend();
    window.addEventListener('sesion_actualizada', handleActualizar);
    return () => window.removeEventListener('sesion_actualizada', handleActualizar);
  }, []);

  // Seleccionar automáticamente la primera vista permitida según los módulos del rol
  useEffect(() => {
    if (sesionActiva && sesionActiva.modulos) {
      const mapaModulos = {
        1: 'inicio',
        2: 'reservas',
        3: 'huespedes',
        4: 'finanzas',
        5: 'habitaciones',
        6: 'tarifas',
        7: 'auditoria',
        8: 'emergencia',
        9: 'roles',
        10: 'chat'
      };

      const modulosNumeros = sesionActiva.modulos.map(Number);
      // Si la vista actual ya no está permitida, redirigir a la primera que sí tenga acceso
      const moduloDeVistaActual = Object.keys(mapaModulos).find((id) => mapaModulos[id] === vistaActual);
      if (moduloDeVistaActual && !modulosNumeros.includes(Number(moduloDeVistaActual))) {
        const primerModValido = modulosNumeros.find((id) => mapaModulos[id]);
        if (primerModValido) {
          setVistaActual(mapaModulos[primerModValido]);
        }
      }
    }
  }, [sesionActiva, vistaActual]);

  const toggleMenu = () => {
    setMenuColapsado(!menuColapsado);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('sesion_activa');
    setSesionActiva(null);
  };

  // Si no hay sesión activa, mostramos la pantalla de Login
  if (!sesionActiva) {
    return <Login onIniciarSesion={(datosUsuario) => setSesionActiva(datosUsuario)} />;
  }

  // Si hay sesión activa, mostramos el layout principal del sistema
  return (
    <main className={`layout-principal ${menuColapsado ? 'menu-colapsado' : ''}`}>
      <MenuLateral 
        colapsado={menuColapsado} 
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        cerrarSesion={cerrarSesion}
        usuario={sesionActiva}
      />
      <section className="contenido-principal">
        <Cabecera toggleMenu={toggleMenu} cerrarSesion={cerrarSesion} usuario={sesionActiva} />
        <article className="vista-contenido">
          {vistaActual === 'tarifas' && <Tarifas />}
          {vistaActual === 'huespedes' && <Huespedes />}
          {vistaActual === 'habitaciones' && <Habitaciones />}
          {vistaActual === 'finanzas' && <Finanzas usuario={sesionActiva} />}
          {vistaActual === 'roles' && <GestionUsuariosRoles />}
          {vistaActual === 'reservas' && <Reservas />}
          {vistaActual === 'inicio' && <Inicio setVistaActual={setVistaActual} usuario={sesionActiva} />}
          {vistaActual === 'auditoria' && (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '16px', margin: '1rem' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Módulo de Auditoría</h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>El registro de auditoría y trazabilidad está activo en el sistema.</p>
              <button type="button" onClick={() => setVistaActual('inicio')} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Volver al Inicio</button>
            </div>
          )}
          {vistaActual === 'emergencia' && (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '16px', margin: '1rem' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Control de Emergencias</h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Protocolos de seguridad y respuesta ante emergencias activos.</p>
              <button type="button" onClick={() => setVistaActual('inicio')} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Volver al Inicio</button>
            </div>
          )}
          {vistaActual === 'chat' && (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '16px', margin: '1rem' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Chat Chavoo</h2>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Canal de asistencia y comunicación interna del hotel.</p>
              <button type="button" onClick={() => setVistaActual('inicio')} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Volver al Inicio</button>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}