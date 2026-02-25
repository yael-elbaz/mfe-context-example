import React from 'react';
import { useAppContext } from '../store/appContext';

export const UnitSelector: React.FC = () => {
  const { availableUnits, selectedUnit, setSelectedUnit } = useAppContext();

  if (availableUnits.length <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label htmlFor="unit-select" style={{ fontSize: '14px', color: '#555' }}>
        יחידת עבודה:
      </label>
      <select
        id="unit-select"
        value={selectedUnit?.id ?? ''}
        onChange={(e) => {
          const unit = availableUnits.find((u) => u.id === e.target.value);
          if (unit) setSelectedUnit(unit);
        }}
        style={{
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '14px',
        }}
      >
        {availableUnits.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.name}
          </option>
        ))}
      </select>
    </div>
  );
};
