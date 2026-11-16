const fs = require('fs');

function updateMascot1() {
  const content = fs.readFileSync('public/assets/mascot-1.svg', 'utf8');
  const lines = content.split('\n');

  // Line 11 is the black letter R, Line 15 is the white cutout.
  // We replace Line 11 with the letter D path in screen coordinates (no matrix transform needed!)
  // And remove Line 15 (empty it) so only the D renders with evenodd cutout.
  const pathD1 = `<path d="M 301 79 L 480 79 L 512 111 L 512 292 L 480 324 L 301 324 Z M 371 147 L 417 147 L 442 172 L 442 231 L 417 256 L 371 256 Z" fill="#141414" fill-rule="evenodd"/>`;

  lines[10] = pathD1;
  lines[14] = '<!-- inner counter handled by evenodd -->';

  const updated = lines.join('\n');
  fs.writeFileSync('public/assets/mascot-1.svg', updated, 'utf8');
  fs.writeFileSync('assets/mascot-1.svg', updated, 'utf8');
  console.log('Updated mascot-1.svg with D');
}

function updateMascot3() {
  const content = fs.readFileSync('public/assets/mascot-3.svg', 'utf8');
  const lines = content.split('\n');

  const pathD3 = `<path d="M 294 80 L 473 80 L 505 112 L 505 294 L 473 326 L 294 326 Z M 364 148 L 410 148 L 435 173 L 435 233 L 410 258 L 364 258 Z" fill="#141414" fill-rule="evenodd"/>`;

  lines[10] = pathD3;
  lines[14] = '<!-- inner counter handled by evenodd -->';

  const updated = lines.join('\n');
  fs.writeFileSync('public/assets/mascot-3.svg', updated, 'utf8');
  fs.writeFileSync('assets/mascot-3.svg', updated, 'utf8');
  console.log('Updated mascot-3.svg with D');
}

updateMascot1();
updateMascot3();
