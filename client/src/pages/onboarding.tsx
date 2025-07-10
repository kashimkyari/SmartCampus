import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GraduationCap } from "lucide-react";
import InstitutionTypeStep from "@/components/onboarding/institution-type-step";
import EducationSystemStep from "@/components/onboarding/education-system-step";
import InstitutionDetailsStep from "@/components/onboarding/institution-details-step";
import ConfigurationStep from "@/components/onboarding/configuration-step";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, institution, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    institutionType: "",
    educationSystem: "",
    institutionDetails: {},
    configuration: {},
  });

  useEffect(() => {
    // Redirect to dashboard if institution is already configured
    if (institution?.isConfigured) {
      setLocation("/dashboard");
    }
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      // You can add a login page and redirect there
      console.log("User not authenticated");
    }
  }, [user, institution, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-pattern flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-hero-pattern flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">Welcome to SmartCampus</h1>
            <p className="text-secondary-600 mb-6">Please log in to continue with the setup.</p>
            <Button className="w-full">Login</Button>
          </div>
        </Card>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Institution Type", component: InstitutionTypeStep },
    { number: 2, title: "Educational System", component: EducationSystemStep },
    { number: 3, title: "Institution Details", component: InstitutionDetailsStep },
    { number: 4, title: "Configuration", component: ConfigurationStep },
  ];

  const updateOnboardingData = (stepData: any) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-hero-pattern p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCap className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to SmartCampus</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            Let's set up your educational institution management system. This one-time configuration 
            will customize the platform for your specific needs.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step.number
                        ? "bg-white text-primary-600"
                        : "bg-primary-400 text-white"
                    }`}
                  >
                    <span className="font-semibold text-sm">{step.number}</span>
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep >= step.number ? "text-white" : "text-primary-200"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-1 bg-primary-400 rounded ml-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white rounded-xl shadow-2xl p-8">
          <CurrentStepComponent
            data={onboardingData}
            updateData={updateOnboardingData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === steps.length}
          />
        </Card>
      </div>
    </div>
  );
}
