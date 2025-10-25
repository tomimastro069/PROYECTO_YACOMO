// c:/Users/windows/Desktop/PROYECTO_YACOMO/Frontend/scriptsFolder/auth.js

import { iniciarSesion, registrarUsuario, cerrarSesion } from './api/api_auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');

    const loginForm = loginModal?.querySelector('.form');
    const signupForm = signupModal?.querySelector('.form.signup');

    // --- Lógica de Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            const heading = loginForm.querySelector('#heading');
            const originalText = heading.textContent;

            try {
                heading.textContent = 'Iniciando sesión...';
                const data = await iniciarSesion({ email, password });

                if (data.token && data.roles) {
                    localStorage.setItem('jwt_token', data.token);
                    localStorage.setItem('user_roles', JSON.stringify(data.roles));
                    
                    alert('¡Inicio de sesión exitoso!');
                    toggleLoginModal(); // Cierra el modal de login

                    const userRoles = data.roles;
                    if (userRoles.includes('ROLE_ADMIN')) {
                        // Si es administrador, redirigir a la página de administración
                        window.location.href = 'admin.html'; // admin.html está en la misma carpeta que index.html/productos.html
                    } else {
                        // Si no es administrador, actualizar la UI normal (Mi Perfil, Cerrar Sesión)
                        updateUIForLoggedInUser();
                    }
                } else {
                    throw new Error('Respuesta inesperada del servidor.');
                }

            } catch (error) {
                console.error('Error en el login:', error);
                alert(`Error al iniciar sesión: ${error.message || 'Credenciales incorrectas.'}`);
                heading.textContent = originalText;
            }
        });
    }

    // --- Lógica de Registro ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = signupForm.querySelector('input[placeholder="Nombre"]').value;
            const apellido = signupForm.querySelector('input[placeholder="Apellido"]').value;
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelector('input[type="password"]').value;
            const heading = signupForm.querySelector('#heading');
            const originalText = heading.textContent;

            const userData = { nombre, apellido, email, password };

            try {
                heading.textContent = 'Registrando...';
                await registrarUsuario(userData);
                alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
                
                // Cambia al modal de login para que el usuario pueda ingresar
                signupModal.classList.add('modal-cerrado');
                loginModal.classList.remove('modal-cerrado');
                
            } catch (error) {
                console.error('Error en el registro:', error);
                alert(`Error en el registro: ${error.message || 'No se pudo completar el registro.'}`);
            } finally {
                heading.textContent = originalText;
            }
        });
    }

    // --- Lógica para actualizar la UI al cargar la página ---
    function updateUIForLoggedInUser() {
        const token = localStorage.getItem('jwt_token');
        const loginButtonContainer = document.getElementById('btn-login')?.parentElement;

        if (token && loginButtonContainer) {
            const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');

            // Si el usuario es administrador y está logueado, redirigirlo inmediatamente a admin.html
            if (userRoles.includes('ROLE_ADMIN')) {
                window.location.href = 'admin.html'; // Redirige a la página de administración
                return; // Detiene la ejecución para evitar actualizar la UI de usuario normal
            }

            // Si hay token, reemplazamos el botón de login
            loginButtonContainer.innerHTML = `
                <a href="perfil.html" class="menu-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                    </svg> Mi Perfil
                </a>
                <button class="menu-btn" id="btn-logout" style="background: transparent; border: none; color: inherit; font: inherit; cursor: pointer;">
                    <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                </button>
            `;

            // Añadimos el evento al nuevo botón de logout
            document.getElementById('btn-logout').addEventListener('click', () => {
                cerrarSesion();
                alert('Has cerrado sesión.');
                window.location.href = 'index.html'; // Redirigimos al inicio
            });
        }
    }

    // Ejecutar al cargar la página para verificar si ya hay una sesión activa
    updateUIForLoggedInUser();
});

// Necesitamos que esta función sea global para que otros scripts (como perfil.js) puedan usarla.
// La definimos fuera del 'DOMContentLoaded' si no existe ya.
if (typeof window.toggleLoginModal === 'undefined') {
    window.toggleLoginModal = function() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.toggle('modal-cerrado');
        }
    }
}