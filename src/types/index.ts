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
  id: string;
  /** Service name displayed to users */
  title: string;
  /** Brief description of the service offering */
  description: string;
  /** Icon name from the icon library (e.g., "air-conditioner") */
  icon: string;
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
  rating?: number;
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
  publishedTime?: string;
  /** ISO 8601 last modification date for articles */
  modifiedTime?: string;
  /** Article author name */
  author?: string;
  /** Article section/category (e.g., "Mantenimiento") */
  section?: string;
  /** Array of article tags for categorization */
  tags?: string[];
  /** Prevents search engine indexing if true */
  noindex?: boolean;
}
