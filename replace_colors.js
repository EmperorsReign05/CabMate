import fs from 'fs';
import path from 'path';

const SRC_DIR = 'e:/Projects/carpool/carpool/src';

const replacements = [
  { from: /#2563eb/gi, to: '#ad57c1' },
  { from: /#1e40af/gi, to: '#7b1fa2' },
  { from: /37,\s*99,\s*235/g, to: '173, 87, 193' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const rule of replacements) {
        content = content.replace(rule.from, rule.to);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Reverted ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
console.log("Color reversion complete.");
