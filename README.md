# Momentum Builder Frontend

A luxury-themed, high-performance productivity dashboard built with React and Vite. Experience task management with a premium aesthetic.

## ✨ Features

- **Luxury UI/UX**: Stunning glassmorphism design with a dark-mode first approach.
- **Dynamic Animations**: Smooth transitions and micro-interactions powered by Framer Motion.
- **Comprehensive Dashboard**: Real-time productivity stats, completion rates, and habit tracking insights.
- **Advanced Task Management**: Easily create, filter, and organize tasks and habits.
- **Calendar Integration**: Visualise your productivity streak and upcoming habits.
- **Responsive Design**: Fully optimized for all screen sizes using Tailwind CSS.
- **Modern Tech Stack**: Built with Vite, Shadcn/UI, and Radix UI for a robust and accessible experience.

## 🛠 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI + Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Fetching**: Fetch API with custom hooks

## 🚦 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```

## 📦 Build & Preview

```bash
npm run build
npm run preview
```

## 🌐 Deployment (Vercel)

1. **Import**: Import this repository into Vercel.
2. **Framework**: Select `Vite` as the framework preset.
3. **Environment Variables**:
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g., `https://your-api.onrender.com/api/v1`).
4. **Deploy**: Hit deploy!

`vercel.json` is included to handle SPA routing automatically.

