/**
 * Campaign film frames are 720×1280 phone extracts. Desktop hero is a
 * full viewport, so they look pixelated. 2× lanczos, same crop/timing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "frames");
const SCALE = 2;

const files = fs.readdirSync(dir).filter((n) => n.endsWith(".jpg")).sort();
let done = 0;
for (const name of files) {
  const file = path.join(dir, name);
  const buf = fs.readFileSync(file);
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) continue;
  if (w >= 1440) {
    done += 1;
    continue;
  }
  const out = await sharp(buf)
    .rotate()
    .resize({
      width: Math.round(w * SCALE),
      height: Math.round(h * SCALE),
      kernel: "lanczos3",
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(file, out);
  done += 1;
  if (done === 1 || done % 40 === 0 || done === files.length) {
    console.log(`${done}/${files.length}`, name, `${w}x${h} -> ${w * SCALE}x${h * SCALE}`);
  }
}
