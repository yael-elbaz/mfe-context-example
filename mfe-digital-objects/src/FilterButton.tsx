import React from 'react';

/** כפתור "סינון מורחב" — מוזרם ל-actions של SectionCard. active = סרגל הסינון פתוח */
const FilterButton: React.FC<{ active?: boolean; onClick?: () => void }> = ({ active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: active ? '#4395FF' : 'none',
      border: '1px solid',
      borderColor: active ? '#01278C' : '#1E3BA2',
      color: active ? '#fff' : '#1E3BA2',
      borderRadius: '8px',
      padding: '4px 12px',
      cursor: 'pointer',
      fontSize: '13px',
      whiteSpace: 'nowrap',
    }}
  >
    סינון מורחב
  </button>
);

export default FilterButton;
