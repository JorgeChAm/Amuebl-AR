const GROSOR = 0.018;
const GROSOR_FONDO = 0.006;
const ESCALA_TEXTURA = 0.6;
const MARGEN = 2.2;

const IMAGENES = { logo: 'imagenes/logo.svg', whatsapp: 'imagenes/whatsapp.svg' };

const ACABADOS = {
  pino: { nombre: 'Pino', color: '#d8b57a', precio: 350, textura: 'texturas/pino.jpg' },
  cedro: { nombre: 'Cedro', color: '#b0663f', precio: 650, textura: 'texturas/cedro.jpg' },
  nogal: { nombre: 'Nogal', color: '#5a3b28', precio: 900, textura: 'texturas/nogal.jpg' },
  blanco: { nombre: 'Blanco laqueado', color: '#f1efea', precio: 550, textura: 'texturas/blanco.jpg' }
};

// Medidas y límites en cm: [ancho, alto, fondo]. repisas = [mínimo, máximo, inicial].
const MUEBLES = {
  mesa: { nombre: 'Mesa', medidas: [120, 75, 70], limites: [[60, 300], [40, 110], [40, 120]] },
  escritorio: { nombre: 'Escritorio', medidas: [120, 75, 60], limites: [[70, 250], [60, 90], [40, 90]] },
  librero: {
    nombre: 'Librero', medidas: [90, 180, 30], limites: [[40, 250], [60, 250], [20, 60]],
    repisas: [1, 6, 4], puertas: true
  },
  closet: {
    nombre: 'Closet', medidas: [120, 200, 55], limites: [[60, 300], [150, 260], [40, 70]],
    repisas: [1, 4, 2], puertas: true
  },
  repisa: { nombre: 'Repisa', medidas: [100, 90, 25], limites: [[30, 250], [30, 250], [15, 50]], repisas: [2, 6, 3] }
};
