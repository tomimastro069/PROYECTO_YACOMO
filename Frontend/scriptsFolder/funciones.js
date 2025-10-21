// Array para almacenar los productos del carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
// Keep the previous count to trigger a small "pop" animation when the count changes
let previousCartCount = 0;

// Función para renderizar el carrito en el DOM
function renderizarCarrito() {
  const carritoBody = document.querySelector('.ts-cart__body');
  if (!carritoBody) return;
  carritoBody.innerHTML = '';
  let totalCantidad = 0;
  carrito.forEach(producto => {
    totalCantidad += producto.cantidad || 1;
    const item = document.createElement('article');
    item.className = 'ts-item';
    // expose the product id on the DOM element so delete/qty handlers can find it reliably
    item.dataset.id = producto.id;
    item.innerHTML = `
      <img class="ts-item__img" src="${producto.imagen}" alt="${producto.titulo}">
      <div class="ts-item__main">
        <div class="ts-item__title">${producto.titulo}</div>
        <div class="ts-item__brand">${producto.marca || ''}</div>
        <div class="ts-item__row">
          <strong class="ts-price">${producto.precio}</strong>
          <div class="ts-qty">
            <button class="ts-qty__btn" aria-label="Restar">−</button>
            <span class="ts-qty__num">${producto.cantidad || 1}</span>
            <button class="ts-qty__btn" aria-label="Sumar">+</button>
          </div>
        </div>
      </div>
      <button class="ts-remove" aria-label="Eliminar">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;
    carritoBody.appendChild(item);
  });
  // Actualizar el mensaje de cantidad en la parte superior
  const countMsg = document.querySelector('.ts-cart__count');
  if (countMsg) {
    countMsg.textContent = `${totalCantidad} producto${totalCantidad === 1 ? '' : 's'}`;
  }
  // Update the small cart badge in the header/nav when the cart is re-rendered
  updateCartCount();
}

// Función para agregar un producto al carrito

function agregarAlCarrito(event) {
  const boton = event.target.closest('.btn-cart');
  if (boton) {
    boton.classList.remove('btn-animate');
    void boton.offsetWidth;
    boton.classList.add('btn-animate');
  }
  const card = event.target.closest('.card, .card_producto');
  if (!card) return;
  const titulo = card.querySelector('.Titulo')?.textContent || card.querySelector('.ts-item__title')?.textContent;
  const precio = card.querySelector('.Precio')?.textContent || card.querySelector('.ts-price')?.textContent;
  const imagen = card.querySelector('.Imagen_Producto, .ts-item__img')?.src;
  const marca = card.querySelector('.content h3')?.textContent || '';
  // Build a stable id for the product. Prefer a normalized title when available
  const rawTitulo = (titulo || '').trim();
  const rawImagen = imagen || '';
  let id;
  if (rawTitulo) {
    // normalize title to a slug-like string
    id = rawTitulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  } else if (rawImagen) {
    // fallback to image filename
    try {
      id = rawImagen.split('/').pop();
    } catch (e) {
      id = String(Date.now());
    }
  } else {
    id = String(Date.now());
  }

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

// Delegación de eventos para agregar al carrito
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.btn-cart').forEach(boton => {
    boton.addEventListener('click', agregarAlCarrito);
  });
  renderizarCarrito();
  // Ensure badge reflects current storage on page load
  updateCartCount();
  // ...existing code...
});

function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
}

// Lógica para eliminar productos del carrito
document.addEventListener('DOMContentLoaded', function() {
  // Delegación de eventos para el botón eliminar en el carrito
  const cartBody = document.querySelector('.ts-cart__body');
  if (cartBody) {
    cartBody.addEventListener('click', function(e) {
      if (e.target.closest('.ts-remove')) {
        const item = e.target.closest('.ts-item');
        if (item) {
          // Use the data-id set on the rendered cart item to identify the product
          const itemId = item.dataset.id;
          const index = carrito.findIndex(p => p.id === itemId);
          if (index !== -1) {
            carrito.splice(index, 1);
            localStorage.setItem('carrito', JSON.stringify(carrito));
          }
          // Actualizar la vista y el contador en tiempo real
          renderizarCarrito();
        }
      }
    });
  }
});
function updateCartCount() {
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

// Helper: reads the cart (from memory or localStorage) and sums quantities
function getCartProductCount() {
  try {
    // prefer live `carrito` array if available
    const source = Array.isArray(carrito) ? carrito : JSON.parse(localStorage.getItem('carrito')) || [];
    return source.reduce((sum, p) => sum + (Number(p.cantidad) || 1), 0);
  } catch (e) {
    return 0;
  }
}
// Función global para alternar la visibilidad del modal de login
function toggleLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.toggle('modal-cerrado');
    }
}

// Inicialización del modal de login
document.addEventListener('DOMContentLoaded', () => {
    const botonLogin = document.getElementById('btn-login');
    const modal = document.getElementById('loginModal');
    const botonCerrar = modal?.querySelector('.cerrar-modal');

    // Asignar evento click al botón de login
    if (botonLogin) {
        botonLogin.addEventListener('click', (e) => {
            e.preventDefault();
            toggleLoginModal();
        });
    }

    // Asignar evento click al botón de cerrar
    if (botonCerrar) {
        botonCerrar.addEventListener('click', toggleLoginModal);
    }

    // Cerrar modal al hacer click fuera de él
    if (modal) {
        modal.addEventListener('click', (evento) => {
            if (evento.target === modal) {
                modal.classList.add('modal-cerrado');
            }
        });
    }
});