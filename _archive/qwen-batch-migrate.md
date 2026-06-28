## 目标
修改 D:\home-storage\src\pages\BatchManage.tsx，将 swiss-btn 替换为 Button 组件。

## ⚠️ 严格限制
只修改 BatchManage.tsx 这一个文件。绝对不要修改任何其他文件。

## Import 修改
在文件顶部 import 区域添加：
```
import { Button } from '../components/ui';
```

## 替换
原代码（第 447 行附近）：
```tsx
                            <button onClick={applyBatchEdit} className="swiss-btn bg-black dark:bg-white text-white dark:text-black hover:bg-swiss-red hover:border-swiss-red border-2 border-black dark:border-white px-4 py-2 text-sm font-bold uppercase transition-all">
                                确认应用
                            </button>
```

新代码：
```tsx
                            <Button onClick={applyBatchEdit} variant="primary" size="sm">
                                确认应用
                            </Button>
```

## 注意事项
- 只改这一个 button
- 不要修改其他 button（如第 444 行的"取消"按钮）
- 保持所有其他逻辑不变
