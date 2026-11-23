import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PersonType } from '../types/openService';
import { useConfirmDialog } from './useConfirmDialog';

/** סוגי האנשים שיש להם תיק, והפרמטר ב-URL שמזהה אותם */
const PORTFOLIOS: Partial<Record<PersonType, { path: string; param: string }>> = {
  employee: { path: '/employee-portfolio', param: 'employeeId' },
  customer: { path: '/customer-portfolio', param: 'customerId' },
};
/** מי מופיע בחיפוש של "החלפה" */
export const SWITCHABLE: PersonType[] = ['employee', 'customer'];

/** שירות פתוח — כדף מלא או כאוברליי מעל digital-objects (לא רשימת השירותים /sherutim) */
const SERVICE_OPEN = /\/sherutim\/[^/]+/;

/**
 * החלפת האדם בתוך התיק — מקבל את האדם שנבחר (ב-PersonSwitchButton) ומבצע את המעבר.
 * מקור האמת הוא ה-URL: משנים רק את הפרמטר (employeeId / customerId), וה-Layout טוען ומעדכן את personStore.
 * - אותו סוג — ה-pathname נשמר (שירות / מקטע / אוברליי נשארים פתוחים ומתעדכנים לאדם החדש).
 * - סוג אחר — מעבר לראש התיק של הסוג השני.
 * - שירות פתוח — אישור לפני ההחלפה (המעטפת לא יודעת אם יש בו שינויים שלא נשמרו).
 * - push — "אחורה" בדפדפן מחזיר לאדם הקודם.
 */
export function usePersonSwitch(currentType: PersonType, currentId: string) {
  const { confirm, dialogProps } = useConfirmDialog();
  const navigate = useNavigate();

  // ה-location העדכני אחרי ה-await (לא זה שנלכד כשהפונקציה נוצרה)
  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

  const switchTo = useCallback(async (idnt: string, personType: PersonType) => {
    const target = PORTFOLIOS[personType];
    if (!target) return;
    const sameType = personType === currentType;
    if (sameType && idnt === currentId) return;

    if (SERVICE_OPEN.test(locationRef.current.pathname)) {
      const ok = await confirm({
        title: 'יש שירות פתוח',
        message: sameType
          ? 'השירות ייטען מחדש עבור האדם שנבחר. שינויים שלא נשמרו יאבדו. להחליף?'
          : 'השירות ייסגר והתיק יוחלף. שינויים שלא נשמרו יאבדו. להחליף?',
        confirmLabel: 'החלפה',
      });
      if (!ok) return;
    }

    const { pathname, search, state } = locationRef.current;
    if (sameType) {
      const params = new URLSearchParams(search);
      params.set(target.param, idnt); // פרמטר רגיל גובר על זה שבתוך q (Helper.getParam)
      // state נשמר — בו נמצא ה-mfeConfig של שירות פתוח
      navigate({ pathname, search: params.toString() }, { state });
    } else {
      navigate(`${target.path}?${target.param}=${encodeURIComponent(idnt)}`);
    }
  }, [confirm, navigate, currentType, currentId]);

  return { switchTo, confirmDialogProps: dialogProps };
}
