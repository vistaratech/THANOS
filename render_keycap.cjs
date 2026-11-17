const sharp = require('sharp');
const fs = require('fs');

async function main() {
  console.log('Rendering 3D Keycaps with letter Y and pristine rounded dish borders...');

  // 1. Process Colored Render (Hero)
  const { data: colData, info: colInfo } = await sharp('assets/keycap-e-colored-render.webp')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = colInfo.width;
  const height = colInfo.height;

  // Exact dish cream color
  const creamR = 254, creamG = 245, creamB = 228, creamA = 255;

  // Erase ONLY within the inner bounding box of the old letter (x: 520..1070, y: 440..980).
  // This leaves 100% of the rounded black dish borders and outer colored areas completely untouched!
  for (let y = 440; y <= 980; y++) {
    for (let x = 520; x <= 1070; x++) {
      const idx = (y * width + x) * 4;
      colData[idx] = creamR;
      colData[idx + 1] = creamG;
      colData[idx + 2] = creamB;
      colData[idx + 3] = creamA;
    }
  }

  const cleanColoredBuffer = await sharp(colData, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  // Chunky mechanical uppercase Y centered on the keycap
  const yOverlay = Buffer.from(`
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="y-shadow" x="-8%" y="-8%" width="120%" height="120%">
          <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#000000" flood-opacity="0.20" />
        </filter>
      </defs>
      <path filter="url(#y-shadow)"
        d="M 570 470
           L 700 470
           L 795 590
           L 890 470
           L 1020 470
           L 850 685
           L 850 950
           L 740 950
           L 740 685
           Z"
        fill="#141414" />
    </svg>
  `);

  await sharp(cleanColoredBuffer)
    .composite([{ input: yOverlay, top: 0, left: 0 }])
    .webp({ quality: 96 })
    .toFile('public/assets/keycap-y-colored-render.webp');

  console.log('Created public/assets/keycap-y-colored-render.webp');

  // 2. Process Filled Keycap (Statement)
  const { data: filledData, info: filledInfo } = await sharp('assets/keycap-e-filled-render.webp')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const whiteR = 253, whiteG = 253, whiteB = 253, whiteA = 255;
  for (let y = 440; y <= 980; y++) {
    for (let x = 520; x <= 1070; x++) {
      const idx = (y * filledInfo.width + x) * 4;
      filledData[idx] = whiteR;
      filledData[idx + 1] = whiteG;
      filledData[idx + 2] = whiteB;
      filledData[idx + 3] = whiteA;
    }
  }

  const cleanFilledBuffer = await sharp(filledData, {
    raw: { width: filledInfo.width, height: filledInfo.height, channels: 4 }
  })
    .png()
    .toBuffer();

  await sharp(cleanFilledBuffer)
    .composite([{ input: yOverlay, top: 0, left: 0 }])
    .webp({ quality: 96 })
    .toFile('public/assets/keycap-y-filled-render.webp');

  console.log('Created public/assets/keycap-y-filled-render.webp');
}

main().catch(console.error);
