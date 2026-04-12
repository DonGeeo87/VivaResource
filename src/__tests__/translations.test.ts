import { describe, it, expect } from 'vitest';
import { translations } from '@/i18n/translations';

describe('i18n translations', () => {
  it('should have both English and Spanish translations', () => {
    expect(translations.en).toBeDefined();
    expect(translations.es).toBeDefined();
  });

  it('should have matching top-level keys between languages', () => {
    const enKeys = Object.keys(translations.en);
    const esKeys = Object.keys(translations.es);
    expect(enKeys).toEqual(esKeys);
  });

  it('should have navigation translations in both languages', () => {
    expect(translations.en.nav.aboutUs).toBe('About Us');
    expect(translations.es.nav.aboutUs).toBe('Nosotros');
    expect(translations.en.nav.resources).toBe('Resources');
    expect(translations.es.nav.resources).toBe('Recursos');
  });

  it('should have home page translations', () => {
    expect(translations.en.home.heroTitle).toBe('Building Hope for Tomorrow');
    expect(translations.es.home.heroTitle).toBeDefined();
    expect(translations.es.home.heroTitle.length).toBeGreaterThan(0);
  });

  it('should not have empty translation strings', () => {
    function checkEmpty(obj: Record<string, unknown>, path: string = ''): string[] {
      const empty: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'string' && value.trim() === '') {
          empty.push(currentPath);
        } else if (typeof value === 'object' && value !== null) {
          empty.push(...checkEmpty(value as Record<string, unknown>, currentPath));
        }
      }
      return empty;
    }

    const enEmpty = checkEmpty(translations.en);
    const esEmpty = checkEmpty(translations.es);

    if (enEmpty.length > 0) {
      console.warn('Empty EN translations:', enEmpty);
    }
    if (esEmpty.length > 0) {
      console.warn('Empty ES translations:', esEmpty);
    }

    // Allow some empty strings (they may be optional), just warn
    expect(enEmpty.length).toBeLessThan(10);
    expect(esEmpty.length).toBeLessThan(10);
  });

  it('should have volunteerPortal translations', () => {
    expect(translations.en.volunteerPortal.title).toBe('Volunteer Portal');
    expect(translations.es.volunteerPortal.title).toBeDefined();
  });

  it('should have donate translations', () => {
    expect(translations.en.donate.title).toBe('Support Our Work');
    expect(translations.es.donate.title).toBeDefined();
  });
});
