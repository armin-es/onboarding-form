import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';

interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  currentStep,
  totalSteps,
  title,
  children,
  onBack,
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 text-center text-sm font-medium text-gray-600">
        Step {currentStep} of {totalSteps}
      </div>
      
      <Card className="w-full max-w-xl shadow-lg border-0 sm:border sm:border-gray-200 relative">
        <CardHeader className="pb-8 relative">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute left-4 top-6 h-8 w-8 p-0 text-gray-500 hover:text-black"
              onClick={onBack}
              aria-label="Go back to previous step"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <CardTitle className="text-3xl font-normal">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};
