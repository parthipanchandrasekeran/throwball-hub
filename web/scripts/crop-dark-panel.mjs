// Keeps only the dark artwork panel at the top of an image, dropping a light
// sponsor footer underneath (e.g. "Powered by ..." on a white strip).
//
//   node scripts/crop-dark-panel.mjs "<source image>" "<output image>"
//
// Scans down the left edge and cuts at the last dark row. Pair it with
// make-logo.mjs to turn the result into a square team tile.

import sharp from 'sharp';

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error('Usage: node scripts/crop-dark-panel.mjs <source> <output>');
  process.exit(1);
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const x = Math.min(8, info.width - 1);
let lastDark = -1;
for (let y = 0; y < info.height; y++) {
  const i = (y * info.width + x) * info.channels;
  if (data[i] + data[i + 1] + data[i + 2] < 150) lastDark = y;
}
if (lastDark < 0) {
  console.error('No dark panel found along the left edge.');
  process.exit(1);
}

await sharp(src).extract({ left: 0, top: 0, width: info.width, height: lastDark + 1 }).toFile(out);
console.log(`${out}: ${info.width}x${lastDark + 1} (source ${info.width}x${info.height})`);
