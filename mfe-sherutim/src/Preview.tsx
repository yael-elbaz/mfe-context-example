import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import type { OpenService, PersonType, SherutCategory } from './types';
import SherutCard from './SherutCard';
import SectionCard, { OptionsButton } from 'shell/SectionCard';
import { useSherutim } from './hooks/useSherutim';

interface Props {
  openService?: OpenService;
  employeeId?: string;
  // סוג האדם הנבחר (נשלח מה-shell) — מסנן את השירותים לפי objectType. בלי ערך מוצגים כולם
  objectType?: PersonType | null;
  onShowAll?: () => void;
  // מספר שורות כרטיסים (ברירת מחדל: שורה אחת, כמו בדף הבית). בעמודה צרה — 2 שורות
  rows?: number;
  // כרטיסים נמוכים (104 במקום 184) — לעמודה הצרה בתיק העובד
  compact?: boolean;
}

// רוחב מינימלי של כרטיס שירות והמרווח ביניהם (לפי העיצוב: 6 כרטיסים ברוחב 905) —
// משמשים לחישוב כמה כרטיסים נכנסים בשורה אחת. הכרטיסים עצמם נמתחים (flex-1).
const CARD_WIDTH = 137.5;
// כרטיס נמוך (compact) — גם צר יותר ב-1/6, לעמודה הצרה (300px) בתיק העובד
const COMPACT_CARD_WIDTH = 115;
const CARD_GAP = 16;

function param(key: string, value: string) {
  return { codeSugParameter: '', parameterKey: key, parameterValue: value };
}

function makeCall(params: Record<string, string>, url?: string) {
  return {
    codeSugObject: 0, textMenuItem: '', kamutknisot: 0, isFavorite: false,
    logiPnimi: false, openInIe: false, logiSugObjectMismach: false,
    categoryId: '', idntObject: 0, idntMenuItemAv: 0, idntMenuItem: 0,
    textNativ: '', textMenu: '', textMenuTarget: '', idntMaarechet: 0,
    url,
    menuParamsList: Object.entries(params).map(([k, v]) => param(k, v)),
  };
}

const Preview: React.FC<Props> = ({ openService, employeeId = '', objectType, onShowAll, rows = 1, compact = false }) => {
  const { categories, sherutim, favorites } = useSherutim(objectType);

  // מיפוי idntObject -> קטגוריה, כדי למצוא את אייקון הקטגוריה של כל שירות
  const categoryByIdnt = useMemo(() => {
    const m = new Map<number, SherutCategory>();
    categories.forEach(({ category }) => m.set(category.idntObject, category));
    return m;
  }, [categories]);

  // מודדים את רוחב המכל כדי לקבוע כמה כרטיסים נכנסים בשורה אחת בלבד.
  const rowRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(0);
  const visibleCount = columns * rows;

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const cardWidth = compact ? COMPACT_CARD_WIDTH : CARD_WIDTH;
    const measure = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      const fit = Math.floor((width + CARD_GAP) / (cardWidth + CARD_GAP));
      setColumns(Math.max(1, fit));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [compact]);

  // רשימת התצוגה: קודם המועדפים (לפי הסדר שהגיע), ואז שאר השירותים
  // לפי סדר ה-endpoint — בלי לחזור על אותו שירות פעמיים.
  // בונים רק את מה שמוצג בפועל ועוצרים ברגע שמילאנו את השורה — כך שאם יש
  // מספיק מועדפים אף פעם לא עוברים על רשימת כל השירותים (שיכולה להיות עצומה).
  const visibleSherutim = useMemo(() => {
    if (visibleCount <= 0) return [];
    const seen = new Set<string>();
    const result: typeof sherutim = [];
    for (const s of favorites) {
      if (result.length >= visibleCount) return result;
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      result.push(s);
    }
    for (const s of sherutim) {
      if (result.length >= visibleCount) break;
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      result.push(s);
    }
    return result;
  }, [favorites, sherutim, visibleCount]);

  return (
    <div dir="rtl">
      <SectionCard
        title="שרותים"
        linkLabel="לכל המטלות"
        count={visibleSherutim.length}
        countLabel="מספר מטלות ממתניות"
        actions={<OptionsButton />}
        onShowAll={onShowAll}
      >
        {/* מספר העמודות נגזר מרוחב המסך, ומספר השורות מ-rows — ללא גלישה מעבר לכך */}
        <div
          ref={rowRef}
          className="grid w-full gap-4 overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` }}
        >
          {visibleSherutim.map(s => (
            <SherutCard
              key={s.id}
              title={s.title}
              status={s.status}
              favorite={s.isFavorite}
              compact={compact}
              categoryIconUrl={categoryByIdnt.get(s.idntObjectAv)?.iconUrl}
              onClick={() => openService?.(makeCall(
                {
                  type: 'sherut', id: employeeId, idntSheryut: s.idntSheryut, title: s.title, scope: s.mfeScope, module: s.mfeModule,
                  ...(s.displaySettings && { displaySettings: s.displaySettings, overlaySize: s.overlaySize ?? 'm' }),
                },
                s.mfeUrl
              ))}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default Preview;
