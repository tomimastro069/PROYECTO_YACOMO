import { obtenerMiPerfil } from './api/api_usuarios.js';

document.addEventListener('DOMContentLoaded', async () => {
  const confirmButton = document.querySelector('[data-checkout-confirm]');
  if (confirmButton) confirmButton.disabled = true;

  const token = localStorage.getItem('jwt_token');
  if (!token) {
    alert('Debes iniciar sesion para usar el checkout.');
    window.location.href = 'index.html';
    return;
  }

  let usuario = null;
  try {
    usuario = await obtenerMiPerfil();
  } catch (error) {
    console.error('No se pudo obtener el perfil del usuario:', error);
    alert('No pudimos obtener tus datos de perfil. Inicia sesion nuevamente.');
    window.location.href = 'index.html';
    return;
  }

  const itemsContainer = document.querySelector('[data-checkout-items]');
  const subtotalEl = document.querySelector('[data-checkout-subtotal]');
  const shippingEl = document.querySelector('[data-checkout-shipping]');
  const totalEl = document.querySelector('[data-checkout-total]');
  const countEl = document.querySelector('[data-checkout-count]');
  const addressCard = document.querySelector('[data-checkout-address]');
  const summaryUserEl = document.querySelector('[data-summary-user]');
  const summaryAddressEl = document.querySelector('[data-summary-address]');

  const fullName = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ').trim();
  const email = usuario?.email || '';
  const domicilios = Array.isArray(usuario?.domicilios) ? usuario.domicilios : [];
  const domicilioPrincipal = domicilios.find((d) => d?.principal) || domicilios[0];

  if (!domicilioPrincipal) {
    alert('Necesitas cargar al menos una direccion de entrega en tu perfil.');
    window.location.href = 'perfil.html';
    return;
  }

  const addressFields = [
    domicilioPrincipal.direccion,
    domicilioPrincipal.numero,
    domicilioPrincipal.piso,
    domicilioPrincipal.departamento,
    domicilioPrincipal.barrio,
    domicilioPrincipal.ciudad,
    domicilioPrincipal.provincia,
    domicilioPrincipal.codigo_postal,
    domicilioPrincipal.codigoPostal,
    domicilioPrincipal.codigo_area,
    domicilioPrincipal.pais,
    domicilioPrincipal.descripcion
  ];
  const addressLine = addressFields
    .map((value) => (value == null ? '' : String(value).trim()))
    .filter((value) => value.length > 0)
    .join(', ') || 'Direccion sin especificar';

  if (addressCard) {
    addressCard.innerHTML = `
      <strong>${fullName || 'Cliente sin nombre'}</strong><br>
      <span class="addr__meta">${email}</span><br>
      <span>${addressLine}</span>
    `;
  }

  if (summaryUserEl) {
    summaryUserEl.textContent = fullName || 'Cliente';
  }
  if (summaryAddressEl) {
    summaryAddressEl.textContent = addressLine;
  }

  const cartRaw = localStorage.getItem('carrito');
  let cart = [];
  try {
    cart = JSON.parse(cartRaw) || [];
  } catch {
    cart = [];
  }

  const parsePrice = (value) => {
    if (typeof value === 'number') {
      return value;
    }
    if (!value) {
      return 0;
    }
    const sanitized = String(value).replace(/[^0-9,.-]/g, '');
    const normalized = sanitized.replace(/\./g, '').replace(',', '.');
    const numeric = Number.parseFloat(normalized);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const formatCurrency = (value) => {
    return '$' + value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  if (!Array.isArray(cart) || cart.length === 0) {
    if (itemsContainer) {
      itemsContainer.innerHTML = '<p class=\"summary__empty\">Tu carrito esta vacio.</p>';
    }
    if (subtotalEl) subtotalEl.textContent = '$0';
    if (shippingEl) shippingEl.textContent = 'Gratis';
    if (totalEl) totalEl.textContent = '$0';
    if (countEl) countEl.textContent = '';
    if (confirmButton) confirmButton.disabled = true;
    return;
  }

  const SHIPPING_COST = 0;
  const fragment = document.createDocumentFragment();
  let subtotal = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    const quantity = Number(item.cantidad) || 1;
    totalItems += quantity;

    const unitPrice = parsePrice(item.precio);
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;

    const row = document.createElement('div');
    row.className = 'item';

    const image = document.createElement('img');
    image.className = 'item__img';
    image.src = item.imagen || 'https://via.placeholder.com/100';
    image.alt = item.titulo || 'Producto';
    row.appendChild(image);

    const body = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'item__title';
    title.textContent = item.titulo || 'Producto';
    body.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'item__qty';
    const details = [`x${quantity}`];
    if (item.marca) {
      details.push(item.marca);
    }
    meta.textContent = details.join(' - ');
    body.appendChild(meta);

    row.appendChild(body);

    const price = document.createElement('div');
    price.className = 'price price--ok';
    price.textContent = formatCurrency(lineTotal);
    row.appendChild(price);

    fragment.appendChild(row);
  });

  if (itemsContainer) {
    itemsContainer.innerHTML = '';
    itemsContainer.appendChild(fragment);
  }

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (shippingEl) shippingEl.textContent = SHIPPING_COST > 0 ? formatCurrency(SHIPPING_COST) : 'Gratis';
  if (totalEl) totalEl.textContent = formatCurrency(subtotal + SHIPPING_COST);
  if (countEl) countEl.textContent = `${totalItems} producto${totalItems === 1 ? '' : 's'} en tu carrito`;

  if (confirmButton) {
    confirmButton.disabled = false;
    confirmButton.addEventListener('click', () => {
      alert('Flujo de pago pendiente de implementacion.');
    });
  }
});
