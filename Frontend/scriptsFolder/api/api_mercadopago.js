// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_mercadopago.js

import llamarApi from './apiClient.js';

/**
 * ================================================================
 * 💳 API de Mercado Pago
 * Funciones para interactuar con el proceso de pago.
 * ================================================================
 */

/**
 * Crea una preferencia de pago en Mercado Pago a través del backend.
 * El backend se encarga de registrar la venta como 'PENDIENTE' y generar la URL de pago.
 *
 * @param {object} datosOrden - Los datos de la orden para crear la preferencia.
 * @param {Array<object>} datosOrden.productos - Un array de productos en el carrito.
 * @param {number} datosOrden.productos[].idProducto - ID del producto.
 * @param {number} datosOrden.productos[].cantidad - Cantidad del producto.
 * @returns {Promise<{init_point: string}>} - Un objeto que contiene la URL de pago (`init_point`).
 */
export const crearPreferencia = async (datosOrden) => {
  // Llama a POST /api/payments/create-order
  // El endpoint requiere autenticación para asociar la compra al usuario logueado.
  // El cuerpo de la petición debe contener la lista de productos.
  return await llamarApi('/payments/create-order', 'POST', datosOrden, true);
};

export default {
  crearPreferencia,
};
