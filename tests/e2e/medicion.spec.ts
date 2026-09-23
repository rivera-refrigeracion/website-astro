import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

type Evento = Record<string, unknown>;
type VentanaMedida = { dataLayer?: Evento[]; __hostMedicion?: string };

async function dataLayer(page: Page): Promise<Evento[] | undefined> {
  return page.evaluate(() => (window as unknown as VentanaMedida).dataLayer);
}

async function eventos(page: Page, nombre: string): Promise<Evento[]> {
  return ((await dataLayer(page)) ?? []).filter(
    (dato) => dato.event === nombre
  );
}

const SDK_FALSO = `
  window.chatwootSDK = {
    run: function () {
      var contenedor = document.createElement('div');
      contenedor.className = 'woot-widget-holder woot--hide';
      document.body.appendChild(contenedor);
      window.$chatwoot = {
        isOpen: false,
        toggle: function (estado) {
          this.isOpen = estado ? estado === 'open' : !this.isOpen;
          contenedor.classList.toggle('woot--hide', !this.isOpen);
        },
      };
      window.dispatchEvent(new CustomEvent('chatwoot:ready'));
    },
  };
`;

test.describe('Medición fuera de producción', () => {
  test('should not load GTM nor create the dataLayer on the local preview', async ({
    page,
  }) => {
    const pedidosGtm: string[] = [];
    page.on('request', (pedido) => {
      if (pedido.url().includes('googletagmanager.com')) {
        pedidosGtm.push(pedido.url());
      }
    });

    await page.goto('/');
    await page.mouse.move(200, 200);
    await page.mouse.wheel(0, 400);
    await page
      .locator('#sitio-header')
      .getByRole('link', { name: 'Contactar por WhatsApp' })
      .evaluate((enlace) =>
        enlace.addEventListener('click', (e) => e.preventDefault())
      );
    await page
      .locator('#sitio-header')
      .getByRole('link', { name: 'Contactar por WhatsApp' })
      .click();

    expect(await dataLayer(page)).toBeUndefined();
    await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(
      0
    );
    expect(pedidosGtm).toEqual([]);
  });
});

test.describe('Medición en producción (host simulado)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as VentanaMedida).__hostMedicion =
        'rivera-refrigeracion.com';
      // Los enlaces abren WhatsApp o el marcador; aquí sólo importa el evento.
      window.addEventListener('click', (evento) => evento.preventDefault());
    });
  });

  test('should push contacto_whatsapp after gtm.js when clicking WhatsApp', async ({
    page,
  }) => {
    // Un gtm.js vacío (nada sale hacia Google) para que el cargador termine y
    // le repita el clic a GTM: esa repetición no debe duplicar el evento.
    await page.route('**/gtm.js*', (ruta) =>
      ruta.fulfill({ contentType: 'application/javascript', body: '' })
    );
    const gtmCargado = page.waitForResponse('**/gtm.js*');
    await page.goto('/');
    await page
      .locator('#sitio-header')
      .getByRole('link', { name: 'Contactar por WhatsApp' })
      .click();
    await gtmCargado;
    await page.waitForTimeout(100);

    const datos = (await dataLayer(page)) ?? [];
    const nombres = datos.map((dato) => dato.event);
    expect(nombres.indexOf('gtm.js')).toBeGreaterThanOrEqual(0);
    expect(nombres.indexOf('gtm.js')).toBeLessThan(
      nombres.indexOf('contacto_whatsapp')
    );
    expect(await eventos(page, 'contacto_whatsapp')).toEqual([
      {
        event: 'contacto_whatsapp',
        ubicacion: 'encabezado',
        numero: '573016963313',
        pagina: '/',
      },
    ]);
    await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(
      1
    );
  });

  test('should push contacto_llamada when clicking a tel: link', async ({
    page,
  }) => {
    await page.goto('/servicios/lavadoras/');
    await page.locator('footer a[href^="tel:"]').click();
    await page.locator('main a[href^="tel:"]').click();

    expect(await eventos(page, 'contacto_llamada')).toEqual([
      {
        event: 'contacto_llamada',
        ubicacion: 'pie_contacto',
        numero: '573173095159',
        pagina: '/servicios/lavadoras/',
      },
      {
        event: 'contacto_llamada',
        ubicacion: 'servicio_cierre',
        numero: '573173095159',
        pagina: '/servicios/lavadoras/',
      },
    ]);
  });

  test('should push agendar_cita from the hero button', async ({ page }) => {
    await page.goto('/');
    await page
      .locator('[data-evento="agendar_cita"][data-ubicacion="portada_inicio"]')
      .click();

    expect(await eventos(page, 'agendar_cita')).toEqual([
      {
        event: 'agendar_cita',
        ubicacion: 'portada_inicio',
        numero: '573016963313',
        pagina: '/',
      },
    ]);
    expect(await eventos(page, 'contacto_whatsapp')).toHaveLength(1);
  });

  test('should push contacto_chat when the chat opens', async ({ page }) => {
    // Réplica mínima del SDK de Chatwoot: la apertura real sólo alterna la
    // clase woot--hide del contenedor, que es lo que observa la medición.
    // Así la prueba no depende del servidor de Chatwoot ni lo satura.
    await page.route('**/packs/js/sdk.js', (ruta) =>
      ruta.fulfill({ contentType: 'application/javascript', body: SDK_FALSO })
    );
    await page.goto('/blog/');
    await page.getByRole('button', { name: /abrir el chat/i }).click();

    await expect
      .poll(() => eventos(page, 'contacto_chat'), { timeout: 15000 })
      .toEqual([{ event: 'contacto_chat', pagina: '/blog/' }]);
  });
});
