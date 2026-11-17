const sharp = require('sharp');

const source = 'public/assets/desktop-buddy-expressions.jpg';
const frames = [
  { name: 'happy', left: 0, top: 0 },
  { name: 'cool', left: 514, top: 0 },
  { name: 'angry', left: 0, top: 386 },
  { name: 'sleepy', left: 514, top: 386 }
];

async function renderExpressions() {
  const { width, height } = await sharp(source).metadata();
  if (width !== 1024 || height !== 768) {
    throw new Error(`Expected a 1024x768 expression sheet, received ${width}x${height}.`);
  }

  for (const frame of frames) {
    await sharp(source)
      .extract({ left: frame.left, top: frame.top, width: 510, height: 382 })
      .webp({ quality: 92 })
      .toFile(`public/assets/yuyk-expression-${frame.name}.webp`);
  }
  console.log('Rendered four YUYK emotion frames.');
}

renderExpressions().catch((error) => {
  console.error('Failed to render YUYK expression images.', error);
  process.exitCode = 1;
});
