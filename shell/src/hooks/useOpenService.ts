import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flattenMeta, resolveRoute } from '../services/openService';
import { openInBlank } from '../services/openInBlank';
import type { Service, DigitalService } from '../types/openService';
import { useEmployeeStore } from '../store/employeeStore';

export const useOpenService = () => {
  const navigate = useNavigate();

  const openService = useCallback((meta: Service) => {
    const flat = flattenMeta(meta) as DigitalService & Record<string, any>;

    const currentEmployee = useEmployeeStore.getState().employee;
    if (!currentEmployee) {
      navigate('/select-employee', { state: { pendingSherut: flat } });
      return;
    }

    if (flat.isTaregtBlank) {
      openInBlank(flat);
      return;
    }

    const { url, state } = resolveRoute({ ...flat, id: currentEmployee.id });
    navigate(url, { state });
  }, [navigate]);

  return { openService };
};
