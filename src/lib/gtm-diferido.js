/*
 * GTM y GA4 pesan unos 320 KiB de JavaScript y competían con el
 * contenido por la red y el hilo principal. Se cargan con la primera
 * interacción (tocar, hacer scroll, teclear o mover el ratón) o, si la
 * visita no interactúa, a los CARGA_DIFERIDA_MS de terminar de cargar
 * la página, para que la página vista se siga registrando.
 *
 * Los disparadores de conversión del contenedor son clics en enlaces a
 * WhatsApp. Si ese clic es justo la interacción que dispara la carga,
 * GTM todavía no está escuchando; por eso se guarda y se le vuelve a
 * presentar cuando el contenedor ya arrancó.
 */
(function (w, d) {
  var CARGA_DIFERIDA_MS = 5000;
  var INTERACCIONES = [
    'pointerdown',
    'touchstart',
    'keydown',
    'scroll',
    'mousemove',
  ];
  var cargado = false;
  var listo = false;
  var clicsPendientes = [];

  w.dataLayer = w.dataLayer || [];

  function recordarClic(evento) {
    if (listo || !evento.isTrusted) return;
    var enlace = evento.target.closest && evento.target.closest('a[href]');
    if (enlace) clicsPendientes.push(enlace);
  }

  function repetirClics() {
    listo = true;
    clicsPendientes.forEach(function (enlace) {
      var sinNavegar = function (evento) {
        evento.preventDefault();
      };
      enlace.addEventListener('click', sinNavegar, { once: true });
      enlace.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true })
      );
    });
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

  d.addEventListener('click', recordarClic, true);
  INTERACCIONES.forEach(function (tipo) {
    w.addEventListener(tipo, cargar, { passive: true });
  });
  w.addEventListener('load', function () {
    setTimeout(cargar, CARGA_DIFERIDA_MS);
  });
})(window, document);
