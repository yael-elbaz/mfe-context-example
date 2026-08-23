import { useEffect } from 'react';

/**
 * כל פריט אובייקט דיגיטלי מוצג בתוך iframe חיצוני שאיננו בשליטתנו.
 * בלחיצה על "התמקד" בתוך ה-iframe הוא מבצע fetch ואז שולח אלינו postMessage
 * עם ה-URL שצריך להיפתח. אנחנו רק מאזינים ומעבירים את ה-URL הלאה (onFocus),
 * שממשיך אל רכיב ה-Detail דרך ה-shell — בלי לגעת בקוד ה-iframe.
 *
 * ⚠️ התאם את התנאי (data.type) ואת שמות השדות לצורת ההודעה האמיתית שה-iframe שולח.
 */
export function useIframeFocusEvent(onFocus?: (id: string, url: string) => void) {
  useEffect(() => {
    if (!onFocus) return;

    const handler = (e: MessageEvent) => {
      const data = e.data as { type?: string; id?: string; url?: string } | null;
      if (!data || data.type !== 'digital-object:focus' || !data.url) return;
      // אופציונלי לוודא מקור: if (e.origin !== 'https://trusted-host') return;
      onFocus(String(data.id ?? ''), data.url);
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onFocus]);
}
