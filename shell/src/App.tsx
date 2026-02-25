import React, { useEffect, lazy, Suspense } from 'react';
import { useAppContext } from './store/appContext';
import { Header } from './components/Header';

// טעינה עצלה של ה-MFE מהשרת שלו
const TasksMFE = lazy(() => import('mfe_tasks/App'));

// סימולציה של קריאת API לטעינת פרטי משתמש
async function fetchUserSession() {
  // בפרויקט אמיתי — קריאת fetch/axios לשרת
  await new Promise((r) => setTimeout(r, 600));
  return {
    user: {
      id: 'u-001',
      name: 'דנה לוי',
      email: 'dana@org.co.il',
      roles: ['admin', 'user'],
    },
    availableUnits: [
      { id: 'unit-1', name: 'מחלקת כספים', department: 'finance' },
      { id: 'unit-2', name: 'מחלקת HR', department: 'hr' },
      { id: 'unit-3', name: 'מחלקת IT', department: 'it' },
    ],
  };
}

const App: React.FC = () => {
  const { user, setUser, setSelectedUnit } = useAppContext();
  const setAvailableUnits = useAppContext((s) => s.availableUnits);

  useEffect(() => {
    // טוען את פרטי המשתמש בעת אתחול ה-Shell ומכניס לסטור
    fetchUserSession().then(({ user, availableUnits }) => {
      useAppContext.setState({ user, availableUnits });
      // ברירת מחדל — יחידה ראשונה
      setSelectedUnit(availableUnits[0]);
    });
  }, []);

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#555',
        }}
      >
        ⏳ טוען נתוני משתמש...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
      <Header />

      <main style={{ padding: '24px' }}>
        {/* כאן ניתן לנתב בין MFEs שונים לפי route */}
        <Suspense fallback={<div>טוען מודול משימות...</div>}>
          <TasksMFE />
        </Suspense>
      </main>
    </div>
  );
};

export default App;
