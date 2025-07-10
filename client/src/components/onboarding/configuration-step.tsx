import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, Settings, Users, BookOpen, Calendar, Building } from "lucide-react";

interface ConfigurationStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function ConfigurationStep({
  data,
  onPrev,
}: ConfigurationStepProps) {
  const [, setLocation] = useLocation();
  const { user, setInstitution } = useAuth();
  const { toast } = useToast();
  const [selectedModules, setSelectedModules] = useState<string[]>([
    "timetable",
    "students",
    "staff",
    "courses",
  ]);

  const createInstitutionMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/institutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.institutionDetails.name,
          type: data.institutionType,
          educationSystem: data.educationSystem,
          location: data.institutionDetails.location,
          size: data.institutionDetails.size,
          structure: {
            modules: selectedModules,
            details: data.institutionDetails,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create institution");
      }

      return response.json();
    },
    onSuccess: async (institution) => {
      // Mark institution as configured
      const token = localStorage.getItem("token");
      await fetch(`/api/institutions/${institution.id}/configure`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInstitution({ ...institution, isConfigured: true });
      toast({
        title: "Institution Setup Complete!",
        description: "Your institution has been successfully configured.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete institution setup.",
        variant: "destructive",
      });
    },
  });

  const modules = [
    {
      id: "timetable",
      name: "Timetable Management",
      description: "Intelligent scheduling and timetable optimization",
      icon: Calendar,
      required: true,
    },
    {
      id: "students",
      name: "Student Management",
      description: "Student profiles, enrollment, and academic records",
      icon: Users,
      required: true,
    },
    {
      id: "staff",
      name: "Staff Management",
      description: "Faculty profiles, roles, and teaching assignments",
      icon: Users,
      required: true,
    },
    {
      id: "courses",
      name: "Course Management",
      description: "Course catalog, prerequisites, and curriculum planning",
      icon: BookOpen,
      required: true,
    },
    {
      id: "classrooms",
      name: "Facility Management",
      description: "Classroom allocation and resource booking",
      icon: Building,
      required: false,
    },
    {
      id: "assessment",
      name: "Assessment & Grading",
      description: "Grade management and assessment tracking",
      icon: Check,
      required: false,
    },
  ];

  const handleModuleToggle = (moduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedModules([...selectedModules, moduleId]);
    } else {
      setSelectedModules(selectedModules.filter((id) => id !== moduleId));
    }
  };

  const handleComplete = () => {
    createInstitutionMutation.mutate();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">System Configuration</h2>
      <p className="text-secondary-600 mb-8">
        Review your setup and select the modules you want to enable. You can always add more modules later 
        through the settings panel.
      </p>

      {/* Setup Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Setup Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-secondary-700">Institution Type:</span>
            <p className="text-secondary-600 capitalize">{data.institutionType?.replace("-", " ")}</p>
          </div>
          <div>
            <span className="font-medium text-secondary-700">Education System:</span>
            <p className="text-secondary-600 capitalize">{data.educationSystem}</p>
          </div>
          <div>
            <span className="font-medium text-secondary-700">Institution Name:</span>
            <p className="text-secondary-600">{data.institutionDetails?.name}</p>
          </div>
        </div>
      </div>

      {/* Module Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Select Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((module) => {
            const IconComponent = module.icon;
            const isSelected = selectedModules.includes(module.id);

            return (
              <div
                key={module.id}
                className="border border-gray-200 rounded-lg p-4 flex items-start space-x-3"
              >
                <Checkbox
                  id={module.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleModuleToggle(module.id, checked as boolean)}
                  disabled={module.required}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className="w-5 h-5 text-primary-600" />
                    <Label
                      htmlFor={module.id}
                      className="text-sm font-medium text-secondary-900 cursor-pointer"
                    >
                      {module.name}
                      {module.required && (
                        <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </Label>
                  </div>
                  <p className="text-xs text-secondary-600">{module.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Terms and Conditions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Important Notice</h4>
        <p className="text-sm text-blue-700 mb-4">
          This configuration will be locked after setup. You can modify most settings later, but changing 
          the institution type or education system will require contacting support.
        </p>
        <div className="flex items-start space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms" className="text-sm text-blue-700 cursor-pointer">
            I understand that this configuration will customize the entire system for my institution and 
            cannot be easily changed later.
          </Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrev}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Previous
        </Button>
        <Button
          onClick={handleComplete}
          disabled={createInstitutionMutation.isPending}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          {createInstitutionMutation.isPending ? "Setting up..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  );
}

function Label({ htmlFor, className, children, ...props }: { htmlFor: string; className?: string; children: React.ReactNode; [key: string]: any }) {
  return (
    <label htmlFor={htmlFor} className={className} {...props}>
      {children}
    </label>
  );
}
