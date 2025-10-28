// Creates a 404.html copy of index.html for GitHub Pages SPA routing.
// GitHub Pages serves 404.html when a deep link is requested; this lets the SPA handle routing.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');
const indexPath = join(distDir, 'index.html');
const notFoundPath = join(distDir, '404.html');

if (!existsSync(indexPath)) {
  console.error('index.html not found in dist. Did the build succeed?');
  process.exit(1);
}

try {
  const html = readFileSync(indexPath, 'utf-8');
  writeFileSync(notFoundPath, html);
  console.log('Created 404.html for SPA fallback.');
} catch (e) {
  console.error('Failed to create 404.html', e);
  process.exit(1);
}
