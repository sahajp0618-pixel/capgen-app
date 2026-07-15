# CapGen Architecture

## Current Runtime Architecture

This project is a static web app served directly from the repository. The entire
application lives in a single self-contained `index.html` (inline CSS and JS),
with one external dependency served locally.

Primary files:

- `index.html`: application shell, styles, and all logic for both tabs
- `assets/vendor/three.r128.min.js`: Three.js r128 renderer dependency (local)
- `capgen_final.html`: redirect entry point for legacy links

## Tabbed Structure

The app presents two independent generators as tabs:

1. **Box Cap** — the original rectangular cap generator (procedural mesh builder)
2. **Cylinder Cap** — closed-top hollow cylinder cap with grip ring

Each tab has its own sidebar (inputs, derived values, validation card, export
buttons), its own Three.js scene and canvas, and its own view cube. The two tabs
never share geometry state, so one can never interfere with the other's output or
speed.

## Intended Flow (per tab)

1. User enters dimensions and tolerance.
2. A procedural generator builds a source mesh.
3. The source mesh is used for preview.
4. A repair/certification pipeline creates a repaired export mesh.
5. The repaired mesh is cached for download.
6. Export buttons download the certified mesh as `STL`, `OBJ`, or `3MF`.

## Separation Of Responsibilities

### 1. Input + UI Layer

- collects `W`, `L`, `H`, `T` (Box) or `D`, `H`, `W`, `T` (Cylinder)
- shows validation state and printable certification
- shows preview/export/report controls

### 2. Source Geometry Layer

- **Box**: `buildModel(...)` generates the original parametric cap geometry
  (rounded corners, snap-bead rails, hollow shell).
- **Cylinder**: `buildCylModel(...)` generates a closed-top hollow cylinder with
  an external grip ring, translated directly from the source OpenSCAD module
  `closed_top_hollow_cylinder_with_grip(...)`.

### 3. Repair + Validation Layer

Shared pipeline used by both tabs:

- weld duplicate vertices
- remove degenerate and duplicate faces
- split T-junction seam faces (box)
- normalize face winding (orientation repair)
- remove small fragments
- patch planar boundary loops when possible
- revalidate the repaired result and compute a printability score

### 4. Export Package Layer

- cache the source preview mesh separately from the export mesh
- expose only repaired/certified export geometry for download
- build binary STL, OBJ text, and 3MF (zip) buffers

## Cylinder Cap Geometry

The cylinder cap is an exact JavaScript translation of this OpenSCAD source:

```openscad
$fn = 100;
top_thickness = 2;

module closed_top_hollow_cylinder_with_grip(height, diameter, wall_thickness, tolerance, top_thickness) {
    actual_inner_diameter = diameter + tolerance;
    actual_inner_height   = height + tolerance;
    inner_d = actual_inner_diameter;
    outer_d = inner_d + 2 * wall_thickness;
    outer_r = outer_d / 2;
    total_height = top_thickness + actual_inner_height;
    grip_r = wall_thickness / 2;
    grip_z = total_height - top_thickness - grip_r;

    union() {
        difference() {
            cylinder(h = total_height, d = outer_d);
            translate([0, 0, -top_thickness])
                cylinder(h = actual_inner_height + top_thickness, d = inner_d);
        }
        translate([0, 0, grip_z])
            rotate_extrude()
                translate([outer_r, 0, 0])
                    circle(r = grip_r);
    }
}
```

The inner cylinder is translated down by `top_thickness`, so the cavity opens from
the bottom (z = 0) and leaves a solid top plate of thickness `top_thickness`. The
resulting solid is emitted as six surface groups: bottom annulus (open mouth),
outer wall, top disk (closed end), inner wall, inner ceiling, and the grip torus.
Generation is analytic and runs in well under 100 ms.

## Rendering & Performance

- Each tab runs its own `requestAnimationFrame` render loop.
- The Three.js `WebGLRenderer.prototype.render` call is wrapped so a canvas whose
  tab is hidden is skipped entirely, giving the visible tab the full GPU budget.
- The cylinder loop additionally self-gates (no camera/cube updates when hidden).
- The box generator code is byte-for-byte identical to the original standalone
  app, so its preview speed is unchanged.

## View Cube

Both tabs share a real WebGL CAD ViewCube (`window.createCADViewCube`, defined
once and instantiated per tab into `#viewCubeMount` / `#cyl-viewCubeMount`):

- A beveled cube rendered in its own transparent WebGL overlay canvas, fixed in
  the top-right corner (~104 px, no panel behind it).
- 26 interactive regions — 6 labelled faces (TOP/BOTTOM/FRONT/BACK/LEFT/RIGHT),
  12 edges, 8 corners — each raycast for hover highlight and click.
- Click a face/edge/corner to snap the camera to that orthographic / two-axis /
  isometric view (200–500 ms damped transition).
- Drag the cube to free-orbit the model (virtual trackball: horizontal = yaw,
  vertical = pitch); the cube mirrors the live camera orientation each frame via
  `group.quaternion = mainCamera.quaternion.invert()`.
- A house icon returns to the home isometric view; 90° CW/CCW arrows appear only
  in a straight-on face view and roll the camera via `nav.roll` (applied as
  `camera.rotateZ` after `lookAt`).

## Proper Production Architecture (future)

The current browser-only implementation is ideal for static deployment. A
production-grade certification path would move final repair to a backend:

- **Geometry Service**: generate the source mesh from parameters.
- **Mesh Validation Service**: `Trimesh` for topology analysis, `MeshFix` for
  watertight repair, optionally `Open3D`/`CGAL` for advanced analysis.
- **Artifact Store**: source mesh, repaired mesh, validation report JSON, and
  export variants (`.stl`, `.obj`, `.3mf`).
- **Export API**: only allow download when validation passed and the repaired
  mesh is watertight.

```text
User Parameters
  -> Source Geometry Generator
  -> Source Mesh Artifact
  -> Validation Engine
  -> Repair Engine
  -> Revalidation
  -> Certified Export Package
  -> Download
```

## Files In This Repository

- `index.html`
- `capgen_final.html`
- `README.md`
- `ARCHITECTURE.md`
- `GITHUB_PUBLISHING.md`
- `assets/vendor/three.r128.min.js`
- `.github/workflows/deploy-pages.yml`
- `.gitignore`
- `.nojekyll`
