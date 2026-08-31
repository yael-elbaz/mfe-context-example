import React from 'react';
import { DiagonalArrowTile, UnitIcon, CalendarIcon, ClockIcon } from './icons';

/**
 * סקשן "דיווחים" — Placeholder ל-MFE שטרם פותח.
 * הנתונים כאן קשיחים (hard-coded) ומטרתם להציג את העיצוב בלבד;
 * כשה-MFE ייכתב, הרכיב הזה יוחלף ב-remote דרך Module Federation.
 */

type ReportStatus = 'managed';

interface ReportItem {
  id: string;
  category: string;   // ביקורות / אירועים / הודעות
  title: string;      // "1234567 | ביקורת"
  subtitle: string;   // "מ ביסר / סגן"
  extra?: string;     // "יחידה"
  unit: string;       // "אילון"
  date: string;       // "14.06.2026"
  time: string;       // "17:30"
  status?: ReportStatus;
}

const REPORTS: ReportItem[] = [
  { id: 'r1', category: 'ביקורות', title: '1234567 | ביקורת',       subtitle: 'מ ביסר / סגן', extra: 'יחידה', unit: 'אילון', date: '14.06.2026', time: '17:30', status: 'managed' },
  { id: 'r2', category: 'אירועים', title: '1234567 | תנועת רכבים', subtitle: 'כניסת רכב',                     unit: 'אילון', date: '14.06.2026', time: '17:30', status: 'managed' },
  { id: 'r3', category: 'הודעות',  title: 'הסלמה',                  subtitle: 'מסגרת שינוי', extra: 'נפתח בתאריך: 1.05.2026', unit: '', date: '14.06.2026', time: '17:30' },
  { id: 'r4', category: 'ביקורות', title: '1234567 | ביקורת',       subtitle: 'מ ביסר / סגן', extra: 'יחידה', unit: 'אילון', date: '14.06.2026', time: '17:30', status: 'managed' },
];

/* status event — הווריאנט התכלת של תגית הסטטוס */
const StatusTag: React.FC<{ label: string }> = ({ label }) => (
  <span className="flex items-center overflow-hidden rounded-[999px] border border-[#C6DAF6] bg-[#EFF4FF] px-[10px] py-0.5 text-[12px] font-normal leading-4 tracking-[0.4px] whitespace-nowrap text-[#2864C8]">
    {label}
  </span>
);

/* Reporting component — Figma 17:11890 */
const ReportRow: React.FC<{ item: ReportItem }> = ({ item }) => (
  <article className="flex flex-col items-end justify-center rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 drop-shadow-[0_1px_1.5px_rgba(6,77,173,0.08)]">
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full flex-col items-end">
        <div className="flex w-full items-start justify-between">
          <span className="text-[12px] font-medium leading-4 tracking-[0.1px] text-[#4A5568]">
            {item.category}
          </span>
          {item.status && <StatusTag label="מתנהל" />}
        </div>

        <div className="flex w-full items-center justify-center">
          <p className="min-w-0 flex-1 text-right text-[16px] font-medium leading-6 text-[#00033D]">
            {item.title}
          </p>
        </div>

        <p className="w-full text-right text-[12px] font-medium leading-4 tracking-[0.1px] text-[#4A5568]">
          {item.subtitle}
        </p>
      </div>

      {item.extra && (
        <p className="w-full text-right text-[12px] font-medium leading-4 tracking-[0.1px] text-[#4A5568]">
          {item.extra}
        </p>
      )}
    </div>

    {/* Footer — פריסת LTR לפי העיצוב: יחידה, תאריך, שעה (טקסט ואז אייקון) */}
    <div dir="ltr" className="flex w-full items-center gap-[14px] overflow-hidden pt-1">
      {item.unit && (
        <div className="flex items-center gap-[3px]">
          <p className="text-[10px] leading-normal whitespace-nowrap text-[#00033D]">{item.unit}</p>
          <UnitIcon />
        </div>
      )}
      <div className="flex items-center gap-[3px]">
        <p className="text-[10px] leading-normal whitespace-nowrap text-[#00033D]">{item.date}</p>
        <CalendarIcon />
      </div>
      <div className="flex items-center gap-[3px]">
        <p className="text-[10px] leading-normal whitespace-nowrap text-[#00033D]">{item.time}</p>
        <ClockIcon />
      </div>
    </div>
  </article>
);

const ReportsCard: React.FC = () => (
  <section className="flex flex-col rounded-lg border border-[#E2E8F0] bg-white p-4">
    {/* כותרת — Figma 17:11883 */}
    <header className="flex h-10 items-center gap-4">
      <h2 className="text-[18px] font-semibold leading-6 whitespace-nowrap text-[#00033D]">דיווחים</h2>
      <button type="button" className="flex cursor-pointer items-center justify-end gap-2">
        <span className="text-[16px] font-normal leading-[1.25] whitespace-nowrap text-[#00033D]">
          לכל המונים
        </span>
        <DiagonalArrowTile />
      </button>
    </header>

    {/* רשימת הדיווחים — גלילה עם סרגל דק (2px) כמו בעיצוב */}
    <div className="home-scroll mt-5 flex max-h-[549px] flex-col gap-2 overflow-y-auto pl-3">
      {REPORTS.map((item) => (
        <ReportRow key={item.id} item={item} />
      ))}
    </div>
  </section>
);

export default ReportsCard;
