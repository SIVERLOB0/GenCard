// FILE: ./src/utils/generator.js
const { generateCardNumber } = require('./luhn');

function generateExpDate() {
  const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const y = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(-2);
  return `${m}/${y}`;
}

function generateCVV() {
  return String(Math.floor(Math.random() * 900) + 100);
}

function generateCards(patternOrBin, quantity = 5, fixedExp, fixedCVV) {
  const cards = [];
  const length = patternOrBin.length >= 12 ? patternOrBin.length : 16; // si el patrón es largo, usar su largo

  for (let i = 0; i < quantity; i++) {
    const number = generateCardNumber(patternOrBin, length);
    const exp = fixedExp || generateExpDate();
    const cvv = fixedCVV || generateCVV();
    cards.push({ number, exp, cvv });
  }
  return cards;
}

module.exports = { generateCards };