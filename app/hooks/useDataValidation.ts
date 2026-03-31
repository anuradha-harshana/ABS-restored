// hooks/useDataValidation.ts
import { useState } from 'react';
import { z } from 'zod';
import { RegistrationData } from '@/app/types/forms';
import { getSupabaseBrowserClient } from '@/app/lib/supabase/browser-client';

// Define the validation schema
const registrationSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  
  lastName: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
  
  address: z.string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),
  
  vehicleModel: z.string()
    .min(1, "Vehicle model is required")
    .min(2, "Vehicle model must be at least 2 characters")
    .max(100, "Vehicle model must be less than 100 characters"),
  
  manuYear: z.string()
    .min(1, "Manufactured year is required")
    //.regex(/^\d{4}$/, "Invalid year format")
    .refine((year) => {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(year);
      return yearNum >= 1900 && yearNum <= currentYear;
    }, `Year must be between 1900 and ${new Date().getFullYear()}`),
  
  engineNumber: z.string()
    .min(1, "Engine number is required")
    .min(3, "Engine number must be at least 3 characters")
    .max(50, "Engine number must be less than 50 characters")
    .regex(/^[A-Za-z0-9\-]+$/, "Engine number can only contain letters, numbers, and hyphens"),
  
  chasisNumber: z.string()
    .min(1, "Chassis number is required")
    .min(3, "Chassis number must be at least 3 characters")
    .max(50, "Chassis number must be less than 50 characters")
    .regex(/^[A-Za-z0-9\-]+$/, "Chassis number can only contain letters, numbers, and hyphens"),
});

type ValidationErrors = {
  [K in keyof RegistrationData]?: string[];
};

interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

const useDataValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  // Function to check uniqueness in database
  const checkUniqueness = async (data: RegistrationData): Promise<ValidationErrors> => {
    const supabase = getSupabaseBrowserClient();
    const uniquenessErrors: ValidationErrors = {};

    try {
      // Check phone number uniqueness
      const { data: phoneData } = await supabase
        .from("Customers")
        .select("phoneNumber")
        .eq("phoneNumber", data.phoneNumber)
        .single();

      if (phoneData) {
        uniquenessErrors.phoneNumber = ["This phone number is already registered"];
      }

      // Check engine number uniqueness
      const { data: engineData } = await supabase
        .from("Vehicles")
        .select("engineNumber")
        .eq("engineNumber", data.engineNumber)
        .single();

      if (engineData) {
        uniquenessErrors.engineNumber = ["This engine number is already registered"];
      }

      // Check chassis number uniqueness
      const { data: chassisData } = await supabase
        .from("Vehicles")
        .select("chassisNumber")
        .eq("chassisNumber", data.chasisNumber)
        .single();

      if (chassisData) {
        uniquenessErrors.chasisNumber = ["This chassis number is already registered"];
      }

    } catch (error) {
      console.error("Error checking uniqueness:", error);
    }

    return uniquenessErrors;
  };

  // Validate a single field
  const validateField = (
    field: keyof RegistrationData,
    value: string
  ): string[] => {
    try {
      // Create a partial schema for the specific field
      const fieldSchema = z.object({
        [field]: registrationSchema.shape[field]
      });
      
      fieldSchema.parse({ [field]: value });
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues.map((issue) => issue.message);
      }
      return ["Invalid value"];
    }
  };

  // Validate all fields
  const validateAll = async (data: RegistrationData): Promise<ValidationResult> => {
    setIsValidating(true);
    const validationErrors: ValidationErrors = {};

    try {
      // Validate with Zod schema
      registrationSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof RegistrationData;
          if (!validationErrors[field]) {
            validationErrors[field] = [];
          }
          validationErrors[field]!.push(issue.message);
        });
      }
    }

    // Check uniqueness in database
    const uniquenessErrors = await checkUniqueness(data);
    
    // Merge validation errors with uniqueness errors
    Object.keys(uniquenessErrors).forEach((field) => {
      const fieldKey = field as keyof RegistrationData;
      if (!validationErrors[fieldKey]) {
        validationErrors[fieldKey] = [];
      }
      validationErrors[fieldKey] = [
        ...(validationErrors[fieldKey] || []),
        ...(uniquenessErrors[fieldKey] || [])
      ];
    });

    setErrors(validationErrors);
    setIsValidating(false);

    return {
      isValid: Object.keys(validationErrors).length === 0,
      errors: validationErrors,
    };
  };

  // Clear errors for a specific field
  const clearFieldError = (field: keyof RegistrationData) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Clear all errors
  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    isValidating,
    validateField,
    validateAll,
    clearFieldError,
    clearAllErrors,
    schema: registrationSchema,
  };
};

export default useDataValidation;