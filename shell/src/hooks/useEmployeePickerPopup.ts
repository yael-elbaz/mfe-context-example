import { useCallback, useRef, useState } from 'react';
import type { PersonType } from '../types/openService';

export interface SelectedPerson {
  idnt: string;
  personType: PersonType;
}

export interface EmployeePickerPopupProps {
  open: boolean;
  objectType?: PersonType[] | null;
  onSelected: (idnt: string, personType: PersonType) => void;
  onClose: () => void;
}

export interface UseEmployeePickerPopupReturn {
  waitForEmployee: (objectType?: PersonType[] | null) => Promise<SelectedPerson | null>;
  pickerProps: EmployeePickerPopupProps;
}

export function useEmployeePickerPopup(): UseEmployeePickerPopupReturn {
  const [open, setOpen] = useState(false);
  const [objectType, setObjectType] = useState<PersonType[] | null | undefined>(undefined);
  const pendingResolve = useRef<((result: SelectedPerson | null) => void) | null>(null);

  const waitForEmployee = useCallback((objectType?: PersonType[] | null): Promise<SelectedPerson | null> => {
    setObjectType(objectType);
    if (pendingResolve.current) {
      return new Promise((resolve) => { pendingResolve.current = resolve; });
    }
    setOpen(true);
    return new Promise((resolve) => { pendingResolve.current = resolve; });
  }, []);

  const onSelected = useCallback((idnt: string, personType: PersonType) => {
    pendingResolve.current?.({ idnt, personType });
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
    pickerProps: { open, objectType, onSelected, onClose },
  };
}
