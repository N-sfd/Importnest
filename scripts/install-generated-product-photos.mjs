/**
 * Copies generated studio product photos from Cursor assets/ into
 * public/images/products/{category}/ as 640×640 JPEGs on #F7FAFC.
 *
 * Usage: node scripts/install-generated-product-photos.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import os from "os";

const SIZE = 640;
const BG = { r: 247, g: 250, b: 252, alpha: 1 };
const assets = path.join(
  os.homedir(),
  ".cursor",
  "projects",
  "e-projects-AI-Projects-Importnest",
  "assets",
);

/** asset filename → [category, dest filename, ...optional extra dests] */
const MAP = [
  ["wallet.jpg", "accessories", "wallet.jpg"],
  ["backpack.jpg", "accessories", "backpack.jpg"],
  ["phone-case.jpg", "accessories", "phone-case.jpg"],
  ["sunglasses.jpg", "accessories", "sunglasses.jpg"],
  ["watch-band.jpg", "accessories", "watch-band.jpg"],
  ["cable-set.jpg", "accessories", "cable-set.jpg"],
  ["travel-organizer.jpg", "accessories", "travel-organizer.jpg"],
  ["crossbody-bag.jpg", "accessories", "crossbody-bag.jpg"],
  ["laptop-sleeve.jpg", "accessories", "laptop-sleeve.jpg"],
  ["wireless-charger.jpg", "accessories", "wireless-charger.jpg", "wireless-charging-pad.jpg"],
  ["cookware.jpg", "kitchen", "cookware.jpg"],
  ["dinnerware.jpg", "kitchen", "dinnerware.jpg"],
  ["blender.jpg", "kitchen", "blender.jpg"],
  ["coffee-machine.jpg", "kitchen", "coffee-machine.jpg"],
  ["kettle.jpg", "kitchen", "kettle.jpg"],
  ["cutting-board.jpg", "kitchen", "cutting-board.jpg"],
  ["food-storage.jpg", "kitchen", "food-storage.jpg"],
  ["bakeware.jpg", "kitchen", "bakeware.jpg"],
  ["knife-set.jpg", "kitchen", "knife-set.jpg", "knife-block.jpg"],
  ["kitchen-organizer.jpg", "kitchen", "kitchen-organizer.jpg"],
  ["utensils.jpg", "kitchen", "utensils.jpg"],
  ["cast-iron.jpg", "kitchen", "cast-iron.jpg"],
  ["pour-over.jpg", "kitchen", "pour-over.jpg"],
  ["stand-mixer.jpg", "kitchen", "stand-mixer.jpg"],
  ["dishwasher.jpg", "appliances", "dishwasher.jpg"],
  ["refrigerator.jpg", "appliances", "refrigerator.jpg"],
  ["vacuum.jpg", "appliances", "vacuum.jpg", "upright-vacuum.jpg"],
  ["microwave.jpg", "appliances", "microwave.jpg"],
  ["toaster-oven.jpg", "appliances", "toaster-oven.jpg"],
  ["air-fryer.jpg", "appliances", "air-fryer.jpg"],
  ["coffee-maker.jpg", "appliances", "coffee-maker.jpg"],
  ["air-purifier.jpg", "appliances", "air-purifier.jpg"],
  ["dehumidifier.jpg", "appliances", "dehumidifier.jpg"],
  ["washing-machine.jpg", "appliances", "washing-machine.jpg"],
  ["freezer.jpg", "appliances", "freezer.jpg"],
  ["window-ac.jpg", "appliances", "window-ac.jpg", "air-conditioner.jpg"],
  ["slow-cooker.jpg", "appliances", "slow-cooker.jpg"],
  ["hair-dryer.jpg", "beauty", "hair-dryer.jpg"],
  ["curling-iron.jpg", "beauty", "curling-iron.jpg"],
  ["hair-straightener.jpg", "beauty", "hair-straightener.jpg"],
  ["electric-shaver.jpg", "beauty", "electric-shaver.jpg"],
  ["facial-cleansing-brush.jpg", "beauty", "facial-cleansing-brush.jpg"],
  ["skincare-fridge.jpg", "beauty", "skincare-fridge.jpg"],
  ["led-mirror.jpg", "beauty", "led-mirror.jpg"],
  ["massage-tool.jpg", "beauty", "massage-tool.jpg"],
  ["manicure-kit.jpg", "beauty", "manicure-kit.jpg"],
  ["grooming-kit.jpg", "beauty", "grooming-kit.jpg"],
  ["running-shoe.jpg", "footwear", "running-shoe.jpg"],
  ["canvas-sneaker.jpg", "footwear", "canvas-sneaker.jpg", "sneaker.jpg"],
  ["hiking-boot.jpg", "footwear", "hiking-boot.jpg"],
  ["sandal.jpg", "footwear", "sandal.jpg"],
  ["loafer.jpg", "footwear", "loafer.jpg"],
  ["winter-boot.jpg", "footwear", "winter-boot.jpg"],
  ["training-shoe.jpg", "footwear", "training-shoe.jpg"],
  ["dress-shoe.jpg", "footwear", "dress-shoe.jpg"],
  ["slip-on.jpg", "footwear", "slip-on.jpg"],
  ["trail-runner.jpg", "footwear", "trail-runner.jpg"],
  ["chukka-boot.jpg", "footwear", "chukka-boot.jpg"],
  ["phone.jpg", "electronics", "phone.jpg"],
  ["laptop.jpg", "electronics", "laptop.jpg", "ultrabook.jpg"],
  ["tablet.jpg", "electronics", "tablet.jpg"],
  ["earbuds.jpg", "electronics", "earbuds.jpg"],
  ["headphones.jpg", "electronics", "headphones.jpg"],
  ["monitor.jpg", "electronics", "monitor.jpg"],
  ["smartwatch.jpg", "electronics", "smartwatch.jpg"],
  ["speaker.jpg", "electronics", "speaker.jpg"],
  ["camera.jpg", "electronics", "camera.jpg"],
  ["gaming.jpg", "electronics", "gaming.jpg"],
  ["keyboard.jpg", "electronics", "keyboard.jpg"],
  ["ssd.jpg", "electronics", "ssd.jpg"],
  ["streaming-stick.jpg", "electronics", "streaming-stick.jpg"],
  ["blanket.jpg", "home", "blanket.jpg"],
  ["table-lamp.jpg", "home", "table-lamp.jpg"],
  ["storage-bins.jpg", "home", "storage-bins.jpg"],
  ["throw-pillow.jpg", "home", "throw-pillow.jpg"],
  ["wall-clock.jpg", "home", "wall-clock.jpg"],
  ["diffuser.jpg", "home", "diffuser.jpg"],
  ["curtains.jpg", "home", "curtains.jpg"],
  ["rug.jpg", "home", "rug.jpg"],
  ["home-organizer.jpg", "home", "home-organizer.jpg"],
  ["air-filter.jpg", "home", "air-filter.jpg"],
  ["air-purifier.jpg", "home", "air-purifier.jpg"],
  ["dash-cam.jpg", "automotive", "dash-cam.jpg"],
  ["phone-mount.jpg", "automotive", "phone-mount.jpg"],
  ["floor-mats.jpg", "automotive", "floor-mats.jpg"],
  ["tire-inflator.jpg", "automotive", "tire-inflator.jpg"],
  ["car-vacuum.jpg", "automotive", "car-vacuum.jpg"],
  ["jump-starter.jpg", "automotive", "jump-starter.jpg"],
  ["windshield-wipers.jpg", "automotive", "windshield-wipers.jpg"],
  ["tool-kit.jpg", "automotive", "tool-kit.jpg"],
  ["seat-cover.jpg", "automotive", "seat-cover.jpg"],
  ["battery-charger.jpg", "automotive", "battery-charger.jpg"],
  ["car-charger.jpg", "automotive", "car-charger.jpg"],
  ["cargo-organizer.jpg", "automotive", "cargo-organizer.jpg"],
  ["headlight-kit.jpg", "automotive", "headlight-kit.jpg"],
  ["outdoors-backpack.jpg", "outdoors", "backpack.jpg"],
  ["daypack.jpg", "outdoors", "daypack.jpg"],
  ["tent.jpg", "outdoors", "tent.jpg"],
  ["lantern.jpg", "outdoors", "lantern.jpg"],
  ["cooler.jpg", "outdoors", "cooler.jpg"],
  ["hiking-bottle.jpg", "outdoors", "hiking-bottle.jpg", "water-bottle.jpg"],
  ["sleeping-bag.jpg", "outdoors", "sleeping-bag.jpg"],
  ["camp-chair.jpg", "outdoors", "camp-chair.jpg"],
  ["picnic-blanket.jpg", "outdoors", "picnic-blanket.jpg"],
  ["travel-bag.jpg", "outdoors", "travel-bag.jpg"],
  ["camp-stove.jpg", "outdoors", "camp-stove.jpg"],
];

async function writeJpeg(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src)
    .resize(SIZE, SIZE, { fit: "contain", background: BG })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(dest);
}

let ok = 0;
let missing = 0;
for (const [assetName, category, ...destNames] of MAP) {
  const src = path.join(assets, assetName);
  if (!fs.existsSync(src)) {
    console.warn("missing asset", assetName);
    missing += 1;
    continue;
  }
  for (const destName of destNames) {
    const dest = path.join("public/images/products", category, destName);
    await writeJpeg(src, dest);
    console.log("ok", `${category}/${destName}`);
    ok += 1;
  }
}

// casual-shoe: slight variant of canvas sneaker when available
const sneakerSrc = path.join(assets, "canvas-sneaker.jpg");
if (fs.existsSync(sneakerSrc)) {
  const dest = path.join("public/images/products/footwear/casual-shoe.jpg");
  await sharp(sneakerSrc)
    .resize(SIZE, SIZE, { fit: "contain", background: BG })
    .modulate({ hue: 18, saturation: 0.95 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(dest);
  console.log("ok footwear/casual-shoe.jpg");
  ok += 1;
}

// trekking-poles: keep generated SVG version if no photo — skip

console.log(`done — wrote ${ok} files, ${missing} missing assets`);
