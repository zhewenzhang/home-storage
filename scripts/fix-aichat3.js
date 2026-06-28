import fs from 'fs';
const path = 'D:/home-storage/src/components/AIChat.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace the confirm/cancel button section
const oldBtnSection = `<button onClick={handleConfirm}
                                                className="flex-1 py-2.5 text-xs font-bold uppercase swiss-btn"
                                            >✅ 确认执行</button>
                                            <button onClick={handleCancel}
                                                className="flex-1 py-2.5 text-xs font-bold uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white"
                                            >❌ 取消</button>`;

const newBtnSection = `<Button onClick={handleConfirm}
                                                variant="primary" size="sm" className="flex-1"
                                            >✅ 确认执行</Button>
                                            <Button onClick={handleCancel}
                                                variant="secondary" size="sm" className="flex-1"
                                            >❌ 取消</Button>`;

if (content.includes(oldBtnSection)) {
    content = content.replace(oldBtnSection, newBtnSection);
    console.log('✅ Button section replaced');
} else {
    console.log('❌ Button section NOT found - checking actual content...');
    const idx = content.indexOf('handleConfirm');
    console.log('Around handleConfirm:', content.slice(idx, idx+300));
}

// 2. Replace the input
const oldInput = `<input ref={inputRef} type="text" value={input}
                                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder="在书房加个置物柜，把网线放进去..."
                                disabled={isLoading || !!pendingActions}
                                className="flex-1 px-4 py-3 border-2 border-black dark:border-white bg-white dark:bg-black text-sm dark:text-gray-100 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all disabled:opacity-50 swiss-input"
                            />`;

const newInput = `<Input ref={inputRef} type="text" value={input}
                                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder="在书房加个置物柜，把网线放进去..."
                                disabled={isLoading || !!pendingActions}
                                className="flex-1"
                            />`;

if (content.includes(oldInput)) {
    content = content.replace(oldInput, newInput);
    console.log('✅ Input replaced');
} else {
    console.log('❌ Input NOT found - checking actual content...');
    const idx = content.indexOf('inputRef} type');
    if (idx > -1) {
        console.log('Around input:', content.slice(idx-50, idx+400));
    }
}

fs.writeFileSync(path, content, 'utf8');
