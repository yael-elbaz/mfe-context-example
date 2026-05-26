import React, { useState, useRef, useEffect } from 'react';
import { useUser } from 'shell/store';

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
  { type: 'customer', id: 'C001', name: 'משה ישראלי',   city: 'תל אביב',    memberSince: '2019' },
  { type: 'customer', id: 'C002', name: 'רחל כהן',       city: 'חיפה',       memberSince: '2021' },
  { type: 'customer', id: 'C003', name: 'דוד לוי',       city: 'ירושלים',    memberSince: '2020' },
  { type: 'customer', id: 'C004', name: 'שרה אברהם',    city: 'באר שבע',    memberSince: '2022' },
  { type: 'customer', id: 'C005', name: 'יעקב פרידמן',  city: 'רמת גן',     memberSince: '2018' },
];

const TYPE_LABEL: Record<PersonType, string> = {
  employee: 'עובד',
  customer: 'לקוח',
};

const TYPE_COLOR: Record<PersonType, { bg: string; text: string }> = {
  employee: { bg: '#EEF2FF', text: '#1E3BA2' },
  customer: { bg: '#FFF3E0', text: '#E65100' },
};

interface Props {
  onSelected?: (id: string, personType: PersonType) => void;
  objectType?: PersonType[] | null;
}

const App: React.FC<Props> = ({ onSelected, objectType }) => {
  const user = useUser();
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

  const subtitle =
    objectType?.length === 1
      ? TYPE_LABEL[objectType[0]]
      : 'עובד / לקוח';

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #eee',
        }}
      >
        <h2 style={{ margin: 0, color: '#1e3a5f' }}>🔍 חיפוש {subtitle}</h2>
        {user && (
          <span style={{ fontSize: '13px', color: '#888' }}>
            מחובר כ: {user.email}
          </span>
        )}
      </div>

      <div ref={containerRef} style={{ position: 'relative', maxWidth: '400px' }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder={`הכנס שם או מספר ${subtitle}...`}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #C5CBDD',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#00033D',
            direction: 'rtl',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {open && filtered.length > 0 && (
          <ul
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              left: 0,
              background: '#fff',
              border: '1px solid #C5CBDD',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              listStyle: 'none',
              margin: 0,
              padding: '4px 0',
              zIndex: 100,
              maxHeight: '240px',
              overflowY: 'auto',
            }}
          >
            {filtered.map((person) => (
              <li
                key={`${person.type}-${person.id}`}
                onClick={() => handleSelect(person)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  direction: 'rtl',
                  gap: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F8F9FD')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: TYPE_COLOR[person.type].bg,
                      color: TYPE_COLOR[person.type].text,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {TYPE_LABEL[person.type]}
                  </span>
                  <span style={{ fontWeight: 500, color: '#00033D' }}>{person.name}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#848282', whiteSpace: 'nowrap' }}>
                  {person.id} ·{' '}
                  {person.type === 'employee' ? person.department : person.city}
                </span>
              </li>
            ))}
          </ul>
        )}

        {open && query.trim() && filtered.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              right: 0,
              left: 0,
              background: '#fff',
              border: '1px solid #C5CBDD',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#848282',
              fontSize: '14px',
              direction: 'rtl',
            }}
          >
            לא נמצאו תוצאות
          </div>
        )}
      </div>

      {selected && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: '#F8F9FD',
            borderRadius: '8px',
            direction: 'rtl',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '4px',
                background: TYPE_COLOR[selected.type].bg,
                color: TYPE_COLOR[selected.type].text,
              }}
            >
              {TYPE_LABEL[selected.type]}
            </span>
            <span style={{ fontWeight: 600, fontSize: '16px', color: '#1E3BA2' }}>
              {selected.name}
            </span>
          </div>
          <div style={{ fontSize: '14px', color: '#848282', display: 'flex', gap: '16px' }}>
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
