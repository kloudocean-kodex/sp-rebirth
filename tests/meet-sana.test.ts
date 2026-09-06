import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE } from '../src/config/site';

const source = readFileSync(new URL('../src/pages/about/index.astro', import.meta.url), 'utf8');
const founderArtwork = readFileSync(new URL('../public/media/founder-concept-placeholder.svg', import.meta.url), 'utf8');
const detailArtwork = readFileSync(
  new URL('../public/media/property-management-detail-placeholder.svg', import.meta.url),
  'utf8',
);

describe('Sana final Meet page contract', () => {
  it('uses valid local review artwork without presenting an unverified founder photo as structured data', () => {
    expect(source).toContain('/media/founder-concept-placeholder.svg');
    expect(source).toContain('/media/property-management-detail-placeholder.svg');
    expect(source).not.toContain('sana-patel-meet-portrait.jpg');
    expect(source).not.toContain('sana-patel-meet-desk.jpg');
    expect(source).not.toContain('sana-patel-meet-portrait.webp');
    expect(source).not.toContain('sana-patel-meet-desk.webp');
    expect(source).not.toContain('Sana-headshot.webp');
    expect(source).not.toContain('WhatsApp-Image-2025-09-30');
    expect(source).not.toContain('const founderImage');
    expect(source).not.toContain('image: founderImage');
    expect(SITE.founder.image).toBeNull();
    expect(founderArtwork).toContain('<svg');
    expect(founderArtwork).toContain('Founder portrait concept placeholder');
    expect(detailArtwork).toContain('<svg');
    expect(detailArtwork).toContain('Property management editorial illustration');
  });

  it('keeps review artwork uncropped and avoids adding another portrait frame', () => {
    expect(source).toContain('object-fit: contain');
    expect(source).toContain('aspect-ratio: 4 / 5');
    expect(source).not.toContain('.meet-hero__portrait::before');
  });

  it('preserves Sana supplied introduction, career and personal-standard wording', () => {
    for (const text of [
      'Meet Sana Patel',
      'Licensed Estate Agent',
      '10+ Years in Property Management',
      'From Receptionist to Licensed Estate Agent',
      'The details matter.',
      'Why Sana Patel Real Estate',
      'When Your Name Is on the Business, the Standard is personal.',
      'Your Property. My Priority.',
      'Get a Rental Health Check',
      'Change Your Property Manager',
    ]) {
      expect(source).toContain(text);
    }
  });

  it('removes older biography claims that are not part of the final Meet page brief', () => {
    expect(source).not.toMatch(/hospitality|aviation/i);
    expect(source).not.toContain('Service standards shaped long before real estate.');
    expect(source).not.toContain('Quietly thorough. Personally involved.');
  });
});
