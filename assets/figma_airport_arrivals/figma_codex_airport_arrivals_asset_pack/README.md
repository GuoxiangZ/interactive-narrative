# Figma / Codex Airport Arrivals Asset Pack

This package contains modular image assets for the **U.S. Inbound Travelers** visualization.

## Recommended workflow

1. Import `assets/backgrounds/airport_arrivals_hall_background.png` as the background layer.
2. Overlay UI components from `assets/ui/individual_png/`, or recreate them as editable Figma text/vector layers.
3. Place traveler assets from `assets/people/individual_png/` in the lower half. Scale them by depth:
   - foreground: 90–130 px tall
   - midground: 55–85 px tall
   - background: 25–45 px tall
4. Use architecture/signage modules to extend the airport setting if needed.
5. Keep the main split-flap number in the upper half, above the traveler layer.
6. Keep all travelers oriented toward the central `ARRIVALS` entrance.

## Suggested Figma layer order

- 00 Background
- 01 Architecture extension / glass / floor
- 02 Queue barriers
- 03 Travelers background
- 04 Travelers midground
- 05 Travelers foreground
- 06 Data overlay card
- 07 Flip-board number
- 08 Year selector
- 09 Header title
- 10 Optional left Global Overview panel

## Data values currently used

- 2018 = 87
- 2019 = 100
- 2020 = 28
- 2021 = 47
- 2022 = 74
- 2023 = 98
- 2024 = 112

## Important

The PNG assets are designed for extraction and layout control in Figma/Codex. For final implementation, use these as visual layers and keep live text/UI in Figma or p5.js for crisp rendering and animation.
