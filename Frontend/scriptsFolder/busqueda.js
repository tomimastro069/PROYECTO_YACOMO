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

        this.resultsList.innerHTML = productos.slice(0, 8).map(p => `
            <div class="resultado-item" data-id="${p.id}">
                <div class="resultado-nombre">${p.nombre}</div>
                <div class="resultado-precio">$${p.precio.toLocaleString('es-AR')}</div>
                <button class="resultado-ver-detalles" data-id="${p.id}">Ver detalles</button>
            </div>
        `).join('');

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
                this.mostrarDetalles(id);
            });
        });
    }

    mostrarDetalles(productId) {
        this.hideResults();
        this.searchInput.value = '';
        mostrarDetallesProducto(productId);
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
        // Redirige directamente a la página de detalles
        window.location.href = `detalles.html?id=${id}`;
    }

}

// Inicialización
document.addEventListener('DOMContentLoaded', () => new BusquedaManager());
