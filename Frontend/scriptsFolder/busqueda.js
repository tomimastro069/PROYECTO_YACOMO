// scriptsFolder/busqueda.js

import { buscarProductos } from './api/api_busqueda.js';
import { mostrarDetallesProducto } from './detallesProducto.js';

class BusquedaManager {
    constructor() {
        console.log('🔍 BusquedaManager: Inicializando con integración de detalles...');
        
        this.searchInput = document.querySelector('.busqueda input');
        this.resultsContainer = document.getElementById('searchResults');
        this.resultsList = this.resultsContainer?.querySelector('.resultados-container');
        this.debounceTimer = null;
        this.isSearching = false;
        this.productosEncontrados = []; // Para almacenar los productos encontrados
        
        console.log('📍 Elementos encontrados:', {
            searchInput: this.searchInput,
            resultsContainer: this.resultsContainer,
            resultsList: this.resultsList
        });
        
        this.init();
    }

    init() {
        if (!this.searchInput || !this.resultsContainer) {
            console.error('❌ ERROR: No se encontraron elementos de búsqueda');
            return;
        }

        console.log('✅ Elementos de búsqueda encontrados correctamente');

        // Event listeners
        this.searchInput.addEventListener('input', (e) => {
            console.log('📝 INPUT EVENT DISPARADO - Valor:', e.target.value);
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.handleInput(e);
        }, true);
        
        this.searchInput.addEventListener('keydown', (e) => {
            console.log('⌨️ KEYDOWN EVENT DISPARADO - Tecla:', e.key);
            this.handleKeydown(e);
        });
        
        this.searchInput.addEventListener('focus', () => {
            console.log('🎯 FOCUS EVENT DISPARADO - Input enfocado');
            this.showResults();
        });
        
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        this.resultsContainer.addEventListener('click', (e) => e.stopPropagation());
        
        console.log('✅ Event listeners configurados con integración de detalles');
    }

    handleInput(e) {
        const query = e.target.value.trim();
        console.log('🔍 Handle input:', query);
        
        // Clear previous debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Hide results if query is too short
        if (query.length < 2) {
            console.log('📏 Query muy corta, ocultando resultados');
            this.hideResults();
            return;
        }

        // Show loading state
        this.showLoading();
        console.log('⏳ Mostrando loading...');

        // Debounce search
        this.debounceTimer = setTimeout(() => {
            console.log('🚀 Ejecutando búsqueda después de debounce:', query);
            this.performSearch(query);
        }, 300);
    }

    handleKeydown(e) {
        if (e.key === 'Enter') {
            console.log('↵ ENTER presionado');
            e.preventDefault();
            this.performFinalSearch();
        } else if (e.key === 'Escape') {
            console.log('⎋ ESC presionado');
            this.hideResults();
        }
    }

    handleClickOutside(e) {
        if (!this.resultsContainer.contains(e.target) && e.target !== this.searchInput) {
            console.log('👆 Click fuera, ocultando resultados');
            this.hideResults();
        }
    }

    async performSearch(query) {
        if (this.isSearching) {
            console.log('⏳ Ya hay una búsqueda en curso, esperando...');
            return;
        }
        
        this.isSearching = true;
        console.log('🔍 PerformSearch iniciado:', query);
        
        try {
            console.log('🌐 Llamando a buscarProductos...');
            this.productosEncontrados = await buscarProductos(query);
            console.log('✅ API respondió:', this.productosEncontrados);
            this.displayResults(this.productosEncontrados, query);
        } catch (error) {
            console.error('❌ Error en performSearch:', error);
            this.displayError();
        } finally {
            this.isSearching = false;
            console.log('🔚 PerformSearch finalizado');
        }
    }

    performFinalSearch() {
        const query = this.searchInput.value.trim();
        if (query.length >= 2) {
            console.log('🎯 Búsqueda final con Enter:', query);
            // Redirigir a la página de productos con el término de búsqueda
            window.location.href = `productos.html?busqueda=${encodeURIComponent(query)}`;
        }
    }

    displayResults(productos, query) {
        if (!this.resultsList) return;

        console.log('🎨 Renderizando resultados con integración de detalles:', productos);

        if (productos.length === 0) {
            this.resultsList.innerHTML = `
                <div class="sin-resultados">
                    <i class="fa-solid fa-search" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>No se encontraron productos para "${query}"</p>
                    <small>Intenta con otros términos de búsqueda</small>
                </div>
            `;
            console.log('📭 No hay resultados para mostrar');
            return;
        }

        this.resultsList.innerHTML = productos.slice(0, 8).map(producto => {
            // ✅ CORRECCIÓN: Manejar imágenes que pueden ser null/undefined/array vacío
            const imagenUrl = producto.imagenes?.[0]?.url || 
                             'https://via.placeholder.com/50?text=Sin+Imagen';
            
            return `
                <div class="resultado-item" data-product-id="${producto.id}">
                    <img src="${imagenUrl}" 
                         alt="${producto.nombre}" 
                         onerror="this.src='https://via.placeholder.com/50?text=Error'">
                    <div class="resultado-info">
                        <div class="resultado-nombre">${producto.nombre}</div>
                        <div class="resultado-precio">$${producto.precio.toLocaleString('es-AR')}</div>
                        <div class="resultado-stock ${producto.stock > 0 ? 'en-stock' : 'sin-stock'}">
                            ${producto.stock > 0 ? '🟢 En stock' : '🔴 Agotado'}
                        </div>
                    </div>
                    <button class="resultado-ver-detalles" data-product-id="${producto.id}">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            `;
        }).join('');

        // Add click listeners to results
        this.resultsList.querySelectorAll('.resultado-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // No hacer nada si se hace click en el botón de ver detalles
                if (!e.target.closest('.resultado-ver-detalles')) {
                    const productId = item.dataset.productId;
                    console.log('🖱️ Click en resultado:', productId);
                    this.navigateToProduct(productId);
                }
            });
        });

        // Add click listeners to "Ver Detalles" buttons
        this.resultsList.querySelectorAll('.resultado-ver-detalles').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = button.dataset.productId;
                console.log('👁️ Click en Ver Detalles desde búsqueda:', productId);
                this.mostrarDetallesDesdeBusqueda(productId);
            });
        });

        console.log('✅ Resultados renderizados con botones de detalles');
    }

    // NUEVO MÉTODO: Mostrar detalles desde la búsqueda
    async mostrarDetallesDesdeBusqueda(productId) {
        console.log('🔍 Mostrando detalles para producto ID desde búsqueda:', productId);
        
        try {
            // Buscar el producto en los resultados de búsqueda
            const producto = this.productosEncontrados.find(p => String(p.id) === String(productId));
            
            if (producto) {
                console.log('✅ Producto encontrado en resultados de búsqueda:', producto.nombre);
                
                // Ocultar resultados de búsqueda
                this.hideResults();
                
                // Limpiar el input de búsqueda
                this.searchInput.value = '';
                
                // Mostrar el modal de detalles
                mostrarDetallesProducto(productId);
            } else {
                console.error('❌ Producto no encontrado en resultados de búsqueda');
                this.mostrarErrorTemporal('Producto no encontrado en los resultados');
            }
        } catch (error) {
            console.error('❌ Error al mostrar detalles desde búsqueda:', error);
            this.mostrarErrorTemporal('Error al cargar los detalles del producto');
        }
    }

    showLoading() {
        if (!this.resultsList) return;
        
        this.resultsList.innerHTML = `
            <div class="buscando">
                <div class="loading-spinner">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                </div>
                <div>Buscando productos...</div>
            </div>
        `;
        this.showResults();
        console.log('⏳ Mostrando estado de carga');
    }

    displayError() {
        if (!this.resultsList) return;
        
        this.resultsList.innerHTML = `
            <div class="sin-resultados">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; color: #ff6b6b;"></i>
                <p>Error al buscar productos</p>
                <small>Intenta nuevamente en unos momentos</small>
            </div>
        `;
        console.log('❌ Mostrando error');
    }

    mostrarErrorTemporal(mensaje) {
        // Crear un toast de error temporal
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = mensaje;
        toast.style.background = '#ff4444';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showResults() {
        if (this.searchInput.value.trim().length >= 2) {
            this.resultsContainer.style.display = 'block';
            console.log('👁️ Mostrando contenedor de resultados');
        }
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
        console.log('🙈 Ocultando contenedor de resultados');
    }

    navigateToProduct(productId) {
        console.log('🧭 Navegar al producto:', productId);
        // Por ahora solo ocultamos los resultados y mostramos detalles
        this.hideResults();
        this.searchInput.value = '';
        mostrarDetallesProducto(productId);
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, inicializando búsqueda con integración de detalles...');
    new BusquedaManager();
});

export default BusquedaManager;