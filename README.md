# The Riff 🎸

## Descripción

**The Riff** es un proyecto de e-commerce de instrumentos musicales desarrollado como parte de un curso de desarrollo web.

El sitio permite visualizar productos obtenidos desde una API REST, agregarlos a un carrito de compras persistente, consultar opiniones de clientes y comunicarse con la tienda mediante un formulario de contacto.

## Tecnologías utilizadas

* HTML5 (etiquetas semánticas)
* CSS3
* Flexbox
* CSS Grid
* Media Queries
* Bootstrap 5 (CDN - utilidades)
* JavaScript (ES6+)
* Fetch API
* localStorage
* Google Fonts
* Formspree
* Git y GitHub

## Estructura del sitio

El proyecto cuenta con las siguientes secciones:

* **Inicio:** presentación de la tienda y acceso a los productos.
* **Productos:** catálogo de instrumentos musicales presentado mediante Flexbox.
* **Reseñas:** opiniones de clientes organizadas mediante CSS Grid.
* **Contacto:** formulario para enviar consultas a la tienda.

## Diseño y responsive

El sitio utiliza CSS para crear una interfaz sencilla y adaptada a distintos tamaños de pantalla.

Se implementaron:

* Diseño responsive mediante Media Queries.
* Flexbox para la distribución de productos y elementos de navegación.
* CSS Grid para la sección de reseñas.
* Google Fonts para la tipografía.
* Efectos hover en botones y enlaces.
* Imágenes y recursos gráficos propios del proyecto.

## Formulario de contacto

El formulario de contacto fue integrado con **Formspree**, permitiendo recibir los mensajes enviados desde la página.

El formulario solicita:

* Nombre
* Correo electrónico
* Mensaje

Además, el formulario es **validado con JavaScript** antes de enviarse: comprueba que los campos no estén vacíos y que el correo tenga un formato válido, mostrando mensajes de error junto a cada campo.

## API de productos

Los productos se consumen desde una API REST en formato JSON (`productos.json`) utilizando la **Fetch API** con `async/await`.

* Cada producto se renderiza en el DOM como una card con imagen, título, precio y botón de compra.
* Se muestran estados de carga y de error (con botón de reintento) mientras se obtienen los datos.

## Carrito de compras

* Botón en el encabezado con **contador dinámico** de productos.
* Panel lateral (drawer) con la lista de productos, cantidad, precio unitario, subtotal y **total dinámico**.
* Se pueden **agregar, modificar cantidades, eliminar y vaciar** el carrito.
* El estado se guarda en **localStorage**, por lo que persiste al actualizar o cerrar la página.
* Botón de **compra simulada** que muestra una confirmación y vacía el carrito.

## Accesibilidad y SEO

* Imágenes con texto alternario (`alt`) descriptivo.
* Navegación completa con **teclado** (skip link, foco visible, panel del carrito con `Esc` y trap de foco).
* Regiones en vivo (`aria-live`) para anunciar cambios del carrito y del formulario.
* Metaetiquetas SEO: descripción, keywords, robots, canonical y Open Graph.
* Estructura de encabezados jerárquica (`h1` → `h2` → `h3`).

## Recursos multimedia

El proyecto incorpora imágenes de instrumentos musicales y un recurso gráfico SVG utilizado como logo y favicon.

## Publicación

El proyecto se encuentra versionado mediante **Git** y será publicado utilizando **GitHub Pages**.
