## 目标
修改 D:\home-storage\src\components\FamilyModal.tsx，将 swiss-btn 和 swiss-input 替换为 React 组件。
保持所有逻辑不变。

## ⚠️ 严格限制
只修改 FamilyModal.tsx 这一个文件。绝对不要修改任何其他文件，特别是不要修改 src/components/ui/ 目录下的任何文件。

## Import 修改
在文件顶部 import 区域，在 `import { useToast } from './Toast';` 之后添加：
```
import { Button, Input } from './ui';
```

## 替换 1: swiss-input → Input (修改第 146-152 行)

原代码：
```tsx
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="输入邀请码 (如: HF-1A2B3D)"
                                value={joinCodeInput}
                                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                                className="flex-1 px-4 py-3 bg-transparent border-2 border-black dark:border-white swiss-input outline-none font-mono dark:text-gray-100"
                            />
```

新代码：
```tsx
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="输入邀请码 (如: HF-1A2B3D)"
                                value={joinCodeInput}
                                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                                className="flex-1 font-mono"
                            />
```

## 替换 2: swiss-btn → Button (修改第 153-160 行)

原代码：
```tsx
                            <button
                                onClick={handleJoin}
                                disabled={isLoading || !joinCodeInput.trim()}
                                className="swiss-btn disabled:opacity-50 flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                加入
                            </button>
```

新代码：
```tsx
                            <Button
                                onClick={handleJoin}
                                disabled={isLoading || !joinCodeInput.trim()}
                                variant="primary"
                            >
                                <UserPlus className="w-4 h-4" />
                                加入
                            </Button>
```

## 注意事项
- 保持 ALL 其他逻辑不变
- 不要修改任何其他 JSX 元素
- 不要修改任何其他文件
- Button 组件已经有 gap-2，所以不需要添加
