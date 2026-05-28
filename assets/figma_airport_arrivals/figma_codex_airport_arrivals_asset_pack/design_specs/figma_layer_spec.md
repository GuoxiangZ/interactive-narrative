# Figma Layer Spec

Canvas: 1440 × 900 or 1600 × 1000.

## Composition

Left 25–30%:
- Global Overview card
- world map and legend

Right 70–75%:
- large U.S. Arrivals hero scene
- top year selector
- upper-center flip-board number
- lower-half airport travelers

## Recommended placement

- Background: fill right hero panel; use mask with rounded rectangle.
- Flip-board: x center, y 160–280 depending canvas; width 420–560.
- Arrivals entrance: visible behind/under flip-board, centered.
- Travelers: lower half only, heading toward central doors.
- Year selector: top right, aligned with U.S. Arrivals title.
- Avoid placing text over busy traveler areas.

## Animation notes for Codex/p5.js

Year selector:
- selected year pill slides horizontally.
- selected data value drives flip-board.

Flip-board:
- sequence: slow start → fast digit flip → decelerate → snap/settle.
- use target values 087, 100, 028, 047, 074, 098, 112.

Traveler density:
- 2019: baseline normal flow
- 2020: sparse
- 2021: light recovery
- 2022: moderate
- 2023: near baseline
- 2024: fuller than baseline

Recommended implementation:
- use `airport_arrivals_hall_background.png` as static background.
- render live UI and digits in p5.js/HTML overlay.
- optionally place person PNGs with CSS/p5.js transforms for motion.
