// c:/Users/windows/Desktop/PROYECTO_YACOMO/Frontend/scriptsFolder/api/api_usuarios.js

import llamarApi from './apiClient.js';

/**
 * Obtiene los datos del perfil del usuario actualmente autenticado.
 * Requiere que el usuario esté logueado (token JWT válido).
 * @returns {Promise<object>} - Los datos del perfil del usuario.
 */
export const obtenerMiPerfil = () => {
    // Esta función asume que tienes un endpoint en el backend en GET /api/usuarios/me
    // que devuelve los datos del usuario autenticado a través de su token.
    return llamarApi('/usuarios/me', 'GET', null, true); // El 'true' final indica que es una ruta protegida.
};

// Aquí podrías agregar más funciones de admin en el futuro, como:
// export const obtenerTodosLosUsuarios = () => callApi('/usuarios', 'GET', null, true);
// export const actualizarUsuario = (id, data) => callApi(`/usuarios/${id}`, 'PUT', data, true);
// export const eliminarUsuario = (id) => callApi(`/usuarios/${id}`, 'DELETE', null, true);