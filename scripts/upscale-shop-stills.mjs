/**
 * Garment stills were phone-sized JPEGs (~720–1024px). Homepage billboards
 * and retina desktop tiles need ~4K on the long edge. Same crop, more pixels.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "shop");
const TARGET = 3840;

for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".png"))) {
  const file = path.join(dir, name);
  const buf = fs.readFileSync(file);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) {
    console.log("skip (not jpeg bytes)", name);
    continue;
  }
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const long = Math.max(w, h);
  if (!long) continue;
  if (long >= TARGET) {
    console.log("keep", name, `${w}x${h}`);
    continue;
  }
  const scale = TARGET / long;
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);
  const out = await sharp(buf)
    .rotate()
    .resize({ width, height, kernel: "lanczos3" })
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  fs.writeFileSync(file, out);
  console.log(name, `${w}x${h} -> ${width}x${height}`, `${buf.length} -> ${out.length}`);
}
