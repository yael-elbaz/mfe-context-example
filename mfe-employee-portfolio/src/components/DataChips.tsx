import React from 'react';

export const nonEmpty = (data?: Record<string, string>) =>
  data ? Object.entries(data).filter(([, value]) => value != null && value !== '') : [];

// משולש אזהרה
export const AlertIcon: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = '#C8102E' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
    <path d="M12 2 1 21h22L12 2z" fill={color} />
    <path d="M12 9v5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="17.5" r="1.3" fill="#fff" />
  </svg>
);

export const LinkIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);

export const ChevronDownIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const AlertChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span
    title={`${label}: ${value}`}
    className="flex max-w-[260px] items-center gap-1 rounded border border-[#F8C9CF] bg-[#FCE8EA] px-2 py-[2px] text-xs text-[#7A1C26]"
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
    className="flex items-center gap-1 whitespace-nowrap rounded bg-[#F0F6FD] px-2 py-[2px] text-xs text-[#006AFF] hover:underline"
  >
    <LinkIcon size={12} />
    {label}
  </a>
);

// תווית מעל ערך
export const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex min-w-[90px] max-w-[220px] flex-col text-right">
    <span className="whitespace-nowrap text-xs leading-tight text-[#4A5568]">{label}</span>
    <span title={value} className="truncate text-sm font-medium leading-tight text-[#00033D]">
      {value}
    </span>
  </div>
);
