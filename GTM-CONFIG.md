# Configuración de GTM y GA4 para los eventos de contacto

Contenedor **GTM-WGKFDPTD** · propiedad de GA4 **453760445** · ID de medición
**G-8TR76WJM3W**.

El sitio ya envía estos eventos al `dataLayer`, pero solo en
`rivera-refrigeracion.com` y `www.rivera-refrigeracion.com`. En localhost y en
las vistas previas de Netlify no carga GTM, así que no llega nada.

| Evento              | Cuándo                                           | Parámetros                      |
| ------------------- | ------------------------------------------------ | ------------------------------- |
| `contacto_whatsapp` | Clic en un enlace a `wa.me` o `api.whatsapp.com` | `ubicacion`, `numero`, `pagina` |
| `contacto_llamada`  | Clic en un enlace `tel:`                         | `ubicacion`, `numero`, `pagina` |
| `contacto_chat`     | Primera apertura del chat de Chatwoot por página | `pagina`                        |
| `agendar_cita`      | Clic en un botón «Agenda tu cita»                | `ubicacion`, `numero`, `pagina` |

Los botones «Agenda tu cita» llevan a WhatsApp, así que un clic en ellos envía
**los dos** eventos: `agendar_cita` y `contacto_whatsapp`. Para contar contactos
totales se suman `contacto_whatsapp` + `contacto_llamada` + `contacto_chat`.
`agendar_cita` es un subconjunto de `contacto_whatsapp`.

Valores de `ubicacion`: `encabezado`, `encabezado_movil`, `menu_movil`,
`portada_inicio`, `portada_cierre`, `servicio_cierre`, `blog_articulo`,
`blog_cierre`, `pie_contacto`, `pie_redes`, `pagina_404`,
`politica_privacidad`. `sin_ubicacion` indica un enlace que quedó fuera de
todas ellas. `numero` va solo con dígitos (por ejemplo `573016963313`) y
`pagina` es la ruta (`/servicios/neveras/`).

---

## A. Google Tag Manager (tagmanager.google.com → contenedor GTM-WGKFDPTD)

### Variables (3)

1. Ve a **Variables** → **Variables definidas por el usuario** → **Nueva**.
2. Pon el nombre `dlv - ubicacion`. En **Configuración de la variable**, elige
   **Variable de capa de datos**. En **Nombre de la variable de capa de
   datos**, escribe `ubicacion`. Deja la **Versión 2** y dale a
   **Guardar**.
3. Repite el paso 2 para `dlv - numero` con `numero`.
4. Repite el paso 2 para `dlv - pagina` con `pagina`.

### Activadores (4)

5. Ve a **Activadores** → **Nuevo** → **Configuración del activador** →
   **Evento personalizado**.
6. Ponle el nombre `CE - contacto_whatsapp`. En **Nombre del evento**,
   escribe `contacto_whatsapp` (sin marcar «Usar coincidencias de expresiones
   regulares»). En **Este activador se activa en**, elige **Todos los eventos
   personalizados** y dale a **Guardar**.
7. Repite el paso 6 para:
   - `CE - contacto_llamada` con el evento `contacto_llamada`
   - `CE - contacto_chat` con el evento `contacto_chat`
   - `CE - agendar_cita` con el evento `agendar_cita`

### Etiquetas (4)

8. Ve a **Etiquetas** → **Nueva** → **Configuración de la etiqueta** →
   **Google Analytics** → **Evento de Google Analytics** (GA4).
9. Ponle el nombre `GA4 - contacto_whatsapp` y completa:
   - **ID de medición**: `G-8TR76WJM3W`
   - **Nombre del evento**: `contacto_whatsapp`
   - **Parámetros del evento** → **Añadir parámetro**, una fila por parámetro:

     | Nombre del parámetro | Valor                 |
     | -------------------- | --------------------- |
     | `ubicacion`          | `{{dlv - ubicacion}}` |
     | `numero`             | `{{dlv - numero}}`    |
     | `pagina`             | `{{dlv - pagina}}`    |

   - **Activación**: `CE - contacto_whatsapp`. Luego dale a **Guardar**.

10. Repite los pasos 8 y 9 para:
    - `GA4 - contacto_llamada`: evento `contacto_llamada`, los mismos 3
      parámetros y el activador `CE - contacto_llamada`
    - `GA4 - agendar_cita`: evento `agendar_cita`, los mismos 3 parámetros y
      el activador `CE - agendar_cita`
    - `GA4 - contacto_chat`: evento `contacto_chat`, **solo** el parámetro
      `pagina` y el activador `CE - contacto_chat`
11. Si el contenedor tiene una etiqueta de WhatsApp antigua basada en
    **clics en enlaces** (por ejemplo `whatsapp_click`), **páusala** (menú ⋮
    de la etiqueta → **Pausar**). Si sigue activa, cada clic se cuenta dos
    veces.

### Probar y publicar

12. Haz clic en **Vista previa** e introduce `https://rivera-refrigeracion.com`.
    En localhost ya no funciona porque el sitio no carga GTM ahí. En la
    pestaña del sitio, pulsa el botón de WhatsApp del encabezado y el teléfono
    del pie. En Tag Assistant tienen que aparecer `contacto_whatsapp` y
    `contacto_llamada`, cada uno con su etiqueta en **Tags Fired**.
13. Haz clic en **Enviar**. En la descripción, escribe «Eventos de contacto
    como eventos personalizados» y dale a **Publicar**.

---

## B. Google Analytics 4 (analytics.google.com → propiedad 453760445)

Todo está en **Administrar** (rueda dentada, abajo a la izquierda).

### Dimensiones personalizadas (2)

14. Ve a **Visualización de datos** → **Definiciones personalizadas** →
    pestaña **Dimensiones personalizadas** → **Crear dimensiones
    personalizadas**.
15. **Nombre de la dimensión**: `Ubicación` · **Alcance**: `Evento` ·
    **Parámetro de evento**: `ubicacion`. Dale a **Guardar**.
16. Repite el paso 15 con **Nombre de la dimensión** `Número` y **Parámetro
    de evento** `numero`.

GA4 ya trae la página en «Ruta de la página», así que `pagina` no necesita
dimensión propia.

### Eventos clave (4)

17. Ve a **Visualización de datos** → **Eventos clave** → **Nuevo evento
    clave**. Escribe `contacto_whatsapp` y dale a **Guardar**.
18. Repite el paso 17 para `contacto_llamada`, `contacto_chat` y
    `agendar_cita`. Escribe los nombres exactamente así, en minúsculas y con
    guion bajo.

### Excluir el tráfico interno y de desarrollador

19. Ve a **Recopilación y modificación de datos** → **Flujos de datos**, abre
    el flujo web del sitio y entra en **Configurar los ajustes de la etiqueta**
    (abajo del todo) → **Mostrar más** → **Definir el tráfico interno** →
    **Crear**.
20. **Nombre de la regla**: `Oficina y casa` · **valor de traffic_type**:
    `internal` · **Tipo de coincidencia**: **La dirección IP es igual a** ·
    **Valor**: tu IP pública (búscala en Google como «cuál es mi IP»). Añade
    una condición por cada red desde la que trabajes y dale a **Crear**.
    Si tu proveedor te cambia la IP, tendrás que actualizarla aquí.
21. Vuelve a **Administrar** → **Recopilación y modificación de datos** →
    **Filtros de datos**. Abre el filtro **Tráfico interno**, o créalo con
    **Crear filtro** → **Tráfico interno** si no existe. Deja la
    **Operación** en **Excluir** y el valor del parámetro `traffic_type` en
    `internal`.
22. En el mismo filtro, cambia el **Estado del filtro** a **Activo** y dale a
    **Guardar**. Mientras esté en **Probando** no excluye nada.
23. **Crear filtro** → **Tráfico de desarrollador** → **Operación**:
    **Excluir** → **Estado del filtro**: **Activo** → **Guardar**. Esto quita
    las visitas hechas desde la vista previa de GTM (`debug_mode`).

### Comprobar

24. Ve a **Informes** → **Tiempo real** y haz clic en un botón de WhatsApp del
    sitio desde otra red (por ejemplo, con los datos del móvil). En menos de
    un minuto debería aparecer `contacto_whatsapp` en **Recuento de eventos
    por nombre del evento**.

Notas:

- Los filtros de datos no se aplican a datos pasados. Para excluir las 55
  sesiones antiguas de localhost y de las vistas previas, añade en informes y
  exploraciones un filtro **Nombre de host** = `rivera-refrigeracion.com`.
- Las dimensiones personalizadas empiezan a llenarse desde que se crean. Los
  parámetros recibidos antes no se reasignan.
