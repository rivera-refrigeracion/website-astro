import { describe, it, expect } from 'vitest';
import type {
  BlogPost,
  Service,
  Testimonial,
  NavItem,
  SEOProps,
  ServiceId,
  IconName,
  ISODateString,
} from '../../src/types';

describe('Type Definitions', () => {
  describe('BlogPost interface', () => {
    it('should allow valid blog post object', () => {
      const post: BlogPost = {
        slug: 'test-post',
        title: 'Test Post',
        description: 'Test description',
        pubDate: new Date(),
        category: 'Test',
        author: 'Author',
        content: 'Content',
      };

      expect(post.slug).toBe('test-post');
      expect(post.title).toBe('Test Post');
    });

    it('should allow optional fields', () => {
      const post: BlogPost = {
        slug: 'test-post',
        title: 'Test Post',
        description: 'Test description',
        pubDate: new Date(),
        updatedDate: new Date(),
        category: 'Test',
        author: 'Author',
        image: {
          url: '/images/test.jpg',
          alt: 'Test image',
        },
        content: 'Content',
      };

      expect(post.updatedDate).toBeDefined();
      expect(post.image?.url).toBe('/images/test.jpg');
    });
  });

  describe('Service interface', () => {
    it('should allow valid service object', () => {
      const service: Service = {
        id: 'test-service' as ServiceId,
        title: 'Test Service',
        description: 'Test description',
        icon: 'air-conditioner' as IconName,
      };

      expect(service.id).toBe('test-service');
      expect(service.title).toBe('Test Service');
    });
  });

  describe('Testimonial interface', () => {
    it('should allow valid testimonial object', () => {
      const testimonial: Testimonial = {
        text: 'Test testimonial',
        author: 'Test Author',
      };

      expect(testimonial.text).toBe('Test testimonial');
      expect(testimonial.author).toBe('Test Author');
    });

    it('should allow optional rating', () => {
      const testimonial: Testimonial = {
        text: 'Test testimonial',
        author: 'Test Author',
        rating: 5,
      };

      expect(testimonial.rating).toBe(5);
    });
  });

  describe('NavItem interface', () => {
    it('should allow valid nav item object', () => {
      const navItem: NavItem = {
        name: 'Test',
        href: '/test',
      };

      expect(navItem.name).toBe('Test');
      expect(navItem.href).toBe('/test');
    });
  });

  describe('SEOProps interface', () => {
    it('should allow empty SEO props', () => {
      const seoProps: SEOProps = {};

      expect(seoProps.title).toBeUndefined();
    });

    it('should allow all SEO props', () => {
      const seoProps: SEOProps = {
        title: 'Test Title',
        description: 'Test description',
        image: '/images/og.jpg',
        article: true,
        publishedTime: '2024-01-01' as ISODateString,
        modifiedTime: '2024-01-02' as ISODateString,
        author: 'Author',
        section: 'Blog',
        tags: ['tag1', 'tag2'],
        noindex: false,
      };

      expect(seoProps.title).toBe('Test Title');
      expect(seoProps.article).toBe(true);
      expect(seoProps.tags).toHaveLength(2);
    });
  });
});
