const sharp = require('sharp');
const fs = require('fs');

async function main() {
  console.log('Rendering 3D Keycaps with letter D and pristine rounded dish borders...');

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

  // Chunky mechanical uppercase D (width: 430, height: 480, centered at 795, 710)
  const dOverlay = Buffer.from(`
    <svg width="1600" height="1600" viewBox="0 0 1600 1600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="d-shadow" x="-8%" y="-8%" width="120%" height="120%">
          <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#000000" flood-opacity="0.20" />
        </filter>
      </defs>
      <path filter="url(#d-shadow)"
        d="M 580 470
           L 910 470
           L 1010 570
           L 1010 850
           L 910 950
           L 580 950
           Z
           M 685 570
           L 870 570
           L 910 610
           L 910 810
           L 870 850
           L 685 850
           Z"
        fill="#141414"
        fill-rule="evenodd"
      />
    </svg>
  `);

  await sharp(cleanColoredBuffer)
    .composite([{ input: dOverlay, top: 0, left: 0 }])
    .webp({ quality: 96 })
    .toFile('public/assets/keycap-d-colored-render.webp');

  console.log('Created public/assets/keycap-d-colored-render.webp');

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
    .composite([{ input: dOverlay, top: 0, left: 0 }])
    .webp({ quality: 96 })
    .toFile('public/assets/keycap-d-filled-render.webp');

  console.log('Created public/assets/keycap-d-filled-render.webp');
}

main().catch(console.error);
