import CustomerDetailsView from "../components/Forms/CustomerDetailsView"
import { RegistrationData } from "../types/forms"




const page = (customer: RegistrationData) => {
  return (
    <>
      <CustomerDetailsView customer={customer}/>
    </>
  )
}

export default page
