import { useLayoutEffect, type RefObject } from 'react';

/**
 * Hides the children of `ref` that don't fit its width, in order, and reports their keys
 * (`data-key`). RTL: children start at the right edge, so the ones that overflow are on the left.
 * The box must take flex-basis 0 (its width never depends on its own content), so hiding
 * children can't change the width it's measured against and the ResizeObserver settles.
 */
export function useFitChildren(
  ref: RefObject<HTMLElement | null>,
  onHiddenChange: (keys: string[]) => void,
  deps: unknown[],
) {
  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;

    const measure = () => {
      const items = Array.from(box.children) as HTMLElement[];
      items.forEach(el => { el.hidden = false; });
      const bounds = box.getBoundingClientRect();
      // Once one item doesn't fit, everything after it is hidden too — keeps the order.
      let overflowed = false;
      const hidden: string[] = [];
      items.forEach(el => {
        const r = el.getBoundingClientRect();
        if (!overflowed && (r.left < bounds.left - 1 || r.right > bounds.right + 1)) overflowed = true;
        if (overflowed) hidden.push(el.dataset.key ?? '');
      });
      items.forEach(el => { el.hidden = hidden.includes(el.dataset.key ?? ''); });
      onHiddenChange(hidden);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, onHiddenChange, ...deps]);
}
