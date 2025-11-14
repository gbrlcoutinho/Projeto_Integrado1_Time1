import './ConfirmationModal.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "CONFIRMAR", cancelText = "CANCELAR" }) {
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal-container" onClick={handleModalContentClick}>

        <div className="confirmation-modal-header">
          <h2>{title}</h2>
          <button className="confirmation-modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="confirmation-modal-content">
          <p>{message}</p>
        </div>

        <div className="confirmation-modal-footer">
          <button
            type="button"
            className="confirmation-modal-cancel-btn"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="confirmation-modal-confirm-btn"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;