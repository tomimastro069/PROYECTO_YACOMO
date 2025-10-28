// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_productos.js

import llamarApi from './apiClient.js';

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
  return await llamarApi('/productos', 'GET', null, false);
};

/**
 * Obtiene un producto específico por su ID.
 * @param {number|string} id - ID del producto.
 * @returns {Promise<Producto>} - Detalle del producto.
 */
export const obtenerProductoPorId = async (id) => {
  console.log('🔍 Intentando obtener producto ID:', id);
  
  const endpoints = [
    { url: `/productos/by-id?id=${id}`, name: 'Temporal (@RequestParam)' },
    { url: `/productos/detalles/${id}`, name: 'Detalles (@PathVariable)' },
    { url: `/productos/fallback/${id}`, name: 'Fallback (@PathVariable)' },
    { url: `/productos/${id}`, name: 'Original (@PathVariable)' }
  ];

  for (let endpoint of endpoints) {
    try {
      console.log(`🌐 Probando endpoint: ${endpoint.name}`);
      const response = await llamarApi(endpoint.url, 'GET', null, false);
      
      if (response) {
        console.log(`✅ Éxito con endpoint: ${endpoint.name}`, response);
        return response;
      }
    } catch (error) {
      console.log(`❌ Falló endpoint ${endpoint.name}:`, error.message);
      // Continuar con el siguiente endpoint
    }
  }

  // Si todos los endpoints fallan, usar datos locales
  console.log('🔄 Todos los endpoints fallaron, usando datos locales...');
  try {
    const productos = await obtenerProductos();
    const productoLocal = productos.find(p => p.id === parseInt(id));
    
    if (productoLocal) {
      console.log('✅ Producto encontrado localmente');
      return productoLocal;
    } else {
      throw new Error('Producto no encontrado en datos locales');
    }
  } catch (error) {
    console.error('❌ Error fatal:', error);
    throw new Error('No se pudo obtener el producto de ninguna fuente');
  }
};

// Función para probar el endpoint de test
export const testApi = async () => {
  try {
    const response = await llamarApi('/productos/test', 'GET', null, false);
    console.log('✅ Test API:', response);
    return response;
  } catch (error) {
    console.error('❌ Test API falló:', error);
    return null;
  }
};

// Función para obtener productos con imágenes
export const obtenerProductosConImagenes = async () => {
  try {
    return await llamarApi('/productos/con-imagenes', 'GET', null, false);
  } catch (error) {
    console.error('Error obteniendo productos con imágenes:', error);
    // Fallback a endpoint normal
    return await obtenerProductos();
  }
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
  return await llamarApi('/productos', 'POST', datosProducto, true);
};

/**
 * Actualiza completamente un producto existente.
 * @param {number|string} id - ID del producto.
 * @param {object} datosProducto - Nuevos datos del producto.
 * @returns {Promise<Producto>} - Producto actualizado.
 */
export const actualizarProducto = async (id, datosProducto) => {
  return await llamarApi(`/productos/${id}`, 'PUT', datosProducto, true);
};

/**
 * Actualiza parcialmente un producto existente (PATCH).
 * @param {number|string} id - ID del producto.
 * @param {object} datosParciales - Campos a modificar.
 * @returns {Promise<Producto>} - Producto actualizado parcialmente.
 */
export const modificarProducto = async (id, datosParciales) => {
  return await llamarApi(`/productos/${id}`, 'PATCH', datosParciales, true);
};

/**
 * Elimina un producto por su ID.
 * @param {number|string} id - ID del producto.
 * @returns {Promise<null>} - Null si se elimina correctamente.
 */
export const eliminarProducto = async (id) => {
  return await llamarApi(`/productos/${id}`, 'DELETE', null, true);
};