// Espera a que el contenido de la página esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {

    // 1. Seleccionamos el botón de pago por su ID
    const checkoutButton = document.getElementById("checkout-btn");

    // 2. Añadimos un "escuchador" para el evento 'click'
    checkoutButton.addEventListener("click", () => {

        // Mostramos un mensaje de carga al usuario para mejorar la experiencia
        const statusContainer = document.getElementById("status-container");
        statusContainer.innerText = "Preparando tu pago, por favor espera...";
        checkoutButton.disabled = true; // Deshabilitamos el botón para evitar múltiples clics

        // 3. Obtener el token de autenticación y los productos del carrito desde localStorage
        const token = localStorage.getItem('jwtToken');
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        // Verificación de seguridad: el usuario debe estar logueado y tener productos en el carrito.
        if (!token) {
            statusContainer.innerText = "Error: No has iniciado sesión. Por favor, inicia sesión para continuar.";
            checkoutButton.disabled = false;
            return;
        }

        if (carrito.length === 0) {
            statusContainer.innerText = "Tu carrito está vacío. Añade productos antes de pagar.";
            checkoutButton.disabled = false;
            return;
        }

        // 4. Mapeamos los productos del carrito al formato que espera el backend (VentaDTO)
        const productosParaVenta = carrito.map(item => ({
            idProducto: item.id, // Asegúrate de que el 'id' en el carrito sea el ID numérico del producto
            cantidad: item.cantidad,
            idPromocion: null // O el ID de la promoción si aplica
        }));

        const ventaData = {
            fechaVenta: new Date().toISOString(), // Fecha actual en formato ISO
            productos: productosParaVenta
        };

        // 5. Realizamos la petición al backend usando 'fetch'.
        fetch('http://localhost:8080/api/payments/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ¡Añadimos el token aquí!
            },
            body: JSON.stringify(ventaData)
        })
        .then(response => {
            // Verificamos si la respuesta del servidor fue exitosa (código 2xx)
            if (!response.ok) {
                // Si no fue exitosa, lanzamos un error para ser capturado por el .catch()
                throw new Error('Error al crear la preferencia de pago. El servidor respondió con un error.');
            }
            // Convertimos la respuesta del backend (que es un JSON) a un objeto JavaScript
            return response.json();
        })
        .then(data => {
            // 6. El backend nos devolvió la data con el 'init_point'.
            // Verificamos que la URL de pago ('init_point') exista.
            if (data.init_point) {
                // ¡Esta es la magia! Redirigimos al usuario a la página de Mercado Pago.
                console.log("Redirigiendo a Mercado Pago:", data.init_point);
                window.location.href = data.init_point;
            } else {
                // Si por alguna razón no recibimos el init_point, mostramos un error.
                throw new Error('No se recibió la URL de pago (init_point).');
            }
        })
        .catch(error => {
            // 7. Si ocurre cualquier error en el proceso, lo mostramos.
            console.error('Error durante el proceso de checkout:', error);
            statusContainer.innerText = "Hubo un problema al procesar tu pago. Por favor, intenta de nuevo.";
            checkoutButton.disabled = false; // Habilitamos el botón nuevamente
        });
    });
});
