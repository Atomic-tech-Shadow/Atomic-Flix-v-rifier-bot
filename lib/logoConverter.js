const fs = require('fs');
const path = require('path');

function getAtomicFlixLogoBase64() {
  try {
    const logoPath = path.join(__dirname, '../assets/atomic-flix-logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = logoBuffer.toString('base64');
    return `data:image/png;base64,${logoBase64}`;
  } catch (error) {
    console.log('Could not load ATOMIC FLIX logo, using fallback');
    return null;
  }
}

module.exports = {
  getAtomicFlixLogoBase64
};