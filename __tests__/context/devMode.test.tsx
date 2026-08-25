import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * The dev affordances must be behind an env guard. Asserted against the
 * source because import.meta.env.DEV is fixed to true under vitest.
 */
describe('DevMode production gating', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../../src/context/DevModeContext.tsx'),
    'utf8'
  );

  it('guards the global handle, the shortcut and the banner', () => {
    expect(source).toContain('import.meta.env.DEV');

    const guardCount = (source.match(/import\.meta\.env\.DEV/g) || []).length;
    expect(guardCount).toBeGreaterThanOrEqual(2);
  });

  it('does not attach window.enableDevMode unconditionally', () => {
    const attachIndex = source.indexOf('window.enableDevMode =');
    const guardIndex = source.indexOf('import.meta.env.DEV');
    expect(attachIndex).toBeGreaterThan(guardIndex);
  });
});
