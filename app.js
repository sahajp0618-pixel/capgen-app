(() => {
  if (!window.THREE) {
    window.addEventListener('DOMContentLoaded', () => {
      const status = document.getElementById('status');
      if (status) {
        status.className = 'error';
        status.textContent = 'Three.js failed to load from local assets.';
      }
    });
    return;
  }

  const MODEL = Object.freeze({
    wall: 1.0,
    bottom: 2.0,
    sphereRadius: 2.032 / 2,
    curveSegments: 22,
    railLengthStep: 4,
    maxRadius: 4000,
    minRadius: 8
  });

  const HOME_VIEW_KEY = 'corner-tfr';

  const VIEW_PRESETS = Object.freeze({
  top: new THREE.Vector3(0, 1, 0),
  bottom: new THREE.Vector3(0, -1, 0),
  front: new THREE.Vector3(0, 0, 1),
  back: new THREE.Vector3(0, 0, -1),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
  'corner-tfr': new THREE.Vector3(1, 1, 1).normalize(),
  'corner-tfl': new THREE.Vector3(-1, 1, 1).normalize(),
  'corner-tbr': new THREE.Vector3(1, 1, -1).normalize(),
  'corner-tbl': new THREE.Vector3(-1, 1, -1).normalize(),
  'corner-bfr': new THREE.Vector3(1, -1, 1).normalize(),
  'corner-bfl': new THREE.Vector3(-1, -1, 1).normalize(),
  'corner-bbr': new THREE.Vector3(1, -1, -1).normalize(),
  'corner-bbl': new THREE.Vector3(-1, -1, -1).normalize()
});

  const DAMPING = Object.freeze({
    transition: 11,
    viewThreshold: 1e-3
  });

  const refs = {
    canvas: document.getElementById('cv'),
    pane: document.querySelector('.rpane'),
    status: document.getElementById('status'),
    dot: document.getElementById('dot'),
    tbmsg: document.getElementById('tbmsg'),
    tbdim: document.getElementById('tbdim'),
    pBtn: document.getElementById('pBtn'),
    dBtn: document.getElementById('dBtn'),
    pIcon: document.getElementById('pIcon'),
    dIcon: document.getElementById('dIcon'),
    pLbl: document.getElementById('pLbl'),
    dLbl: document.getElementById('dLbl'),
    filename: document.getElementById('iFilename'),
    inputs: {
      W: document.getElementById('iW'),
      L: document.getElementById('iL'),
      H: document.getElementById('iH'),
      T: document.getElementById('iT')
    },
    derived: {
      iw: document.getElementById('d_iw'),
      il: document.getElementById('d_il'),
      ow: document.getElementById('d_ow'),
      ol: document.getElementById('d_ol'),
      oh: document.getElementById('d_oh'),
      zc: document.getElementById('d_zc'),
      cl: document.getElementById('d_cl')
    },
    viewCube: document.getElementById('viewCube'),
    cubeFaces: Array.from(document.querySelectorAll('.cube-face')),
    viewButtons: Array.from(document.querySelectorAll('[data-view]'))
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070c12);

  const modelRoot = new THREE.Group();
  scene.add(modelRoot);

  const grid = new THREE.GridHelper(420, 34, 0x1b3244, 0x0f1820);
  grid.position.y = 0;
  scene.add(grid);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
  const renderer = new THREE.WebGLRenderer({
    canvas: refs.canvas,
    antialias: true,
    alpha: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  scene.add(new THREE.AmbientLight(0x314862, 1.05));
  const keyLight = new THREE.DirectionalLight(0x54d7ff, 1.25);
  keyLight.position.set(2.6, 4.2, 3.1);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-3.2, 1.6, -2.2);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0x88aaff, 0.42);
  rimLight.position.set(0.6, 5.5, -3.4);
  scene.add(rimLight);

  const tmpVecA = new THREE.Vector3();
  const tmpVecB = new THREE.Vector3();
  const tmpVecC = new THREE.Vector3();
  const tmpEuler = new THREE.Euler();
  const raycaster = new THREE.Raycaster();
  const mouseNdc = new THREE.Vector2();

  const nav = {
    target: new THREE.Vector3(0, 20, 0),
    desiredTarget: new THREE.Vector3(0, 20, 0),
    spherical: new THREE.Spherical(240, 1.07, 0.82),
    desiredSpherical: new THREE.Spherical(240, 1.07, 0.82),
    interaction: null,
    transitioning: false,
    bounds: null,
    fitDistance: 240
  };

  let currentMesh = null;
  let currentModel = null;
  let currentModelKey = '';
  let lastFrame = performance.now();
  const buttonArmState = new WeakMap();

  function resize() {
    const width = refs.pane.clientWidth;
    const height = Math.max(220, refs.pane.clientHeight - 42);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function clampPhi(phi) {
    return THREE.MathUtils.clamp(phi, 0.08, Math.PI - 0.08);
  }

  function normalizeAngle(angle) {
    const twoPi = Math.PI * 2;
    let a = angle % twoPi;
    if (a > Math.PI) a -= twoPi;
    if (a < -Math.PI) a += twoPi;
    return a;
  }

  function angleDelta(current, target) {
    return normalizeAngle(target - current);
  }

  function syncCurrentToDesired() {
    nav.target.copy(nav.desiredTarget);
    nav.spherical.radius = nav.desiredSpherical.radius;
    nav.spherical.phi = nav.desiredSpherical.phi;
    nav.spherical.theta = nav.desiredSpherical.theta;
    nav.transitioning = false;
  }

  function setCanvasCursor(mode) {
    if (mode === 'pan') refs.canvas.style.cursor = 'move';
    else if (mode === 'orbit') refs.canvas.style.cursor = 'grabbing';
    else refs.canvas.style.cursor = 'grab';
  }

  function vsub(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function vcrs(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function vnrm(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    return len < 1e-12 ? [0, 0, 1] : [v[0] / len, v[1] / len, v[2] / len];
  }

  function triNormal(a, b, c) {
    return vnrm(vcrs(vsub(b, a), vsub(c, a)));
  }

  function midpoint(a, b, c) {
    return [
      (a[0] + b[0] + c[0]) / 3,
      (a[1] + b[1] + c[1]) / 3,
      (a[2] + b[2] + c[2]) / 3
    ];
  }

  function constantNormal(n) {
    return () => n;
  }

  function getParams() {
    return {
      W: parseFloat(refs.inputs.W.value),
      L: parseFloat(refs.inputs.L.value),
      H: parseFloat(refs.inputs.H.value),
      T: parseFloat(refs.inputs.T.value)
    };
  }

  function modelKey(params) {
    return [params.W, params.L, params.H, params.T].map((value) => value.toFixed(4)).join('|');
  }

  function validateParams({ W, L, H, T }) {
    const checks = [
      [Number.isFinite(W), 'Width must be a valid number.'],
      [Number.isFinite(L), 'Length must be a valid number.'],
      [Number.isFinite(H), 'Height must be a valid number.'],
      [Number.isFinite(T), 'Tolerance must be a valid number.'],
      [W >= 5 && W <= 500, 'Width must stay between 5 mm and 500 mm.'],
      [L >= 5 && L <= 500, 'Length must stay between 5 mm and 500 mm.'],
      [H >= 3 && H <= 500, 'Height must stay between 3 mm and 500 mm.'],
      [T >= 0 && T <= 2, 'Tolerance must stay between 0 mm and 2 mm.']
    ];

    for (const [ok, message] of checks) {
      if (!ok) throw new Error(message);
    }

    const minLength = MODEL.sphereRadius * 2 + 0.25;
    if (L <= minLength) {
      throw new Error(`Length must be greater than ${minLength.toFixed(2)} mm so the snap rail remains printable.`);
    }

    return { W, L, H, T };
  }

  function createBuilder() {
    const positions = [];
    const normals = [];

    function pushTri(a, b, c, normalSource) {
      let p1 = b;
      let p2 = c;
      let raw = vcrs(vsub(p1, a), vsub(p2, a));
      if (Math.hypot(raw[0], raw[1], raw[2]) < 1e-12) return;

      if (normalSource) {
        const hint = normalSource(midpoint(a, p1, p2));
        const dot = raw[0] * hint[0] + raw[1] * hint[1] + raw[2] * hint[2];
        if (dot < 0) {
          p1 = c;
          p2 = b;
          raw = vcrs(vsub(p1, a), vsub(p2, a));
        }
      }

      const face = vnrm(raw);
      const nA = normalSource ? vnrm(normalSource(a)) : face;
      const nB = normalSource ? vnrm(normalSource(p1)) : face;
      const nC = normalSource ? vnrm(normalSource(p2)) : face;

      positions.push(...a, ...p1, ...p2);
      normals.push(...nA, ...nB, ...nC);
    }

    function pushQuad(a, b, c, d, normalSource) {
      pushTri(a, b, c, normalSource);
      pushTri(a, c, d, normalSource);
    }

    return { positions, normals, pushTri, pushQuad };
  }

  function buildModel(W, L, H, tolerance) {
    const innerW = W + tolerance;
    const innerL = L + tolerance;
    const innerH = H;
    const outerW = innerW + 2 * MODEL.wall;
    const outerL = innerL + 2 * MODEL.wall;
    const outerH = innerH + MODEL.bottom;
    const r = MODEL.sphereRadius;
    const zCenter = MODEL.bottom + r;
    const railStart = r * 2;
    const railEnd = L;
    const holeZ0 = zCenter - r;
    const holeZ1 = zCenter + r;
    const innerX0 = MODEL.wall;
    const innerX1 = MODEL.wall + innerW;
    const innerY0 = MODEL.wall;
    const innerY1 = MODEL.wall + innerL;
    const segCurve = MODEL.curveSegments;
    const segRailY = Math.max(8, Math.ceil((railEnd - railStart) / MODEL.railLengthStep));
    const segCap = segCurve * 2;
    const builder = createBuilder();

    const left = constantNormal([-1, 0, 0]);
    const right = constantNormal([1, 0, 0]);
    const front = constantNormal([0, -1, 0]);
    const back = constantNormal([0, 1, 0]);
    const up = constantNormal([0, 0, 1]);
    const down = constantNormal([0, 0, -1]);

    builder.pushQuad([0, 0, 0], [outerW, 0, 0], [outerW, outerL, 0], [0, outerL, 0], down);
    builder.pushQuad([0, 0, 0], [outerW, 0, 0], [outerW, 0, outerH], [0, 0, outerH], front);
    builder.pushQuad([0, outerL, 0], [outerW, outerL, 0], [outerW, outerL, outerH], [0, outerL, outerH], back);

    builder.pushQuad([0, 0, holeZ1], [0, outerL, holeZ1], [0, outerL, outerH], [0, 0, outerH], left);
    builder.pushQuad([0, 0, 0], [0, outerL, 0], [0, outerL, holeZ0], [0, 0, holeZ0], left);
    builder.pushQuad([outerW, 0, holeZ1], [outerW, outerL, holeZ1], [outerW, outerL, outerH], [outerW, 0, outerH], right);
    builder.pushQuad([outerW, 0, 0], [outerW, outerL, 0], [outerW, outerL, holeZ0], [outerW, 0, holeZ0], right);

    const arcRadiusAtZ = (z) => Math.sqrt(Math.max(0, r * r - (z - zCenter) * (z - zCenter)));
    for (let i = 0; i < segCurve; i += 1) {
      const zA = holeZ0 + ((holeZ1 - holeZ0) * i) / segCurve;
      const zB = holeZ0 + ((holeZ1 - holeZ0) * (i + 1)) / segCurve;
      const frontA = railStart - arcRadiusAtZ(zA);
      const frontB = railStart - arcRadiusAtZ(zB);
      const backA = railEnd + arcRadiusAtZ(zA);
      const backB = railEnd + arcRadiusAtZ(zB);

      builder.pushQuad([0, 0, zA], [0, frontA, zA], [0, frontB, zB], [0, 0, zB], left);
      builder.pushQuad([0, backA, zA], [0, outerL, zA], [0, outerL, zB], [0, backB, zB], left);
      builder.pushQuad([outerW, 0, zA], [outerW, frontA, zA], [outerW, frontB, zB], [outerW, 0, zB], right);
      builder.pushQuad([outerW, backA, zA], [outerW, outerL, zA], [outerW, outerL, zB], [outerW, backB, zB], right);
    }

    builder.pushQuad([0, 0, outerH], [outerW, 0, outerH], [outerW, innerY0, outerH], [0, innerY0, outerH], up);
    builder.pushQuad([0, innerY1, outerH], [outerW, innerY1, outerH], [outerW, outerL, outerH], [0, outerL, outerH], up);
    builder.pushQuad([0, innerY0, outerH], [innerX0, innerY0, outerH], [innerX0, innerY1, outerH], [0, innerY1, outerH], up);
    builder.pushQuad([innerX1, innerY0, outerH], [outerW, innerY0, outerH], [outerW, innerY1, outerH], [innerX1, innerY1, outerH], up);

    builder.pushQuad([innerX0, innerY0, MODEL.bottom], [innerX1, innerY0, MODEL.bottom], [innerX1, innerY1, MODEL.bottom], [innerX0, innerY1, MODEL.bottom], up);
    builder.pushQuad([innerX0, innerY0, MODEL.bottom], [innerX1, innerY0, MODEL.bottom], [innerX1, innerY0, outerH], [innerX0, innerY0, outerH], back);
    builder.pushQuad([innerX0, innerY1, MODEL.bottom], [innerX1, innerY1, MODEL.bottom], [innerX1, innerY1, outerH], [innerX0, innerY1, outerH], front);
    builder.pushQuad([innerX0, innerY0, MODEL.bottom], [innerX0, innerY1, MODEL.bottom], [innerX0, innerY1, outerH], [innerX0, innerY0, outerH], right);
    builder.pushQuad([innerX1, innerY0, MODEL.bottom], [innerX1, innerY1, MODEL.bottom], [innerX1, innerY1, outerH], [innerX1, innerY0, outerH], left);

    function addRail(sideX, sideSign) {
      const railNormal = (p) => [p[0] - sideX, 0, p[2] - zCenter];
      for (let iy = 0; iy < segRailY; iy += 1) {
        const yA = railStart + ((railEnd - railStart) * iy) / segRailY;
        const yB = railStart + ((railEnd - railStart) * (iy + 1)) / segRailY;
        for (let it = 0; it < segCurve; it += 1) {
          const tA = -Math.PI / 2 + (Math.PI * it) / segCurve;
          const tB = -Math.PI / 2 + (Math.PI * (it + 1)) / segCurve;
          const pA = [sideX + sideSign * r * Math.cos(tA), yA, zCenter + r * Math.sin(tA)];
          const pB = [sideX + sideSign * r * Math.cos(tA), yB, zCenter + r * Math.sin(tA)];
          const pC = [sideX + sideSign * r * Math.cos(tB), yB, zCenter + r * Math.sin(tB)];
          const pD = [sideX + sideSign * r * Math.cos(tB), yA, zCenter + r * Math.sin(tB)];
          builder.pushQuad(pA, pB, pC, pD, railNormal);
        }
      }
    }

    function addEndCap(sideX, centerY, sideSign, endSign) {
      const capNormal = (p) => [p[0] - sideX, p[1] - centerY, p[2] - zCenter];
      for (let ia = 0; ia < segCurve; ia += 1) {
        const alphaA = (Math.PI / 2) * ia / segCurve;
        const alphaB = (Math.PI / 2) * (ia + 1) / segCurve;
        for (let ib = 0; ib < segCap; ib += 1) {
          const betaA = -Math.PI / 2 + (Math.PI * ib) / segCap;
          const betaB = -Math.PI / 2 + (Math.PI * (ib + 1)) / segCap;

          const point = (alpha, beta) => [
            sideX + sideSign * r * Math.sin(alpha) * Math.cos(beta),
            centerY + endSign * r * Math.cos(alpha),
            zCenter + r * Math.sin(alpha) * Math.sin(beta)
          ];

          builder.pushQuad(
            point(alphaA, betaA),
            point(alphaB, betaA),
            point(alphaB, betaB),
            point(alphaA, betaB),
            capNormal
          );
        }
      }
    }

    addRail(0, -1);
    addRail(outerW, 1);
    addEndCap(0, railStart, -1, -1);
    addEndCap(0, railEnd, -1, 1);
    addEndCap(outerW, railStart, 1, -1);
    addEndCap(outerW, railEnd, 1, 1);

    return {
      positions: builder.positions,
      normals: builder.normals,
      triangleCount: builder.positions.length / 9
    };
  }

  function modelToPreviewGeometry(model) {
    const positions = [];
    const normals = [];
    for (let i = 0; i < model.positions.length; i += 3) {
      positions.push(model.positions[i], model.positions[i + 2], model.positions[i + 1]);
      normals.push(model.normals[i], model.normals[i + 2], model.normals[i + 1]);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  }

  function clearPreview() {
    if (!currentMesh) return;
    modelRoot.remove(currentMesh);
    currentMesh.geometry.dispose();
    currentMesh.material.dispose();
    currentMesh = null;
    nav.bounds = null;
  }

  function fitDistanceForBounds(bounds, extraScale = 1.16) {
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const halfFovX = Math.atan(Math.tan(halfFovY) * camera.aspect);
    const distY = sphere.radius / Math.sin(Math.max(halfFovY, 0.01));
    const distX = sphere.radius / Math.sin(Math.max(halfFovX, 0.01));
    return Math.max(distX, distY) * extraScale;
  }

  function animateToView(viewName) {
  if (!nav.bounds) return;
  const resolvedView = viewName === 'home' ? HOME_VIEW_KEY : viewName;
  const direction = VIEW_PRESETS[resolvedView];
  if (!direction) return;

  const center = nav.bounds.getCenter(new THREE.Vector3());
  const isCornerView = resolvedView.startsWith('corner-');
  const distance = fitDistanceForBounds(nav.bounds, viewName === 'home' || isCornerView ? 1.28 : 1.14);
  const offset = direction.clone().multiplyScalar(distance);
  const spherical = new THREE.Spherical().setFromVector3(offset);

  nav.desiredTarget.copy(center);
  nav.desiredSpherical.radius = THREE.MathUtils.clamp(distance, MODEL.minRadius, MODEL.maxRadius);
  nav.desiredSpherical.phi = clampPhi(spherical.phi);
  nav.desiredSpherical.theta = spherical.theta;
  nav.transitioning = true;
}

  function fitCurrentModel(animate = true) {
    if (!nav.bounds) return;
    const center = nav.bounds.getCenter(new THREE.Vector3());
    const distance = fitDistanceForBounds(nav.bounds);
    nav.desiredTarget.copy(center);
    nav.desiredSpherical.radius = THREE.MathUtils.clamp(distance, MODEL.minRadius, MODEL.maxRadius);
    if (animate) nav.transitioning = true;
    else syncCurrentToDesired();
    nav.fitDistance = distance;
  }

  function showPreview(model) {
    const geometry = modelToPreviewGeometry(model);
    clearPreview();

    const material = new THREE.MeshStandardMaterial({
      color: 0x22a9ff,
      roughness: 0.34,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    currentMesh = new THREE.Mesh(geometry, material);

    const localBounds = geometry.boundingBox.clone();
    const centerX = (localBounds.min.x + localBounds.max.x) * 0.5;
    const centerZ = (localBounds.min.z + localBounds.max.z) * 0.5;
    currentMesh.position.set(-centerX, -localBounds.min.y, -centerZ);
    modelRoot.add(currentMesh);

    nav.bounds = localBounds.translate(currentMesh.position.clone());
    nav.fitDistance = fitDistanceForBounds(nav.bounds);
    fitCurrentModel(false);
  }

  function exportSTL(model, filename) {
    const triCount = model.positions.length / 9;
    const buffer = new ArrayBuffer(84 + triCount * 50);
    const view = new DataView(buffer);
    const header = 'CapGen parametric snap-cap STL';

    for (let i = 0; i < 80; i += 1) {
      view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
    }
    view.setUint32(80, triCount, true);

    let offset = 84;
    for (let i = 0; i < model.positions.length; i += 9) {
      const a = [model.positions[i], model.positions[i + 1], model.positions[i + 2]];
      const b = [model.positions[i + 3], model.positions[i + 4], model.positions[i + 5]];
      const c = [model.positions[i + 6], model.positions[i + 7], model.positions[i + 8]];
      const n = triNormal(a, b, c);

      view.setFloat32(offset, n[0], true); offset += 4;
      view.setFloat32(offset, n[1], true); offset += 4;
      view.setFloat32(offset, n[2], true); offset += 4;

      for (const v of [a, b, c]) {
        view.setFloat32(offset, v[0], true); offset += 4;
        view.setFloat32(offset, v[1], true); offset += 4;
        view.setFloat32(offset, v[2], true); offset += 4;
      }

      view.setUint16(offset, 0, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return buffer.byteLength;
  }

  function sanitizeFilename(raw) {
    const cleaned = (raw || '')
      .trim()
      .replace(/\.stl$/i, '')
      .replace(/[<>:"/\\|?*\x00-\x1F]+/g, '_')
      .replace(/\s+/g, '_')
      .slice(0, 80);
    return cleaned || 'cap';
  }

  function updateDerived() {
    const { W, L, H, T } = getParams();
    const innerW = Number.isFinite(W) && Number.isFinite(T) ? W + T : 0;
    const innerL = Number.isFinite(L) && Number.isFinite(T) ? L + T : 0;
    const outerW = innerW + 2 * MODEL.wall;
    const outerL = innerL + 2 * MODEL.wall;
    const outerH = (Number.isFinite(H) ? H : 0) + MODEL.bottom;
    const zCenter = MODEL.bottom + MODEL.sphereRadius;
    const railLength = Math.max(0, (Number.isFinite(L) ? L : 0) - 2 * MODEL.sphereRadius);

    refs.derived.iw.textContent = `${innerW.toFixed(2)} mm`;
    refs.derived.il.textContent = `${innerL.toFixed(2)} mm`;
    refs.derived.ow.textContent = `${outerW.toFixed(2)} mm`;
    refs.derived.ol.textContent = `${outerL.toFixed(2)} mm`;
    refs.derived.oh.textContent = `${outerH.toFixed(2)} mm`;
    refs.derived.zc.textContent = `${zCenter.toFixed(3)} mm`;
    refs.derived.cl.textContent = `${railLength.toFixed(3)} mm`;
  }

  function setStatus(type, message) {
    refs.status.className = type;
    refs.status.textContent = message;
  }

  function clearStatus() {
    refs.status.className = '';
    refs.status.textContent = '';
  }

  function setActionBusy(kind, on) {
    refs.pBtn.disabled = on;
    refs.dBtn.disabled = on;
    if (!on) return;
    [refs.pBtn, refs.dBtn].forEach((button) => {
      const state = buttonArmState.get(button);
      if (!state) return;
      state.armed = false;
      state.progress = 0;
      state.hovering = false;
      if (state.frame) cancelAnimationFrame(state.frame);
      state.frame = 0;
      button.style.setProperty('--charge', '0');
      button.classList.remove('armed', 'waiting');
    });
  }

  async function handlePreview() {
    setActionBusy('preview', true);
    setStatus('loading', 'Building preview mesh.');
    refs.tbmsg.textContent = 'Building Preview';
    refs.tbdim.textContent = '';
    refs.dot.classList.remove('on');
    await new Promise((resolve) => setTimeout(resolve, 20));

    try {
      const params = validateParams(getParams());
      const start = performance.now();
      const model = buildModel(params.W, params.L, params.H, params.T);
      if (!model.triangleCount) throw new Error('The current inputs produced no visible geometry.');

      showPreview(model);
      currentModel = model;
      currentModelKey = modelKey(params);

      const elapsed = ((performance.now() - start) / 1000).toFixed(2);
      setStatus('success', `Preview ready in ${elapsed}s · ${model.triangleCount.toLocaleString()} triangles.`);
      refs.tbmsg.textContent = `${model.triangleCount.toLocaleString()} Triangles`;
      refs.tbdim.textContent = `W${params.W} × L${params.L} × H${params.H} mm  T${params.T}`;
      refs.dot.classList.add('on');
    } catch (error) {
      clearPreview();
      currentModel = null;
      currentModelKey = '';
      setStatus('error', `Preview failed: ${error.message}`);
      refs.tbmsg.textContent = 'Preview Failed';
      refs.tbdim.textContent = '';
      console.error(error);
    }

    setActionBusy('preview', false);
  }

  async function handleDownload() {
    setActionBusy('download', true);
    setStatus('loading', 'Building STL file.');
    await new Promise((resolve) => setTimeout(resolve, 20));

    try {
      const params = validateParams(getParams());
      const key = modelKey(params);
      const model = currentModel && currentModelKey === key
        ? currentModel
        : buildModel(params.W, params.L, params.H, params.T);

      const filename = `${sanitizeFilename(refs.filename.value)}.stl`;
      const bytes = exportSTL(model, filename);
      setStatus('success', `Saved ${filename} · ${(bytes / 1024).toFixed(1)} KB.`);
    } catch (error) {
      setStatus('error', `Export failed: ${error.message}`);
      console.error(error);
    }

    setActionBusy('download', false);
  }

  function getCanvasRect() {
    return refs.canvas.getBoundingClientRect();
  }

  function zoomToCursor(deltaY, clientX, clientY, immediate = true) {
    const rect = getCanvasRect();
    mouseNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseNdc, camera);
    camera.getWorldDirection(tmpVecA);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(tmpVecA, nav.target);
    const focusPoint = raycaster.ray.intersectPlane(plane, tmpVecB.clone()) || nav.target.clone();

    const factor = Math.exp(deltaY * 0.00125);
    const nextRadius = THREE.MathUtils.clamp(nav.desiredSpherical.radius * factor, MODEL.minRadius, MODEL.maxRadius);
    const appliedFactor = nextRadius / nav.desiredSpherical.radius;
    tmpVecC.copy(nav.desiredTarget).sub(focusPoint).multiplyScalar(appliedFactor);
    nav.desiredTarget.copy(focusPoint).add(tmpVecC);
    nav.desiredSpherical.radius = nextRadius;

    if (immediate) syncCurrentToDesired();
    else nav.transitioning = true;
  }

  function orbitByPixels(dx, dy) {
    const rect = getCanvasRect();
    const azimuth = (dx / Math.max(rect.width, 1)) * Math.PI * 1.8;
    const polar = (dy / Math.max(rect.height, 1)) * Math.PI * 1.1;
    nav.desiredSpherical.theta -= azimuth;
    nav.desiredSpherical.phi = clampPhi(nav.desiredSpherical.phi + polar);
    syncCurrentToDesired();
  }

  function panByPixels(dx, dy) {
    const rect = getCanvasRect();
    const distance = nav.spherical.radius;
    const worldHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const worldWidth = worldHeight * camera.aspect;

    camera.getWorldDirection(tmpVecA);
    tmpVecB.crossVectors(tmpVecA, camera.up).normalize();
    tmpVecC.crossVectors(tmpVecB, tmpVecA).normalize();

    const moveX = (-dx / Math.max(rect.width, 1)) * worldWidth;
    const moveY = (dy / Math.max(rect.height, 1)) * worldHeight;

    nav.desiredTarget.addScaledVector(tmpVecB, moveX);
    nav.desiredTarget.addScaledVector(tmpVecC, moveY);
    syncCurrentToDesired();
  }

  function resolveInteractionMode(event) {
    if (event.button === 1 && event.shiftKey) return 'orbit';
    if (event.button === 1) return 'pan';
    if (event.button === 2) return 'orbit';
    if (event.button === 0) return 'orbit';
    return null;
  }

  function handlePointerDown(event) {
    const mode = resolveInteractionMode(event);
    if (!mode) return;

    nav.interaction = {
      mode,
      x: event.clientX,
      y: event.clientY
    };
    setCanvasCursor(mode);
    refs.canvas.focus?.();
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (!nav.interaction) return;
    const dx = event.clientX - nav.interaction.x;
    const dy = event.clientY - nav.interaction.y;
    nav.interaction.x = event.clientX;
    nav.interaction.y = event.clientY;

    if (nav.interaction.mode === 'orbit') orbitByPixels(dx, dy);
    else if (nav.interaction.mode === 'pan') panByPixels(dx, dy);
  }

  function handlePointerUp() {
    nav.interaction = null;
    setCanvasCursor(null);
  }

  function updateCamera(dt) {
    if (nav.transitioning) {
      const alpha = 1 - Math.exp(-DAMPING.transition * dt);
      nav.target.lerp(nav.desiredTarget, alpha);
      nav.spherical.radius = THREE.MathUtils.lerp(nav.spherical.radius, nav.desiredSpherical.radius, alpha);
      nav.spherical.phi = THREE.MathUtils.lerp(nav.spherical.phi, nav.desiredSpherical.phi, alpha);
      nav.spherical.theta += angleDelta(nav.spherical.theta, nav.desiredSpherical.theta) * alpha;

      const done =
        nav.target.distanceToSquared(nav.desiredTarget) < DAMPING.viewThreshold &&
        Math.abs(nav.spherical.radius - nav.desiredSpherical.radius) < DAMPING.viewThreshold &&
        Math.abs(nav.spherical.phi - nav.desiredSpherical.phi) < DAMPING.viewThreshold &&
        Math.abs(angleDelta(nav.spherical.theta, nav.desiredSpherical.theta)) < DAMPING.viewThreshold;

      if (done) syncCurrentToDesired();
    }

    tmpVecA.setFromSpherical(nav.spherical);
    camera.position.copy(nav.target).add(tmpVecA);
    camera.lookAt(nav.target);
  }

  function updateViewCube() {
  tmpEuler.setFromQuaternion(camera.quaternion.clone().invert(), 'YXZ');
  refs.viewCube.style.transform =
    `rotateX(${THREE.MathUtils.radToDeg(tmpEuler.x)}deg) ` +
    `rotateY(${THREE.MathUtils.radToDeg(tmpEuler.y)}deg) ` +
    `rotateZ(${THREE.MathUtils.radToDeg(tmpEuler.z)}deg)`;

  const dir = camera.position.clone().sub(nav.target).normalize();
  let bestKey = HOME_VIEW_KEY;
  let bestDot = -Infinity;
  for (const [key, vector] of Object.entries(VIEW_PRESETS)) {
    const dot = dir.dot(vector);
    if (dot > bestDot) {
      bestDot = dot;
      bestKey = key;
    }
  }

  refs.cubeFaces.forEach((face) => {
    face.classList.toggle('active', face.dataset.view === bestKey);
  });

  refs.viewButtons.forEach((button) => {
    const view = button.dataset.view;
    const isFit = view === 'fit';
    const isHome = view === 'home';
    button.classList.toggle('active', !isFit && (isHome ? bestKey === HOME_VIEW_KEY : view === bestKey));
  });
}

  function renderLoop(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    updateCamera(dt);
    updateViewCube();
    renderer.render(scene, camera);
    requestAnimationFrame(renderLoop);
  }

  function handleViewButton(view) {
    if (view === 'fit') fitCurrentModel(true);
    else animateToView(view);
  }

  function setButtonCharge(button, progress, armed) {
    button.style.setProperty('--charge', progress.toFixed(3));
    button.classList.toggle('armed', armed);
    button.classList.toggle('waiting', progress > 0 && progress < 1 && !armed);
  }

  function setupArmButton(button, action) {
  const state = {
    armed: false,
    progress: 0,
    start: 0,
    frame: 0,
    hovering: false,
    duration: 16
  };
  buttonArmState.set(button, state);

  const stop = (reset) => {
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
    if (reset) {
      state.progress = 0;
      state.armed = false;
      state.start = 0;
    }
    setButtonCharge(button, state.progress, state.armed);
  };

  const tick = (now) => {
    if (!state.hovering || button.disabled) {
      stop(true);
      return;
    }
    state.progress = Math.min(1, (now - state.start) / state.duration);
    if (state.progress >= 1) {
      state.armed = true;
      setButtonCharge(button, 1, true);
      state.frame = 0;
      return;
    }
    setButtonCharge(button, state.progress, false);
    state.frame = requestAnimationFrame(tick);
  };

  const begin = () => {
    if (button.disabled || state.armed) return;
    state.hovering = true;
    state.start = performance.now();
    state.progress = 0;
    setButtonCharge(button, 0, false);
    if (!state.frame) state.frame = requestAnimationFrame(tick);
  };

  const reset = () => {
    state.hovering = false;
    stop(true);
  };

  button.addEventListener('mouseenter', begin);
  button.addEventListener('focus', begin);
  button.addEventListener('mouseleave', reset);
  button.addEventListener('blur', reset);
  button.addEventListener('click', async (event) => {
    if (button.disabled) return;
    if (!state.armed) {
      event.preventDefault();
      setStatus('error', 'Hover over the button until the progress bar completes, then click.');
      return;
    }
    state.hovering = false;
    stop(true);
    await action();
  });
}

  function handleKeydown(event) {
    if (/input|textarea/i.test(document.activeElement?.tagName || '')) return;
    if (event.key.toLowerCase() === 'f') {
      fitCurrentModel(true);
      event.preventDefault();
    }
  }

  refs.canvas.addEventListener('mousedown', handlePointerDown);
  refs.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', handlePointerUp);

  refs.canvas.addEventListener('wheel', (event) => {
    zoomToCursor(event.deltaY, event.clientX, event.clientY, true);
    event.preventDefault();
  }, { passive: false });

  setupArmButton(refs.pBtn, handlePreview);
  setupArmButton(refs.dBtn, handleDownload);
  refs.viewButtons.forEach((button) => {
    button.addEventListener('click', () => handleViewButton(button.dataset.view));
  });

  Object.values(refs.inputs).forEach((input) => {
    input.addEventListener('input', updateDerived);
  });

  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', resize);

  resize();
  updateDerived();
  clearStatus();
  setCanvasCursor(null);
  refs.tbmsg.textContent = 'Waiting for Preview';
  requestAnimationFrame(renderLoop);
})();
