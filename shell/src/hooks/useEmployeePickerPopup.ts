import { useCallback, useRef, useState } from 'react';

export interface EmployeePickerPopupProps {
  open: boolean;
  onSelected: (idntEmployee: string) => void;
  onClose: () => void;
}

export interface UseEmployeePickerPopupReturn {
  waitForEmployee: () => Promise<string | null>;
  pickerProps: EmployeePickerPopupProps;
}

export function useEmployeePickerPopup(): UseEmployeePickerPopupReturn {
  const [open, setOpen] = useState(false);
  const pendingResolve = useRef<((id: string | null) => void) | null>(null);

  const waitForEmployee = useCallback((): Promise<string | null> => {
    if (pendingResolve.current) {
      return new Promise((resolve) => { pendingResolve.current = resolve; });
    }
    setOpen(true);
    return new Promise((resolve) => { pendingResolve.current = resolve; });
  }, []);

  const onSelected = useCallback((idntEmployee: string) => {
    pendingResolve.current?.(idntEmployee);
    pendingResolve.current = null;
    setOpen(false);
  }, []);

  const onClose = useCallback(() => {
    pendingResolve.current?.(null);
    pendingResolve.current = null;
    setOpen(false);
  }, []);

  return {
    waitForEmployee,
    pickerProps: { open, onSelected, onClose },
  };
}
