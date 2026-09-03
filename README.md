# project-astro

A SvelteKit + Three.js playground for an interactive gravity-orbit scene: an
icosahedron sits at the center of a simple gravitational field while a small
arrow orbits it under real physics integration. You can inspect and adjust the
scene from an on-screen control panel — or drive the camera from your phone.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5, runes mode) + [Three.js](https://threejs.org/)
- [Bun](https://bun.sh/) as package manager and runtime
- [Docker Compose](https://docs.docker.com/compose/) to run the two services together

## Services

| Service      | Port   | What it is                                             |
| ------------ | ------ | ------------------------------------------------------ |
| `app`        | `5173` | The SvelteKit viewer — the 3D scene and control panel   |
| `ws-control` | `8787` | A WebSocket relay, plus the phone control page it serves |

## Running it

```sh
./dev.sh        # docker compose up --build --watch
./dev-down.sh   # tear it down
```

The viewer is then at <http://localhost:5173>. Source edits sync into the
containers; `package.json` changes trigger a rebuild.

`dev.sh` also resolves this machine's LAN address and passes it in as
`CONTROL_HOST`, which is what the QR code below needs — see
[Phone control](#phone-control).

For production images, use `compose.prod.yml` (the app is served on `3000`):

```sh
docker compose -f compose.prod.yml up --build
```

### Without Docker

Each service runs standalone:

```sh
cd app        && bun install && bun run dev     # or: bun run build && bun run preview
cd ws-control && bun install && bun run dev
```

`ws-control` logs to `$LOG_DIR/ws-control.log` rather than stdout, so per-touch
logging doesn't drown the console. `LOG_DIR` defaults to a `logs/` directory
beside `index.js`; compose overrides it to `/app/logs` and mounts that as a
volume. Set `DEBUG=false` to drop the per-message lines.

## Phone control

`ws-control` is a small pub/sub relay on the `scene-control` topic. Clients
connect with a `role`:

- **controller** — your phone, sending touch deltas
- **viewer** — the Three.js scene, applying them

Messages are relayed as-is to everyone else on the topic; there's no state or
persistence. Only one controller is allowed at a time — a new one kicks the
previous with close code `4000`. `CONTROL_TOKEN` (set to `devsecret` in
`compose.yml`) is a shared secret so nobody else on your network can drive the
scene; leave it unset to disable the check.

To connect a phone, click **Phone control** at the bottom of the control panel
and scan the QR code, or open the URL directly:

```
http://<host>:8787/control?token=devsecret
```

The QR encodes your machine's LAN address, which the browser can't discover on
its own — `vite.config.js` resolves it at config time, either from `CONTROL_HOST`
(how `dev.sh` passes the host's address into the container) or from the local
network interfaces when running outside Docker. The popover's **Host** field
overrides it if the wrong interface wins.

On the phone: one finger rotates, two fingers pinch to zoom. Two-finger drag
sends a `pan` message that the viewer doesn't act on yet.

## The scene

The main view (`/`) renders the central icosahedron and its orbiting arrow.

**Control panel** (top-right) — wireframe overlay, auto-rotation, ambient and
hemisphere lights with an intensity slider, and the orbit: trail toggle, launch
speed multiplier, and start/stop/reset.

**Scene outliner** (top-left) — a live tree of the camera and scene graph.

**Viewport aids** — an axes gizmo in the bottom-left corner mirroring the camera's
orientation, and three colored arrows on the orbiting body whose lengths track
its per-axis velocity.

**Keyboard** — `1` front, `3` right (+X), `7` top (+Y), each keeping the current
distance from the OrbitControls target. `Escape` closes the QR popover.

## Layout

```
app/                        SvelteKit viewer
├── src/routes/
│   ├── +page.svelte        the scene view: 3D viewer + control panel
│   └── tools/              tab-panel scaffold, not yet wired to the scene
├── src/lib/components/     SceneOutliner, SceneTreeNode, QrCode
├── src/lib/three/
│   ├── world.js            scene assembly and the public control API
│   ├── objects/            icosahedron.js — central body + wireframe overlay
│   ├── physics/gravity.js  semi-implicit Euler integration
│   ├── helpers/            axes gizmo, velocity arrows, orbit trail
│   ├── systems/loop.js     render loop: updatables + post-render overlays
│   └── camera.js, controls.js, lights.js, materials.js, renderer.js, scene.js
└── vite.config.js          also resolves CONTROL_HOST for the QR code

ws-control/                 WebSocket relay
├── index.js                the relay itself
└── public/control.html     the phone control page, served at /control

compose.yml                 dev stack       compose.prod.yml   production stack
dev.sh / dev-down.sh        start / stop
```
