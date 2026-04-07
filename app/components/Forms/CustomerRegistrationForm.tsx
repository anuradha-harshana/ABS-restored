// CustomerRegistrationForm.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RegistrationData, DatabaseError } from "@/app/types/forms"
import insertData from "../../hooks/Customer/insertData"
import useDataValidation from "../../hooks/Customer/useDataValidation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client"
import CustomerDialog from "../Customer/CustomerDialog"

const CustomerRegistrationForm = () => {
  const [customer, setCustomer] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
    nic: "",
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
    balanceDue: "",
    paymentMethod: ""
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

  const handleFormSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);
    
    try {
      const validationResult = await validateAll(customer);
      
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
      
      const error = await insertData(customer);
      
      if (error) {
        console.error("Failed to save to database:", error);
        const dbError = error as DatabaseError;
        if (dbError.message?.includes("duplicate") || dbError.code === "23505") {
          setSubmitError("One or more fields (Phone Number, NIC, Engine Number, or Chassis Number) already exist in our system. Please use unique values.");
          await validateAll(customer);
        } else {
          setSubmitError("Failed to save customer data. Please try again.");
        }
        setIsSubmitting(false);
        return; 
      } else {
        console.log("Customer saved successfully!");
        setSubmitSuccess(true);
        
        setTimeout(() => {
          setCustomer({
            firstName: "",
            lastName: "",
            address: "",
            phoneNumber: "",
            nic: "",
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
            balanceDue: "",
            paymentMethod: ""
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

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }))
    clearFieldError(field)
    setSubmitError(null)
  }

  const handleBlur = async (field: keyof RegistrationData, value: string) => {
    if (value) {
      const fieldErrors = validateField(field, value);
      if (fieldErrors.length > 0) {
        clearFieldError(field);
      } else {
        if (field === 'phoneNumber' || field === 'nic' || field === 'engineNumber' || field === 'chasisNumber') {
          const supabase = getSupabaseBrowserClient();
          let table = '';
          let column = '';
          
          if (field === 'phoneNumber') {
            table = 'Customers';
            column = 'phoneNumber';
          } else if (field === 'nic') {
            table = 'Customers';
            column = 'nic_no';
          } else if (field === 'engineNumber') {
            table = 'Vehicles';
            column = 'engineNumber';
          } else if (field === 'chasisNumber') {
            table = 'Vehicles';
            column = 'chassisNumber';
          }
          
          const { data } = await supabase
            .from(table)
            .select(column)
            .eq(column, value);
          
          if (data && data.length > 0) {
            let errorMessage = '';
            if (field === 'phoneNumber') errorMessage = 'This phone number is already registered';
            if (field === 'nic') errorMessage = 'This NIC number is already registered';
            if (field === 'engineNumber') errorMessage = 'This engine number is already registered';
            if (field === 'chasisNumber') errorMessage = 'This chassis number is already registered';
            
            // Show error without blocking
            console.log(`Error: ${errorMessage}`);
          } else {
            clearFieldError(field);
          }
        } else {
          clearFieldError(field);
        }
      }
    }
  }

  const getFieldError = (field: keyof RegistrationData): string | undefined => {
    return errors[field]?.[0];
  }

  // Calculate total amount
  const calculateTotal = () => {
    const basePrice = parseFloat(customer.basePrice) || 0;
    const vat = parseFloat(customer.vat) || 0;
    const registrationFee = parseFloat(customer.registrationFee) || 0;
    const discount = parseFloat(customer.discount) || 0;
    const advancePayment = parseFloat(customer.advancePayment) || 0;
    
    const subtotal = basePrice + vat + registrationFee;
    const totalAfterDiscount = subtotal - discount;
    const balanceDue = totalAfterDiscount - advancePayment;
    
    return {
      subtotal,
      totalAfterDiscount,
      balanceDue
    };
  };

  // Update balance due when values change
  const updateBalanceDue = () => {
    const { balanceDue } = calculateTotal();
    setCustomer(prev => ({ ...prev, balanceDue: balanceDue.toString() }));
  };

  // Update balance due when relevant fields change
  const handleNumberChange = (field: keyof RegistrationData, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
    setTimeout(updateBalanceDue, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-10 text-gray-800">
          Customer Registration
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
        
        <form>
          {/* All your existing form fields remain exactly the same */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer and Vehicle Details */}
            <div className="space-y-8">
              {/* Customer Details Card */}
              <Card className="border-2 border-blue-400">
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

                    <div id="field-nic">
                      <Field>
                        <FieldLabel htmlFor="nic" className="text-base font-semibold mb-2 block">
                          NIC Number <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="nic"
                          value={customer.nic}
                          onChange={(e) => handleInputChange('nic', e.target.value)}
                          onBlur={(e) => handleBlur('nic', e.target.value)}
                          placeholder="Enter NIC number"
                          className={`text-base py-3 px-4 ${getFieldError('nic') ? 'border-red-500' : ''}`}
                          required
                        />
                        {getFieldError('nic') && (
                          <p className="text-red-500 text-sm mt-2">{getFieldError('nic')}</p>
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

                    <div id="field-color">
                      <Field>
                        <FieldLabel htmlFor="color" className="text-base font-semibold mb-2 block">
                          Vehicle Color <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="color"
                          value={customer.color}
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
                          value={customer.paymentMethod}
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
                          value={customer.basePrice}
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
                          value={customer.vat}
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
                          value={customer.registrationFee}
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
                          value={customer.discount}
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
                          value={customer.advancePayment}
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
                  {(customer.basePrice || customer.vat || customer.registrationFee || customer.discount || customer.advancePayment) && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">LKR {calculateTotal().subtotal.toFixed(2)}</span>
                        </div>
                        {parseFloat(customer.discount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>- LKR {parseFloat(customer.discount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total Amount:</span>
                          <span>LKR {calculateTotal().totalAfterDiscount.toFixed(2)}</span>
                        </div>
                        {parseFloat(customer.advancePayment) > 0 && (
                          <>
                            <div className="flex justify-between text-blue-600">
                              <span>Advance Payment:</span>
                              <span>- LKR {parseFloat(customer.advancePayment).toFixed(2)}</span>
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
          
          {/* Submit Button - Replace with CustomerDialog */}
          <div className="mt-8">
            <CustomerDialog 
              customer={customer}
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

export default CustomerRegistrationForm