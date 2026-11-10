// Cada pieza es un tablero [x0, y0, z0, x1, y1, z1] en metros; si lleva 'metal' al final es herraje.
function manija(x, centroY, z) {
  const ancho = 0.012, mitad = 0.08, saliente = 0.02, base = 0.012, poste = 0.015;
  return [
    [x, centroY - mitad, z + base, x + ancho, centroY + mitad, z + saliente, 'metal'],
    [x, centroY - mitad, z, x + ancho, centroY - mitad + poste, z + base, 'metal'],
    [x, centroY + mitad - poste, z, x + ancho, centroY + mitad, z + base, 'metal']
  ];
}

function cuerpo(ancho, alto, fondo, repisas, puertas, conFondo) {
  const x = ancho / 2;
  const z = fondo / 2;
  const frente = puertas ? z - GROSOR : z;
  const piezas = [
    [-x, 0, -z, -x + GROSOR, alto, frente],
    [x - GROSOR, 0, -z, x, alto, frente],
    [-x + GROSOR, alto - GROSOR, -z, x - GROSOR, alto, frente],
    [-x + GROSOR, 0, -z, x - GROSOR, GROSOR, frente]
  ];
  const atras = conFondo ? GROSOR_FONDO : 0;
  if (conFondo) piezas.push([-x + GROSOR, GROSOR, -z, x - GROSOR, alto - GROSOR, -z + GROSOR_FONDO]);
  for (let k = 1; k <= repisas; k++) {
    const y = GROSOR + ((alto - 2 * GROSOR) * k) / (repisas + 1) - GROSOR / 2;
    piezas.push([-x + GROSOR, y, -z + atras, x - GROSOR, y + GROSOR, frente - 0.01]);
  }
  if (puertas) {
    const centroY = Math.min(alto / 2, 1);
    const separacion = 0.03;
    piezas.push(
      [-x, 0.01, frente, -0.002, alto - 0.01, z], [0.002, 0.01, frente, x, alto - 0.01, z],
      ...manija(-separacion - 0.012, centroY, z), ...manija(separacion, centroY, z)
    );
  }
  return piezas;
}

const GEOMETRIA = {
  mesa(ancho, alto, fondo) {
    const pata = 0.06;
    const piezas = [[-ancho / 2, alto - GROSOR, -fondo / 2, ancho / 2, alto, fondo / 2]];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const cx = sx * (ancho / 2 - 0.03 - pata / 2);
        const cz = sz * (fondo / 2 - 0.03 - pata / 2);
        piezas.push([cx - pata / 2, 0, cz - pata / 2, cx + pata / 2, alto - GROSOR, cz + pata / 2]);
      }
    }
    return piezas;
  },
  escritorio(ancho, alto, fondo) {
    const x = ancho / 2 - 0.02;
    const z = fondo / 2 - 0.03;
    return [
      [-ancho / 2, alto - GROSOR, -fondo / 2, ancho / 2, alto, fondo / 2],
      [-x, 0, -z, -x + GROSOR, alto - GROSOR, z],
      [x - GROSOR, 0, -z, x, alto - GROSOR, z],
      [-x + GROSOR, alto * 0.4, -z, x - GROSOR, alto - GROSOR, -z + GROSOR_FONDO]
    ];
  },
  librero: (ancho, alto, fondo, repisas, puertas) => cuerpo(ancho, alto, fondo, repisas, puertas, true),
  closet(ancho, alto, fondo, repisas, puertas) {
    const piezas = cuerpo(ancho, alto, fondo, repisas, puertas, true);
    piezas.push([-GROSOR / 2, GROSOR, -fondo / 2 + GROSOR_FONDO, GROSOR / 2, alto - GROSOR, fondo / 2 - 0.01]);
    return piezas;
  },
  repisa: (ancho, alto, fondo, repisas) => cuerpo(ancho, alto, fondo, repisas, false, false)
};

function areaTablero(piezas) {
  const volumen = piezas.filter(q => q[6] !== 'metal').reduce((suma, q) => suma + (q[3] - q[0]) * (q[4] - q[1]) * (q[5] - q[2]), 0);
  return volumen / GROSOR;
}

function precioEstimado(piezas, acabado) {
  return Math.round((areaTablero(piezas) * acabado.precio * MARGEN) / 10) * 10;
}
