import fs from 'fs';
const path = 'D:/home-storage/src/components/AIChat.tsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Remove the duplicate button line at 558 (0-indexed)
lines.splice(558, 1);

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('✅ Removed duplicate button line');
