// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_favoritos.js

import callApi from './apiClient.js';

// --- Funciones para Usuarios Autenticados (USER y ADMIN) ---

/**
 * Agrega un producto a la lista de favoritos del usuario autenticado.
 * @param {number} productId - El ID del producto a agregar.
 * @returns {Promise<object>} - El objeto Favorito creado.
 */
export const addFavorite = (productId) => {
    // Llama a POST /api/favoritos/agregar?idProducto={productId}
    return callApi(`/favoritos/agregar?idProducto=${productId}`, 'POST', null, true);
};

/**
 * Elimina un producto de la lista de favoritos del usuario autenticado.
 * @param {number} productId - El ID del producto a eliminar.
 * @returns {Promise<null>} - Una promesa que se resuelve si se elimina correctamente.
 */
export const removeFavorite = (productId) => {
    // Llama a DELETE /api/favoritos/eliminar?idProducto={productId}
    return callApi(`/favoritos/eliminar?idProducto=${productId}`, 'DELETE', null, true);
};

/**
 * Obtiene la lista de productos favoritos del usuario autenticado.
 * @returns {Promise<object[]>} - Un array con los objetos Favorito.
 */
export const getFavorites = () => {
    // Llama a GET /api/favoritos
    return callApi('/favoritos', 'GET', null, true);
};