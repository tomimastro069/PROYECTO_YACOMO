// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_productos.js

import callApi from './apiClient.js';

// --- Funciones Públicas (no requieren autenticación) ---

export const getProducts = () => {
    // Llama a GET /api/productos
    return callApi('/productos', 'GET', null, false);
};

export const getProductById = (id) => {
    // Llama a GET /api/productos/{id}
    return callApi(`/productos/${id}`, 'GET', null, false);
};

// --- Funciones de Administrador (requieren autenticación y rol ADMIN) ---

export const createProduct = (productData) => {
    // Llama a POST /api/productos
    return callApi('/productos', 'POST', productData, true);
};

export const updateProduct = (id, productData) => {
    // Llama a PUT /api/productos/{id}
    return callApi(`/productos/${id}`, 'PUT', productData, true);
};

export const patchProduct = (id, partialData) => {
    // Llama a PATCH /api/productos/{id} para actualizaciones parciales
    return callApi(`/productos/${id}`, 'PATCH', partialData, true);
};

export const deleteProduct = (id) => {
    // Llama a DELETE /api/productos/{id}
    return callApi(`/productos/${id}`, 'DELETE', null, true);
};