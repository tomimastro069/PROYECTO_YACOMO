// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_ventas.js

import llamarApi from './apiClient.js';

/**
 * ================================================================
 * 🧾 API de Ventas
 * Funciones para obtener información de ventas desde el backend.
 * - Los datos manejan objetos de tipo VentaDTO o listas de VentaDTO.
 * - Todos los endpoints requieren autenticación con JWT.
 * ================================================================
 */

/**
 * Estructura esperada del objeto VentaDTO (referencia):
 * {
 *   usuario: {
 *     id: number,
 *     nombre: string,
 *     apellido: string,
 *     email: string
 *   },
 *   fechaVenta: string, // Formato ISO (YYYY-MM-DD)
 *   estado: string,     // Ej: 'PAGADA', 'PENDIENTE'
 *   productos: [
 *     {
 *       idProducto: number,
 *       cantidad: number,
 *       precioUnitario: number
 *     }
 *   ]
 * }
 */

// =============================================================
// 🧍‍♂️ Funciones para Usuarios Autenticados (USER y ADMIN)
// =============================================================

/**
 * Obtiene todas las compras realizadas por el usuario autenticado.
 * @returns {Promise<VentaDTO[]>} - Lista de ventas propias del usuario.
 */
export const obtenerMisCompras = async () => {
  return await llamarApi('/ventas/mis-compras', 'GET', null, true);
};

// =============================================================
// 🧮 Funciones para Administradores (ADMIN)
// =============================================================

/**
 * Obtiene todas las ventas del sistema (requiere rol ADMIN).
 * Puede recibir filtros opcionales como parámetros de consulta.
 * 
 * @param {object} [filtros] - Ejemplo: { estado: 'PAGADA', fechaDesde: '2025-01-01', fechaHasta: '2025-12-31' }
 * @returns {Promise<VentaDTO[]>} - Lista completa de ventas registradas.
 */
export const obtenerTodasLasVentas = async (filtros = null) => {
  return await llamarApi('/ventas', 'GET', null, true, filtros);
};

/**
 * Obtiene todas las ventas realizadas por un usuario específico (ADMIN).
 * 
 * @param {number|string} idUsuario - ID del usuario.
 * @returns {Promise<VentaDTO[]>} - Lista de ventas de ese usuario.
 */
export const obtenerVentasPorUsuario = async (idUsuario) => {
  return await llamarApi(`/ventas/usuario/${idUsuario}`, 'GET', null, true);
};
