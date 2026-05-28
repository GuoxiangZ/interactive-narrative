// p5.js overlay starter for U.S. Arrivals visualization.
// Load the background as an image, then render live year selector and flip digits.

const data = {
  2018: 87,
  2019: 100,
  2020: 28,
  2021: 47,
  2022: 74,
  2023: 98,
  2024: 112
};

let selectedYear = 2019;
let currentValue = 100;
let targetValue = 100;
let bg;

function preload() {
  bg = loadImage('../assets/backgrounds/airport_arrivals_hall_background.png');
}

function setup() {
  createCanvas(1440, 900);
  textFont('Arial');
}

function draw() {
  background('#f7fbfa');
  image(bg, 0, 0, width, height);
  currentValue += (targetValue - currentValue) * 0.12;
  drawFlipNumber(round(currentValue));
  drawYearSelector();
}

function drawFlipNumber(value) {
  const s = nf(value, 3);
  push();
  translate(width / 2 - 220, 170);
  fill(255, 245);
  noStroke();
  rect(-40, -45, 520, 250, 24);
  fill('#14333F');
  textAlign(CENTER);
  textSize(22);
  text('Index vs. 2019 baseline', 220, -10);
  for (let i = 0; i < 3; i++) {
    fill('#0B6F6A');
    rect(i * 145, 30, 125, 145, 10);
    stroke('#064F4B');
    line(i * 145, 102, i * 145 + 125, 102);
    noStroke();
    fill(255);
    textSize(86);
    text(s[i], i * 145 + 62, 127);
  }
  fill('#637985');
  textSize(18);
  text(`${selectedYear} = ${selectedYear === 2019 ? 'baseline' : 'selected year'}`, 220, 205);
  pop();
}

function drawYearSelector() {
  const years = Object.keys(data);
  push();
  translate(width - 690, 55);
  fill(255, 235);
  noStroke();
  rect(0, 0, 610, 52, 26);
  textAlign(CENTER, CENTER);
  textSize(16);
  years.forEach((y, i) => {
    const x = 42 + i * 85;
    if (+y === selectedYear) {
      fill('#1AA6A6');
      rect(x - 34, 9, 68, 34, 17);
      fill(255);
    } else {
      fill((+y === 2020 || +y === 2021) ? '#E86B2D' : '#14333F');
    }
    text(y, x, 27);
  });
  pop();
}

function mousePressed() {
  const years = Object.keys(data).map(Number);
  // adjust this if embedding inside a different canvas/layout
  const baseX = width - 690;
  const baseY = 55;
  years.forEach((y, i) => {
    const x = baseX + 42 + i * 85;
    if (dist(mouseX, mouseY, x, baseY + 27) < 35) {
      selectedYear = y;
      targetValue = data[y];
    }
  });
}
