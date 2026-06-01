# Codex / Figma Prompt: Interactive Travel Book Landing Page

Build a landing screen for an interactive travel data article.

Concept:
We are a travel agency. The opening screen shows a travel-agency office or consultation desk. On the desk sits a large report book. The book is the main interactive object. The book cover title is:

Pandemic Impact on Travel Frequency and Spending

Visual style:
- Match the attached reference image.
- Use a clean travel-agency atmosphere: warm desk, soft teal accents, light gray/cream background, subtle shadows.
- Keep the design elegant, editorial, and consistent with the travel data visualizations.
- Do not add visible "click here" text on the cover page.
- The book should feel clickable through hover motion, cursor state, and subtle elevation.

Interaction:
1. Initial state:
   - Display the travel-agency desk scene.
   - Show the book prominently on the desk.
   - The book cover is closed.

2. Hover:
   - Slight scale up: 1.02–1.04.
   - Add subtle shadow/elevation.
   - Optional small page-edge shimmer.

3. Click:
   - Play a page-turn or book-opening transition.
   - Use CSS transform, perspective, rotateY, and layered page panels.
   - The animation should feel like opening a report, not like a normal webpage jump.

4. After animation:
   - Transition into the first visualization section:
     Worldwide Inbound Tourism, 2018–2024.
   - The transition can fade/slide from the book page into the full data visualization.

Implementation notes:
- Use the reference image for visual direction.
- If using p5.js, the book image can be drawn as the clickable object and a page-turn animation can be simulated using rotating quadrilateral/page masks.
- If using HTML/CSS, place the book as an image layer and animate a pseudo page layer over it.
- Keep performance lightweight.
