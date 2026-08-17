# project-astro

A SvelteKit + Three.js playground for an interactive gravity-orbit scene: an icosahedron sits at the center of a simple gravitational field, and a small arrow object orbits it under real physics integration, all viewable and adjustable through an on-screen control panel.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5, runes mode)
- [Three.js](https://threejs.org/) for the WebGL scene
- [Vite](https://vitejs.dev/) for dev/build tooling
- [Bun](https://bun.sh/) as the package manager and runtime

## Developing

Install dependencies and start the dev server:

```sh
bun install
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

Create a production build:

```sh
bun run build
```

Preview it locally with `bun run preview`.

> To deploy, you may need to install a [SvelteKit adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Project structure

```
src/
├── routes/
│   ├── +page.svelte        # main scene view: 3D viewer + control panel
│   └── tools/               # tab-panel UI scaffold (WIP)
└── lib/
    └── three/
        ├── world.js         # scene assembly: camera, lights, mesh, orbit, overlays
        ├── scene.js         # Scene() factory
        ├── camera.js        # PerspectiveCamera factory
        ├── renderer.js      # WebGLRenderer factory
        ├── controls.js      # OrbitControls setup (damped)
        ├── lights.js        # ambient + hemisphere lights
        ├── materials.js     # shared material factories
        ├── objects/
        │   └── icosahedron.js   # central body + wireframe overlay
        ├── physics/
        │   └── gravity.js       # semi-implicit Euler gravity integration
        ├── helpers/
        │   ├── axesGizmo.js      # camera-orientation gizmo (bottom-left corner)
        │   └── velocityArrows.js # x/y/z velocity vectors on the orbiting body
        ├── loaders/
        │   └── gltf.js       # GLTF loading helper
        ├── systems/
        │   └── loop.js       # render loop: updatables + post-render overlays
        └── utils/
            └── applyMaterial.js
```

## Scene features

The main view (`/`) renders a central icosahedron with a small arrow orbiting it under a simple inverse-square gravity model. The control panel (top-right) lets you toggle:

- Wireframe overlay on the central body
- Auto-rotation of the central body
- Ambient and hemisphere lighting, with adjustable intensity
- The orbit: start/stop/reset, and launch speed multiplier

Additional viewport aids:

- **Axes gizmo** — a small X/Y/Z indicator in the bottom-left corner that mirrors the main camera's orientation, so you can always tell how the scene is currently oriented.
- **Velocity arrows** — three colored arrows anchored to the orbiting body, one per axis, whose lengths scale with that axis's component of the body's velocity.
- **View shortcuts** — press `1` for a front view, `3` for a right-side view (+X), or `7` for a top-down view (+Y), each keeping the current zoom distance from the OrbitControls target.

An in-progress `/tools` route contains a standalone tab-panel component scaffold, not yet wired to the 3D scene.
