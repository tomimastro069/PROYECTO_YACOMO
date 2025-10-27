// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\apiClient.js

export const BASE_URL = 'http://localhost:8080/api';

/**
 * Función genérica y robusta para realizar llamadas a la API.
 * Maneja:
 * - Autenticación con JWT.
 * - Cuerpo JSON o FormData.
 * - Parámetros de consulta (queryParams).
 * - Distintos métodos HTTP.
 * - Manejo global de errores.
 *
 * @param {string} endpoint - Ruta del endpoint (por ej. '/productos', '/usuarios/5', '/ventas').
 * @param {string} method - Método HTTP (GET, POST, PUT, PATCH, DELETE).
 * @param {object|FormData|null} [data=null] - Datos a enviar (objeto o FormData).
 * @param {boolean} [requiresAuth=true] - Si la petición requiere token JWT.
 * @param {object|null} [queryParams=null] - Parámetros de consulta opcionales.
 * @param {object|null} [customHeaders=null] - Encabezados adicionales (sobrescriben los defaults).
 * @returns {Promise<object|null>} - La respuesta JSON o null si no hay contenido (204).
 * @throws {Error} - Si la petición falla.
 */
export async function llamarApi(
  endpoint,
  method = 'GET',
  data = null,
  requiresAuth = true,
  queryParams = null,
  customHeaders = null
) {
  try {
    // 🔹 Construcción dinámica de la URL
    let url = `${BASE_URL}${endpoint}`;
    if (queryParams && typeof queryParams === 'object') {
      const query = new URLSearchParams(queryParams).toString();
      if (query) url += `?${query}`;
    }

    // 🔹 Encabezados base
    const headers = customHeaders ? { ...customHeaders } : { 'Content-Type': 'application/json' };

    // 🔹 Autenticación
    if (requiresAuth) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('Auth required but no JWT token found. Redirecting to login.');
        redirectToLogin();
        throw new Error('Authentication required.');
      }
    }

    // 🔹 Configuración base de la petición
    const config = { method, headers };

    // 🔹 Cuerpo de la petición (solo para métodos que lo aceptan)
    const methodAllowsBody = ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
    if (data && methodAllowsBody) {
      if (data instanceof FormData) {
        // Si es FormData, no se define Content-Type manualmente (el navegador lo hace)
        delete headers['Content-Type'];
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    // 🔹 Ejecución de la petición
    const response = await fetch(url, config);

    // 🔹 Manejo de respuestas no exitosas
    if (!response.ok) {
      const errorData = await safeJsonParse(response);
      let message =
        errorData?.message ||
        errorData?.error ||
        `Error ${response.status}: ${response.statusText}`;

      // Ejemplo: si el token expira
      if (response.status === 401) {
        handleUnauthorized();
      }

      throw new Error(message);
    }

    // 🔹 Si no hay contenido (204)
    if (response.status === 204) return null;

    // 🔹 Intentar parsear JSON, devolver texto si no es JSON válido
    const result = await safeJsonParse(response);
    return result;
  } catch (error) {
    handleApiError(error, endpoint);
    throw error;
  }
}

/**
 * Intenta parsear la respuesta como JSON sin romper el flujo.
 */
async function safeJsonParse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Redirige al login si el usuario no está autenticado.
 */
function redirectToLogin() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user_roles');
  window.location.href = 'index.html';
}

/**
 * Maneja errores globales de API (red, CORS, 500, etc.).
 */
function handleApiError(error, endpoint) {
  console.error(`🔴 Error en endpoint ${endpoint}:`, error);
  alert(error.message || 'Error inesperado al comunicarse con el servidor.');
}

/**
 * Maneja el caso de token inválido o expirado.
 */
function handleUnauthorized() {
  alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
  redirectToLogin();
}

export default llamarApi;
