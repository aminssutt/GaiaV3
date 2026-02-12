import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync, rmSync } from "fs";
import { join, resolve } from "path";

/**
 * Copy the Gaia web build into this Capacitor app's webDir (dist/),
 * so the Android WebView loads Gaia instead of dms-app's own frontend.
 *
 * Priority:
 * 1) ../../Gaia/dist-bench
 * 2) ../../Gaia/dist
 */

const repoRoot = resolve(process.cwd(), "..", ".."); // cameratest/dms-app -> GaiaV2
const gaiaDir = join(repoRoot, "Gaia");
const srcCandidates = [join(gaiaDir, "dist-bench"), join(gaiaDir, "dist")];
const src = srcCandidates.find((p) => existsSync(p) && statSync(p).isDirectory());

if (!src) {
  throw new Error(
    [
      "[syncGaiaFrontend] Aucun build Gaia trouvé.",
      `Cherché:`,
      `- ${srcCandidates[0]}`,
      `- ${srcCandidates[1]}`,
      "",
      "Fais d'abord un build dans le dossier Gaia (ex: `npm run build` ou `npm run build:bench`).",
    ].join("\n")
  );
}

const dest = resolve(process.cwd(), "dist"); // webDir in capacitor.config.ts

function copyDirectory(srcDir, destDir) {
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  const entries = readdirSync(srcDir);
  for (const name of entries) {
    const s = join(srcDir, name);
    const d = join(destDir, name);
    const st = statSync(s);
    if (st.isDirectory()) {
      copyDirectory(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

// Clean destination to avoid stale assets
if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

copyDirectory(src, dest);

console.log(`[syncGaiaFrontend] Copié depuis: ${src}`);
console.log(`[syncGaiaFrontend] Vers:        ${dest}`);

