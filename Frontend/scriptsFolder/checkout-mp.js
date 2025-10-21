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

        // 3. Definimos los datos de la orden.
        // El backend espera un objeto JSON con la clave "total".
        // ¡IMPORTANTE! Este valor debe obtenerse dinámicamente del carrito de compras real.
        const orderData = {
            total: 150.00 // Ejemplo de un total fijo.
        };

        // 4. Realizamos la petición al backend usando 'fetch'.
        // Esta es la llamada al endpoint que creaste en tu PaymentController.
        fetch('/api/payments/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
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
            // 5. El backend nos devolvió la data con el 'init_point'.
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
            // 6. Si ocurre cualquier error en el proceso (en el fetch o en las promesas), lo mostramos.
            console.error('Error durante el proceso de checkout:', error);
            statusContainer.innerText = "Hubo un problema al procesar tu pago. Por favor, intenta de nuevo.";
            checkoutButton.disabled = false; // Habilitamos el botón nuevamente
        });
    });
});
