import { MtModal } from './MtModal';
import { MtButton } from './MtButton';

export interface MtConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function MtConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: MtConfirmDialogProps) {
  return (
    <MtModal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="mt-modal-body">
        <p style={{ margin: 0 }}>{message}</p>
      </div>
      <div className="mt-modal-footer">
        <MtButton variant="default" onClick={onCancel}>
          {cancelText}
        </MtButton>
        <MtButton variant={confirmVariant} onClick={onConfirm}>
          {confirmText}
        </MtButton>
      </div>
    </MtModal>
  );
}
