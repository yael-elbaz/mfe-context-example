import React from 'react';
import type { TabConfig, TabData } from '../types';
import TabStrip from './TabStrip';

const nonEmpty = (data?: Record<string, string>) =>
  data ? Object.entries(data).filter(([, value]) => value != null && value !== '') : [];

const AlertChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span
    title={`${label}: ${value}`}
    className="flex max-w-[260px] items-center gap-1 rounded border border-[#F8C9CF] bg-[#FDECEE] px-2 py-[2px] text-xs text-[#7A1C26]"
  >
    {/* משולש אזהרה אדום */}
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path d="M12 2 1 21h22L12 2z" fill="#E02424" />
      <path d="M12 9v5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.3" fill="#fff" />
    </svg>
    <span className="truncate">
      <span className="font-semibold">{label}:</span> {value}
    </span>
  </span>
);

const LinkChip: React.FC<{ label: string; href: string }> = ({ label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 whitespace-nowrap rounded bg-[#F0F6FD] px-2 py-[2px] text-xs text-[#1E3BA2] hover:underline"
  >
    <span aria-hidden>🔗</span>
    {label}
  </a>
);

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex min-w-[90px] max-w-[220px] flex-col text-right">
    <span className="whitespace-nowrap text-xs leading-tight text-[#8E929F]">{label}</span>
    <span title={value} className="truncate text-sm leading-tight text-[#00033D]">{value}</span>
  </div>
);

interface Props {
  tabs: TabConfig[];
  openTabId: number | null;
  onSelect: (tab: TabConfig) => void;
  data: TabData | null;
}

/**
 * תצוגה חסכנית בגובה של טאבי העובד (מצב details):
 *  שורה 1 — הטאבים, ובצד השני ההתראות והקישורים של הטאב הפתוח.
 *  שורה 2 — כל שדות המידע (בסיסיים | מורחבים) לרוחב, תווית מעל ערך, עם קו מפריד בין הקבוצות.
 * מיועד לעד ~10 שדות לטאב — כך שהמידע נכנס בשורה-שתיים.
 */
const TabDetailsPanel: React.FC<Props> = ({ tabs, openTabId, onSelect, data }) => {
  const basic = nonEmpty(data?.basicData);
  const extended = nonEmpty(data?.murchavData);
  const alerts = nonEmpty(data?.hatrraa);
  const links = nonEmpty(data?.links);
  const hasFields = basic.length > 0 || extended.length > 0;

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <TabStrip tabs={tabs} openTabId={openTabId} onSelect={onSelect} />
        </div>
        {(alerts.length > 0 || links.length > 0) && (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
            {alerts.map(([label, value]) => <AlertChip key={label} label={label} value={value} />)}
            {links.map(([label, href]) => <LinkChip key={label} label={label} href={href} />)}
          </div>
        )}
      </div>

      {data && (
        hasFields ? (
          <div className="flex flex-wrap items-stretch gap-x-6 gap-y-2">
            {basic.map(([label, value]) => <Field key={`b-${label}`} label={label} value={value} />)}
            {basic.length > 0 && extended.length > 0 && (
              <span aria-hidden className="w-px self-stretch bg-[#E8EAF0]" />
            )}
            {extended.map(([label, value]) => <Field key={`m-${label}`} label={label} value={value} />)}
          </div>
        ) : alerts.length === 0 && links.length === 0 ? (
          <div className="text-sm text-[#848282]">אין נתונים להצגה</div>
        ) : null
      )}
    </div>
  );
};

export default TabDetailsPanel;
