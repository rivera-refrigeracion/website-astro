import cargadorGtm from '@/lib/gtm-diferido.js?raw';

export const GTM_ID = 'GTM-WGKFDPTD';

/**
 * Únicos hosts en los que se carga GTM y se envían eventos al dataLayer.
 * Localhost, las vistas previas de Netlify (deploy-preview-*, *--*.netlify.app)
 * y cualquier otro dominio quedan fuera para no ensuciar GA4.
 */
export const HOSTS_PRODUCCION: readonly string[] = [
  'rivera-refrigeracion.com',
  'www.rivera-refrigeracion.com',
];

/**
 * Script inline de medición listo para incrustar en el <head>: carga
 * diferida de GTM, filtro por host y eventos de conversión.
 */
export function scriptMedicion(
  hosts: readonly string[] = HOSTS_PRODUCCION,
  gtmId: string = GTM_ID
): string {
  // Sin el comentario de cabecera: se incrusta en cada página.
  return cargadorGtm
    .replace(/^\/\*[\s\S]*?\*\/\s*/, '')
    .replace('__HOSTS_PRODUCCION__', hosts.join(','))
    .replace('__GTM_ID__', gtmId);
}
