import React, { lazy, Suspense, useEffect, Component, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEmployeeStore, EmployeeProfile } from '../store/employeeStore';

const EmployeePortfolioMFE = lazy(() => import('mfe_employee_portfolio/App'));

const PROFILES: Record<string, EmployeeProfile> = {
  '1001': {
    id: '1001', firstName: 'דנה', lastName: 'לוי', yearsInCompany: 5,
    unit: 'צוות חשבונאות', department: 'כספים', role: 'מנהלת חשבונות',
    email: 'dana.levi@org.co.il', phone: '054-1234567',
    image: 'https://i.pravatar.cc/150?img=47',
    skills: ['Excel', 'SAP', 'דוחות כספיים', 'ביקורת פנימית'],
  },
  '1002': {
    id: '1002', firstName: 'יוסי', lastName: 'כהן', yearsInCompany: 3,
    unit: 'צוות גיוס', department: 'HR', role: 'רכז גיוס',
    email: 'yossi.cohen@org.co.il', phone: '052-2345678',
    image: 'https://i.pravatar.cc/150?img=12',
    skills: ['LinkedIn Recruiter', 'ראיונות עבודה', 'הערכת מועמדים'],
  },
  '1003': {
    id: '1003', firstName: 'מיכל', lastName: 'גולן', yearsInCompany: 4,
    unit: 'צוות פיתוח', department: 'IT', role: 'מפתחת Full Stack',
    email: 'michal.golan@org.co.il', phone: '050-3456789',
    image: 'https://i.pravatar.cc/150?img=32',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
  },
  '1004': {
    id: '1004', firstName: 'אבי', lastName: 'שפירא', yearsInCompany: 8,
    unit: 'צוות תקציב', department: 'כספים', role: 'מנהל תקציב',
    email: 'avi.shapira@org.co.il', phone: '054-4567890',
    image: 'https://i.pravatar.cc/150?img=51',
    skills: ['תכנון תקציבי', 'Excel', 'Power BI', 'ניתוח כלכלי'],
  },
  '1005': {
    id: '1005', firstName: 'רינת', lastName: 'ברק', yearsInCompany: 6,
    unit: 'הנהלת HR', department: 'HR', role: 'מנהלת HR',
    email: 'rinat.barak@org.co.il', phone: '052-5678901',
    image: 'https://i.pravatar.cc/150?img=44',
    skills: ['ניהול ארגוני', 'פיתוח עובדים', 'דיני עבודה', 'גיוס'],
  },
  '1006': {
    id: '1006', firstName: 'נועם', lastName: 'אלון', yearsInCompany: 7,
    unit: 'צוות ארכיטקטורה', department: 'IT', role: 'ארכיטקט מערכות',
    email: 'noam.alon@org.co.il', phone: '050-6789012',
    image: 'https://i.pravatar.cc/150?img=59',
    skills: ['System Design', 'Microservices', 'AWS', 'Kubernetes', 'CI/CD'],
  },
  '1007': {
    id: '1007', firstName: 'שירה', lastName: 'מזרחי', yearsInCompany: 2,
    unit: 'צוות חשבונאות', department: 'כספים', role: 'רואת חשבון',
    email: 'shira.mizrahi@org.co.il', phone: '054-7890123',
    image: 'https://i.pravatar.cc/150?img=38',
    skills: ['ביקורת', 'IFRS', 'הנהלת חשבונות', 'מס הכנסה'],
  },
  '1008': {
    id: '1008', firstName: 'גל', lastName: 'פרידמן', yearsInCompany: 1,
    unit: 'צוות פיתוח', department: 'IT', role: 'מפתח Backend',
    email: 'gal.friedman@org.co.il', phone: '050-8901234',
    image: 'https://i.pravatar.cc/150?img=15',
    skills: ['Python', 'FastAPI', 'Redis', 'PostgreSQL'],
  },
};

async function fetchEmployee(id: string): Promise<EmployeeProfile | null> {
  await new Promise((r) => setTimeout(r, 400));
  return PROFILES[id] ?? null;
}

class MFEErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', color: '#c00', background: '#fff0f0', borderRadius: '8px' }}>
          <strong>שגיאה בטעינת פרופיל עובד</strong>
          <pre style={{ fontSize: '12px', marginTop: '8px' }}>
            {(this.state.error as Error).message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const EmployeePortfolio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  useEffect(() => {
    if (!employeeId) return;
    const { setEmployee, setLoading } = useEmployeeStore.getState();
    setLoading(true);
    fetchEmployee(employeeId).then((data) => {
      setEmployee(data);
      setLoading(false);
    });
    return () => {
      useEmployeeStore.getState().setEmployee(null);
    };
  }, [employeeId]);

  return (
    <MFEErrorBoundary>
      <Suspense fallback={<div>טוען פרופיל עובד...</div>}>
        <EmployeePortfolioMFE />
      </Suspense>
    </MFEErrorBoundary>
  );
};

export default EmployeePortfolio;
