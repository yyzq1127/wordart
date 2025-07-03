const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, 'font_previews', 'ttf');
// Change output directory to a 'data' folder in the root
const outputDir = path.join(__dirname, 'data');
const outputDataFile = path.join(outputDir, 'font_base64_data.js');

const fontBase64Data = {};

try {
  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(fontDir);

  files.forEach(file => {
    if (file.endsWith('_preview.ttf')) {
      const filePath = path.join(fontDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      const base64String = fileBuffer.toString('base64');
      
      const fontFamily = path.basename(file, '_preview.ttf');
      
      fontBase64Data[fontFamily] = base64String;
      console.log(`Converted ${file} to Base64.`);
    }
  });

  const outputContent = `// This file is auto-generated. Do not edit directly.\nconst fontBase64Data = ${JSON.stringify(fontBase64Data, null, 2)};\n\nmodule.exports = fontBase64Data;\n`;

  fs.writeFileSync(outputDataFile, outputContent);
  console.log(`\nSuccessfully generated ${outputDataFile}`);

} catch (err) {
  console.error('An error occurred:', err);
  process.exit(1);
}
