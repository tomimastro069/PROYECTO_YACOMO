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
  console.log('🔍 Obteniendo producto ID:', id);
  
  try {
    const producto = await llamarApi(`/productos/${id}`, 'GET', null, false);
    console.log('✅ Producto obtenido:', producto);
    return producto;
  } catch (error) {
    console.error('❌ Error al obtener producto:', error.message);
    throw error;
  }
};

/**
 * Obtiene un producto por su nombre (búsqueda de ID).
 * @param {string} nombre - Nombre del producto.
 * @returns {Promise<{id: number, nombre: string}>} - ID y nombre del producto.
 */
export const obtenerProductoIdPorNombre = async (nombre) => {
  console.log('🔍 Buscando ID del producto por nombre:', nombre);
  
  try {
    const resultado = await llamarApi(
      `/productos/buscar-id?nombre=${encodeURIComponent(nombre)}`, 
      'GET', 
      null, 
      true
    );
    console.log('✅ Producto encontrado:', resultado);
    return resultado;
  } catch (error) {
    console.error('❌ Error al buscar producto por nombre:', error.message);
    throw error;
  }
};

/**
 * Obtiene las imágenes de un producto.
 * @param {number|string} id - ID del producto.
 * @returns {Promise<Array>} - Lista de imágenes del producto.
 */
export const obtenerImagenesProducto = async (id) => {
  console.log('🖼️ Obteniendo imágenes del producto ID:', id);
  
  try {
    const imagenes = await llamarApi(`/productos/${id}/imagenes`, 'GET', null, false);
    console.log(`✅ ${imagenes.length} imagen(es) obtenida(s)`);
    return imagenes;
  } catch (error) {
    console.error('❌ Error al obtener imágenes:', error.message);
    return []; // Retorna array vacío si falla
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
  console.log('➕ Creando producto:', datosProducto.nombre);
  return await llamarApi('/productos', 'POST', datosProducto, true);
};

/**
 * Actualiza completamente un producto existente.
 * @param {number|string} id - ID del producto.
 * @param {object} datosProducto - Nuevos datos del producto.
 * @returns {Promise<Producto>} - Producto actualizado.
 */
export const actualizarProducto = async (id, datosProducto) => {
  console.log('✏️ Actualizando producto ID:', id);
  return await llamarApi(`/productos/${id}`, 'PUT', datosProducto, true);
};

/**
 * Actualiza parcialmente un producto existente (PATCH).
 * @param {number|string} id - ID del producto.
 * @param {object} datosParciales - Campos a modificar.
 * @returns {Promise<Producto>} - Producto actualizado parcialmente.
 */
export const modificarProducto = async (id, datosParciales) => {
  console.log('🔧 Modificando producto ID:', id);
  return await llamarApi(`/productos/${id}`, 'PATCH', datosParciales, true);
};

/**
 * Elimina un producto por su ID.
 * @param {number|string} id - ID del producto.
 * @returns {Promise<null>} - Null si se elimina correctamente.
 */
export const eliminarProducto = async (id) => {
  console.log('🗑️ Eliminando producto ID:', id);
  return await llamarApi(`/productos/${id}`, 'DELETE', null, true);
};

/**
 * Sube imágenes a un producto.
 * @param {number|string} productoId - ID del producto.
 * @param {FileList|File[]} imagenes - Archivos de imagen.
 * @returns {Promise<string>} - Mensaje de confirmación.
 */
export const subirImagenesProducto = async (productoId, imagenes) => {
  console.log(`📤 Subiendo ${imagenes.length} imagen(es) al producto ID:`, productoId);
  
  const formData = new FormData();
  for (const file of imagenes) {
    formData.append('imagenes', file);
  }

  const token = localStorage.getItem('jwt_token');
  const response = await fetch(
    `http://localhost:8080/api/producto-imagenes/producto/${productoId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const mensaje = await response.text();
  console.log('✅ Imágenes subidas:', mensaje);
  return mensaje;
};

/**
 * Elimina una imagen de un producto.
 * @param {number|string} productoId - ID del producto.
 * @param {number|string} imagenId - ID de la imagen.
 * @returns {Promise<string>} - Mensaje de confirmación.
 */
export const eliminarImagenProducto = async (productoId, imagenId) => {
  console.log(`🗑️ Eliminando imagen ${imagenId} del producto ${productoId}`);
  
  const token = localStorage.getItem('jwt_token');
  const response = await fetch(
    `http://localhost:8080/api/producto-imagenes/${imagenId}/producto/${productoId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const mensaje = await response.text();
  console.log('✅ Imagen eliminada:', mensaje);
  return mensaje;
};