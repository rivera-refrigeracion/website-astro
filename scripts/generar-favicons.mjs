/**
 * Genera los favicons servidos desde el logo original de la marca.
 *
 * El sitio venía sirviendo el logo de 1080x1080 (911 KiB) declarado como icono
 * de 32x32, y el mismo archivo otra vez como apple-touch-icon: 1,8 MB por
 * página sólo en iconos, y la causa dominante del LCP móvil de 7,9 s medido en
 * la auditoría del 2026-09-22 (hallazgos A3 y B3).
 *
 * Uso: node scripts/generar-favicons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = resolve(raiz, 'src/assets/brand/logo-mark.png');

/** Blanco de fondo para iOS, que no respeta la transparencia del icono. */
const FONDO_IOS = { r: 255, g: 255, b: 255, alpha: 1 };

const salidas = [
  { archivo: 'public/favicon.png', tamano: 32, formato: 'png' },
  { archivo: 'public/favicon.webp', tamano: 48, formato: 'webp' },
  {
    archivo: 'public/apple-touch-icon.png',
    tamano: 180,
    formato: 'png',
    fondo: FONDO_IOS,
  },
];

// El logo trae un margen transparente que a 32 px se come la mitad del icono.
const marca = sharp(ORIGEN).trim();

for (const { archivo, tamano, formato, fondo } of salidas) {
  let tuberia = marca.clone().resize(tamano, tamano, {
    fit: 'contain',
    background: fondo ?? { r: 0, g: 0, b: 0, alpha: 0 },
  });

  if (fondo) tuberia = tuberia.flatten({ background: fondo });

  const buffer = await tuberia
    [formato](
      // paleta: el logo es un degradado suave, 256 colores bastan y recortan
      // el apple-touch-icon de 72 KiB a menos de 10 KiB
      formato === 'png'
        ? { compressionLevel: 9, palette: true, quality: 90 }
        : { quality: 90 }
    )
    .toBuffer();

  const destino = resolve(raiz, archivo);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, buffer);

  console.log(
    `${archivo}  ${tamano}x${tamano}  ${(buffer.length / 1024).toFixed(1)} KiB`
  );
}
