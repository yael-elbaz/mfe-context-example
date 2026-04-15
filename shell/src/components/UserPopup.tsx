import React, { useState } from 'react';
import { useUser, useAppContext } from '../store/appContext';

// ── Chevron ──────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="#1C2B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Dropdown בחירת יחידה ─────────────────────────────────────────
const UnitDropdown: React.FC = () => {
  const { availableUnits, selectedUnit, setSelectedUnit } = useAppContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full"
        style={{
          height: '48px',
          border: '1px solid #C5CBDD',
          borderRadius: '8px',
          background: '#FFFFFF',
          paddingTop: '12px',
          paddingBottom: '12px',
          paddingRight: '16px',
          paddingLeft: '16px',
          direction: 'rtl',
        }}
      >
        <span style={{ fontFamily: 'Rubik', fontSize: '14px', color: '#00033D' }}>
          {selectedUnit?.name ?? '—'}
        </span>
        <ChevronDown />
      </button>

      {open && (
        <div
          className="absolute right-0 w-full bg-white rounded-lg shadow-md mt-1 overflow-hidden"
          style={{ border: '1px solid #C5CBDD', zIndex: 300 }}
        >
          {availableUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => { setSelectedUnit(unit); setOpen(false); }}
              className="w-full text-right px-4 py-2 hover:bg-gray-50"
              style={{ fontFamily: 'Rubik', fontSize: '14px', color: '#00033D', direction: 'rtl' }}
            >
              {unit.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Mock נתוני מחוז ──────────────────────────────────────────────
const DISTRICTS = ['ממז צפון', 'ממז מרכז', 'ממז דרום'];

// ── UserPopup ────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
}

export const UserPopup: React.FC<Props> = ({ onClose }) => {
  const user = useUser();
  const [activeDistrict, setActiveDistrict] = useState(DISTRICTS[0]);

  return (
    <div
      style={{
        width: '343px',
        background: '#FFFFFF',
        boxShadow: '0px 2px 6px 0px #00000026',
        borderBottomRightRadius: '16px',
        borderBottomLeftRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
        direction: 'rtl',
        zIndex: 200,
      }}
    >
      {/* ── חלק עליון: פרטי משתמש + בחירת יחידה — רקע אפור ── */}
      <div className="flex flex-col gap-3" style={{ background: '#F8F9FD', borderRadius: '8px', padding: '12px' }}>
        <div className="flex flex-col gap-1">
          <span
            style={{
              fontFamily: 'Rubik',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '22.06px',
              color: '#1E3BA2',
              textAlign: 'right',
            }}
          >
            {user?.name ?? 'ישראל ישראלי'}
          </span>
          <span
            style={{
              fontFamily: 'Rubik',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '22.06px',
              color: '#848282',
              textAlign: 'right',
            }}
          >
            מס: {user?.id ?? '—'}
          </span>
        </div>

        {/* בחירת יחידה */}
        <div className="flex flex-col gap-2">
          <span style={{ fontFamily: 'Rubik', fontSize: '13px', color: '#00033D', textAlign: 'right' }}>
            בחירת יחידה
          </span>
          <UnitDropdown />
        </div>
      </div>

      {/* ── חלק תחתון: סגן מידע ── */}
      <div
        style={{
          background: 'transparent',
          borderRadius: '8px',
          width: '311px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <span style={{ fontFamily: 'Rubik', fontSize: '12px', color: '#848282', textAlign: 'right' }}>
          סגן מידע
        </span>

        {/* בחירת מחוז */}
        <div className="flex flex-col gap-2">
          <span style={{ fontFamily: 'Rubik', fontSize: '13px', color: '#00033D', textAlign: 'right' }}>
            בחירת מחוז
          </span>
          <div className="flex flex-row-reverse gap-2 w-full">
            {DISTRICTS.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDistrict(d)}
                style={{
                  flex: 1,
                  height: '32px',
                  borderRadius: '8px',
                  fontFamily: 'Rubik',
                  fontSize: '13px',
                  cursor: 'pointer',
                  background: activeDistrict === d ? '#4395FF' : '#FFFFFF',
                  border: activeDistrict === d ? '1px solid #01278C' : '1px solid #C5CBDD',
                  color: activeDistrict === d ? '#FFFFFF' : '#00033D',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* בחירת יחידה — חלק תחתון */}
        <div className="flex flex-col gap-2">
          <span style={{ fontFamily: 'Rubik', fontSize: '13px', color: '#00033D', textAlign: 'right' }}>
            בחירת יחידה
          </span>
          <UnitDropdown />
        </div>

        {/* בחירת אגף — ללא עיצוב */}
        <div className="flex flex-col gap-2">
          <span style={{ fontFamily: 'Rubik', fontSize: '13px', color: '#00033D', textAlign: 'right' }}>
            בחירת אגף
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 rounded text-sm">1-משתלבים</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-sm">7-בידוד</span>
          </div>
        </div>
      </div>
    </div>
  );
};
