// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_ventas.js

import callApi from './apiClient.js';

// --- Funciones para Usuarios Autenticados (USER y ADMIN) ---

export const createSale = (saleData) => {
    // Llama a POST /api/ventas
    // Requiere autenticación
    return callApi('/ventas', 'POST', saleData, true);
};

export const getMySales = () => {
    // Llama a GET /api/ventas/mis-compras
    // Requiere autenticación
    return callApi('/ventas/mis-compras', 'GET', null, true);
};

// --- Funciones solo para Administradores (ADMIN) ---

export const getAllSales = () => {
    // Llama a GET /api/ventas
    return callApi('/ventas', 'GET', null, true);
};

export const getSalesByUserId = (userId) => {
    // Llama a GET /api/ventas/usuario/{idUsuario}
    return callApi(`/ventas/usuario/${userId}`, 'GET', null, true);
};