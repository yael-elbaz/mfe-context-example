import React from 'react';
import { AlertTriangleIcon, FunnelFilledIcon } from './icons';

export type KpiIcon = 'alert' | 'funnel' | 'funnel-alert';

export interface Kpi {
  id: string;
  value: number;
  label: string;
  icon: KpiIcon;
}

/**
 * אריח KPI בודד — Figma 227:9677 (התראה) / 227:9678 (רגיל).
 *
 * שני וריאנטים, ומצב ההתראה הוא שקובע ביניהם:
 *   התראה — מסגרת 0.5px אדומה (feedback/red-base) על רקע ורדרד.
 *   רגיל  — מסגרת 1px תכולה (feedback/blue-border) על לבן.
 *
 * המבנה: שורת אייקונים בקצה השמאלי, ומתחתיה התווית מימין, קו מפריד, והמספר משמאל.
 */
const KpiTile: React.FC<{ kpi: Kpi }> = ({ kpi }) => {
  const hasAlert = kpi.icon === 'alert' || kpi.icon === 'funnel-alert';
  const hasFunnel = kpi.icon === 'funnel' || kpi.icon === 'funnel-alert';

  return (
    <article
      className={`flex min-w-0 flex-1 flex-col items-end rounded-2xl px-4 pt-4 pb-6 ${
        hasAlert
          ? 'border-[0.5px] border-[#C8102E] bg-[rgba(252,232,234,0.35)]'
          : 'border border-[#9DC3E8] bg-white'
      }`}
    >
      {/* שורת האייקונים — justify-end דוחף אותה לקצה השמאלי ב-RTL.
          סדר ה-DOM הפוך לסדר התצוגה (הילד הראשון הוא הימני),
          ולכן המשולש נכתב ראשון והמשפך יוצא לשמאלו — כמו בעיצוב. */}
      <div className="flex w-full items-center justify-end gap-1">
        {hasAlert && <AlertTriangleIcon />}
        {hasFunnel && <FunnelFilledIcon />}
      </div>

      {/* מספר מימין · קו מפריד · תווית משמאל.
          ב-RTL הילד הראשון הוא הימני, ולכן גוש המספר נכתב לפני התווית. */}
      <div className="flex w-full items-center gap-1.5">
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-4xl font-normal leading-15 text-[#151B5B]">{kpi.value}</p>
          <span aria-hidden className="h-[38px] w-px shrink-0 bg-[#A0AEC0]" />
        </div>
        <p className="min-w-0 flex-1 text-right text-base font-normal leading-normal text-[#151B5B]">
          {kpi.label}
        </p>
      </div>
    </article>
  );
};

/** שורת ה-KPI — Figma 227:9676 (gap 16, כל אריח flex-1 ובגובה אחיד) */
const KpiRow: React.FC<{ kpis: Kpi[] }> = ({ kpis }) => (
  <div className="flex w-full items-stretch justify-end gap-4 overflow-hidden">
    {kpis.map((kpi) => (
      <KpiTile key={kpi.id} kpi={kpi} />
    ))}
  </div>
);

export default KpiRow;
