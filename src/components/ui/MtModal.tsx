import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { MtButton } from './MtButton';

export interface MtModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export function MtModal({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: MtModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="mt-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'mt-modal-title' : undefined}
    >
      <div className="mt-modal-container">
        {title && (
          <div className="mt-modal-header">
            <h3 id="mt-modal-title" style={{ margin: 0 }}>
              {title}
            </h3>
            <MtButton
              variant="text"
              size="small"
              onClick={onClose}
              aria-label="Fechar"
              style={{ padding: '4px' }}
            >
              <X size={18} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </MtButton>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
