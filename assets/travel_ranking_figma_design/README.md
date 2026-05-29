# Travel Ranking Figma Design Package

This package is for the **top interactive block only**: Pre-COVID, During COVID, Post-COVID guess slots, and Available Destinations.

## What is inside

- `assets/figma/top_four_blocks_figma_import.svg`  
  Import this into Figma as the editable reference layout.

- `assets/icons/*.svg`  
  Separate landmark icons for p5.js or Figma export.

- `tokens.json`  
  Color tokens and typography notes.

- `layout.json`  
  Suggested p5.js coordinates for panel bounds, slot hitboxes, and chip bank positions.

- `destinations.json`  
  Placeholder destination/icon mapping.

- `p5js/load_assets_example.js`  
  Example p5.js asset-loading and drag-object structure.

- `PROMPT_FOR_FIGMA_AND_CODEX.md`  
  Prompt you can paste into Figma AI, Codex, or another design/code agent.

## How to use in Figma

1. Open Figma.
2. Drag `top_four_blocks_figma_import.svg` onto the canvas.
3. Drag the individual SVG icons from `assets/icons/` into the Figma file if you want separate editable components.
4. Export icons as SVG or PNG depending on what your p5.js project needs.

## How to use in p5.js

Use the icon files from `assets/icons/` with `loadImage()` in `preload()`. The example file in `p5js/` shows a basic structure.

The actual rankings should be calculated from your cleaned Kaggle CSV, not hard-coded permanently. The country list in this design is a placeholder visual sample.
