class Carousel {
    constructor(options = {}) {
        // Configuración predeterminada
        this.config = {
            autoplay: options.autoplay || true,
            interval: options.interval || 5000,
            loop: options.loop || true,
            transition: options.transition || 500,
            swipeThreshold: options.swipeThreshold || 50
        };

        // Elementos del DOM
        this.track = document.querySelector('.carousel-track');
        this.slides = Array.from(this.track.children);
        this.nextButton = document.querySelector('.carousel-button.next');
        this.prevButton = document.querySelector('.carousel-button.prev');
        this.indicatorsContainer = document.querySelector('.carousel-indicators');
        this.indicators = Array.from(this.indicatorsContainer.children);

        // Estado del carrusel
        this.currentIndex = 0;
        this.slideWidth = 0;
        this.autoplayInterval = null;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;

        // Inicialización
        this.init();
    }

    init() {
        // Configurar evento de redimensionamiento
        this.setSlidePosition();
        window.addEventListener('resize', () => this.setSlidePosition());

        // Configurar controles
        this.setupControls();

        // Configurar interacción táctil
        this.setupTouchEvents();

        // Iniciar autoplay si está habilitado
        if (this.config.autoplay) {
            this.startAutoplay();
            this.setupAutoplayPause();
        }

        // Añadir transición suave
        this.track.style.transition = `transform ${this.config.transition}ms ease`;
    }

    setSlidePosition() {
        // Calcular y establecer el ancho y posición de cada slide
        this.slideWidth = this.slides[0].getBoundingClientRect().width;
        this.slides.forEach((slide, index) => {
            slide.style.left = this.slideWidth * index + 'px';
        });
        this.updateCarousel();
    }

    updateCarousel(animate = true) {
        if (!animate) {
            this.track.style.transition = 'none';
        }

        // Mover el carrusel
        this.track.style.transform = `translateX(-${this.slideWidth * this.currentIndex}px)`;

        // Actualizar indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
            // Añadir información de accesibilidad
            indicator.setAttribute('aria-current', index === this.currentIndex);
            indicator.setAttribute('aria-label', `Slide ${index + 1} of ${this.slides.length}`);
        });

        if (!animate) {
            // Forzar un reflow
            this.track.offsetHeight;
            this.track.style.transition = `transform ${this.config.transition}ms ease`;
        }

        // Actualizar estado de los botones
        this.updateButtonStates();
    }

    updateButtonStates() {
        if (!this.config.loop) {
            this.prevButton.disabled = this.currentIndex === 0;
            this.nextButton.disabled = this.currentIndex === this.slides.length - 1;
        }
    }

    setupControls() {
        // Botón siguiente
        this.nextButton.addEventListener('click', () => this.next());

        // Botón anterior
        this.prevButton.addEventListener('click', () => this.prev());

        // Indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Teclas de navegación
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }

    setupTouchEvents() {
        this.track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.pauseAutoplay();
        }, { passive: true });

        this.track.addEventListener('touchmove', (e) => {
            if (this.isTransitioning) return;
            
            this.touchEndX = e.touches[0].clientX;
            const diff = this.touchStartX - this.touchEndX;
            
            // Mover el carrusel con el dedo
            this.track.style.transform = `translateX(-${(this.slideWidth * this.currentIndex) + diff}px)`;
        }, { passive: true });

        this.track.addEventListener('touchend', () => {
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) > this.config.swipeThreshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            } else {
                // Volver a la posición original si el swipe no fue suficiente
                this.updateCarousel();
            }

            this.resumeAutoplay();
        });
    }

    setupAutoplayPause() {
        // Pausar en hover
        this.track.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.track.addEventListener('mouseleave', () => this.resumeAutoplay());
        
        // Pausar cuando la página no está visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.resumeAutoplay();
            }
        });
    }

    next() {
        if (this.isTransitioning) return;

        if (this.currentIndex < this.slides.length - 1) {
            this.currentIndex++;
        } else if (this.config.loop) {
            this.currentIndex = 0;
        }

        this.updateCarousel();
    }

    prev() {
        if (this.isTransitioning) return;

        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else if (this.config.loop) {
            this.currentIndex = this.slides.length - 1;
        }

        this.updateCarousel();
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        this.currentIndex = index;
        this.updateCarousel();
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => this.next(), this.config.interval);
    }

    pauseAutoplay() {
        clearInterval(this.autoplayInterval);
    }

    resumeAutoplay() {
        if (this.config.autoplay) {
            this.startAutoplay();
        }
    }
}

// Inicializar el carrusel cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear una nueva instancia del carrusel con opciones personalizadas
    const carousel = new Carousel({
        autoplay: true,
        interval: 5000,
        loop: true,
        transition: 500,
        swipeThreshold: 50
    });
});