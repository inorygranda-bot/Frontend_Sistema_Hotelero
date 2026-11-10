import React, { useState, useEffect } from 'react';
import '../../estilos/huespedes.css';
import { API_BASE_URL } from '../../config/api';

const API_USUARIOS = `${API_BASE_URL}/api/usuarios`;
const API_ROLES = `${API_BASE_URL}/api/roles`;

// Módulos definidos directamente para garantizar renderizado inmediato y robusto
const MODULOS_ESTATICOS = [
    {
        id_modulo: 1,
        nombre_modulo: 'Inicio',
        funciones: [{ id_funcion: 1, nombre_funcion: 'Ver Inicio' }]
    },
    {
        id_modulo: 2,
        nombre_modulo: 'Reservas',
        funciones: [
            { id_funcion: 2, nombre_funcion: 'Ver Reservas' },
            { id_funcion: 3, nombre_funcion: 'Crear Reservas' },
            { id_funcion: 4, nombre_funcion: 'Editar Reservas' },
            { id_funcion: 5, nombre_funcion: 'Eliminar Reservas' }
        ]
    },
    {
        id_modulo: 3,
        nombre_modulo: 'Huéspedes',
        funciones: [
            { id_funcion: 6, nombre_funcion: 'Ver Huéspedes' },
            { id_funcion: 7, nombre_funcion: 'Crear Huéspedes' },
            { id_funcion: 8, nombre_funcion: 'Editar Huéspedes' },
            { id_funcion: 9, nombre_funcion: 'Eliminar Huéspedes' }
        ]
    },
    {
        id_modulo: 4,
        nombre_modulo: 'Finanzas',
        funciones: [
            { id_funcion: 10, nombre_funcion: 'Ver Finanzas' },
            { id_funcion: 11, nombre_funcion: 'Gestionar Pagos y Transacciones' }
        ]
    },
    {
        id_modulo: 5,
        nombre_modulo: 'Habitaciones',
        funciones: [
            { id_funcion: 12, nombre_funcion: 'Ver Habitaciones' },
            { id_funcion: 13, nombre_funcion: 'Crear Habitaciones' },
            { id_funcion: 14, nombre_funcion: 'Editar Habitaciones' },
            { id_funcion: 15, nombre_funcion: 'Eliminar Habitaciones' }
        ]
    },
    {
        id_modulo: 6,
        nombre_modulo: 'Tarifas',
        funciones: [
            { id_funcion: 16, nombre_funcion: 'Ver Tarifas' },
            { id_funcion: 17, nombre_funcion: 'Crear Tarifas' },
            { id_funcion: 18, nombre_funcion: 'Editar Tarifas' },
            { id_funcion: 19, nombre_funcion: 'Eliminar Tarifas' }
        ]
    },
    {
        id_modulo: 7,
        nombre_modulo: 'Auditoría',
        funciones: [{ id_funcion: 20, nombre_funcion: 'Ver Auditoría' }]
    },
    {
        id_modulo: 8,
        nombre_modulo: 'Control Emergencia',
        funciones: [
            { id_funcion: 21, nombre_funcion: 'Ver Control de Emergencia' },
            { id_funcion: 22, nombre_funcion: 'Activar Alertas de Emergencia' }
        ]
    },
    {
        id_modulo: 9,
        nombre_modulo: 'Rol y Usuarios',
        funciones: [
            { id_funcion: 23, nombre_funcion: 'Ver Roles y Usuarios' },
            { id_funcion: 24, nombre_funcion: 'Crear Roles y Usuarios' },
            { id_funcion: 25, nombre_funcion: 'Editar Roles y Usuarios' },
            { id_funcion: 26, nombre_funcion: 'Eliminar Roles y Usuarios' }
        ]
    }
];

export default function GestionUsuariosRoles() {
    const [pestannaActiva, setPestannaActiva] = useState('usuarios');

    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modulosSistema, setModulosSistema] = useState(MODULOS_ESTATICOS);

    // Modales
    const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
    const [modoModalUsuario, setModoModalUsuario] = useState('CREAR');
    const [busquedaUsuario, setBusquedaUsuario] = useState('');

    const estadoInicialUsuario = { id_usuario: null, id_rol: 1, nombre: '', correo: '', contrasenna: '', estado: 'ACTIVO' };
    const [formDataUsuario, setFormDataUsuario] = useState(estadoInicialUsuario);
    const [erroresUsuario, setErroresUsuario] = useState({});

    const [modalRolAbierto, setModalRolAbierto] = useState(false);
    const [modoModalRol, setModoModalRol] = useState('CREAR');

    const estadoInicialRol = { id_rol: null, nombre: '', descripcion: '', modulos: [], funciones: [] };
    const [formDataRol, setFormDataRol] = useState(estadoInicialRol);
    const [erroresRol, setErroresRol] = useState({});

    // Control de acordeón para desplegar funciones de cada módulo
    const [modulosExpandidos, setModulosExpandidos] = useState({});

    const [alerta, setAlerta] = useState({ abierto: false, tipo: 'exito', titulo: '', mensaje: '', accion: null });

    const cargarDatos = async () => {
        try {
            const respRoles = await fetch(API_ROLES);
            if (respRoles.ok) setRoles(await respRoles.json());

            const respUsuarios = await fetch(API_USUARIOS);
            if (respUsuarios.ok) setUsuarios(await respUsuarios.json());
        } catch (err) {
            console.error('Error al conectar con el servidor:', err);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // --- LÓGICA DE ROLES Y PERMISOS ---
    const abrirCrearRol = () => {
        setFormDataRol(estadoInicialRol);
        setErroresRol({});
        setModulosExpandidos({});
        setModoModalRol('CREAR');
        setModalRolAbierto(true);
    };

    const abrirEditarRol = (rol) => {
        setFormDataRol({
            id_rol: rol.id_rol,
            nombre: rol.nombre || '',
            descripcion: rol.descripcion || '',
            modulos: rol.modulos_asignados || [],
            funciones: rol.funciones_asignadas || []
        });
        setErroresRol({});
        setModulosExpandidos({});
        setModoModalRol('EDITAR');
        setModalRolAbierto(true);
    };

    const toggleExpandirModulo = (idModulo) => {
        setModulosExpandidos((prev) => ({ ...prev, [idModulo]: !prev[idModulo] }));
    };

    const handleCheckboxModulo = (idModulo, funcionesDelModulo) => {
        const estaSeleccionado = formDataRol.modulos.includes(idModulo);
        let nuevosModulos = [...formDataRol.modulos];
        let nuevasFunciones = [...formDataRol.funciones];
        const idsFuncionesModulo = funcionesDelModulo.map(f => f.id_funcion);

        if (estaSeleccionado) {
            nuevosModulos = nuevosModulos.filter(m => m !== idModulo);
            nuevasFunciones = nuevasFunciones.filter(f => !idsFuncionesModulo.includes(f));
        } else {
            nuevosModulos.push(idModulo);
            idsFuncionesModulo.forEach(idF => {
                if (!nuevasFunciones.includes(idF)) nuevasFunciones.push(idF);
            });
        }

        setFormDataRol(prev => ({ ...prev, modulos: nuevosModulos, funciones: nuevasFunciones }));
    };

    const handleCheckboxFuncion = (idFuncion, idModulo, funcionesDelModulo) => {
        const estaSeleccionado = formDataRol.funciones.includes(idFuncion);
        let nuevasFunciones = [...formDataRol.funciones];
        let nuevosModulos = [...formDataRol.modulos];

        if (estaSeleccionado) {
            nuevasFunciones = nuevasFunciones.filter(f => f !== idFuncion);
            const quedanOtras = funcionesDelModulo.some(f => f.id_funcion !== idFuncion && nuevasFunciones.includes(f.id_funcion));
            if (!quedanOtras) {
                nuevosModulos = nuevosModulos.filter(m => m !== idModulo);
            }
        } else {
            nuevasFunciones.push(idFuncion);
            if (!nuevosModulos.includes(idModulo)) {
                nuevosModulos.push(idModulo);
            }
        }

        setFormDataRol(prev => ({ ...prev, modulos: nuevosModulos, funciones: nuevasFunciones }));
    };

    const validarRol = () => {
        const nuevosErrores = {};
        if (!formDataRol.nombre.trim()) nuevosErrores.nombre = 'El nombre del rol es obligatorio.';
        if (!formDataRol.descripcion.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria.';
        setErroresRol(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmitRol = async (e) => {
        e.preventDefault();
        if (!validarRol()) return;

        const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
        const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

        try {
            const url = modoModalRol === 'CREAR' ? API_ROLES : `${API_ROLES}/${formDataRol.id_rol}`;
            const metodo = modoModalRol === 'CREAR' ? 'POST' : 'PUT';

            const payload = {
                ...formDataRol,
                id_usuario: idUsuarioActual
            };

            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const datosRespuesta = await respuesta.json().catch(() => ({}));
            if (!respuesta.ok) {
                throw new Error(datosRespuesta.mensaje || 'Error al guardar el rol.');
            }

            setModalRolAbierto(false);
            cargarDatos();
            window.dispatchEvent(new Event('sesion_actualizada'));
            setAlerta({
                abierto: true,
                tipo: 'exito',
                titulo: modoModalRol === 'CREAR' ? '¡Rol Registrado!' : '¡Rol Actualizado!',
                mensaje: 'La operación y sus permisos se guardaron correctamente.'
            });
        } catch (err) {
            setAlerta({ abierto: true, tipo: 'error', titulo: 'Atención', mensaje: err.message });
        }
    };

    const confirmarEliminarRol = (id, nombre) => {
        const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
        const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

        setAlerta({
            abierto: true,
            tipo: 'confirmar',
            titulo: 'Confirmar Eliminación',
            mensaje: `¿Está seguro de eliminar el rol "${nombre}"?`,
            accion: async () => {
                try {
                    const resp = await fetch(`${API_ROLES}/${id}?id_usuario=${idUsuarioActual}`, { 
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (!resp.ok) throw new Error('No se pudo eliminar el rol.');
                    cargarDatos();
                    setAlerta({ abierto: true, tipo: 'exito', titulo: '¡Rol Eliminado!', mensaje: 'El registro fue removido.' });
                } catch (err) {
                    setAlerta({ abierto: true, tipo: 'error', titulo: 'Error', mensaje: err.message });
                }
            }
        });
    };

    // --- LÓGICA DE USUARIOS ---
    const abrirCrearUsuario = () => {
        setFormDataUsuario(estadoInicialUsuario);
        setErroresUsuario({});
        setModoModalUsuario('CREAR');
        setModalUsuarioAbierto(true);
    };

    const abrirEditarUsuario = (usuario) => {
        setFormDataUsuario({
            id_usuario: usuario.id_usuario,
            id_rol: usuario.id_rol,
            nombre: usuario.nombre,
            correo: usuario.correo,
            contrasenna: '',
            estado: usuario.estado
        });
        setErroresUsuario({});
        setModoModalUsuario('EDITAR');
        setModalUsuarioAbierto(true);
    };

    const validarUsuario = () => {
        const nuevosErrores = {};
        if (!formDataUsuario.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
        if (!formDataUsuario.correo.trim()) nuevosErrores.correo = 'El correo es obligatorio.';
        if (modoModalUsuario === 'CREAR' && !formDataUsuario.contrasenna.trim()) nuevosErrores.contrasenna = 'La contraseña es obligatoria.';
        setErroresUsuario(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmitUsuario = async (e) => {
        e.preventDefault();
        if (!validarUsuario()) return;

        const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
        const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

        try {
            const url = modoModalUsuario === 'CREAR' ? API_USUARIOS : `${API_USUARIOS}/${formDataUsuario.id_usuario}`;
            const metodo = modoModalUsuario === 'CREAR' ? 'POST' : 'PUT';

            const payload = {
                ...formDataUsuario,
                id_usuario_responsable: idUsuarioActual 
            };

            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!respuesta.ok) {
                const errData = await respuesta.json().catch(() => ({}));
                throw new Error(errData.mensaje || 'Error al procesar el usuario.');
            }

            setModalUsuarioAbierto(false);
            cargarDatos();
            window.dispatchEvent(new Event('sesion_actualizada'));
            setAlerta({
                abierto: true,
                tipo: 'exito',
                titulo: modoModalUsuario === 'CREAR' ? '¡Usuario Registrado!' : '¡Datos Actualizados!',
                mensaje: 'La información del usuario fue guardada.'
            });
        } catch (err) {
            setAlerta({ abierto: true, tipo: 'error', titulo: 'Error', mensaje: err.message });
        }
    };

    const confirmarEliminarUsuario = (id, nombre) => {
        const usuarioSesion = JSON.parse(localStorage.getItem('sesion_activa')) || JSON.parse(localStorage.getItem('usuario')) || {};
        const idUsuarioActual = usuarioSesion.id_usuario || usuarioSesion.usuario?.id_usuario || 1;

        setAlerta({
            abierto: true,
            tipo: 'confirmar',
            titulo: 'Confirmar Eliminación',
            mensaje: `¿Está seguro de eliminar al usuario "${nombre}"?`,
            accion: async () => {
                try {
                    const resp = await fetch(`${API_USUARIOS}/${id}?id_usuario=${idUsuarioActual}`, { 
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (!resp.ok) throw new Error('No se pudo eliminar el usuario.');
                    cargarDatos();
                    setAlerta({ abierto: true, tipo: 'exito', titulo: '¡Usuario Eliminado!', mensaje: 'El registro fue removido.' });
                } catch (err) {
                    setAlerta({ abierto: true, tipo: 'error', titulo: 'Error', mensaje: err.message });
                }
            }
        });
    };

    const obtenerNombreRol = (idRol) => {
        const rol = roles.find((r) => r.id_rol === Number(idRol));
        return rol ? rol.nombre : 'Sin Rol';
    };

    const usuariosFiltrados = usuarios.filter(
        (u) =>
            u.nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
            u.correo?.toLowerCase().includes(busquedaUsuario.toLowerCase())
    );

    return (
        <section className="contenedor-huespedes">
            <header className="encabezado-vista">
                <h1 className="titulo-vista">Gestión de Acceso y Personal</h1>
                <p className="subtitulo-vista">Administración unificada de usuarios del sistema y sus roles</p>
            </header>

            <nav className="pestañas-navegacion">
                <button
                    type="button"
                    className={`boton-pestanna ${pestannaActiva === 'usuarios' ? 'activa' : ''}`}
                    onClick={() => setPestannaActiva('usuarios')}
                >
                    Usuarios del Sistema
                </button>
                <button
                    type="button"
                    className={`boton-pestanna ${pestannaActiva === 'roles' ? 'activa' : ''}`}
                    onClick={() => setPestannaActiva('roles')}
                >
                    Roles y Permisos
                </button>
            </nav>

            {/* PESTAÑA USUARIOS */}
            {pestannaActiva === 'usuarios' && (
                <section className="seccion-pestanna">
                    <section className="barra-herramientas">
                        <section className="grupo-controles">
                            <label className="caja-busqueda">
                                <input
                                    type="search"
                                    className="input-busqueda"
                                    placeholder="Buscar por nombre o correo..."
                                    value={busquedaUsuario}
                                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                                />
                            </label>
                        </section>
                        <button type="button" className="boton-agregar" onClick={abrirCrearUsuario}>
                            <span>+ Agregar Usuario</span>
                        </button>
                    </section>

                    <article className="tarjeta-tabla">
                        <table className="tabla-huespedes">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Rol Asignado</th>
                                    <th>Estado</th>
                                    <th className="texto-derecha">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.length > 0 ? (
                                    usuariosFiltrados.map((u) => (
                                        <tr key={u.id_usuario}>
                                            <td>
                                                <article className="info-persona">
                                                    <span className="nombre-persona">{u.nombre}</span>
                                                    <span className="correo-persona">{u.correo}</span>
                                                </article>
                                            </td>
                                            <td><strong>{u.nombre_rol || obtenerNombreRol(u.id_rol)}</strong></td>
                                            <td>
                                                <span className={`badge-estado ${u.estado?.toLowerCase()}`}>
                                                    <span className="punto-estado"></span>
                                                    {u.estado}
                                                </span>
                                            </td>
                                            <td className="texto-derecha">
                                                <section className="grupo-acciones">
                                                    <button type="button" className="boton-accion" title="Editar" onClick={() => abrirEditarUsuario(u)}>✏️</button>
                                                    <button type="button" className="boton-accion peligro" title="Eliminar" onClick={() => confirmarEliminarUsuario(u.id_usuario, u.nombre)}>🗑️</button>
                                                </section>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="tabla-vacia">No se encontraron usuarios registrados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </article>
                </section>
            )}

            {/* PESTAÑA ROLES */}
            {pestannaActiva === 'roles' && (
                <section className="seccion-pestanna">
                    <section className="barra-herramientas">
                        <section className="grupo-controles"></section>
                        <button type="button" className="boton-agregar" onClick={abrirCrearRol}>
                            <span>+ Agregar Rol</span>
                        </button>
                    </section>

                    <article className="tarjeta-tabla">
                        <table className="tabla-huespedes">
                            <thead>
                                <tr>
                                    <th>Nombre del Rol</th>
                                    <th>Descripción</th>
                                    <th className="texto-derecha">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.length > 0 ? (
                                    roles.map((rol) => (
                                        <tr key={rol.id_rol}>
                                            <td><strong>{rol.nombre}</strong></td>
                                            <td>{rol.descripcion}</td>
                                            <td className="texto-derecha">
                                                <section className="grupo-acciones">
                                                    <button type="button" className="boton-accion" title="Editar" onClick={() => abrirEditarRol(rol)}>✏️</button>
                                                    <button type="button" className="boton-accion peligro" title="Eliminar" onClick={() => confirmarEliminarRol(rol.id_rol, rol.nombre)}>🗑️</button>
                                                </section>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="tabla-vacia">No hay roles registrados.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </article>
                </section>
            )}

            {/* MODAL FORMULARIO DE ROL CON MÓDULOS Y FUNCIONES */}
            {modalRolAbierto && (
                <aside className="overlay-modal" onClick={() => setModalRolAbierto(false)}>
                    <article className="contenido-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                        <header className="encabezado-modal">
                            <h2 className="titulo-modal">{modoModalRol === 'CREAR' ? 'Nuevo Rol' : 'Editar Rol'}</h2>
                            <button type="button" className="boton-cerrar-modal" onClick={() => setModalRolAbierto(false)}>&times;</button>
                        </header>
                        <form onSubmit={handleSubmitRol} className="formulario-huesped">
                            <fieldset className="grupo-campos">
                                <label className="campo ancho-completo">
                                    <span className="label-texto">Nombre del Rol *</span>
                                    <input
                                        type="text"
                                        value={formDataRol.nombre}
                                        onChange={(e) => setFormDataRol({ ...formDataRol, nombre: e.target.value })}
                                        className={erroresRol.nombre ? 'input-error' : ''}
                                        placeholder="Ej. Supervisor"
                                    />
                                    {erroresRol.nombre && <span className="texto-error-campo">{erroresRol.nombre}</span>}
                                </label>

                                <label className="campo ancho-completo">
                                    <span className="label-texto">Descripción *</span>
                                    <textarea
                                        rows="2"
                                        value={formDataRol.descripcion}
                                        onChange={(e) => setFormDataRol({ ...formDataRol, descripcion: e.target.value })}
                                        className={erroresRol.descripcion ? 'input-error' : ''}
                                        placeholder="Detalle de los permisos..."
                                        style={{ padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                                    />
                                    {erroresRol.descripcion && <span className="texto-error-campo">{erroresRol.descripcion}</span>}
                                </label>

                                {/* ASIGNACIÓN DE MÓDULOS Y FUNCIONES */}
                                <section className="campo ancho-completo" style={{ marginTop: '0.5rem' }}>
                                    <span className="label-texto" style={{ marginBottom: '0.5rem', display: 'block' }}>Asignación de Módulos y Funciones</span>

                                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', backgroundColor: '#f8fafc' }}>
                                        {modulosSistema.map((mod) => {
                                            const estaExpandido = modulosExpandidos[mod.id_modulo];
                                            const modSeleccionado = formDataRol.modulos.includes(mod.id_modulo);

                                            return (
                                                <div key={mod.id_modulo} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={modSeleccionado}
                                                                onChange={() => handleCheckboxModulo(mod.id_modulo, mod.funciones)}
                                                            />
                                                            {mod.nombre_modulo}
                                                        </label>

                                                        {mod.funciones && mod.funciones.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpandirModulo(mod.id_modulo)}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#2563eb', fontWeight: '500' }}
                                                            >
                                                                {estaExpandido ? 'Ocultar funciones ▲' : 'Ver funciones ▼'}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* FUNCIONES DESPLEGABLES */}
                                                    {estaExpandido && mod.funciones && mod.funciones.length > 0 && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginLeft: '1.5rem', marginTop: '0.4rem', paddingLeft: '0.5rem', borderLeft: '2px solid #cbd5e1' }}>
                                                            {mod.funciones.map((func) => {
                                                                const funcSeleccionada = formDataRol.funciones.includes(func.id_funcion);
                                                                return (
                                                                    <label key={func.id_funcion} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', color: '#334155' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={funcSeleccionada}
                                                                            onChange={() => handleCheckboxFuncion(func.id_funcion, mod.id_modulo, mod.funciones)}
                                                                        />
                                                                        {func.nombre_funcion}
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </fieldset>

                            <footer className="acciones-formulario">
                                <button type="button" className="boton-cancelar" onClick={() => setModalRolAbierto(false)}>Cancelar</button>
                                <button type="submit" className="boton-guardar">Guardar Rol</button>
                            </footer>
                        </form>
                    </article>
                </aside>
            )}

            {/* MODAL USUARIO */}
            {modalUsuarioAbierto && (
                <aside className="overlay-modal" onClick={() => setModalUsuarioAbierto(false)}>
                    <article className="contenido-modal" onClick={(e) => e.stopPropagation()}>
                        <header className="encabezado-modal">
                            <h2 className="titulo-modal">{modoModalUsuario === 'CREAR' ? 'Nuevo Usuario' : 'Editar Usuario'}</h2>
                            <button type="button" className="boton-cerrar-modal" onClick={() => setModalUsuarioAbierto(false)}>&times;</button>
                        </header>
                        <form onSubmit={handleSubmitUsuario} className="formulario-huesped">
                            <fieldset className="grupo-campos">
                                <label className="campo ancho-completo">
                                    <span className="label-texto">Nombre Completo *</span>
                                    <input
                                        type="text"
                                        value={formDataUsuario.nombre}
                                        onChange={(e) => setFormDataUsuario({ ...formDataUsuario, nombre: e.target.value })}
                                        className={erroresUsuario.nombre ? 'input-error' : ''}
                                        placeholder="Ej. Juan Pérez"
                                    />
                                    {erroresUsuario.nombre && <span className="texto-error-campo">{erroresUsuario.nombre}</span>}
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Correo Electrónico *</span>
                                    <input
                                        type="email"
                                        value={formDataUsuario.correo}
                                        onChange={(e) => setFormDataUsuario({ ...formDataUsuario, correo: e.target.value })}
                                        className={erroresUsuario.correo ? 'input-error' : ''}
                                        placeholder="usuario@hotel.com"
                                    />
                                    {erroresUsuario.correo && <span className="texto-error-campo">{erroresUsuario.correo}</span>}
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Contraseña {modoModalUsuario === 'EDITAR' && '(Dejar en blanco)'} *</span>
                                    <input
                                        type="password"
                                        value={formDataUsuario.contrasenna}
                                        onChange={(e) => setFormDataUsuario({ ...formDataUsuario, contrasenna: e.target.value })}
                                        className={erroresUsuario.contrasenna ? 'input-error' : ''}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                    {erroresUsuario.contrasenna && <span className="texto-error-campo">{erroresUsuario.contrasenna}</span>}
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Rol del Sistema *</span>
                                    <select
                                        value={formDataUsuario.id_rol}
                                        onChange={(e) => setFormDataUsuario({ ...formDataUsuario, id_rol: Number(e.target.value) })}
                                    >
                                        {roles.map((r) => (
                                            <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="campo medio">
                                    <span className="label-texto">Estado *</span>
                                    <select
                                        value={formDataUsuario.estado}
                                        onChange={(e) => setFormDataUsuario({ ...formDataUsuario, estado: e.target.value })}
                                    >
                                        <option value="ACTIVO">Activo</option>
                                        <option value="INACTIVO">Inactivo</option>
                                    </select>
                                </label>
                            </fieldset>
                            <footer className="acciones-formulario">
                                <button type="button" className="boton-cancelar" onClick={() => setModalUsuarioAbierto(false)}>Cancelar</button>
                                <button type="submit" className="boton-guardar">Guardar Usuario</button>
                            </footer>
                        </form>
                    </article>
                </aside>
            )}

            {/* MODAL ALERTAS */}
            {alerta.abierto && (
                <aside className="overlay-modal z-alto">
                    <article className="modal-alerta-tarjeta">
                        <h3 className="titulo-alerta">{alerta.titulo}</h3>
                        <p className="mensaje-alerta">{alerta.mensaje}</p>
                        <footer className="acciones-alerta">
                            {alerta.tipo === 'confirmar' ? (
                                <section className="grupo-botones-alerta-confirmar" style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="button" className="boton-alerta-secundario" onClick={() => setAlerta({ ...alerta, abierto: false })}>Cancelar</button>
                                    <button type="button" className="boton-alerta-peligro" onClick={() => { setAlerta({ ...alerta, abierto: false }); if (alerta.accion) alerta.accion(); }}>Sí, Eliminar</button>
                                </section>
                            ) : (
                                <button type="button" className="boton-alerta-primario" onClick={() => setAlerta({ ...alerta, abierto: false })}>Aceptar</button>
                            )}
                        </footer>
                    </article>
                </aside>
            )}
        </section>
    );
}