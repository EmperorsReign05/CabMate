import fs from 'fs';

const filePath = 'e:/Projects/carpool/carpool/src/pages/HomePage.jsx';

let content = fs.readFileSync(filePath, 'utf8');

// Revert THEME
content = content.replace(
  "primary: '#059669',", 
  "primary: '#ad57c1',"
);
content = content.replace(
  "primaryDark: '#047857',", 
  "primaryDark: '#7b1fa2',"
);
content = content.replace(
  "gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',", 
  "gradient: 'linear-gradient(135deg, #ad57c1 0%, #7b1fa2 100%)',"
);

// Revert hardcoded
content = content.replace(/#059669/g, '#ad57c1');
content = content.replace(/5,\s*150,\s*105/g, '173, 87, 193');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Reverted HomePage.jsx back to purple.");
