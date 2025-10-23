// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_productos.js

import callApi from './apiClient.js';

/**
 * ================================================================
 * 🛍️ API de Productos
 * Funciones para obtener, crear, actualizar y eliminar productos.
 * - Algunas funciones son públicas (sin autenticación)
 * - Otras requieren rol ADMIN autenticado.
 * ================================================================
 */

/**
 * Estructura esperada del objeto Producto (referencia):
 * {
 *   id: number,
 *   nombre: string,
 *   descripcion: string,
 *   precio: number,
 *   stock: number,
 *   categoria?: string,
 *   imagenes?: string[]
 * }
 */

// =============================================================
// 🌍 Funciones Públicas (sin autenticación)
// =============================================================

/**
 * Obtiene todos los productos disponibles.
 * @returns {Promise<Producto[]>} - Lista de productos.
 */
export const obtenerProductos = async () => {
  return await callApi('/productos', 'GET', null, false);
};

/**
 * Obtiene un producto específico por su ID.
 * @param {number|string} id - ID del producto.
 * @returns {Promise<Producto>} - Detalle del producto.
 */
export const obtenerProductoPorId = async (id) => {
  return await callApi(`/productos/${id}`, 'GET', null, false);
};

// =============================================================
// 🧑‍💼 Funciones de Administrador (requieren autenticación)
// =============================================================

/**
 * Crea un nuevo producto en el sistema.
 * @param {object} datosProducto - Datos del producto a crear.
 * @returns {Promise<Producto>} - Producto creado.
 */
export const crearProducto = async (datosProducto) => {
  return await callApi('/productos', 'POST', datosProducto, true);
};

/**
 * Actualiza completamente un producto existente.
 * @param {number|string} id - ID del producto.
 * @param {object} datosProducto - Nuevos datos del producto.
 * @returns {Promise<Producto>} - Producto actualizado.
 */
export const actualizarProducto = async (id, datosProducto) => {
  return await callApi(`/productos/${id}`, 'PUT', datosProducto, true);
};

/**
 * Actualiza parcialmente un producto existente (PATCH).
 * @param {number|string} id - ID del producto.
 * @param {object} datosParciales - Campos a modificar.
 * @returns {Promise<Producto>} - Producto actualizado parcialmente.
 */
export const modificarProducto = async (id, datosParciales) => {
  return await callApi(`/productos/${id}`, 'PATCH', datosParciales, true);
};

/**
 * Elimina un producto por su ID.
 * @param {number|string} id - ID del producto.
 * @returns {Promise<null>} - Null si se elimina correctamente.
 */
export const eliminarProducto = async (id) => {
  return await callApi(`/productos/${id}`, 'DELETE', null, true);
};
