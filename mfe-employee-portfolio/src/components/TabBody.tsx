import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TabData } from '../types';
import type { PinnableSection } from '../hooks/usePinnedSections';
import Popover from './Popover';
import FitFields from './FitFields';
import { AlertChip, AlertIcon, Field, LinkChip, LinkIcon, PinIcon, ValueChip, nonEmpty } from './DataChips';

// Already shown in the shell's inner header (name, ת.ז., מס׳ עובד) — never repeated inside a tab.
const HEADER_FIELD_LABELS = new Set(['שם מלא', 'מספר עובד', 'תעודת זהות']);
// Basic fields shown in the row: at most MAX_BASIC; a tab with fewer than MIN_BASIC
// is topped up from its extended data.
const MAX_BASIC = 6;
const MIN_BASIC = 3;

const SECTION_TITLES: Record<PinnableSection, string> = {
  murchavData: 'נתונים מורחבים',
  hatrraa: 'התראות',
  links: 'קישורים',
};

type Entries = [string, string][];

// The section's items — a 2-column field grid in the popover, compact one-line chips in a pinned strip.
const SectionItems: React.FC<{ section: PinnableSection; entries: Entries; compact?: boolean }> = ({ section, entries, compact }) => {
  if (section === 'hatrraa') return <>{entries.map(([l, v]) => <AlertChip key={l} label={l} value={v} />)}</>;
  if (section === 'links') return <>{entries.map(([l, href]) => <LinkChip key={l} label={l} href={href} />)}</>;
  if (compact) return <>{entries.map(([l, v]) => <ValueChip key={l} label={l} value={v} />)}</>;
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-2">
      {entries.map(([l, v]) => <Field key={l} label={l} value={v} />)}
    </div>
  );
};

interface Props {
  data: TabData;
  pinned: PinnableSection[];
  onPin: (section: PinnableSection) => void;
  onUnpin: (section: PinnableSection) => void;
}

/**
 * גוף הטאב הפעיל — שורה אחת לרוחב:
 *  [3–6 שדות בסיסיים] | [שדות מורחבים, כמה שנכנסים ברוחב] [+N מורחבים] [⚠ התראות] [🔗 קישורים]
 * ה-+N, ההתראות והקישורים נפתחים בפופאפ אחד משותף, ואפשר לנעוץ כל אחד מהם כפס מתחת לשורה.
 */
const TabBody: React.FC<Props> = ({ data, pinned, onPin, onUnpin }) => {
  const { main, extended, alerts, links } = useMemo(() => {
    const basic = nonEmpty(data.basicData).filter(([l]) => !HEADER_FIELD_LABELS.has(l)).slice(0, MAX_BASIC);
    const allExtended = nonEmpty(data.murchavData);
    const topUp = allExtended.slice(0, Math.max(0, MIN_BASIC - basic.length));
    return {
      main: [...basic, ...topUp],
      extended: allExtended.slice(topUp.length),
      alerts: nonEmpty(data.hatrraa),
      links: nonEmpty(data.links),
    };
  }, [data]);

  const [hiddenLabels, setHiddenLabels] = useState<string[]>([]);
  // Keep the same array when nothing changed, so measuring doesn't re-render in a loop.
  const onHiddenChange = useCallback((labels: string[]) => {
    setHiddenLabels(curr => (curr.join('\0') === labels.join('\0') ? curr : labels));
  }, []);

  const [open, setOpen] = useState<{ section: PinnableSection; anchor: HTMLElement } | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useEffect(() => setOpen(null), [data]);

  const entriesOf = (section: PinnableSection): Entries => {
    if (section === 'murchavData') return extended.filter(([l]) => hiddenLabels.includes(l));
    return section === 'hatrraa' ? alerts : links;
  };

  const toggle = (section: PinnableSection) => (e: React.MouseEvent<HTMLElement>) => {
    const anchor = e.currentTarget;
    setOpen(curr => (curr?.section === section ? null : { section, anchor }));
  };

  if (main.length === 0 && extended.length === 0 && alerts.length === 0 && links.length === 0) {
    return <div className="pt-3 text-sm text-[#848282]">אין נתונים להצגה</div>;
  }

  const ring = (section: PinnableSection) =>
    pinned.includes(section) ? 'ring-1 ring-inset ring-[#1E3BA2] border-[#1E3BA2]' : '';

  return (
    <div className="flex flex-col">
      <div className="flex min-w-0 items-center gap-5 pt-3">
        {main.length > 0 && (
          <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">
            {main.map(([l, v]) => <Field key={l} label={l} value={v} />)}
          </div>
        )}
        {main.length > 0 && extended.length > 0 && (
          <span aria-hidden className="w-px shrink-0 self-stretch bg-[#E8EAF0]" />
        )}

        <FitFields entries={extended} onHiddenChange={onHiddenChange} />

        {hiddenLabels.length > 0 && (
          <button
            type="button"
            onClick={toggle('murchavData')}
            aria-expanded={open?.section === 'murchavData'}
            className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border border-dashed border-[#B9C0D6] bg-white px-2.5 py-1 font-[inherit] text-[13px] text-[#1E3BA2] hover:bg-[#F0F6FD] ${ring('murchavData')}`}
          >
            +{hiddenLabels.length} מורחבים
          </button>
        )}
        {alerts.length > 0 && (
          <button
            type="button"
            onClick={toggle('hatrraa')}
            aria-expanded={open?.section === 'hatrraa'}
            aria-label={`${alerts.length} התראות`}
            className={`relative grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-[#F8C9CF] bg-[#FDECEE] ${ring('hatrraa')}`}
          >
            <AlertIcon size={16} />
            <span className="absolute -top-1.5 -left-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#E02424] px-1 text-[10px] font-semibold text-white">
              {alerts.length}
            </span>
          </button>
        )}
        {links.length > 0 && (
          <button
            type="button"
            onClick={toggle('links')}
            aria-expanded={open?.section === 'links'}
            aria-label="קישורים"
            className={`grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-[#E8EAF0] bg-white ${ring('links')}`}
          >
            <LinkIcon />
          </button>
        )}
      </div>

      {pinned.map(section => {
        const entries = entriesOf(section);
        if (entries.length === 0) return null;
        return (
          <div key={section} className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-dashed border-[#E8EAF0] pt-2">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#848282]">
              <PinIcon size={11} />
              {SECTION_TITLES[section]}
            </span>
            <SectionItems section={section} entries={entries} compact />
            <button
              type="button"
              onClick={() => onUnpin(section)}
              aria-label="ביטול נעיצה"
              title="ביטול נעיצה"
              className="ms-auto cursor-pointer rounded border-0 bg-transparent px-1.5 text-base leading-none text-[#8E929F] hover:bg-[#F0F2F8] hover:text-[#00033D]"
            >
              ×
            </button>
          </div>
        );
      })}

      {open && (
        <Popover anchor={open.anchor} onClose={close}>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-[#8E929F]">{SECTION_TITLES[open.section]}</span>
            {!pinned.includes(open.section) && (
              <button
                type="button"
                onClick={() => { onPin(open.section); close(); }}
                title="השארת המידע פתוח מתחת לשורה"
                className="ms-auto flex cursor-pointer items-center gap-1 rounded-full border-0 bg-[#F0F6FD] px-2.5 py-0.5 font-[inherit] text-xs text-[#1E3BA2] hover:bg-[#E1ECFB]"
              >
                <PinIcon />
                הצמד
              </button>
            )}
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <SectionItems section={open.section} entries={entriesOf(open.section)} />
          </div>
        </Popover>
      )}
    </div>
  );
};

export default TabBody;
