import React, { useState } from 'react';
import MenuLateral from './componentes/menu_lateral';
import Cabecera from './componentes/cabecera';
import Huespedes from './componentes/Vistas/huespedes';
import Tarifas from './componentes/Vistas/tarifas';
import Habitaciones from './componentes/Vistas/Habitaciones';  // ← Importa Habitaciones
import './App.css';

function App() {
  const [menuColapsado, setMenuColapsado] = useState(false);
  
  // Solo UNA declaración de vistaActual
  const [vistaActual, setVistaActual] = useState('habitaciones'); // Puedes poner 'huespedes', 'tarifas' o 'habitaciones'

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
          {/* Renderizado condicional de las vistas */}
          {vistaActual === 'tarifas' && <Tarifas />}
          {vistaActual === 'huespedes' && <Huespedes />}
          {vistaActual === 'habitaciones' && <Habitaciones />}  {/* ← Agrega esta línea */}
          {vistaActual === 'inicio' && <section><h2>Vista de Inicio</h2></section>}
        </article>
      </section>
    </main>
  );
}

export default App;
