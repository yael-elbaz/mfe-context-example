import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flattenMeta, resolveRoute } from '../services/openService';
import type { Service, DigitalService } from '../types/openService';
import { useEmployeeStore } from '../store/employeeStore';

export const useOpenService = () => {
  const navigate = useNavigate();

  const navToServcie = useCallback(async (flat: DigitalService) => {
    const { url, state, openType, setup } = await resolveRoute(flat);

    switch (openType) {
      case 'blank':
        window.open(url, '_blank', setup ?? '');
        break;
      case 'overlay':
        // TODO: open overlay
        navigate(url, { state });
        break;
      case 'navigate':
        navigate(url, { state });
        break;
    }
  }, [navigate])

  const openService = useCallback((meta: Service) => {
    const flat = flattenMeta(meta) as DigitalService & Record<string, any>;

    const currentEmployee = useEmployeeStore.getState().employee;
    if (!currentEmployee) {
      navigate('/select-employee', { state: { pendingSherut: flat } });
      return;
    }
    navToServcie(flat)

  }, [navigate]);

  return { openService, navToServcie };
};
