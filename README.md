# Momentum Builder Frontend

React + Vite + Tailwind implementation of the Momentum Builder UI.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

1. Import this repository/folder into Vercel.
2. Framework preset: `Vite`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1`

`vercel.json` is included so SPA routes (like `/login`, `/category/:id`) rewrite to `index.html`.
