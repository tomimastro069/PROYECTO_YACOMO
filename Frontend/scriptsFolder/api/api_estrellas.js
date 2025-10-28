// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_estrellas.js

import llamarApi from './apiClient.js';

/**
 * Envía la puntuación de un usuario para un producto específico.
 * @param {object} puntuacionData - Los datos de la puntuación.
 * @param {number} puntuacionData.productoId - El ID del producto que se está puntuando.
 * @param {number} puntuacionData.puntuacion - La puntuación dada (de 1 a 5).
 * @returns {Promise<null>} - Una promesa que se resuelve si la puntuación se guarda correctamente.
 */
export const darPuntuacion = (puntuacionData) => {
    // Llama a POST /api/estrellas y requiere autenticación.
    return llamarApi('/estrellas', 'POST', puntuacionData, true);
};