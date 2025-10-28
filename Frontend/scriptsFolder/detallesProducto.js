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

function crearModalDetalles(producto) {
    const modalExistente = document.getElementById('modal-detalles-producto');
    if (modalExistente) {
        modalExistente.remove();
    }

    const modalHTML = `
        <div id="modal-detalles-producto" class="x-modal" aria-hidden="true">
            <a class="x-overlay" href="#"></a>
            <section class="x-dialog" role="dialog" aria-modal="true" aria-labelledby="ttl-${producto.id}">
                <header class="x-header">
                    <h3 id="ttl-${producto.id}">${producto.nombre}</h3>
                    <a class="x-close" href="#" aria-label="Cerrar">✕</a>
                </header>

                <div class="x-content">
                    <div class="x-gallery">
                        <div class="x-main">
                            <img src="${producto.imagenes?.[0]?.url || 'https://via.placeholder.com/600x400'}" 
                                 alt="${producto.nombre}" id="main-image-${producto.id}">
                        </div>
                        <div class="x-thumbs" id="thumbnails-${producto.id}">
                            ${generarMiniaturas(producto.imagenes || [])}
                        </div>
                    </div>
                    
                    <aside class="x-side">
                        <div class="x-badges">
                            <span class="x-chip">${producto.categoria || 'General'}</span>
                            <span class="x-chip ${producto.stock > 0 ? 'en-stock' : 'sin-stock'}">
                                ${producto.stock > 0 ? '🟢 En stock' : '🔴 Agotado'}
                            </span>
                            <span class="x-chip">★★★★★ 5/5</span>
                        </div>
                        
                        <div class="x-priceBox">
                            <div class="x-big">$${producto.precio?.toLocaleString('es-AR') || '0'}</div>
                            <div class="x-muted">Precio incluye IVA</div>
                        </div>
                        
                        <div class="x-flags">
                            <span class="x-chip">Envío gratis</span>
                            <span class="x-chip">Garantía oficial</span>
                        </div>

                        <div class="quantity-selector">
                            <button class="quantity-btn" onclick="decreaseQuantity(${producto.id})">-</button>
                            <input type="number" class="quantity-input" id="quantity-${producto.id}" value="1" min="1" max="${producto.stock || 1}">
                            <button class="quantity-btn" onclick="increaseQuantity(${producto.id})">+</button>
                        </div>

                        <div class="x-actions">
                            <button class="btn-cart" onclick="agregarAlCarritoDesdeDetalles(${producto.id})" 
                                    ${producto.stock === 0 ? 'disabled' : ''}>
                                <i class="fa-solid fa-cart-plus"></i>
                                ${producto.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                            </button>
                            <button class="btn-favorite" onclick="toggleFavoritoDesdeDetalles(${producto.id})" id="favorite-btn-${producto.id}">
                                <i class="fa-regular fa-heart"></i>
                                Favoritos
                            </button>
                        </div>
                    </aside>
                </div>

                <section class="x-tabs">
                    <div class="x-tab">
                        <input type="radio" name="tab-${producto.id}" id="${producto.id}-descripcion" checked>
                        <label for="${producto.id}-descripcion">Descripción</label>
                        <div class="x-panel">
                            <div class="x-box">
                                <p>${producto.descripcion || 'Descripción no disponible temporalmente.'}</p>
                            </div>
                        </div>
                    </div>

                    <div class="x-tab">
                        <input type="radio" name="tab-${producto.id}" id="${producto.id}-especificaciones">
                        <label for="${producto.id}-especificaciones">Especificaciones</label>
                        <div class="x-panel">
                            <div class="x-cols">
                                <div class="x-box">
                                    <h4>Información General</h4>
                                    <div class="x-kv">
                                        <div>Stock disponible</div>
                                        <div>${producto.stock} unidades</div>
                                        <div>Categoría</div>
                                        <div>${producto.categoria || 'No especificada'}</div>
                                        ${producto.promocion ? `<div>Promoción</div><div>${producto.promocion}</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="x-tab">
                        <input type="radio" name="tab-${producto.id}" id="${producto.id}-reseñas">
                        <label for="${producto.id}-reseñas">Reseñas</label>
                        <div class="x-panel">
                            <div class="x-box">
                                <p class="x-muted">Este producto aún no tiene reseñas. ¡Sé el primero en opinar!</p>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    configurarEventosModal(producto);
    document.getElementById('modal-detalles-producto').style.display = 'block';
}

function generarMiniaturas(imagenes) {
    if (imagenes.length === 0) {
        return '<div class="x-thumb"></div>';
    }
    
    return imagenes.map((imagen, index) => `
        <div class="x-thumb ${index === 0 ? 'active' : ''}" 
             onclick="cambiarImagenPrincipal('${imagen.url}', ${index})">
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

// Funciones globales para los eventos
window.cambiarImagenPrincipal = function(url, index) {
    const productoId = productoActual?.id;
    if (!productoId) return;
    
    const mainImage = document.getElementById(`main-image-${productoId}`);
    const thumbs = document.querySelectorAll(`#thumbnails-${productoId} .x-thumb`);
    
    if (mainImage) {
        mainImage.src = url;
    }
    
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