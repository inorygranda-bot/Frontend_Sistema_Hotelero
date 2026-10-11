import React from 'react';

export default function Cabecera({ toggleMenu, usuario }) {
  const nombreUsuario = usuario?.nombre || 'Usuario';
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  return (
    <header className="cabecera-superior">
      <button 
        type="button" 
        className="boton-menu-movil" 
        aria-label="Abrir menú"
        onClick={toggleMenu}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <section className="usuario-cabecera">
        <article className="tarjeta-usuario">
          <figure className="avatar">{inicial}</figure>
          <span>{nombreUsuario}</span>
        </article>
      </section>
    </header>
  );
}