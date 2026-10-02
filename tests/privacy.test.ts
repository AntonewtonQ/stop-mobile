import { describe, expect, it } from 'vitest';

import { PRIVACY_POLICY_URL, privacyPolicies } from '@/features/privacy/privacy';

describe('privacy policy', () => {
  it('uses the public policy URL, not a third-party policy, for the app', () => {
    expect(PRIVACY_POLICY_URL).toBe('https://jogastop.ao/privacidade');
  });

  it.each(['pt', 'en', 'fr'] as const)('keeps %s complete and navigable', (locale) => {
    const copy = privacyPolicies[locale];
    const ids = copy.sections.map((section) => section.id);

    expect(copy.title).toContain('jogastop');
    expect(copy.intro).toContain('Antonewton Quima');
    expect(copy.intro).toContain('Adilson Fernandes');
    expect(copy.sections.find((section) => section.id === 'contacto')?.links).toEqual([
      { label: 'antonewtonquima@gmail.com', href: 'mailto:antonewtonquima@gmail.com' },
    ]);
    expect(copy.publicPolicy).toContain('jogastop.ao');
    expect(copy.openLinkError.length).toBeGreaterThan(0);
    expect(copy.overview).toHaveLength(3);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      'ambito',
      'dados',
      'finalidades',
      'armazenamento',
      'publicidade',
      'partilha',
      'permissoes',
      'conservacao',
      'contacto',
      'menores',
    ]);

    for (const section of copy.sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.body.length).toBeGreaterThan(0);
      for (const link of section.links ?? []) {
        expect(link.label.trim().length).toBeGreaterThan(0);
        expect(['https:', 'mailto:']).toContain(new URL(link.href).protocol);
      }
    }
  });

  it('keeps provider links consistent in every translation', () => {
    const links = (locale: keyof typeof privacyPolicies) =>
      privacyPolicies[locale].sections.flatMap((section) =>
        (section.links ?? []).map((link) => link.href),
      );
    expect(links('en')).toEqual(links('pt'));
    expect(links('fr')).toEqual(links('pt'));
  });
});
