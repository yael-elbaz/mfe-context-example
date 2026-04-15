import React, { useEffect, lazy, Suspense, Component, ReactNode } from 'react';
import { useAppContext } from './store/appContext';
import { Header } from './components/Header';

// טעינה עצלה של ה-MFE מהשרת שלו
const TasksMFE = lazy(() => import('mfe_tasks/App'));

// Error Boundary לתפיסת שגיאות בטעינת MFEs
class MFEErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', color: '#c00', background: '#fff0f0', borderRadius: '8px' }}>
          <strong>שגיאה בטעינת מודול משימות</strong>
          <pre style={{ fontSize: '12px', marginTop: '8px' }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      image: 'https://i.pravatar.cc/150?img=47',
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

  useEffect(() => {
    // טוען את פרטי המשתמש בעת אתחול ה-Shell ומכניס לסטור
    fetchUserSession().then(({ user, availableUnits }) => {
      setUser(user);
      useAppContext.setState({ availableUnits });
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
        <MFEErrorBoundary>
          <Suspense fallback={<div>טוען מודול משימות...</div>}>
            <TasksMFE />
          </Suspense>
        </MFEErrorBoundary>
      </main>
    </div>
  );
};

export default App;
