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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="relative w-[400px] max-w-[90%] rounded-2xl bg-white p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <button className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[24px] text-[#666] transition-colors duration-200 hover:bg-[#f5f5f5] hover:text-[#333]" onClick={onCancel}>×</button>
        <h2 className="mb-4 text-[1.5rem] font-semibold text-[#1f2937]">{title}</h2>
        <p className="mb-8 text-[1rem] leading-normal text-[#6b7280]">{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onConfirm} className="min-w-[100px] cursor-pointer rounded-lg border-0 bg-[#6B3AFF] px-6 py-3 text-[0.95rem] font-semibold text-white transition-colors duration-200 hover:bg-[#5A2EE6]">
            {primaryButtonText}
          </button>
          <button onClick={onCancel} className="min-w-[100px] cursor-pointer rounded-lg border-0 bg-transparent px-6 py-3 text-[0.95rem] font-medium text-[#6b7280] transition-colors duration-200 hover:bg-[#f9fafb] hover:text-[#374151]">
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;