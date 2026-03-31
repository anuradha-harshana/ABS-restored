// CustomerDetailsView.tsx
import { RegistrationData } from '@/app/types/forms'

interface CustomerDetailsViewProps {
  customer: RegistrationData;
}

const CustomerDetailsView = ({ customer }: CustomerDetailsViewProps) => {
  // Calculate totals for display
  const basePrice = parseFloat(customer.basePrice) || 0;
  const vat = parseFloat(customer.vat) || 0;
  const registrationFee = parseFloat(customer.registrationFee) || 0;
  const discount = parseFloat(customer.discount) || 0;
  const advancePayment = parseFloat(customer.advancePayment) || 0;
  
  const subtotal = basePrice + vat + registrationFee;
  const totalAfterDiscount = subtotal - discount;
  const balanceDue = totalAfterDiscount - advancePayment;

  return (
    <div className="max-w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">CUSTOMER REGISTRATION</h1>
          <div className="border-b-2 border-blue-800 mt-2"></div>
          <p className="text-gray-500 text-xs mt-2">
            Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Customer Details Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">CUSTOMER DETAILS</h2>
          <div className="border-b border-gray-300 mb-3"></div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-gray-700 text-sm">First Name:</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.firstName || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
              <div>
                <label className="font-bold text-gray-700 text-sm">Last Name:</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.lastName || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
            </div>
            <div>
              <label className="font-bold text-gray-700 text-sm">Address:</label>
              <p className="text-gray-900 text-sm mt-1 whitespace-pre-wrap break-words">
                {customer.address || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-gray-700 text-sm">Phone Number:</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.phoneNumber || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
              <div>
                <label className="font-bold text-gray-700 text-sm">NIC Number:</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.nic || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">VEHICLE DETAILS</h2>
          <div className="border-b border-gray-300 mb-3"></div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-gray-700 text-sm">Vehicle Model:</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.vehicleModel || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
              <div>
                <label className="font-bold text-gray-700 text-sm">Manufactured Year:</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.manuYear || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
            </div>
            <div>
              <label className="font-bold text-gray-700 text-sm">Vehicle Color:</label>
              <p className="text-gray-900 text-sm mt-1 break-words">
                {customer.color || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-gray-700 text-sm">Engine Number:</label>
                <p className="text-gray-900 text-xs font-mono mt-1 break-words">
                  {customer.engineNumber || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
              <div>
                <label className="font-bold text-gray-700 text-sm">Chassis Number:</label>
                <p className="text-gray-900 text-xs font-mono mt-1 break-words">
                  {customer.chasisNumber || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">PAYMENT DETAILS</h2>
          <div className="border-b border-gray-300 mb-3"></div>
          
          <div className="space-y-3">
            <div>
              <label className="font-bold text-gray-700 text-sm">Payment Method:</label>
              <p className="text-gray-900 text-sm mt-1 break-words">
                {customer.paymentMethod || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-gray-700 text-sm">Base Price (LKR):</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.basePrice ? `LKR ${parseFloat(customer.basePrice).toLocaleString()}` : <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
              <div>
                <label className="font-bold text-gray-700 text-sm">VAT (LKR):</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.vat ? `LKR ${parseFloat(customer.vat).toLocaleString()}` : <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-gray-700 text-sm">Registration Fee (LKR):</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.registrationFee ? `LKR ${parseFloat(customer.registrationFee).toLocaleString()}` : <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
              <div>
                <label className="font-bold text-gray-700 text-sm">Discount (LKR):</label>
                <p className="text-gray-900 text-sm mt-1 break-words">
                  {customer.discount ? `LKR ${parseFloat(customer.discount).toLocaleString()}` : <span className="text-gray-400 italic">None</span>}
                </p>
              </div>
            </div>
            <div>
              <label className="font-bold text-gray-700 text-sm">Advance Payment (LKR):</label>
              <p className="text-gray-900 text-sm mt-1 break-words">
                {customer.advancePayment ? `LKR ${parseFloat(customer.advancePayment).toLocaleString()}` : <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
            
            {/* Payment Summary */}
            {(customer.basePrice || customer.vat || customer.registrationFee || customer.discount || customer.advancePayment) && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-2">PAYMENT SUMMARY</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">LKR {subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>- LKR {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total Amount:</span>
                    <span>LKR {totalAfterDiscount.toLocaleString()}</span>
                  </div>
                  {advancePayment > 0 && (
                    <>
                      <div className="flex justify-between text-blue-600">
                        <span>Advance Payment:</span>
                        <span>- LKR {advancePayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-1 border-t">
                        <span>Balance Due:</span>
                        <span className={balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                          LKR {balanceDue.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-gray-700 mb-1">QR Code Information:</h3>
              <p className="text-xs text-gray-500 mb-1">
                Use this QR code at the service station to update vehicle details.
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="w-20 h-20 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-1">
                <span className="text-gray-400 text-xs text-center leading-tight">
                  QR<br/>Code<br/>Preview
                </span>
              </div>
              <p className="text-xs text-gray-500">Scan for details</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Service Center Management System</span>
            <span>Page 1 of 1</span>
          </div>
        </div>

        {/* Empty State Indicator */}
        {!customer.firstName && !customer.lastName && !customer.vehicleModel && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
            <p className="text-xs text-yellow-700">
              Fill out the form to see the preview update in real-time
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerDetailsView;