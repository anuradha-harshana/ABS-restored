// CustomerRegistrationForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RegistrationData } from "@/app/types/forms"
import CustomerDetailsView from "./CustomerDetailsView"
import generatePdf from "../../hooks/generatePdf"
import insertData from "../../hooks/insertData"
import useDataValidation from "../../hooks/useDataValidation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

const CustomerRegistrationForm = () => {
  const [customer, setCustomer] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
    vehicleModel: "",
    manuYear: "",
    engineNumber: "",
    chasisNumber: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  const { 
    errors, 
    isValidating, 
    validateField, 
    validateAll,
    clearFieldError,
    clearAllErrors
  } = useDataValidation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate all fields including uniqueness
    const validationResult = await validateAll(customer);
    
    if (!validationResult.isValid) {
      // Scroll to first error
      const firstErrorField = Object.keys(validationResult.errors)[0];
      const errorElement = document.getElementById(`field-${firstErrorField}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Only proceed with database insertion if validation passed
      const error = await insertData(customer);
      
      if (error) {
        console.error("Failed to save to database:", error);
        
        // Handle database errors
        if (error.message?.includes("duplicate") || error.code === "23505") {
          setSubmitError("One or more fields (Phone Number, Engine Number, or Chassis Number) already exist in our system. Please use unique values.");
          // Re-run validation to highlight the duplicate fields
          await validateAll(customer);
        } else {
          setSubmitError("Failed to save customer data. Please try again.");
        }
      } else {
        console.log("Customer saved successfully!");
        await generatePdf(customer);
        setSubmitSuccess(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setCustomer({
            firstName: "",
            lastName: "",
            address: "",
            phoneNumber: "",
            vehicleModel: "",
            manuYear: "",
            engineNumber: "",
            chasisNumber: ""
          });
          clearAllErrors(); // Clear all validation errors
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error in submission:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }))
    clearFieldError(field)
    setSubmitError(null)
  }

  const handleBlur = (field: keyof RegistrationData, value: string) => {
    if (value) {
      validateField(field, value);
    }
  }

  const getFieldError = (field: keyof RegistrationData): string | undefined => {
    return errors[field]?.[0];
  }

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-10 text-gray-800">
          Customer Registration System
        </h1>
        
        {/* Success Alert */}
        {submitSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-500 text-green-800 text-base">
            <CheckCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              Customer registered successfully! PDF has been downloaded.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error Alert */}
        {submitError && (
          <Alert className="mb-6 bg-red-50 border-red-500 text-red-800 text-base">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              {submitError}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              <legend className="text-3xl font-semibold mb-8 text-gray-800 border-b pb-3">
                Registration Form
              </legend>
              
              <Card className="mb-8 border-2 border-blue-400">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-blue-800">
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="field-firstName">
                      <Field>
                        <FieldLabel htmlFor="first_name" className="text-base font-semibold mb-2 block">
                          First Name <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="first_name"
                          value={customer.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          onBlur={(e) => handleBlur('firstName', e.target.value)}
                          placeholder="Enter first name"
                          className={`text-base py-3 px-4 ${getFieldError('firstName') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('firstName') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('firstName')}</p>
                        )}
                      </Field>
                    </div>
                    
                    <div id="field-lastName">
                      <Field>
                        <FieldLabel htmlFor="last_name" className="text-base font-semibold mb-2 block">
                          Last Name <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="last_name"
                          value={customer.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          onBlur={(e) => handleBlur('lastName', e.target.value)}
                          placeholder="Enter last name"
                          className={`text-base py-3 px-4 ${getFieldError('lastName') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('lastName') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('lastName')}</p>
                        )}
                      </Field>
                    </div>
                    
                    <div id="field-address" className="md:col-span-2">
                      <Field>
                        <FieldLabel htmlFor="address" className="text-base font-semibold mb-2 block">
                          Address <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="address"
                          value={customer.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          onBlur={(e) => handleBlur('address', e.target.value)}
                          placeholder="Enter full address"
                          className={`text-base py-3 px-4 ${getFieldError('address') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('address') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('address')}</p>
                        )}
                      </Field>
                    </div>
                    
                    <div id="field-phoneNumber">
                      <Field>
                        <FieldLabel htmlFor="phone" className="text-base font-semibold mb-2 block">
                          Phone Number <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="phone"
                          value={customer.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          onBlur={(e) => handleBlur('phoneNumber', e.target.value)}
                          placeholder="Enter phone number"
                          className={`text-base py-3 px-4 ${getFieldError('phoneNumber') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('phoneNumber') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('phoneNumber')}</p>
                        )}
                      </Field>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8 border-2 border-blue-400">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-blue-800">
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="field-vehicleModel">
                      <Field>
                        <FieldLabel htmlFor="vehicle_model" className="text-base font-semibold mb-2 block">
                          Vehicle Model <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="vehicle_model"
                          value={customer.vehicleModel}
                          onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                          onBlur={(e) => handleBlur('vehicleModel', e.target.value)}
                          placeholder="e.g., Toyota Corolla"
                          className={`text-base py-3 px-4 ${getFieldError('vehicleModel') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('vehicleModel') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('vehicleModel')}</p>
                        )}
                      </Field>
                    </div>
                    
                    <div id="field-manuYear">
                      <Field>
                        <FieldLabel htmlFor="manu_year" className="text-base font-semibold mb-2 block">
                          Manufactured Year <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input 
                          type="date"
                          id="manu_year"
                          value={customer.manuYear}
                          onChange={(e) => handleInputChange('manuYear', e.target.value)}
                          onBlur={(e) => handleBlur('manuYear', e.target.value)}
                          className={`text-base py-3 px-4 ${getFieldError('manuYear') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('manuYear') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('manuYear')}</p>
                        )}
                      </Field>
                    </div>
                    
                    <div id="field-engineNumber">
                      <Field>
                        <FieldLabel htmlFor="engine_number" className="text-base font-semibold mb-2 block">
                          Engine Number <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="engine_number"
                          value={customer.engineNumber}
                          onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                          onBlur={(e) => handleBlur('engineNumber', e.target.value)}
                          placeholder="Enter engine number"
                          className={`text-base py-3 px-4 ${getFieldError('engineNumber') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('engineNumber') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('engineNumber')}</p>
                        )}
                      </Field>
                    </div>
                    
                    <div id="field-chasisNumber">
                      <Field>
                        <FieldLabel htmlFor="chasis_number" className="text-base font-semibold mb-2 block">
                          Chassis Number <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="chasis_number"
                          value={customer.chasisNumber}
                          onChange={(e) => handleInputChange('chasisNumber', e.target.value)}
                          onBlur={(e) => handleBlur('chasisNumber', e.target.value)}
                          placeholder="Enter chassis number"
                          className={`text-base py-3 px-4 ${getFieldError('chasisNumber') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('chasisNumber') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('chasisNumber')}</p>
                        )}
                      </Field>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Button 
                variant="outline" 
                type="submit"
                disabled={isSubmitting || isValidating || hasErrors}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || isValidating ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Generate PDF & Save'
                )}
              </Button>
            </form>
          </div>

          {/* Live Preview Section */}
          <div className="bg-gray-100 rounded-lg shadow-lg overflow-y-auto max-h-screen sticky top-6">
            <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">Live Preview</h2>
            </div>
            <div className="p-6">
              <CustomerDetailsView customer={customer} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerRegistrationForm