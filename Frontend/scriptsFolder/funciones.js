// funciones.js (o alert.js)
//import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js';

// Array para almacenar los productos del carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
// Keep the previous count to trigger a small "pop" animation when the count changes
let previousCartCount = getCartProductCount(); // Inicializar con el conteo actual

// FunciÃ³n para renderizar el carrito en el DOM
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
            <button class="ts-qty__btn decrease" aria-label="Restar">-</button>
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

    // Sumar al subtotal (convertir el precio a nÃºmero, quitando el sÃ­mbolo y el separador de miles)
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
  if (totalPriceStrong) totalPriceStrong.textContent = `$${subtotal.toLocaleString('es-AR')}`; // Asumiendo que el envÃ­o es gratis o ya incluido

  updateCartCount(); // Actualizar el badge del carrito en el header/nav
}

// FunciÃ³n para agregar un producto al carrito
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
  const marca = productData.categoria || ''; // Asumiendo que la categorÃ­a puede actuar como marca

  // Verificar si el producto ya estÃ¡ en el carrito
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

// La inicializaciÃ³n del carrito y el contador se harÃ¡ en el script de productos.html
// o en el script principal de la pÃ¡gina donde se use el carrito.

export function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
}

// --- LÃ³gica para eliminar/ajustar cantidad de productos en el carrito ---

// LÃ³gica para interactuar con el carrito (cerrar, eliminar, ajustar cantidad)
document.addEventListener('DOMContentLoaded', function() {
  const cart = document.getElementById('cart');
  if (!cart) return;

  // 1. LÃ³gica para cerrar el carrito
  const closeButton = cart.querySelector('.ts-x');
  const overlay = cart.querySelector('.ts-cart__overlay');

  const closeCart = (e) => {
    e.preventDefault();
    toggleCart();
  };

  if (closeButton) closeButton.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  // 2. DelegaciÃ³n de eventos para acciones dentro del carrito (eliminar, cantidad)
  const cartBody = cart.querySelector('.ts-cart__body');
  if (cartBody) {
    cartBody.addEventListener('click', function(e) {
  const removeBtn = e.target.closest('.ts-remove');
  const incBtn = e.target.closest('.ts-qty__btn.increase');
  const decBtn = e.target.closest('.ts-qty__btn.decrease');

  if (!removeBtn && !incBtn && !decBtn) return;

  const item = e.target.closest('.ts-item');
  if (!item) return;

  const itemId = item.dataset.id;
  const productoIndex = carrito.findIndex(p => String(p.id) === String(itemId));
  if (productoIndex === -1) return;

  if (removeBtn) {
    carrito.splice(productoIndex, 1);
  } else if (incBtn) {
    carrito[productoIndex].cantidad = (carrito[productoIndex].cantidad || 1) + 1;
  } else if (decBtn) {
    if ((carrito[productoIndex].cantidad || 1) > 1) {
      carrito[productoIndex].cantidad--;
    } else {
      carrito.splice(productoIndex, 1);
    }
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderizarCarrito();
});
  }

  // 3. LÃ³gica para el botÃ³n "Pagar Ahora"
  const payButton = cart.querySelector('.ts-pay');
  if (payButton) {
    payButton.addEventListener('click', (e) => {
      e.preventDefault();

      // Primero, importamos la función showAlert dinámicamente
      if (!localStorage.getItem('jwt_token')) {
        showAlert({
          title: 'Acceso Requerido',
          message: 'Debes iniciar sesión para poder pagar.',
          type: 'warning'
        });
        return;
      }

      const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
      if (carritoActual.length === 0) {
        showAlert({
          title: 'Carrito Vacío',
          message: 'Tu carrito está vacío. Agrega productos antes de continuar.',
          type: 'info'
        });0
        return;
      }
      window.location.href = 'checkout-pago.html';
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
// La lÃ³gica de los modales de login/registro se ha movido a scriptsFolder/modalHandler.js

export function showAlert({ title, message, type }) {
  try {
    if (typeof window !== 'undefined' && window.Swal && typeof window.Swal.fire === 'function') {
      window.Swal.fire({
        title,
        text: message,
        icon: type || 'info',
        confirmButtonText: 'OK',
        background: '#202020',
        color: '#fff',
        // ============================>
        // Esto hace que el modal quede arriba de todo
        customClass: {
          container: 'swal-container-top' // clase que vamos a definir en CSS
        },
        // ============================>
        allowOutsideClick: false, // opcional: evita cerrar al click afuera
      });
      return;
    }

    const fallbackText = [title, message].filter(Boolean).join('\n');
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(fallbackText);
    } else if (typeof alert === 'function') {
      alert(fallbackText);
    }
  } catch (e) {
    try {
      const txt = [title, message].filter(Boolean).join('\n');
      alert(txt);
    } catch {}
  }
}
