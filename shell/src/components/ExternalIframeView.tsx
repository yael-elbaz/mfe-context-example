import React from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';

/**
 * מציג URL חיצוני בתוך iframe — תצוגת "פירוט" גנרית לחלוטין, ללא לוגיקת דומיין
 * של אף MFE. ה-URL מגיע דרך location.state (למשל מ-postMessage של ה-iframe שמדווח
 * למקטע). מכיוון שאין כאן נתוני דומיין, הרכיב שייך ל-shell ולא ל-MFE ספציפי.
 *
 * ⚠️ ה-URL אינו נשמר ברענון (הוא ב-state, לא ב-URL). זה מקובל כאן: ה-URL מגיע
 * מאירוע חד-פעמי שלא ניתן לגזור מחדש. אם נדרש שרידות לרענון — יש להעביר ל-query param.
 */
const ExternalIframeView: React.FC = () => {
  const { section, itemId } = useParams<{ section: string; itemId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const iframeUrl = (location.state as { iframeUrl?: string } | null)?.iframeUrl;
  const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const backToList = () => navigate(`/employee-portfolio/${section}${search}`);

  const backBtnStyle: React.CSSProperties = {
    background: 'none', border: '1px solid #C5CBDD', color: '#00033D',
    borderRadius: '8px', padding: '4px 12px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap',
  };

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#1E3BA2', fontSize: '18px' }}>
          תצוגה חיצונית{itemId ? ` · ${itemId}` : ''}
        </h2>
        <button onClick={backToList} style={backBtnStyle}>← חזרה לרשימה</button>
      </div>

      {iframeUrl ? (
        <iframe
          src={iframeUrl}
          title="תצוגה חיצונית"
          style={{ width: '100%', height: '75vh', border: '1px solid #C5CBDD', borderRadius: '8px', background: '#fff' }}
        />
      ) : (
        <div style={{ padding: '48px', textAlign: 'center', color: '#848282' }}>
          <p style={{ margin: '0 0 16px' }}>אין תצוגה זמינה. פתח את הפריט מהרשימה כדי לטעון את התצוגה החיצונית.</p>
          <button onClick={backToList} style={backBtnStyle}>← חזרה לרשימה</button>
        </div>
      )}
    </div>
  );
};

export default ExternalIframeView;
