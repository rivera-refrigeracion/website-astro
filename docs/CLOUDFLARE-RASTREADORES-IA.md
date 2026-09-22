# Cloudflare: abrir el sitio a los rastreadores de IA

**Para:** Juan · **Zona:** `rivera-refrigeracion.com` · **Tiempo:** ~15 minutos
**Origen:** auditoría SEO y GEO del 2026-09-22, hallazgos A1 y M5.

Nada de lo que hay en este documento se puede hacer desde el repositorio. Cloudflare está
delante de Netlify y corta las peticiones antes de que lleguen al origen, así que ni
`public/robots.txt` ni ningún cambio en el código pueden arreglarlo. El `robots.txt` del
repositorio ya quedó listo para cuando estos ajustes estén desactivados.

---

## 1. El problema, medido

Cloudflare devuelve **403** a los rastreadores que construyen el índice de los motores de
respuesta, y deja pasar sólo a los agentes que leen la página en vivo durante una conversación.

Comprobado el 2026-09-22 contra `https://rivera-refrigeracion.com/servicios/neveras/`:

| User-agent      | Qué es                               | Hoy     |
| --------------- | ------------------------------------ | ------- |
| `GPTBot`        | Rastreador de índice de OpenAI       | **403** |
| `ClaudeBot`     | Rastreador de índice de Anthropic    | **403** |
| `CCBot`         | Common Crawl (alimenta a casi todos) | **403** |
| `Amazonbot`     | Rastreador de índice de Amazon       | **403** |
| `Bytespider`    | Rastreador de índice de ByteDance    | **403** |
| `OAI-SearchBot` | Búsqueda de ChatGPT, en vivo         | 200     |
| `ChatGPT-User`  | ChatGPT abriendo un enlace, en vivo  | 200     |
| `PerplexityBot` | Perplexity, en vivo                  | 200     |
| `Claude-User`   | Claude abriendo un enlace, en vivo   | 200     |
| `Googlebot`     | Búsqueda de Google                   | 200     |

Traducido: el cliente que llegó "por ChatGPT" entró por la única puerta abierta —alguien
preguntó y ChatGPT fue a leer la página en ese momento—. La puerta del índice, que es la que
hace que el sitio aparezca sin que nadie lo pida, está cerrada.

La respuesta que devuelve Cloudflare es `403 Your request was blocked.` con cabecera
`server: cloudflare`. No es Netlify.

---

## 2. Qué desactivar (A1)

El bloqueo viene de la función de bots de Cloudflare. El nombre exacto y la ruta del menú han
ido cambiando; busca **la primera de estas tres que exista en el panel** y desactívala.

### Opción A — el interruptor de bots de IA (lo más probable)

1. Entra a <https://dash.cloudflare.com> y elige la zona `rivera-refrigeracion.com`.
2. Ve a **Security → Bots** (en la navegación nueva puede estar en **Security → Settings**,
   pestaña _Bot traffic_).
3. Busca el interruptor llamado **"Block AI Scrapers and Crawlers"** — en versiones más
   recientes aparece como **"AI Scrapers and Crawlers"** o **"AI Crawl Control"**.
4. Ponlo en **Off**.
5. Guarda.

> Si el panel ofrece un modo intermedio del tipo _"Allow known AI crawlers"_ o una lista por
> bot, sirve igual: basta con que `GPTBot`, `ClaudeBot` y `CCBot` queden permitidos.

### Opción B — una regla del WAF

1. **Security → WAF → Custom rules** (y también revisa **Managed rules** y **Rate limiting**).
2. Busca una regla cuya expresión mencione `cf.verified_bot_category`, `cf.bot_management`,
   `"AI Crawler"`, `"AI Scraper"`, o que liste user-agents como `GPTBot` / `ClaudeBot`
   directamente.
3. Si la regla existe y su acción es _Block_: cámbiala a **Skip** o desactívala con el
   interruptor de la derecha. No hace falta borrarla; desactivarla deja el rastro de que existió.

### Opción C — Super Bot Fight Mode

1. **Security → Bots**.
2. Si ves **Super Bot Fight Mode**, mira la fila **"Definitely automated"**.
3. Si está en _Block_, pásala a **Allow**. Los rastreadores de IA declarados entran en esa
   categoría.

---

## 3. Qué desactivar además (M5)

El pie de página tiene un `mailto:` a `ruben@rivera-refrigeracion.com` que Cloudflare reescribe
a `/cdn-cgi/l/email-protection#...`, y esa URL **devuelve 404**. Es un enlace roto en las diez
páginas del sitio, y además borra el correo del HTML, así que ningún motor de respuesta lo puede
citar como dato de contacto.

1. Zona `rivera-refrigeracion.com` → **Scrape Shield** (en la navegación nueva:
   **Security → Settings**, sección _Scrape Shield_ o _Email obfuscation_).
2. Pon **Email Address Obfuscation** en **Off**.
3. Guarda.

Comprobado el 2026-09-22: `GET https://rivera-refrigeracion.com/cdn-cgi/l/email-protection`
responde **404**.

---

## 4. Cómo verificar que quedó bien

Espera dos o tres minutos a que Cloudflare propague y corre esto desde cualquier terminal.
Cada línea debe imprimir `200`.

```bash
for ua in \
  "GPTBot/1.2 (+https://openai.com/gptbot)" \
  "ClaudeBot/1.0 (+claudebot@anthropic.com)" \
  "CCBot/2.0 (https://commoncrawl.org/faq/)" \
  "Amazonbot/0.1 (+https://developer.amazon.com/support/amazonbot)" \
  "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)"
do
  printf '%s  %s\n' \
    "$(curl -s -o /dev/null -w '%{http_code}' -A "$ua" https://rivera-refrigeracion.com/servicios/neveras/)" \
    "${ua:0:40}"
done
```

Antes del cambio esto imprime cinco `403`. Después debe imprimir cinco `200`.

Comprobación de que sigue llegando el HTML de verdad y no una página de reto de Cloudflare
(un `200` con un captcha dentro también sería un fallo):

```bash
curl -s -A "GPTBot/1.2 (+https://openai.com/gptbot)" \
  https://rivera-refrigeracion.com/servicios/neveras/ | grep -c "Rivera Refrigeración"
```

Debe devolver un número mayor que cero.

Comprobación del correo (M5) — debe imprimir el correo en texto plano, sin `cfemail`:

```bash
curl -s https://rivera-refrigeracion.com/ | grep -o 'ruben@rivera-refrigeracion\.com' | head -1
curl -s https://rivera-refrigeracion.com/ | grep -c 'cdn-cgi/l/email-protection'   # debe dar 0
```

Y que el `robots.txt` del repositorio llegue entero, sin que Cloudflare le inyecte su propio
bloque gestionado por delante:

```bash
curl -s https://rivera-refrigeracion.com/robots.txt | grep -A2 "User-agent: GPTBot"
```

Debe mostrar `Allow: /`. Si aparece un bloque `# BEGIN Cloudflare Managed content` con un
`Disallow: /` para GPTBot, es que queda activa la función _Content Signals_ / _AI Scrapers_ de
Cloudflare y hay que volver al paso 2. **El 2026-09-22 ese bloque no estaba**: Cloudflare servía
el archivo del origen tal cual, así que el 403 viene del WAF o del modo bot, no de robots.txt.

---

## 5. Qué esperar después

- **No es inmediato.** Los rastreadores de índice vuelven a pasar por el sitio en días o
  semanas, no en horas. Lo que el cambio hace es dejar de rechazarlos.
- **No cambia nada en Google.** Googlebot nunca estuvo bloqueado; esto es sólo para los motores
  de respuesta.
- **Sí abre el sitio a la posibilidad de aparecer citado** en ChatGPT, Claude y Perplexity sin
  que el usuario tenga que dar la URL.
- El riesgo es el habitual de tener un sitio público: el contenido puede acabar en un corpus de
  entrenamiento. Para un negocio de servicio local eso es publicidad, no un problema. Si algún
  día quieres cerrar sólo el entrenamiento y dejar abierta la citación, el ajuste fino se hace
  en `public/robots.txt` (quitando el grupo `Google-Extended` y `CCBot`), no en Cloudflare.

---

## 6. Decisión pendiente: Cloudflare Insights

Aparte de lo anterior, hoy el sitio carga `static.cloudflareinsights.com/beacon.min.js` en cada
visita y la política de seguridad de contenido (CSP) lo bloquea, así que el script falla siempre
y deja un error en la consola. Hay que elegir una de dos:

- **Apagarlo:** zona → **Analytics & Logs → Web Analytics** → desactivar para este sitio.
- **Dejarlo:** avisar para añadir `https://static.cloudflareinsights.com` a `script-src` en
  `netlify.toml`.

Dado que el sitio ya tiene GA4 y GTM, apagarlo es lo más limpio. Dejarlo como está hoy es la
única opción que no sirve para nada.
