import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // Default: consider data fresh for 1 minute
      gcTime: 1000 * 60 * 5, // Default: keep unused cache for 5 minutes
    },
  },
});

