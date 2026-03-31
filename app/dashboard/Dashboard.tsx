"use client"

import { useState } from "react"
import { AuthProps } from "../types/user";
import CustomerRegistrationForm from "../components/Forms/CustomerRegistrationForm";
import CompanyRegistrationForm from "../components/Forms/CompanyRegistrationForm";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const Dashboard = ({ user }: AuthProps) => {
  const [formType, setFormType] = useState<"Customer" | "Company">("Customer");

  const handleFormTypeChange = (value: string) => {
    if (value === "Customer" || value === "Company") {
      setFormType(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        {/* Toggle Section */}
        <div className="flex justify-center mb-8">
          <ToggleGroup 
            variant="outline" 
            type="single" 
            value={formType}
            onValueChange={handleFormTypeChange}
            className="bg-white shadow-sm rounded-lg p-1"
          >
            <ToggleGroupItem 
              value="Customer" 
              aria-label="Customer Registration"
              className="px-8 py-3 text-base font-semibold data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600 transition-all duration-200"
            >
              Customer Registration
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="Company" 
              aria-label="Company Registration"
              className="px-8 py-3 text-base font-semibold data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:border-blue-600 transition-all duration-200"
            >
              Company Registration
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Form Section */}
        <div className="mt-6">
          {formType === "Customer" ? (
            <CustomerRegistrationForm />
          ) : (
            <CompanyRegistrationForm /> 
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;