const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/config.js',
  'routes/routes.js',
  'src/app.js',
  'src/index.js'
];

function removeConsoleLogs(content) {
  // Remove console.log statements
  content = content.replace(/^\s*console\.log\(.*\);?\s*$/gm, '');
  // Remove empty lines
  content = content.replace(/^\s*[\r\n]/gm, '');
  return content;
}

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  fs.readFile(fullPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }
    const updatedContent = removeConsoleLogs(data);
    fs.writeFile(fullPath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${filePath}:`, err);
      } else {
        console.log(`Updated ${filePath}`);
      }
    });
  });
});