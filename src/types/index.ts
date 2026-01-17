/**
 * Branded type for service IDs to prevent accidental mixing with plain strings.
 * Ensures type safety when working with service identifiers.
 *
 * @example
 * ```typescript
 * const serviceId: ServiceId = 'aire-acondicionado' as ServiceId;
 * ```
 */
export type ServiceId = string & { readonly __brand: 'ServiceId' };

/**
 * Branded type for ISO 8601 date strings.
 * Provides compile-time safety for date string formatting.
 *
 * @example
 * ```typescript
 * const publishDate: ISODateString = '2024-01-15T00:00:00Z' as ISODateString;
 * ```
 */
export type ISODateString = string & { readonly __brand: 'ISODateString' };

/**
 * Union type for star ratings (1-5).
 * Restricts rating values to valid integers between 1 and 5 inclusive.
 *
 * @example
 * ```typescript
 * const rating: StarRating = 5;
 * ```
 */
export type StarRating = 1 | 2 | 3 | 4 | 5;

/**
 * Union type for valid icon identifiers used throughout the application.
 * Includes icons for services and feature sections.
 *
 * @example
 * ```typescript
 * const icon: IconName = 'air-conditioner';
 * ```
 */
export type IconName =
  | 'air-conditioner'
  | 'refrigerator'
  | 'washing-machine'
  | 'flame'
  | 'shield-check'
  | 'users'
  | 'clock';

/**
 * Runtime validation helper for star ratings.
 * Checks if a number is a valid StarRating (1-5).
 *
 * @param value - The number to validate
 * @returns True if the value is a valid star rating
 *
 * @example
 * ```typescript
 * if (isValidStarRating(userInput)) {
 *   const rating: StarRating = userInput;
 * }
 * ```
 */
export function isValidStarRating(value: number): value is StarRating {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

/**
 * Runtime validation and conversion helper for service IDs.
 * Validates and converts a string to a ServiceId.
 *
 * @param value - The string to validate and convert
 * @returns The value as a ServiceId
 * @throws Error if the value is not a valid service ID
 *
 * @example
 * ```typescript
 * try {
 *   const serviceId = toServiceId(userInput);
 *   // Use serviceId safely
 * } catch (error) {
 *   console.error('Invalid service ID');
 * }
 * ```
 */
export function toServiceId(value: string): ServiceId {
  const validIds = [
    'aire-acondicionado',
    'neveras',
    'lavadoras',
    'calentadores',
  ];
  if (!validIds.includes(value)) {
    throw new Error(`Invalid service ID: ${value}`);
  }
  return value as ServiceId;
}

/**
 * Runtime validation helper for icon names.
 * Checks if a string is a valid IconName.
 *
 * @param value - The string to validate
 * @returns True if the value is a valid icon name
 *
 * @example
 * ```typescript
 * if (isValidIconName(iconString)) {
 *   const icon: IconName = iconString;
 * }
 * ```
 */
export function isValidIconName(value: string): value is IconName {
  const validIcons: IconName[] = [
    'air-conditioner',
    'refrigerator',
    'washing-machine',
    'flame',
    'shield-check',
    'users',
    'clock',
  ];
  return validIcons.includes(value as IconName);
}

/**
 * Runtime validation helper for ISO date strings.
 * Checks if a string is a valid ISO 8601 date format.
 *
 * @param value - The string to validate
 * @returns True if the value is a valid ISO date string
 *
 * @example
 * ```typescript
 * if (isValidISODateString(dateString)) {
 *   const isoDate: ISODateString = dateString;
 * }
 * ```
 */
export function isValidISODateString(value: string): value is ISODateString {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  return isoDateRegex.test(value) && !isNaN(Date.parse(value));
}

/**
 * Represents a blog post entry with metadata and content.
 * Used for rendering blog articles and RSS feed generation.
 */
export interface BlogPost {
  /** URL-friendly slug for the post */
  slug: string;
  /** Post title displayed in headers and meta tags */
  title: string;
  /** Brief description for SEO and preview cards */
  description: string;
  /** Publication date */
  pubDate: Date;
  /** Optional last updated date for modified content */
  updatedDate?: Date;
  /** Post category (e.g., "Mantenimiento", "Consejos") */
  category: string;
  /** Author name, defaults to "Rivera Refrigeración" */
  author: string;
  /** Optional featured image */
  image?: {
    /** Image URL or path */
    url: string;
    /** Descriptive alt text for accessibility */
    alt: string;
  };
  /** Markdown/MDX content body */
  content: string;
}

/**
 * Represents a service offered by Rivera Refrigeración.
 * Used for displaying service cards on the homepage and service pages.
 */
export interface Service {
  /** Unique identifier for the service (e.g., "aire-acondicionado") */
  id: ServiceId;
  /** Service name displayed to users */
  title: string;
  /** Brief description of the service offering */
  description: string;
  /** Icon name from the icon library (e.g., "air-conditioner") */
  icon: IconName;
}

/**
 * Represents a customer testimonial or review.
 * Used for displaying customer feedback on the homepage.
 */
export interface Testimonial {
  /** The testimonial content or review text */
  text: string;
  /** Name of the customer providing the testimonial */
  author: string;
  /** Optional star rating (1-5) */
  rating?: StarRating;
}

/**
 * Represents a navigation menu item.
 * Used for building the main navigation menu in the header.
 */
export interface NavItem {
  /** Display text for the navigation link */
  name: string;
  /** URL path or anchor link (e.g., "/blog" or "/#services") */
  href: string;
}

/**
 * Properties for SEO meta tags and Open Graph data.
 * Used by the SEO component to generate proper meta tags for social sharing and search engines.
 *
 * @example
 * ```typescript
 * const seoProps: SEOProps = {
 *   title: "Aire Acondicionado - Rivera Refrigeración",
 *   description: "Servicio profesional de instalación y reparación",
 *   article: true,
 *   publishedTime: "2024-01-15"
 * };
 * ```
 */
export interface SEOProps {
  /** Page title for meta tags (appends site name if not full title) */
  title?: string;
  /** Meta description for search engines and social previews */
  description?: string;
  /** Open Graph image URL for social media sharing */
  image?: string;
  /** Whether this is an article page (enables article-specific meta tags) */
  article?: boolean;
  /** ISO 8601 publication date for articles */
  publishedTime?: ISODateString;
  /** ISO 8601 last modification date for articles */
  modifiedTime?: ISODateString;
  /** Article author name */
  author?: string;
  /** Article section/category (e.g., "Mantenimiento") */
  section?: string;
  /** Array of article tags for categorization */
  tags?: string[];
  /** Prevents search engine indexing if true */
  noindex?: boolean;
}
