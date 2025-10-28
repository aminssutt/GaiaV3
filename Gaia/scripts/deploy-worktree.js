#!/usr/bin/env node
// Cross-platform deployment using git worktree to avoid ENAMETOOLONG on Windows.
import { execSync } from 'child_process';
import { existsSync, rmSync, cpSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

const WORKTREE_DIR = 'gh-pages-worktree';

try {
  console.log('> Cleaning previous worktree if exists');
  if (existsSync(WORKTREE_DIR)) {
    run(`git worktree remove ${WORKTREE_DIR} -f`);
  }
} catch {}

console.log('> Fetching gh-pages (if exists)');
try { run('git fetch origin gh-pages:gh-pages'); } catch { console.log('No remote gh-pages yet.'); }

console.log('> Adding worktree');
run(`git worktree add ${WORKTREE_DIR} gh-pages || git worktree add ${WORKTREE_DIR} -b gh-pages`);

console.log('> Clearing old published files');
try {
  run(process.platform === 'win32' ? `powershell -Command "Get-ChildItem -Force ${WORKTREE_DIR} | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force"` : `find ${WORKTREE_DIR} -mindepth 1 -not -name '.git' -exec rm -rf {} +`);
} catch (e) { console.warn('Warning clearing worktree:', e.message); }

console.log('> Copying dist contents to worktree root');
if (!existsSync('dist')) {
  throw new Error('dist not found. Run build before deploy.');
}
for (const entry of readdirSync('dist', { withFileTypes: true })) {
  const src = join('dist', entry.name);
  const dest = join(WORKTREE_DIR, entry.name);
  cpSync(src, dest, { recursive: true });
}

// Ensure SPA fallback present (copy from dist if not already handled)
if (!existsSync(join(WORKTREE_DIR, '404.html')) && existsSync(join('dist','404.html'))) {
  cpSync(join('dist', '404.html'), join(WORKTREE_DIR, '404.html'));
}

// Optional CNAME support (uncomment if needed)
// writeFileSync(join(WORKTREE_DIR, 'CNAME'), 'example.com');

console.log('> Committing and pushing');
run(`cd ${WORKTREE_DIR} && git add . && git commit -m "deploy: update site" || echo "Nothing to commit"`);
run(`cd ${WORKTREE_DIR} && git push origin gh-pages`);

console.log('\nDeployment complete. Configure GitHub Pages => gh-pages / root if not already.');
