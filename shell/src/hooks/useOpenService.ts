import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flattenMeta, resolveRoute } from '../services/openService';
import type { Service, DigitalService } from '../types/openService';
import { useEmployeeStore } from '../store/employeeStore';
import { waitForEmployeeSelect } from '../services/selectEmployeeSignal';

function withEmployeeId(url: string, employeeId: string): string {
  return url.includes('?') ? `${url}&employeeId=${employeeId}` : `${url}?employeeId=${employeeId}`;
}

export const useOpenService = () => {
  const navigate = useNavigate();

  const navToServcie = useCallback(async (flat: DigitalService, employeeId?: string) => {
    const { url, state, openType, setup } = await resolveRoute(flat);

    switch (openType) {
      case 'blank':
        window.open(url, '_blank', setup ?? '');
        break;
      case 'overlay':
      case 'navigate': {
        const finalUrl = employeeId ? withEmployeeId(url, employeeId) : url;
        navigate(finalUrl, { state });
        break;
      }
    }
  }, [navigate]);

  const openService = useCallback(async (meta: Service) => {
    const flat = flattenMeta(meta) as DigitalService & Record<string, any>;

    const currentEmployee = useEmployeeStore.getState().employee;
    if (!currentEmployee) {
      const id = await waitForEmployeeSelect(flat);
      if (!id) return;
      navToServcie(flat, id);
      return;
    }
    navToServcie(flat);
  }, [navToServcie]);

  return { openService, navToServcie };
};
