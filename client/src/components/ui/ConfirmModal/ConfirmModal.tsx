import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
  peligro?: boolean;
}

const ConfirmModal = ({ title, message, primaryButtonText, secondaryButtonText, onConfirm, onCancel, peligro }: ConfirmModalProps) => {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-tinta/50 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="relative w-[420px] max-w-full animate-modal-in rounded-3xl bg-white p-8 text-left shadow-[0_30px_80px_-20px_rgba(27,22,71,0.5)]">
        <button aria-label="Cerrar" className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-tinta-suave transition hover:bg-brand-soft" onClick={onCancel}>
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-3 pr-8 font-display text-[1.25rem] font-bold text-tinta">{title}</h2>
        <p className="mb-8 text-[1rem] leading-relaxed text-tinta-suave">{message}</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button onClick={onCancel} className="cursor-pointer rounded-xl border-0 bg-transparent px-5 py-3 text-[0.95rem] font-semibold text-tinta-suave transition hover:bg-brand-soft">
            {secondaryButtonText}
          </button>
          <button onClick={onConfirm}
            className={`cursor-pointer rounded-xl border-0 px-6 py-3 text-[0.95rem] font-semibold transition ${peligro ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-senal text-tinta shadow-senal hover:bg-[#ff6e3a]'}`}>
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
