﻿import { cerrarSesion } from './api/api_auth.js';
import { obtenerMiPerfil, crearDomicilio, eliminarDomicilio } from './api/api_usuarios.js';
import { eliminarFavorito } from './api/api_favoritos.js';
import { showAlert } from './funciones.js';

let perfilActual = null;

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.info');
    const addressForm = document.getElementById('address-form');
    const addressFeedback = document.querySelector('[data-address-feedback]');
    const addressList = document.querySelector('[data-address-list]');
    const logoutLink = document.querySelector('.logout-link');

    const formatCurrency = (value) => {
        const numberValue = Number(value || 0);
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 2
        }).format(numberValue);
    };

    const formatDate = (value) => {
        if (!value) return '--/--/----';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '--/--/----';
        return date.toLocaleDateString('es-AR');
    };

    const updateText = (selector, value) => {
        if (!selector) return;
        const node = document.querySelector(selector);
        if (node) node.textContent = value;
    };

    const setAddressFeedback = (message, type = '') => {
        if (!addressFeedback) return;
        addressFeedback.textContent = message || '';
        addressFeedback.classList.remove('error', 'success');
        if (type) {
            addressFeedback.classList.add(type);
        }
    };

    const switchTab = (event) => {
        event.preventDefault();
        const clickedLink = event.currentTarget;
        const targetClass = clickedLink.getAttribute('data-target');
        if (!targetClass) return;

        navLinks.forEach((link) => link.classList.remove('active-link'));
        clickedLink.classList.add('active-link');

        contentSections.forEach((section) => section.classList.remove('active-content'));
        const targetSection = document.querySelector(`.info.${targetClass}`);
        if (targetSection) {
            targetSection.classList.add('active-content');
        }
    };

    navLinks.forEach((link) => link.addEventListener('click', switchTab));
    // Activar pestaña desde query string (?tab=historial|pedidos|...)
    (function activateTabFromQuery(){
        try {
            const params = new URLSearchParams(location.search);
            const tab = (params.get('tab') || '').toLowerCase();
            if (!tab) return;
            const map = {
                'perfil':'info-perfil',
                'historial':'info-historial',
                'pedidos':'info-pedidos',
                'favoritos':'info-fav',
                'soporte':'info-soporte',
                'pagos':'info-pagos',
                'direcciones':'info-direcciones'
            };
            const target = map[tab];
            if (!target) return;
            const link = document.querySelector(`.nav-link[data-target="${target}"]`);
            if (link) {
                link.click();
            }
        } catch {}
    })();

    async function cargarDatosPerfil() {
        try {
            const usuario = await obtenerMiPerfil();
            perfilActual = usuario;

            const fullName = [usuario?.nombre, usuario?.apellido]
                .filter(Boolean)
                .join(' ')
                .trim() || 'Usuario';
            const email = usuario?.email || 'Sin correo';
            const ventas = Array.isArray(usuario?.ventas) ? usuario.ventas : [];
            const favoritos = Array.isArray(usuario?.favoritos) ? usuario.favoritos : [];
            const domicilios = Array.isArray(usuario?.domicilios) ? usuario.domicilios : [];

            const totalGastado = ventas.reduce((acc, venta) => acc + Number(venta?.total ?? 0), 0);
            const pedidosActivos = ventas.filter((venta) => {
                const estado = (venta?.estado || '').toUpperCase();
                return estado !== 'ENTREGADO' && estado !== 'CANCELADO';
            }).length;
            const pedidosTotales = ventas.length;

            const membershipLevel =
                pedidosTotales >= 10 ? 'Cliente Premium'
                : pedidosTotales >= 5 ? 'Cliente Frecuente'
                : 'Cliente Script-G';

            updateText('[data-header-username]', fullName);
            updateText('[data-header-email]', email);
            updateText('[data-sidebar-username]', fullName);
            updateText('[data-mini-name]', fullName);
            updateText('[data-detail-fullname]', fullName);
            updateText('[data-detail-email]', email);
            updateText('[data-detail-phone]', usuario?.telefono || 'No disponible');
            updateText('[data-detail-date]', formatDate(usuario?.fechaRegistro));
            updateText('[data-orders-count]', String(pedidosTotales));
            updateText('[data-total-spent]', formatCurrency(totalGastado));
            updateText('[data-membership]', membershipLevel);
            updateText('[data-mini-membership]', membershipLevel);
            updateText('[data-sidebar-membership]', membershipLevel);

            updateText('#stat-total-gastado', formatCurrency(totalGastado));
            updateText('#stat-pedidos-activos', String(pedidosActivos));
            const favoritosLabel = favoritos.length === 1 ? 'producto' : 'productos';
            const favoritosLink = document.getElementById('stat-favoritos');
            if (favoritosLink) {
                favoritosLink.textContent = `${favoritos.length} ${favoritosLabel}`;
            }

            mostrarHistorial(ventas);
            mostrarFavoritos(favoritos);
            mostrarDirecciones(domicilios);
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
            showAlert({
                title: 'Error de Carga',
                message: 'No se pudieron cargar los datos del perfil. Serás redirigido al inicio.',
                type: 'error'
            });
            window.location.href = 'index.html';
        }
    }

    function mostrarHistorial(ventas = []) {
        const contenedorHistorial = document.querySelector('.info-historial');
        if (!contenedorHistorial) return;

        contenedorHistorial.innerHTML = '';

        if (ventas.length === 0) {
            contenedorHistorial.innerHTML = '<div class="no-favorites"><p>No tienes compras en tu historial.</p></div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        ventas.forEach((venta) => {
            const estado = (venta?.estado || 'SIN ESTADO').toUpperCase();
            const fecha = formatDate(venta?.fechaVenta);
            const total = formatCurrency(venta?.total);
            const productos = Array.isArray(venta?.productos) ? venta.productos : [];

            const card = document.createElement('div');
            card.className = 'history-card'; // Cambiamos la clase para el nuevo estilo
            card.innerHTML = `
                <div class="history-card-header">
                    <div class="history-card-info">
                        <strong class="history-card-id">Pedido #${venta?.id ?? '---'}</strong>
                        <span class="history-card-date">Realizado el ${fecha}</span>
                    </div>
                    <div class="history-card-summary">
                        <strong class="history-card-total">${total}</strong>
                        <span class="history-card-status history-card-status--${estado.toLowerCase()}">${estado}</span>
                    </div>
                </div>
                <div class="history-card-body">
                    <div class="history-card-products">
                        ${productos.map(item => `
                            <div class="history-product">
                                <span class="history-product-qty">${item.cantidad}x</span>
                                <span class="history-product-name">${item.nombreProducto || 'Producto'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            fragment.appendChild(card);
        });

        contenedorHistorial.appendChild(fragment);
    }

    function mostrarFavoritos(favoritos = []) {
        const contenedorFavoritos = document.querySelector('.info-fav .product-list');
        if (!contenedorFavoritos) return;

        contenedorFavoritos.innerHTML = '';

        if (favoritos.length === 0) {
            contenedorFavoritos.innerHTML = '<div class="no-favorites"><p>No tienes productos favoritos.</p></div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        favoritos.forEach((favorito) => {
            const producto = favorito?.producto || {};
            const imagenUrl = producto?.productoImagenes?.[0]?.imagen?.url || 'https://via.placeholder.com/150';
            const categoria = producto?.categoria || 'Sin categoria';
            const precio = formatCurrency(producto?.precio);
            const nombreProducto = producto?.nombre || 'Producto sin nombre';

            const card = document.createElement('div');
            card.className = 'product-card-fav';
            card.innerHTML = `
                <img src="${imagenUrl}" alt="${nombreProducto}" class="product-image">
                <div class="product-details">
                    <p class="product-brand top-brand">${categoria}</p>
                    <div class="rating">
                        <span class="rating-stars">*****</span>
                    </div>
                    <div class="price-section">
                        <span class="current-price">${precio}</span>
                    </div>
                    <div class="product-title-group bottom-title">
                        <h3 class="product-title">${nombreProducto}</h3>
                        <button class="remove-btn" data-favorite-id="${favorito?.idFavorito}" aria-label="Eliminar producto">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <button class="action-btn add-to-cart-btn" type="button">Agregar al carrito</button>
            `;

            fragment.appendChild(card);
        });

        contenedorFavoritos.appendChild(fragment);

        contenedorFavoritos.querySelectorAll('.remove-btn').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const favoritoId = Number(event.currentTarget.dataset.favoriteId);
                if (!favoritoId) return;

                const result = await Swal.fire({
                    title: '¿Eliminar Favorito?',
                    text: '¿Estás seguro de que quieres eliminar este producto de tus favoritos?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    background: '#202020',
                    color: '#fff'
                });

                if (!result.isConfirmed) return;

                try {
                    await eliminarFavorito(favoritoId);
                    await cargarDatosPerfil();
                } catch (error) {
                    showAlert({ title: 'Error', message: `Error al eliminar el favorito: ${error.message ?? 'Intenta nuevamente.'}`, type: 'error' });
                }
            });
        });
    }

    function createAddressCard(domicilio) {
        const card = document.createElement('article');
        card.className = 'address-card';

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'address-icon-container';
        iconWrapper.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
        card.appendChild(iconWrapper);

        const info = document.createElement('div');
        info.className = 'address-info';

        const titleGroup = document.createElement('div');
        titleGroup.className = 'address-title-group';

        const title = document.createElement('span');
        title.className = 'address-title';
        title.textContent = 'Domicilio';
        titleGroup.appendChild(title);

        if (domicilio?.codigo_area !== undefined && domicilio?.codigo_area !== null) {
            const badge = document.createElement('span');
            badge.className = 'address-badge';
            badge.textContent = `Area ${domicilio.codigo_area}`;
            titleGroup.appendChild(badge);
        }

        info.appendChild(titleGroup);

        const line = document.createElement('p');
        line.className = 'address-line';
        line.textContent = domicilio?.direccion || 'Direccion sin especificar';
        info.appendChild(line);

        card.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'address-actions';

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn-danger';
        deleteButton.dataset.deleteAddress = domicilio?.id;
        deleteButton.textContent = 'Eliminar';
        actions.appendChild(deleteButton);

        card.appendChild(actions);

        return card;
    }

    function mostrarDirecciones(domicilios = []) {
        if (!addressList) return;
        addressList.innerHTML = '';

        if (domicilios.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'address-empty';
            empty.textContent = 'Aun no tienes domicilios guardados.';
            addressList.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        domicilios.forEach((domicilio) => fragment.appendChild(createAddressCard(domicilio)));
        addressList.appendChild(fragment);
    }

    async function handleAddressSubmit(event) {
        event.preventDefault();
        if (!addressForm) return;

        const direccion = addressForm.direccion?.value?.trim() || '';
        const codigoAreaValue = addressForm.codigo_area?.value;
        const codigoArea = Number.parseInt(codigoAreaValue, 10);

        if (!direccion) {
            setAddressFeedback('La direccion es obligatoria.', 'error');
            return;
        }

        if (!Number.isInteger(codigoArea) || codigoArea <= 0) {
            setAddressFeedback('El codigo de area debe ser un numero positivo.', 'error');
            return;
        }

        const submitButton = addressForm.querySelector('button[type="submit"]');
        setAddressFeedback('Guardando domicilio...');
        if (submitButton) submitButton.disabled = true;

        try {
            await crearDomicilio({ direccion, codigo_area: codigoArea });
            addressForm.reset();
            setAddressFeedback('Domicilio guardado correctamente.', 'success');
            await cargarDatosPerfil();
        } catch (error) {
            setAddressFeedback(error.message ?? 'No se pudo guardar el domicilio.', 'error');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    }

    async function handleAddressListClick(event) {
        const button = event.target.closest('[data-delete-address]');
        if (!button) return;

        const domicilioId = Number(button.dataset.deleteAddress);
        if (!domicilioId) return;

        const result = await Swal.fire({
            title: '¿Eliminar Domicilio?',
            text: '¿Estás seguro de que quieres eliminar este domicilio?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#202020',
            color: '#fff'
        });

        if (!result.isConfirmed) return;

        button.disabled = true;
        setAddressFeedback('Eliminando domicilio...', 'info');

        try {
            await eliminarDomicilio(domicilioId);
            setAddressFeedback('Domicilio eliminado.', 'success');
            await cargarDatosPerfil();
        } catch (error) {
            setAddressFeedback(error.message ?? 'No se pudo eliminar el domicilio.', 'error');
        } finally {
            button.disabled = false;
        }
    }

    if (addressForm) {
        addressForm.addEventListener('submit', handleAddressSubmit);
    }

    if (addressList) {
        addressList.addEventListener('click', handleAddressListClick);
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            cerrarSesion();
            showAlert({ title: 'Sesión Cerrada', message: 'Has cerrado sesión exitosamente.', type: 'info' });
            window.location.href = 'index.html';
        });
    }

    cargarDatosPerfil();
});
