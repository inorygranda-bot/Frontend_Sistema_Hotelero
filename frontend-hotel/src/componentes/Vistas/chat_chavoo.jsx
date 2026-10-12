import React, { useState, useEffect, useRef } from 'react';
import '../../estilos/chat_chavoo.css';
import ReactMarkdown from 'react-markdown';

const API_CHAVOO_URL = 'http://localhost:3000/api/chavoo';

export default function ChatChavoo() {
    const [abierto, setAbierto] = useState(false);
    const [textoMensaje, setTextoMensaje] = useState('');
    const [cargandoRespuesta, setCargandoRespuesta] = useState(false);
    const [mensajes, setMensajes] = useState([
        {
            remitente: 'bot',
            texto: '¡Hola! Soy Chavoo, tu asistente virtual conectado al sistema de reservas. ¿Qué deseas consultar hoy?',
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    const referenciaFinalMensajes = useRef(null);

    useEffect(() => {
        if (abierto && referenciaFinalMensajes.current) {
            referenciaFinalMensajes.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [mensajes, abierto]);

    const alternarChat = () => {
        setAbierto(!abierto);
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!textoMensaje.trim() || cargandoRespuesta) return;

        const textoUsuario = textoMensaje.trim();
        const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const nuevoMensajeUsuario = {
            remitente: 'usuario',
            texto: textoUsuario,
            hora: horaActual
        };

        setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
        setTextoMensaje('');
        setCargandoRespuesta(true);

        try {
            const respuesta = await fetch(API_CHAVOO_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: textoUsuario })
            });

            if (!respuesta.ok) {
                throw new Error('No se pudo conectar con el servidor de Chavoo.');
            }

            const datos = await respuesta.json();

            const respuestaBot = {
                remitente: 'bot',
                texto: datos.respuesta || 'Recibido correctamente.',
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMensajes((prev) => [...prev, respuestaBot]);
        } catch (error) {
            const mensajeError = {
                remitente: 'bot',
                texto: 'Ocurrió un error al conectar con la base de datos del asistente.',
                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMensajes((prev) => [...prev, mensajeError]);
        } finally {
            setCargandoRespuesta(false);
        }
    };

    const manejarAccionRapida = (textoAccion) => {
        setTextoMensaje(textoAccion);
    };

    return (
        <section className="contenedor-asistente-chavoo">
            <button
                type="button"
                className="boton-flotante-chavoo"
                onClick={alternarChat}
                title="Abrir Chat Chavoo"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icono-bot-svg"
                >
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" x2="8" y1="16" y2="16" />
                    <line x1="16" x2="16" y1="16" y2="16" />
                </svg>
            </button>

            {abierto && (
                <aside className="ventana-flotante-chavoo">
                    <header className="encabezado-asistente">
                        <hgroup className="grupo-titulo-asistente">
                            <h2 className="titulo-asistente">Asistente Chavoo</h2>
                            <span className="subtitulo-asistente">
                                <span className="punto-en-linea"></span>
                                Asistente Virtual
                            </span>
                        </hgroup>
                        <button
                            type="button"
                            className="boton-cerrar-asistente"
                            onClick={alternarChat}
                        >
                            &times;
                        </button>
                    </header>

                    <section className="area-mensajes-chavoo">
                        {mensajes.map((msg, index) => (
                            <article key={index} className={`mensaje-item ${msg.remitente}`}>
                                {/* Aquí reemplazamos <p>{msg.texto}</p> por ReactMarkdown */}
                                <ReactMarkdown>{msg.texto}</ReactMarkdown>

                                <small className="hora-mensaje">{msg.hora}</small>
                            </article>
                        ))}
                        {cargandoRespuesta && (
                            <article className="mensaje-item bot">
                                <p>escribiendo...</p>
                            </article>
                        )}
                        <span ref={referenciaFinalMensajes}></span>
                    </section>

                    <nav className="acciones-rapidas-chavoo">
                        <button
                            type="button"
                            className="boton-accion-rapida"
                            onClick={() => manejarAccionRapida('Ver habitaciones disponibles')}
                        >
                            Habitaciones
                        </button>
                        <button
                            type="button"
                            className="boton-accion-rapida"
                            onClick={() => manejarAccionRapida('Consultar precios y tarifas')}
                        >
                            Tarifas
                        </button>
                        <button
                            type="button"
                            className="boton-accion-rapida"
                            onClick={() => manejarAccionRapida('Resumen de reservas')}
                        >
                            Reservas
                        </button>
                    </nav>

                    <footer className="pie-asistente-chavoo">
                        <form onSubmit={enviarMensaje} className="formulario-chat-chavoo">
                            <input
                                type="text"
                                className="input-chat-chavoo"
                                placeholder="Escribe tu consulta..."
                                value={textoMensaje}
                                onChange={(e) => setTextoMensaje(e.target.value)}
                                disabled={cargandoRespuesta}
                            />
                            <button type="submit" className="boton-enviar-chat-chavoo" disabled={cargandoRespuesta}>
                                {cargandoRespuesta ? '...' : 'Enviar'}
                            </button>
                        </form>
                    </footer>
                </aside>
            )}
        </section>
    );
}