// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_auth.js

import llamarApi from './apiClient.js';

export const iniciarSesion = (credentials) => {
    // Llama a POST /api/auth/login
    return llamarApi('/auth/login', 'POST', credentials, false);
};

export const registrarUsuario = (userData) => {
    // Llama a POST /api/auth/register
    return llamarApi('/auth/register', 'POST', userData, false);
};

export const cerrarSesion = () => {
    // El logout es una acción del lado del cliente: simplemente borra los datos de sesión.
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_roles');
};