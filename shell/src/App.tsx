import React, { useEffect, lazy, Suspense, Component, ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

const TasksMFE = lazy(() => import('mfe_tasks/App'));
const SherutimPreviewMFE = lazy(() => import('mfe_sherutim/Preview'));

class SilentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.warn('[Route transition error suppressed]', error.message);
    setTimeout(() => this.setState({ hasError: false }), 0);
  }
  render() { return this.props.children; }
}

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

const mfe = (
  fallback: string,
  Comp: React.LazyExoticComponent<React.ComponentType<any>>,
  props?: Record<string, any>
) => (
  <MFEErrorBoundary>
    <Suspense fallback={<div>{fallback}</div>}>
      <Comp {...props} />
    </Suspense>
  </MFEErrorBoundary>
);

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

const RouterApp: React.FC = () => {
  const { waitForEmployee, pickerProps } = useEmployeePickerPopup();
  const { openService } = useOpenService(waitForEmployee);

  return (
    <>
      <div style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl' }}>
        <Header />
        <main style={{ padding: '24px' }}>
          <SilentErrorBoundary>
          <Routes>
            <Route path="/" element={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <SelectEmployeePage />
                {mfe('טוען מודול משימות...', TasksMFE, { openService })}
                {mfe('טוען שירותים...', SherutimPreviewMFE, { openService })}
              </div>
            } />
            <Route path="/select-employee" element={<SelectEmployeePage />} />
            <Route path="/customer-portfolio" element={<CustomerPortfolioLayout />}>
              <Route index element={<div style={{ padding: '24px', color: '#848282', direction: 'rtl' }}>בחר שירות לקוח</div>} />
            </Route>
            <Route path="/sherutim/:idntSheryut/*" element={<SherutimWrapper />}>
              <Route path="*" element={<SherutDynamicView />} />
            </Route>
            {/* <Route path="/employee-portfolio" element={<EmployeePortfolioExternalRedirect />}> */}
              <Route  path="/employee-portfolio" element={<EmployeePortfolioLayout openService={openService} />}>
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
