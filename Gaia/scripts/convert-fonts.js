// Simple TTF -> WOFF / WOFF2 batch converter for NouvelR fonts
// Place original .ttf files in public/fonts/nouvelr-src/
// Output written to public/fonts/nouvelr/

import fs from 'fs';
import path from 'path';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';

const SRC_DIR = path.resolve('public', 'fonts', 'nouvelr-src');
const OUT_DIR = path.resolve('public', 'fonts', 'nouvelr');

if (!fs.existsSync(SRC_DIR)) {
  console.error('Source dir missing:', SRC_DIR);
  process.exit(1);
}
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter(f => f.toLowerCase().endsWith('.ttf'));
if (!files.length) {
  console.error('No .ttf files found in', SRC_DIR);
  process.exit(1);
}

files.forEach(file => {
  const inPath = path.join(SRC_DIR, file);
  const baseName = path.parse(file).name; // e.g. NouvelR-Regular
  const ttfBuffer = fs.readFileSync(inPath);

  // WOFF
  try {
    const woff = Buffer.from(ttf2woff(new Uint8Array(ttfBuffer)).buffer);
    fs.writeFileSync(path.join(OUT_DIR, baseName + '.woff'), woff);
    console.log('Generated', baseName + '.woff');
  } catch (e) {
    console.warn('WOFF failed for', file, e.message);
  }

  // WOFF2
  try {
    const woff2 = ttf2woff2(ttfBuffer);
    fs.writeFileSync(path.join(OUT_DIR, baseName + '.woff2'), woff2);
    console.log('Generated', baseName + '.woff2');
  } catch (e) {
    console.warn('WOFF2 failed for', file, e.message);
  }
});

console.log('Done. Place/update @font-face if filenames differ.');
