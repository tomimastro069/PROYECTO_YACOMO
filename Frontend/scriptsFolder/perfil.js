document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar todos los enlaces de navegación con la clase 'nav-link'
    const navLinks = document.querySelectorAll('.nav-link');
    // 2. Seleccionar todos los contenedores de contenido con la clase 'info'
    const contentSections = document.querySelectorAll('.info');
    
    // Función para manejar el cambio de pestaña
    const switchTab = (event) => {
        // Prevenir el comportamiento por defecto del enlace (evitar el salto de página)
        event.preventDefault(); 
        
        // Obtener el enlace en el que se hizo clic
        const clickedLink = event.currentTarget; 
        
        // Obtener el valor del atributo data-target, que es el nombre de la clase 
        // de la sección de contenido a mostrar (ej: 'info-perfil')
        const targetClass = clickedLink.getAttribute('data-target');
        
        // --- 1. Gestionar las clases de los ENLACES (el menú) ---
        
        // Remover la clase 'active-link' de todos los enlaces
        navLinks.forEach(link => {
            link.classList.remove('active-link');
        });

        // Agregar la clase 'active-link' solo al enlace que se ha clicado
        clickedLink.classList.add('active-link');

        // --- 2. Gestionar las clases de los CONTENIDOS (las secciones) ---
        
        // Ocultar todos los contenidos
        contentSections.forEach(section => {
            section.classList.remove('active-content'); // Remueve la clase para ocultar
        });

        // Mostrar solo el contenido de destino
        // Utilizamos la clase obtenida en targetClass para encontrar la sección 
        // y le agregamos la clase 'active-content' para mostrarla.
        const targetContent = document.querySelector(`.info.${targetClass}`);
        if (targetContent) {
            targetContent.classList.add('active-content');
        }
    };

    // 3. Asignar el evento click a cada enlace de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', switchTab);
    });

    // 4. Asegurarse de que la pestaña inicial se muestre al cargar la página (opcional, 
    // pero buena práctica si no lo manejaste con HTML)

    // Si no hay ningún enlace activo al inicio, activa el primero y muestra su contenido
    const initialActiveLink = document.querySelector('.nav-link.active-link');
    if (!initialActiveLink && navLinks.length > 0) {
        navLinks[0].classList.add('active-link');
        const firstTarget = navLinks[0].getAttribute('data-target');
        const firstContent = document.querySelector(`.${firstTarget}`);
        if (firstContent) {
            firstContent.classList.add('active-content');
        }
    }
});


// Array para almacenar los productos favoritos
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

// Función para generar un ID único para el producto basado en sus características
function generarIdProducto(producto) {
    return btoa(producto.titulo + producto.precio).replace(/[^a-zA-Z0-9]/g, '');
}

// Función para agregar un producto a favoritos
function agregarFavorito(event) {
    const card = event.target.closest('.card');
    if (!card) return;

    const titulo = card.querySelector('.Titulo').textContent;
    const precio = card.querySelector('.Precio').textContent;
    const imagen = card.querySelector('.Imagen_Producto').src;
    const marca = card.querySelector('.content')?.querySelector('h3')?.textContent || 'Sin marca';
    const rating = card.querySelector('.rating')?.textContent || '0/5';

    const producto = {
        titulo,
        precio,
        imagen,
        marca,
        rating,
        fechaAgregado: new Date().toLocaleDateString()
    };

    // Generar ID único para el producto
    producto.id = generarIdProducto(producto);

    // Verificar si el producto ya está en favoritos
    const yaExiste = favoritos.some(item => item.id === producto.id);
    
    if (!yaExiste) {
        // Agregar a favoritos si no existe
        favoritos.push(producto);
        // Guardar en localStorage
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        // Mostrar mensaje de éxito
        alert('Producto agregado a favoritos');
        // Actualizar la vista de favoritos si estamos en la página de perfil
        mostrarFavoritos();
    } else {
        // Mostrar mensaje si ya existe
        alert('Este producto ya está en favoritos');
    }
}

// Función para eliminar un producto de favoritos
function eliminarFavorito(productoId) {
    // Elimina el producto por ID y actualiza el array y localStorage
    favoritos = favoritos.filter(item => item.id !== productoId);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    // Permite volver a agregar el producto correctamente
    mostrarFavoritos();
    // Opcional: mostrar mensaje de confirmación
    // alert('Producto eliminado de favoritos');
}

// Función para mostrar los productos favoritos
function mostrarFavoritos() {
    const contenedorFavoritos = document.querySelector('.info-fav .product-list');
    if (!contenedorFavoritos) return;

    contenedorFavoritos.innerHTML = '';
    
    if (favoritos.length === 0) {
        contenedorFavoritos.innerHTML = '<div class="no-favorites"><p>No tienes productos favoritos</p></div>';
        return;
    }

    favoritos.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.className = 'product-card';
        productoElement.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}" class="product-image">
            
            <div class="product-details">
                <p class="product-brand top-brand">${producto.marca}</p>
                
                <div class="rating">
                    <span class="rating-stars">★★★★★</span>
                    <span class="rating-value">${producto.rating}</span>
                </div>
                
                <div class="price-section">
                    <span class="current-price">${producto.precio}</span>
                </div>
                
                <p class="added-date">Agregado el ${producto.fechaAgregado}</p>

                <div class="product-title-group bottom-title">
                    <h3 class="product-title">${producto.titulo}</h3>
                    <button class="remove-btn" onclick="eliminarFavorito('${producto.id}')" aria-label="Eliminar producto">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <button class="action-btn add-to-cart-btn">Agregar al carrito</button>
        `;
        contenedorFavoritos.appendChild(productoElement);
    });
}

// Agregar event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Agregar listeners a todos los botones de favoritos
    const botonesFavoritos = document.querySelectorAll('.btn-favorite');

    botonesFavoritos.forEach(boton => {
        boton.addEventListener('click', function(e) {
            // Animación visual
            boton.classList.remove('btn-animate');
            void boton.offsetWidth; // reflow para reiniciar animación
            boton.classList.add('btn-animate');
            agregarFavorito(e);
        });
    });

    // Mostrar los productos favoritos si estamos en la página de perfil
    mostrarFavoritos();
});

