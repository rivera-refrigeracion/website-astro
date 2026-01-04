# AGENTS.md - Coding Guidelines for Rivera Refrigeración Website

This document provides comprehensive guidelines for working with the Rivera Refrigeración Astro website codebase.

## Build & Test Commands

### Development

- `pnpm dev` - Start development server on localhost:4321
- `pnpm preview` - Preview production build locally

### Building

- `pnpm build` - Run type check (astro check) and build for production
- `pnpm check` - Run Astro type checking only

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

## Language & Content Guidelines

- All user-facing content in Spanish (Colombia locale)
- Use inclusive, professional language
- Maintain brand voice: trustworthy, experienced, reliable
- Ensure all text is properly localized and culturally appropriate
