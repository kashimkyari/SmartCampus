import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, School, University, Settings, Globe } from "lucide-react";

interface InstitutionTypeStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const institutionTypes = [
  {
    id: "high-school",
    name: "High School",
    description: "Secondary education institution serving grades 9-12 with traditional subject-based curriculum and class scheduling.",
    icon: School,
    gradient: "from-blue-500 to-indigo-600",
    features: ["Form/Class Management", "Subject-based Timetabling", "Parent Portal Access"],
  },
  {
    id: "university",
    name: "University/College",
    description: "Higher education institution with faculties, departments, and program-based academic structure.",
    icon: University,
    gradient: "from-purple-500 to-pink-600",
    features: ["Faculty/Department Structure", "Credit-based System", "Research Management"],
  },
  {
    id: "technical",
    name: "Technical/Vocational School",
    description: "Specialized institution focusing on practical skills, workshops, and industry-specific training programs.",
    icon: Settings,
    gradient: "from-green-500 to-teal-600",
    features: ["Workshop Scheduling", "Equipment Management", "Industry Integration"],
  },
  {
    id: "international",
    name: "International School",
    description: "Multi-cultural institution offering international curricula with diverse educational systems and languages.",
    icon: Globe,
    gradient: "from-orange-500 to-red-600",
    features: ["Multi-language Support", "IB Program Integration", "Cultural Adaptations"],
  },
];

export default function InstitutionTypeStep({
  data,
  updateData,
  onNext,
  onPrev,
  isFirstStep,
}: InstitutionTypeStepProps) {
  const [selectedType, setSelectedType] = useState(data.institutionType || "");

  const handleSelection = (typeId: string) => {
    setSelectedType(typeId);
    updateData({ institutionType: typeId });
  };

  const handleNext = () => {
    if (selectedType) {
      onNext();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Select Your Institution Type</h2>
      <p className="text-secondary-600 mb-8">
        Choose the type that best describes your educational institution. This will customize the system features and interface accordingly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {institutionTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <div
              key={type.id}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all group ${
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"
              }`}
              onClick={() => handleSelection(type.id)}
            >
              <div className="flex items-start">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${type.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">{type.name}</h3>
                  <p className="text-secondary-600 text-sm mb-4">{type.description}</p>
                  <div className="text-xs text-secondary-500 space-y-1">
                    {type.features.map((feature, index) => (
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
          disabled={isFirstStep}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedType}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
