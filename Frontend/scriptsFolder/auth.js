// c:/Users/windows/Desktop/PROYECTO_YACOMO/Frontend/scriptsFolder/auth.js

import { iniciarSesion, registrarUsuario, cerrarSesion, solicitarRecuperacionPassword } from './api/api_auth.js';
import { toggleLoginModal } from './modalHandler.js'; // Importar desde el nuevo manejador de modales
import { showAlert } from './funciones.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');

    const loginForm = loginModal?.querySelector('.form');
    const signupForm = signupModal?.querySelector('.form.signup');

    const handleLoginButtonClick = (event) => {
        event.preventDefault();
        toggleLoginModal();
    };

    const bindLoginButton = (button) => {
        if (!button || button.dataset.loginHandlerBound === 'true') {
            return;
        }
        button.addEventListener('click', handleLoginButtonClick);
        button.dataset.loginHandlerBound = 'true';
    };

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
                    
                    showAlert({ title: '¡Bienvenido!', message: 'Inicio de sesión exitoso.', type: 'success' });
                    toggleLoginModal(); // Usar la función importada

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
                showAlert({
                    title: 'Error de Autenticación',
                    message: error.message || 'Credenciales incorrectas.',
                    type: 'error'
                });
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
                showAlert({
                    title: '¡Registro Exitoso!',
                    message: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                    type: 'success'
                });
                
                // Cambia al modal de login para que el usuario pueda ingresar
                signupModal.classList.add('modal-cerrado');
                loginModal.classList.remove('modal-cerrado');
                
            } catch (error) {
                showAlert({ title: 'Error en el Registro', message: error.message || 'No se pudo completar el registro.', type: 'error' });
            } finally {
                heading.textContent = originalText;
            }
        });
    }

    // --- Lógica para actualizar la UI al cargar la página ---
    function updateUIForLoggedInUser() {
        const token = localStorage.getItem('jwt_token');
        const loginButton = document.getElementById('btn-login');
        const profileLink = document.getElementById('nav-profile-link');
        const loginListItem = loginButton?.closest('li') || profileLink?.closest('li');
        const navList = loginListItem?.parentElement;
        const existingLogoutItem = document.getElementById('nav-logout-item');

        if (!navList || !loginListItem) {
            return;
        }

        if (existingLogoutItem) {
            existingLogoutItem.remove();
        }

        if (!token) {
            if (loginButton) {
                bindLoginButton(loginButton);
                return;
            }

            if (!loginButton) {
                const restoredButton = document.createElement('button');
                restoredButton.className = 'menu-btn';
                restoredButton.type = 'button';
                restoredButton.id = 'btn-login';
                restoredButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                    </svg>Log in
                `;
                loginListItem.innerHTML = '';
                loginListItem.appendChild(restoredButton);
                bindLoginButton(restoredButton);
            }
            return;
        }

        const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');

        if (userRoles.includes('ROLE_ADMIN')) {
            window.location.href = 'admin.html';
            return;
        }

        loginListItem.innerHTML = `
            <a href="perfil.html" class="menu-btn menu-btn--profile" id="nav-profile-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                </svg> Mi Perfil
            </a>
        `;

        const logoutListItem = document.createElement('li');
        logoutListItem.id = 'nav-logout-item';
        logoutListItem.innerHTML = `
            <button type="button" class="menu-btn menu-btn--logout" id="btn-logout">
                <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesion
            </button>
        `;

        const cartItem = document.getElementById('header-cart-button')?.closest('li');
        const insertionPoint = cartItem?.nextElementSibling;

        if (insertionPoint) {
            navList.insertBefore(logoutListItem, insertionPoint);
        } else {
            navList.appendChild(logoutListItem);
        }

        document.getElementById('btn-logout')?.addEventListener('click', () => {
            cerrarSesion();
            showAlert({ title: 'Sesión Cerrada', message: 'Has cerrado sesión exitosamente.', type: 'info' });
            window.location.href = 'index.html';
        });
    }

    // Handler: ¿Olvidaste tu contraseña?
    const forgotBtn = loginModal?.querySelector('.button3');
    if (forgotBtn) {
        forgotBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                let emailValue = loginForm?.querySelector('input[type="email"]').value?.trim() || '';

                if (!emailValue) {
                    if (window.Swal && typeof window.Swal.fire === 'function') {
                        const { value } = await window.Swal.fire({
                            title: 'Recuperar contraseña',
                            input: 'email',
                            inputLabel: 'Ingresa tu correo',
                            inputPlaceholder: 'tu@correo.com',
                            confirmButtonText: 'Enviar enlace',
                            showCancelButton: true,
                        });
                        if (!value) return;
                        emailValue = String(value).trim();
                    } else {
                        const value = window.prompt('Ingresa tu correo para recuperar tu contraseña:');
                        if (!value) return;
                        emailValue = String(value).trim();
                    }
                }

                if (!emailValue) return;

                await solicitarRecuperacionPassword(emailValue);
                showAlert({
                    title: 'Solicitud enviada',
                    message: 'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.',
                    type: 'success',
                });
            } catch (error) {
                showAlert({
                    title: 'Error',
                    message: error.message || 'No se pudo procesar la solicitud de recuperación.',
                    type: 'error',
                });
            }
        });
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

