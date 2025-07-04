  import React from 'react';
  import './ConfirmModal.scss';

  interface ErrorModalProps {
    title: string;
    message: string;
    onClose: () => void;
  }

  const ErrorModal: React.FC<ErrorModalProps> = ({ title, message, onClose }) => {
    return (
      <div className="modal-confirmation">
        <div className="modal-confirmation-content">
          <button className="close-x-button" onClick={onClose}>×</button>
          <div className="error-icon" style={{ marginBottom: '1rem' }}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#e74c3c">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h2 className="modal-title">{title}</h2>
          <p className="modal-message">{message}</p>
          <div className="modal-buttons">
            <button onClick={onClose} className="secondary-modal-button">
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default ErrorModal;