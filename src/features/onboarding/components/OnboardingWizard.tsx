import React, { useState, Suspense } from 'react';
import { PersonalDetailsStep } from './PersonalDetailsStep';
import type { ProfileDetails } from '../schema';
import { Loader2 } from 'lucide-react';

// Lazy load the SuccessStep since it's not needed on initial render
const SuccessStep = React.lazy(() => 
  import('./SuccessStep').then(module => ({ default: module.SuccessStep }))
);

export const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<ProfileDetails>>({});

  const handleNext = (data: ProfileDetails) => {
    setFormData(data);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  if (step === 2) {
    return (
      <Suspense 
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        }
      >
        <SuccessStep onBack={handleBack} />
      </Suspense>
    );
  }

  return (
    <PersonalDetailsStep 
      defaultValues={formData} 
      onNext={handleNext} 
    />
  );
};
