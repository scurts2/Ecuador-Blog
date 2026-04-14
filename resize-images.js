const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MAX_WIDTH = 1920;
const IMAGE_DIR = __dirname;
const EXTENSIONS = ['.png', '.jpg', '.jpeg'];

async function run() {
  const files = fs.readdirSync(IMAGE_DIR).filter(f =>
    EXTENSIONS.includes(path.extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log('No images found.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(IMAGE_DIR, file);
    const image = sharp(filePath);
    const { width } = await image.metadata();

    if (width <= MAX_WIDTH) {
      console.log(`Skipped:  ${file} (${width}px — already within limit)`);
      continue;
    }

    await image
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .toFile(filePath + '.tmp');

    fs.renameSync(filePath + '.tmp', filePath);
    console.log(`Resized:  ${file} (${width}px → ${MAX_WIDTH}px)`);
  }

  console.log('\nDone.');
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
