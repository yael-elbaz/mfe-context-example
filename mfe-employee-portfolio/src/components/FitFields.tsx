import React, { useLayoutEffect, useRef } from 'react';
import { Field } from './DataChips';

interface Props {
  entries: [string, string][];
  /** Labels that didn't fit the width — the caller shows them behind "+N". */
  onHiddenChange: (labels: string[]) => void;
}

// Fills the remaining width of the data row with as many fields as fit, in order.
// The box takes flex-basis 0, so its width never depends on its own content: hiding
// fields can't change the width it's measured against, and the ResizeObserver settles.
const FitFields: React.FC<Props> = ({ entries, onHiddenChange }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;

    const measure = () => {
      const items = Array.from(box.children) as HTMLElement[];
      items.forEach(el => { el.hidden = false; });
      const bounds = box.getBoundingClientRect();
      const hidden = items
        .filter(el => {
          const r = el.getBoundingClientRect();
          return r.left < bounds.left - 1 || r.right > bounds.right + 1;
        })
        .map(el => el.dataset.label ?? '');
      items.forEach(el => { el.hidden = hidden.includes(el.dataset.label ?? ''); });
      onHiddenChange(hidden);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [entries, onHiddenChange]);

  return (
    <div ref={ref} className="flex min-w-0 flex-1 basis-0 items-center gap-5 overflow-hidden">
      {entries.map(([label, value]) => (
        <div key={label} data-label={label} className="shrink-0">
          <Field label={label} value={value} muted />
        </div>
      ))}
    </div>
  );
};

export default FitFields;
