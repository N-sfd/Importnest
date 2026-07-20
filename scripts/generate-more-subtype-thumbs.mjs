import sharp from "sharp";
import fs from "fs";
import path from "path";

const SIZE = 480;

/** [category, slug, sourceRel, crop, modulate] */
const JOBS = [
  // Electronics extras
  ["electronics", "camera", "categories/electronics.png", { x: 0.35, y: 0.55 }, { brightness: 1.05, saturation: 1.1, hue: 30 }],
  ["electronics", "gaming", "categories/electronics.png", { x: 0.7, y: 0.6 }, { brightness: 0.95, saturation: 1.2, hue: 280 }],
  ["electronics", "laptop", "products/electronics/ultrabook.jpg", { x: 0.1, y: 0.1 }, { brightness: 1.02, saturation: 1.0, hue: 0 }],

  // Appliances extras
  ["appliances", "refrigerator", "categories/appliances.png", { x: 0.05, y: 0.6 }, { brightness: 1.1, saturation: 0.9, hue: 200 }],
  ["appliances", "coffee-maker", "categories/kitchen.png", { x: 0.2, y: 0.15 }, { brightness: 1.05, saturation: 1.1, hue: 20 }],
  ["appliances", "washing-machine", "categories/appliances.png", { x: 0.8, y: 0.55 }, { brightness: 1.0, saturation: 0.95, hue: 210 }],

  // Kitchen extras
  ["kitchen", "dinnerware", "categories/kitchen.png", { x: 0.55, y: 0.05 }, { brightness: 1.12, saturation: 1.05, hue: 10 }],
  ["kitchen", "utensils", "categories/kitchen.png", { x: 0.8, y: 0.25 }, { brightness: 1.0, saturation: 1.15, hue: 35 }],
  ["kitchen", "blender", "categories/kitchen.png", { x: 0.1, y: 0.7 }, { brightness: 1.05, saturation: 1.0, hue: 190 }],
  ["kitchen", "coffee-machine", "categories/kitchen.png", { x: 0.4, y: 0.7 }, { brightness: 0.98, saturation: 1.1, hue: 25 }],
  ["kitchen", "bakeware", "categories/kitchen.png", { x: 0.65, y: 0.65 }, { brightness: 1.08, saturation: 1.2, hue: 15 }],
  ["kitchen", "kitchen-organizer", "categories/kitchen.png", { x: 0.9, y: 0.5 }, { brightness: 1.05, saturation: 0.95, hue: 50 }],

  // Beauty extras
  ["beauty", "hair-straightener", "categories/beauty.png", { x: 0.05, y: 0.7 }, { brightness: 1.1, saturation: 1.0, hue: 300 }],
  ["beauty", "grooming-kit", "categories/beauty.png", { x: 0.85, y: 0.7 }, { brightness: 1.0, saturation: 1.1, hue: 220 }],

  // Footwear extras
  ["footwear", "running-shoe", "products/running-shoe.png", { x: 0.05, y: 0.05 }, { brightness: 1.05, saturation: 1.15, hue: 0 }],
  ["footwear", "casual-shoe", "categories/footwear.png", { x: 0.85, y: 0.55 }, { brightness: 1.1, saturation: 0.95, hue: 25 }],
  ["footwear", "dress-shoe", "categories/footwear.png", { x: 0.1, y: 0.75 }, { brightness: 0.9, saturation: 0.85, hue: 15 }],
  ["footwear", "slip-on", "products/footwear/loafer.jpg", { x: 0.15, y: 0.15 }, { brightness: 1.05, saturation: 1.0, hue: 10 }],

  // Accessories extras
  ["accessories", "laptop-sleeve", "categories/accessories.png", { x: 0.05, y: 0.75 }, { brightness: 1.0, saturation: 1.05, hue: 200 }],
  ["accessories", "wireless-charging-pad", "categories/electronics.png", { x: 0.55, y: 0.75 }, { brightness: 1.08, saturation: 0.9, hue: 190 }],

  // Automotive extras
  ["automotive", "battery-charger", "home/automotive/car-usb-charger.png", { x: 0.1, y: 0.1 }, { brightness: 1.05, saturation: 1.1, hue: 0 }],
  ["automotive", "seat-cover", "categories/automotive.png", { x: 0.1, y: 0.75 }, { brightness: 0.95, saturation: 1.05, hue: 20 }],
  ["automotive", "windshield-wipers", "categories/automotive.png", { x: 0.85, y: 0.65 }, { brightness: 1.1, saturation: 0.95, hue: 200 }],
  ["automotive", "tool-kit", "categories/automotive.png", { x: 0.45, y: 0.75 }, { brightness: 1.0, saturation: 1.15, hue: 35 }],

  // Outdoors extras
  ["outdoors", "cooler", "categories/outdoors.png", { x: 0.05, y: 0.75 }, { brightness: 1.08, saturation: 1.1, hue: 190 }],
  ["outdoors", "picnic-blanket", "categories/outdoors.png", { x: 0.5, y: 0.75 }, { brightness: 1.12, saturation: 1.2, hue: 80 }],
  ["outdoors", "travel-bag", "categories/outdoors.png", { x: 0.85, y: 0.7 }, { brightness: 0.98, saturation: 1.05, hue: 30 }],
  ["outdoors", "hiking-bottle", "products/outdoors/water-bottle.jpg", { x: 0.1, y: 0.1 }, { brightness: 1.05, saturation: 1.1, hue: 0 }],

  // Home extras
  ["home", "rug", "categories/home.png", { x: 0.05, y: 0.75 }, { brightness: 1.05, saturation: 1.15, hue: 20 }],
  ["home", "home-organizer", "categories/home.png", { x: 0.85, y: 0.7 }, { brightness: 1.0, saturation: 0.95, hue: 200 }],
  ["home", "air-purifier", "products/air-purifier.png", { x: 0.1, y: 0.1 }, { brightness: 1.05, saturation: 1.0, hue: 0 }],
];

async function makeThumb(category, slug, sourceRel, crop, modulate) {
  const srcPath = path.join("public/images", sourceRel);
  if (!fs.existsSync(srcPath)) throw new Error("Missing " + srcPath);
  const meta = await sharp(srcPath).metadata();
  const w = meta.width || SIZE;
  const h = meta.height || SIZE;
  const side = Math.min(w, h, Math.floor(Math.min(w, h) * 0.7));
  const left = Math.max(0, Math.min(w - side, Math.floor(crop.x * (w - side))));
  const top = Math.max(0, Math.min(h - side, Math.floor(crop.y * (h - side))));

  const outDir = path.join("public/images/products", category);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.jpg`);

  // Soft studio plate unique tint per slug hash
  const hueShift = (slug.length * 37) % 360;
  const plateColor = {
    r: 230 + (hueShift % 20),
    g: 235 + ((hueShift * 2) % 15),
    b: 240 + ((hueShift * 3) % 12),
  };

  const photo = await sharp(srcPath)
    .extract({ left, top, width: side, height: side })
    .resize(Math.round(SIZE * 0.86), Math.round(SIZE * 0.86), { fit: "cover" })
    .modulate(modulate)
    .sharpen()
    .jpeg({ quality: 85 })
    .toBuffer();

  const plate = await sharp({
    create: { width: SIZE, height: SIZE, channels: 3, background: plateColor },
  })
    .jpeg()
    .toBuffer();

  await sharp(plate)
    .composite([{ input: photo, gravity: "center" }])
    .jpeg({ quality: 85 })
    .toFile(outPath);

  console.log("wrote", outPath);
}

for (const job of JOBS) {
  await makeThumb(...job);
}
console.log("done", JOBS.length);
