import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Outlet, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelectedPersonStore, useCurrentEmployee, type EmployeeProfile } from '../store/personStore';
import type { OpenService, PersonType } from '../types/openService';
import { Helper } from '../utils/urlHelper';

const EmployeePortfolioMFE = lazy(() => import('mfe_employee_portfolio/App'));
const SearchPersonMFE = lazy(() => import('mfe_search_employee/App'));

const PROFILES: Record<string, Omit<EmployeeProfile, 'type'>> = {
  '1001': { id: '1001', firstName: 'דנה',   lastName: 'לוי',     yearsInCompany: 5, unit: 'צוות חשבונאות',  department: 'כספים', role: 'מנהלת חשבונות',    email: 'dana.levi@org.co.il',    phone: '054-1234567', image: 'https://i.pravatar.cc/150?img=47', skills: ['Excel', 'SAP', 'דוחות כספיים', 'ביקורת פנימית'] },
  '1002': { id: '1002', firstName: 'יוסי',  lastName: 'כהן',     yearsInCompany: 3, unit: 'צוות גיוס',      department: 'HR',    role: 'רכז גיוס',         email: 'yossi.cohen@org.co.il',  phone: '052-2345678', image: 'https://i.pravatar.cc/150?img=12', skills: ['LinkedIn Recruiter', 'ראיונות עבודה', 'הערכת מועמדים'] },
  '1003': { id: '1003', firstName: 'מיכל',  lastName: 'גולן',    yearsInCompany: 4, unit: 'צוות פיתוח',     department: 'IT',    role: 'מפתחת Full Stack', email: 'michal.golan@org.co.il', phone: '050-3456789', image: 'https://i.pravatar.cc/150?img=32', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'] },
  '1004': { id: '1004', firstName: 'אבי',   lastName: 'שפירא',   yearsInCompany: 8, unit: 'צוות תקציב',     department: 'כספים', role: 'מנהל תקציב',       email: 'avi.shapira@org.co.il',  phone: '054-4567890', image: 'https://i.pravatar.cc/150?img=51', skills: ['תכנון תקציבי', 'Excel', 'Power BI', 'ניתוח כלכלי'] },
  '1005': { id: '1005', firstName: 'רינת',  lastName: 'ברק',     yearsInCompany: 6, unit: 'הנהלת HR',       department: 'HR',    role: 'מנהלת HR',         email: 'rinat.barak@org.co.il',  phone: '052-5678901', image: 'https://i.pravatar.cc/150?img=44', skills: ['ניהול ארגוני', 'פיתוח עובדים', 'דיני עבודה', 'גיוס'] },
  '1006': { id: '1006', firstName: 'נועם',  lastName: 'אלון',    yearsInCompany: 7, unit: 'צוות ארכיטקטורה', department: 'IT',  role: 'ארכיטקט מערכות',   email: 'noam.alon@org.co.il',    phone: '050-6789012', image: 'https://i.pravatar.cc/150?img=59', skills: ['System Design', 'Microservices', 'AWS', 'Kubernetes', 'CI/CD'] },
  '1007': { id: '1007', firstName: 'שירה',  lastName: 'מזרחי',   yearsInCompany: 2, unit: 'צוות חשבונאות',  department: 'כספים', role: 'רואת חשבון',       email: 'shira.mizrahi@org.co.il', phone: '054-7890123', image: 'https://i.pravatar.cc/150?img=38', skills: ['ביקורת', 'IFRS', 'הנהלת חשבונות', 'מס הכנסה'] },
  '1008': { id: '1008', firstName: 'גל',    lastName: 'פרידמן',  yearsInCompany: 1, unit: 'צוות פיתוח',     department: 'IT',    role: 'מפתח Backend',     email: 'gal.friedman@org.co.il', phone: '050-8901234', image: 'https://i.pravatar.cc/150?img=15', skills: ['Python', 'FastAPI', 'Redis', 'PostgreSQL'] },
};

const EmployeePortfolioLayout: React.FC<{ openService?: OpenService }> = ({ openService }) => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const employeeId = Helper.getParam('employeeId', searchParams) ?? '';
  const employee = useCurrentEmployee();
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const onSelected = useCallback((id: string, personType: PersonType) => {
    if (personType === 'customer') {
      navigate(`/customer-portfolio?customerId=${id}`);
      return;
    }
    const sherutMatch = pathname.match(/\/sherutim\/([^/?]+)/);
    if (sherutMatch) {
      navigate(`/employee-portfolio/sherutim/${sherutMatch[1]}?employeeId=${id}`);
    } else {
      navigate(`/employee-portfolio?employeeId=${id}`);
    }
  }, [pathname, navigate]);

  useEffect(() => {
    if (!employeeId) return;
    const { setSelectedPerson } = useSelectedPersonStore.getState();
    setLoading(true);
    setNotFound(false);
    setTimeout(() => {
      const raw = PROFILES[employeeId] ?? null;
      if (!raw) {
        setLoading(false);
        setNotFound(true);
        return;
      }
      setSelectedPerson({ type: 'employee', ...raw });
      setLoading(false);
    }, 400);
    return () => { useSelectedPersonStore.getState().clearSelectedPerson(); };
  }, [employeeId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'flex-start', direction: 'rtl' }}>
      <div style={{ width: '25%', flexShrink: 0, position: 'sticky', top: '108px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Suspense fallback={<div>טוען חיפוש...</div>}>
          <SearchPersonMFE onSelected={onSelected} />
        </Suspense>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#888' }}>⏳ טוען...</div>
        ) : (
          <Suspense fallback={<div>טוען פרופיל עובד...</div>}>
            <EmployeePortfolioMFE openService={openService} />
          </Suspense>
        )}
      </div>
      <div style={{ flex: 1 }}>
        {notFound ? (
          <div style={{ padding: '24px', color: '#888', fontSize: '16px', textAlign: 'right' }}>
            עובד לא נמצא
          </div>
        ) : loading || !employee ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#1E3BA2', direction: 'rtl' }}>
            ⏳ טוען נתוני עובד...
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default EmployeePortfolioLayout;
