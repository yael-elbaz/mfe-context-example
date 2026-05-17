import React, { useEffect, useState } from 'react';
import type { DigitalService } from '../types/openService';
import { registerSelectEmployeeGate, resolveEmployeeSelect } from '../services/selectEmployeeSignal';
import { SelectEmployeePopup } from './SelectEmployeePopup';

const SelectEmployeeGate: React.FC = () => {
  const [pending, setPending] = useState<DigitalService | null>(null);

  useEffect(() => {
    registerSelectEmployeeGate(setPending);
  }, []);

  if (!pending) return null;

  return (
    <SelectEmployeePopup
      onSelected={(id) => { setPending(null); resolveEmployeeSelect(id); }}
      onClose={() => { setPending(null); resolveEmployeeSelect(null); }}
    />
  );
};

export default SelectEmployeeGate;
