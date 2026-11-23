import { useCallback, useRef, useState } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * דיאלוג אישור מבוסס Promise — `if (!(await confirm({...}))) return;`
 * באותו דפוס של useEmployeePickerPopup.
 */
export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const pendingResolve = useRef<((ok: boolean) => void) | null>(null);

  const settle = useCallback((ok: boolean) => {
    pendingResolve.current?.(ok);
    pendingResolve.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    pendingResolve.current?.(false); // בקשה קודמת שלא נענתה — נחשבת כביטול
    setOptions(opts);
    return new Promise((resolve) => { pendingResolve.current = resolve; });
  }, []);

  const onConfirm = useCallback(() => settle(true), [settle]);
  const onCancel = useCallback(() => settle(false), [settle]);

  const dialogProps: ConfirmDialogProps = {
    open: options !== null,
    title: options?.title ?? '',
    message: options?.message ?? '',
    confirmLabel: options?.confirmLabel,
    cancelLabel: options?.cancelLabel,
    onConfirm,
    onCancel,
  };

  return { confirm, dialogProps };
}
