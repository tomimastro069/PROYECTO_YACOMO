// Array para almacenar los productos del carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

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
}

// Función para agregar un producto al carrito
function agregarAlCarrito(event) {
  const card = event.target.closest('.card, .card_producto');
  if (!card) return;
  const titulo = card.querySelector('.Titulo')?.textContent || card.querySelector('.ts-item__title')?.textContent;
  const precio = card.querySelector('.Precio')?.textContent || card.querySelector('.ts-price')?.textContent;
  const imagen = card.querySelector('.Imagen_Producto, .ts-item__img')?.src;
  const marca = card.querySelector('.content h3')?.textContent || '';
  const id = card.dataset.id || (titulo + precio);

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
  // ...existing code...
});

function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
}

// Lógica para eliminar productos del carrito
document.addEventListener('DOMContentLoaded', function() {
  // Delegación de eventos para el botón eliminar en el carrito
  document.querySelector('.ts-cart__body').addEventListener('click', function(e) {
    if (e.target.closest('.ts-remove')) {
      const item = e.target.closest('.ts-item');
      if (item) {
        // Obtener el título y precio para identificar el producto
        const titulo = item.querySelector('.ts-item__title')?.textContent;
        const precio = item.querySelector('.ts-price')?.textContent;
        // Buscar el producto en el array carrito
        const index = carrito.findIndex(p => p.titulo === titulo && p.precio === precio);
        if (index !== -1) {
          carrito.splice(index, 1);
          localStorage.setItem('carrito', JSON.stringify(carrito));
        }
        // Actualizar la vista y el contador en tiempo real
        renderizarCarrito();
      }
    }
  });
});
