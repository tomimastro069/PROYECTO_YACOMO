// Función para alternar la visibilidad del modal de login
function toggleLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal.classList.contains('modal-cerrado')) {
        modal.classList.remove('modal-cerrado');
    } else {
        modal.classList.add('modal-cerrado');
    }
}

// Cerrar el modal cuando se hace clic fuera de él
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('loginModal');
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.add('modal-cerrado');
        }
    });
});
