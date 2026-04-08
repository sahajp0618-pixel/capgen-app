# CapGen

CapGen is a browser-based parametric STL generator for printable electronic component caps and covers.

## Features

- Live 3D preview in the browser
- Binary STL download with no backend required
- Fusion-style viewport navigation
- Clickable view cube with face and corner targets
- Static site deployment ready for GitHub Pages

## Project Structure

- `index.html` - main app entry point
- `capgen_final.html` - redirect entry for legacy links
- `assets/css/app.css` - application styles
- `assets/js/app.js` - geometry, viewer, and STL export logic
- `assets/vendor/three.r128.min.js` - local Three.js runtime

## Local Preview

Open `index.html` in VS Code Live Server or any static file server.

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

After pushing to GitHub:

1. Open the repository settings.
2. Go to `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main` to deploy the site.

## Notes

This version is fully static. All preview generation and STL export happen in the browser, so no Node.js server or OpenSCAD backend is required for deployment.
