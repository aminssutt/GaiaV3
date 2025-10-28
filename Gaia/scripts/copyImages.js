import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const src = join(process.cwd(), 'images');
const dest = join(process.cwd(), 'dist', 'images');

if (!existsSync(dest)) mkdirSync(dest, { recursive: true });

function copyDirectory(srcDir, destDir) {
  try {
    const files = readdirSync(srcDir);
    for (const f of files) {
      const srcPath = join(srcDir, f);
      const destPath = join(destDir, f);
      
      if (statSync(srcPath).isDirectory()) {
        if (!existsSync(destPath)) mkdirSync(destPath, { recursive: true });
        copyDirectory(srcPath, destPath);
      } else {
        const ext = extname(f).toLowerCase();
        if (['.png', '.webp', '.jpg', '.jpeg'].includes(ext)) {
          copyFileSync(srcPath, destPath);
          console.log(`[copyImages] copied ${f}`);
        }
      }
    }
  } catch (e) {
    console.warn(`[copyImages] Failed to copy directory ${srcDir}:`, e.message);
  }
}

copyDirectory(src, dest);