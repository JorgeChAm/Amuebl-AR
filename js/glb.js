const CARAS = [[4, 5, 7, 6], [1, 0, 2, 3], [1, 3, 7, 5], [0, 4, 6, 2], [2, 6, 7, 3], [0, 1, 5, 4]];
const NORMALES = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];
const EJE_NORMAL = [2, 2, 0, 0, 1, 1];

function colorLineal(hex) {
  return [1, 3, 5].map(i => Math.pow(parseInt(hex.substr(i, 2), 16) / 255, 2.2));
}

function generarMalla(piezas) {
  const posiciones = [], normales = [], uv = [], madera = [], metal = [];
  for (const q of piezas) {
    const dim = [q[3] - q[0], q[4] - q[1], q[5] - q[2]];
    const veta = dim.indexOf(Math.max(...dim));
    const indices = q[6] === 'metal' ? metal : madera;
    CARAS.forEach((cara, i) => {
      const inicio = posiciones.length / 3;
      const ejes = [0, 1, 2].filter(a => a !== EJE_NORMAL[i]);
      const u = ejes.includes(veta) ? veta : ejes[0];
      const v = ejes.find(a => a !== u);
      for (const c of cara) {
        const p = [c & 1 ? q[3] : q[0], c & 2 ? q[4] : q[1], c & 4 ? q[5] : q[2]];
        posiciones.push(...p);
        normales.push(...NORMALES[i]);
        uv.push(p[u] / ESCALA_TEXTURA, p[v] / ESCALA_TEXTURA);
      }
      indices.push(inicio, inicio + 1, inicio + 2, inicio, inicio + 2, inicio + 3);
    });
  }
  return { posiciones, normales, uv, madera, metal };
}

function crearGLB(piezas, color, imagen) {
  const { posiciones, normales, uv, madera, metal } = generarMalla(piezas);
  const indices = [...madera, ...metal];
  const eje = a => posiciones.filter((_, i) => i % 3 === a);
  const min = [0, 1, 2].map(a => Math.min(...eje(a)));
  const max = [0, 1, 2].map(a => Math.max(...eje(a)));

  const bytesIndices = indices.length * 2;
  const offIndices = Math.ceil(bytesIndices / 4) * 4;
  const bytesPos = posiciones.length * 4;
  const bytesUV = uv.length * 4;
  const bytesImagen = imagen ? imagen.byteLength : 0;
  const offUV = offIndices + bytesPos * 2;
  const total = offUV + bytesUV + Math.ceil(bytesImagen / 4) * 4;

  const material = { metallicFactor: 0, roughnessFactor: 0.7, baseColorFactor: imagen ? [1, 1, 1, 1] : [...color, 1] };
  if (imagen) material.baseColorTexture = { index: 0 };

  const gltf = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 1, NORMAL: 2, TEXCOORD_0: 3 }, indices: 0, material: 0 }] }],
    materials: [{ pbrMetallicRoughness: material }],
    accessors: [
      { bufferView: 0, componentType: 5123, count: madera.length, type: 'SCALAR' },
      { bufferView: 1, componentType: 5126, count: posiciones.length / 3, type: 'VEC3', min, max },
      { bufferView: 2, componentType: 5126, count: normales.length / 3, type: 'VEC3' },
      { bufferView: 3, componentType: 5126, count: uv.length / 2, type: 'VEC2' }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: bytesIndices, target: 34963 },
      { buffer: 0, byteOffset: offIndices, byteLength: bytesPos, target: 34962 },
      { buffer: 0, byteOffset: offIndices + bytesPos, byteLength: bytesPos, target: 34962 },
      { buffer: 0, byteOffset: offUV, byteLength: bytesUV, target: 34962 }
    ],
    buffers: [{ byteLength: total }]
  };
  if (metal.length) {
    const atributos = gltf.meshes[0].primitives[0].attributes;
    gltf.accessors.push({ bufferView: 0, byteOffset: madera.length * 2, componentType: 5123, count: metal.length, type: 'SCALAR' });
    gltf.meshes[0].primitives.push({ attributes: atributos, indices: 4, material: 1 });
    gltf.materials.push({ pbrMetallicRoughness: { baseColorFactor: [0.78, 0.79, 0.8, 1], metallicFactor: 0.9, roughnessFactor: 0.3 } });
  }
  if (imagen) {
    gltf.bufferViews.push({ buffer: 0, byteOffset: offUV + bytesUV, byteLength: bytesImagen });
    gltf.textures = [{ sampler: 0, source: 0 }];
    gltf.samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }];
    gltf.images = [{ bufferView: 4, mimeType: 'image/jpeg' }];
  }

  const json = new TextEncoder().encode(JSON.stringify(gltf));
  const largoJson = Math.ceil(json.length / 4) * 4;
  const salida = new ArrayBuffer(28 + largoJson + total);
  const vista = new DataView(salida);
  const bytes = new Uint8Array(salida);

  vista.setUint32(0, 0x46546c67, true);
  vista.setUint32(4, 2, true);
  vista.setUint32(8, salida.byteLength, true);
  vista.setUint32(12, largoJson, true);
  vista.setUint32(16, 0x4e4f534a, true);
  bytes.set(json, 20);
  bytes.fill(32, 20 + json.length, 20 + largoJson);

  const bin = 20 + largoJson;
  vista.setUint32(bin, total, true);
  vista.setUint32(bin + 4, 0x004e4942, true);
  const datos = bin + 8;
  new Uint16Array(salida, datos, indices.length).set(indices);
  new Float32Array(salida, datos + offIndices, posiciones.length).set(posiciones);
  new Float32Array(salida, datos + offIndices + bytesPos, normales.length).set(normales);
  new Float32Array(salida, datos + offUV, uv.length).set(uv);
  if (imagen) bytes.set(new Uint8Array(imagen), datos + offUV + bytesUV);
  return salida;
}
