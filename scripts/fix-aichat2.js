import fs from 'fs';
const path = 'D:/home-storage/src/components/AIChat.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the duplicate Input import
content = content.replace(
    /import \{ Input \} from '\.\/ui';\nimport \{ Input \} from '\.\/ui';/,
    "import { Button } from './ui';\nimport { Input } from './ui';"
);

// Also remove the extra Button import if exists
content = content.replace(
    /import \{ Button \} from '\.\/ui';\nimport \{ Button \} from '\.\/ui';/,
    "import { Button } from './ui';"
);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ Fixed imports');
console.log('First 600 chars:');
console.log(content.slice(0, 600));
