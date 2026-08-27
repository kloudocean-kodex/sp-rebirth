import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HTML_SECURITY_HEADERS } from '../src/config/http-security';

const staticHeaders = readFileSync(join(process.cwd(), 'public/_headers'), 'utf8');

describe('HTML security header contract', () => {
  it('keeps the static asset policy aligned with the on-demand HTML policy', () => {
    for (const [name, value] of Object.entries(HTML_SECURITY_HEADERS)) {
      expect(staticHeaders).toContain(`${name}: ${value}`);
    }
  });
});
