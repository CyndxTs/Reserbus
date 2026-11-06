import './ConfirmModal.scss';

interface ConfirmModalProps {
  title: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ 
  title, 
  message, 
  primaryButtonText, 
  secondaryButtonText, 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) => {
  return (
    <div className="modal-confirmation">
      <div className="modal-confirmation-content">
        <button className="close-x-button" onClick={onCancel}>×</button>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="primary-modal-button">
            {primaryButtonText}
          </button>
          <button onClick={onCancel} className="secondary-modal-button">
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;