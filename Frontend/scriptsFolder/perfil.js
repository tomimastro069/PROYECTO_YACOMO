// Importar la función de logout para poder usarla
import { cerrarSesion } from './api/api_auth.js';
// Importar la nueva función para obtener los datos del perfil
import { obtenerMiPerfil } from './api/api_usuarios.js'; // Obtiene PerfilDTO
import { eliminarFavorito } from './api/api_favoritos.js'; // API para eliminar favoritos

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Carga de Datos del Perfil ---
    async function cargarDatosPerfil() {
        try {
            const usuario = await obtenerMiPerfil();

            // 1. Rellenar los campos del perfil con los datos reales del usuario
            // Header principal
            document.querySelector('.user-profile .user-name').textContent = `${usuario.nombre} ${usuario.apellido}`;
            document.querySelector('.user-profile .user-email').textContent = usuario.email; // Este selector es correcto para el header.
            // Sidebar
            document.querySelector('.sidebar .user-summary .user-name').textContent = `${usuario.nombre} ${usuario.apellido}`;
            // Contenido principal
            document.querySelector('.miniperfil-header .user-name').textContent = `${usuario.nombre} ${usuario.apellido}`;
            document.querySelector('.perfil-detalles li:nth-child(1) p').textContent = `${usuario.nombre} ${usuario.apellido}`;
            document.querySelector('.perfil-detalles li:nth-child(2) p').textContent = usuario.email;
            
            // Formatear y mostrar la fecha de registro
            const fechaRegistro = new Date(usuario.fechaRegistro).toLocaleDateString('es-ES');
            document.querySelector('.perfil-detalles li:nth-child(4) p').textContent = fechaRegistro;

            // 1.1 Rellenar las estadísticas de la barra lateral
            const totalGastado = usuario.ventas.reduce((acc, venta) => acc + venta.total, 0);
            const pedidosActivos = usuario.ventas.filter(v => v.estado !== 'ENTREGADO' && v.estado !== 'CANCELADO').length;

            document.getElementById('stat-total-gastado').textContent = totalGastado.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
            document.getElementById('stat-pedidos-activos').textContent = pedidosActivos;
            const favoritosCount = usuario.favoritos.length;
            const statFavoritosLink = document.getElementById('stat-favoritos');
            statFavoritosLink.textContent = `${favoritosCount} producto${favoritosCount !== 1 ? 's' : ''}`;

            // 2. Renderizar el historial de compras
            mostrarHistorial(usuario.ventas);

            // 3. Renderizar la lista de favoritos
            mostrarFavoritos(usuario.favoritos);

            // 4. Renderizar las direcciones
            mostrarDirecciones(usuario.domicilios);

        } catch (error) {
            console.error("Error al cargar los datos del perfil:", error);
            alert("No se pudieron cargar los datos del perfil. Serás redirigido al inicio.");
            window.location.href = 'index.html';
        }
    }

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

    // --- Ejecutar la carga de datos al iniciar la página ---
    cargarDatosPerfil(); // Esta función ahora carga todo

    // --- Lógica para mostrar los productos favoritos ---
    function mostrarFavoritos(favoritos) {
    const contenedorFavoritos = document.querySelector('.info-fav .product-list');
    if (!contenedorFavoritos) return;

    contenedorFavoritos.innerHTML = '';
    
    if (favoritos.length === 0) {
        contenedorFavoritos.innerHTML = '<div class="no-favorites"><p>No tienes productos favoritos</p></div>';
        return;
    }

    favoritos.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.className = 'product-card-fav'; // Usamos una clase específica para evitar conflictos
        productoElement.innerHTML = `
            <img src="${producto.producto.productoImagenes?.[0]?.imagen.url || 'https://via.placeholder.com/150'}" alt="${producto.producto.nombre}" class="product-image">
            
            <div class="product-details">
                <p class="product-brand top-brand">${producto.producto.categoria || 'Sin Marca'}</p>
                
                <div class="rating">
                    <span class="rating-stars">★★★★★</span>
                    <!-- El rating no viene en el DTO de favoritos, se puede añadir en el futuro -->
                </div>
                
                <div class="price-section">
                    <span class="current-price">$${producto.producto.precio.toLocaleString('es-AR')}</span>
                </div>

                <div class="product-title-group bottom-title">
                    <h3 class="product-title">${producto.producto.nombre}</h3>
                    <button class="remove-btn" data-product-id="${producto.producto.id}" aria-label="Eliminar producto">
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

    // Añadir listeners a los botones de eliminar recién creados
    contenedorFavoritos.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productoId = e.currentTarget.dataset.productId;
            if (confirm('¿Estás seguro de que quieres eliminar este producto de tus favoritos?')) {
                try {
                    await eliminarFavorito(productoId);
                    alert('Producto eliminado de favoritos.');
                    cargarDatosPerfil(); // Recargar todo el perfil
                } catch (error) {
                    alert('Error al eliminar el favorito: ' + error.message);
                }
            }
        });
    });
    }

    // --- Lógica para mostrar el historial de compras ---
    function mostrarHistorial(ventas) {
        const contenedorHistorial = document.querySelector('.info-historial');
        if (!contenedorHistorial) return;

        contenedorHistorial.innerHTML = '';

        if (ventas.length === 0) {
            contenedorHistorial.innerHTML = '<div class="no-favorites"><p>No tienes compras en tu historial.</p></div>';
            return;
        }

        ventas.forEach(venta => {
            const ventaCard = document.createElement('div');
            ventaCard.className = 'order-card';
            const fecha = new Date(venta.fechaVenta).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            const total = venta.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

            ventaCard.innerHTML = `
                <div class="order-header">
                    <div class="order-info">
                        <h3 class="order-id">Pedido #${venta.id}</h3>
                        <p class="order-date">${fecha}</p>
                    </div>
                    <div class="status-badge ${venta.estado.toLowerCase()}">
                        ${venta.estado}
                    </div>
                </div>
                <div class="order-summary">
                    <p class="summary-label">Total:</p>
                    <p class="summary-value">${total}</p>
                </div>
                <div class="order-products">
                    <p class="products-label">Productos (${venta.productos.length}):</p>
                </div>
                <div class="order-actions">
                    <button class="btn btn-details">Ver detalles</button>
                </div>
            `;
            contenedorHistorial.appendChild(ventaCard);
        });
    }

    // --- Lógica para mostrar las direcciones ---
    function mostrarDirecciones(domicilios) {
        const contenedorDirecciones = document.querySelector('.info-direcciones');
        if (!contenedorDirecciones) return;

        contenedorDirecciones.innerHTML = '';

        if (domicilios.length === 0) {
            contenedorDirecciones.innerHTML = '<div class="no-favorites"><p>No tienes direcciones guardadas.</p></div>';
            return;
        }

        domicilios.forEach(domicilio => {
            const domicilioCard = document.createElement('div');
            domicilioCard.className = 'address-card';
            domicilioCard.innerHTML = `
                <div class="address-icon-container">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                <div class="address-info">
                    <div class="address-title-group">
                        <span class="address-title">Domicilio</span>
                    </div>
                    <p class="address-line">${domicilio.direccion}</p>
                    <p class="address-line">Código Postal: ${domicilio.codigo_area}</p>
                </div>
            `;
            contenedorDirecciones.appendChild(domicilioCard);
        });
    }

    // --- Lógica para el botón de Cerrar Sesión ---
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que el enlace navegue a "/logout"
            cerrarSesion();
            alert('Has cerrado sesión.');
            window.location.href = 'index.html';
        });
    }
});
