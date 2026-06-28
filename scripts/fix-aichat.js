import fs from 'fs';
const path = 'D:/home-storage/src/components/AIChat.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the duplicate Input import
content = content.replace(
    "import { Input } from './ui';\nimport { Input } from './ui';",
    "import { Input } from './ui';"
);

// Also fix the stray 'n' character
content = content.replace("import { Input } from './ui';nimport", "import { Input } from './ui';\nimport");

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Fixed duplicate imports');
