import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [url = 'http://localhost:4401/', label = 'despues'] =
  process.argv.slice(2);
const directory = 'docs/rediseno-astra';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.route(
      /googletagmanager|google-analytics|analytics.google/,
      (route) => route.abort()
    );
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    // El recorrido carga las imágenes diferidas antes de la captura completa.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      await Promise.all(
        [...document.images].map((img) => img.decode().catch(() => {}))
      );
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(700);
    await page.screenshot({
      path: `${directory}/${label}-${name}.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `${directory}/${label}-${name}-portada.png`,
    });
    await page.close();
  }
} finally {
  await browser.close();
}
