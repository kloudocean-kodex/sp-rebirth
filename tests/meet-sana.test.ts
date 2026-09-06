import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE } from '../src/config/site';

const source = readFileSync(new URL('../src/pages/about/index.astro', import.meta.url), 'utf8');
const portrait = readFileSync(new URL('../public/media/sana-patel-meet-portrait.jpg', import.meta.url));
const desk = readFileSync(new URL('../public/media/sana-patel-meet-desk.jpg', import.meta.url));

const isJpeg = (buffer: Buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

describe('Sana final Meet page contract', () => {
  it('uses Sana latest supplied framed founder photography as valid image assets', () => {
    expect(source).toContain('/media/sana-patel-meet-portrait.jpg');
    expect(source).toContain('/media/sana-patel-meet-desk.jpg');
    expect(source).not.toContain('sana-patel-meet-portrait.webp');
    expect(source).not.toContain('sana-patel-meet-desk.webp');
    expect(source).not.toContain('Sana-headshot.webp');
    expect(source).not.toContain('WhatsApp-Image-2025-09-30');
    expect(SITE.founder.image).toBe('https://www.sanapatel.com.au/media/sana-patel-meet-portrait.jpg');
    expect(isJpeg(portrait)).toBe(true);
    expect(isJpeg(desk)).toBe(true);
  });

  it('preserves the supplied image compositions instead of cropping or adding another frame', () => {
    expect(source).toContain('object-fit: contain');
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
