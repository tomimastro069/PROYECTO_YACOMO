document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    const indicators = Array.from(indicatorsContainer.children);

    let slideWidth;
    let currentIndex = 0;

    // Function to update the carousel and indicators
    const updateCarousel = () => {
        // Move the carousel to the correct slide
        track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;

        // Update the active indicator
        indicators.forEach(indicator => indicator.classList.remove('active'));
        indicators[currentIndex].classList.add('active');
    };

    // Function to set the slide positions and width
    const setSlidePosition = () => {
        slideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });
        // Recalculate and set the transform to the current slide
        updateCarousel();
    };

    // Initial setup
    setSlidePosition();

    // Recalculate on window resize
    window.addEventListener('resize', setSlidePosition);

    // Botón Siguiente
    nextButton.addEventListener('click', () => {
        if (currentIndex < slides.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Botón Anterior
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });
});