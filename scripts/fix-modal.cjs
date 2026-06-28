const fs = require('fs');
const path = 'D:/home-storage/src/components/ui/';

const modal = `import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string | ReactNode;
    children: ReactNode;
    size?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'max-w-lg' }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className={\`bg-white dark:bg-slate-900 rounded-2xl p-6 w-full mx-4 shadow-xl \${size}\`} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
}
`;

fs.writeFileSync(path + 'Modal.tsx', modal);
console.log('✅ Modal updated');
