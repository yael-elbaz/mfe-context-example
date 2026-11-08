import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { OverlayService } from '../types/openService';

export interface ServiceOverlayProps {
  /** null — אין אוברליי פתוח */
  service: OverlayService | null;
  /** מוצגת ההודעה "יש לסגור קודם את השירות הפתוח" */
  blockedNotice: boolean;
  onDismissNotice: () => void;
  onClose: () => void;
}

const NOTICE_MS = 4000;

/**
 * מצב האוברליי — useState רגיל, באותו דפוס כמו useEmployeePickerPopup.
 * נקרא פעם אחת ב-RouterApp: showOverlay עובר ל-useOpenService, overlayProps ל-<ServiceOverlay/>.
 */
export function useServiceOverlay() {
  const [service, setService] = useState<OverlayService | null>(null);
  const [blockedNotice, setBlockedNotice] = useState(false);
  const noticeTimer = useRef<number>();
  // ref כדי ש-showOverlay יראה את הערך העדכני גם אם נקרא מ-closure ישן
  const openRef = useRef(false);
  openRef.current = service !== null;

  const onDismissNotice = useCallback(() => {
    window.clearTimeout(noticeTimer.current);
    setBlockedNotice(false);
  }, []);

  const showOverlay = useCallback((s: OverlayService) => {
    if (openRef.current) {
      // רק אוברליי אחד בכל פעם — לא מחליפים, מציגים הודעה בתוך החלון הפתוח
      window.clearTimeout(noticeTimer.current);
      setBlockedNotice(true);
      noticeTimer.current = window.setTimeout(() => setBlockedNotice(false), NOTICE_MS);
      return;
    }
    openRef.current = true;
    setService(s);
  }, []);

  const onClose = useCallback(() => {
    window.clearTimeout(noticeTimer.current);
    openRef.current = false;
    setBlockedNotice(false);
    setService(null);
  }, []);

  // שינוי route בזמן שהאוברליי פתוח (Back בדפדפן, או ניווט מתוך השירות) — סוגר אותו.
  // הניווט ל-preview שקורה לפני הפתיחה כבר הסתיים כשהשירות נכנס ל-state, ולכן לא נתפס כאן.
  const location = useLocation();
  const openedAt = useRef<string | null>(null);
  useEffect(() => {
    const key = location.pathname + location.search;
    if (!service) { openedAt.current = null; return; }
    if (openedAt.current === null) { openedAt.current = key; return; }
    if (openedAt.current !== key) onClose();
  }, [service, location.pathname, location.search, onClose]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const overlayProps: ServiceOverlayProps = { service, blockedNotice, onDismissNotice, onClose };
  return { showOverlay, overlayProps };
}
