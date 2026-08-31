import React from 'react';
import { AlertTriangleIcon, DividerLine, FunnelFilledIcon } from './icons';

export type KpiIcon = 'alert' | 'funnel' | 'funnel-alert';

export interface Kpi {
  id: string;
  /** null/undefined = אין ערך להצגה, מוצג "--" */
  value?: number | null;
  label: string;
  icon: KpiIcon;
}

/** מוצג במקום הערך בזמן טעינה. גובה 60px כמו שורת המספר, כדי שלא תהיה קפיצה בפריסה. */
const TileSpinner: React.FC = () => (
  <span role="status" aria-label="טוען" className="flex h-[60px] items-center justify-center">
    <span
      aria-hidden
      className="size-7 animate-spin rounded-full border-2 border-[#151B5B]/20 border-t-[#151B5B]"
    />
  </span>
);

/**
 * אריח KPI בודד — Figma 227:9677 (התראה) / 227:9678 (רגיל).
 *
 * שני וריאנטים, ומצב ההתראה הוא שקובע ביניהם:
 *   התראה — רקע ורדרד, מסגרת #C8102E (feedback/red-base).
 *   רגיל  — רקע לבן, מסגרת #E2E8F0 (gray/gray-200).
 * בשני המקרים המסגרת היא 0.5px, כמו בעיצוב.
 *
 * מידות קבועות מהעיצוב — האריח לא נמתח:
 *   רוחב 240px · גובה 118px · ריפוד 16/16/24 · פינות 16px
 *
 * חלוקת הרוחב בשורת התוכן: גוש המספר לוקח בדיוק את מה שהוא צריך (shrink-0),
 * והתווית מקבלת את כל היתר (flex-1 + min-w-0). תווית ארוכה נחתכת בשתי שורות
 * עם "..." ולא חורגת מ-38px — גובה הקו המפריד.
 *
 * המבנה: שורת אייקונים בקצה השמאלי, ומתחתיה התווית מימין, קו מפריד, והמספר משמאל.
 */
const KpiTile: React.FC<{ kpi: Kpi; isLoading?: boolean }> = ({ kpi, isLoading = false }) => {
  const hasAlert = kpi.icon === 'alert' || kpi.icon === 'funnel-alert';
  const hasFunnel = kpi.icon === 'funnel' || kpi.icon === 'funnel-alert';

  return (
    <article
      className={`flex h-[118px] w-[240px] shrink-0 flex-col items-end overflow-clip rounded-2xl [border-width:0.5px] px-4 pt-4 pb-6 ${
        hasAlert
          ? 'border-[#C8102E] bg-[rgba(252,232,234,0.35)]'
          : 'border-[#E2E8F0] bg-white'
      }`}
    >
      {/* שורת האייקונים — justify-end דוחף אותה לקצה השמאלי ב-RTL.
          סדר ה-DOM הפוך לסדר התצוגה (הילד הראשון הוא הימני),
          ולכן המשולש נכתב ראשון והמשפך יוצא לשמאלו — כמו בעיצוב.
          mb-[-7px] מגיע מהעיצוב ומקרב את שורת התוכן כלפי מעלה. */}
      <div className="mb-[-7px] flex h-[21px] w-full items-center justify-end gap-1">
        {hasAlert && <AlertTriangleIcon />}
        {hasFunnel && <FunnelFilledIcon />}
      </div>

      {/* בעיצוב (משמאל לימין): תווית · קו מפריד · מספר.
          ב-RTL הילד הראשון הוא הימני, ולכן גוש המספר נכתב ראשון כדי לצאת מימין,
          והתווית אחריו יוצאת משמאל — וכך מתקבל אותו סדר תצוגה כמו בפיגמה. */}
      <div className="flex w-full items-center gap-[10px]">
        {/* גוש המספר — רוחב טבעי בלבד, shrink-0 כדי שלא יידחס ע"י התווית */}
        <div className="flex shrink-0 items-center justify-end gap-2">
          {isLoading ? (
            <TileSpinner />
          ) : (
            /* ?? ולא || — הערך 0 הוא ערך תקין ולא "אין ערך" */
            <p className="text-[40px] font-normal leading-[60px] whitespace-nowrap text-[#151B5B]">
              {kpi.value ?? '--'}
            </p>
          )}
          <DividerLine />
        </div>

        {/* התווית תופסת את כל הרוחב שנשאר.
            min-w-0 חיוני — בלעדיו פריט flex לא מתכווץ מתחת לרוחב התוכן שלו וגורם לגלישה.
            line-clamp-2 עם leading של 19px נותן בדיוק 38px — גובה הקו המפריד. */}
        <p className="min-w-0 flex-1 text-right text-base font-normal leading-[19px] text-[#151B5B] line-clamp-2 [word-break:break-word]">
          {kpi.label}
        </p>
      </div>
    </article>
  );
};

/** שורת ה-KPI — Figma 227:9676 (gap 16, ריפוד אנכי 8, אריחים במידה קבועה)
 *
 *  justify-start ב-RTL מתחיל מימין — האריח הראשון נצמד לקצה הימני,
 *  והגלישה יוצאת שמאלה ונחתכת ב-overflow-hidden, כמו בעיצוב. */
const KpiRow: React.FC<{ kpis: Kpi[]; isLoading?: boolean }> = ({ kpis, isLoading = false }) => (
  <div className="flex w-full items-center justify-start gap-4 overflow-hidden py-2">
    {kpis.map((kpi) => (
      <KpiTile key={kpi.id} kpi={kpi} isLoading={isLoading} />
    ))}
  </div>
);

export default KpiRow;
