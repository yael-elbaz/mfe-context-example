import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flattenMeta, resolveRoute } from '../services/openService';
import type { Service, DigitalService } from '../types/openService';
import { useEmployeeStore } from '../store/employeeStore';
import { waitForEmployeeSelect } from '../services/selectEmployeeSignal';

function withEmployeeId(url: string, employeeId: string): string {
  return url.includes('?') ? `${url}&employeeId=${employeeId}` : `${url}?employeeId=${employeeId}`;
}

export const useOpenService = (waitForEmployee: (objectType?: string | string[] | null) => Promise<string | null>) => {
  const navigate = useNavigate();

  const navToServcie = useCallback(async (flat: DigitalService, employeeId?: string) => {
    const { url, state, openType, setup } = await resolveRoute(flat);

    switch (openType) {
      case 'blank':
        window.open(url, '_blank', setup ?? '');
        break;
      case 'overlay':
        navigate(url, { state });
        break;
      case 'navigate':
        navigate(url, { state });
        break;
      }
    // }
  }, [navigate]);

  const openService = useCallback(async (meta: Service) => {
    const flat = flattenMeta(meta) as DigitalService & Record<string, any>;

    const currentEmployee = useEmployeeStore.getState().employee;
    if (!currentEmployee) {
      waitForEmployee(flat.objectType).then((idntEmployee) => {
        if (idntEmployee == null) return;
        const flatWithEmployee = {
          ...flat,
          sherutimUrlParams: flat.sherutimUrlParams
            ? `${flat.sherutimUrlParams}&idntEmployee=${idntEmployee}`
            : `idntEmployee=${idntEmployee}`,
        };
        navToServcie(flatWithEmployee);
      });
      return;
    }

    navToServcie(flat);
  }, [navigate, waitForEmployee]);

  return { openService, navToServcie };
};
