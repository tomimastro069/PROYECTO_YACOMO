// c:\Users\windows\Desktop\PROYECTO_YACOMO\Frontend\scriptsFolder\admin.js

import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from './api/api_productos.js';
import { getAllUsers, updateUser, deleteUser } from './api/api_usuarios.js'; // Asumiendo que estos endpoints existen
import { getAllSales } from './api/api_ventas.js'; // Asumiendo que este endpoint existe
import { logoutUser } from './api/api_auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de verificación de rol de administrador ---
    const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
    const jwtToken = localStorage.getItem('jwt_token');

    if (!jwtToken || !userRoles.includes('ROLE_ADMIN')) {
        // Si no hay token o el usuario no es ADMIN, redirigir
        alert('Acceso denegado. Debes ser administrador para acceder a esta página.');
        // Redirige a la página de inicio de sesión (ajusta la ruta si es necesario)
        window.location.href = 'login.html'; // O 'index.html', 'error.html', etc.
        return; // Detener la ejecución del script si no es admin
    }

    // --- Lógica de Cerrar Sesión ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logoutUser(); // Limpia el token y los roles del localStorage
            window.location.href = 'login.html'; // Redirige a la página de inicio de sesión
        });
    }

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
            alert('Error al cargar productos: ' + error.message);
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
                    alert('Error al cargar el producto para modificar: ' + error.message);
                }
            });
        });

        document.querySelectorAll('.btn-delete-product').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
                if (confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${productId}?`)) {
                    try {
                        await deleteProduct(productId);
                        alert('Producto eliminado con éxito.');
                        loadProducts(); // Recargar la lista de productos
                    } catch (error) {
                        alert('Error al eliminar el producto: ' + error.message);
                    }
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
                    alert('Producto actualizado con éxito.');
                } else {
                    // Si no hay ID, creamos un nuevo producto
                    await createProduct(productData);
                    alert('Producto creado con éxito.');
                }
                productForm.reset();
                productIdInput.value = ''; // Limpiar el campo ID
                loadProducts(); // Recargar la lista
                document.querySelector('a[href="#producto-list"]').click(); // Volver a la pestaña de listado
            } catch (error) {
                alert('Error al guardar el producto: ' + error.message);
            }
        });
    }

    // Manejar el formulario de eliminación por ID
    if (productDeleteForm) {
        productDeleteForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const idToDelete = document.getElementById('producto_id_eliminar').value;
            if (!idToDelete) {
                alert('Por favor, introduce un ID de producto para eliminar.');
                return;
            }
            if (confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${idToDelete}?`)) {
                try {
                    await deleteProduct(idToDelete);
                    alert('Producto eliminado con éxito.');
                    productDeleteForm.reset();
                    loadProducts(); // Recargar la lista
                } catch (error) {
                    alert('Error al eliminar el producto: ' + error.message);
                }
            }
        });
    }

    // --- Lógica para Gestión de Usuarios y Ventas (seguiría el mismo patrón) ---
    function loadUsers() { console.log('Cargando usuarios...'); /* Implementar aquí */ }
    function loadSales() { console.log('Cargando ventas...'); /* Implementar aquí */ }
});