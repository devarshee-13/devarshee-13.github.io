# Devarshee Thopte Portfolio

Static, dependency-free portfolio site. Dark editorial layout with a pinned
cinematic hero, scroll-driven text reveal, a pinned project sequence, and a
drifting stack marquee.

## Run locally

```bash
python3 -m http.server 5173
```

Then open `http://127.0.0.1:5173`.

## Files

- `index.html` - page content and sections
- `styles.css` - design tokens, 12-column layout grid, hero light-field, motion states
- `script.js` - scroll-progress motion layer (hero parallax, text reveal, project sequence, marquee, nav auto-hide)

## Design notes

- Type: Instrument Sans (display/body) + DM Mono (uppercase micro-labels), both from Google Fonts.
- Layout: 12-column grid; section labels sit in columns 1-3, content in 5-11.
- The hero atmosphere is drawn entirely in CSS (layered gradients, rotated
  prismatic light strips, SVG grain) - no image assets, so nothing to load.
- Native scrolling is never hijacked. Only the animation values are lerped each
  frame, which gives smooth-scroll feel without taking over the scrollbar.
- `prefers-reduced-motion` disables parallax, reveals, and the marquee, and
  renders the manifesto text at full opacity.
