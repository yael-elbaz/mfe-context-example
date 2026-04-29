import React, { useEffect, lazy, Suspense, Component, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useAppContext } from './store/appContext';
import { Header } from './components/Header';
import EmployeePortfolioLayout from './components/EmployeePortfolioLayout';
import EmployeePortfolioIndex from './components/EmployeePortfolioIndex';
import SectionFullView from './components/SectionFullView';
import { SherutDynamicView } from './sections/SherutDynamicView';

const TasksMFE = lazy(() => import('mfe_tasks/App'));
const SearchEmployeeMFE = lazy(() => import('mfe_search_employee/App'));

class MFEErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', color: '#c00', background: '#fff0f0', borderRadius: '8px' }}>
          <strong>שגיאה בטעינת מודול</strong>
          <pre style={{ fontSize: '12px', marginTop: '8px' }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const mfe = (fallback: string, Comp: React.LazyExoticComponent<React.ComponentType>) => (
  <MFEErrorBoundary>
    <Suspense fallback={<div>{fallback}</div>}>
      <Comp />
    </Suspense>
  </MFEErrorBoundary>
);

const EmployeeNumberInput: React.FC = () => {
  const [value, setValue] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) navigate(`/employee-portfolio?employeeId=${trimmed}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="הכנס מספר עובד"
        style={{
          padding: '10px 14px',
          border: '1px solid #C5CBDD',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#00033D',
          direction: 'rtl',
          outline: 'none',
          width: '200px',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '10px 20px',
          background: '#1E3BA2',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        עבור לפרופיל
      </button>
    </form>
  );
};

const NavigationListener: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: Event) => navigate((e as CustomEvent<string>).detail);
    window.addEventListener('mfe:navigate', handler);
    return () => window.removeEventListener('mfe:navigate', handler);
  }, [navigate]);
  return null;
};

async function fetchUserSession() {
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
    fetchUserSession().then(({ user, availableUnits }) => {
      setUser(user);
      useAppContext.setState({ availableUnits });
      setSelectedUnit(availableUnits[0]);
    });
  }, []);

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '16px', color: '#555' }}>
        ⏳ טוען נתוני משתמש...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NavigationListener />
      <div style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
        <Header />
        <main style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* <EmployeeNumberInput /> */}
                {mfe('טוען מודול חיפוש עובד...', SearchEmployeeMFE)}
                {mfe('טוען מודול משימות...', TasksMFE)}
              </div>
            } />
            <Route path="/employee-portfolio" element={<EmployeePortfolioLayout />}>
              <Route index element={<EmployeePortfolioIndex />} />
              <Route path="tik-asir/sherutim/:idntSheryut" element={<SherutDynamicView />} />
              <Route path=":section" element={<SectionFullView />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
