import React from 'react';
import MenuLateral from './componentes/menu_lateral';
import Cabecera from './componentes/cabecera';
import './App.css';

function App() {
  return (
    <main className="layout-principal">
      <MenuLateral />
      <section className="contenido-principal">
        <Cabecera />
      </section>
    </main>
  );
}

export default App;