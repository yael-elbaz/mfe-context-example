import React from 'react';

interface Props {
  title: string;
  status: string;
  onClick: () => void;
}

const SherutimCard: React.FC<Props> = ({ title, status, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: '20px 16px',
      borderRadius: '12px',
      border: '1px solid #C5CBDD',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      direction: 'rtl',
      minWidth: '120px',
      flex: '1 1 120px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'box-shadow 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)')}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
  >
    <span style={{ fontWeight: 500, color: '#00033D', fontSize: '14px' }}>{title}</span>
    <span style={{
      fontSize: '11px',
      padding: '2px 10px',
      borderRadius: '12px',
      background: status === 'הושלם' ? '#e6f4ea' : status === 'פתוח' ? '#e8f0fe' : '#fff8e1',
      color: status === 'הושלם' ? '#2d7a3a' : status === 'פתוח' ? '#1E3BA2' : '#b07a00',
    }}>{status}</span>
  </div>
);

export default SherutimCard;
