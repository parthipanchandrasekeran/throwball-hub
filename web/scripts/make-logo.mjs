// Turns any team logo image into a square 512px PNG for public/team-logos/.
//
//   node scripts/make-logo.mjs "<source image>" <slug> [<source> <slug> ...]
//
// Trims the flat border (white or transparent), fits the artwork into a
// square with transparent padding, and writes public/team-logos/<slug>.png.
// Then point the team at it: UPDATE teams SET logo_url = '/team-logos/<slug>.png'.
// Uses sharp, which ships with Next.js, so no extra install.

import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/team-logos');
const SIZE = 512;
const PAD = 28;
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

const args = process.argv.slice(2);
if (args.length === 0 || args.length % 2 !== 0) {
  console.error('Usage: node scripts/make-logo.mjs <source> <slug> [<source> <slug> ...]');
  process.exit(1);
}

for (let i = 0; i < args.length; i += 2) {
  const src = args[i];
  const slug = args[i + 1];
  const out = path.join(OUT_DIR, `${slug}.png`);

  const trimmed = await sharp(src).ensureAlpha().trim({ threshold: 25 }).toBuffer();
  await sharp(trimmed)
    .resize(SIZE - PAD * 2, SIZE - PAD * 2, { fit: 'contain', background: CLEAR })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: CLEAR })
    .png()
    .toFile(out);

  const meta = await sharp(out).metadata();
  console.log(`${slug}.png ${meta.width}x${meta.height}  <-  ${path.basename(src)}`);
}
