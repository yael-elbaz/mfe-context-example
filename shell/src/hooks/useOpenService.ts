import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flattenMeta, resolveRoute } from '../services/openService';
import type { Service } from '../types/openService';
import { useEmployeeStore } from '../store/employeeStore';

export const useOpenService = () => {
  const navigate = useNavigate();

  const openService = useCallback((meta: Service) => {
    const flat = flattenMeta(meta) as Record<string, any>;
    const currentEmployee = useEmployeeStore.getState().employee;

    if (!currentEmployee) {
      navigate('/select-employee', { state: { pendingSherut: flat } });
      return;
    }

    

    

    const { url, state } = resolveRoute({ ...flat, id: currentEmployee.id });
    navigate(url, { state });
  }, [navigate]);

  return { openService };
};
