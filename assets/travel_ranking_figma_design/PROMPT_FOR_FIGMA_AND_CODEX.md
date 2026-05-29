# Figma / Codex Prompt — Tourism Ranking Game, Four-Block Version

## Goal
Create only the center four blocks of the interactive tourism ranking game. Do not add the airport background, left narrative text, or the lower result chart yet. The main p5.js code will handle dragging, ranking logic, and reveal behavior. Figma should provide clean UI layout, landmark icons, and exportable SVG/PNG assets.

## Data context
Use the Kaggle dataset "Popular Tourist Destinations and Their Features" as the visual content source. The p5.js side should read a cleaned CSV and calculate top destinations by selected year or period. The current country names are placeholders and can be replaced by the computed top-5 list.

## Required visual blocks
Design four horizontal blocks:

1. **Pre-COVID ranking panel**
   - Title: `01 PRE-COVID`
   - Status pill: `Open Borders`
   - Five ranked country rows.
   - Each country row has: rank circle, country name, landmark icon.
   - Use solid border and calm teal accent.

2. **During-COVID ranking panel**
   - Title: `02 DURING COVID`
   - Status pill: `Restricted Travel`
   - Five ranked country rows.
   - Use a muted gray-blue palette and a dashed inner border to suggest disruption/restriction.
   - Still keep country landmark icons beside each label.

3. **Post-COVID guess panel**
   - Title: `03 POST-COVID`
   - Status pill: `Your Guess`
   - Five empty drop slots with placeholder text: `Drag a destination here`.
   - Slots should have dashed borders and enough padding for p5.js drag-and-drop collision detection.

4. **Available destinations chip bank**
   - Title: `Available destinations`
   - Subtitle: `Drag from here`
   - Five draggable country chips.
   - Each chip has country name + landmark icon.
   - This is the only drag source. The Pre-COVID and During-COVID columns are reference-only and should not look draggable.

## Icon direction
Use simple editable vector landmark icons, not photos. Keep them clean and consistent, like passport-stamp line art:
- France: Eiffel Tower
- U.S.: Statue of Liberty
- Japan: Torii gate
- Mexico: Chichen Itza / stepped pyramid
- Spain: Sagrada Familia-style spires
- Canada: CN Tower + maple leaf
- Australia: Sydney Opera House
- Turkey: Blue Mosque / mosque silhouette

## Visual style
- Clean editorial dashboard, but not generic business dashboard.
- Soft white cards, thin teal outlines, muted blue-gray restrictions, rounded rectangles.
- Avoid heavy background illustrations.
- Use no large airport scene background in this version.
- Keep everything compact and p5.js-friendly.
- Use clearly separated components with predictable coordinates.

## Interaction rules for p5.js
- Only the right-side chip bank is draggable.
- Users drag chips into Post-COVID slots.
- Pre-COVID and During-COVID panels are static reference lists.
- Reveal button can be added by p5.js below the four blocks.
- The Figma design should export every landmark icon as a separate SVG file and the whole four-block layout as one SVG mockup.

## Exact copy text
Title: `Destination Ranking Game`
Instruction: `Drag the destinations from the right into the Post-COVID slots to make your guess.`
Button: `Reveal Answer`
