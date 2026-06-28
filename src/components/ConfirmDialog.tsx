import { AlertTriangle } from 'lucide-react';
import { Modal, Button } from './ui';

export type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  confirmStyle?: 'danger' | 'normal';
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确认删除',
  confirmStyle = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm" title={title}>
      <div className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 border-2 border-swiss-red flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-swiss-red" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            取消
          </Button>
          <Button variant={confirmStyle === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
