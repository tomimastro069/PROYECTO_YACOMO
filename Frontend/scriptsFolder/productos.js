const API_BASE = "http://localhost:8080/api";

// === 1️⃣ Obtener productos del backend ===
async function obtenerProductos() {
    try {
        const res = await fetch(`${API_BASE}/productos`);
        if (!res.ok) throw new Error("Error cargando productos");
        return await res.json();
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

// === 2️⃣ Obtener promedio de estrellas de un producto ===
async function obtenerPromedioEstrellas(productoId) {
    try {
        const res = await fetch(`${API_BASE}/estrellas/promedio/${productoId}`);
        if (!res.ok) throw new Error("Error al obtener estrellas");
        return await res.json();
    } catch (error) {
        console.error("Error cargando promedio:", error);
        return 0;
    }
}

// === 3️⃣ Generar estrellas en HTML ===
function renderizarEstrellas(promedio, productoId) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
        html += `<span class="estrella" data-id="${productoId}" data-value="${i}">
                    ${i <= Math.round(promedio) ? "⭐" : "☆"}
                 </span>`;
    }
    return html;
}

// === 4️⃣ Mostrar productos en el DOM ===
async function mostrarProductos() {
    const contenedor = document.getElementById("productos-container");
    contenedor.innerHTML = "";
    const productos = await obtenerProductos();

    for (const producto of productos) {
        const promedio = await obtenerPromedioEstrellas(producto.id);

        const tarjeta = document.createElement("div");
        tarjeta.classList.add("producto-card");

        tarjeta.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <p><strong>Precio:</strong> $${producto.precio}</p>
            <div class="estrellas" data-id="${producto.id}">
                ${renderizarEstrellas(promedio, producto.id)}
            </div>
        `;

        contenedor.appendChild(tarjeta);
    }

    habilitarHoverEstrellas();
}

// === 5️⃣ Hover y click de estrellas ===
function habilitarHoverEstrellas() {
    const estrellas = document.querySelectorAll(".estrella");

    estrellas.forEach(star => {
        const productoId = star.dataset.id;

        star.addEventListener("mouseover", () => {
            const value = star.dataset.value;
            const siblings = star.parentElement.querySelectorAll(".estrella");
            siblings.forEach(s => s.textContent = s.dataset.value <= value ? "⭐" : "☆");
        });

        star.addEventListener("mouseout", async () => {
            const promedio = await obtenerPromedioEstrellas(productoId);
            const siblings = star.parentElement.querySelectorAll(".estrella");
            siblings.forEach(s => s.textContent = s.dataset.value <= Math.round(promedio) ? "⭐" : "☆");
        });

        star.addEventListener("click", async () => {
            const puntuacion = star.dataset.value;
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE}/estrellas`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({
                        productoId,
                        puntuacion
                    })
                });
                if (!res.ok) throw new Error("Error al guardar calificación");

                const nuevoPromedio = await obtenerPromedioEstrellas(productoId);
                const contenedorEstrellas = document.querySelector(`.estrellas[data-id="${productoId}"]`);
                contenedorEstrellas.innerHTML = renderizarEstrellas(nuevoPromedio, productoId);
                habilitarHoverEstrellas(); // reactivar hover después de actualizar
            } catch (error) {
                console.error(error);
                alert("Error al guardar calificación. Verifica tu sesión.");
            }
        });
    });
}

// === 6️⃣ Ejecutar carga inicial ===
document.addEventListener("DOMContentLoaded", mostrarProductos);
