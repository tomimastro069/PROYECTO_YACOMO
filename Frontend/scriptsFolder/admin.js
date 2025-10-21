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

    // --- Lógica existente para la gestión de pestañas ---
    // Seleccionar todos los paneles desplegables <details>
    const detailsPanels = document.querySelectorAll('details');

    // Si no hay paneles, no hay nada más que hacer con las pestañas
    if (detailsPanels.length === 0) {
        return;
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
            }
        }
    });
});