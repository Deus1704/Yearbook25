const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a canvas for the profile placeholder
const width = 400;
const height = 400;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fill the background
ctx.fillStyle = '#e0e0e0';
ctx.fillRect(0, 0, width, height);

// Draw a simple user icon
ctx.fillStyle = '#a0a0a0';
// Head
ctx.beginPath();
ctx.arc(width / 2, height / 3, height / 5, 0, Math.PI * 2);
ctx.fill();

// Body
ctx.beginPath();
ctx.moveTo(width / 5, height);
ctx.bezierCurveTo(
  width / 5, height / 2,
  width / 2, height / 2,
  width / 2, height / 2
);
ctx.bezierCurveTo(
  width / 2, height / 2,
  4 * width / 5, height / 2,
  4 * width / 5, height
);
ctx.fill();

// Save the image
const buffer = canvas.toBuffer('image/jpeg');
const outputPath = path.join(__dirname, '../assets/profile-placeholder.jpg');
fs.writeFileSync(outputPath, buffer);

console.log(`Placeholder image saved to ${outputPath}`);
