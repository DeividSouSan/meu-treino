import { MtModal } from './MtModal';
import { MtButton } from './MtButton';

export interface MtAlertDialogProps {
  /**
   * Controla a visibilidade do diálogo de alerta.
   */
  isOpen: boolean;
  /**
   * Título principal exibido no cabeçalho do diálogo.
   */
  title: string;
  /**
   * Mensagem ou conteúdo descritivo do alerta.
   */
  message: string;
  /**
   * Rótulo do botão de confirmação/fechamento (Padrão: "Entendido").
   */
  buttonText?: string;
  /**
   * Variante visual do botão de ação.
   */
  variant?: 'primary' | 'danger' | 'default';
  /**
   * Callback executado ao fechar o diálogo ou clicar no botão de ação.
   */
  onClose: () => void;
}

/**
 * MtAlertDialog é um diálogo modal informativo estilizado com um único botão de ação.
 * Utilizado para substituir chamadas nativas do navegador como `alert()`.
 */
export function MtAlertDialog({
  isOpen,
  title,
  message,
  buttonText = 'Entendido',
  variant = 'primary',
  onClose,
}: MtAlertDialogProps) {
  return (
    <MtModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mt-modal-body">
        <p style={{ margin: 0, lineHeight: 1.5 }}>{message}</p>
      </div>
      <div className="mt-modal-footer">
        <MtButton variant={variant} onClick={onClose} autoFocus>
          {buttonText}
        </MtButton>
      </div>
    </MtModal>
  );
}
