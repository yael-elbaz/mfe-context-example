import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flattenMeta, resolveRoute } from '../services/openService';
import type { ServiceMeta } from '../types/openService';

export const useOpenService = () => {
  const navigate = useNavigate();

  const openService = useCallback((meta: ServiceMeta) => {
    const flat = flattenMeta(meta);
    const { url, state } = resolveRoute(flat);
    navigate(url, { state });
  }, [navigate]);

  return { openService };
};
