// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\api\api_imagenes.js

import llamarApi, { BASE_URL } from './apiClient.js';

// --- Funciones de Administrador (requieren autenticación y rol ADMIN) ---

/**
 * Sube una o varias imágenes para un producto específico.
 * @param {number} productoId - El ID del producto al que se asociarán las imágenes.
 * @param {File[]} files - Un array de objetos File a subir.
 * @returns {Promise<object>} - La respuesta de la API.
 */
export const subirImagenesProducto = async (productoId, files) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        console.warn('Authentication required but no JWT token found. Redirecting to login.');
        window.location.href = 'login.html'; // Ajusta esta ruta si es necesario
        throw new Error('Authentication required.');
    }

    const formData = new FormData();
    for (const file of files) {
        formData.append('imagenes', file);
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        // IMPORTANTE: No establecer 'Content-Type': 'multipart/form-data' aquí.
        // El navegador lo establecerá automáticamente con el boundary correcto cuando se usa FormData como body.
    };

    try {
        const response = await fetch(`${BASE_URL}/producto-imagenes/producto/${productoId}`, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        if (!response.ok) {
            let errorDetail = `API error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.message || JSON.stringify(errorData);
            } catch (jsonError) { /* No es JSON */ }
            throw new Error(errorDetail);
        }

        return response.status === 204 ? null : response.json();
    } catch (error) {
        console.error(`Error uploading images for product ${productoId}:`, error);
        throw error;
    }
};

/**
 * Elimina una imagen específica asociada a un producto.
 * @param {number} productoId - El ID del producto al que pertenece la imagen.
 * @param {number} idImagen - El ID de la imagen a eliminar.
 * @returns {Promise<null>} - Una promesa que se resuelve si la imagen se elimina correctamente.
 */
export const eliminarImagenProducto = (productoId, idImagen) => {
    // Llama a DELETE /api/producto-imagenes/{idImagen}/producto/{productoId}
    // Requiere autenticación (ADMIN)
    return llamarApi(`/producto-imagenes/${idImagen}/producto/${productoId}`, 'DELETE', null, true);
};