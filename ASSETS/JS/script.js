/* ============================================================
   Entre Sol y Cemento — script.js
   Carrito persistente con localStorage
   ============================================================ */

// ── CATÁLOGO DE PRODUCTOS (fuente de verdad) ─────────────────
const PRODUCTOS = [
    {
        id: 1,
        nombre: "Maceta PKMN",
        precio: 25000,
        imagen: "ASSETS/IMG/productos/macetapkmn.png",
        imagenDesdePages: "../ASSETS/IMG/productos/macetapkmn.png"
    },
    {
        id: 2,
        nombre: "Buda de Cemento",
        precio: 300000,
        imagen: "ASSETS/IMG/productos/buda.png",
        imagenDesdePages: "../ASSETS/IMG/productos/buda.png"
    }
];

// ── HELPERS DE localStorage ───────────────────────────────────

function obtenerCarrito() {
    const data = localStorage.getItem('carrito');
    return data ? JSON.parse(data) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(idProducto) {
    const carrito = obtenerCarrito();
    const producto = PRODUCTOS.find(p => p.id === idProducto);
    if (!producto) return;

    const existente = carrito.find(item => item.id === idProducto);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
    }
    guardarCarrito(carrito);
    actualizarContador();
}

function actualizarContador() {
    const carrito = obtenerCarrito();
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const visor = document.getElementById('cantidad-carrito');
    if (visor) visor.textContent = total;
}

function formatearPrecio(num) {
    return '$' + num.toLocaleString('es-CL');
}

// ── AL CARGAR CUALQUIER PÁGINA ────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {

    // Siempre actualizar el contador del navbar
    actualizarContador();

    // ── 1. BOTONES "AÑADIR" en index y catálogo ───────────────
    // Busca el id del producto leyendo el data-id del botón,
    // o como fallback busca el h3 del artículo y lo cruza con PRODUCTOS
    const botonesAñadir = document.querySelectorAll('.btn-añadir');

    botonesAñadir.forEach(boton => {
        boton.addEventListener('click', function () {
            const idProducto = parseInt(this.dataset.id);
            agregarAlCarrito(idProducto);
            const producto = PRODUCTOS.find(p => p.id === idProducto);
            if (producto) {
                mostrarToast(`¡${producto.nombre} añadido al carrito!`);
            }
        });
    });

    // ── 2. BOTÓN SUBIR ────────────────────────────────────────
    const btnSubir = document.getElementById("btn-subir");
    if (btnSubir) {
        btnSubir.addEventListener("click", function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ── 3. VALIDACIÓN DE FORMULARIOS ─────────────────────────
    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.addEventListener('submit', function (event) {
            event.preventDefault();
            const campoNombre   = document.querySelector('input[type="text"]');
            const campoEmail    = document.querySelector('input[type="email"]');
            const campoPassword = document.querySelector('input[type="password"]');

            if (!campoNombre && campoEmail && campoPassword) {
                if (!campoEmail.value || !campoPassword.value) {
                    alert("Por favor, completa todos los campos.");
                } else {
                    alert("¡Inicio de sesión exitoso! Bienvenido de vuelta.");
                }
            }
            if (campoNombre && campoEmail && campoPassword) {
                const passwords = document.querySelectorAll('input[type="password"]');
                if (!campoNombre.value || !campoEmail.value || !campoPassword.value) {
                    alert("Por favor, completa todos los campos.");
                } else if (passwords.length >= 2 && passwords[0].value !== passwords[1].value) {
                    alert("Las contraseñas no coinciden. Por favor revísalas.");
                } else {
                    alert("¡Registro exitoso! Bienvenido a Entre Sol y Cemento.");
                }
            }
        });
    }

    // ── 4. RENDERIZAR CARRITO (solo en carrito.html) ──────────
    const tablaCarritoBody = document.getElementById('carrito-body');
    const totalCarrito     = document.getElementById('carrito-total');
    const seccionVacio     = document.getElementById('carrito-vacio');
    const seccionTabla     = document.getElementById('carrito-tabla');

    if (tablaCarritoBody) {
        renderizarCarrito();
    }

    function renderizarCarrito() {
        const carrito = obtenerCarrito();

        if (carrito.length === 0) {
            if (seccionVacio) seccionVacio.style.display = 'block';
            if (seccionTabla) seccionTabla.style.display = 'none';
            return;
        }

        if (seccionVacio) seccionVacio.style.display = 'none';
        if (seccionTabla) seccionTabla.style.display = 'block';

        tablaCarritoBody.innerHTML = '';
        let total = 0;

        carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>${item.nombre}</strong></td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary btn-restar" data-id="${item.id}" style="width:28px;height:28px;padding:0;line-height:1;">−</button>
                        <span class="fw-bold">${item.cantidad}</span>
                        <button class="btn btn-sm btn-outline-secondary btn-sumar" data-id="${item.id}" style="width:28px;height:28px;padding:0;line-height:1;">+</button>
                    </div>
                </td>
                <td>${formatearPrecio(item.precio)}</td>
                <td>${formatearPrecio(subtotal)}</td>
                <td>
                    <button class="btn btn-sm btn-eliminar" data-id="${item.id}" title="Eliminar" style="background:none;border:none;font-size:1.2rem;color:#999;">🗑</button>
                </td>
            `;
            tablaCarritoBody.appendChild(fila);
        });

        if (totalCarrito) totalCarrito.textContent = formatearPrecio(total);

        // Eventos de +, − y eliminar
        document.querySelectorAll('.btn-sumar').forEach(btn => {
            btn.addEventListener('click', function () {
                cambiarCantidad(parseInt(this.dataset.id), 1);
            });
        });
        document.querySelectorAll('.btn-restar').forEach(btn => {
            btn.addEventListener('click', function () {
                cambiarCantidad(parseInt(this.dataset.id), -1);
            });
        });
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function () {
                eliminarDelCarrito(parseInt(this.dataset.id));
            });
        });
    }

    function cambiarCantidad(idProducto, delta) {
        const carrito = obtenerCarrito();
        const item = carrito.find(i => i.id === idProducto);
        if (!item) return;
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(idProducto);
            return;
        }
        guardarCarrito(carrito);
        actualizarContador();
        renderizarCarrito();
    }

    function eliminarDelCarrito(idProducto) {
        let carrito = obtenerCarrito();
        carrito = carrito.filter(i => i.id !== idProducto);
        guardarCarrito(carrito);
        actualizarContador();
        renderizarCarrito();
    }

    // Vaciar carrito completo
    const btnVaciar = document.getElementById('btn-vaciar');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', function () {
            if (confirm('¿Seguro que quieres vaciar el carrito?')) {
                guardarCarrito([]);
                actualizarContador();
                renderizarCarrito();
            }
        });
    }

    // Finalizar pedido
    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', function () {
            guardarCarrito([]);
            actualizarContador();
            alert('¡Pedido recibido! Nos contactaremos contigo pronto.');
            renderizarCarrito();
        });
    }

});

// ── TOAST (notificación no bloqueante) ────────────────────────
function mostrarToast(mensaje) {
    let toast = document.getElementById('toast-carrito');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-carrito';
        toast.style.cssText = `
            position: fixed; bottom: 80px; right: 20px; z-index: 9999;
            background-color: #4E6F4E; color: #F0EDE4;
            padding: 12px 20px; border-radius: 10px;
            font-family: 'AliceCustom', serif; font-size: 0.95rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            border-left: 4px solid #C9973A;
            opacity: 0; transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}
