import { crearPreferencia } from './api/api_mercadopago.js';

// Array para almacenar los productos del carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
// Keep the previous count to trigger a small "pop" animation when the count changes
let previousCartCount = getCartProductCount(); // Inicializar con el conteo actual

// Función para renderizar el carrito en el DOM
export function renderizarCarrito() {
  const carritoBody = document.querySelector('.ts-cart__body');
  if (!carritoBody) return;
  carritoBody.innerHTML = '';
  let totalCantidad = 0;
  let subtotal = 0; // Para calcular el subtotal
  carrito.forEach(producto => {
    totalCantidad += producto.cantidad || 1;
    const item = document.createElement('article');
    item.className = 'ts-item';
    // expose the product id on the DOM element so delete/qty handlers can find it reliably
    item.dataset.id = producto.id;
    item.innerHTML = `
      <img class="ts-item__img" src="${producto.imagen || 'https://via.placeholder.com/100'}" alt="${producto.titulo}">
      <div class="ts-item__main">
        <div class="ts-item__title">${producto.titulo}</div>
        <div class="ts-item__brand">${producto.marca || ''}</div>
        <div class="ts-item__row">
          <strong class="ts-price">${producto.precio}</strong> <!-- Precio ya formateado -->
          <div class="ts-qty">
            <button class="ts-qty__btn decrease" aria-label="Restar">−</button>
            <span class="ts-qty__num">${producto.cantidad || 1}</span>
            <button class="ts-qty__btn increase" aria-label="Sumar">+</button>
          </div>
        </div>
      </div>
      <button class="ts-remove" aria-label="Eliminar">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;
    carritoBody.appendChild(item);

    // Sumar al subtotal (convertir el precio a número, quitando el símbolo y el separador de miles)
    const precioNumerico = parseFloat(producto.precio.replace(/[^0-9,-]+/g, "").replace(",", "."));
    subtotal += precioNumerico * (producto.cantidad || 1);
  });

  // Actualizar el mensaje de cantidad en la parte superior
  const countMsg = document.querySelector('.ts-cart__count');
  if (countMsg) {
    countMsg.textContent = `${totalCantidad} producto${totalCantidad === 1 ? '' : 's'}`;
  }

  // Actualizar el subtotal y el total en el footer
  const subtotalSpan = document.querySelector('.ts-summary__row span:first-child');
  const subtotalStrong = document.querySelector('.ts-summary__row strong');
  const totalPriceStrong = document.querySelector('.ts-total-price');

  if (subtotalSpan) subtotalSpan.textContent = `Subtotal (${totalCantidad} item${totalCantidad === 1 ? '' : 's'})`;
  if (subtotalStrong) subtotalStrong.textContent = `$${subtotal.toLocaleString('es-AR')}`;
  if (totalPriceStrong) totalPriceStrong.textContent = `$${subtotal.toLocaleString('es-AR')}`; // Asumiendo que el envío es gratis o ya incluido

  updateCartCount(); // Actualizar el badge del carrito en el header/nav
}

// Función para agregar un producto al carrito
export function agregarAlCarrito(event, productData) { // Ahora recibe el objeto productData
  const boton = event.target.closest('.btn-cart');
  if (boton) {
    boton.classList.remove('btn-animate');
    void boton.offsetWidth;
    boton.classList.add('btn-animate');
  }

  // Usar los datos del objeto productData directamente
  const id = productData.id;
  const titulo = productData.nombre;
  const precio = `$${productData.precio.toLocaleString('es-AR')}`; // Formatear el precio para mostrar
  const imagen = productData.imagenes?.[0]?.url || 'https://via.placeholder.com/200'; // Usar la primera imagen o un placeholder
  const marca = productData.categoria || ''; // Asumiendo que la categoría puede actuar como marca

  // Verificar si el producto ya está en el carrito
  let producto = carrito.find(item => item.id === id);
  if (producto) {
    producto.cantidad = (producto.cantidad || 1) + 1;
  } else {
    producto = { id, titulo, precio, imagen, marca, cantidad: 1 };
    carrito.push(producto);
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderizarCarrito();
}

// La inicialización del carrito y el contador se hará en el script de productos.html
// o en el script principal de la página donde se use el carrito.

export function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
}

// --- Lógica para eliminar/ajustar cantidad de productos en el carrito ---

// Lógica para interactuar con el carrito (cerrar, eliminar, ajustar cantidad)
document.addEventListener('DOMContentLoaded', function() {
  const cart = document.getElementById('cart');
  if (!cart) return;

  // 1. Lógica para cerrar el carrito
  const closeButton = cart.querySelector('.ts-x');
  const overlay = cart.querySelector('.ts-cart__overlay');

  const closeCart = (e) => {
    e.preventDefault();
    toggleCart();
  };

  if (closeButton) closeButton.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  // 2. Delegación de eventos para acciones dentro del carrito (eliminar, cantidad)
  const cartBody = cart.querySelector('.ts-cart__body');
  if (cartBody) {
    cartBody.addEventListener('click', function(e) {
      if (e.target.closest('.ts-remove')) {
        const item = e.target.closest('.ts-item');
        if (item) {
          // Use the data-id set on the rendered cart item to identify the product
          const itemId = item.dataset.id; // Asegúrate de que el ID sea una cadena si lo comparas con cadenas
          let productoIndex = carrito.findIndex(p => String(p.id) === itemId);

          if (e.target.closest('.ts-remove')) {
            if (productoIndex !== -1) {
              carrito.splice(productoIndex, 1);
              localStorage.setItem('carrito', JSON.stringify(carrito));
              renderizarCarrito();
            }
          } else if (e.target.closest('.ts-qty__btn.increase')) {
            if (productoIndex !== -1) {
              carrito[productoIndex].cantidad = (carrito[productoIndex].cantidad || 1) + 1;
              localStorage.setItem('carrito', JSON.stringify(carrito));
              renderizarCarrito();
            }
          } else if (e.target.closest('.ts-qty__btn.decrease')) {
            if (productoIndex !== -1) {
              if (carrito[productoIndex].cantidad > 1) {
                carrito[productoIndex].cantidad--;
              } else {
                // Si la cantidad es 1 y se presiona decrementar, eliminar el producto
                carrito.splice(productoIndex, 1);
              }
              localStorage.setItem('carrito', JSON.stringify(carrito));
              renderizarCarrito();
            }
          }
        }
      }
    });
  }

  // 3. Lógica para el botón "Pagar Ahora"
  const payButton = cart.querySelector('.ts-pay');
  if (payButton) {
    payButton.addEventListener('click', async (e) => {
      e.preventDefault(); // Prevenir la navegación del enlace

      // Mostrar feedback al usuario
      payButton.textContent = 'Procesando...';
      payButton.style.pointerEvents = 'none'; // Deshabilitar clics repetidos

      const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];

      // Validar que el usuario esté logueado y el carrito no esté vacío
      if (!localStorage.getItem('jwt_token')) {
        alert('Debes iniciar sesión para poder pagar.');
        payButton.textContent = 'Pagar Ahora';
        payButton.style.pointerEvents = 'auto';
        return;
      }

      if (carritoActual.length === 0) {
        alert('Tu carrito está vacío.');
        payButton.textContent = 'Pagar Ahora';
        payButton.style.pointerEvents = 'auto';
        return;
      }

      // Mapear los productos al formato que espera el backend
      const datosOrden = {
        productos: carritoActual.map(item => ({
          idProducto: item.id,
          cantidad: item.cantidad
        }))
      };

      try {
        const respuesta = await crearPreferencia(datosOrden);
        if (respuesta && respuesta.init_point) {
          window.location.href = respuesta.init_point; // Redirigir a Mercado Pago
        }
      } catch (error) {
        alert(`Error al iniciar el pago: ${error.message}`);
        payButton.textContent = 'Pagar Ahora';
        payButton.style.pointerEvents = 'auto';
      }
    });
  }
});

export function updateCartCount() {
  // Compute current total of items in the cart
  const count = getCartProductCount();
  // Format the display: cap at 9+
  const display = count > 9 ? '9+' : String(count);

  // Update all badges on the page (in case other pages or multiple places include a badge)
  const badges = document.querySelectorAll('.cart-notification');
  if (!badges || badges.length === 0) return;

  badges.forEach(el => {
    const previousDisplay = el.textContent || '';
    el.textContent = display;

    if (count > 0) el.classList.add('visible'); else el.classList.remove('visible');

    if (previousDisplay !== display) {
      el.classList.add('pop');
      clearTimeout(el._popTimeout);
      el._popTimeout = setTimeout(() => el.classList.remove('pop'), 220);
    }
  });

  // store the last known count
  previousCartCount = count;
}

export function getCartProductCount() {
  try {
    // prefer live `carrito` array if available
    const source = Array.isArray(carrito) ? carrito : JSON.parse(localStorage.getItem('carrito')) || [];
    return source.reduce((sum, p) => sum + (Number(p.cantidad) || 1), 0);
  } catch (e) {
    return 0;
  }
}
// La lógica de los modales de login/registro se ha movido a scriptsFolder/modalHandler.js