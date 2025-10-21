# Guía de Integración de Mercado Pago en el Frontend

Hola equipo,

Esta carpeta (`mercado-pago-guia`) contiene un ejemplo funcional y autocontenido para integrar el checkout de Mercado Pago con nuestro backend.

## Archivos Incluidos

- `checkout-mp.html`: Una página de ejemplo que simula el checkout y contiene el botón de pago.
- `checkout-mp.js`: El script con toda la lógica para comunicarse con nuestro backend e iniciar el pago. **Este es el archivo clave.**
- `success.html`, `failure.html`, `pending.html`: Páginas estáticas a las que el usuario será redirigido después de intentar el pago.

## ¿Cómo funciona?

El flujo es el siguiente:

1.  **Lógica en `checkout-mp.js`:**

    - Cuando el usuario hace clic en el botón con `id="checkout-btn"`, el script se activa.
    - Se crea un objeto `ventaData` que representa la venta, incluyendo la fecha y una lista de los productos en el carrito.
      **IMPORTANTE:** Los datos de los productos (ID, cantidad, promoción) deben ser dinámicos, tomados del estado del carrito de compras en la aplicación final.
      Ejemplo de estructura esperada por el backend:
      ```json
      {
        "fechaVenta": "YYYY-MM-DD",
        "productos": [{ "idProducto": 1, "cantidad": 2, "idPromocion": null }]
      }
      ```
    - Se realiza una petición `POST` a nuestro endpoint del backend: `/api/payments/create-order`, enviando este objeto `ventaData`.
      El backend calculará el total de la venta a partir de los productos enviados.
    - El backend procesa la petición y responde con una URL de pago (`init_point`).
    - El script recibe esta URL y redirige automáticamente al usuario (`window.location.href = data.init_point;`).

2.  **Redirección desde el Backend:**
    - Una vez que el usuario completa el pago en el sitio de Mercado Pago, nuestro backend ya está configurado para recibir al usuario en las rutas `/success`, `/failure` o `/pending`.
    - Actualmente, el backend redirige a los archivos `success.html`, `failure.html` y `pending.html` que están en esta guía.

## Pasos para la Integración en el Frontend Final

1.  **Botón de Pago:** Asegúrense de que el botón final de "Pagar" en el checkout tenga un `id` único (por ejemplo, `id="checkout-btn"`) para que el JavaScript pueda encontrarlo.

2.  **Adaptar el Script (`checkout-mp.js`):**

    - Copien la lógica de este script a su archivo JavaScript principal o componente de checkout.
    - **Modifiquen la línea `total: 150.00`** para que obtenga el valor real y dinámico del carrito de compras.
    - Pueden adaptar los mensajes de `statusContainer` para que se integren con el sistema de notificaciones o spinners de carga de la aplicación.

3.  **Páginas de Resultado:**
    - Integren el contenido de `success.html`, `failure.html` y `pending.html` en los componentes o páginas correspondientes de la aplicación final (por ejemplo, en rutas como `/checkout/success`). El diseño debe coincidir con el resto de la web.

¡Y eso es todo! La lógica del backend ya está lista para manejar el resto. Si tienen alguna duda, avísenme.
