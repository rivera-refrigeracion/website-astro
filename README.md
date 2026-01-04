# Rivera Refrigeración

[![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Netlify](https://img.shields.io/badge/Netlify-00C46A?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)

Sitio web oficial de Rivera Refrigeración, empresa especializada en instalación, mantenimiento y reparación de aire acondicionado, neveras, lavadoras y calentadores en Cali, Colombia.

> **Más de 30 años de experiencia** en el sector de refrigeración y electrodomésticos.

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#sobre-el-proyecto)
- [Tecnologías](#tecnologías)
- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Desarrollo](#desarrollo)
- [Construcción](#construcción)
- [Pruebas](#pruebas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Licencia](#licencia)

## 🏢 Sobre el Proyecto

Rivera Refrigeración es una empresa familiar con más de 30 años de experiencia en el mantenimiento y reparación de electrodomésticos. Ubicados en Cali, Valle del Cauca, Colombia, ofrecemos servicios profesionales de:

- **Instalación y reparación de aire acondicionado**
- **Mantenimiento de neveras**
- **Reparación de lavadoras**
- **Instalación de calentadores**

Este sitio web está construido con tecnologías modernas para proporcionar una experiencia óptima tanto para los clientes como para los desarrolladores.

## 🛠 Tecnologías

### Framework

- **[Astro](https://astro.build/)** - Framework web moderno para crear sitios rápidos
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript con tipos estáticos

### Estilos

- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first

### Testing

- **[Vitest](https://vitest.dev/)** - Framework de testing rápido para Vite
- **[Playwright](https://playwright.dev/)** - Framework para pruebas E2E
- **[Testing Library](https://testing-library.com/)** - Utilidades para testing de DOM

### Calidad de Código

- **[ESLint](https://eslint.org/)** - Linting para JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** - Formateador de código
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** - Ejecutar linters en archivos staged

### Integraciones

- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** - Generación automática de sitemap
- **[@astrojs/rss](https://docs.astro.build/en/guides/rss/)** - Generación de feeds RSS

## ✨ Características

- **🚀 Rendimiento Optimizado**: Construido con Astro para tiempos de carga ultra-rápidos
- **📱 Diseño Responsivo**: Optimizado para todos los dispositivos
- **♿ Accesibilidad**: Cumple con estándares de accesibilidad web
- **🌐 SEO Optimizado**: Meta tags, sitemap y RSS incluidos
- **🔍 Testing Completo**: Cobertura con pruebas unitarias y E2E
- **🎨 UI Moderna**: Interfaz limpia y profesional con Tailwind CSS
- **💬 Chat en Vivo**: Integración con Chatwoot para soporte al cliente
- **📊 Analytics**: Integración con Google Analytics
- **📰 Blog**: Sistema de blog con contenido sobre mantenimiento de electrodomésticos

## 📋 Requisitos Previos

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0 (recomendado) o npm/yarn

## 🚀 Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/rivera-refrigeracion/website-astro.git
   cd website-astro
   ```

2. **Instala las dependencias:**

   ```bash
   pnpm install
   # o
   npm install
   # o
   yarn install
   ```

3. **Configura las variables de entorno** (si es necesario):
   ```bash
   cp .env.example .env
   ```

## 💻 Desarrollo

### Inicia el servidor de desarrollo:

```bash
pnpm dev
# o
npm run dev
```

El sitio estará disponible en `http://localhost:4321`

### Comandos disponibles para desarrollo:

| Comando        | Descripción                                       |
| -------------- | ------------------------------------------------- |
| `pnpm dev`     | Inicia servidor de desarrollo                     |
| `pnpm build`   | Construye para producción (incluye type checking) |
| `pnpm preview` | Vista previa del build de producción              |
| `pnpm check`   | Ejecuta type checking con Astro                   |
| `pnpm astro`   | Ejecuta comandos de Astro CLI                     |

## 🏗 Construcción

### Construir para producción:

```bash
pnpm build
```

Esto ejecutará automáticamente:

- Type checking con `astro check`
- Optimización de assets
- Generación de sitemap y RSS
- Minificación de CSS y JS

Los archivos de producción se generarán en la carpeta `dist/`.

### Vista previa del build:

```bash
pnpm preview
```

## 🧪 Pruebas

### Pruebas Unitarias (Vitest):

```bash
# Ejecutar todas las pruebas una vez
pnpm test

# Ejecutar pruebas en modo watch
pnpm test:watch

# Ejecutar pruebas con interfaz gráfica
pnpm test:ui

# Ejecutar pruebas con reporte de cobertura
pnpm test:coverage

# Ejecutar una prueba específica
vitest run tests/unit/config.test.ts
```

### Pruebas E2E (Playwright):

```bash
# Ejecutar todas las pruebas E2E
pnpm test:e2e

# Ejecutar pruebas E2E con interfaz gráfica
pnpm test:e2e:ui

# Ejecutar una prueba específica
playwright test tests/e2e/homepage.spec.ts
```

## 📁 Estructura del Proyecto

```
/
├── public/
│   ├── images/          # Imágenes estáticas
│   └── favicon.*        # Favicons
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── sections/    # Secciones de página
│   │   └── *.astro      # Componentes principales
│   ├── content/         # Contenido del blog
│   ├── layouts/         # Layouts de página
│   ├── lib/             # Utilidades y configuración
│   ├── pages/           # Páginas de rutas
│   ├── styles/          # Estilos globales
│   └── types/           # Definiciones TypeScript
├── tests/
│   ├── unit/            # Pruebas unitarias
│   └── e2e/             # Pruebas end-to-end
├── astro.config.mjs     # Configuración de Astro
├── tailwind.config.mjs  # Configuración de Tailwind
├── tsconfig.json        # Configuración TypeScript
├── package.json         # Dependencias y scripts
├── netlify.toml         # Configuración de despliegue
└── AGENTS.md           # Guías para asistentes de código
```

## 🚀 Despliegue

### Netlify (Configurado Automáticamente)

El proyecto está configurado para desplegarse automáticamente en Netlify:

1. **Conecta tu repositorio** en Netlify
2. **Configura las variables de build:**
   - Build command: `pnpm install && pnpm build`
   - Publish directory: `dist`
   - Node version: 20
   - PNPM version: 9

### Despliegue Manual

```bash
# Construir para producción
pnpm build

# Los archivos estarán en la carpeta `dist/`
# Sube el contenido de `dist/` a tu servidor web
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, lee nuestras [guías de contribución](AGENTS.md) antes de comenzar.

### Flujo de Trabajo:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Calidad de Código:

Antes de enviar un PR, asegúrate de que:

- ✅ Las pruebas pasan: `pnpm test && pnpm test:e2e`
- ✅ El código está formateado: `pnpm format`
- ✅ No hay errores de linting: `pnpm lint`
- ✅ Los tipos pasan: `pnpm check`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Rivera Refrigeración** - Tu aliado confiable en refrigeración y electrodomésticos.

📍 **Ubicación:** Cali, Valle del Cauca, Colombia  
📞 **Teléfono:** +57 317 309 5159  
💬 **WhatsApp:** [Contáctanos](https://api.whatsapp.com/send?phone=573016963313)  
🌐 **Sitio Web:** [rivera-refrigeracion.com](https://rivera-refrigeracion.com)
