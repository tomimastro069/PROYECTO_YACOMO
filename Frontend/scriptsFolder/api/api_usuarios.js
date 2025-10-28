import llamarApi from './apiClient.js';

/**
 * Obtiene los datos del perfil del usuario actualmente autenticado.
 * Requiere que el usuario este logueado (token JWT valido).
 * @returns {Promise<object>} - Los datos del perfil del usuario.
 */
export const obtenerMiPerfil = () => {
    // Esta funcion asume un endpoint en GET /api/usuarios/me que devuelve el usuario autenticado mediante JWT.
    return llamarApi('/usuarios/me', 'GET', null, true);
};

export const crearDomicilio = (payload) => {
    return llamarApi('/usuarios/domicilios', 'POST', payload, true);
};

export const eliminarDomicilio = (domicilioId) => {
    return llamarApi(`/usuarios/domicilios/${domicilioId}`, 'DELETE', null, true);
};

