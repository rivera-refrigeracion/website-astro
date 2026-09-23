/*
 * Sólo se mide en producción. Las visitas de localhost y de las vistas
 * previas de Netlify se mezclaban con las reales en GA4, así que en
 * cualquier host fuera de HOSTS_PRODUCCION (src/lib/medicion.ts) no se
 * carga GTM ni se toca el dataLayer. Las pruebas E2E fijan
 * window.__hostMedicion para comportarse como producción.
 *
 * GTM y GA4 pesan unos 320 KiB de JavaScript y competían con el
 * contenido por la red y el hilo principal. Se cargan con la primera
 * interacción (tocar, hacer scroll, teclear o mover el ratón) o, si la
 * visita no interactúa, a los CARGA_DIFERIDA_MS de terminar de cargar
 * la página, para que la página vista se siga registrando.
 *
 * Las conversiones se envían como eventos propios al dataLayer
 * (contacto_whatsapp, contacto_llamada, contacto_chat, agendar_cita).
 * Mientras GTM no ha llegado, el dataLayer es un arreglo normal que hace
 * de cola: GTM procesa en orden todo lo que encuentra al arrancar.
 *
 * Los disparadores antiguos del contenedor son clics en enlaces a
 * WhatsApp. Si ese clic es justo la interacción que dispara la carga,
 * GTM todavía no está escuchando; por eso se guarda y se le vuelve a
 * presentar cuando el contenedor ya arrancó.
 */
(function (w, d) {
  var HOSTS_PRODUCCION = '__HOSTS_PRODUCCION__'.split(',');
  var host = w.__hostMedicion || w.location.hostname;
  if (HOSTS_PRODUCCION.indexOf(host) === -1) return;

  var CARGA_DIFERIDA_MS = 5000;
  var INTERACCIONES = [
    'pointerdown',
    'touchstart',
    'keydown',
    'scroll',
    'mousemove',
  ];
  var HOSTS_WHATSAPP = ['wa.me', 'api.whatsapp.com'];
  var cargado = false;
  var listo = false;
  var repitiendo = false;
  var clicsPendientes = [];

  w.dataLayer = w.dataLayer || [];

  function recordarClic(evento) {
    if (listo || !evento.isTrusted) return;
    var enlace = evento.target.closest && evento.target.closest('a[href]');
    if (enlace) clicsPendientes.push(enlace);
  }

  function repetirClics() {
    listo = true;
    repitiendo = true;
    clicsPendientes.forEach(function (enlace) {
      var sinNavegar = function (evento) {
        evento.preventDefault();
      };
      enlace.addEventListener('click', sinNavegar, { once: true });
      enlace.dispatchEvent(
        new w.MouseEvent('click', { bubbles: true, cancelable: true })
      );
    });
    repitiendo = false;
    clicsPendientes = [];
    d.removeEventListener('click', recordarClic, true);
  }

  function cargar() {
    if (cargado) return;
    cargado = true;
    INTERACCIONES.forEach(function (tipo) {
      w.removeEventListener(tipo, cargar, { passive: true });
    });

    w.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
    var script = d.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + '__GTM_ID__';
    script.onload = function () {
      setTimeout(repetirClics, 0);
    };
    d.head.appendChild(script);
  }

  // Se arranca GTM antes de encolar para que 'gtm.js' quede delante del
  // evento: la etiqueta de configuración de GA4 se dispara con él.
  function enviar(nombre, datos) {
    cargar();
    datos.event = nombre;
    datos.pagina = w.location.pathname;
    w.dataLayer.push(datos);
  }

  function contacto(enlace) {
    var url;
    try {
      url = new URL(enlace.href);
    } catch (error) {
      return null;
    }
    if (url.protocol === 'tel:') {
      return {
        evento: 'contacto_llamada',
        numero: url.pathname.replace(/\D/g, ''),
      };
    }
    if (HOSTS_WHATSAPP.indexOf(url.hostname) !== -1) {
      var numero =
        url.hostname === 'wa.me'
          ? url.pathname.slice(1)
          : url.searchParams.get('phone') || '';
      return {
        evento: 'contacto_whatsapp',
        numero: numero.replace(/\D/g, ''),
      };
    }
    return null;
  }

  function medirClic(evento) {
    if (repitiendo || !evento.target.closest) return;
    var elemento = evento.target.closest('a[href], [data-evento]');
    if (!elemento) return;

    var zona = elemento.closest('[data-ubicacion]');
    var ubicacion = zona
      ? zona.getAttribute('data-ubicacion')
      : 'sin_ubicacion';
    var destino = elemento.href ? contacto(elemento) : null;

    if (destino) {
      enviar(destino.evento, { ubicacion: ubicacion, numero: destino.numero });
    }
    var propio = elemento.getAttribute('data-evento');
    if (propio) {
      enviar(propio, {
        ubicacion: ubicacion,
        numero: destino ? destino.numero : '',
      });
    }
  }

  // El SDK de Chatwoot no emite un evento de apertura: sólo alterna la
  // clase woot--hide del contenedor del chat. Se cuenta la primera
  // apertura de cada página, ya sea desde la burbuja propia o la del SDK.
  function medirChat() {
    var contenedor = d.querySelector('.woot-widget-holder');
    if (!contenedor) return;
    var observador = new w.MutationObserver(revisar);
    function revisar() {
      if (contenedor.classList.contains('woot--hide')) return;
      observador.disconnect();
      enviar('contacto_chat', {});
    }
    observador.observe(contenedor, {
      attributes: true,
      attributeFilter: ['class'],
    });
    revisar();
  }

  d.addEventListener('click', recordarClic, true);
  d.addEventListener('click', medirClic, true);
  w.addEventListener('chatwoot:ready', medirChat, { once: true });
  INTERACCIONES.forEach(function (tipo) {
    w.addEventListener(tipo, cargar, { passive: true });
  });
  w.addEventListener('load', function () {
    setTimeout(cargar, CARGA_DIFERIDA_MS);
  });
})(window, document);
