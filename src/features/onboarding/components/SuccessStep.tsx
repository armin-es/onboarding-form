import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { WizardLayout } from '../../../components/ui/wizard-layout';

interface SuccessStepProps {
  onBack: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onBack }) => {
  return (
    <WizardLayout 
      currentStep={2} 
      totalSteps={5} 
      title="Step 1 Complete"
      // removed onBack prop to hide the top-left chevron
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">Success!</h3>
          <p className="text-gray-500">
            Your personal details have been successfully saved.
          </p>
        </div>
        <Button 
          variant="outline"
          className="w-full max-w-xs"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Step 1
        </Button>
      </div>
    </WizardLayout>
  );
};
