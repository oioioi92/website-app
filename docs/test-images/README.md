# Phase 4 Upload Test Images

This folder is used by `docs/THEME-UPLOAD-PHASE4-CHECK.sh`.

Preferred: generate everything on the VPS:

```bash
node docs/generate-theme-upload-phase4-test-images.cjs
```

Expected files:

- `ok.png` (valid PNG)
- `bad.svg` (SVG; must be rejected)
- `fake.png` (not a real PNG; must fail decode)
- `too-big.jpg` (>2MB; must be rejected by size)
- `too-large-dimension.png` (width > 4096; must be rejected by dimension)

