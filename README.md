# R3F Theatre.js Starter Template

A modern React Three Fiber (R3F) starter template with Theatre.js scroll-controlled camera animations, Tailwind CSS v4, Zustand state management, and more.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-0.181-black)
![Theatre.js](https://img.shields.io/badge/Theatre.js-0.7.2-green)

## ✨ Features

- **🎬 Theatre.js Integration** - Scroll-controlled camera animation with visual timeline editor
- **🎨 Tailwind CSS v4** - Modern utility-first CSS framework
- **📱 Responsive Design** - Aspect ratio constraints and mobile-friendly layout
- **🌿 Grass Component** - High-performance instanced grass with wind simulation
- **☁️ Instanced Clouds** - Billboard clouds with gentle drift animation
- **🧭 Navigation Menu** - Responsive nav with mobile hamburger menu
- **🛒 Zustand Store** - Lightweight global state management
- **📚 Well Documented** - Extensive comments throughout the codebase

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher) or **pnpm** or **yarn**

## 🚀 Quick Start

### 1. Clone or copy this template

```bash
# If using as a template in the same workspace
cd r3f-theatrejs-starter

# Or copy to a new location
cp -r r3f-theatrejs-starter /path/to/your-project
cd /path/to/your-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 🎮 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `O` | Toggle **Orbit Mode** - Switch between scroll and free camera control |
| `E` | Toggle **Edit Mode** - Disable scroll binding to edit Theatre.js timeline |

## 📁 Project Structure

```
r3f-theatrejs-starter/
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── public/
│   └── clouds/                # Cloud texture assets
│       ├── cloud1.png
│       ├── cloud2.png
│       ├── cloud3.png
│       └── cloud4.png
└── src/
    ├── main.tsx               # React entry point
    ├── App.tsx                # Main application component
    ├── index.css              # Global styles & Tailwind
    ├── state.json             # Theatre.js animation keyframes
    │
    ├── components/
    │   ├── 3D/
    │   │   ├── Experience.tsx       # Main 3D scene
    │   │   ├── InstancedClouds.tsx  # Cloud billboards
    │   │   └── grass-component/
    │   │       └── grass.tsx        # Instanced grass field
    │   └── UI/
    │       ├── Navigation.tsx       # Top navigation bar
    │       ├── LoadingScreen.tsx    # Loading overlay
    │       └── PlaceholderSection.tsx # Scroll section template
    │
    ├── hooks/
    │   └── useTheatreTextPatch.ts   # Theatre.js compatibility fix
    │
    └── store/
        └── appStore.ts              # Zustand global state
```

## 🎬 Working with Theatre.js

### Understanding the Setup

Theatre.js is configured to use scroll position as the timeline playhead:

1. **state.json** - Contains camera animation keyframes
2. **App.tsx** - Initializes the Theatre.js project and sheet
3. **Experience.tsx** - Binds scroll offset to timeline position

### Editing Animations

1. Start the dev server (`npm run dev`)
2. The Theatre.js studio panel appears in the bottom-left
3. Press `E` to disable scroll binding (enables timeline editing)
4. Use the timeline to adjust camera keyframes
5. Export your changes: Right-click project → Export to JSON
6. Replace `src/state.json` with your new export

### Camera Animation Structure

The default animation uses two Theatre.js objects:

- **Camera** - The PerspectiveCamera position (x, y, z)
- **Camera Target** - Point the camera looks at (x, y, z)

## 🎨 Customization Guide

### Adding Your 3D Models

1. Place GLB/GLTF files in `public/models/`
2. Use `useGLTF` from drei to load them:

```tsx
import { useGLTF } from '@react-three/drei';

function MyModel() {
  const { scene } = useGLTF('/models/my-model.glb');
  return <primitive object={scene} />;
}
```

### Customizing the UI Layer

Edit `src/components/UI/PlaceholderSection.tsx` or create new section components:

```tsx
// In App.tsx, replace PlaceholderSection with your components
<Scroll html style={{ width: '100%', height: '100%' }}>
  <HeroSection />
  <FeaturesSection />
  <GallerySection />
  <ContactSection />
</Scroll>
```

### Adjusting the Grass

```tsx
<Grass
  size={[100, 100]}           // Width and depth
  bladeCount={200000}          // More = denser (affects performance)
  bladeHeight={[0.3, 0.8]}    // Min and max height
  baseColor="#1a5f2a"         // Color at base
  tipColor="#4ade80"          // Color at tips
  wind={{
    strength: 0.3,            // Wind intensity
    speed: 1,                 // Animation speed
    turbulence: 0.3,          // Chaos factor
  }}
/>
```

### Adding More Clouds

Edit `src/components/3D/InstancedClouds.tsx`:

```tsx
<InstancedClouds 
  count={30}                  // Number of clouds
  position={[0, 40, -30]}     // Group position
  scale={1.5}                 // Overall scale
/>
```

## 🔧 Configuration

### Tailwind CSS

Tailwind v4 is configured via `vite.config.ts` plugin. Customize in `src/index.css`:

```css
@theme inline {
  --color-primary: #your-color;
}
```

### Path Aliases

The `@/` alias points to `src/`. Use it for cleaner imports:

```tsx
import { useAppStore } from '@/store/appStore';
import { Experience } from '@/components/3D/Experience';
```

## 🐛 Troubleshooting

### Theatre.js Studio Not Appearing

Theatre.js studio only appears in development mode. Ensure you're running `npm run dev` (not a production build).

### Cloud Textures Not Loading

Ensure cloud PNG files are in `public/clouds/`. The files should be:
- `cloud1.png`
- `cloud2.png`
- `cloud3.png`
- `cloud4.png`

### Performance Issues

If the grass is causing low FPS:
1. Reduce `bladeCount` in `Experience.tsx`
2. Enable frustum culling (it's on by default)
3. Reduce terrain segments

## 📄 License

MIT License - feel free to use this template for personal or commercial projects.

## 🙏 Credits

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [Drei](https://github.com/pmndrs/drei) - Useful helpers for R3F
- [Theatre.js](https://www.theatrejs.com/) - Animation library for the web
- [Zustand](https://github.com/pmndrs/zustand) - Minimal state management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Happy coding! 🚀**
