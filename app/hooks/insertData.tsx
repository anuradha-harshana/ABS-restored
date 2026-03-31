import { RegistrationData } from "../types/forms"
import { getSupabaseBrowserClient } from "../lib/supabase/browser-client"

// Define the type for the returned customer data
type CustomerResponse = {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    phoneNumber: string;
    created_at: string;
}

const insertData = async (customer: RegistrationData) => {
    const supabase = getSupabaseBrowserClient();

    try {
        // First, insert the customer data and get the generated ID
        const { data: customerData, error: customerError } = await supabase
            .from("Customers")
            .insert({
                firstName: customer.firstName,
                lastName: customer.lastName,
                address: customer.address,
                phoneNumber: customer.phoneNumber,
                vehicleModel: customer.vehicleModel
            }as any)
            .select()
            .single() as { data: CustomerResponse | null, error: any };

        if (customerError) {
            console.error("Error inserting customer:", customerError);
            return customerError;
        }

        if (!customerData) {
            console.error("No customer data returned");
            return new Error("No customer data returned");
        }

        // Get the customer ID from the inserted record
        const customerId = customerData.id;

        // Now insert the vehicle details with the customer_id foreign key
        const { error: vehicleError } = await supabase
            .from("Vehicles")
            .insert({
                customer_id: customerId,
                vehicleModel: customer.vehicleModel,
                manuYear: customer.manuYear,
                engineNumber: customer.engineNumber,
                chassisNumber: customer.chasisNumber
            } as any);

        if (vehicleError) {
            console.error("Error inserting vehicle:", vehicleError);
            return vehicleError;
        }

        console.log("Customer and vehicle data inserted successfully!");
        return null;

    } catch (error) {
        console.error("Unexpected error:", error);
        return error;
    }
}

export default insertData