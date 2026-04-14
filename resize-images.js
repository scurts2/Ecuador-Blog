const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MAX_WIDTH = 1920;
const IMAGE_DIR = path.join(__dirname, 'images');
const EXTENSIONS = ['.png', '.jpg', '.jpeg'];

function collectImages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath));
    } else if (EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

async function run() {
  const files = collectImages(IMAGE_DIR);

  if (files.length === 0) {
    console.log('No images found.');
    return;
  }

  for (const filePath of files) {
    const file = path.relative(__dirname, filePath);
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
