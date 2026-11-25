import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { Outlet, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {useMatch } from 'react-router-dom';
import { useSelectedPersonStore, useCurrentEmployee, type EmployeeProfile } from '../store/personStore';
import { Helper } from '../utils/urlHelper';
import { useClearUrlSearchOnChange } from '../hooks/useUrlSearch';
import { getSherutMfeConfig, type SherutMfeConfig } from '../services/sherutimService';
import SideNav from './SideNav';
import {
  PortfolioCloseButton,
  PortfolioHeaderFallback,
  PortfolioIdentity,
  PortfolioSwitchButton,
} from './EmployeePortfolioHeader';
import ConfirmDialog from './ConfirmDialog';
import { usePersonSwitch } from '../hooks/usePersonSwitch';

const EmployeePortfolioMFE = lazy(() => import('mfe_employee_portfolio/App'));
const SearchPersonMFE = lazy(() => import('mfe_search_employee/App'));

const PROFILES: Record<string, Omit<EmployeeProfile, 'type'>> = {
  '1001': { id: '1001', employeeNumber: '1001', tz: '034567891', firstName: 'דנה',   lastName: 'לוי',     yearsInCompany: 5, unit: 'צוות חשבונאות',  department: 'כספים', role: 'מנהלת חשבונות',    email: 'dana.levi@org.co.il',    phone: '054-1234567', image: 'https://i.pravatar.cc/150?img=47', skills: ['Excel', 'SAP', 'דוחות כספיים', 'ביקורת פנימית'] },
  '1002': { id: '1002', employeeNumber: '1002', tz: '205847392', firstName: 'יוסי',  lastName: 'כהן',     yearsInCompany: 3, unit: 'צוות גיוס',      department: 'HR',    role: 'רכז גיוס',         email: 'yossi.cohen@org.co.il',  phone: '052-2345678', image: 'https://i.pravatar.cc/150?img=12', skills: ['LinkedIn Recruiter', 'ראיונות עבודה', 'הערכת מועמדים'] },
  '1003': { id: '1003', employeeNumber: '1003', tz: '312658470', firstName: 'מיכל',  lastName: 'גולן',    yearsInCompany: 4, unit: 'צוות פיתוח',     department: 'IT',    role: 'מפתחת Full Stack', email: 'michal.golan@org.co.il', phone: '050-3456789', image: 'https://i.pravatar.cc/150?img=32', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'] },
  '1004': { id: '1004', employeeNumber: '1004', tz: '027391846', firstName: 'אבי',   lastName: 'שפירא',   yearsInCompany: 8, unit: 'צוות תקציב',     department: 'כספים', role: 'מנהל תקציב',       email: 'avi.shapira@org.co.il',  phone: '054-4567890', image: 'https://i.pravatar.cc/150?img=51', skills: ['תכנון תקציבי', 'Excel', 'Power BI', 'ניתוח כלכלי'] },
  '1005': { id: '1005', employeeNumber: '1005', tz: '058213647', firstName: 'רינת',  lastName: 'ברק',     yearsInCompany: 6, unit: 'הנהלת HR',       department: 'HR',    role: 'מנהלת HR',         email: 'rinat.barak@org.co.il',  phone: '052-5678901', image: 'https://i.pravatar.cc/150?img=44', skills: ['ניהול ארגוני', 'פיתוח עובדים', 'דיני עבודה', 'גיוס'] },
  '1006': { id: '1006', employeeNumber: '1006', tz: '301472958', firstName: 'נועם',  lastName: 'אלון',    yearsInCompany: 7, unit: 'צוות ארכיטקטורה', department: 'IT',  role: 'ארכיטקט מערכות',   email: 'noam.alon@org.co.il',    phone: '050-6789012', image: 'https://i.pravatar.cc/150?img=59', skills: ['System Design', 'Microservices', 'AWS', 'Kubernetes', 'CI/CD'] },
  '1007': { id: '1007', employeeNumber: '1007', tz: '209384715', firstName: 'שירה',  lastName: 'מזרחי',   yearsInCompany: 2, unit: 'צוות חשבונאות',  department: 'כספים', role: 'רואת חשבון',       email: 'shira.mizrahi@org.co.il', phone: '054-7890123', image: 'https://i.pravatar.cc/150?img=38', skills: ['ביקורת', 'IFRS', 'הנהלת חשבונות', 'מס הכנסה'] },
  '1008': { id: '1008', employeeNumber: '1008', tz: '318205496', firstName: 'גל',    lastName: 'פרידמן',  yearsInCompany: 1, unit: 'צוות פיתוח',     department: 'IT',    role: 'מפתח Backend',     email: 'gal.friedman@org.co.il', phone: '050-8901234', image: 'https://i.pravatar.cc/150?img=15', skills: ['Python', 'FastAPI', 'Redis', 'PostgreSQL'] },
  // עובדים לבדיקת עומס — הרבה נתונים בטאבים (ראו MOCK_TAB_DATA_BY_EMPLOYEE ב-mfe-employee-portfolio)
  '1009': { id: '1009', employeeNumber: '1009', tz: '036548127', firstName: 'עומר',  lastName: 'נחום',    yearsInCompany: 15, unit: 'מרחב צפון',     department: 'תפעול', role: 'ראש צוות תפעול',   email: 'omer.nahum@org.co.il',   phone: '052-9988776', image: 'https://i.pravatar.cc/150?img=68', skills: ['ניהול צוות', 'לוגיסטיקה', 'בטיחות'] },
  '1010': { id: '1010', employeeNumber: '1010', tz: '204417735', firstName: 'תמר',   lastName: 'אדלר',    yearsInCompany: 10, unit: 'אגף לוגיסטיקה', department: 'רכש',   role: 'אחראית תחום רכש',  email: 'tamar.adler@org.co.il',  phone: '054-1122334', image: 'https://i.pravatar.cc/150?img=26', skills: ['מכרזים', 'התקשרויות', 'רכש בינלאומי'] },
};

const EmployeePortfolioLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const employeeId = Helper.getParam('employeeId', searchParams) ?? '';
  const employee = useCurrentEmployee();
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useClearUrlSearchOnChange(employeeId);
  const { switchTo, confirmDialogProps } = usePersonSwitch('employee', employeeId);

  // שירות כדף מלא, או שירות אוברליי מעל האובייקטים הדיגיטליים
  const sherutPageMatch = useMatch('/employee-portfolio/sherutim/:idntSheryut/*');
  const sherutOverlayMatch = useMatch('/employee-portfolio/digital-objects/sherutim/:idntSheryut/*');
  const idntSheryut = (sherutPageMatch ?? sherutOverlayMatch)?.params.idntSheryut ?? null;
  // מקטע במצב מלא (/employee-portfolio/:section) — המסגרת בגובה קבוע והגלילה בתוך המקטע, לא בעמוד.
  // גם כשאוברליי פתוח מעל digital-objects — אחרת הגובה קופץ בפתיחה
  const isSectionFull = !!useMatch('/employee-portfolio/:section') || !!sherutOverlayMatch;
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
    const timer = setTimeout(() => {
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
    // החלפה מהירה A→B — הטעינה של A מבוטלת ולא דורסת את B בסטור (עם API אמיתי: AbortController)
    return () => clearTimeout(timer);
  }, [employeeId]);

  // Clear store only when the layout fully unmounts, not on sub-route changes
  useEffect(() => {
    return () => {
      useSelectedPersonStore.getState().clearSelectedPerson();
      useSelectedPersonStore.getState().setIsLoadingPerson(false);
    };
  }, []);

  const closePortfolio = () => navigate('/');

  return (
    <div className="mt-[72px] flex items-start gap-4" dir="rtl">
      {/* תפריט המערכת — ימין */}
      {/* גובה = המסך פחות ההדר, 16px מעליו ו-24px ריפוד תחתון של Padded */}
      <div className="sticky top-[calc(var(--header-height)_+_16px)] flex h-[calc(100vh_-_var(--header-height)_-_40px)] self-start">
        <SideNav />
      </div>

      {/* תיק העובד — שמאל */}
      <section className={`flex min-w-0 flex-1 flex-col ${
        isSectionFull ? 'h-[calc(100vh_-_var(--header-height)_-_40px)]' : 'min-h-[calc(100vh_-_var(--header-height)_-_40px)]'
      }`}>
        {/* סגירת התיק — שורה נפרדת מעל הכרטיס, צמודה לימין. לא sticky — רק הכרטיס נדבק */}
        <div className="mb-3 flex">
          <PortfolioCloseButton onClose={closePortfolio} />
        </div>

        {/* כרטיס התיק: שורה 1 — זהות | טאבים | החלפה, שורה 2 — המידע של הטאב הפעיל. נדבק לראש המסך בגלילה */}
        <div className="sticky top-[calc(var(--header-height)_+_16px)] z-20 rounded-xl border border-[#E2E8F0] bg-white drop-shadow-[0_2px_5px_rgba(0,3,61,0.06)]">
          {loading || notFound ? (
            <PortfolioHeaderFallback state={notFound ? 'notFound' : 'loading'} onSwitch={switchTo} />
          ) : (
            <Suspense fallback={<PortfolioHeaderFallback state="loading" onSwitch={switchTo} />}>
              <EmployeePortfolioMFE
                extendedTabDataUrl={mfeConfig?.extendedTabDataUrl}
                selectedActiveTab={mfeConfig?.selectedActiveTab}
                headerEnd={<PortfolioIdentity person={employee} />}
                headerStart={<PortfolioSwitchButton onSwitch={switchTo} />}
              />
            </Suspense>
          )}
        </div>

        {/* גוף התיק — 24px מתחת לכרטיס, ישירות על רקע העמוד */}
        {/* min-h-0 לאורך השרשרת — כדי שבמצב מלא המקטע יתכווץ לגובה שנותר ויגלול בפנים */}
        {/* בטעינה / עובד לא נמצא — ריק; ההודעה והסקלטון מוצגים רק בכרטיס */}
        <div className="mt-6 flex min-h-0 min-w-0 flex-1 flex-col">
          {!notFound && !loading && employee && (
            // key — במעבר לעובד אחר התוכן נבנה מחדש ולא נשאר בו state של העובד הקודם
            <div key={employeeId} className="flex min-h-0 flex-1 flex-col [&>*]:min-h-0 [&>*]:flex-1">
              <Outlet context={{ mfeConfig }} />
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
};

export default EmployeePortfolioLayout;
