import React from 'react';

export const nonEmpty = (data?: Record<string, string>) =>
  data ? Object.entries(data).filter(([, value]) => value != null && value !== '') : [];

// משולש אזהרה אדום
export const AlertIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
    <path d="M12 2 1 21h22L12 2z" fill="#E02424" />
    <path d="M12 9v5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="17.5" r="1.3" fill="#fff" />
  </svg>
);

export const LinkIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none" stroke="#1E3BA2" strokeWidth="2" strokeLinecap="round" className="shrink-0">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);

export const PinIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor" className="shrink-0">
    <path d="M15 3l6 6-3 1-4 4 1 5-2 2-4-4-5 5-1-1 5-5-4-4 2-2 5 1 4-4 1-3z" />
  </svg>
);

export const AlertChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span
    title={`${label}: ${value}`}
    className="flex max-w-[260px] items-center gap-1 rounded border border-[#F8C9CF] bg-[#FDECEE] px-2 py-[2px] text-xs text-[#7A1C26]"
  >
    <AlertIcon />
    <span className="truncate">
      <span className="font-semibold">{label}:</span> {value}
    </span>
  </span>
);

export const LinkChip: React.FC<{ label: string; href: string }> = ({ label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 whitespace-nowrap rounded bg-[#F0F6FD] px-2 py-[2px] text-xs text-[#1E3BA2] hover:underline"
  >
    <LinkIcon size={12} />
    {label}
  </a>
);

// "תווית: ערך" בשורה אחת — לפס נעוץ, שבו הגובה חשוב יותר מהיררכיה
export const ValueChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span className="whitespace-nowrap rounded bg-[#F8F9FD] px-2 py-[2px] text-xs text-[#00033D]">
    <span className="text-[#848282]">{label}:</span> {value}
  </span>
);

// תווית מעל ערך. muted — לשדות המורחבים, כדי שהבסיסיים יבלטו
export const Field: React.FC<{ label: string; value: string; muted?: boolean }> = ({ label, value, muted }) => (
  <div className="flex min-w-[90px] max-w-[220px] flex-col text-right">
    <span className="whitespace-nowrap text-xs leading-tight text-[#8E929F]">{label}</span>
    <span title={value} className={`truncate leading-tight ${muted ? 'text-[13px] text-[#3B3F5C]' : 'text-sm text-[#00033D]'}`}>
      {value}
    </span>
  </div>
);
