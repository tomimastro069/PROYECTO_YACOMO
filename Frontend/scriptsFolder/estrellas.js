const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Renderiza estrellas visuales basadas en el promedio
 */
export function renderizarEstrellas(promedio) {
    const estrellasHTML = [];
    const promedioRedondeado = Math.round(promedio * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(promedioRedondeado)) {
            estrellasHTML.push('<span class="star star-filled">★</span>');
        } else if (i === Math.ceil(promedioRedondeado) && promedioRedondeado % 1 !== 0) {
            estrellasHTML.push('<span class="star star-half">★</span>');
        } else {
            estrellasHTML.push('<span class="star star-empty">☆</span>');
        }
    }

    return `
        <div class="rating-display">
            ${estrellasHTML.join('')}
            <span class="rating-number">(${promedio.toFixed(1)})</span>
        </div>
    `;
}

/**
 * Obtiene el promedio de estrellas de un producto
 */
export async function obtenerPromedioEstrellas(productoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/estrellas/promedio/${productoId}`);
        if (!response.ok) {
            console.warn(`No se pudo obtener el promedio para el producto ${productoId}`);
            return 0;
        }
        const promedio = await response.json();
        return promedio || 0;
    } catch (error) {
        console.error(`Error al obtener estrellas del producto ${productoId}:`, error);
        return 0;
    }
}

/**
 * Envía una calificación de un usuario para un producto
 */
export async function enviarCalificacion(productoId, puntuacion) {
    const jwtToken = localStorage.getItem('jwt_token');
    
    if (!jwtToken) throw new Error('Debes iniciar sesión para calificar productos');
    if (puntuacion < 1 || puntuacion > 5) throw new Error('La puntuación debe estar entre 1 y 5');
    
    try {
        const response = await fetch(`${API_BASE_URL}/estrellas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ productoId, puntuacion })
        });

        if (!response.ok) throw new Error('Error al enviar la calificación');
        return true;
    } catch (error) {
        console.error('Error al enviar calificación:', error);
        throw error;
    }
}

/**
 * Renderiza estrellas interactivas para que el usuario califique
 */
export function renderizarEstrellasInteractivas(productoId) {
    let estrellasHTML = `<div class="rating-interactive" data-producto-id="${productoId}">`;
    
    for (let i = 1; i <= 5; i++) {
        estrellasHTML += `<span class="star star-clickable star-empty" data-rating="${i}">★</span>`;
    }
    
    estrellasHTML += '</div>';
    return estrellasHTML;
}

/**
 * Inicializa eventos de las estrellas interactivas
 */
export function inicializarEstrellasInteractivas() {
    document.querySelectorAll('.rating-interactive').forEach(container => {
        const productoId = container.dataset.productoId;
        const stars = container.querySelectorAll('.star-clickable');
        
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                stars.forEach((s, index) => {
                    s.classList.toggle('star-filled', index < rating);
                    s.classList.toggle('star-empty', index >= rating);
                });
            });

            star.addEventListener('click', async () => {
                const rating = parseInt(star.dataset.rating);
                try {
                    await enviarCalificacion(productoId, rating);
                    alert('¡Gracias por tu calificación!');
                } catch (error) {
                    alert(error.message);
                }
            });
        });

        container.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('star-hover'));
        });
    });
}
