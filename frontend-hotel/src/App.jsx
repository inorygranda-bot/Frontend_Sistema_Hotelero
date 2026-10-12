import React, { useState, useEffect } from 'react';
import Login from './componentes/Vistas/Login'; 
import MenuLateral from './componentes/menu_lateral';
import Cabecera from './componentes/cabecera';
import Huespedes from './componentes/Vistas/huespedes';
import Tarifas from './componentes/Vistas/tarifas';
import Habitaciones from './componentes/Vistas/Habitaciones';
import Finanzas from './componentes/Vistas/Finanzas';
import GestionUsuariosRoles from './componentes/Vistas/GestionUsuariosRoles';
import Reservas from './componentes/Vistas/Reservas';
import ChatChavoo from './componentes/Vistas/chat_chavoo'; 
import './App.css';

export default function App() {
  const [sesionActiva, setSesionActiva] = useState(null);
  const [menuColapsado, setMenuColapsado] = useState(false);
  const [vistaActual, setVistaActual] = useState('inicio');

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('sesion_activa');
    if (sesionGuardada) {
      setSesionActiva(JSON.parse(sesionGuardada));
    }
  }, []);

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
        9: 'roles'
      };
      const primerMod = sesionActiva.modulos.find(id => mapaModulos[id]);
      if (primerMod) {
        setVistaActual(mapaModulos[primerMod]);
      }
    }
  }, [sesionActiva]);

  const toggleMenu = () => {
    setMenuColapsado(!menuColapsado);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('sesion_activa');
    setSesionActiva(null);
  };

  if (!sesionActiva) {
    return <Login onIniciarSesion={(datosUsuario) => setSesionActiva(datosUsuario)} />;
  }

  // Validación de permisos para el Chat Chavoo (Módulo 10)
  const modulosPermitidos = sesionActiva?.modulos;
  const tieneAccesoChat = !modulosPermitidos || modulosPermitidos.includes(10);

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
          {vistaActual === 'inicio' && <section><h2>Vista de Inicio</h2></section>}
        </article>
      </section>

      {tieneAccesoChat && <ChatChavoo />} 
    </main>
  );
}