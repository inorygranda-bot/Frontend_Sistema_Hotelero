import React, { useState } from 'react';
import MenuLateral from './componentes/menu_lateral';
import Cabecera from './componentes/cabecera';
import Huespedes from './componentes/Vistas/huespedes';
import Tarifas from './componentes/Vistas/tarifas';
import './App.css';

function App() {
  const [menuColapsado, setMenuColapsado] = useState(false);
  // Estado para saber cuál vista está seleccionada
  const [vistaActual, setVistaActual] = useState('tarifas');
  const [vistaActual, setVistaActual] = useState('huespedes');

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
          {vistaActual === 'inicio' && <section><h2>Vista de Inicio</h2></section>}
          {/* A medida que crees Reservas, Finanzas, etc., las agregas aquí */}
        </article>
      </section>
    </main>
  );
}

export default App;