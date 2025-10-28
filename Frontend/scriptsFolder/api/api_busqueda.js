import llamarApi from './apiClient.js';

/**
 * Busca productos por nombre
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Producto[]>} - Lista de productos encontrados
 */
export const buscarProductos = async (query) => {
    if (!query || query.trim().length < 2) {
        return []; // No buscar si el término es muy corto
    }
    
    return await llamarApi(`/productos/buscar?q=${encodeURIComponent(query)}`, 'GET', null, false);
};