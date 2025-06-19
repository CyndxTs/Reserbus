import './ConfirmModal.css';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ message, onConfirm, onCancel }: ConfirmModalProps) => {
  return (
    <div className="modal-overlay-bus">
      <div className="modal-content-bus">
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onConfirm} className="submit-button-bus">Sí</button>
          <button onClick={onCancel} className="close-bus-modal">x</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;