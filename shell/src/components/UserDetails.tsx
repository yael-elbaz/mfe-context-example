import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../store/appContext';
import { UserPopup } from './UserPopup';

const AvatarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" stroke="#00033D" strokeWidth="1.5" />
    <circle cx="12" cy="9" r="3.5" stroke="#00033D" strokeWidth="1.5" />
    <path d="M5.5 19.5C6.5 16.5 9 15 12 15s5.5 1.5 6.5 4.5" stroke="#00033D" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Avatar: React.FC<{ image?: string; name?: string }> = ({ image, name }) => {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? 'משתמש'}
        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return <AvatarIcon />;
};

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6l4 4 4-4" stroke="#1C2B5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UserDetails: React.FC = () => {
  const user = useUser();
  const [popupOpen, setPopupOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex items-center gap-2" ref={ref}>
      <Avatar image={user?.image} name={user?.name} />
      <span
        style={{
          fontFamily: 'Rubik',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '22.06px',
          color: '#00033D',
        }}
      >
        {user?.name ?? 'ישראל ישראלי'}
      </span>
      <button
        onClick={() => setPopupOpen((prev) => !prev)}
        className="flex items-center justify-center"
        aria-label="פתח תפריט יחידה"
      >
        <ChevronIcon />
      </button>

      {popupOpen && (
        <div className="absolute" style={{ top: 'calc(100% + 4px)', left: 0 }}>
          <UserPopup onClose={() => setPopupOpen(false)} />
        </div>
      )}
    </div>
  );
};
