import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flattenMeta, resolveRoute } from '../services/openService';
import type { Service, DigitalService, PersonType } from '../types/openService';
import type { SelectedPerson } from './useEmployeePickerPopup';
import { useSelectedPersonStore } from '../store/personStore';
import { useOverlayStore } from '../store/overlayStore';

export const useOpenService = (
  waitForEmployee: (objectType?: PersonType[] | null) => Promise<SelectedPerson | null>,
) => {
  const navigate = useNavigate();

  // שירות אוברליי מנווט כמו כל שירות — SherutDynamicView מחליט אם להציג אותו כדף מלא או באוברליי
  const navToServcie = useCallback(async (flat: DigitalService) => {
    const { url, state, openType, setup } = await resolveRoute(flat);

    switch (openType) {
      case 'blank':
        window.open(url, '_blank', setup ?? '');
        break;
      case 'navigate':
        navigate(url, { state });
        break;
    }
  }, [navigate]);

  const openService = useCallback(async (meta: Service) => {
    const flat = flattenMeta(meta) as DigitalService & Record<string, any>;

    // רק אוברליי אחד בכל פעם — לא מנווטים, החלון הפתוח מהבהב ומציג הודעה
    const overlay = useOverlayStore.getState();
    if (flat.isOverlay && overlay.openServiceId) {
      overlay.nudge();
      return;
    }

    const { person } = useSelectedPersonStore.getState();
    if (!person) {
      waitForEmployee(flat.objectType).then((selected) => {
        if (selected == null) return;
        const { idnt, personType } = selected;
        const personParam = `idnt${personType.charAt(0).toUpperCase() + personType.slice(1)}=${idnt}`;
        const flatWithPerson = {
          ...flat,
          personType,
          sherutimUrlParams: flat.sherutimUrlParams
            ? `${flat.sherutimUrlParams}&${personParam}`
            : personParam,
        };
        navToServcie(flatWithPerson);
      });
      return;
    }

    navToServcie(flat);
  }, [navToServcie, waitForEmployee]);

  return { openService, navToServcie };
};
