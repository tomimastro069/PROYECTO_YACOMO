// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_usuarios.js
//
// Funciones de ayuda para consumir los endpoints de usuarios desde el panel de administración.
// Se apoyan en apiClient.js para resolver la URL base, adjuntar el token y manejar errores.

import callApi from './apiClient.js';

export const getAllUsers = () => {
    // GET /api/usuarios (requiere rol ADMIN)
    return callApi('/usuarios', 'GET', null, true);
};

export const getUserById = (id) => {
    // GET /api/usuarios/{id}
    return callApi(`/usuarios/${id}`, 'GET', null, true);
};

export const createUser = (userData) => {
    // POST /api/usuarios
    return callApi('/usuarios', 'POST', userData, true);
};

export const updateUser = (id, userData) => {
    // PUT /api/usuarios/{id}
    return callApi(`/usuarios/${id}`, 'PUT', userData, true);
};

export const deleteUser = (id) => {
    // DELETE /api/usuarios/{id}
    return callApi(`/usuarios/${id}`, 'DELETE', null, true);
};
