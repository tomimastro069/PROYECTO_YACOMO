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