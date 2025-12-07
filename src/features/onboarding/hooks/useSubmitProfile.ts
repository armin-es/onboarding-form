import { useMutation } from '@tanstack/react-query';
import { submitProfile } from '../api';
import type { ProfileDetails } from '../types';

export const useSubmitProfile = () => {
  return useMutation({
    mutationFn: (data: ProfileDetails) => submitProfile(data),
  });
};

