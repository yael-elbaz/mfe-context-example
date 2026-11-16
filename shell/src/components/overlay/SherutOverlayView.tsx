import React, { useEffect } from 'react';
import { useOverlayStore } from '../../store/overlayStore';
import ServiceOverlay, { type ServiceOverlayProps } from './ServiceOverlay';

interface Props extends ServiceOverlayProps {
  serviceId: string;
}

/**
 * שירות באוברליי. מרונדר בתוך ה-Outlet של DigitalObjectsPage (…/digital-objects/sherutim/:id),
 * כך שהאובייקטים הדיגיטליים שמתחת הם אותו מופע שהיה על המסך לפני הפתיחה — לא עותק חדש.
 * כאן רק החלון, והסימון שיש אוברליי פתוח (useOpenService חוסם אוברליי שני).
 */
const SherutOverlayView: React.FC<Props> = ({ serviceId, ...overlayProps }) => {
  const setOpen = useOverlayStore((s) => s.setOpen);

  // מסמן שיש אוברליי פתוח — כל עוד ה-route של השירות מוצג
  useEffect(() => {
    setOpen(serviceId);
    return () => setOpen(null);
  }, [serviceId, setOpen]);

  return <ServiceOverlay {...overlayProps} />;
};

export default SherutOverlayView;
