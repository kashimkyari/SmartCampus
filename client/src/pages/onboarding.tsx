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
import AdminUserStep from "@/components/onboarding/admin-user-step";
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
    // Check if any institution already exists (onboarding completed)
    const checkExistingInstitutions = async () => {
      try {
        const response = await fetch("/api/institutions/check");
        if (response.ok) {
          const data = await response.json();
          if (data.hasInstitutions) {
            // Institution exists, redirect to dashboard or login
            if (user && institution?.isConfigured) {
              setLocation("/dashboard");
            } else if (!user) {
              // Show login form instead of onboarding
              setLocation("/login");
            }
          }
        }
      } catch (error) {
        console.log("Initial setup mode - no institutions found");
      }
    };

    if (!isLoading) {
      // Redirect to dashboard if user is logged in and institution is configured
      if (user && institution?.isConfigured) {
        setLocation("/dashboard");
        return;
      }
      
      // Check for existing institutions only if no user is logged in
      if (!user) {
        checkExistingInstitutions();
      }
    }
  }, [user, institution, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero-pattern flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show initial setup screen if no user and no institution (first time setup) and haven't started onboarding
  if (!user && !institution && !isLoading && currentStep === 1) {
    return (
      <div className="min-h-screen bg-hero-pattern flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">Welcome to SmartCampus</h1>
            <p className="text-secondary-600 mb-6">Get started by configuring your educational institution management system.</p>
            <Button 
              className="w-full" 
              onClick={() => {
                // Proceed to onboarding for initial setup
                setCurrentStep(2); // Move to step 2 to show the actual onboarding
              }}
            >
              Get Started
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If user exists but no institution, continue with authenticated onboarding
  if (!user && institution) {
    return (
      <div className="min-h-screen bg-hero-pattern flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">Welcome to SmartCampus</h1>
            <p className="text-secondary-600 mb-6">Please log in to continue with the setup.</p>
            <Button className="w-full">
              Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Institution Type", component: InstitutionTypeStep },
    { number: 2, title: "Educational System", component: EducationSystemStep },
    { number: 3, title: "Institution Details", component: InstitutionDetailsStep },
    { number: 4, title: "Admin User", component: AdminUserStep },
    { number: 5, title: "Configuration", component: ConfigurationStep },
  ];

  const updateOnboardingData = (stepData: any) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length + 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Adjust step index for display (currentStep starts at 2 for actual onboarding)
  const stepIndex = currentStep - 2;
  const CurrentStepComponent = steps[stepIndex]?.component;

  // Show onboarding steps if currentStep > 1 (after Get Started is clicked)
  if (currentStep > 1) {
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
                      currentStep >= step.number + 1
                        ? "bg-white text-primary-600"
                        : "bg-primary-400 text-white"
                    }`}
                  >
                    <span className="font-semibold text-sm">{step.number}</span>
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      currentStep >= step.number + 1 ? "text-white" : "text-primary-200"
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
            isFirstStep={currentStep === 2}
            isLastStep={currentStep === steps.length + 1}
          />
        </Card>
      </div>
    </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center">
      <div className="text-white text-lg">Loading...</div>
    </div>
  );
}
