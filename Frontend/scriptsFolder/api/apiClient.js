// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\apiClient.js

export const BASE_URL = 'http://localhost:8080/api'; // ¡IMPORTANTE! Asegúrate de que esta URL sea la correcta para tu backend

/**
 * Función genérica para realizar llamadas a la API.
 * @param {string} endpoint - La ruta del endpoint (ej. '/productos', '/auth/login').
 * @param {string} method - El método HTTP (GET, POST, PUT, DELETE, PATCH).
 * @param {object|null} data - Los datos a enviar en el cuerpo de la petición (para POST, PUT, PATCH).
 * @param {boolean} requiresAuth - Indica si la petición requiere un token JWT.
 * @returns {Promise<object|null>} - La respuesta JSON de la API o null si es 204 No Content.
 * @throws {Error} - Si la petición falla o la respuesta no es exitosa.
 */
async function callApi(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Si se requiere autenticación pero no hay token, redirigir al login
            console.warn('Authentication required but no JWT token found. Redirecting to login.');
            window.location.href = 'login.html'; // Ajusta esta ruta si es necesario
            throw new Error('Authentication required.');
        }
    }

    const config = {
        method,
        headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }
    // Para GET con datos, generalmente se usan parámetros de consulta, no body.
    // Si tu backend espera un body en GET, esto debería ajustarse.

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            let errorDetail = `API error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.message || JSON.stringify(errorData);
            } catch (jsonError) { /* No es JSON */ }
            throw new Error(errorDetail);
        }

        return response.status === 204 ? null : response.json(); // 204 No Content no tiene body
    } catch (error) {
        console.error(`Error calling API endpoint ${endpoint}:`, error);
        throw error;
    }
}

export default callApi;