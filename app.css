:root {
  --bg: #070a11;
  --panel: #0d1219;
  --card: #121a24;
  --card-strong: #0f1822;
  --border: #203245;
  --border-soft: rgba(130, 170, 210, 0.12);
  --accent: #35d3ff;
  --gold: #f5b13d;
  --text: #d8e2ee;
  --muted: #7c97b0;
  --success: #31d98a;
  --error: #ff6378;
  --shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
  --sans: "Avenir Next", "Segoe UI Variable", "Trebuchet MS", "Gill Sans", sans-serif;
  --mono: "SFMono-Regular", "JetBrains Mono", "Consolas", "Menlo", monospace;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  min-height: 100%;
}

body {
  background:
    radial-gradient(circle at top left, rgba(53, 211, 255, 0.08), transparent 26%),
    linear-gradient(180deg, #08101a 0%, #070a11 100%);
  color: var(--text);
  font-family: var(--sans);
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow-x: hidden;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(53, 211, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(53, 211, 255, 0.035) 1px, transparent 1px);
  background-size: 42px 42px;
  pointer-events: none;
  z-index: 0;
}

header,
main,
footer {
  position: relative;
  z-index: 1;
}

header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.35rem 2.4rem;
  border-bottom: 1px solid var(--border);
  background: rgba(7, 10, 17, 0.88);
  backdrop-filter: blur(18px);
}

.logo {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 1.5px solid rgba(53, 211, 255, 0.65);
  color: var(--accent);
  box-shadow: inset 0 0 0 1px rgba(53, 211, 255, 0.06);
}

.logo svg {
  width: 20px;
  height: 20px;
}

.header-text h1 {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #fff;
}

.header-text h1 span {
  color: var(--accent);
}

.header-text p {
  margin-top: 0.15rem;
  font-family: var(--mono);
  font-size: 0.68rem;
  color: var(--muted);
}

.badge {
  margin-left: auto;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  border: 1px solid rgba(53, 211, 255, 0.28);
  background: rgba(53, 211, 255, 0.08);
  color: var(--accent);
  font-family: var(--mono);
  font-size: 0.64rem;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

main {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  height: calc(100vh - 83px);
}

.sidebar {
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: rgba(13, 18, 25, 0.92);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  backdrop-filter: blur(18px);
}

.stitle {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.72rem;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.stitle::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}

.frow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  margin-bottom: 0.55rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

label {
  display: flex;
  align-items: center;
  gap: 0.28rem;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.67rem;
}

label .lk {
  color: var(--accent);
  font-weight: 700;
}

.iw {
  position: relative;
}

.iw input[type="number"],
.iw input[type="text"] {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(20, 29, 40, 0.95), rgba(16, 24, 34, 0.95));
  color: var(--text);
  font-family: var(--mono);
  font-size: 0.94rem;
  font-weight: 600;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.iw input[type="number"] {
  padding: 0.52rem 2.2rem 0.52rem 0.75rem;
  -moz-appearance: textfield;
}

.iw input[type="text"] {
  padding: 0.52rem 3rem 0.52rem 0.75rem;
}

.iw input[type="number"]::-webkit-inner-spin-button,
.iw input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.iw input:focus {
  border-color: rgba(53, 211, 255, 0.72);
  box-shadow: 0 0 0 3px rgba(53, 211, 255, 0.12);
}

.iu {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.64rem;
  pointer-events: none;
}

.infobox,
.dbox {
  border-radius: 12px;
  padding: 0.85rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.infobox {
  background: var(--card);
  border: 1px solid var(--border);
}

.dbox {
  background: linear-gradient(180deg, rgba(53, 211, 255, 0.06), rgba(53, 211, 255, 0.025));
  border: 1px solid rgba(53, 211, 255, 0.16);
}

.prow,
.drow {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.15rem 0;
  font-family: var(--mono);
  font-size: 0.72rem;
}

.pk,
.dk {
  color: var(--muted);
}

.pv {
  color: var(--text);
  font-weight: 600;
}

.dv {
  color: var(--accent);
  font-weight: 700;
}

.export-stack {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.btn {
  --charge: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1.5px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-family: var(--sans);
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  overflow: hidden;
  transition: color 0.2s ease, transform 0.12s ease, opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(53, 211, 255, 0.2), rgba(123, 233, 255, 0.22));
  transform: scaleX(var(--charge));
  transform-origin: left;
  transition: transform 0.016s linear, background 0.12s ease;
}

.btn:hover:not(:disabled) {
  border-color: rgba(123, 233, 255, 0.95);
  box-shadow: 0 0 0 1px rgba(53, 211, 255, 0.14);
}

.btn:active {
  transform: scale(0.985);
}

.btn:disabled {
  opacity: 0.48;
  cursor: not-allowed;
}

.btn span,
.btn svg {
  position: relative;
  z-index: 1;
}

.btn .btn-progress {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.btn.armed {
  color: #061018;
}

.btn.armed::before {
  background: linear-gradient(90deg, rgba(53, 211, 255, 0.95), rgba(123, 233, 255, 0.95));
}

.btn.gold {
  border-color: var(--gold);
  color: var(--gold);
}

.btn.gold::before {
  background: linear-gradient(90deg, rgba(245, 177, 61, 0.18), rgba(255, 205, 112, 0.22));
}

.btn.gold:hover:not(:disabled) {
  border-color: rgba(255, 205, 112, 0.95);
  box-shadow: 0 0 0 1px rgba(245, 177, 61, 0.14);
}

.btn.gold.armed::before {
  background: linear-gradient(90deg, rgba(245, 177, 61, 0.95), rgba(255, 205, 112, 0.95));
}

.btn.waiting {
  color: var(--text);
}

#status {
  display: none;
  border-radius: 10px;
  padding: 0.58rem 0.78rem;
  font-family: var(--mono);
  font-size: 0.71rem;
  line-height: 1.5;
}

#status.loading,
#status.success,
#status.error {
  display: block;
}

#status.loading {
  background: rgba(53, 211, 255, 0.08);
  color: var(--accent);
}

#status.success {
  background: rgba(49, 217, 138, 0.08);
  color: var(--success);
}

#status.error {
  background: rgba(255, 99, 120, 0.08);
  color: var(--error);
}

.rpane {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: linear-gradient(180deg, rgba(7, 12, 18, 0.98), rgba(6, 10, 16, 0.98));
}

.rtbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.76rem 1.25rem;
  border-bottom: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 0.68rem;
  color: var(--muted);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #203245;
  flex-shrink: 0;
  transition: background 0.28s ease, box-shadow 0.28s ease;
}

.dot.on {
  background: var(--accent);
  box-shadow: 0 0 12px rgba(53, 211, 255, 0.85);
}

#tbdim {
  margin-left: auto;
  text-align: right;
}

#cv {
  flex: 1;
  display: block;
  width: 100%;
  min-height: 0;
}

.viewport-tools {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 6;
  pointer-events: none;
}

.viewcube-panel {
  pointer-events: auto;
  width: 136px;
  padding: 0.7rem;
  border-radius: 16px;
  border: 1px solid var(--border-soft);
  background: rgba(10, 16, 24, 0.82);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.viewcube-title {
  margin-bottom: 0.5rem;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.viewcube-scene {
  width: 100%;
  height: 104px;
  display: grid;
  place-items: center;
  perspective: 720px;
}

.viewcube {
  position: relative;
  width: 62px;
  height: 62px;
  transform-style: preserve-3d;
}

.cube-face,
.cube-corner {
  backface-visibility: hidden;
}

.cube-face {
  position: absolute;
  inset: 0;
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 1px solid rgba(98, 153, 204, 0.28);
  background: linear-gradient(180deg, rgba(28, 42, 58, 0.95), rgba(18, 28, 38, 0.95));
  color: var(--text);
  font-family: var(--mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
}

.cube-face:hover,
.cube-face.active {
  color: #fff;
  border-color: rgba(53, 211, 255, 0.62);
  background: linear-gradient(180deg, rgba(38, 66, 92, 0.95), rgba(17, 35, 49, 0.95));
}

.cube-corner {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border-radius: 4px;
  border: 1px solid rgba(98, 153, 204, 0.34);
  background: linear-gradient(180deg, rgba(20, 32, 46, 0.96), rgba(13, 20, 29, 0.96));
  box-shadow: 0 0 0 1px rgba(7, 12, 18, 0.44);
  cursor: pointer;
  transform-style: preserve-3d;
  transition: border-color 0.14s ease, background 0.14s ease, box-shadow 0.14s ease;
}

.cube-corner:hover,
.cube-corner.active {
  border-color: rgba(53, 211, 255, 0.78);
  background: linear-gradient(180deg, rgba(53, 211, 255, 0.9), rgba(23, 133, 177, 0.94));
  box-shadow: 0 0 0 1px rgba(53, 211, 255, 0.18), 0 0 14px rgba(53, 211, 255, 0.22);
}

.corner-tfr { transform: translate3d(24px, -24px, 24px); }
.corner-tfl { transform: translate3d(-24px, -24px, 24px); }
.corner-tbr { transform: translate3d(24px, -24px, -24px); }
.corner-tbl { transform: translate3d(-24px, -24px, -24px); }
.corner-bfr { transform: translate3d(24px, 24px, 24px); }
.corner-bfl { transform: translate3d(-24px, 24px, 24px); }
.corner-bbr { transform: translate3d(24px, 24px, -24px); }
.corner-bbl { transform: translate3d(-24px, 24px, -24px); }

.face-front { transform: rotateY(0deg) translateZ(31px); }
.face-back { transform: rotateY(180deg) translateZ(31px); }
.face-right { transform: rotateY(90deg) translateZ(31px); }
.face-left { transform: rotateY(-90deg) translateZ(31px); }
.face-top { transform: rotateX(90deg) translateZ(31px); }
.face-bottom { transform: rotateX(-90deg) translateZ(31px); }

.viewcube-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  margin-top: 0.55rem;
}

.viewchip {
  border: 1px solid rgba(98, 153, 204, 0.22);
  border-radius: 999px;
  padding: 0.44rem 0.1rem;
  background: rgba(16, 25, 36, 0.9);
  color: var(--text);
  font-family: var(--mono);
  font-size: 0.66rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.18s ease, color 0.18s ease, transform 0.12s ease;
}

.viewchip:hover,
.viewchip.active {
  color: var(--accent);
  border-color: rgba(53, 211, 255, 0.55);
}

.viewchip:active {
  transform: scale(0.98);
}

.hint {
  position: absolute;
  right: 1.1rem;
  bottom: 1rem;
  display: grid;
  gap: 0.12rem;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.58rem;
  text-align: right;
  pointer-events: none;
}

.hint span:first-child {
  color: var(--text);
}

footer {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 0.58rem 2.4rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.62rem;
  background: rgba(7, 10, 17, 0.88);
}

footer span {
  color: var(--text);
}

@media (max-width: 980px) {
  main {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(50vh, 1fr);
    height: auto;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  #cv {
    min-height: 55vh;
  }
}

@media (max-width: 640px) {
  header,
  footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .sidebar {
    padding: 1rem;
  }

  .frow {
    grid-template-columns: 1fr;
  }

  .viewcube-panel {
    width: 124px;
    padding: 0.58rem;
  }

  .hint {
    left: 1rem;
    right: 1rem;
    text-align: left;
  }
}
