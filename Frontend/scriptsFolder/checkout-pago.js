import { obtenerMiPerfil } from './api/api_usuarios.js';
import { crearPreferencia } from './api/api_mercadopago.js';
import { showAlert } from './funciones.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    showAlert({
      title: 'Acceso Requerido',
      message: 'Debes iniciar sesión para usar el checkout.',
      type: 'warning'
    });
    window.location.href = 'index.html';
    return;
  }

  const stepSections = Array.from(document.querySelectorAll('[data-step]'));
  const stepperSteps = Array.from(document.querySelectorAll('.step'));
  const prevButton = document.querySelector('[data-action="prev-step"]');
  const nextButton = document.querySelector('[data-action="next-step"]');
  const confirmButton = document.querySelector('[data-checkout-confirm]');
  const addressListEl = document.querySelector('[data-address-list]');
  const paymentCheckbox = document.querySelector('[data-pay-option]');

  const itemsContainer = document.querySelector('[data-checkout-items]');
  const subtotalEl = document.querySelector('[data-checkout-subtotal]');
  const shippingEl = document.querySelector('[data-checkout-shipping]');
  const totalEl = document.querySelector('[data-checkout-total]');
  const countEl = document.querySelector('[data-checkout-count]');
  const summaryUserEl = document.querySelector('[data-summary-user]');
  const summaryAddressEl = document.querySelector('[data-summary-address]');
  const summaryPaymentEl = document.querySelector('[data-summary-payment]');
  const confirmAddressEl = document.querySelector('[data-confirm-address]');
  const confirmPaymentEl = document.querySelector('[data-confirm-payment]');

  const formatCurrency = (value) =>
    '$' + value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const composeAddressLine = (domicilio = {}) => {
    const fields = [
      domicilio.direccion,
      domicilio.numero,
      domicilio.piso,
      domicilio.departamento,
      domicilio.barrio,
      domicilio.ciudad,
      domicilio.provincia,
      domicilio.codigo_postal,
      domicilio.codigoPostal,
      domicilio.codigo_area,
      domicilio.pais,
      domicilio.descripcion
    ];
    return fields
      .map((value) => (value == null ? '' : String(value).trim()))
      .filter((value) => value.length > 0)
      .join(', ') || 'Direccion sin especificar';
  };

  let usuario;
  try {
    usuario = await obtenerMiPerfil();
  } catch (error) {
    console.error('No se pudo obtener el perfil del usuario:', error);
    showAlert({
      title: 'Error de Perfil',
      message: 'No pudimos obtener tus datos. Por favor, inicia sesión nuevamente.',
      type: 'error'
    });
    window.location.href = 'index.html';
    return;
  }

  const fullName = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ').trim() || 'Cliente';
  const domicilios = Array.isArray(usuario?.domicilios) ? usuario.domicilios : [];
  if (!domicilios.length) {
    showAlert({
      title: 'Falta Dirección',
      message: 'Necesitas cargar al menos una dirección de entrega en tu perfil para continuar.',
      type: 'warning'
    });
    window.location.href = 'perfil.html';
    return;
  }

  const domiciliosById = new Map();
  domicilios.forEach((dom) => {
    if (dom?.id != null) {
      domiciliosById.set(Number(dom.id), dom);
    }
  });

  const defaultAddress = domicilios.find((d) => d?.principal) || domicilios[0];
  let selectedAddressId =
    defaultAddress && defaultAddress.id != null ? Number(defaultAddress.id) : null;
  let selectedPaymentMethod = null;
  let currentStep = 0;
  const TOTAL_STEPS = stepSections.length;

  if (summaryUserEl) summaryUserEl.textContent = fullName;

  const cartRaw = localStorage.getItem('carrito');
  let cart = [];
  try {
    cart = JSON.parse(cartRaw) || [];
  } catch {
    cart = [];
  }

  const parsePrice = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const sanitized = String(value).replace(/[^0-9,.-]/g, '');
    const normalized = sanitized.replace(/\./g, '').replace(',', '.');
    const numeric = Number.parseFloat(normalized);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  let subtotal = 0;
  let totalItems = 0;
  const SHIPPING_COST = 0;

  const fragment = document.createDocumentFragment();
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
    if (item.marca) details.push(item.marca);
    meta.textContent = details.join(' - ');
    body.appendChild(meta);
    row.appendChild(body);

    const price = document.createElement('div');
    price.className = 'price price--ok';
    price.textContent = formatCurrency(lineTotal);
    row.appendChild(price);

    fragment.appendChild(row);
  });

  if (!cart.length) {
    if (itemsContainer) itemsContainer.innerHTML = '<p class="summary__empty">Tu carrito esta vacio.</p>';
    if (subtotalEl) subtotalEl.textContent = '$0';
    if (shippingEl) shippingEl.textContent = 'Gratis';
    if (totalEl) totalEl.textContent = '$0';
    if (countEl) countEl.textContent = '';
    if (confirmButton) {
      confirmButton.disabled = true;
      confirmButton.style.display = 'none';
    }
    return;
  }

  if (itemsContainer) {
    itemsContainer.innerHTML = '';
    itemsContainer.appendChild(fragment);
  }
  const orderTotal = subtotal + SHIPPING_COST;

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (shippingEl) shippingEl.textContent = SHIPPING_COST > 0 ? formatCurrency(SHIPPING_COST) : 'Gratis';
  if (totalEl) totalEl.textContent = formatCurrency(orderTotal);
  if (countEl) countEl.textContent = `${totalItems} producto${totalItems === 1 ? '' : 's'} en tu carrito`;
  const renderAddressOptions = () => {
    if (!addressListEl) return;
    addressListEl.innerHTML = '';
    domicilios.forEach((dom) => {
      const label = document.createElement('label');
      label.className = 'addr';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'checkout-address';
      input.dataset.addressId = String(dom.id);
      input.checked = Number(dom.id) === Number(selectedAddressId);
      input.addEventListener('change', () => handleAddressSelection(input));

      const main = document.createElement('div');
      main.className = 'addr__main';

      const name = document.createElement('div');
      name.className = 'addr__name';
      name.textContent = dom.etiqueta ? `${dom.etiqueta} - ${fullName}` : fullName;
      main.appendChild(name);

      const line = document.createElement('div');
      line.className = 'addr__meta';
      line.textContent = composeAddressLine(dom);
      main.appendChild(line);

      if (dom.telefono) {
        const tel = document.createElement('div');
        tel.className = 'addr__meta';
        tel.textContent = `Tel: ${dom.telefono}`;
        main.appendChild(tel);
      }

      label.appendChild(input);
      label.appendChild(main);
      addressListEl.appendChild(label);
    });
  };

  const handleAddressSelection = (input) => {
    if (!addressListEl) return;
    addressListEl.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      if (checkbox !== input) checkbox.checked = false;
    });
    selectedAddressId = input.checked ? Number(input.dataset.addressId) : null;
    updateSummaryAddress();
    updateButtonsState();
  };

  const updateSummaryAddress = () => {
    const id = selectedAddressId != null ? Number(selectedAddressId) : null;
    const domicilioSeleccionado = id != null ? domiciliosById.get(id) : null;
    if (!domicilioSeleccionado) {
      if (summaryAddressEl) summaryAddressEl.textContent = '---';
      if (confirmAddressEl) {
        confirmAddressEl.innerHTML = `
          <div class="kv-lite__row">
            <span>Nombre</span>
            <strong>---</strong>
          </div>
          <div class="kv-lite__row">
            <span>Direccion</span>
            <strong>---</strong>
          </div>
        `;
      }
      return;
    }

    const addressLine = composeAddressLine(domicilioSeleccionado);
    if (summaryAddressEl) summaryAddressEl.textContent = addressLine;
    if (confirmAddressEl) {
      confirmAddressEl.innerHTML = `
          <div class="kv-lite__row">
            <span>Nombre</span>
            <strong>${fullName}</strong>
          </div>
          <div class="kv-lite__row">
            <span>Direccion</span>
            <strong>${addressLine}</strong>
          </div>
        `;
    }
  };

  const updateSummaryPayment = () => {
    const value = selectedPaymentMethod || '---';
    if (summaryPaymentEl) summaryPaymentEl.textContent = value;
    if (confirmPaymentEl) {
      confirmPaymentEl.innerHTML = `
        <div class="kv-lite__row">
          <span>Forma de pago</span>
          <strong>${value}</strong>
        </div>
        <div class="kv-lite__row">
          <span>Total a pagar</span>
          <strong data-confirm-total>${formatCurrency(orderTotal)}</strong>
        </div>
      `;
    }
  };

  const updateStepperUi = () => {
    stepperSteps.forEach((stepElem, index) => {
      stepElem.classList.remove('step--active', 'step--done');
      if (index < currentStep) {
        stepElem.classList.add('step--done');
      } else if (index === currentStep) {
        stepElem.classList.add('step--active');
      }
    });
  };

  const showStep = (index) => {
    stepSections.forEach((section) => section.classList.remove('is-active'));
    if (stepSections[index]) stepSections[index].classList.add('is-active');
  };

  const updateButtonsState = () => {
    if (!prevButton || !nextButton || !confirmButton) return;

    prevButton.style.display = currentStep === 0 ? 'none' : 'inline-flex';
    nextButton.style.display = currentStep >= TOTAL_STEPS - 1 ? 'none' : 'inline-flex';
    confirmButton.style.display = currentStep === TOTAL_STEPS - 1 ? 'inline-flex' : 'none';

    if (currentStep === 0) {
      nextButton.textContent = 'Ir a Pago';
      prevButton.textContent = 'Volver';
    } else if (currentStep === 1) {
      nextButton.textContent = 'Ir a Confirmacion';
      prevButton.textContent = 'Volver a Direccion';
    } else if (currentStep === TOTAL_STEPS - 1) {
      prevButton.textContent = 'Volver a Pago';
    }

    const canProceedAddress = Boolean(selectedAddressId);
    const canProceedPayment = Boolean(selectedPaymentMethod);

    if (currentStep === 0) {
      nextButton.disabled = !canProceedAddress;
    } else if (currentStep === 1) {
      nextButton.disabled = !canProceedPayment;
    } else {
      nextButton.disabled = false;
    }

    confirmButton.disabled = !(currentStep === TOTAL_STEPS - 1 && canProceedAddress && canProceedPayment);
  };

  const goToStep = (index) => {
    currentStep = Math.max(0, Math.min(index, TOTAL_STEPS - 1));
    showStep(currentStep);
    updateStepperUi();
    if (currentStep === TOTAL_STEPS - 1) {
      updateConfirmationView();
    }
    updateButtonsState();
  };

  const updateConfirmationView = () => {
    updateSummaryAddress();
    updateSummaryPayment();
  };

  if (paymentCheckbox) {
    paymentCheckbox.addEventListener('change', () => {
      selectedPaymentMethod = paymentCheckbox.checked ? 'Mercado Pago' : null;
      updateSummaryPayment();
      updateButtonsState();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentStep > 0) goToStep(currentStep - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentStep === 0 && !selectedAddressId) {
        showAlert({
          title: 'Paso Incompleto',
          message: 'Selecciona una dirección para continuar.',
          type: 'info'
        });
        return;
      }
      if (currentStep === 1 && !selectedPaymentMethod) {
        showAlert({
          title: 'Paso Incompleto',
          message: 'Selecciona el método de pago.',
          type: 'info'
        });
        return;
      }
      goToStep(currentStep + 1);
    });
  }

  if (confirmButton) {
    confirmButton.addEventListener('click', async () => {
      if (!(selectedAddressId && selectedPaymentMethod)) {
        showAlert({
          title: 'Faltan Datos',
          message: 'Completa los pasos anteriores antes de confirmar.',
          type: 'warning'
        });
        return;
      }

      const originalText = confirmButton.textContent;
      confirmButton.disabled = true;
      confirmButton.textContent = 'Procesando...';

      const productos = cart.map((item) => ({
        idProducto: Number(item.id),
        cantidad: Number(item.cantidad) || 1
      }));

      try {
        const response = await crearPreferencia({ productos });
        if (response?.init_point) {
          window.location.href = response.init_point;
        } else {
          throw new Error('No se recibio la URL de pago.');
        }
      } catch (error) {
        console.error('Error al iniciar el pago:', error);
        showAlert({
          title: 'Error de Pago',
          message: error?.message || 'No pudimos iniciar el proceso de pago. Intenta nuevamente.',
          type: 'error'
        });
        confirmButton.disabled = false;
        confirmButton.textContent = originalText;
      }
    });
  }

  renderAddressOptions();
  updateSummaryAddress();
  updateSummaryPayment();
  showStep(currentStep);
  updateStepperUi();
  updateButtonsState();
});
