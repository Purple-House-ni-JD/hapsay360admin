import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export const useOfficers = () => {
  return useQuery({
    queryKey: ['officers'],
    queryFn: async () => {
      const response = await api.get('officers/all');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch officers');
      return data.data; // Returns the officers array
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};