import React, { useState, useRef, useEffect } from 'react';
import './index.css';

type PersonType = 'employee' | 'customer';

interface Employee {
  type: 'employee';
  id: string;
  name: string;
  department: string;
  role: string;
}

interface Customer {
  type: 'customer';
  id: string;
  name: string;
  city: string;
  memberSince: string;
}

type AnyPerson = Employee | Customer;

const EMPLOYEES: Employee[] = [
  { type: 'employee', id: '1001', name: 'דנה לוי',     department: 'כספים', role: 'מנהלת חשבונות' },
  { type: 'employee', id: '1002', name: 'יוסי כהן',    department: 'HR',    role: 'רכז גיוס' },
  { type: 'employee', id: '1003', name: 'מיכל גולן',   department: 'IT',    role: 'מפתחת Full Stack' },
  { type: 'employee', id: '1004', name: 'אבי שפירא',   department: 'כספים', role: 'מנהל תקציב' },
  { type: 'employee', id: '1005', name: 'רינת ברק',    department: 'HR',    role: 'מנהלת HR' },
  { type: 'employee', id: '1006', name: 'נועם אלון',   department: 'IT',    role: 'ארכיטקט מערכות' },
  { type: 'employee', id: '1007', name: 'שירה מזרחי',  department: 'כספים', role: 'רואת חשבון' },
  { type: 'employee', id: '1008', name: 'גל פרידמן',   department: 'IT',    role: 'מפתח Backend' },
];

const CUSTOMERS: Customer[] = [
  { type: 'customer', id: 'C001', name: 'משה ישראלי',  city: 'תל אביב',  memberSince: '2019' },
  { type: 'customer', id: 'C002', name: 'רחל כהן',     city: 'חיפה',     memberSince: '2021' },
  { type: 'customer', id: 'C003', name: 'דוד לוי',     city: 'ירושלים',  memberSince: '2020' },
  { type: 'customer', id: 'C004', name: 'שרה אברהם',   city: 'באר שבע',  memberSince: '2022' },
  { type: 'customer', id: 'C005', name: 'יעקב פרידמן', city: 'רמת גן',   memberSince: '2018' },
];

const TYPE_LABEL: Record<PersonType, string> = {
  employee: 'עובד',
  customer: 'לקוח',
};

/* תגיות סוג — לפי ה-Badge בעיצוב (ירוק / כתום) */
const TYPE_BADGE: Record<PersonType, string> = {
  employee: 'bg-[#F6FFF8] border-[0.5px] border-[#2E7D32] text-[#2E7D32]',
  customer: 'bg-[#FFF9F0] border-[0.5px] border-[#EF6C00] text-[#EF6C00]',
};

/* Icon_Search — מיוצא מ-Figma (24×24) */
const IconSearch: React.FC = () => (
  <span className="inline-flex size-6 shrink-0 items-center justify-center">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10C3 10.9193 3.18106 11.8295 3.53284 12.6788C3.88463 13.5281 4.40024 14.2997 5.05025 14.9497C5.70026 15.5998 6.47194 16.1154 7.32122 16.4672C8.1705 16.8189 9.08075 17 10 17C10.9193 17 11.8295 16.8189 12.6788 16.4672C13.5281 16.1154 14.2997 15.5998 14.9497 14.9497C15.5998 14.2997 16.1154 13.5281 16.4672 12.6788C16.8189 11.8295 17 10.9193 17 10C17 9.08075 16.8189 8.1705 16.4672 7.32122C16.1154 6.47194 15.5998 5.70026 14.9497 5.05025C14.2997 4.40024 13.5281 3.88463 12.6788 3.53284C11.8295 3.18106 10.9193 3 10 3C9.08075 3 8.1705 3.18106 7.32122 3.53284C6.47194 3.88463 5.70026 4.40024 5.05025 5.05025C4.40024 5.70026 3.88463 6.47194 3.53284 7.32122C3.18106 8.1705 3 9.08075 3 10Z"
        stroke="#8E929F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M21 21L15 15" stroke="#8E929F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

interface Props {
  onSelected?: (id: string, personType: PersonType) => void;
  objectType?: PersonType[] | null;
  /** טקסט ה-placeholder — ברירת המחדל לפי העיצוב של דף הבית */
  placeholder?: string;
}

const App: React.FC<Props> = ({ onSelected, objectType, placeholder }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AnyPerson | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allPersons: AnyPerson[] = [
    ...(objectType == null || objectType.includes('employee') ? EMPLOYEES : []),
    ...(objectType == null || objectType.includes('customer') ? CUSTOMERS : []),
  ];

  const filtered = query.trim()
    ? allPersons.filter(
        (p) => p.id.includes(query.trim()) || p.name.includes(query.trim())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelected(null);
    setOpen(true);
  };

  const handleSelect = (person: AnyPerson) => {
    setSelected(person);
    setQuery(person.id);
    setOpen(false);
    onSelected?.(person.id, person.type);
  };

  return (
    <div dir="rtl" ref={containerRef} className="relative w-full max-w-[528px]">
      {/* שדה החיפוש — Figma "Search Field" (7:6575):
          עטיפה לבנה עם padding 4, ובתוכה שדה בגובה 64 עם מסגרת #006AFF */}
      <div className="flex w-full items-start justify-end overflow-hidden rounded-lg bg-white p-1">
        <div className="flex h-16 min-w-0 flex-1 items-center justify-end gap-2 rounded-lg border border-[#006AFF] bg-white px-4 py-3">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim() && setOpen(true)}
            placeholder={placeholder ?? 'איתור אדם'}
            className="min-w-0 flex-1 bg-transparent text-right text-[16px] font-normal leading-[1.25] text-[#00033D] outline-none placeholder:text-[#8E929F]"
          />
          <IconSearch />
        </div>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute inset-x-0 top-[calc(100%+4px)] z-[100] max-h-[280px] list-none overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-[0_4px_12px_rgba(6,77,173,0.12)]">
          {filtered.map((person) => (
            <li
              key={`${person.type}-${person.id}`}
              onClick={() => handleSelect(person)}
              className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 hover:bg-[#F8F9FD]"
            >
              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2 py-1 text-[12px] leading-[1.25] ${TYPE_BADGE[person.type]}`}>
                  {TYPE_LABEL[person.type]}
                </span>
                <span className="text-[14px] font-medium text-[#00033D]">{person.name}</span>
              </div>
              <span className="whitespace-nowrap text-[12px] text-[#8E929F]">
                {person.id} · {person.type === 'employee' ? person.department : person.city}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute inset-x-0 top-[calc(100%+4px)] z-[100] rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-right text-[14px] text-[#8E929F] shadow-[0_4px_12px_rgba(6,77,173,0.12)]">
          לא נמצאו תוצאות
        </div>
      )}

      {selected && (
        <div className="mt-4 rounded-lg bg-[#F8F9FD] p-4 text-right">
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-lg px-2 py-1 text-[12px] leading-[1.25] ${TYPE_BADGE[selected.type]}`}>
              {TYPE_LABEL[selected.type]}
            </span>
            <span className="text-[16px] font-semibold text-[#00033D]">{selected.name}</span>
          </div>
          <div className="flex gap-4 text-[14px] text-[#8E929F]">
            <span>מספר: {selected.id}</span>
            {selected.type === 'employee' && (
              <>
                <span>מחלקה: {selected.department}</span>
                <span>תפקיד: {selected.role}</span>
              </>
            )}
            {selected.type === 'customer' && (
              <>
                <span>עיר: {selected.city}</span>
                <span>לקוח מאז: {selected.memberSince}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
