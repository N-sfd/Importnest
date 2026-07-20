import sharp from "sharp";
import fs from "fs";
import path from "path";

const SIZE = 480;

const JOBS = [
  ["electronics", "phone", "categories/electronics.png", { x: 0.15, y: 0.2 }, { brightness: 1.05, saturation: 1.05, hue: 210 }],
  ["electronics", "headphones", "home/headphones/overear.png", { x: 0.1, y: 0.1 }, { brightness: 1.02, saturation: 1.1, hue: 0 }],
  ["electronics", "monitor", "categories/electronics.png", { x: 0.55, y: 0.15 }, { brightness: 1.08, saturation: 0.95, hue: 200 }],
  ["appliances", "air-purifier", "products/air-purifier.png", { x: 0.1, y: 0.1 }, { brightness: 1.05, saturation: 1.0, hue: 0 }],
  ["appliances", "air-conditioner", "products/appliances/window-ac.jpg", { x: 0.05, y: 0.05 }, { brightness: 1.08, saturation: 1.05, hue: 195 }],
];

async function makeThumb(category, slug, sourceRel, crop, modulate) {
  const srcPath = path.join("public/images", sourceRel);
  if (!fs.existsSync(srcPath)) throw new Error("Missing " + srcPath);
  const meta = await sharp(srcPath).metadata();
  const w = meta.width || SIZE;
  const h = meta.height || SIZE;
  const side = Math.min(w, h, Math.floor(Math.min(w, h) * 0.72));
  const left = Math.max(0, Math.min(w - side, Math.floor(crop.x * (w - side))));
  const top = Math.max(0, Math.min(h - side, Math.floor(crop.y * (h - side))));

  const outDir = path.join("public/images/products", category);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.jpg`);

  const photo = await sharp(srcPath)
    .extract({ left, top, width: side, height: side })
    .resize(SIZE, SIZE, { fit: "cover" })
    .modulate(modulate)
    .sharpen()
    .jpeg({ quality: 84 })
    .toBuffer();

  const vignetteSvg = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="45%" r="72%">
          <stop offset="0%" stop-color="white" stop-opacity="1"/>
          <stop offset="100%" stop-color="#e8eef3" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`,
  );

  await sharp(photo)
    .composite([{ input: vignetteSvg, blend: "multiply", gravity: "center" }])
    .jpeg({ quality: 84 })
    .toFile(outPath);

  console.log("wrote", outPath);
}

for (const job of JOBS) {
  await makeThumb(...job);
}
console.log("done");
