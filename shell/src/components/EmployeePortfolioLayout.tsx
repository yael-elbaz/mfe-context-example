import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Outlet, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {useMatch } from 'react-router-dom';
import { useSelectedPersonStore, useCurrentEmployee, type EmployeeProfile } from '../store/personStore';
import { Helper } from '../utils/urlHelper';
import { getSherutMfeConfig, type SherutMfeConfig } from '../services/sherutimService';

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

const EmployeePortfolioLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const employeeId = Helper.getParam('employeeId', searchParams) ?? '';
  const employee = useCurrentEmployee();
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const sherutMatch = useMatch('/employee-portfolio/sherutim/:idntSheryut/*');
  const idntSheryut = sherutMatch?.params.idntSheryut ?? null;
  const [mfeConfig, setMfeConfig] = useState<SherutMfeConfig | null>(null);

  useEffect(() => {
    if (!idntSheryut) { setMfeConfig(null); return; }
    getSherutMfeConfig(idntSheryut).then(setMfeConfig);
  }, [idntSheryut]);

  useEffect(() => {
    if (!employeeId) return;
    const { setSelectedPerson, setIsLoadingPerson } = useSelectedPersonStore.getState();
    setLoading(true);
    setIsLoadingPerson(true);
    setNotFound(false);
    setTimeout(() => {
      const raw = PROFILES[employeeId] ?? null;
      if (!raw) {
        setLoading(false);
        setIsLoadingPerson(false);
        setNotFound(true);
        return;
      }
      setSelectedPerson({ type: 'employee', ...raw });
      setLoading(false);
      setIsLoadingPerson(false);
    }, 400);
  }, [employeeId]);

  // Clear store only when the layout fully unmounts, not on sub-route changes
  useEffect(() => {
    return () => {
      useSelectedPersonStore.getState().clearSelectedPerson();
      useSelectedPersonStore.getState().setIsLoadingPerson(false);
    };
  }, []);

  return (
    <div className="flex flex-col" dir="rtl">
      <div className="sticky top-24 z-10 bg-[#F0F2F8] pb-2">
        {loading ? (
          <div className="p-5 text-center text-[#888]">⏳ טוען...</div>
        ) : (
          <Suspense fallback={<div className="p-5">טוען פרופיל עובד...</div>}>
            <EmployeePortfolioMFE
              navigate={navigate}
              extendedTabDataUrl={mfeConfig?.extendedTabDataUrl}
              selectedActiveTab={mfeConfig?.selectedActiveTab}
            />
          </Suspense>
        )}
      </div>
      <div className="pt-6">
        {notFound ? (
          <div className="p-6 text-base text-right text-[#888]">
            עובד לא נמצא
          </div>
        ) : loading || !employee ? (
          <div className="p-12 text-center text-[#1E3BA2]" dir="rtl">
            ⏳ טוען נתוני עובד...
          </div>
        ) : (
          <Outlet context={{ mfeConfig }} />
        )}
      </div>
    </div>
  );
};

export default EmployeePortfolioLayout;
