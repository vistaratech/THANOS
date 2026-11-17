const sharp = require('sharp');

async function renderAllMerch() {
  console.log('Rendering new YUYK merchandise images...');

  // ==========================================
  // 1. TEE BACK (YUYK collegiate embroidery)
  // ==========================================
  const { data: backData, info: backInfo } = await sharp('assets/merch-tee-back.webp')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bw = backInfo.width, bh = backInfo.height;

  // Clean the old REKKO text with seamless bilinear fabric interpolation
  const bx1 = 110, bx2 = 785, by1 = 785, by2 = 1025;
  for (let y = by1; y <= by2; y++) {
    const ty = (y - by1) / (by2 - by1);
    for (let x = bx1; x <= bx2; x++) {
      const tx = (x - bx1) / (bx2 - bx1);
      for (let c = 0; c < 3; c++) {
        const topVal = backData[(by1 * bw + x) * 3 + c];
        const btmVal = backData[(by2 * bw + x) * 3 + c];
        const lftVal = backData[(y * bw + bx1) * 3 + c];
        const rgtVal = backData[(y * bw + bx2) * 3 + c];
        const vert = topVal * (1 - ty) + btmVal * ty;
        const horiz = lftVal * (1 - tx) + rgtVal * tx;
        const corner = backData[(by1 * bw + bx1) * 3 + c] * (1 - tx) * (1 - ty) +
                       backData[(by1 * bw + bx2) * 3 + c] * tx * (1 - ty) +
                       backData[(by2 * bw + bx1) * 3 + c] * (1 - tx) * ty +
                       backData[(by2 * bw + bx2) * 3 + c] * tx * ty;
        const val = vert + horiz - corner;
        const noise = (Math.random() - 0.5) * 4;
        backData[(y * bw + x) * 3 + c] = Math.min(255, Math.max(0, Math.round(val + noise)));
      }
    }
  }

  const cleanBackPng = await sharp(backData, { raw: { width: bw, height: bh, channels: 3 } })
    .png()
    .toBuffer();

  // Bold varsity embroidery with heavy stitches and drop shadow
  const backOverlay = Buffer.from(`
    <svg width="${bw}" height="${bh}" viewBox="0 0 ${bw} ${bh}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="tee-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#141414" flood-opacity="0.32" />
        </filter>
        <linearGradient id="thread-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#242424" />
          <stop offset="50%" stop-color="#141414" />
          <stop offset="100%" stop-color="#080808" />
        </linearGradient>
      </defs>

      <g filter="url(#tee-shadow)" text-anchor="middle" font-family="'Archivo Black', 'Arial Black', Impact, sans-serif" font-weight="900">
        <!-- White embroidered outer stitch / border for contrast -->
        <text x="448" y="955" font-size="150" letter-spacing="12" fill="none" stroke="#ECEBE8" stroke-width="10" stroke-linejoin="round">YUYK</text>
        <text x="448" y="955" font-size="150" letter-spacing="12" fill="url(#thread-grad)">YUYK</text>
      </g>
    </svg>
  `);

  await sharp(cleanBackPng)
    .composite([{ input: backOverlay, top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile('public/assets/merch-tee-back.webp');

  console.log('Created public/assets/merch-tee-back.webp');

  // ==========================================
  // 2. CAP (YUYK 3D puff white embroidery)
  // ==========================================
  const { data: capData, info: capInfo } = await sharp('assets/merch-cap.webp')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cw = capInfo.width, ch = capInfo.height;

  const cx1 = 295, cx2 = 660, cy1 = 275, cy2 = 445;
  for (let y = cy1; y <= cy2; y++) {
    const ty = (y - cy1) / (cy2 - cy1);
    for (let x = cx1; x <= cx2; x++) {
      const tx = (x - cx1) / (cx2 - cx1);
      for (let c = 0; c < 3; c++) {
        const topVal = capData[(cy1 * cw + x) * 3 + c];
        const btmVal = capData[(cy2 * cw + x) * 3 + c];
        const lftVal = capData[(y * cw + cx1) * 3 + c];
        const rgtVal = capData[(y * cw + cx2) * 3 + c];
        const vert = topVal * (1 - ty) + btmVal * ty;
        const horiz = lftVal * (1 - tx) + rgtVal * tx;
        const corner = capData[(cy1 * cw + cx1) * 3 + c] * (1 - tx) * (1 - ty) +
                       capData[(cy1 * cw + cx2) * 3 + c] * tx * (1 - ty) +
                       capData[(cy2 * cw + cx1) * 3 + c] * (1 - tx) * ty +
                       capData[(cy2 * cw + cx2) * 3 + c] * tx * ty;
        const val = vert + horiz - corner;
        const noise = (Math.random() - 0.5) * 4;
        capData[(y * cw + x) * 3 + c] = Math.min(255, Math.max(0, Math.round(val + noise)));
      }
    }
  }

  const cleanCapPng = await sharp(capData, { raw: { width: cw, height: ch, channels: 3 } })
    .png()
    .toBuffer();

  const capOverlay = Buffer.from(`
    <svg width="${cw}" height="${ch}" viewBox="0 0 ${cw} ${ch}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cap-shadow" x="-15%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#060F2B" flood-opacity="0.85" />
        </filter>
        <linearGradient id="silver-thread" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#E8E8EC" />
          <stop offset="100%" stop-color="#CBCBD2" />
        </linearGradient>
      </defs>

      <!-- 3D Puff Embroidery on Cap Crown -->
      <g filter="url(#cap-shadow)" text-anchor="middle" font-family="'Archivo Black', 'Arial Black', Impact, sans-serif" font-weight="900" transform="rotate(-1, 480, 360)">
        <!-- Underlying puff stitch border -->
        <text x="480" y="385" font-size="68" letter-spacing="8" fill="none" stroke="#A4A8B6" stroke-width="6" stroke-linejoin="round">YUYK</text>
        <text x="480" y="385" font-size="68" letter-spacing="8" fill="url(#silver-thread)">YUYK</text>
      </g>
    </svg>
  `);

  await sharp(cleanCapPng)
    .composite([{ input: capOverlay, top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile('public/assets/merch-cap.webp');

  console.log('Created public/assets/merch-cap.webp');

  // ==========================================
  // 3. TEE FRONT (Cute Orange YUYK Robot Chest Patch)
  // ==========================================
  const { data: frontData, info: frontInfo } = await sharp('assets/merch-tee-front.webp')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const fw = frontInfo.width, fh = frontInfo.height;

  const fx1 = 275, fx2 = 460, fy1 = 600, fy2 = 810;
  for (let y = fy1; y <= fy2; y++) {
    const ty = (y - fy1) / (fy2 - fy1);
    for (let x = fx1; x <= fx2; x++) {
      const tx = (x - fx1) / (fx2 - fx1);
      for (let c = 0; c < 3; c++) {
        const topVal = frontData[(fy1 * fw + x) * 3 + c];
        const btmVal = frontData[(fy2 * fw + x) * 3 + c];
        const lftVal = frontData[(y * fw + fx1) * 3 + c];
        const rgtVal = frontData[(y * fw + fx2) * 3 + c];
        const vert = topVal * (1 - ty) + btmVal * ty;
        const horiz = lftVal * (1 - tx) + rgtVal * tx;
        const corner = frontData[(fy1 * fw + fx1) * 3 + c] * (1 - tx) * (1 - ty) +
                       frontData[(fy1 * fw + fx2) * 3 + c] * tx * (1 - ty) +
                       frontData[(fy2 * fw + fx1) * 3 + c] * (1 - tx) * ty +
                       frontData[(fy2 * fw + fx2) * 3 + c] * tx * ty;
        const val = vert + horiz - corner;
        const noise = (Math.random() - 0.5) * 4;
        frontData[(y * fw + x) * 3 + c] = Math.min(255, Math.max(0, Math.round(val + noise)));
      }
    }
  }

  const cleanFrontPng = await sharp(frontData, { raw: { width: fw, height: fh, channels: 3 } })
    .png()
    .toBuffer();

  // Streetwear embroidered patch of the YUYK orange cube robot
  const patchOverlay = Buffer.from(`
    <svg width="${fw}" height="${fh}" viewBox="0 0 ${fw} ${fh}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="patch-shadow" x="-15%" y="-15%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#141414" flood-opacity="0.25" />
        </filter>
        <linearGradient id="cube-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF9326" />
          <stop offset="70%" stop-color="#FF6B00" />
          <stop offset="100%" stop-color="#E55300" />
        </linearGradient>
      </defs>

      <g filter="url(#patch-shadow)" transform="translate(290, 615)">
        <!-- Embroidered Patch Outer Border (White merrowed edge) -->
        <rect x="0" y="0" width="154" height="174" rx="28" fill="#F4F3EF" stroke="#DFDDD7" stroke-width="3" />
        
        <!-- Dark inner stitch frame -->
        <rect x="8" y="8" width="138" height="158" rx="22" fill="#141414" />

        <!-- Orange cube body -->
        <rect x="18" y="18" width="118" height="118" rx="20" fill="url(#cube-body)" stroke="#CC4E00" stroke-width="2.5" />
        <path d="M 22 36 L 40 22 L 116 22 L 132 36 Z" fill="#FFA54A" opacity="0.6" />

        <!-- Black Screen Bezel -->
        <rect x="32" y="38" width="90" height="74" rx="14" fill="#0C1017" stroke="#000000" stroke-width="2.5" />

        <!-- Glowing Blue Pixel Face ^_^ -->
        <path d="M 44 68 L 54 58 L 64 68" stroke="#38BDF8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <path d="M 90 68 L 100 58 L 110 68" stroke="#38BDF8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <path d="M 72 82 Q 77 88 82 82" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" fill="none" />

        <!-- Cute Robot Stand / Feet -->
        <rect x="42" y="140" width="28" height="18" rx="6" fill="#FF7A00" stroke="#CC4E00" stroke-width="2" />
        <rect x="84" y="140" width="28" height="18" rx="6" fill="#FF7A00" stroke="#CC4E00" stroke-width="2" />
      </g>
    </svg>
  `);

  await sharp(cleanFrontPng)
    .composite([{ input: patchOverlay, top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile('public/assets/merch-tee-front.webp');

  console.log('Created public/assets/merch-tee-front.webp');

  console.log('Successfully rendered all YUYK merchandise assets.');
}

renderAllMerch().catch(console.error);
