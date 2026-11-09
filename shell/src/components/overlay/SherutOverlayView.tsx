import React, { Suspense, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SECTIONS } from '../../employeeSections';
import { useSelectedPerson } from '../../store/personStore';
import { useOverlayStore } from '../../store/overlayStore';
import type { OpenService } from '../../types/openService';
import ServiceOverlay, { type ServiceOverlayProps } from './ServiceOverlay';

// במצב מלא — הסינון המורחב נפתח במקום, בלי ניווט (ב-Preview הוא מנווט למצב מלא וסוגר את האוברליי)
const DigitalObjects = SECTIONS.find((s) => s.id === 'digital-objects')!.Full;

interface Props extends ServiceOverlayProps {
  serviceId: string;
  portfolio: 'employee' | 'customer';
  openService?: OpenService;
}

/**
 * שירות באוברליי בתוך תיק: מתחת — האובייקטים הדיגיטליים של האדם במצב מלא (כרטיס העובד/לקוח הוא
 * ה-layout של התיק), מעל — חלון השירות. האובייקטים פעילים: הסינון נפתח במקום, הם יכולים לפתוח שירות
 * (אוברליי שני נחסם ב-useOpenService), ו"חזרה" / "התמקד" מנווטים — ולכן יוצאים מה-route וסוגרים את האוברליי.
 */
const SherutOverlayView: React.FC<Props> = ({ serviceId, portfolio, openService, ...overlayProps }) => {
  const person = useSelectedPerson();
  const navigate = useNavigate();
  const { search } = useLocation();
  const setOpen = useOverlayStore((s) => s.setOpen);

  // מסמן שיש אוברליי פתוח — כל עוד ה-route של השירות מוצג
  useEffect(() => {
    setOpen(serviceId);
    return () => setOpen(null);
  }, [serviceId, setOpen]);

  // "חזרה" — לדף הבית של התיק (כמו סגירת השירות). תצוגת iframe של אובייקט קיימת רק בתיק העובד.
  const backToPreview = () => navigate(`/${portfolio}-portfolio${search}`);
  const onFocusItem = portfolio === 'employee'
    ? (itemId: string, iframeUrl?: string) => navigate(`/employee-portfolio/digital-objects/${itemId}${search}`, { state: { iframeUrl } })
    : undefined;

  return (
    <>
      <Suspense fallback={<div className="p-5">טוען אובייקטים דיגיטליים...</div>}>
        <DigitalObjects
          openService={openService}
          employeeId={person?.id ?? ''}
          objectType={person?.type ?? null}
          backToPreview={backToPreview}
          onFocusItem={onFocusItem}
        />
      </Suspense>
      <ServiceOverlay {...overlayProps} />
    </>
  );
};

export default SherutOverlayView;
