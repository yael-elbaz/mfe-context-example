import { useCallback, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from 'react';

interface Offset { x: number; y: number }

interface DragState {
  pointerX: number;
  pointerY: number;
  start: Offset;
  min: Offset;
  max: Offset;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/**
 * גרירת חלון fixed לפי ידית (שורת הכותרת). ההזזה היא translate בלבד — בלי עבודת layout ובלי ספרייה.
 * החלון לא יוצא מהמסך לרוחב, והידית לא יוצאת מהמסך לגובה (תמיד אפשר לתפוס אותה שוב).
 * לחיצה על כפתור בתוך הידית לא מתחילה גרירה. המיקום מתאפס כשהקומפוננטה יורדת.
 */
export function useDraggable(targetRef: RefObject<HTMLElement>) {
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const drag = useRef<DragState | null>(null);

  /** גבולות ההזזה לפי המיקום הנוכחי של החלון והידית */
  const bounds = useCallback((current: Offset, handleHeight: number) => {
    const r = targetRef.current!.getBoundingClientRect();
    return {
      min: { x: current.x - r.left, y: current.y - r.top },
      max: { x: current.x + (window.innerWidth - r.right), y: current.y + (window.innerHeight - r.top - handleHeight) },
    };
  }, [targetRef]);

  const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button') || !targetRef.current) return;
    const { min, max } = bounds(offset, e.currentTarget.getBoundingClientRect().height);
    drag.current = { pointerX: e.clientX, pointerY: e.clientY, start: offset, min, max };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [bounds, offset, targetRef]);

  const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    setOffset({
      x: clamp(d.start.x + e.clientX - d.pointerX, d.min.x, d.max.x),
      y: clamp(d.start.y + e.clientY - d.pointerY, d.min.y, d.max.y),
    });
  }, []);

  const onPointerUp = useCallback(() => { drag.current = null; }, []);

  /** מחזיר את החלון לתוך המסך — אחרי שינוי גודל (החלון גדל למעלה ולימין ועלול לצאת) */
  const clampIntoView = useCallback((handleHeight: number) => {
    if (!targetRef.current) return;
    setOffset((current) => {
      const { min, max } = bounds(current, handleHeight);
      const next = { x: clamp(current.x, min.x, max.x), y: clamp(current.y, min.y, max.y) };
      return next.x === current.x && next.y === current.y ? current : next;
    });
  }, [bounds, targetRef]);

  // ערך דינמי — עובר כמשתני CSS, וה-translate עצמו מוגדר ב-Tailwind
  const style = { '--drag-x': `${offset.x}px`, '--drag-y': `${offset.y}px` } as CSSProperties;

  return {
    style,
    clampIntoView,
    handleProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
}
