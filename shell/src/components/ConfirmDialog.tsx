import React, { useEffect } from 'react';
import type { ConfirmDialogProps } from '../hooks/useConfirmDialog';
import iconClose from '../assets/icons/icon-close.svg';

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div onClick={onCancel} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45">
      <div
        dir="rtl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
        className="flex w-[440px] max-w-[90vw] flex-col gap-6 rounded-lg bg-white px-4 py-6 shadow-[0px_2px_6px_0px_#00000026]"
      >
        <button type="button" onClick={onCancel} aria-label="סגור" className="size-5 shrink-0 cursor-pointer self-end">
          <img src={iconClose} alt="" className="size-full" />
        </button>

        <div className="flex flex-col gap-3 text-center">
          <p id="confirm-dialog-title" className="text-xl font-bold leading-tight text-navy">{title}</p>
          <p id="confirm-dialog-message" className="text-base leading-tight text-navy/80">{message}</p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-blue-action px-6 text-base font-semibold whitespace-nowrap text-white"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-12 cursor-pointer items-center justify-center rounded-lg border border-blue-outline bg-white px-6 text-base font-semibold whitespace-nowrap text-navy"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
