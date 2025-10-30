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

// Solicita el envío del enlace de recuperación de contraseña
export const solicitarRecuperacionPassword = (email) => {
  // Llama a POST /api/auth/forgot-password con { email }
  return llamarApi('/auth/forgot-password', 'POST', { email }, false);
};

// Restablece la contraseña con token de recuperación
export const resetearPassword = (token, newPassword) => {
  // Llama a POST /api/auth/reset-password con { token, newPassword }
  return llamarApi('/auth/reset-password', 'POST', { token, newPassword }, false);
};

export const cerrarSesion = () => {
  // El logout es una accion del lado del cliente: simplemente borra los datos de sesion.
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user_roles');
};
