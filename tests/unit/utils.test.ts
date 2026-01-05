import { describe, it, expect } from 'vitest';
import { formatPhoneNumber } from '../../src/lib/utils';

describe('formatPhoneNumber', () => {
  it('should format Colombian phone number correctly', () => {
    const result = formatPhoneNumber('573016963313');
    expect(result).toBe('+57 301 696 3313');
  });

  it('should format Colombian phone number with + prefix', () => {
    const result = formatPhoneNumber('+573173095159');
    expect(result).toBe('+57 317 309 5159');
  });

  it('should return original if format is unexpected (wrong length)', () => {
    const result = formatPhoneNumber('12345');
    expect(result).toBe('12345');
  });

  it('should return original if not Colombian number', () => {
    const result = formatPhoneNumber('14155551234');
    expect(result).toBe('14155551234');
  });

  it('should handle empty string gracefully', () => {
    const result = formatPhoneNumber('');
    expect(result).toBe('');
  });

  it('should preserve original format if not 12 digits', () => {
    const result = formatPhoneNumber('57301696331');
    expect(result).toBe('57301696331');
  });

  it('should format multiple different Colombian numbers consistently', () => {
    expect(formatPhoneNumber('573001234567')).toBe('+57 300 123 4567');
    expect(formatPhoneNumber('573101234567')).toBe('+57 310 123 4567');
    expect(formatPhoneNumber('573201234567')).toBe('+57 320 123 4567');
  });
});
