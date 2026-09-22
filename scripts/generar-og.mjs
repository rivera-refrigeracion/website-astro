/**
 * Genera las imágenes de previsualización social (Open Graph) del sitio.
 *
 * Por qué existe: la imagen social por defecto era en realidad el HTML del 404
 * del WordPress anterior servido con content-type de JPEG, y las cuatro páginas
 * de servicio compartían el WebP cuadrado del hero. WhatsApp —el canal por el
 * que cierra este negocio— no renderiza WebP de forma fiable y descarta las
 * imágenes que no se acercan a 1200x630 (auditoría 2026-09-22, A4, A5 y B4).
 *
 * Se compone en HTML y se captura con el Chrome del sistema porque la
 * tipografía de la marca (Montserrat y Open Sans) tiene que ser la misma del
 * sitio; el renderizador de SVG de sharp no carga fuentes de archivo.
 *
 * Todo el texto que aparece en las imágenes sale de src/lib/config.ts o del
 * frontmatter de src/content/services/: no se inventa nada.
 *
 * Uso: node scripts/generar-og.mjs
 */
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const ejecutar = promisify(execFile);
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const ANCHO = 1200;
const ALTO = 630;
/** Se captura al doble y se reduce: el texto queda nítido sin subpíxeles sucios. */
const ESCALA = 2;

const CHROME = process.env.CHROME_BIN ?? '/usr/bin/google-chrome-stable';

// Paleta de src/styles/global.css
const COLORES = {
  primary700: '#1976d2',
  primary800: '#1565c0',
  primary900: '#0d47a1',
  secondary500: '#ff9800',
};

const MARCA = 'Rivera Refrigeración';
const RESPALDO = 'Más de 30 años de experiencia';
/** CONTACT.whatsapp en src/lib/config.ts, formateado como lo muestra el pie. */
const WHATSAPP = 'WhatsApp 301 696 3313';

const IMAGENES = [
  {
    archivo: 'public/images/og-default.jpg',
    titular: 'Reparación de electrodomésticos en Cali',
    apoyo: 'Aire acondicionado, neveras, lavadoras y calentadores',
  },
  {
    archivo: 'public/images/og-aire-acondicionado.jpg',
    titular: 'Aire acondicionado en Cali',
    apoyo: 'Instalación, mantenimiento y reparación a domicilio',
  },
  {
    archivo: 'public/images/og-instalacion-aire-acondicionado.jpg',
    titular: 'Instalación de aire acondicionado en Cali',
    apoyo: 'Evaluación del equipo y el espacio, presupuesto previo',
  },
  {
    archivo: 'public/images/og-neveras.jpg',
    titular: 'Reparación de neveras en Cali',
    apoyo: 'Atención a equipos LG, Samsung, Whirlpool, Haceb y Challenger',
  },
  {
    archivo: 'public/images/og-lavadoras.jpg',
    titular: 'Reparación de lavadoras en Cali',
    apoyo: 'Atención a equipos LG, Samsung, Whirlpool, Haceb y Challenger',
  },
  {
    archivo: 'public/images/og-calentadores.jpg',
    titular: 'Calentadores de agua en Cali',
    apoyo: 'Instalación, mantenimiento y reparación a domicilio',
  },
];

const aDataUri = async (ruta, tipo) =>
  `data:${tipo};base64,${(await readFile(resolve(raiz, ruta))).toString('base64')}`;

const escapar = (texto) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function plantilla({ titular, apoyo, logo, montserrat, openSans }) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<style>
  @font-face { font-family: 'Montserrat'; src: url('${montserrat}') format('woff2'); font-weight: 100 900; }
  @font-face { font-family: 'Open Sans'; src: url('${openSans}') format('woff2'); font-weight: 100 900; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${ANCHO}px; height: ${ALTO}px; overflow: hidden; position: relative;
    background: linear-gradient(135deg, ${COLORES.primary700} 0%, ${COLORES.primary800} 45%, ${COLORES.primary900} 100%);
    font-family: 'Open Sans', sans-serif; color: #fff;
  }
  /* El logo, muy tenue y sangrado por la derecha, da textura sin competir con el texto. */
  .marca-agua {
    position: absolute; right: -150px; top: 50%; transform: translateY(-50%);
    width: 620px; height: 620px; opacity: 0.1;
  }
  .contenido { position: relative; height: 100%; padding: 64px 72px; display: flex; flex-direction: column; }
  .lockup { display: flex; align-items: center; gap: 18px; }
  .lockup img { width: 72px; height: 72px; }
  .lockup span { font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 34px; letter-spacing: -0.01em; }
  .centro { flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 780px; }
  h1 {
    font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 62px;
    line-height: 1.1; letter-spacing: -0.02em; text-wrap: balance;
  }
  .regla { width: 104px; height: 6px; background: ${COLORES.secondary500}; border-radius: 3px; margin: 28px 0 24px; }
  .apoyo { font-size: 28px; line-height: 1.4; color: rgba(255,255,255,0.88); }
  .pie { display: flex; align-items: center; gap: 20px; font-size: 26px; color: rgba(255,255,255,0.92); }
  .pie strong { font-weight: 600; }
  .punto { width: 6px; height: 6px; border-radius: 50%; background: ${COLORES.secondary500}; }
</style></head>
<body>
  <img class="marca-agua" src="${logo}" alt="">
  <div class="contenido">
    <div class="lockup"><img src="${logo}" alt=""><span>${escapar(MARCA)}</span></div>
    <div class="centro">
      <h1>${escapar(titular)}</h1>
      <div class="regla"></div>
      <p class="apoyo">${escapar(apoyo)}</p>
    </div>
    <div class="pie">
      <strong>${escapar(WHATSAPP)}</strong><span class="punto"></span><span>${escapar(RESPALDO)}</span>
    </div>
  </div>
</body></html>`;
}

const logo = await aDataUri('src/assets/brand/logo-mark.png', 'image/png');
const montserrat = await aDataUri(
  'scripts/fonts/Montserrat-latin.woff2',
  'font/woff2'
);
const openSans = await aDataUri(
  'scripts/fonts/OpenSans-latin.woff2',
  'font/woff2'
);

const trabajo = await mkdtemp(join(tmpdir(), 'og-rivera-'));

try {
  for (const { archivo, titular, apoyo } of IMAGENES) {
    const html = join(trabajo, 'og.html');
    const captura = join(trabajo, 'og.png');
    await writeFile(
      html,
      plantilla({ titular, apoyo, logo, montserrat, openSans })
    );

    await ejecutar(CHROME, [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--default-background-color=00000000',
      `--force-device-scale-factor=${ESCALA}`,
      `--window-size=${ANCHO},${ALTO}`,
      `--screenshot=${captura}`,
      `file://${html}`,
    ]);

    const destino = resolve(raiz, archivo);
    const info = await sharp(captura)
      .resize(ANCHO, ALTO, { fit: 'cover' })
      .jpeg({ quality: 86, progressive: true, mozjpeg: true })
      .toFile(destino);

    console.log(
      `${archivo}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KiB`
    );
  }
} finally {
  await rm(trabajo, { recursive: true, force: true });
}
