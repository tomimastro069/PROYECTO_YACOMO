// scriptsFolder/detallesProducto.js
export function mostrarDetallesProducto(productoId) {
    window.location.href = `productos.html?producto=${productoId}`;
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
    const imagen = card.querySelector('.Imagen_Producto')?.src || PLACEHOLDER_IMG;
    
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
    // Remover modal anterior si existe
    const modalExistente = document.getElementById('modal-detalles-producto');
    if (modalExistente) modalExistente.remove();

    const imgUrl = (producto.imagenes && producto.imagenes[0]?.url) ? producto.imagenes[0].url : PLACEHOLDER_IMG;
    const stockClass = producto.stock > 10 ? 'in-stock' : (producto.stock > 0 ? 'low-stock' : 'out-of-stock');
    const stockText = producto.stock > 10 ? 'En stock' : (producto.stock > 0 ? 'Stock bajo' : 'Agotado');

    const modal = document.createElement('div');
    modal.id = 'modal-detalles-producto';
    modal.className = 'modal-detalles';
    
    modal.innerHTML = `
        <div class="x-overlay"></div>
        <div class="x-modal-content">
            <button class="x-close">✕</button>
            <div class="x-modal-body">
                <div class="x-product-images">
                    <div class="x-main-image-container">
                        <img id="main-image-${producto.id}" 
                             class="x-main-image" 
                             src="${imgUrl}" 
                             alt="${producto.nombre}">
                    </div>
                    <div class="x-thumbnails" id="thumbnails-${producto.id}">
                        ${generarMiniaturas(producto.imagenes, producto.id)}
                    </div>
                </div>
                
                <div class="x-product-info">
                    <h1 class="x-product-title">${producto.nombre}</h1>
                    
                    <div class="x-product-price">$${(producto.precio ?? 0).toLocaleString('es-AR')}</div>
                    
                    <div class="x-product-stock ${stockClass}">${stockText}</div>
                    
                    ${producto.descripcion ? `<p class="x-product-description">${producto.descripcion}</p>` : ''}
                    
                    <div class="x-quantity-selector">
                        <label>Cantidad:</label>
                        <button onclick="decreaseQuantity(${producto.id})">-</button>
                        <input type="number" 
                               id="quantity-${producto.id}" 
                               value="1" 
                               min="1" 
                               max="${producto.stock}" 
                               readonly>
                        <button onclick="increaseQuantity(${producto.id})">+</button>
                    </div>
                    
                    <div class="x-action-buttons">
                        <button class="x-btn-cart" onclick="agregarAlCarritoDesdeDetalles(${producto.id})">
                            <i class="fa-solid fa-cart-shopping"></i> Agregar al Carrito
                        </button>
                        <button class="x-btn-favorite" id="favorite-btn-${producto.id}" 
                                onclick="toggleFavoritoDesdeDetalles(${producto.id})">
                            <i class="fa-regular fa-heart"></i> Agregar a Favoritos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar modal con animación
    setTimeout(() => modal.classList.add('show'), 10);
    
    configurarEventosModal(producto);
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
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    };

    overlay.addEventListener('click', cerrarModal);
    closeBtn.addEventListener('click', cerrarModal);

    const handleEscape = (e) => {
        if (e.key === 'Escape' && modal) {
            cerrarModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    
    document.addEventListener('keydown', handleEscape);
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
    
    const event = { target: document.querySelector('.x-btn-cart') };
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
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}