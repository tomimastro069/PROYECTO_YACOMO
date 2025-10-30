// Importar desde el MISMO archivo que usa el index (usa el backend)
import { buscarProductos } from './api/api_busqueda.js';

class BusquedaManager {
    constructor() {
        this.searchInput = document.getElementById('headerSearchInput');
        this.resultsContainer = document.getElementById('headerSearchResults');
        this.resultsList = document.getElementById('headerResultsContainer');
        this.debounceTimer = null;
        this.productosEncontrados = [];

        if (!this.searchInput || !this.resultsContainer || !this.resultsList) {
            console.error('❌ Elementos de búsqueda no encontrados');
            return;
        }

        this.initEvents();
    }

    initEvents() {
        this.searchInput.addEventListener('input', (e) => this.handleInput(e));
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.performFinalSearch();
            if (e.key === 'Escape') this.hideResults();
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim().length >= 2) this.showResults();
        });

        document.addEventListener('click', (e) => {
            if (!this.resultsContainer.contains(e.target) && e.target !== this.searchInput) {
                this.hideResults();
            }
        });

        this.resultsContainer.addEventListener('click', (e) => e.stopPropagation());
    }

    handleInput(e) {
        const query = e.target.value.trim();
        if (query.length < 2) {
            this.hideResults();
            return;
        }

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.performSearch(query), 300);
    }

    async performSearch(query) {
        this.showLoading();
        try {
            const productos = await buscarProductos(query);
            this.productosEncontrados = productos;
            this.displayResults(productos, query);
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            this.displayError();
        }
    }

    performFinalSearch() {
        const query = this.searchInput.value.trim();
        if (query.length >= 2) {
            window.location.href = `productos.html?busqueda=${encodeURIComponent(query)}`;
        }
    }

    displayResults(productos, query) {
        if (!this.resultsList) return;

        if (!productos.length) {
            this.resultsList.innerHTML = `
                <div class="sin-resultados">
                    <p>No se encontraron productos para "${query}"</p>
                </div>
            `;
            this.showResults();
            return;
        }

        const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns=%22http%3A//www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22 viewBox=%220 0 50 50%22%3E%3Crect width=%2250%22 height=%2250%22 fill=%22%23ddd%22/%3E%3C/svg%3E';

        this.resultsList.innerHTML = productos.slice(0, 8).map(p => {
            const imgUrl = (p.imagenes && p.imagenes[0]?.url) ? p.imagenes[0].url : PLACEHOLDER_IMG;
            const stockClass = p.stock > 0 ? 'en-stock' : 'sin-stock';
            const stockText = p.stock > 0 ? '✓ En stock' : '✗ Sin stock';
            
            return `
                <div class="resultado-item" data-id="${p.id}">
                    <img src="${imgUrl}" alt="${p.nombre}" onerror="this.src='${PLACEHOLDER_IMG}'">
                    <div class="resultado-info">
                        <div class="resultado-nombre">${p.nombre}</div>
                        <div class="resultado-precio">$${p.precio.toLocaleString('es-AR')}</div>
                        <div class="resultado-stock ${stockClass}">${stockText}</div>
                    </div>
                    <button class="resultado-ver-detalles" data-id="${p.id}">
                        <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            `;
        }).join('');

        this.showResults();
        this.addResultListeners();
    }

    addResultListeners() {
        this.resultsList.querySelectorAll('.resultado-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.resultado-ver-detalles')) {
                    const id = item.dataset.id;
                    this.navigateToProduct(id);
                }
            });
        });

        this.resultsList.querySelectorAll('.resultado-ver-detalles').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.id;
                this.navigateToProduct(id);
            });
        });
    }

    showLoading() {
        if (!this.resultsList) return;
        this.resultsList.innerHTML = `<div class="buscando">Buscando productos...</div>`;
        this.showResults();
    }

    displayError() {
        if (!this.resultsList) return;
        this.resultsList.innerHTML = `<div class="sin-resultados">Error al buscar productos</div>`;
        this.showResults();
    }

    showResults() {
        if (this.resultsContainer) this.resultsContainer.style.display = 'block';
    }

    hideResults() {
        if (this.resultsContainer) this.resultsContainer.style.display = 'none';
    }

    navigateToProduct(id) {
        window.location.href = `productos.html?producto=${id}`;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => new BusquedaManager());