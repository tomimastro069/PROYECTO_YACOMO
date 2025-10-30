// scriptsFolder/detallesProducto.js
import { obtenerProductoPorId } from './api/api_productos.js';
import { agregarFavorito } from './api/api_favoritos.js';
import { agregarAlCarrito } from './funciones.js';

let productoActual = null;

export async function mostrarDetallesProducto(productoId) {
    try {
        console.log('Cargando detalles para producto ID:', productoId);
        
        // Intentar cargar desde la API
        productoActual = await obtenerProductoPorId(productoId);
        console.log('Producto cargado desde API:', productoActual);
        
        crearModalDetalles(productoActual);
        
    } catch (error) {
        console.error('Error al cargar detalles del producto desde API:', error);
        
        // Fallback: Buscar en los productos ya cargados en la página
        const productoFallback = buscarProductoEnPagina(productoId);
        if (productoFallback) {
            console.log('Usando datos de fallback:', productoFallback);
            productoActual = productoFallback;
            crearModalDetalles(productoActual);
        } else {
            alert('Error al cargar los detalles del producto. Intente nuevamente.');
        }
    }
}

function buscarProductoEnPagina(productoId) {
    // Buscar en todos los productos de la página
    const cards = document.querySelectorAll('.card');
    for (let card of cards) {
        const cardProductId = card.dataset.id?.replace('producto-', '');
        if (cardProductId === productoId.toString()) {
            return extraerDatosDeCard(card, productoId);
        }
    }
    return null;
}

function extraerDatosDeCard(card, productoId) {
    const titulo = card.querySelector('.Titulo')?.textContent || 'Producto';
    const precioTexto = card.querySelector('.Precio')?.textContent || '$0';
    const precio = parseFloat(precioTexto.replace('$', '').replace('.', '').replace(',', '.'));
    const stockTexto = card.querySelector('.stock')?.textContent || '';
    const stock = stockTexto.includes('🟢') ? 10 : 0;
    const imagen = card.querySelector('.Imagen_Producto')?.src || 'https://via.placeholder.com/200';
    
    return {
        id: parseInt(productoId),
        nombre: titulo,
        precio: precio,
        stock: stock,
        descripcion: 'Descripción no disponible temporalmente.',
        categoria: 'General',
        imagenes: [{ url: imagen }]
    };
}


// Generar miniaturas dinámicas con productoId
function generarMiniaturas(imagenes, productoId) {
    if (!imagenes || imagenes.length === 0) {
        return '<div class="x-thumb"></div>';
    }

    return imagenes.map((imagen, index) => `
        <div class="x-thumb ${index === 0 ? 'active' : ''}" 
             onclick="cambiarImagenPrincipal('${imagen.url}', ${productoId}, ${index})">
            <img src="${imagen.url}" alt="Miniatura ${index + 1}">
        </div>
    `).join('');
}

function configurarEventosModal(producto) {
    const modal = document.getElementById('modal-detalles-producto');
    const overlay = modal.querySelector('.x-overlay');
    const closeBtn = modal.querySelector('.x-close');

    const cerrarModal = () => {
        modal.remove();
    };

    overlay.addEventListener('click', cerrarModal);
    closeBtn.addEventListener('click', cerrarModal);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal) {
            cerrarModal();
        }
    });
}

// Función global para cambiar imagen principal desde las miniaturas
window.cambiarImagenPrincipal = function(url, productoId, index) {
    const mainImage = document.getElementById(`main-image-${productoId}`);
    const thumbs = document.querySelectorAll(`#thumbnails-${productoId} .x-thumb`);

    if (mainImage) mainImage.src = url;

    thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
};
window.increaseQuantity = function(productoId) {
    const input = document.getElementById(`quantity-${productoId}`);
    const max = parseInt(input.max);
    if (input.value < max) {
        input.value = parseInt(input.value) + 1;
    }
};

window.decreaseQuantity = function(productoId) {
    const input = document.getElementById(`quantity-${productoId}`);
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
};

window.agregarAlCarritoDesdeDetalles = function(productoId) {
    const cantidad = parseInt(document.getElementById(`quantity-${productoId}`).value);
    const productoConCantidad = {
        ...productoActual,
        cantidad: cantidad
    };
    
    const event = { target: document.querySelector('.btn-cart') };
    agregarAlCarrito(event, productoConCantidad);
    
    mostrarToast(`${cantidad} ${productoActual.nombre} agregado(s) al carrito`);
};

window.toggleFavoritoDesdeDetalles = async function(productoId) {
    try {
        await agregarFavorito(productoId);
        const btn = document.getElementById(`favorite-btn-${productoId}`);
        btn.innerHTML = '<i class="fa-solid fa-heart"></i> En Favoritos';
        btn.classList.add('active');
        mostrarToast('Producto agregado a favoritos');
    } catch (error) {
        alert('Error al agregar a favoritos: ' + (error.message || 'Por favor, inicia sesión.'));
    }
};

function mostrarToast(mensaje) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}