import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  anchor: HTMLElement;
  onClose: () => void;
  children: React.ReactNode;
}

const GAP = 6;
const EDGE = 8;

// A single floating panel, mounted only while open (the caller renders it conditionally),
// so closed popovers cost no DOM. Portaled to <body> so the sticky header's overflow
// can't clip it. Closes on outside click, Escape, scroll and resize.
const Popover: React.FC<Props> = ({ anchor, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // RTL: align the popover's right edge with the anchor's, clamped to the viewport.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = anchor.getBoundingClientRect();
    const width = el.offsetWidth;
    const left = Math.max(EDGE, Math.min(r.right - width, window.innerWidth - width - EDGE));
    setPos({ top: r.bottom + GAP, left });
  }, [anchor]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !anchor.contains(target)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      dir="rtl"
      className="fixed z-50 min-w-[220px] max-w-[min(420px,calc(100vw-16px))] rounded-[10px] border border-[#E8EAF0] bg-white px-3.5 py-3 shadow-[0_8px_28px_rgba(0,3,61,0.18)]"
      style={{
        fontFamily: 'Rubik, Arial, sans-serif',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

export default Popover;
