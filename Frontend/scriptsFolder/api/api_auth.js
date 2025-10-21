// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_auth.js

import callApi from './apiClient.js';

export const loginUser = (credentials) => {
    // Llama a POST /api/auth/login
    return callApi('/auth/login', 'POST', credentials, false);
};

export const registerUser = (userData) => {
    // Llama a POST /api/auth/register
    return callApi('/auth/register', 'POST', userData, false);
};

export const logoutUser = () => {
    // El logout es una acción del lado del cliente: simplemente borra los datos de sesión.
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_roles');
};