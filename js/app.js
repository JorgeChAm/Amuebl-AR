const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const estado = { mueble: 'mesa', acabado: 'pino', url: null, mensaje: '', temporizador: null };
const texturas = {};
const CAMPOS = ['ancho', 'alto', 'fondo'];

function enlaceVencido() {
  const vence = params.get('v');
  return Boolean(vence) && new Date() > new Date(`${vence}T23:59:59`);
}

function mostrarVencido() {
  $('app').innerHTML = '<div class="tarjeta" id="vencido"><h1>Este enlace ya venció</h1>' +
    '<p class="subtitulo">Pide a tu carpintero un enlace nuevo para volver a cotizar.</p></div>';
}

function medidasValidas(medidas, limites) {
  return medidas.every((valor, i) => valor >= limites[i][0] && valor <= limites[i][1]);
}

function armarMensaje(config, medidas, acabado, repisas, puertas, precio) {
  const extras = [config.repisas ? `${repisas} repisas` : '', puertas ? 'con puertas' : ''].filter(Boolean);
  const detalle = [`acabado ${acabado.nombre}`, ...extras].join(', ');
  return `Hola, quiero cotizar: ${config.nombre} de ${medidas.join(' × ')} cm, ${detalle}. ` +
    `Precio estimado: $${precio} (sujeto a confirmación).`;
}

function dibujar() {
  const config = MUEBLES[estado.mueble];
  const medidas = CAMPOS.map(id => Number($(id).value));
  const valido = medidasValidas(medidas, config.limites);
  const [a, h, f] = config.limites.map(l => l.join('–'));
  $('error').textContent = valido ? '' : `Medidas permitidas: ancho ${a}, alto ${h}, fondo ${f} cm.`;
  $('enviar').disabled = !valido;
  if (!valido) return;

  const repisas = config.repisas ? Number($('repisas').value) : 0;
  const puertas = config.puertas ? Number($('puertas').value) : 0;
  const piezas = GEOMETRIA[estado.mueble](...medidas.map(cm => cm / 100), repisas, puertas);
  const acabado = ACABADOS[estado.acabado];
  const precio = precioEstimado(piezas, acabado).toLocaleString('es-MX');

  if (estado.url) URL.revokeObjectURL(estado.url);
  const modelo = crearGLB(piezas, colorLineal(acabado.color), texturas[estado.acabado]);
  estado.url = URL.createObjectURL(new Blob([modelo], { type: 'model/gltf-binary' }));
  $('visor').src = estado.url;
  $('precio-valor').textContent = `$${precio} MXN`;
  estado.mensaje = armarMensaje(config, medidas, acabado, repisas, puertas, precio);
}

function llenarRepisas([min, max, inicial]) {
  const select = $('repisas');
  select.innerHTML = '';
  for (let n = min; n <= max; n++) select.add(new Option(n, n));
  select.value = inicial;
}

function cambiarMueble(clave) {
  estado.mueble = clave;
  marcarActivo('mueble', 'mueble', clave);
  const config = MUEBLES[estado.mueble];
  CAMPOS.forEach((id, i) => { $(id).value = config.medidas[i]; });
  $('grupo-repisas').style.display = config.repisas ? '' : 'none';
  $('grupo-puertas').style.display = config.puertas ? '' : 'none';
  if (config.repisas) llenarRepisas(config.repisas);
  $('puertas').value = config.puertas ? 1 : 0;
  dibujar();
}

function marcarActivo(contenedor, atributo, valor) {
  document.querySelectorAll(`#${contenedor} button`).forEach(boton => {
    boton.classList.toggle('activo', boton.dataset[atributo] === valor);
  });
}

function configurarImagenes() {
  [['logo', IMAGENES.logo], ['icono-whatsapp', IMAGENES.whatsapp]].forEach(([id, ruta]) => {
    const img = $(id);
    img.addEventListener('error', () => { img.hidden = true; });
    img.src = ruta;
  });
}

function precargarTexturas() {
  Object.entries(ACABADOS).forEach(([clave, acabado]) => {
    fetch(acabado.textura)
      .then(respuesta => (respuesta.ok ? respuesta.arrayBuffer() : null))
      .then(datos => {
        if (!datos) return;
        texturas[clave] = datos;
        if (clave === estado.acabado) dibujar();
      })
      .catch(() => {});
  });
}

function iniciar() {
  configurarImagenes();
  const taller = params.get('taller');
  if (taller) $('titulo').textContent = document.title = taller;
  if (enlaceVencido()) return mostrarVencido();

  const numero = (params.get('wa') || '525500000000').replace(/\D/g, '');
  $('mueble').innerHTML = Object.entries(MUEBLES).map(([clave, m]) =>
    `<button data-mueble="${clave}">${m.nombre}</button>`).join('');
  $('acabados').innerHTML = Object.entries(ACABADOS).map(([clave, a]) =>
    `<button data-acabado="${clave}"><i style="background-color:${a.color};background-image:url(${a.textura})"></i>${a.nombre}</button>`).join('');

  $('mueble').addEventListener('click', evento => {
    const boton = evento.target.closest('button');
    if (boton) cambiarMueble(boton.dataset.mueble);
  });
  [...CAMPOS, 'repisas', 'puertas'].forEach(id => $(id).addEventListener('input', () => {
    clearTimeout(estado.temporizador);
    estado.temporizador = setTimeout(dibujar, 250);
  }));
  $('acabados').addEventListener('click', evento => {
    const boton = evento.target.closest('button');
    if (!boton) return;
    estado.acabado = boton.dataset.acabado;
    marcarActivo('acabados', 'acabado', estado.acabado);
    dibujar();
  });
  $('enviar').addEventListener('click', () => {
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(estado.mensaje)}`, '_blank');
  });

  precargarTexturas();
  marcarActivo('acabados', 'acabado', estado.acabado);
  cambiarMueble(estado.mueble);
}

iniciar();
