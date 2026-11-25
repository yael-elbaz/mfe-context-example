import React, { useRef } from 'react';
import { Field } from './DataChips';
import { useFitChildren } from '../hooks/useFitChildren';

interface Props {
  entries: [string, string][];
  /** Labels that didn't fit the width — the caller shows them behind "+N". */
  onHiddenChange: (labels: string[]) => void;
}

// Fills the remaining width of the data row with as many fields as fit, in order.
const FitFields: React.FC<Props> = ({ entries, onHiddenChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  useFitChildren(ref, onHiddenChange, [entries]);

  return (
    <div ref={ref} className="flex min-w-0 flex-1 basis-0 items-center gap-9 overflow-hidden">
      {entries.map(([label, value]) => (
        <div key={label} data-key={label} className="shrink-0">
          <Field label={label} value={value} />
        </div>
      ))}
    </div>
  );
};

export default FitFields;
