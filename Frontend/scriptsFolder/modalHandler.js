// c:/Users/windows/Desktop/PROYECTO_YACOMO/Frontend/scriptsFolder/modalHandler.js

// Función global para alternar la visibilidad del modal de login
export function toggleLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.toggle('modal-cerrado');
    }
}

// Inicialización de los modales de login y registro
document.addEventListener('DOMContentLoaded', () => {
    // Login Modal
    const botonLogin = document.getElementById('btn-login');
    const loginModal = document.getElementById('loginModal');
    const botonCerrarLogin = loginModal?.querySelector('.cerrar-modal');

    // Signup Modal
    const signupModal = document.getElementById('signupModal');
    // Nota: btnSignup está dentro de loginModal, por lo que debe ser consultado desde allí
    const btnSignup = loginModal?.querySelector('.button2');
    const botonCerrarSignup = signupModal?.querySelector('.cerrar-modal');
    const switchToLogin = signupModal?.querySelector('#switchToLogin');

    // Eventos del Modal de Login
    if (botonLogin) {
        botonLogin.addEventListener('click', (e) => {
            e.preventDefault();
            toggleLoginModal();
        });
    }

    if (botonCerrarLogin) {
        botonCerrarLogin.addEventListener('click', toggleLoginModal);
    }

    if (loginModal) {
        loginModal.addEventListener('click', (evento) => {
            if (evento.target === loginModal) {
                loginModal.classList.add('modal-cerrado');
            }
        });
    }

    // Eventos del Modal de Registro
    if (btnSignup) {
        btnSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModal) loginModal.classList.add('modal-cerrado');
            if (signupModal) signupModal.classList.remove('modal-cerrado');
        });
    }

    if (botonCerrarSignup) {
        botonCerrarSignup.addEventListener('click', () => {
            if (signupModal) signupModal.classList.add('modal-cerrado');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (signupModal) signupModal.classList.add('modal-cerrado');
            if (loginModal) loginModal.classList.remove('modal-cerrado');
        });
    }

    if (signupModal) {
        signupModal.addEventListener('click', (e) => {
            if (e.target === signupModal) {
                signupModal.classList.add('modal-cerrado');
            }
        });
    }
});