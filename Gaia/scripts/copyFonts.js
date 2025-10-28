// Copy font files from public/fonts to dist/fonts after build (in case Vite didn't inline/copy them automatically)
import { cpSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const srcDir = 'public/fonts';
const destDir = 'dist/fonts';

if (!existsSync(srcDir)) {
  console.log('[copyFonts] No fonts directory, skipping.');
  process.exit(0);
}
if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

cpSync(srcDir, destDir, { recursive: true });
console.log('[copyFonts] Copied fonts to dist/fonts');
