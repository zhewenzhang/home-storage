import fs from 'fs';

const path = 'D:/home-storage/src/components/AIChat.tsx';
const buffer = fs.readFileSync(path);
let content = buffer.toString('utf8');

// Check current state
const hasButtonImport = content.includes("import { Button } from './ui'");
const hasInputImport = content.includes("import { Input } from './ui'");
const hasSwissBtn = content.includes('swiss-btn');
const hasSwissInput = content.includes('swiss-input');
const hasButtonTag = content.includes('<Button');
const hasInputTag = content.includes('<Input');

console.log('Current state:');
console.log('  Button import:', hasButtonImport);
console.log('  Input import:', hasInputImport);
console.log('  swiss-btn:', hasSwissBtn);
console.log('  swiss-input:', hasSwissInput);
console.log('  <Button:', hasButtonTag);
console.log('  <Input:', hasInputTag);

// 1. Add imports if not present
if (!hasButtonImport || !hasInputImport) {
    content = content.replace(
        "import { useNavigate } from 'react-router-dom';",
        "import { useNavigate } from 'react-router-dom';\nimport { Button } from './ui';\nimport { Input } from './ui';"
    );
    console.log('✅ Added imports');
}

// 2. Replace confirm button - match the ACTUAL current format
content = content.replace(
    /<button onClick={handleConfirm}\s*className="[^"]*"\s*>✅ 确认执行<\/button>/,
    `<Button onClick={handleConfirm}
                                                variant="primary" size="sm" className="flex-1"
                                            >✅ 确认执行</Button>`
);

// 3. Replace cancel button
content = content.replace(
    /<button onClick={handleCancel}\s*className="[^"]*"\s*>❌ 取消<\/button>/,
    `<Button onClick={handleCancel}
                                                variant="secondary" size="sm" className="flex-1"
                                            >❌ 取消</Button>`
);

// 4. Replace input - match the ACTUAL current format  
content = content.replace(
    /<input ref={inputRef} type="text" value={input}\s*onChange=\{\(e\) => setInput\(e\.target\.value\)} onKeyDown={handleKeyDown}\s*placeholder="在书房加个置物柜，把网线放进去\.\.\."\s*disabled=\{isLoading \|\| !!pendingActions\}\s*className="[^"]*"\s*\/>/,
    `<Input ref={inputRef} type="text" value={input}
                                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder="在书房加个置物柜，把网线放进去..."
                                disabled={isLoading || !!pendingActions}
                                className="flex-1"
                            />`
);

fs.writeFileSync(path, content, 'utf8');

// Verify
const check = fs.readFileSync(path, 'utf8');
console.log('\nAfter update:');
console.log('  Button import:', check.includes("import { Button } from './ui'"));
console.log('  Input import:', check.includes("import { Input } from './ui'"));
console.log('  <Button:', (check.match(/<Button/g) || []).length);
console.log('  <Input:', (check.match(/<Input/g) || []).length);
console.log('  swiss-btn:', check.includes('swiss-btn'));
console.log('  swiss-input:', check.includes('swiss-input'));
