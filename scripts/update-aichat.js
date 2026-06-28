import fs from 'fs';
const path = 'D:/home-storage/src/components/AIChat.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
    "import { useNavigate } from 'react-router-dom';",
    "import { useNavigate } from 'react-router-dom';\nimport { Button } from './ui';\nimport { Input } from './ui';"
);

// 2. Replace confirm button (swiss-btn → Button)
content = content.replace(
    /<button onClick={handleConfirm}\s*className="flex-1 py-2\.5 text-xs font-bold uppercase swiss-btn"\s*>✅ 确认执行<\/button>/,
    `<Button onClick={handleConfirm}
                                                variant="primary" size="sm" className="flex-1"
                                            >✅ 确认执行</Button>`
);

// 3. Replace cancel button closing tag (only the one after handleCancel)
content = content.replace(
    /(<button onClick={handleCancel}\s*className="flex-1 py-2\.5 text-xs font-bold uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white"\s*>❌ 取消<\/)button>/,
    '$1Button>'
);

// 4. Replace input (swiss-input → Input)
content = content.replace(
    /<input ref={inputRef} type="text" value={input}\s*onChange=\{[\(e)] *=> *setInput\(e\.target\.value\)} onKeyDown={handleKeyDown}\s*placeholder="在书房加个置物柜，把网线放进去\.\.\."\s*disabled=\{isLoading \|\| !!pendingActions\}\s*className="flex-1 px-4 py-3 border-2 border-black dark:border-white bg-white dark:bg-black text-sm dark:text-gray-100 outline-none focus:ring-2 focus:ring-black\/20 dark:focus:ring-white\/20 transition-all disabled:opacity-50 swiss-input"\s*\/>/,
    `<Input ref={inputRef} type="text" value={input}
                                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder="在书房加个置物柜，把网线放进去..."
                                disabled={isLoading || !!pendingActions}
                                className="flex-1"
                            />`
);

fs.writeFileSync(path, content, 'utf8');
console.log('✅ AIChat.tsx updated successfully');
