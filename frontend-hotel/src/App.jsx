import React, { useState } from 'react';
import MenuLateral from './componentes/menu_lateral';
import Cabecera from './componentes/cabecera';
import Huespedes from './componentes/Vistas/huespedes';
import Tarifas from './componentes/Vistas/tarifas';
import Reservas from './componentes/Vistas/reservas'; // <-- 1. IMPORTADO AQUÍ
import './App.css';

function App() {
  const [menuColapsado, setMenuColapsado] = useState(false);
  const [vistaActual, setVistaActual] = useState('tarifas');
  
  const toggleMenu = () => {
    setMenuColapsado(!menuColapsado);
  };

  return (
    <main className={`layout-principal ${menuColapsado ? 'menu-colapsado' : ''}`}>
      <MenuLateral 
        colapsado={menuColapsado} 
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
      />
      <section className="contenido-principal">
        <Cabecera toggleMenu={toggleMenu} />
        <article className="vista-contenido">
          {vistaActual === 'tarifas' && <Tarifas />}
          {vistaActual === 'huespedes' && <Huespedes />}
          {vistaActual === 'reservas' && <Reservas />} {/* <-- 2. RENDERIZADO AQUÍ */}
          {vistaActual === 'inicio' && <section><h2>Vista de Inicio</h2></section>}
        </article>
      </section>
    </main>
  );
}

export default App;