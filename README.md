# Amuebl-AR

**Versión 3.2**

Cotizador de muebles a medida en realidad aumentada. Corre en el navegador del celular, sin instalar ninguna aplicación.

**Demo:** https://jorgecham.github.io/Amuebl-ar/

## Qué hace

1. El cliente elige un mueble (mesa, escritorio, librero, closet o repisa).
2. Ingresa ancho, alto y fondo en centímetros; el modelo 3D se reconstruye con esas medidas.
3. Elige el acabado (pino, cedro, nogal, blanco laqueado) y, según el mueble, repisas y puertas.
4. Ve un precio estimado y lo coloca en su espacio a escala real con el botón **Ver en mi espacio**.
5. Envía la configuración al carpintero por WhatsApp.

La primera vez se muestra una guía visual con dibujos; el botón **?** la vuelve a abrir, también dentro de la experiencia de realidad aumentada.

## Personalización por enlace

El carpintero comparte un enlace con parámetros:

`?taller=Nombre del taller&wa=5215512345678&v=2026-12-31`

| Parámetro | Función |
|---|---|
| `taller` | Nombre que se muestra en la página |
| `wa` | Número de WhatsApp que recibe la cotización (con código de país) |
| `v` | Fecha de vigencia (AAAA-MM-DD); después de ella el enlace muestra que venció |

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Estructura de la página |
| `css/estilos.css` | Estilos, con modo claro y oscuro |
| `js/config.js` | Acabados, precios, margen, medidas iniciales y límites de cada mueble |
| `js/muebles.js` | Geometría de los muebles (lista de tableros) y cálculo del precio |
| `js/glb.js` | Generación del modelo 3D en formato GLB, con textura |
| `js/app.js` | Interfaz, eventos, parámetros del enlace y envío por WhatsApp |
| `imagenes/` | Logo del taller e ícono de WhatsApp (reemplazables) |
| `texturas/` | Imágenes de madera de cada acabado (reemplazables) |
| `prototipos/` | Prototipos iniciales: visor y reescalado de un cubo |

## Tecnología

HTML, CSS y JavaScript; [Google model-viewer](https://modelviewer.dev/) para la realidad aumentada (WebXR); GitHub Pages para el alojamiento con HTTPS. Los muebles se generan por código a partir de tableros de grosor fijo y se exportan en memoria como archivos GLB.

## Mantenimiento

- **Precios:** en `js/config.js`, cada acabado tiene su precio por m² de tablero (`precio`) y la constante `MARGEN` cubre mano de obra y utilidad.
- **Texturas:** reemplazar las imágenes de `texturas/` conservando el nombre (JPG cuadrado de 512 a 1024 px).
- **Nuevo mueble:** agregar su entrada en `MUEBLES` (`js/config.js`) y su función en `GEOMETRIA` (`js/muebles.js`).

## Limitaciones

- La experiencia completa requiere Android con Chrome y soporte de ARCore; en iPhone la versión es limitada.
- La precisión del tamaño en AR depende de la detección del espacio del celular y puede variar algunos centímetros.
- La repisa se coloca en pared de forma experimental y puede desplazarse al acercarse.
- La detección del piso depende de la luz y de la textura de la superficie: en pisos lisos o brillantes puede tardar.
- El color en pantalla y el precio son aproximados.
- El enlace con vigencia es un control ligero, no una autenticación.
