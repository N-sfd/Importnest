import sharp from "sharp";
import fs from "fs";
import path from "path";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/normalize-product-photo.mjs <input> <output>");
  process.exit(1);
}
if (!fs.existsSync(inputPath)) {
  console.error("Missing input file:", inputPath);
  process.exit(1);
}

const SIZE = 480;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

await sharp(inputPath)
  .resize(SIZE, SIZE, { fit: "cover", position: "attention" })
  .flatten({ background: "#ffffff" })
  .jpeg({ quality: 86 })
  .toFile(outputPath);

console.log("wrote", outputPath);
