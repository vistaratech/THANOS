# YUYK ⚡️
> *Tech with personality.*

An interactive React e-commerce web application for YUYK — the expressive desktop companion robot.

Powered by Exceptionz × Vistara Tech.

---

## ✨ Features & Architecture

- **Modern React + Vite Architecture**:
  - Modular, responsive component structure (`Header`, `AnnouncementBar`, `Hero`, `Spotlight`, `Statement`, `AboutStory`, `ShopProducts`, `MerchSection`, `InteractiveKeyboard`, `ComingSoonKiki`, `Perks`, `Footer`, `CartDrawer`, `StickyCta`, `ColorModal`).
  - Strict typing compatibility and zero build errors.

- **Exact Visual Reproduction & Design System**:
  - Full color palette (`--ivory: #FEF5E1`, `--red: #ED4027`, `--blue: #154586`, `--amber: #FEB31D`, `--ink: #141414`).
  - Dynamic scroll theme shifts (Ivory → Red → Ivory → Deep Cobalt Blue → Stealth Ink Black).
  - Variable Archivo typography (`font-stretch: 62%`, uppercase kinetic line-reveals) and monospace accents.

- **Playable Mechanical Keyboard Game**:
  - Tactile Web Audio API mechanical key clicks with dynamic pitch variation.
  - Interactive on-screen keypresses and physical keyboard listener.
  - Secret easter egg: Spell **`buddy`** (or click B-U-D-D-Y) to unlock free delivery (`SPELLBUDDY` promo code) and celebratory confetti!

- **Interactive E-Commerce Engine**:
  - Slide-out Cart Drawer with real-time state management.
  - Free delivery progress meter (unlocks at Rs. 5,000 or with secret code).
  - Multi-currency switcher with live conversion (PKR, USD, EUR, GBP, AED, SAR, CAD, AUD).
  - Interactive variant selector modal ("Cosmonaut Blue", "Chunky Red", "Ivory Cream", "Sunshine Amber").
  - Sticky bottom CTA that floats into view on scroll.

- **Kinetic Animations & Parallax**:
  - Floating 3D keycap renders with mouse and scroll-driven parallax rotation.
  - Reading progress highlighter in the About Story section.
  - Infinite looping marquee in the footer with retro mascots and brand typography.

---

## 🚀 Getting Started

### 1. Development Server
To start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build
To create an optimized production build:
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```

## Order Admin

Visit `/admin` to sign in and review checkout requests. Customers' orders are saved before WhatsApp opens; the WhatsApp message still needs to be sent by the customer. The dashboard can search orders, update their status, and save internal notes. It displays the latest 500 requests.

### Configure Vercel and Neon

1. Create a Neon Postgres database and copy its connection string.
2. In Vercel, add these server-side environment variables for the environments you deploy:
   - `DATABASE_URL`: Neon Postgres connection string.
   - `ADMIN_USERNAME`: Admin sign-in ID.
   - `ADMIN_PASSWORD`: Private password with at least 12 characters.
   - `ADMIN_SESSION_SECRET`: Random secret of at least 32 characters. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Redeploy the Vercel project. The order and login-rate-limit tables are created automatically when the API is first used.

Never use a `VITE_` prefix for these secrets and never commit their values. The admin session is an HTTP-only, same-site cookie; sign-ins are rate-limited.

### Local Admin Development

Copy `.env.example` to `.env.local`, fill in the same four variables, then run:

```bash
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin). Local admin/order APIs require a reachable Neon database. `npm run dev:frontend` runs only the Vite frontend.

Order records contain customer name, phone number, delivery address, order items, and fulfillment notes. They are stored in the configured Neon database for order administration. Update the Privacy Policy if your storage or handling practices change. Orders created before this feature are not imported automatically.
