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
  StarRating,
} from '../../src/types';
import {
  isValidStarRating,
  toServiceId,
  isValidIconName,
  isValidISODateString,
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

  describe('Branded Types', () => {
    it('should enforce ServiceId type safety', () => {
      // ServiceId requires explicit casting from string
      const serviceId: ServiceId = 'aire-acondicionado' as ServiceId;
      expect(serviceId).toBe('aire-acondicionado');
    });

    it('should enforce ISODateString type safety', () => {
      // ISODateString requires explicit casting from string
      const isoDate: ISODateString = '2024-01-15T00:00:00Z' as ISODateString;
      expect(isoDate).toBe('2024-01-15T00:00:00Z');
    });

    it('should accept valid StarRating values', () => {
      const ratings: StarRating[] = [1, 2, 3, 4, 5];
      expect(ratings).toHaveLength(5);
      expect(ratings[0]).toBe(1);
      expect(ratings[4]).toBe(5);
    });

    it('should accept valid IconName values', () => {
      const validIcons: IconName[] = [
        'air-conditioner',
        'refrigerator',
        'washing-machine',
        'flame',
        'shield-check',
        'users',
        'clock',
      ];
      expect(validIcons).toHaveLength(7);
    });
  });

  describe('Runtime Validation Helpers', () => {
    describe('isValidStarRating', () => {
      it('should validate valid star ratings', () => {
        expect(isValidStarRating(1)).toBe(true);
        expect(isValidStarRating(3)).toBe(true);
        expect(isValidStarRating(5)).toBe(true);
      });

      it('should reject invalid star ratings', () => {
        expect(isValidStarRating(0)).toBe(false);
        expect(isValidStarRating(6)).toBe(false);
        expect(isValidStarRating(-1)).toBe(false);
        expect(isValidStarRating(3.5)).toBe(false);
      });

      it('should narrow type when valid', () => {
        const rating = 5;
        if (isValidStarRating(rating)) {
          const typedRating: StarRating = rating;
          expect(typedRating).toBe(5);
        }
      });
    });

    describe('toServiceId', () => {
      it('should convert valid service IDs', () => {
        expect(toServiceId('aire-acondicionado')).toBe('aire-acondicionado');
        expect(toServiceId('neveras')).toBe('neveras');
        expect(toServiceId('lavadoras')).toBe('lavadoras');
        expect(toServiceId('calentadores')).toBe('calentadores');
      });

      it('should throw error for invalid service IDs', () => {
        expect(() => toServiceId('invalid-service')).toThrow(
          'Invalid service ID: invalid-service'
        );
        expect(() => toServiceId('')).toThrow();
      });
    });

    describe('isValidIconName', () => {
      it('should validate valid icon names', () => {
        expect(isValidIconName('air-conditioner')).toBe(true);
        expect(isValidIconName('refrigerator')).toBe(true);
        expect(isValidIconName('shield-check')).toBe(true);
      });

      it('should reject invalid icon names', () => {
        expect(isValidIconName('invalid-icon')).toBe(false);
        expect(isValidIconName('')).toBe(false);
        expect(isValidIconName('AIR-CONDITIONER')).toBe(false);
      });

      it('should narrow type when valid', () => {
        const icon = 'flame';
        if (isValidIconName(icon)) {
          const typedIcon: IconName = icon;
          expect(typedIcon).toBe('flame');
        }
      });
    });

    describe('isValidISODateString', () => {
      it('should validate valid ISO date strings', () => {
        expect(isValidISODateString('2024-01-15')).toBe(true);
        expect(isValidISODateString('2024-01-15T00:00:00')).toBe(true);
        expect(isValidISODateString('2024-01-15T00:00:00Z')).toBe(true);
        expect(isValidISODateString('2024-01-15T00:00:00.000Z')).toBe(true);
      });

      it('should reject invalid ISO date strings', () => {
        expect(isValidISODateString('invalid-date')).toBe(false);
        expect(isValidISODateString('2024-13-01')).toBe(false);
        expect(isValidISODateString('15/01/2024')).toBe(false);
        expect(isValidISODateString('')).toBe(false);
      });

      it('should narrow type when valid', () => {
        const dateString = '2024-01-15T00:00:00Z';
        if (isValidISODateString(dateString)) {
          const typedDate: ISODateString = dateString;
          expect(typedDate).toBe('2024-01-15T00:00:00Z');
        }
      });
    });
  });
});
