// p5.js asset-loading and drag structure for the four-block ranking game.
// Main interaction logic belongs in p5.js; Figma provides the visual assets.

let iconMap = {};
let chips = [];
let dropSlots = [
  { rank: 1, x: 990, y: 290, w: 285, h: 62, country: null },
  { rank: 2, x: 990, y: 375, w: 285, h: 62, country: null },
  { rank: 3, x: 990, y: 460, w: 285, h: 62, country: null },
  { rank: 4, x: 990, y: 545, w: 285, h: 62, country: null },
  { rank: 5, x: 990, y: 630, w: 285, h: 62, country: null }
];

const destinations = [
  { country: 'Japan', iconKey: 'japan', color: '#5B368A', x: 1335, y: 355 },
  { country: 'Canada', iconKey: 'canada', color: '#C83232', x: 1335, y: 425 },
  { country: 'U.S.', iconKey: 'us', color: '#C83232', x: 1335, y: 495 },
  { country: 'Australia', iconKey: 'australia', color: '#0F5A9C', x: 1335, y: 565 },
  { country: 'Turkey', iconKey: 'turkey', color: '#087E92', x: 1335, y: 635 }
];

function preload() {
  iconMap.france = loadImage('assets/icons/france_eiffel.svg');
  iconMap.us = loadImage('assets/icons/us_statue.svg');
  iconMap.japan = loadImage('assets/icons/japan_torii.svg');
  iconMap.mexico = loadImage('assets/icons/mexico_pyramid.svg');
  iconMap.spain = loadImage('assets/icons/spain_sagrada.svg');
  iconMap.canada = loadImage('assets/icons/canada_cn_maple.svg');
  iconMap.australia = loadImage('assets/icons/australia_opera.svg');
  iconMap.turkey = loadImage('assets/icons/turkey_mosque.svg');
}

function setup() {
  createCanvas(1600, 760);
  textFont('Inter');
  chips = destinations.map(d => ({ ...d, w: 200, h: 58, dragging: false, offsetX: 0, offsetY: 0, slotRank: null }));
}

function draw() {
  background(255);
  // Option A: draw the full Figma mockup as exported SVG background.
  // image(layoutSvg, 0, 0, width, height);

  // Option B: draw all panels in p5.js, then draw icons from Figma assets.
  // Use layout.json coordinates for cards and hitboxes.

  chips.forEach(drawChip);
}

function drawChip(chip) {
  push();
  stroke(chip.color);
  strokeWeight(1.8);
  fill(255);
  rect(chip.x, chip.y, chip.w, chip.h, 10);
  noStroke();
  fill(chip.color);
  textStyle(BOLD);
  textSize(19);
  text(chip.country.toUpperCase(), chip.x + 30, chip.y + 37);
  image(iconMap[chip.iconKey], chip.x + chip.w - 55, chip.y + 12, 34, 34);
  pop();
}

function mousePressed() {
  for (let i = chips.length - 1; i >= 0; i--) {
    const c = chips[i];
    if (mouseX >= c.x && mouseX <= c.x + c.w && mouseY >= c.y && mouseY <= c.y + c.h) {
      c.dragging = true;
      c.offsetX = mouseX - c.x;
      c.offsetY = mouseY - c.y;
      break;
    }
  }
}

function mouseDragged() {
  chips.forEach(c => {
    if (c.dragging) {
      c.x = mouseX - c.offsetX;
      c.y = mouseY - c.offsetY;
    }
  });
}

function mouseReleased() {
  chips.forEach(c => {
    if (!c.dragging) return;
    c.dragging = false;
    const slot = dropSlots.find(s => mouseX >= s.x && mouseX <= s.x + s.w && mouseY >= s.y && mouseY <= s.y + s.h);
    if (slot) {
      c.x = slot.x;
      c.y = slot.y + 2;
      c.slotRank = slot.rank;
      slot.country = c.country;
    }
  });
}
