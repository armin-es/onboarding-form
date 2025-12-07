import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { WizardLayout } from '../../../components/ui/wizard-layout';
import { onboardingFormSchema } from '../schema';
import type { ProfileDetails } from '../schema';
import { useSubmitProfile } from '../hooks/useSubmitProfile';
import { AxiosError } from 'axios';

interface PersonalDetailsStepProps {
  defaultValues?: Partial<ProfileDetails>;
  onNext: (data: ProfileDetails) => void;
}

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({ 
  defaultValues, 
  onNext 
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProfileDetails>({
    resolver: zodResolver(onboardingFormSchema),
    mode: 'onBlur',
    defaultValues,
  });

  const { mutate: submit, isPending: isSubmitPending } = useSubmitProfile();

  const onSubmit = (data: ProfileDetails) => {
    submit(data, {
      onSuccess: () => {
        onNext(data);
      },
      onError: (error) => {
        if (error instanceof AxiosError && error.response?.data?.message) {
           setError('root', { 
             type: 'server', 
             message: error.response.data.message 
           });
        } else {
           setError('root', { 
             type: 'server', 
             message: 'An unexpected error occurred. Please try again.' 
           });
        }
      },
    });
  };

  return (
    <WizardLayout currentStep={1} totalSteps={5} title="Onboarding Form">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name Row */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder=""
              {...register('firstName')}
              error={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            <div className="min-h-[20px]">
              {errors.firstName && (
                <p id="firstName-error" className="text-sm text-red-500" role="alert">
                  {errors.firstName.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder=""
              {...register('lastName')}
              error={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            <div className="min-h-[20px]">
              {errors.lastName && (
                <p id="lastName-error" className="text-sm text-red-500" role="alert">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder=""
            {...register('phone')}
            error={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          <div className="min-h-[20px]">
            {errors.phone && (
              <p id="phone-error" className="text-sm text-red-500" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Corporation Number */}
        <div className="space-y-2">
          <Label htmlFor="corporationNumber">Corporation Number</Label>
          <Input
            id="corporationNumber"
            placeholder=""
            {...register('corporationNumber')}
            error={!!errors.corporationNumber}
            aria-describedby={errors.corporationNumber ? 'corporationNumber-error' : undefined}
          />
          <div className="min-h-[20px]">
            {errors.corporationNumber && (
              <p id="corporationNumber-error" className="text-sm text-red-500" role="alert">
                {errors.corporationNumber.message}
              </p>
            )}
          </div>
        </div>

        {/* Root API Error */}
        {errors.root && (
          <div 
            className="rounded-md bg-red-50 p-3 text-sm text-red-500 flex items-center gap-2" 
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4" />
            {errors.root.message}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full mt-2 bg-black hover:bg-gray-800 text-white rounded-md h-12 text-base"
          isLoading={isSubmitting || isSubmitPending}
          disabled={!isValid}
        >
          Submit <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </WizardLayout>
  );
};
