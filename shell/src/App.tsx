import React, { useEffect, lazy, Component, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useAppContext } from './store/appContext';
import { Header } from './components/Header';
import EmployeePortfolioLayout from './components/EmployeePortfolioLayout';
import CustomerPortfolioLayout from './components/CustomerPortfolioLayout';
import EmployeePortfolioIndex from './components/EmployeePortfolioIndex';
import ExternalIframeView from './components/ExternalIframeView';
import LegacySectionRedirect from './components/LegacySectionRedirect';
import EmployeePortfolioExternalRedirect from './components/EmployeePortfolioExternalRedirect';
import { SherutDynamicView } from './sections/SherutDynamicView';
import SherutimWrapper from './components/SherutimWrapper';
import { useOpenService } from './hooks/useOpenService';
import { useEmployeePickerPopup } from './hooks/useEmployeePickerPopup';
import EmployeePickerPopup from './components/EmployeePickerPopup';
import SelectEmployeePage from './components/SelectEmployeePage';
import HomePage from './components/home/HomePage';
import { mfe } from './components/MfeSlot';

const SherutimFullMFE = lazy(() => import('mfe_sherutim/Full'));

class SilentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.warn('[Route transition error suppressed]', error.message);
    setTimeout(() => this.setState({ hasError: false }), 0);
  }
  render() { return this.props.children; }
}

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

/** ריפוד ברירת המחדל של מסכים שאינם דף הבית (דף הבית מנהל את הריפוד שלו) */
const Padded: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: '24px' }}>{children}</div>
);

const RouterApp: React.FC = () => {
  const { waitForEmployee, pickerProps } = useEmployeePickerPopup();
  const { openService } = useOpenService(waitForEmployee);
  const navigate = useNavigate();

  return (
    <>
      <div style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
        <Header />
        <main>
          <SilentErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage openService={openService} />} />
            <Route path="/select-employee" element={<Padded><SelectEmployeePage /></Padded>} />
            <Route path="/customer-portfolio" element={<Padded><CustomerPortfolioLayout /></Padded>}>
              <Route index element={<div style={{ padding: '24px', color: '#848282', direction: 'rtl' }}>בחר שירות לקוח</div>} />
            </Route>
            <Route path="/sherutim" element={
              <Padded>{mfe('טוען שירותים...', SherutimFullMFE, { openService, navigate })}</Padded>
            } />
            <Route path="/sherutim/:idntSheryut/*" element={<Padded><SherutimWrapper /></Padded>}>
              <Route path="*" element={<SherutDynamicView />} />
            </Route>
            {/* <Route path="/employee-portfolio" element={<EmployeePortfolioExternalRedirect />}> */}
              <Route  path="/employee-portfolio" element={<Padded><EmployeePortfolioLayout openService={openService} /></Padded>}>
                <Route index element={<EmployeePortfolioIndex openService={openService} />} />
                <Route path="sherutim/:idntSheryut/*" element={<SherutDynamicView />} />
                <Route path=":section/:itemId" element={<ExternalIframeView />} />
                <Route path=":section" element={<LegacySectionRedirect openService={openService} />} />
              </Route>
            {/* </Route> */}
          </Routes>
          </SilentErrorBoundary>
        </main>
      </div>
      <EmployeePickerPopup {...pickerProps} />
    </>
  );
};

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
      <RouterApp />
    </BrowserRouter>
  );
};

export default App;
