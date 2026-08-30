import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';
import type { OpenService, SherutCategory } from './types';
import SherutCard from './SherutCard';
import SectionCard, { OptionsButton } from 'shell/SectionCard';
import { useSherutim } from './hooks/useSherutim';

interface Props {
  openService?: OpenService;
  employeeId?: string;
  onShowAll?: () => void;
}

// רוחב מינימלי של כרטיס שירות והמרווח ביניהם (לפי העיצוב: 6 כרטיסים ברוחב 905) —
// משמשים לחישוב כמה כרטיסים נכנסים בשורה אחת. הכרטיסים עצמם נמתחים (flex-1).
const CARD_WIDTH = 137.5;
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

const Preview: React.FC<Props> = ({ openService, employeeId = '', onShowAll }) => {
  const { categories, sherutim, favorites } = useSherutim();

  // מיפוי idntObject -> קטגוריה, כדי למצוא את אייקון הקטגוריה של כל שירות
  const categoryByIdnt = useMemo(() => {
    const m = new Map<number, SherutCategory>();
    categories.forEach(({ category }) => m.set(category.idntObject, category));
    return m;
  }, [categories]);

  // מודדים את רוחב המכל כדי לקבוע כמה כרטיסים נכנסים בשורה אחת בלבד.
  const rowRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      const fit = Math.floor((width + CARD_GAP) / (CARD_WIDTH + CARD_GAP));
      setVisibleCount(Math.max(1, fit));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
        onLinkClick={() => onShowAll?.()}
      >
        {/* שורה אחת בלבד — מספר הכרטיסים נגזר מרוחב המסך. flexWrap מושבת כדי למנוע גלישה */}
        <div ref={rowRef} className="flex w-full items-start justify-end gap-4 overflow-hidden">
          {visibleSherutim.map(s => (
            <SherutCard
              key={s.id}
              title={s.title}
              status={s.status}
              favorite={s.isFavorite}
              categoryIconUrl={categoryByIdnt.get(s.idntObjectAv)?.iconUrl}
              onClick={() => openService?.(makeCall(
                { type: 'sherut', id: employeeId, idntSheryut: s.idntSheryut, scope: s.mfeScope, module: s.mfeModule },
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
