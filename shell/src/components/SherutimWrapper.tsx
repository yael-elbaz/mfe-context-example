import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { getSherutMfeConfig, type SherutMfeConfig } from '../services/sherutimService';

const SherutimWrapper: React.FC = () => {
  const { idntSheryut = '' } = useParams<{ idntSheryut: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [mfeConfig, setMfeConfig] = useState<SherutMfeConfig | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = (location.state as any)?.mfeConfig as SherutMfeConfig | undefined;
    if (cached) { setMfeConfig(cached); return; }
    setMfeConfig(null);
    setError(false);
    getSherutMfeConfig(idntSheryut)
      .then(setMfeConfig)
      .catch(() => setError(true));
  }, [idntSheryut]);

  if (!mfeConfig && !error) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#1E3BA2', direction: 'rtl' }}>
        ⏳ טוען הגדרות שירות...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', color: '#c00', background: '#fff0f0', borderRadius: '8px', direction: 'rtl' }}>
        <strong>שירות לא נמצא</strong>
        <p style={{ marginTop: '8px', fontSize: '14px' }}>לא ניתן לטעון את הגדרות השירות.</p>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: '12px', background: 'none', border: '1px solid #C5CBDD', borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}
        >
          ← חזרה
        </button>
      </div>
    );
  }

  return <Outlet context={{ mfeConfig }} />;
};

export default SherutimWrapper;
