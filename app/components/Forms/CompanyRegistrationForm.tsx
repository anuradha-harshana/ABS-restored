// CompanyRegistrationForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CompanyRegistrationData, DatabaseError } from "@/app/types/forms"
import generatePdf from "../../hooks/generatePdf"
import insertCompanyData from "../../hooks/insertCompanyData"
import useCompanyDataValidation from "../../hooks/useCompanyDataValidation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import CompanyDialog from "../Company/CompanyDialog"

const CompanyRegistrationForm = () => {
  const [company, setCompany] = useState<CompanyRegistrationData>({
    companyName: "",
    companyAddress: "",
    vatRegistrationNumber: "",
    brNumber: "",
    companyContact: "",
    companyEmail: "",
    vehicleModel: "",
    manuYear: "",
    engineNumber: "",
    chasisNumber: "",
    color: "",
    basePrice: "",
    vat: "",
    registrationFee: "",
    discount: "",
    advancePayment: "",
    paymentMethod: "",
    balanceDue: ""
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
  } = useCompanyDataValidation()

  const handleFormSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);
    
    try {
      const validationResult = await validateAll(company);
      
      if (!validationResult.isValid) {
        const firstErrorField = Object.keys(validationResult.errors)[0];
        const errorElement = document.getElementById(`field-${firstErrorField}`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setSubmitError("Please fix the validation errors before submitting.");
        setIsSubmitting(false);
        return; 
      }
      
      const error = await insertCompanyData(company);
      
      if (error) {
        console.error("Failed to save to database:", error);
        const dbError = error as DatabaseError;
        if (dbError.message?.includes("duplicate") || dbError.code === "23505") {
          setSubmitError("One or more fields (VAT Registration Number, BR Number, Engine Number, or Chassis Number) already exist in our system. Please use unique values.");
          await validateAll(company);
        } else {
          setSubmitError("Failed to save company data. Please try again.");
        }
        setIsSubmitting(false);
        return; 
      } else {
        console.log("Company saved successfully!");
        setSubmitSuccess(true);
        
        setTimeout(() => {
          setCompany({
            companyName: "",
            companyAddress: "",
            vatRegistrationNumber: "",
            brNumber: "",
            companyContact: "",
            companyEmail: "",
            vehicleModel: "",
            manuYear: "",
            engineNumber: "",
            chasisNumber: "",
            color: "",
            basePrice: "",
            vat: "",
            registrationFee: "",
            discount: "",
            advancePayment: "",
            paymentMethod: "",
            balanceDue: ""
          });
          clearAllErrors();
          setSubmitSuccess(false);
        }, 1000);
        
        const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]');
        if (closeButton) (closeButton as HTMLButtonElement).click();
        
        setIsSubmitting(false);
        return; 
      }
    } catch (error) {
      console.error("Error in submission:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
      return; 
    }
  };

  const handleInputChange = (field: keyof CompanyRegistrationData, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }))
    clearFieldError(field)
    setSubmitError(null)
  }

  const handleBlur = (field: keyof CompanyRegistrationData, value: string) => {
    if (value) {
      validateField(field, value);
    }
  }

  const getFieldError = (field: keyof CompanyRegistrationData): string | undefined => {
    return errors[field]?.[0];
  }

  const calculateTotal = () => {
    const basePrice = parseFloat(company.basePrice) || 0;
    const vat = parseFloat(company.vat) || 0;
    const registrationFee = parseFloat(company.registrationFee) || 0;
    const discount = parseFloat(company.discount) || 0;
    const advancePayment = parseFloat(company.advancePayment) || 0;
    
    const subtotal = basePrice + vat + registrationFee;
    const totalAfterDiscount = subtotal - discount;
    const balanceDue = totalAfterDiscount - advancePayment;
    
    return {
      subtotal,
      totalAfterDiscount,
      balanceDue
    };
  };

  const updateBalanceDue = () => {
    const { balanceDue } = calculateTotal();
    setCompany(prev => ({ ...prev, balanceDue: balanceDue.toString() }));
  };

  const handleNumberChange = (field: keyof CompanyRegistrationData, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }));
    setTimeout(updateBalanceDue, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-10 text-gray-800">
          Company Registration
        </h1>
        
        {/* Success Alert */}
        {submitSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-500 text-green-800 text-base">
            <CheckCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              Company registered successfully! PDF has been downloaded.
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
        
        <form>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Company and Vehicle Details */}
            <div className="space-y-8">
              {/* Company Details Card */}
              <Card className="border-2 border-blue-400">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-blue-800">
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="field-companyName" className="md:col-span-2">
                      <Field>
                        <FieldLabel htmlFor="company_name" className="text-base font-semibold mb-2 block">
                          Company Name <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="company_name"
                          value={company.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          onBlur={(e) => handleBlur('companyName', e.target.value)}
                          placeholder="Enter company name"
                          className={`text-base py-3 px-4 ${getFieldError('companyName') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('companyName') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('companyName')}</p>
                        )}
                      </Field>
                    </div>
                    
                    <div id="field-companyAddress" className="md:col-span-2">
                      <Field>
                        <FieldLabel htmlFor="company_address" className="text-base font-semibold mb-2 block">
                          Company Address <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="company_address"
                          value={company.companyAddress}
                          onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                          onBlur={(e) => handleBlur('companyAddress', e.target.value)}
                          placeholder="Enter company address"
                          className={`text-base py-3 px-4 ${getFieldError('companyAddress') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('companyAddress') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('companyAddress')}</p>
                        )}
                      </Field>
                    </div>
                    
                    <div id="field-vatRegistrationNumber">
                      <Field>
                        <FieldLabel htmlFor="vat_registration_number" className="text-base font-semibold mb-2 block">
                          VAT Registration Number <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="vat_registration_number"
                          value={company.vatRegistrationNumber}
                          onChange={(e) => handleInputChange('vatRegistrationNumber', e.target.value)}
                          onBlur={(e) => handleBlur('vatRegistrationNumber', e.target.value)}
                          placeholder="Enter VAT registration number"
                          className={`text-base py-3 px-4 ${getFieldError('vatRegistrationNumber') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('vatRegistrationNumber') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('vatRegistrationNumber')}</p>
                        )}
                      </Field>
                    </div>

                    <div id="field-brNumber">
                      <Field>
                        <FieldLabel htmlFor="br_number" className="text-base font-semibold mb-2 block">
                          BR Number <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="br_number"
                          value={company.brNumber}
                          onChange={(e) => handleInputChange('brNumber', e.target.value)}
                          onBlur={(e) => handleBlur('brNumber', e.target.value)}
                          placeholder="Enter Business Registration Number"
                          className={`text-base py-3 px-4 ${getFieldError('brNumber') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('brNumber') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('brNumber')}</p>
                        )}
                      </Field>
                    </div>

                    <div id="field-companyContact">
                      <Field>
                        <FieldLabel htmlFor="company_contact" className="text-base font-semibold mb-2 block">
                          Company Contact <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="company_contact"
                          value={company.companyContact}
                          onChange={(e) => handleInputChange('companyContact', e.target.value)}
                          onBlur={(e) => handleBlur('companyContact', e.target.value)}
                          placeholder="Enter contact number"
                          className={`text-base py-3 px-4 ${getFieldError('companyContact') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('companyContact') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('companyContact')}</p>
                        )}
                      </Field>
                    </div>

                    <div id="field-companyEmail">
                      <Field>
                        <FieldLabel htmlFor="company_email" className="text-base font-semibold mb-2 block">
                          Company Email <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="email"
                          id="company_email"
                          value={company.companyEmail}
                          onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                          onBlur={(e) => handleBlur('companyEmail', e.target.value)}
                          placeholder="Enter company email"
                          className={`text-base py-3 px-4 ${getFieldError('companyEmail') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('companyEmail') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('companyEmail')}</p>
                        )}
                      </Field>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Details Card */}
              <Card className="border-2 border-blue-400">
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
                          value={company.vehicleModel}
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
                          value={company.manuYear}
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

                    <div id="field-color">
                      <Field>
                        <FieldLabel htmlFor="color" className="text-base font-semibold mb-2 block">
                          Vehicle Color <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="color"
                          value={company.color}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                          onBlur={(e) => handleBlur('color', e.target.value)}
                          placeholder="e.g., Red, Blue, Black"
                          className={`text-base py-3 px-4 ${getFieldError('color') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('color') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('color')}</p>
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
                          value={company.engineNumber}
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
                          value={company.chasisNumber}
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
            </div>

            {/* Right Column - Payment Details */}
            <div className="space-y-8">
              {/* Payment Details Card */}
              <Card className="border-2 border-green-400">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-green-800">
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div id="field-paymentMethod">
                      <Field>
                        <FieldLabel htmlFor="paymentMethod" className="text-base font-semibold mb-2 block">
                          Payment Method <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="text"
                          id="paymentMethod"
                          value={company.paymentMethod}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                          onBlur={(e) => handleBlur('paymentMethod', e.target.value)}
                          placeholder="Enter payment method"
                          className={`text-base py-3 px-4 ${getFieldError('paymentMethod') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('paymentMethod') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('paymentMethod')}</p>
                        )}
                      </Field>
                    </div>
                    <div id="field-basePrice">
                      <Field>
                        <FieldLabel htmlFor="base_price" className="text-base font-semibold mb-2 block">
                          Base Price (LKR) <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="number"
                          id="base_price"
                          value={company.basePrice}
                          onChange={(e) => handleNumberChange('basePrice', e.target.value)}
                          onBlur={(e) => handleBlur('basePrice', e.target.value)}
                          placeholder="Enter base price"
                          className={`text-base py-3 px-4 ${getFieldError('basePrice') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('basePrice') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('basePrice')}</p>
                        )}
                      </Field>
                    </div>

                    <div id="field-vat">
                      <Field>
                        <FieldLabel htmlFor="vat" className="text-base font-semibold mb-2 block">
                          VAT (LKR) <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="number"
                          id="vat"
                          value={company.vat}
                          onChange={(e) => handleNumberChange('vat', e.target.value)}
                          onBlur={(e) => handleBlur('vat', e.target.value)}
                          placeholder="Enter VAT amount"
                          className={`text-base py-3 px-4 ${getFieldError('vat') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('vat') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('vat')}</p>
                        )}
                      </Field>
                    </div>

                    <div id="field-registrationFee">
                      <Field>
                        <FieldLabel htmlFor="registration_fee" className="text-base font-semibold mb-2 block">
                          Registration Fee (LKR) <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="number"
                          id="registration_fee"
                          value={company.registrationFee}
                          onChange={(e) => handleNumberChange('registrationFee', e.target.value)}
                          onBlur={(e) => handleBlur('registrationFee', e.target.value)}
                          placeholder="Enter registration fee"
                          className={`text-base py-3 px-4 ${getFieldError('registrationFee') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('registrationFee') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('registrationFee')}</p>
                        )}
                      </Field>
                    </div>

                    <div id="field-discount">
                      <Field>
                        <FieldLabel htmlFor="discount" className="text-base font-semibold mb-2 block">
                          Discount (LKR)
                        </FieldLabel>
                        <Input
                          type="number"
                          id="discount"
                          value={company.discount}
                          onChange={(e) => handleNumberChange('discount', e.target.value)}
                          onBlur={(e) => handleBlur('discount', e.target.value)}
                          placeholder="Enter discount amount"
                          className={`text-base py-3 px-4 ${getFieldError('discount') ? 'border-red-500' : ''}`}
                        />
                        {getFieldError('discount') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('discount')}</p>
                        )}
                      </Field>
                    </div>

                    <div id="field-advancePayment">
                      <Field>
                        <FieldLabel htmlFor="advance_payment" className="text-base font-semibold mb-2 block">
                          Advance Payment (LKR) <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="number"
                          id="advance_payment"
                          value={company.advancePayment}
                          onChange={(e) => handleNumberChange('advancePayment', e.target.value)}
                          onBlur={(e) => handleBlur('advancePayment', e.target.value)}
                          placeholder="Enter advance payment amount"
                          className={`text-base py-3 px-4 ${getFieldError('advancePayment') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('advancePayment') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('advancePayment')}</p>
                        )}
                      </Field>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  {(company.basePrice || company.vat || company.registrationFee || company.discount || company.advancePayment) && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">LKR {calculateTotal().subtotal.toFixed(2)}</span>
                        </div>
                        {parseFloat(company.discount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>- LKR {parseFloat(company.discount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total Amount:</span>
                          <span>LKR {calculateTotal().totalAfterDiscount.toFixed(2)}</span>
                        </div>
                        {parseFloat(company.advancePayment) > 0 && (
                          <>
                            <div className="flex justify-between text-blue-600">
                              <span>Advance Payment:</span>
                              <span>- LKR {parseFloat(company.advancePayment).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t">
                              <span>Balance Due:</span>
                              <span className={calculateTotal().balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                                LKR {calculateTotal().balanceDue.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="mt-8">
            <CompanyDialog 
                company = {company}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                isValidating={isValidating}
            />    
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanyRegistrationForm