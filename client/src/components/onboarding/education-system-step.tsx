import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, BookOpen, Flag, Globe, Settings } from "lucide-react";

interface EducationSystemStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const educationSystems = [
  {
    id: "british",
    name: "British System",
    description: "GCSE, A-Levels, UK University structure with Key Stages and traditional grading system.",
    icon: Flag,
    gradient: "from-red-500 to-red-600",
    features: ["Key Stage Structure (KS3, KS4, KS5)", "GCSE & A-Level Integration", "UK Grade System", "Term Structure"],
  },
  {
    id: "american",
    name: "American System",
    description: "High School grades 9-12, College/University structure with GPA system and credit hours.",
    icon: Flag,
    gradient: "from-blue-500 to-blue-600",
    features: ["Grade 9-12 Structure", "GPA Calculation", "Credit Hours System", "Semester/Quarter Terms"],
  },
  {
    id: "ib",
    name: "International Baccalaureate (IB)",
    description: "IB Diploma Programme, Middle Years Programme, and Primary Years Programme structure.",
    icon: Globe,
    gradient: "from-green-500 to-green-600",
    features: ["DP, MYP, PYP Programs", "International Curriculum", "Holistic Assessment", "Global Perspective"],
  },
  {
    id: "custom",
    name: "Custom/Other Systems",
    description: "Flexible framework adaptable to regional requirements and custom educational structures.",
    icon: Settings,
    gradient: "from-purple-500 to-purple-600",
    features: ["Flexible Configuration", "Regional Adaptations", "Custom Grading", "Local Compliance"],
  },
];

export default function EducationSystemStep({
  data,
  updateData,
  onNext,
  onPrev,
  isFirstStep,
}: EducationSystemStepProps) {
  const [selectedSystem, setSelectedSystem] = useState(data.educationSystem || "");

  const handleSelection = (systemId: string) => {
    setSelectedSystem(systemId);
    updateData({ educationSystem: systemId });
  };

  const handleNext = () => {
    if (selectedSystem) {
      onNext();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Choose Educational System</h2>
      <p className="text-secondary-600 mb-8">
        Select the educational system that best matches your institution's curriculum and assessment structure. 
        This will configure grade levels, assessment methods, and academic calendar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {educationSystems.map((system) => {
          const IconComponent = system.icon;
          const isSelected = selectedSystem === system.id;

          return (
            <div
              key={system.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all group ${
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"
              }`}
              onClick={() => handleSelection(system.id)}
            >
              <div className="flex items-start">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${system.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">{system.name}</h3>
                  <p className="text-secondary-600 text-sm mb-4">{system.description}</p>
                  <div className="text-xs text-secondary-500 space-y-1">
                    {system.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  {isSelected && (
                    <div className="mt-4 flex items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        <Check className="w-3 h-3 mr-1" />
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
          onClick={handleNext}
          disabled={!selectedSystem}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
