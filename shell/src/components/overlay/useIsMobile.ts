import { useEffect, useState } from 'react';

// מתחת ל-md של Tailwind (768px)
const QUERY = '(max-width: 767px)';

/** האם המסך צר (מובייל). מתעדכן כשמשנים גודל חלון / מסובבים מכשיר. */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
