# AGENTS.md - Coding Guidelines for Rivera Refrigeración Website

This document provides comprehensive guidelines for working with the Rivera Refrigeración Astro website codebase.

## Build & Test Commands

### Development

- `pnpm dev` - Start development server on localhost:4321
- `pnpm preview` - Preview production build locally

### Building

- `pnpm build` - Run type check (astro check) and build for production
- `pnpm check` - Run Astro type checking only

### Bundle Analysis

- `pnpm build` - Automatically generates `stats.html` with bundle analysis
  - Opens interactive visualization in browser
  - Shows module sizes with gzip and brotli compression
  - Helps identify optimization opportunities
  - File is excluded from git (.gitignore)

### Code Quality

- `pnpm lint` - Run ESLint on .js, .ts, .astro files
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier (JS, TS, Astro, JSON, MD, CSS)
- `pnpm format:check` - Check if code is properly formatted

### Testing

#### Unit Tests (Vitest)

- `pnpm test` - Run all unit tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with UI interface
- `pnpm test:coverage` - Run tests with coverage report

#### Running Single Unit Tests

```bash
# Run specific test file
vitest run tests/unit/config.test.ts

# Run specific test pattern
vitest run --reporter=verbose -t "should have correct site name"
```

#### E2E Tests (Playwright)

- `pnpm test:e2e` - Run all e2e tests
- `pnpm test:e2e:ui` - Run e2e tests with UI interface

#### Running Single E2E Tests

```bash
# Run specific test file
playwright test tests/e2e/homepage.spec.ts

# Run specific test within file
playwright test tests/e2e/homepage.spec.ts --grep "should have correct title"

# Debug specific test
playwright test tests/e2e/homepage.spec.ts --debug
```

#### Analytics Blocking in E2E Tests

All E2E tests automatically block Google Analytics and Google Tag Manager requests to prevent fake test data from polluting production analytics dashboards. This is handled by a custom Playwright fixture located at `tests/e2e/fixtures.ts`.

**How it works:**

- GTM and GA network requests are intercepted and aborted before they complete
- Analytics scripts still exist in the HTML (so we can verify they're configured)
- No test data is sent to production analytics platforms

**Important**: Always import test utilities from `./fixtures` instead of `@playwright/test` to ensure analytics blocking is active:

```typescript
// ✅ Good - analytics automatically blocked
import { test, expect } from './fixtures';

// ❌ Bad - missing analytics blocking
import { test, expect } from '@playwright/test';
```

**Blocked domains:**

- `googletagmanager.com` (GTM scripts)
- `google-analytics.com` (GA tracking)
- `analytics.google.com` (Additional GA endpoints)

**Related**: See GitHub Issue #28 for implementation details.

## Code Style Guidelines

### Imports

- Use path aliases: `@/*`, `@components/*`, `@layouts/*`, `@lib/*`, `@content/*`, `@types/*`
- Group imports: external libraries first, then internal imports
- Sort imports alphabetically within groups
- Use single quotes for import strings

```typescript
// Good
import { SITE, CONTACT } from '@/lib/config';
import { formatPhone } from '@/lib/utils';

// Bad - no path aliases
import { SITE } from '../../../lib/config';
```

### TypeScript

- Use strict TypeScript configuration
- Prefer `const` assertions for configuration objects
- Use descriptive type names and avoid `any`
- Export types that are used across files

```typescript
// Good
export const SITE = {
  name: 'Rivera Refrigeración',
  url: 'https://rivera-refrigeracion.com',
} as const;

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
};
```

### Naming Conventions

- **Files**: kebab-case (e.g., `hero-section.astro`, `config.test.ts`)
- **Components**: PascalCase (e.g., `Header`, `Services`)
- **Variables/Functions**: camelCase (e.g., `currentPath`, `formatPhone`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SITE_CONFIG`)
- **Types/Interfaces**: PascalCase with descriptive names

### Formatting

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always required
- **Line Length**: 80 characters maximum
- **Trailing Commas**: ES5 style (required for multiline objects/arrays)
- **Astro Plugin**: Enabled for proper .astro file formatting

### Error Handling

- Use try/catch blocks for async operations
- Provide meaningful error messages in Spanish (project language)
- Log errors appropriately but avoid exposing sensitive information
- Handle edge cases gracefully with fallbacks

```typescript
// Good
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('Error al cargar los datos:', error);
  return null; // Fallback
}
```

## Astro-Specific Guidelines

### Component Structure

- Use frontmatter for component props and types
- Keep component logic minimal in frontmatter
- Use `<script>` blocks for client-side interactivity
- Separate data fetching from presentation logic

```astro
---
// Frontmatter - props, imports, data fetching
export interface Props {
  title: string;
  services: Service[];
}

const { title, services } = Astro.props;
---

<!-- Template -->
<div class="services">
  <h2>{title}</h2>
  {
    services.map((service) => (
      <div class="service-card">
        <h3>{service.title}</h3>
      </div>
    ))
  }
</div>

<!-- Client script -->
<script>
  // Interactive functionality only
</script>
```

### Accessibility

- Always include `aria-label` for icon-only buttons
- Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Ensure keyboard navigation works
- Provide alt text for images
- Test with screen readers

### Tailwind CSS

- Use utility-first approach
- Leverage responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Create component classes for complex patterns
- Follow mobile-first responsive design
- Use custom CSS variables for theme colors

```astro
<!-- Good -->
<button class="whatsapp-btn w-full justify-center lg:w-auto">
  <span class="text-primary-600">Contactar</span>
</button>

<style>
  .whatsapp-btn {
    @apply bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors;
  }
</style>
```

## Testing Conventions

### Unit Tests (Vitest)

- Use descriptive test names that describe behavior
- Group related tests with `describe` blocks
- Test configuration constants and utility functions thoroughly
- Use happy-dom environment for DOM-related tests
- Focus on business logic, not implementation details

```typescript
describe('Site Configuration', () => {
  describe('SITE', () => {
    it('should have correct site name', () => {
      expect(SITE.name).toBe('Rivera Refrigeración');
    });

    it('should have a valid URL', () => {
      expect(SITE.url).toMatch(/^https?:\/\//);
    });
  });
});
```

### E2E Tests (Playwright)

- Test user journeys and critical paths
- Use semantic selectors (`getByRole`, `getByLabel`)
- Test responsive behavior across viewports
- Verify accessibility features
- Include mobile-specific tests

```typescript
test('should display hero section with CTA', async ({ page }) => {
  const heroHeading = page.getByRole('heading', { level: 1 });
  await expect(heroHeading).toBeVisible();
  await expect(heroHeading).toContainText('Soluciones Confiables');
});
```

## File Organization

- `src/components/` - Reusable UI components
- `src/layouts/` - Page layout components
- `src/pages/` - Route pages
- `src/lib/` - Utilities, config, and business logic
- `src/content/` - Content collections (blog posts, etc.)
- `src/types/` - TypeScript type definitions
- `tests/unit/` - Unit tests
- `tests/e2e/` - End-to-end tests
- `public/` - Static assets

## Commit Message Guidelines

- Write clear, descriptive messages explaining what changed
- Focus on "why" rather than "what"
- Keep messages concise but informative
- Use present tense ("Add feature" not "Added feature")
- Avoid AI signatures or co authored commits and PRs

## Performance Considerations

- Use Astro's built-in optimizations (prefetch, compression)
- Optimize images with appropriate formats and sizes
- Minimize client-side JavaScript
- Leverage Tailwind's purging for smaller CSS bundles
- Test build output regularly with `pnpm build`

### Bundle Optimization

The project uses `rollup-plugin-visualizer` to analyze bundle composition:

- **Review stats.html regularly** after significant dependency changes
- **Monitor bundle size** - look for unexpectedly large modules
- **Identify optimization opportunities:**
  - Replace large dependencies with lighter alternatives
  - Use dynamic imports for code splitting
  - Remove unused dependencies
  - Check for duplicate dependencies
- **Track compression ratios** - gzip and brotli sizes shown
- **Before adding dependencies:**
  - Check their bundle impact in stats.html
  - Consider tree-shakeable alternatives
  - Evaluate if the functionality can be implemented natively

## Deployment

### Netlify Automatic Deployment

The site is configured for **automatic deployment** to Netlify. Every push to the `main` branch triggers a production deployment.

**Production URL**: `https://rivera-refrigeracion.com`

#### Build Configuration

The deployment is configured via `netlify.toml`:

```toml
[build]
  command = "pnpm install && pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "9"
```

**Build Process**:

1. Push commits to `main` branch
2. Netlify detects changes via webhook
3. Runs `pnpm install && pnpm build`
4. Deploys `dist/` directory to production
5. Deployment typically completes in 2-3 minutes

#### Cache Strategy

Netlify is configured with aggressive caching for optimal performance:

- **HTML**: No cache (`max-age=0, must-revalidate`) - Always fresh content
- **Hashed Assets** (`/_astro/*`): 1 year cache (`immutable`) - Fingerprinted files
- **Images** (`.webp`, `.png`, `.jpg`, `.svg`): 1 year cache (`immutable`)
- **CSS/JS**: 1 year cache (`immutable`)
- **Fonts** (`.woff2`, `.woff`): 1 year cache (`immutable`)
- **Favicon**: 1 week cache
- **RSS/Sitemap**: 1 hour cache
- **robots.txt**: 1 day cache

#### Security Headers

All pages include security headers configured in `netlify.toml`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- Content Security Policy (CSP)
- `Referrer-Policy: strict-origin-when-cross-origin`

#### Deployment Workflow

```bash
# 1. Make changes locally
git add .
git commit -m "Add new feature"

# 2. Push to GitHub (triggers Netlify build)
git push origin main

# 3. Monitor deployment
# Visit Netlify dashboard or check GitHub commit status

# 4. Verify deployment
# Open https://rivera-refrigeracion.com
```

#### Important Notes

- **E2E tests run locally** against `http://localhost:4500`, not production
- **Images must be committed** to git to appear in production
- **Cache purging**: Changes to HTML are immediate; cached assets require new hash
- **Build failures**: Check Netlify deploy logs if deployment fails
- **Preview deploys**: Pull requests automatically get preview URLs

#### Troubleshooting Deployment Issues

**Image 404 errors:**

- Verify file exists in `public/images/` directory
- Ensure file is committed to git: `git ls-files public/images/filename`
- Check Netlify deploy log for missing files
- Clear browser cache if image was recently added

**Build failures:**

- Check Netlify deploy logs for error messages
- Verify build passes locally: `pnpm build`
- Ensure all dependencies are in `package.json`
- Check Node/pnpm versions match `netlify.toml`

**Stale content:**

- HTML updates are immediate (no cache)
- CSS/JS changes require new build (Astro hashes filenames automatically)
- Force refresh browser cache: `Ctrl+Shift+R` or `Cmd+Shift+R`

## Language & Content Guidelines

- All user-facing content in Spanish (Colombia locale)
- Use inclusive, professional language
- Maintain brand voice: trustworthy, experienced, reliable
- Ensure all text is properly localized and culturally appropriate
