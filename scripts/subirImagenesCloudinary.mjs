// scripts/subirImagenesCloudinary.mjs
// Sube todas las fotos de jugadores a Cloudinary
//
// Uso:
//   CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=yyy CLOUDINARY_API_SECRET=zzz node scripts/subirImagenesCloudinary.mjs
//
// O crea un .env.local con esas variables y ejecuta:
//   node --env-file=.env.local scripts/subirImagenesCloudinary.mjs

import { v2 as cloudinary } from 'cloudinary';
import { readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY     = process.env.CLOUDINARY_API_KEY;
const API_SECRET  = process.env.CLOUDINARY_API_SECRET;
const IMAGES_DIR  = './public/images/jugadores';
const FOLDER      = 'estadio-fantasy/jugadores';

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('Faltan variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

if (!existsSync(IMAGES_DIR)) {
  console.error(`No existe la carpeta: ${IMAGES_DIR}`);
  process.exit(1);
}

const archivos = readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg'));
console.log(`Subiendo ${archivos.length} imágenes a Cloudinary (carpeta: ${FOLDER})...\n`);

let subidas = 0;
let fallidas = 0;
let yaExistian = 0;

for (const archivo of archivos) {
  const idJugador = basename(archivo, '.jpg');
  const publicId  = `${FOLDER}/${idJugador}`;
  const ruta      = join(IMAGES_DIR, archivo);

  try {
    // use_filename=false para que el public_id sea exactamente el que pasamos
    await cloudinary.uploader.upload(ruta, {
      public_id:           publicId,
      overwrite:           false,   // no sobreescribir si ya existe
      resource_type:       'image',
      use_filename:        false,
    });
    subidas++;
    process.stdout.write(`[${subidas + yaExistian}/${archivos.length}] ✓ ${idJugador}\n`);
  } catch (err) {
    if (err?.error?.http_code === 409 || err?.message?.includes('already exists')) {
      yaExistian++;
    } else {
      fallidas++;
      console.error(`✗ Error ${idJugador}: ${err?.message ?? err}`);
    }
  }
}

console.log(`\n=== Completado ===`);
console.log(`  Subidas:     ${subidas}`);
console.log(`  Ya existían: ${yaExistian}`);
console.log(`  Fallidas:    ${fallidas}`);
console.log(`\nURL base: https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${FOLDER}/{idJugador}.jpg`);
