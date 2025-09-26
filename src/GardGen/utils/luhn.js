// FILE: ./src/utils/luhn.js
function calculateCheckDigit(numberWithoutCheck) {
  const digits = numberWithoutCheck.split('').map(Number).reverse();
  const sum = digits.reduce((acc, digit, idx) => {
    if (idx % 2 === 0) {
      let doubled = digit * 2;
      if (doubled > 9) doubled -= 9;
      return acc + doubled;
    }
    return acc + digit;
  }, 0);

  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

function fillPattern(pattern) {
  let result = '';
  for (let char of pattern) {
    if (char.toLowerCase() === 'x') {
      result += Math.floor(Math.random() * 10);
    } else {
      result += char;
    }
  }
  return result;
}

function generateCardNumber(patternOrBin, length = 16) {
  let base = patternOrBin;

  // Si el patrón contiene 'x', rellenar
  if (/[xX]/.test(base)) {
    base = fillPattern(base);
    // Si el patrón ya tiene la longitud final, devolverlo tal cual
    if (base.length === length) return base;
  }

  // Si solo son números y es más corto que length-1, completar con aleatorios
  while (base.length < length - 1) {
    base += Math.floor(Math.random() * 10);
  }

  // Calcular y añadir dígito de control
  const checkDigit = calculateCheckDigit(base);
  return base + checkDigit;
}

module.exports = { calculateCheckDigit, generateCardNumber };