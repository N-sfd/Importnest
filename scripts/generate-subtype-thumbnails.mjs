import sharp from "sharp";
import fs from "fs";
import path from "path";

const SIZE = 480;

/** [category, subtypeSlug, sourceRelative, cropFrac {x,y}, modulate] */
const JOBS = [
  ["footwear", "trail-runner", "products/running-shoe.png", { x: 0.05, y: 0.05 }, { brightness: 1.05, saturation: 1.1, hue: 0 }],
  ["footwear", "canvas-sneaker", "categories/footwear.png", { x: 0.35, y: 0.1 }, { brightness: 1.08, saturation: 0.95, hue: 8 }],
  ["footwear", "hiking-boot", "categories/footwear.png", { x: 0.55, y: 0.25 }, { brightness: 0.95, saturation: 1.05, hue: 350 }],
  ["footwear", "loafer", "categories/footwear.png", { x: 0.15, y: 0.35 }, { brightness: 1.1, saturation: 0.9, hue: 20 }],
  ["footwear", "sandal", "categories/footwear.png", { x: 0.7, y: 0.05 }, { brightness: 1.12, saturation: 1.15, hue: 30 }],
  ["footwear", "winter-boot", "categories/footwear.png", { x: 0.45, y: 0.45 }, { brightness: 0.88, saturation: 0.85, hue: 210 }],
  ["footwear", "training-shoe", "products/running-shoe.png", { x: 0.25, y: 0.2 }, { brightness: 1.0, saturation: 1.2, hue: 40 }],
  ["footwear", "chukka-boot", "categories/footwear.png", { x: 0.0, y: 0.2 }, { brightness: 0.92, saturation: 1.0, hue: 15 }],

  ["accessories", "wallet", "categories/accessories.png", { x: 0.05, y: 0.1 }, { brightness: 1.05, saturation: 1.0, hue: 0 }],
  ["accessories", "backpack", "categories/accessories.png", { x: 0.4, y: 0.05 }, { brightness: 1.0, saturation: 1.1, hue: 200 }],
  ["accessories", "phone-case", "categories/accessories.png", { x: 0.65, y: 0.2 }, { brightness: 1.08, saturation: 0.95, hue: 280 }],
  ["accessories", "travel-organizer", "categories/accessories.png", { x: 0.2, y: 0.4 }, { brightness: 0.98, saturation: 1.05, hue: 40 }],
  ["accessories", "sunglasses", "categories/accessories.png", { x: 0.5, y: 0.35 }, { brightness: 1.1, saturation: 1.15, hue: 50 }],
  ["accessories", "cable-set", "categories/electronics.png", { x: 0.1, y: 0.5 }, { brightness: 1.05, saturation: 0.9, hue: 190 }],
  ["accessories", "crossbody-bag", "categories/accessories.png", { x: 0.75, y: 0.45 }, { brightness: 0.95, saturation: 1.05, hue: 10 }],
  ["accessories", "watch-band", "categories/accessories.png", { x: 0.3, y: 0.55 }, { brightness: 1.02, saturation: 1.0, hue: 320 }],

  ["beauty", "hair-dryer", "categories/beauty.png", { x: 0.05, y: 0.05 }, { brightness: 1.08, saturation: 1.05, hue: 320 }],
  ["beauty", "facial-cleansing-brush", "categories/beauty.png", { x: 0.4, y: 0.1 }, { brightness: 1.12, saturation: 0.95, hue: 300 }],
  ["beauty", "electric-shaver", "categories/beauty.png", { x: 0.65, y: 0.25 }, { brightness: 1.0, saturation: 0.9, hue: 210 }],
  ["beauty", "skincare-fridge", "categories/beauty.png", { x: 0.15, y: 0.4 }, { brightness: 1.1, saturation: 1.1, hue: 180 }],
  ["beauty", "curling-iron", "categories/beauty.png", { x: 0.5, y: 0.45 }, { brightness: 0.98, saturation: 1.05, hue: 340 }],
  ["beauty", "led-mirror", "categories/beauty.png", { x: 0.7, y: 0.05 }, { brightness: 1.15, saturation: 0.85, hue: 50 }],
  ["beauty", "massage-tool", "categories/beauty.png", { x: 0.25, y: 0.55 }, { brightness: 1.05, saturation: 1.15, hue: 10 }],
  ["beauty", "manicure-kit", "categories/beauty.png", { x: 0.55, y: 0.55 }, { brightness: 1.08, saturation: 1.2, hue: 330 }],

  ["appliances", "dishwasher", "products/dishwasher.png", { x: 0.1, y: 0.1 }, { brightness: 1.0, saturation: 1.0, hue: 0 }],
  ["appliances", "vacuum", "products/cordless-vacuum.png", { x: 0.1, y: 0.1 }, { brightness: 1.02, saturation: 1.05, hue: 0 }],
  ["appliances", "microwave", "categories/appliances.png", { x: 0.05, y: 0.05 }, { brightness: 1.05, saturation: 0.95, hue: 200 }],
  ["appliances", "toaster-oven", "categories/appliances.png", { x: 0.4, y: 0.1 }, { brightness: 1.08, saturation: 1.05, hue: 20 }],
  ["appliances", "upright-vacuum", "products/cordless-vacuum.png", { x: 0.3, y: 0.25 }, { brightness: 0.95, saturation: 1.1, hue: 190 }],
  ["appliances", "slow-cooker", "categories/appliances.png", { x: 0.65, y: 0.3 }, { brightness: 1.0, saturation: 1.1, hue: 15 }],
  ["appliances", "air-fryer", "categories/appliances.png", { x: 0.2, y: 0.45 }, { brightness: 1.05, saturation: 1.15, hue: 30 }],
  ["appliances", "freezer", "categories/appliances.png", { x: 0.55, y: 0.5 }, { brightness: 0.92, saturation: 0.9, hue: 210 }],
  ["appliances", "window-ac", "home/categories/appliances.png", { x: 0.1, y: 0.2 }, { brightness: 1.1, saturation: 1.0, hue: 195 }],
  ["appliances", "dehumidifier", "categories/appliances.png", { x: 0.75, y: 0.15 }, { brightness: 1.0, saturation: 0.95, hue: 170 }],

  ["kitchen", "cookware", "categories/kitchen.png", { x: 0.05, y: 0.1 }, { brightness: 1.05, saturation: 1.1, hue: 10 }],
  ["kitchen", "pour-over", "categories/kitchen.png", { x: 0.4, y: 0.05 }, { brightness: 1.08, saturation: 1.0, hue: 25 }],
  ["kitchen", "knife-block", "categories/kitchen.png", { x: 0.65, y: 0.2 }, { brightness: 0.95, saturation: 1.05, hue: 0 }],
  ["kitchen", "stand-mixer", "categories/kitchen.png", { x: 0.2, y: 0.4 }, { brightness: 1.1, saturation: 1.15, hue: 340 }],
  ["kitchen", "cutting-board", "categories/kitchen.png", { x: 0.5, y: 0.45 }, { brightness: 1.05, saturation: 1.2, hue: 35 }],
  ["kitchen", "kettle", "categories/kitchen.png", { x: 0.75, y: 0.4 }, { brightness: 1.0, saturation: 0.95, hue: 200 }],
  ["kitchen", "food-storage", "categories/kitchen.png", { x: 0.1, y: 0.55 }, { brightness: 1.08, saturation: 0.9, hue: 180 }],
  ["kitchen", "cast-iron", "categories/kitchen.png", { x: 0.45, y: 0.55 }, { brightness: 0.9, saturation: 1.0, hue: 15 }],

  ["home", "blanket", "categories/home.png", { x: 0.05, y: 0.1 }, { brightness: 1.08, saturation: 1.05, hue: 20 }],
  ["home", "table-lamp", "categories/home.png", { x: 0.4, y: 0.05 }, { brightness: 1.12, saturation: 1.0, hue: 40 }],
  ["home", "storage-bins", "categories/home.png", { x: 0.65, y: 0.25 }, { brightness: 1.0, saturation: 0.95, hue: 200 }],
  ["home", "throw-pillow", "categories/home.png", { x: 0.2, y: 0.4 }, { brightness: 1.1, saturation: 1.15, hue: 330 }],
  ["home", "air-filter", "products/air-purifier.png", { x: 0.15, y: 0.15 }, { brightness: 1.05, saturation: 1.0, hue: 0 }],
  ["home", "wall-clock", "categories/home.png", { x: 0.5, y: 0.45 }, { brightness: 0.98, saturation: 1.05, hue: 15 }],
  ["home", "diffuser", "categories/home.png", { x: 0.75, y: 0.5 }, { brightness: 1.08, saturation: 1.1, hue: 280 }],
  ["home", "curtains", "categories/home.png", { x: 0.3, y: 0.55 }, { brightness: 1.05, saturation: 0.9, hue: 50 }],

  ["electronics", "ultrabook", "categories/electronics.png", { x: 0.05, y: 0.1 }, { brightness: 1.0, saturation: 1.0, hue: 200 }],
  ["electronics", "earbuds", "home/headphones/airbuds-pro-3.png", { x: 0.1, y: 0.1 }, { brightness: 1.05, saturation: 1.05, hue: 0 }],
  ["electronics", "streaming-stick", "categories/electronics.png", { x: 0.5, y: 0.2 }, { brightness: 1.08, saturation: 0.95, hue: 210 }],
  ["electronics", "smartwatch", "categories/electronics.png", { x: 0.7, y: 0.4 }, { brightness: 1.0, saturation: 1.1, hue: 190 }],
  ["electronics", "tablet", "categories/electronics.png", { x: 0.25, y: 0.45 }, { brightness: 1.05, saturation: 1.0, hue: 220 }],
  ["electronics", "keyboard", "categories/electronics.png", { x: 0.55, y: 0.55 }, { brightness: 0.95, saturation: 0.9, hue: 0 }],
  ["electronics", "ssd", "categories/electronics.png", { x: 0.1, y: 0.55 }, { brightness: 1.1, saturation: 1.05, hue: 180 }],
  ["electronics", "speaker", "home/headphones/overear.png", { x: 0.2, y: 0.2 }, { brightness: 1.02, saturation: 1.1, hue: 30 }],

  ["automotive", "dash-cam", "categories/automotive.png", { x: 0.05, y: 0.1 }, { brightness: 1.0, saturation: 1.05, hue: 0 }],
  ["automotive", "jump-starter", "home/automotive/car-jump-starter.png", { x: 0.1, y: 0.1 }, { brightness: 1.05, saturation: 1.0, hue: 0 }],
  ["automotive", "cargo-organizer", "categories/automotive.png", { x: 0.45, y: 0.2 }, { brightness: 0.98, saturation: 1.1, hue: 20 }],
  ["automotive", "headlight-kit", "categories/automotive.png", { x: 0.7, y: 0.15 }, { brightness: 1.12, saturation: 1.15, hue: 50 }],
  ["automotive", "phone-mount", "home/automotive/car-phone-mount.png", { x: 0.15, y: 0.15 }, { brightness: 1.05, saturation: 1.0, hue: 0 }],
  ["automotive", "floor-mats", "categories/automotive.png", { x: 0.2, y: 0.5 }, { brightness: 0.92, saturation: 0.95, hue: 15 }],
  ["automotive", "tire-inflator", "categories/automotive.png", { x: 0.55, y: 0.5 }, { brightness: 1.0, saturation: 1.05, hue: 200 }],
  ["automotive", "car-vacuum", "home/automotive/car-usb-charger.png", { x: 0.2, y: 0.2 }, { brightness: 1.08, saturation: 1.1, hue: 190 }],

  ["outdoors", "daypack", "categories/outdoors.png", { x: 0.05, y: 0.1 }, { brightness: 1.05, saturation: 1.1, hue: 100 }],
  ["outdoors", "tent", "categories/outdoors.png", { x: 0.4, y: 0.05 }, { brightness: 1.08, saturation: 1.15, hue: 80 }],
  ["outdoors", "sleeping-bag", "categories/outdoors.png", { x: 0.65, y: 0.25 }, { brightness: 0.98, saturation: 1.0, hue: 30 }],
  ["outdoors", "camp-stove", "categories/outdoors.png", { x: 0.15, y: 0.4 }, { brightness: 1.0, saturation: 1.1, hue: 15 }],
  ["outdoors", "water-bottle", "categories/outdoors.png", { x: 0.5, y: 0.45 }, { brightness: 1.1, saturation: 1.05, hue: 190 }],
  ["outdoors", "trekking-poles", "categories/outdoors.png", { x: 0.75, y: 0.4 }, { brightness: 0.95, saturation: 1.0, hue: 40 }],
  ["outdoors", "lantern", "home/categories/outdoors.png", { x: 0.2, y: 0.55 }, { brightness: 1.12, saturation: 1.2, hue: 50 }],
  ["outdoors", "camp-chair", "categories/outdoors.png", { x: 0.35, y: 0.55 }, { brightness: 1.05, saturation: 1.1, hue: 120 }],
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

  return outPath;
}

let ok = 0;
for (const [cat, slug, src, crop, mod] of JOBS) {
  const p = await makeThumb(cat, slug, src, crop, mod);
  ok++;
  console.log("wrote", p);
}
console.log("done", ok);
