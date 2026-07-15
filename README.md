# CapGen — v2

**Parametric 3D‑printed cap generator for electronics & PCB manufacturing.**
Enter a few dimensions and CapGen builds a watertight, print‑ready protective cap in your browser, validates and certifies it, and exports it as **STL / OBJ / 3MF** — no server, no build step, nothing to install.

**Live site:** https://sahajp0618-pixel.github.io/capgen-app/

---

## Screenshots

> Add four PNGs to the `screenshots/` folder with the exact names below and they'll appear here.

| Overview | Box Cap generator |
| --- | --- |
| ![Overview](screenshots/overview.png) | ![Box Cap generator](screenshots/box-cap.png) |

| Cylinder Cap generator | About / application notes |
| --- | --- |
| ![Cylinder Cap generator](screenshots/cylinder-cap.png) | ![About](screenshots/about.png) |

---

## What it is

CapGen turns four numbers into a finished protective cap — the kind of small connector cover, port plug, dust cap, or component protector that electronics assembly lines consume by the thousand. Instead of drawing each part or ordering injection‑moulded tooling, you describe a cap by its dimensions and let the geometry build itself. Two families cover almost every case: a rounded rectangular **box cap** and a closed‑top **cylinder cap** with an external grip ring.

It's aimed at PCB and electronics manufacturers who need caps on demand, in‑house, with no tooling and no minimum order.

## How it works

1. **Enter** the outside dimensions and a press‑fit tolerance.
2. CapGen **builds the mesh procedurally** in the browser.
3. A **repair + validation pass** welds duplicate vertices, normalises face winding, removes degenerate/duplicate faces, and closes boundary loops.
4. The result is **scored for printability** — only a watertight, certified mesh unlocks export.
5. **Download** the certified geometry as STL, OBJ, or 3MF.

The cylinder cap is a direct translation of a proven OpenSCAD module, so the printed part matches the reference exactly. Everything runs client‑side on Three.js.

## The two generators

### Box Cap
- **Inputs:** Width (W), Length (L), Height (H), Tolerance (T)
- Fixed constants: wall 1.0 mm, bottom 2.0 mm, snap‑sphere Ø 2.032 mm, 22 curve segments
- Rounded corners, snap‑bead rails, hollow shell

### Cylinder Cap
- **Inputs:** Diameter (D), Height (H), Wall (W), Tolerance (T)
- Fixed constant: top thickness 2.0 mm; grip ring is a torus of radius = wall / 2 (100 radial segments, `$fn = 100`)

## Interface

Four tabs:

- **Overview** — landing page that routes into either generator
- **About** — application notes: background, how it works, PCB/electronics use cases, and why on‑demand printing is cost‑effective
- **Box Cap** / **Cylinder Cap** — the generators, each with a live 3D preview, derived‑value readout, validation/certification card, and export buttons

## Navigation

A Fusion‑style **ViewCube** sits in the top‑right of the viewport: click any face, edge, or corner to snap to that view, or drag the cube to free‑orbit. A colored X/Y/Z axis triad tracks orientation, and a home icon returns to the default isometric view. The viewport also supports orbit, pan, and zoom‑to‑cursor.

## Tech

- Single self‑contained `index.html` (inline CSS + JS, ~180 KB)
- **Three.js r128**, vendored locally at `assets/vendor/three.r128.min.js` — no external CDN
- Fully static: works from any static host; no backend, no build

## Run locally

Because the app loads a local script, open it through a static file server rather than `file://`:

- **VS Code:** right‑click `index.html` → *Open with Live Server*
- **Python:** `python3 -m http.server` in the project folder, then open http://localhost:8000
- **Node:** `npx serve` in the project folder

## Project structure

```
index.html                        the entire application (inline CSS + JS, 4 tabs)
assets/vendor/three.r128.min.js   local Three.js r128 runtime
screenshots/                      README screenshots
ARCHITECTURE.md                   implementation & production‑architecture notes
.nojekyll                         serve all files as-is on GitHub Pages
```

## What's new in v2

- Rebuilt UI on a **Swiss‑precision design system** (bone/graphite, red accent, numbered sections, oversized numerals)
- New **Overview** landing page and **About / application‑notes** page
- **Fusion‑style ViewCube** — light‑grey beveled cube, clickable 26 regions, XYZ axis triad, home icon; renders only on change for smooth performance
- **Auto‑preview** on tab open and **live rebuild** as you edit dimensions
- Red printed‑part material with cleaned‑up lighting
- Default export filenames `Box_Cap` / `Cyl_Cap`
