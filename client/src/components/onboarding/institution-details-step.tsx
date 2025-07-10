import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InstitutionDetailsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function InstitutionDetailsStep({
  data,
  updateData,
  onNext,
  onPrev,
}: InstitutionDetailsStepProps) {
  const [details, setDetails] = useState({
    name: data.institutionDetails?.name || "",
    location: data.institutionDetails?.location || "",
    size: data.institutionDetails?.size || "",
    establishedYear: data.institutionDetails?.establishedYear || "",
    description: data.institutionDetails?.description || "",
    website: data.institutionDetails?.website || "",
    phoneNumber: data.institutionDetails?.phoneNumber || "",
    email: data.institutionDetails?.email || "",
  });

  const handleInputChange = (field: string, value: string) => {
    const updatedDetails = { ...details, [field]: value };
    setDetails(updatedDetails);
    updateData({ institutionDetails: updatedDetails });
  };

  const handleNext = () => {
    if (details.name && details.location && details.size) {
      onNext();
    }
  };

  const isFormValid = details.name && details.location && details.size;

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Institution Details</h2>
      <p className="text-secondary-600 mb-8">
        Provide detailed information about your institution. This information will be used to customize 
        the system and generate reports.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-secondary-700">
              Institution Name *
            </Label>
            <Input
              id="name"
              value={details.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Cambridge International University"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-medium text-secondary-700">
              Location *
            </Label>
            <Input
              id="location"
              value={details.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Cambridge, UK"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="size" className="text-sm font-medium text-secondary-700">
              Institution Size *
            </Label>
            <Select value={details.size} onValueChange={(value) => handleInputChange("size", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select institution size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (Under 500 students)</SelectItem>
                <SelectItem value="medium">Medium (500-2000 students)</SelectItem>
                <SelectItem value="large">Large (2000-5000 students)</SelectItem>
                <SelectItem value="very-large">Very Large (Over 5000 students)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="establishedYear" className="text-sm font-medium text-secondary-700">
              Established Year
            </Label>
            <Input
              id="establishedYear"
              type="number"
              value={details.establishedYear}
              onChange={(e) => handleInputChange("establishedYear", e.target.value)}
              placeholder="e.g., 1990"
              className="mt-1"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="website" className="text-sm font-medium text-secondary-700">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={details.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="e.g., https://www.cambridge.edu"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-secondary-700">
              Official Email
            </Label>
            <Input
              id="email"
              type="email"
              value={details.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="e.g., admin@cambridge.edu"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-secondary-700">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={details.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder="e.g., +44 1234 567890"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-secondary-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={details.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of your institution..."
              className="mt-1 h-24"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Information Usage</h4>
        <p className="text-sm text-blue-700">
          This information will be used to customize dashboards, generate reports, and configure system settings. 
          All data is stored securely and can be updated later through the settings panel.
        </p>
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
          disabled={!isFormValid}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
