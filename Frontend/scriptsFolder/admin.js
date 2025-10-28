// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\admin.js

import { 
    obtenerProductos as getProducts, 
    obtenerProductoPorId as getProductById, 
    crearProducto as createProduct, 
    actualizarProducto as updateProduct, 
    eliminarProducto 
} from './api/api_productos.js';

import { cerrarSesion } from './api/api_auth.js';
import { showAlert } from './funciones.js';
import { renderizarEstrellas, obtenerPromedioEstrellas } from './estrellas.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de verificación de rol de administrador ---
    // Se ejecuta solo después de que el DOM esté listo.
    const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
    const jwtToken = localStorage.getItem('jwt_token');

    // --- Lógica de Cerrar Sesión ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            cerrarSesion(); // Limpia el token y los roles del localStorage
            window.location.href = 'index.html'; // Redirige a la página de inicio de sesión
        });
    }

    // La verificación de JWT y rol se hace aquí. Si no se cumple, se detiene todo.
    if (!jwtToken || !userRoles.includes('ROLE_ADMIN')) {
        // 1. Muestra un mensaje claro al usuario.
        showAlert({
            title: 'Acceso Denegado',
            message: 'No tienes los permisos necesarios para ver esta página.',
            type: 'error'
        });
        // 2. Redirige al usuario a la página principal.
        window.location.href = 'index.html';
        // 3. Detenemos la ejecución del script para que no intente hacer nada más.
        return; // Salimos de la función del DOMContentLoaded.
    }

    // Si la verificación es exitosa, el resto del código para las pestañas y
    // la carga de datos se ejecutará normalmente.

    // --- Lógica existente para la gestión de pestañas ---
    // Seleccionar todos los paneles desplegables <details>
    const detailsPanels = document.querySelectorAll('details');

    // Si no hay paneles, no hay nada más que hacer con las pestañas
    if (detailsPanels.length === 0) {
        return;
    }

    // Función para cargar datos al cambiar de pestaña
    const loadDataForTab = (tabId) => {
        if (tabId === 'producto-list') {
            loadProducts();
        } else if (tabId === 'usuario-list') {
            loadUsers();
        } else if (tabId === 'ventas-list') { // Necesitarás añadir un id="ventas-list" a la sección de ventas en el HTML
            loadSales();
        }
    }

    detailsPanels.forEach(panel => {
        // Dentro de cada panel, encontrar los enlaces de las pestañas y las secciones de contenido
        const tabLinks = panel.querySelectorAll('nav a');
        const contentSections = panel.querySelectorAll('.admin-tab-content');

        // Función para cambiar de pestaña DENTRO de un panel específico
        const switchTab = (event) => {
            event.preventDefault();
            const clickedLink = event.currentTarget;
            const targetId = clickedLink.getAttribute('href').substring(1); // Obtiene el ID sin el '#'

            // 1. Gestionar clases de los enlaces (menú de pestañas)
            tabLinks.forEach(link => {
                link.classList.remove('active-tab');
            });
            clickedLink.classList.add('active-tab');

            // 2. Gestionar clases de los contenidos (secciones)
            contentSections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active-content');
                } else {
                    section.classList.remove('active-content');
                }
            });
            loadDataForTab(targetId); // Cargar datos al cambiar de pestaña
        };

        // Asignar el evento de clic a cada enlace de pestaña
        tabLinks.forEach(link => {
            link.addEventListener('click', switchTab);
        });

        // Activar la primera pestaña por defecto al cargar la página o al abrir el <details>
        if (tabLinks.length > 0) {
            tabLinks[0].classList.add('active-tab');
            // Asegurarse de que el contenido de la primera pestaña también se muestre
            const firstTargetId = tabLinks[0].getAttribute('href').substring(1);
            const firstContentSection = panel.querySelector(`#${firstTargetId}`);
            if (firstContentSection) {
                firstContentSection.classList.add('active-content');
                loadDataForTab(firstTargetId); // Cargar datos para la primera pestaña visible
            }
        }
    });

    // --- Lógica de Gestión de Productos ---

    const productForm = document.querySelector('#producto-add-mod form');
    const productListTableBody = document.querySelector('#producto-list tbody');
    const productIdInput = document.getElementById('producto_id');
    const productNameInput = document.getElementById('producto_nombre');
    const productDescriptionInput = document.getElementById('producto_descripcion');
    const productPriceInput = document.getElementById('producto_precio');
    const productStockInput = document.getElementById('producto_stock');
    const productCategoryInput = document.getElementById('producto_categoria');
    const productDeleteForm = document.querySelector('#producto-delete form');

    // Cargar y renderizar productos
    async function loadProducts() {
        try {
            const products = await getProducts();
            renderProductsTable(products);
        } catch (error) {
            showAlert({
                title: 'Error',
                message: `Error al cargar productos: ${error.message}`,
                type: 'error'
            });
        }
    }

    // Renderizar la tabla de productos
    function renderProductsTable(products) {
        if (!productListTableBody) return;
        productListTableBody.innerHTML = ''; // Limpiar la tabla antes de renderizar
        products.forEach(product => {
            const row = productListTableBody.insertRow();
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.nombre}</td>
                <td>$${product.precio.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn-modify-product" data-id="${product.id}">Modificar</button>
                    <button class="btn-delete-product" data-id="${product.id}" style="background-color: #dc3545;">Eliminar</button>
                </td>
            `;
        });
        // Una vez renderizada la tabla, adjuntamos los eventos a los nuevos botones
        attachProductActionListeners();
    }

    // Adjuntar eventos a los botones de la tabla de productos
    function attachProductActionListeners() {
        document.querySelectorAll('.btn-modify-product').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
                try {
                    const product = await getProductById(productId);
                    // Rellenar el formulario con los datos del producto
                    productIdInput.value = product.id;
                    productNameInput.value = product.nombre;
                    productDescriptionInput.value = product.descripcion;
                    productPriceInput.value = product.precio;
                    productStockInput.value = product.stock;
                    productCategoryInput.value = product.categoria || '';

                    // Cambiar a la pestaña de "Añadir / Modificar"
                    document.querySelector('a[href="#producto-add-mod"]').click();
                } catch (error) {
                    showAlert({
                        title: 'Error',
                        message: `Error al cargar el producto para modificar: ${error.message}`,
                        type: 'error'
                    });
                }
            });
        });

        document.querySelectorAll('.btn-delete-product').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: `Quieres eliminar el producto con ID ${productId}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                    background: '#202020',
                    color: '#fff'
                });

                if (!result.isConfirmed) return;

                try {
                    await eliminarProducto(productId);
                    showAlert({ title: 'Éxito', message: 'Producto eliminado con éxito.', type: 'success' });
                    loadProducts(); // Recargar la lista de productos
                } catch (error) {
                    showAlert({ title: 'Error', message: `Error al eliminar el producto: ${error.message}`, type: 'error' });
                }
            });
        });
    }

    // Manejar el envío del formulario de añadir/modificar
    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const id = productIdInput.value;
            const productData = {
                nombre: productNameInput.value,
                descripcion: productDescriptionInput.value,
                precio: parseFloat(productPriceInput.value),
                stock: parseInt(productStockInput.value),
                categoria: productCategoryInput.value,
            };

            try {
                if (id) {
                    // Si hay un ID, actualizamos el producto existente
                    await updateProduct(id, productData);
                    showAlert({ title: 'Éxito', message: 'Producto actualizado con éxito.', type: 'success' });
                } else {
                    // Si no hay ID, creamos un nuevo producto
                    await createProduct(productData);
                    showAlert({ title: 'Éxito', message: 'Producto creado con éxito.', type: 'success' });
                }
                productForm.reset();
                productIdInput.value = ''; // Limpiar el campo ID
                loadProducts(); // Recargar la lista
                document.querySelector('a[href="#producto-list"]').click(); // Volver a la pestaña de listado
            } catch (error) {
                showAlert({ title: 'Error', message: `Error al guardar el producto: ${error.message}`, type: 'error' });
            }
        });
    }

    // Manejar el formulario de eliminación por ID
    if (productDeleteForm) {
        productDeleteForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const idToDelete = document.getElementById('producto_id_eliminar').value;
            if (!idToDelete) {
                showAlert({ title: 'Atención', message: 'Por favor, introduce un ID de producto para eliminar.', type: 'warning' });
                return;
            }
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Quieres eliminar el producto con ID ${idToDelete}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                background: '#202020',
                color: '#fff'
            });

            if (!result.isConfirmed) return;

            try {
                await eliminarProducto(idToDelete);
                showAlert({ title: 'Éxito', message: 'Producto eliminado con éxito.', type: 'success' });
                productDeleteForm.reset();
                loadProducts(); // Recargar la lista
            } catch (error) {
                showAlert({ title: 'Error', message: `Error al eliminar el producto: ${error.message}`, type: 'error' });
            }
        });
    }

    // --- Lógica para Gestión de Usuarios y Ventas (seguiría el mismo patrón) ---
    function loadUsers() { console.log('Cargando usuarios...'); /* Implementar aquí */ }
    function loadSales() { console.log('Cargando ventas...'); /* Implementar aquí */ }
});