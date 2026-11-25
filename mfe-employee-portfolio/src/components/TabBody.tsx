import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TabData } from '../types';
import Popover from './Popover';
import FitFields from './FitFields';
import { AlertChip, AlertIcon, ChevronDownIcon, Field, LinkChip, LinkIcon, nonEmpty } from './DataChips';

// Already shown in row 1 of the card (name, ת.ז., מס׳ עובד) — never repeated inside a tab.
const HEADER_FIELD_LABELS = new Set(['שם מלא', 'מספר עובד', 'תעודת זהות']);

type Tool = 'alerts' | 'links';

interface Props {
  data: TabData;
  /** The expanded row — owned above, so it stays open across tab switches until the user closes it. */
  expanded: boolean;
  onToggleExpanded: () => void;
}

/**
 * שורה 2 של הכרטיס — המידע של הטאב הפעיל:
 *  [שדות: קודם basic ואחריהם murchav, כמה שנכנסים] [+N נתונים] │ [N התראות] [לינקים (N)]
 * השדות שלא נכנסו מוצגים בשורה מורחבת מתחת. הצ'יפ "מידע נוסף" צף על הגבול התחתון של הכרטיס
 * ופותח/סוגר את השורה המורחבת. להתראות וללינקים יש popover בלבד.
 */
const TabBody: React.FC<Props> = ({ data, expanded: isExpanded, onToggleExpanded: toggleExpanded }) => {
  const { fields, alerts, links } = useMemo(() => ({
    fields: [
      ...nonEmpty(data.basicData).filter(([l]) => !HEADER_FIELD_LABELS.has(l)),
      ...nonEmpty(data.murchavData),
    ],
    alerts: nonEmpty(data.hatrraa),
    links: nonEmpty(data.links),
  }), [data]);

  const [hiddenLabels, setHiddenLabels] = useState<string[]>([]);
  // Keep the same array when nothing changed, so measuring doesn't re-render in a loop.
  const onHiddenChange = useCallback((labels: string[]) => {
    setHiddenLabels(curr => (curr.join('\0') === labels.join('\0') ? curr : labels));
  }, []);
  const hiddenFields = fields.filter(([l]) => hiddenLabels.includes(l));

  const [open, setOpen] = useState<{ tool: Tool; anchor: HTMLElement } | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useEffect(() => { setOpen(null); }, [data]);

  const toggleTool = (tool: Tool) => (e: React.MouseEvent<HTMLElement>) => {
    const anchor = e.currentTarget;
    setOpen(curr => (curr?.tool === tool ? null : { tool, anchor }));
  };

  if (fields.length === 0 && alerts.length === 0 && links.length === 0) {
    return null;
  }

  const hasTools = alerts.length > 0 || links.length > 0;

  return (
    <div className={`relative flex flex-col px-5 pt-3 ${hiddenFields.length > 0 ? 'pb-5' : 'pb-3'}`}>
      <div className="flex min-h-9 min-w-0 items-center gap-5">
        <FitFields entries={fields} onHiddenChange={onHiddenChange} />

        {hiddenFields.length > 0 && !isExpanded && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="shrink-0 cursor-pointer whitespace-nowrap border-0 bg-transparent p-0 font-[inherit] text-[13px] font-medium text-[#00033D] hover:underline"
          >
            +{hiddenFields.length} נתונים
          </button>
        )}

        {hasTools && (
          <>
            <span aria-hidden className="h-9 w-px shrink-0 bg-[#E2E8F0]" />
            {alerts.length > 0 && (
              <button
                type="button"
                onClick={toggleTool('alerts')}
                aria-expanded={open?.tool === 'alerts'}
                className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border-0 bg-[#FCE8EA] px-3 font-[inherit] text-[13px] font-medium text-[#C8102E] ${
                  open?.tool === 'alerts' ? 'ring-1 ring-inset ring-[#C8102E]' : ''
                }`}
              >
                <AlertIcon size={16} />
                {alerts.length} התראות
              </button>
            )}
            {links.length > 0 && (
              <button
                type="button"
                onClick={toggleTool('links')}
                aria-expanded={open?.tool === 'links'}
                className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border-0 bg-[#CCE0F7] px-3 font-[inherit] text-base text-[#006AFF] ${
                  open?.tool === 'links' ? 'ring-1 ring-inset ring-[#006AFF]' : ''
                }`}
              >
                <LinkIcon size={24} />
                לינקים ({links.length})
              </button>
            )}
          </>
        )}
      </div>

      {/* שורה מורחבת — רק השדות שלא נכנסו, באותו סדר ועיצוב */}
      {isExpanded && hiddenFields.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-9 gap-y-3 pt-3">
          {hiddenFields.map(([l, v]) => <Field key={l} label={l} value={v} />)}
        </div>
      )}

      {/* צ'יפ "מידע נוסף" — צף על הגבול התחתון של הכרטיס, במרכז */}
      {hiddenFields.length > 0 && (
        <div className="absolute bottom-0 left-1/2 z-10 flex h-7 -translate-x-1/2 translate-y-1/2 items-center rounded-2xl border border-[#E2E8F0] bg-white drop-shadow-[0_1px_2px_rgba(0,3,61,0.08)]">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            className="flex h-full cursor-pointer items-center gap-1 whitespace-nowrap rounded-2xl border-0 bg-transparent px-3 font-[inherit] text-xs text-[#00033D] hover:bg-[#F7FAFC]"
          >
            <ChevronDownIcon size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            {isExpanded ? 'פחות מידע' : 'מידע נוסף'}
          </button>
        </div>
      )}

      {open && (
        <Popover anchor={open.anchor} onClose={close}>
          <div className="mb-2 text-xs font-semibold text-[#8E929F]">
            {open.tool === 'alerts' ? 'התראות' : 'לינקים'}
          </div>
          <div className="flex flex-col items-start gap-1.5">
            {open.tool === 'alerts'
              ? alerts.map(([l, v]) => <AlertChip key={l} label={l} value={v} />)
              : links.map(([l, href]) => <LinkChip key={l} label={l} href={href} />)}
          </div>
        </Popover>
      )}
    </div>
  );
};

export default TabBody;
