// Ensure GLB assets are present in the final dist for GitHub Pages
import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'fs';
import { join, extname } from 'path';

const distAvatars = join(process.cwd(), 'dist', 'avatars');
const srcFolders = [
  join(process.cwd(), 'public', 'avatars'),
  join(process.cwd(), 'avatars'),
];

if (!existsSync(distAvatars)) mkdirSync(distAvatars, { recursive: true });

for (const folder of srcFolders) {
  try {
    const files = readdirSync(folder);
    for (const f of files) {
      if (extname(f).toLowerCase() === '.glb') {
        copyFileSync(join(folder, f), join(distAvatars, f));
        console.log(`[copyStatic3d] copied ${f} from ${folder}`);
      }
    }
  } catch (e) {
    // folder may not exist; ignore
  }
}
