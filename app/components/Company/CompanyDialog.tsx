import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CompanyDetailsView from "./CompanyDetailsView"
import { CompanyRegistrationData } from "@/app/types/forms"
import { Loader2 } from "lucide-react"

interface CompanyDialogProps {
  company: CompanyRegistrationData;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
  isValidating?: boolean;
}

const CompanyDialog = ({ company, onSubmit, isSubmitting = false, isValidating = false }: CompanyDialogProps) => {
  const handleConfirm = async () => {
    await onSubmit();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          type="button"
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xl transition-colors"
        >
          Preview & Submit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Preview Company Details</DialogTitle>
          <DialogDescription>
            Please review the company information below before submitting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <CompanyDetailsView company={company} />
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]');
              if (closeButton) (closeButton as HTMLButtonElement).click();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || isValidating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting || isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Confirm & Submit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CompanyDialog;