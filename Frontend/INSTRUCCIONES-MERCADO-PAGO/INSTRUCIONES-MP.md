# Guía de Funcionamiento de Mercado Pago en el Frontend

Este documento describe el flujo de pago con Mercado Pago tal como está implementado en la aplicación. La integración ya no se basa en un script de ejemplo, sino que está completamente integrada en la lógica del carrito de compras.

## ¿Cómo funciona el flujo de pago?

El flujo es el siguiente:

1.  **Interacción del Usuario:**
    - El usuario hace clic en el botón "Pagar Ahora" (clase `.ts-pay`) que se encuentra en el pie del panel del carrito de compras (definido en `productos.html` y otros archivos).

2.  **Lógica en `scriptsFolder/funciones.js`:**
    - Un `event listener` captura el clic en el botón "Pagar Ahora".
    - **Validación:** El script verifica dos condiciones cruciales:
        1.  Que el usuario haya iniciado sesión (buscando `jwt_token` en `localStorage`).
        2.  Que el carrito de compras no esté vacío.
    - **Preparación de Datos:** Se leen los productos del carrito desde `localStorage` y se transforman al formato que espera el backend. La estructura enviada es:
        ```json
        {
          "productos": [{ "idProducto": 1, "cantidad": 2 }]
        }
        ```
    - **Llamada a la API:** En lugar de usar `fetch` directamente, el script invoca a la función `crearPreferencia` del módulo `scriptsFolder/api/api_mercadopago.js`.

3.  **Módulo `api_mercadopago.js`:**
    - La función `crearPreferencia` encapsula la llamada al backend.
    - Utiliza nuestro cliente de API centralizado (`llamarApi`), que se encarga automáticamente de:
        - Construir la URL completa del endpoint (`/api/payments/create-order`).
        - Configurar el método `POST`.
        - Adjuntar el token de autenticación (`Authorization: Bearer ...`) a la cabecera.
    - El backend procesa la petición, registra la venta como "PENDIENTE" y responde con una URL de pago (`init_point`).

4.  **Redirección a Mercado Pago:**
    - De vuelta en `funciones.js`, el script recibe la respuesta del backend.
    - Si la respuesta contiene la propiedad `init_point`, se redirige al usuario a la pasarela de pago de Mercado Pago usando `window.location.href`.

5.  **Páginas de Resultado:**
    - Una vez que el usuario completa o cancela el pago, Mercado Pago lo redirige a las URLs configuradas en el backend (`frontend.url.success`, `frontend.url.failure`, etc.), que apuntan a las páginas correspondientes en nuestro frontend.

¡Y eso es todo! La lógica está centralizada, es reutilizable y sigue las mejores prácticas que hemos establecido para el proyecto.
