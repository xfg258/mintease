import "./ui/ui.css";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SafetyModal({
  title,
  message,
  confirmLabel = "确认",
  cancelLabel = "取消",
  danger,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="me-modal-backdrop" role="alertdialog" aria-modal="true">
      <div className="me-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="me-modal-actions">
          <button type="button" className="me-btn me-btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`me-btn${danger ? " me-btn--danger" : " me-btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
