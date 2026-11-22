/* ============================================================
   THE RIFF - script.js
   - Consumo de una API REST con fetch (productos.json)
   - Renderizado de productos en el DOM
   - Carrito de compras con localStorage
   - Validación del formulario de contacto
   - Accesibilidad (teclado, foco, anuncios en vivo)
   ============================================================ */

/* ---------- CONSTANTES ---------- */

const URL_PRODUCTOS = './productos.json';
const CLAVE_CARRITO = 'theRiff_carrito';
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- ESTADO ---------- */

let productos = [];
let carrito = [];
let focoAnterior = null;

/* ---------- REFERENCIAS AL DOM ---------- */

const listaProductos = document.getElementById('lista-productos');
const estadoProductos = document.getElementById('estado-productos');

const btnCarrito = document.getElementById('btn-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const panelCarrito = document.getElementById('carrito-panel');
const overlayCarrito = document.getElementById('carrito-overlay');
const btnCerrarCarrito = document.getElementById('btn-cerrar-carrito');
const btnSeguir = document.getElementById('btn-seguir');
const btnVaciar = document.getElementById('btn-vaciar');
const btnFinalizar = document.getElementById('btn-finalizar');

const listaCarrito = document.getElementById('lista-carrito');
const carritoVacio = document.getElementById('carrito-vacio');
const totalCarrito = document.getElementById('total-carrito');
const msgCompra = document.getElementById('msg-compra');

const formulario = document.getElementById('formulario-contacto');
const msgFormulario = document.getElementById('msg-formulario');


/* ============================================================
   PRODUCTOS - API REST (fetch)
   ============================================================ */

async function obtenerProductos() {
    const respuesta = await fetch(URL_PRODUCTOS, {
        headers: { 'Accept': 'application/json' }
    });

    if (!respuesta.ok) {
        throw new Error('Error HTTP: ' + respuesta.status);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos) || datos.length === 0) {
        throw new Error('La API no devolvió productos');
    }

    return datos;
}

async function cargarProductos() {
    estadoProductos.hidden = false;
    estadoProductos.classList.remove('error');
    estadoProductos.textContent = 'Cargando productos…';

    try {
        productos = await obtenerProductos();
        renderizarProductos();
        estadoProductos.hidden = true;
        estadoProductos.textContent = '';
    } catch (error) {
        console.error('No se pudieron cargar los productos:', error);
        mostrarErrorCarga();
    }
}

function mostrarErrorCarga() {
    estadoProductos.hidden = false;
    estadoProductos.classList.add('error');
    estadoProductos.textContent = 'No se pudieron cargar los productos. ';

    const btnReintentar = document.createElement('button');
    btnReintentar.type = 'button';
    btnReintentar.className = 'boton';
    btnReintentar.textContent = 'Reintentar';
    btnReintentar.addEventListener('click', cargarProductos);

    estadoProductos.appendChild(btnReintentar);
}

function renderizarProductos() {
    listaProductos.textContent = '';

    productos.forEach(producto => {
        listaProductos.appendChild(crearCard(producto));
    });
}

function crearCard(producto) {
    const card = document.createElement('article');
    card.className = 'card';

    const imagen = document.createElement('img');
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.loading = 'lazy';

    const titulo = document.createElement('h3');
    titulo.textContent = producto.nombre;

    const descripcion = document.createElement('p');
    descripcion.textContent = producto.descripcion;

    const precio = document.createElement('p');
    precio.className = 'precio';
    precio.textContent = formatearPrecio(producto.precio);

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton btn-agregar';
    boton.dataset.id = producto.id;
    boton.textContent = 'Agregar al carrito';
    boton.setAttribute('aria-label', 'Agregar ' + producto.nombre + ' al carrito');

    card.append(imagen, titulo, descripcion, precio, boton);
    return card;
}

// Delegación de eventos: un solo listener para todas las cards
listaProductos.addEventListener('click', evento => {
    const boton = evento.target.closest('.btn-agregar');
    if (!boton) return;

    agregarAlCarrito(Number(boton.dataset.id));
    abrirCarrito();
});


/* ============================================================
   CARRITO DE COMPRAS - localStorage
   ============================================================ */

function cargarCarrito() {
    try {
        const guardado = localStorage.getItem(CLAVE_CARRITO);
        carrito = guardado ? JSON.parse(guardado) : [];
        if (!Array.isArray(carrito)) carrito = [];
    } catch (error) {
        console.error('No se pudo leer el carrito:', error);
        carrito = [];
    }
}

function guardarCarrito() {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch (error) {
        console.error('No se pudo guardar el carrito:', error);
    }
}

function agregarAlCarrito(id) {
    const producto = productos.find(item => item.id === id);
    if (!producto) return;

    const existente = carrito.find(item => item.id === id);

    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarCarrito();
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(producto => producto.id === id);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        eliminarProducto(id);
        return;
    }

    guardarCarrito();
    actualizarCarrito();
}

function eliminarProducto(id) {
    carrito = carrito.filter(producto => producto.id !== id);
    guardarCarrito();
    actualizarCarrito();
}

function vaciarCarrito() {
    if (carrito.length === 0) return;

    carrito = [];
    guardarCarrito();
    actualizarCarrito();
    msgCompra.textContent = 'Se vació el carrito.';
}

function calcularTotal() {
    return carrito.reduce((acumulado, item) => acumulado + (item.precio * item.cantidad), 0);
}

function cantidadTotal() {
    return carrito.reduce((acumulado, item) => acumulado + item.cantidad, 0);
}

function actualizarCarrito() {
    // Contador dinámico del header
    contadorCarrito.textContent = cantidadTotal();
    btnCarrito.setAttribute(
        'aria-label',
        'Abrir carrito, ' + cantidadTotal() + ' productos'
    );

    renderizarCarrito();
}

function renderizarCarrito() {
    listaCarrito.textContent = '';

    carritoVacio.hidden = carrito.length > 0;

    carrito.forEach(item => {
        listaCarrito.appendChild(crearItemCarrito(item));
    });

    totalCarrito.textContent = formatearPrecio(calcularTotal());
}

function crearItemCarrito(item) {
    const li = document.createElement('li');
    li.className = 'item-carrito';

    const imagen = document.createElement('img');
    imagen.src = item.imagen;
    imagen.alt = item.nombre;

    const info = document.createElement('div');
    info.className = 'item-info';

    const nombre = document.createElement('h3');
    nombre.textContent = item.nombre;

    const precioUnitario = document.createElement('p');
    precioUnitario.className = 'precio-unitario';
    precioUnitario.textContent = 'Unitario: ' + formatearPrecio(item.precio);

    // Controles de cantidad (+ / -)
    const controles = document.createElement('div');
    controles.className = 'controles-cantidad';

    const btnMenos = document.createElement('button');
    btnMenos.type = 'button';
    btnMenos.textContent = '−';
    btnMenos.setAttribute('aria-label', 'Quitar una unidad de ' + item.nombre);
    btnMenos.addEventListener('click', () => cambiarCantidad(item.id, -1));

    const cantidad = document.createElement('span');
    cantidad.textContent = item.cantidad;
    cantidad.setAttribute('aria-label', 'Cantidad: ' + item.cantidad);

    const btnMas = document.createElement('button');
    btnMas.type = 'button';
    btnMas.textContent = '+';
    btnMas.setAttribute('aria-label', 'Agregar una unidad de ' + item.nombre);
    btnMas.addEventListener('click', () => cambiarCantidad(item.id, 1));

    controles.append(btnMenos, cantidad, btnMas);

    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'btn-eliminar';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.setAttribute('aria-label', 'Eliminar ' + item.nombre + ' del carrito');
    btnEliminar.addEventListener('click', () => eliminarProducto(item.id));

    info.append(nombre, precioUnitario, controles, btnEliminar);

    const subtotal = document.createElement('span');
    subtotal.className = 'subtotal';
    subtotal.textContent = formatearPrecio(item.precio * item.cantidad);
    subtotal.setAttribute('aria-label', 'Subtotal: ' + formatearPrecio(item.precio * item.cantidad));

    li.append(imagen, info, subtotal);
    return li;
}

// Simular la compra
btnFinalizar.addEventListener('click', () => {
    if (carrito.length === 0) {
        msgCompra.textContent = 'Tu carrito está vacío.';
        return;
    }

    const total = formatearPrecio(calcularTotal());
    const cantidad = cantidadTotal();

    carrito = [];
    guardarCarrito();
    actualizarCarrito();

    msgCompra.textContent = '¡Compra simulada con éxito! Llevás ' +
        cantidad + (cantidad === 1 ? ' producto' : ' productos') +
        ' por ' + total + '. ¡Gracias por tu compra!';
});

btnVaciar.addEventListener('click', vaciarCarrito);


/* ============================================================
   PANEL DEL CARRITO - apertura, cierre y teclado
   ============================================================ */

function abrirCarrito() {
    focoAnterior = document.activeElement;

    panelCarrito.classList.add('abierto');
    overlayCarrito.classList.add('visible');
    panelCarrito.setAttribute('aria-hidden', 'false');
    btnCarrito.setAttribute('aria-expanded', 'true');

    btnCerrarCarrito.focus();
    document.addEventListener('keydown', manejarTecladoCarrito);
}

function cerrarCarrito() {
    panelCarrito.classList.remove('abierto');
    overlayCarrito.classList.remove('visible');
    panelCarrito.setAttribute('aria-hidden', 'true');
    btnCarrito.setAttribute('aria-expanded', 'false');

    document.removeEventListener('keydown', manejarTecladoCarrito);

    // El foco vuelve al elemento que abrió el carrito.
    // Si ya no existe o está dentro del panel, volvemos al botón del carrito.
    const focoValido = focoAnterior
        && typeof focoAnterior.focus === 'function'
        && document.contains(focoAnterior)
        && !panelCarrito.contains(focoAnterior);

    if (focoValido) {
        focoAnterior.focus();
    } else {
        btnCarrito.focus();
    }
}

function manejarTecladoCarrito(evento) {
    // Esc cierra el panel
    if (evento.key === 'Escape') {
        evento.preventDefault();
        cerrarCarrito();
        return;
    }

    // Trap de foco: el Tab no sale del panel mientras está abierto
    if (evento.key === 'Tab') {
        const focables = panelCarrito.querySelectorAll(
            'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focables.length === 0) return;

        const primero = focables[0];
        const ultimo = focables[focables.length - 1];

        if (evento.shiftKey && document.activeElement === primero) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primero.focus();
        }
    }
}

btnCarrito.addEventListener('click', abrirCarrito);
btnCerrarCarrito.addEventListener('click', cerrarCarrito);
btnSeguir.addEventListener('click', cerrarCarrito);
overlayCarrito.addEventListener('click', cerrarCarrito);


/* ============================================================
   FORMULARIO DE CONTACTO - validación con DOM
   ============================================================ */

function mostrarErrorCampo(campo, mensaje) {
    const error = document.getElementById('error-' + campo.id);

    campo.classList.toggle('is-invalid', Boolean(mensaje));
    campo.setAttribute('aria-invalid', mensaje ? 'true' : 'false');

    if (error) {
        error.textContent = mensaje;
    }
}

function validarCampo(campo) {
    const valor = campo.value.trim();

    if (valor === '') {
        mostrarErrorCampo(campo, 'Este campo es obligatorio.');
        return false;
    }

    if (campo.type === 'email' && !REGEX_EMAIL.test(valor)) {
        mostrarErrorCampo(campo, 'Ingresá un correo electrónico válido.');
        return false;
    }

    mostrarErrorCampo(campo, '');
    return true;
}

formulario.addEventListener('submit', evento => {
    const campos = Array.from(formulario.querySelectorAll('input, textarea'));
    const resultados = campos.map(validarCampo);

    if (resultados.includes(false)) {
        // Hay errores: no enviamos a Formspree
        evento.preventDefault();

        const primerInvalido = campos.find(
            campo => campo.getAttribute('aria-invalid') === 'true'
        );

        if (primerInvalido) primerInvalido.focus();

        msgFormulario.textContent = 'Revisá los campos marcados e intentá de nuevo.';
        msgFormulario.classList.add('error');
    } else {
        msgFormulario.classList.remove('error');
        msgFormulario.textContent = 'Enviando mensaje…';
    }
});

// Limpiar el error del campo mientras el usuario escribe
formulario.querySelectorAll('input, textarea').forEach(campo => {
    campo.addEventListener('input', () => {
        if (campo.getAttribute('aria-invalid') === 'true') {
            validarCampo(campo);
        }
    });
});


/* ============================================================
   UTILIDADES
   ============================================================ */

function formatearPrecio(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(valor);
}


/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

cargarCarrito();
actualizarCarrito();
cargarProductos();
