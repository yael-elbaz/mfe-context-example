import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * TEMP: בכל ניווט לכל מסך תחת /employee-portfolio או /customer-portfolio
 * (תיק עובד / תיק לקוח, כולל תתי-מסלולים)
 * נפתחת לשונית חדשה עם אותו URL אך על דומיין אחר, והלשונית הנוכחית מנווטת
 * חזרה לדף הבית (התיק עצמו לא מוצג כאן).
 *
 * עדכן את הדומיין כאן בלבד:
 */
const EXTERNAL_DOMAIN = 'https://REPLACE_ME.example.com';

const EmployeePortfolioExternalRedirect: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lastOpened = useRef<string | null>(null);

  const fullPath = location.pathname + location.search + location.hash;

  useEffect(() => {
    // dedupe: אותו URL (כולל StrictMode double-invoke) לא פותח לשונית פעמיים
    if (lastOpened.current === fullPath) return;
    lastOpened.current = fullPath;

    // האפליקציה הישנה (הדומיין החיצוני) פותחת שירות בלי מקטע "sherutim":
    // /employee-portfolio/sherutim/:idntSheryut  ->  /employee-portfolio/:idntSheryut
    // /customer-portfolio/sherutim/:idntSheryut  ->  /customer-portfolio/:idntSheryut
    const legacyPath = location.pathname.replace(
      /\/(employee-portfolio|customer-portfolio)\/sherutim\//,
      '/$1/'
    );

    const sameUrlOtherDomain =
      EXTERNAL_DOMAIN.replace(/\/$/, '') +
      legacyPath +
      location.search +
      location.hash;
    window.open(sameUrlOtherDomain, '_blank', 'noopener,noreferrer');

    // הלשונית הנוכחית חוזרת לדף הבית
    navigate('/', { replace: true });
  }, [fullPath, navigate]);

  return null;
};

export default EmployeePortfolioExternalRedirect;
