const fs = require('fs');
const content = fs.readFileSync('c:/Users/Yusuff Ali/.gemini/antigravity/brain/f6e65ae7-549d-4ddb-b289-b0f125c3914e/.system_generated/logs/overview.txt', 'utf8');

const regex = /File Path: `file:\/\/\/c:\/Gamified-\/frontend\/app\/admin\/page.jsx`\nTotal Lines: 874\nTotal Bytes: 45836\nShowing lines 1 to 800\n([\s\S]*?)The above content does NOT show the entire file contents\./m;
const match = content.match(regex);

if (match) {
  const lines = match[1].split('\n').filter(Boolean);
  const stripped = lines.map(l => {
    const idx = l.indexOf(': ');
    if (idx !== -1 && !isNaN(parseInt(l.substring(0, idx)))) {
      return l.substring(idx + 2);
    }
    return l;
  }).filter(l => !l.includes('The following code has been modified'));
  
  fs.writeFileSync('c:/Gamified-/frontend/app/admin/page_recovered.jsx', stripped.join('\n'));
  console.log('Recovered 800 lines to page_recovered.jsx');
} else {
  console.log('No match found for recovery');
}
