import fs from 'fs';
const path = 'D:/home-storage/src/components/AIChat.tsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Replace lines 556-558 (0-indexed: 555-557) - Confirm button
lines[555] = '                                            <Button onClick={handleConfirm}';
lines[556] = '                                                variant="primary" size="sm" className="flex-1"';
lines[557] = '                                            >✅ 确认执行</Button>';

// Replace lines 560-561 (0-indexed: 559-560) - Cancel button  
lines[559] = '                                            <Button onClick={handleCancel}';
lines[560] = '                                                variant="secondary" size="sm" className="flex-1"';
lines[561] = '                                            >❌ 取消</Button>';

// Replace lines 588-593 (0-indexed: 587-592) - Input
lines[587] = '                            <Input ref={inputRef} type="text" value={input}';
lines[588] = '                                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}';
lines[589] = '                                placeholder="在书房加个置物柜，把网线放进去..."';
lines[590] = '                                disabled={isLoading || !!pendingActions}';
lines[591] = '                                className="flex-1"';
lines[592] = '                            />';

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('✅ Replaced buttons and input by line numbers');
