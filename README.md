# ⚽ Tactix — Soccer Formation Designer

A modern tactical board and soccer formation designer built with React + TypeScript + Vite.

**Live demo:** [https://tactix-soccer-manager.onrender.com](https://tactix-soccer-manager.onrender.com)

---

## Features

- 🎨 **4 Pitch Themes** — Classic, Night, Tactical Board, Neon
- 👕 **Player Jersey Designer** — 5 designs, full color customization
- 📋 **5 Formation Presets** — 4-4-2, 4-3-3, 3-5-2, 4-2-3-1, 5-3-2
- 🖊️ **Tactical Chalkboard** — Freehand drawing with custom colors
- 📁 **Multiple Teams** — Create, manage and switch between squads
- 💾 **Export** — Save your tactical setup as PNG or JSON backup
- 📱 **Responsive** — Works on desktop and tablet

---

## Local Development

```bash
npm install
npm run dev
```

Visit: `http://localhost:5173`

## Production Build

```bash
npm run build
```

Output goes to `dist/`.

---

## Deploy to Render.com

This project includes a [`render.yaml`](./render.yaml) for one-click deployment on Render.

**Quick deploy:**
1. Push this repo to GitHub
2. Sign up at [render.com](https://render.com)
3. New → Static Site → connect your GitHub repo
4. Build Command: `npm install && npm run build`
5. Publish Directory: `dist`

Render will auto-deploy on every push to `main`.

---

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript 6](https://www.typescriptlang.org/)
- [Vite 8](https://vitejs.dev/)
- [Lucide React](https://lucide.dev/)
- [html2canvas](https://html2canvas.hertzen.com/)
