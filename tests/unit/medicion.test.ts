import { afterEach, describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';
import { GTM_ID, HOSTS_PRODUCCION, scriptMedicion } from '@/lib/medicion';

type Evento = Record<string, unknown>;
type VentanaMedida = Window & { dataLayer?: Evento[] };

const ventanas: Window[] = [];

// Cada prueba corre el script real en una ventana nueva, para que los
// listeners de una no contaminen a la siguiente.
function abrir(url: string, hosts?: readonly string[]): VentanaMedida {
  const ventana = new Window({
    url,
    settings: {
      disableJavaScriptFileLoading: true,
      handleDisabledFileLoadingAsSuccess: true,
    },
  }) as VentanaMedida;
  ventanas.push(ventana);
  ventana.document.body.innerHTML = `
    <header data-ubicacion="encabezado">
      <a id="wa" href="https://wa.me/573016963313?text=Hola" target="_blank">WhatsApp</a>
    </header>
    <section data-ubicacion="portada_inicio">
      <a id="cita" href="https://wa.me/573016963313" data-evento="agendar_cita">
        <span id="cita-texto">Agenda tu cita</span>
      </a>
    </section>
    <footer data-ubicacion="pie_contacto">
      <a id="tel" href="tel:+573173095159">+57 317 309 5159</a>
      <a id="api" href="https://api.whatsapp.com/send?phone=573016963313">WA</a>
      <a id="mail" href="mailto:info@rivera-refrigeracion.com">Correo</a>
    </footer>
    <a id="suelto" href="https://wa.me/573016963313">WhatsApp</a>
    <div class="woot-widget-holder woot--hide"></div>
  `;
  // Que los clics de prueba no intenten navegar.
  ventana.addEventListener('click', (evento) => evento.preventDefault());
  new Function('window', 'document', scriptMedicion(hosts))(
    ventana,
    ventana.document
  );
  return ventana;
}

// Marcado como confiable, igual que el de una persona: el cargador sólo
// guarda para repetirle a GTM los clics reales.
function clic(ventana: Window, selector: string): void {
  const evento = new ventana.MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(evento, 'isTrusted', { value: true });
  ventana.document.querySelector(selector)!.dispatchEvent(evento);
}

function eventos(ventana: VentanaMedida, nombre?: string): Evento[] {
  return (ventana.dataLayer ?? []).filter(
    (dato) => !nombre || dato.event === nombre
  );
}

function scriptsGtm(ventana: Window): number {
  return ventana.document.querySelectorAll('script[src*="googletagmanager"]')
    .length;
}

afterEach(async () => {
  await Promise.all(ventanas.splice(0).map((v) => v.happyDOM.close()));
});

describe('HOSTS_PRODUCCION', () => {
  it('should only include the production domain and its www', () => {
    expect([...HOSTS_PRODUCCION].sort()).toEqual([
      'rivera-refrigeracion.com',
      'www.rivera-refrigeracion.com',
    ]);
  });
});

describe('scriptMedicion', () => {
  it('should fill in the hosts and the container id', () => {
    const script = scriptMedicion();

    expect(script).toContain(GTM_ID);
    expect(script).toContain(HOSTS_PRODUCCION.join(','));
    expect(script).not.toMatch(/__[A-Z_]+__/);
  });

  it('should drop the header comment before inlining', () => {
    expect(scriptMedicion().trimStart().startsWith('/*')).toBe(false);
  });
});

describe('Filtro por host', () => {
  it.each([
    'http://localhost:4321/',
    'http://127.0.0.1:4500/',
    'https://deploy-preview-37--rivera-refrigeracion.netlify.app/',
    'https://68d1f0a2c3b4e5000812ab34--rivera-refrigeracion.netlify.app/',
    'https://rivera-refrigeracion.netlify.app/',
    'https://rivera-refrigeracion.com.evil.test/',
  ])('should not touch the dataLayer on %s', (url) => {
    const ventana = abrir(url);
    clic(ventana, '#wa');
    ventana.dispatchEvent(new ventana.Event('scroll'));

    expect(ventana.dataLayer).toBeUndefined();
    expect(scriptsGtm(ventana)).toBe(0);
  });

  it.each([
    'https://rivera-refrigeracion.com/',
    'https://www.rivera-refrigeracion.com/',
  ])('should measure on %s', (url) => {
    const ventana = abrir(url);

    expect(ventana.dataLayer).toEqual([]);
  });

  it('should follow a custom host list', () => {
    expect(abrir('https://ejemplo.test/', ['ejemplo.test']).dataLayer).toEqual(
      []
    );
    expect(
      abrir('https://rivera-refrigeracion.com/', ['ejemplo.test']).dataLayer
    ).toBeUndefined();
  });

  it('should honor the test host override', () => {
    const ventana = new Window({ url: 'http://localhost:4500/' });
    ventanas.push(ventana);
    Object.assign(ventana, { __hostMedicion: 'rivera-refrigeracion.com' });
    new Function('window', 'document', scriptMedicion())(
      ventana,
      ventana.document
    );

    expect((ventana as VentanaMedida).dataLayer).toEqual([]);
  });
});

describe('Encolado de eventos', () => {
  const PRODUCCION = 'https://rivera-refrigeracion.com/servicios/neveras/';

  it('should not load GTM before any interaction', () => {
    const ventana = abrir(PRODUCCION);

    expect(scriptsGtm(ventana)).toBe(0);
  });

  it('should queue a WhatsApp click behind gtm.js when GTM is not loaded', () => {
    const ventana = abrir(PRODUCCION);
    clic(ventana, '#wa');

    expect(ventana.dataLayer!.map((dato) => dato.event)).toEqual([
      'gtm.js',
      'contacto_whatsapp',
    ]);
    expect(eventos(ventana, 'contacto_whatsapp')[0]).toEqual({
      event: 'contacto_whatsapp',
      ubicacion: 'encabezado',
      numero: '573016963313',
      pagina: '/servicios/neveras/',
    });
    expect(scriptsGtm(ventana)).toBe(1);
  });

  it('should not duplicate the event when the click is replayed for GTM', async () => {
    const ventana = abrir(PRODUCCION);
    clic(ventana, '#wa');
    ventana.document
      .querySelector('script[src*="googletagmanager"]')!
      .dispatchEvent(new ventana.Event('load'));
    await new Promise((resolver) => setTimeout(resolver, 10));
    clic(ventana, '#tel');

    expect(eventos(ventana, 'contacto_whatsapp')).toHaveLength(1);
    expect(eventos(ventana, 'contacto_llamada')).toHaveLength(1);
    expect(eventos(ventana, 'gtm.js')).toHaveLength(1);
    expect(scriptsGtm(ventana)).toBe(1);
  });

  it('should send contacto_llamada for tel: links', () => {
    const ventana = abrir(PRODUCCION);
    clic(ventana, '#tel');

    expect(eventos(ventana, 'contacto_llamada')).toEqual([
      {
        event: 'contacto_llamada',
        ubicacion: 'pie_contacto',
        numero: '573173095159',
        pagina: '/servicios/neveras/',
      },
    ]);
  });

  it('should read the number from api.whatsapp.com links', () => {
    const ventana = abrir(PRODUCCION);
    clic(ventana, '#api');

    expect(eventos(ventana, 'contacto_whatsapp')[0]).toMatchObject({
      numero: '573016963313',
      ubicacion: 'pie_contacto',
    });
  });

  it('should send agendar_cita along with contacto_whatsapp from the inner text', () => {
    const ventana = abrir(PRODUCCION);
    clic(ventana, '#cita-texto');

    expect(eventos(ventana, 'contacto_whatsapp')).toHaveLength(1);
    expect(eventos(ventana, 'agendar_cita')).toEqual([
      {
        event: 'agendar_cita',
        ubicacion: 'portada_inicio',
        numero: '573016963313',
        pagina: '/servicios/neveras/',
      },
    ]);
  });

  it('should mark links outside any data-ubicacion', () => {
    const ventana = abrir(PRODUCCION);
    clic(ventana, '#suelto');

    expect(eventos(ventana, 'contacto_whatsapp')[0]).toMatchObject({
      ubicacion: 'sin_ubicacion',
    });
  });

  it('should ignore links that are not contact links', () => {
    const ventana = abrir(PRODUCCION);
    clic(ventana, '#mail');

    expect(eventos(ventana).filter((dato) => dato.event !== 'gtm.js')).toEqual(
      []
    );
  });
});

describe('Apertura del chat', () => {
  it('should send contacto_chat once, the first time the widget opens', async () => {
    const ventana = abrir('https://rivera-refrigeracion.com/blog/');
    const contenedor = ventana.document.querySelector('.woot-widget-holder')!;
    ventana.dispatchEvent(new ventana.Event('chatwoot:ready'));

    await new Promise((resolver) => setTimeout(resolver, 10));
    expect(eventos(ventana, 'contacto_chat')).toHaveLength(0);

    contenedor.classList.remove('woot--hide');
    await new Promise((resolver) => setTimeout(resolver, 10));
    contenedor.classList.add('woot--hide');
    await new Promise((resolver) => setTimeout(resolver, 10));
    contenedor.classList.remove('woot--hide');
    await new Promise((resolver) => setTimeout(resolver, 10));

    expect(eventos(ventana, 'contacto_chat')).toEqual([
      { event: 'contacto_chat', pagina: '/blog/' },
    ]);
  });
});
