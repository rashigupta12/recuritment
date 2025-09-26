// components/Leads/LeadsFormView.tsx
import { useState } from "react";
import LeadForm from "@/components/Leads/Form";
import ConfirmationDialog from "../comman/ConfirmationDialog";
import { Lead } from "@/stores/leadStore";

interface LeadsFormViewProps {
  currentView: 'add' | 'edit';
  selectedLead: Lead | null;
  onBack: () => void;
  onFormClose: () => void;
}

export const LeadsFormView = ({
  currentView,
  selectedLead,
  onBack,
  onFormClose
}: LeadsFormViewProps) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Handle unsaved changes from LeadForm
  const handleUnsavedChanges = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  // Simplified form close handler - let LeadForm handle the confirmation logic
  const handleFormClose = () => {
    onFormClose();
  };

  // Handle back navigation with confirmation
  // const handleBackClick = () => {
  //   if (hasUnsavedChanges) {
  //     setPendingAction(() => onBack);
  //     setShowConfirmation(true);
  //   } else {
  //     onBack();
  //   }
  // };

  // Confirmation handlers
  const handleConfirmBack = () => {
    setShowConfirmation(false);
    setHasUnsavedChanges(false);
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const handleCancelBack = () => {
    setShowConfirmation(false);
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-2">
        <div className="w-full mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4">
              <LeadForm 
                onClose={handleFormClose}
                editLead={currentView === 'edit' ? selectedLead : undefined}
                onUnsavedChanges={handleUnsavedChanges}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onConfirm={handleConfirmBack}
        onCancel={handleCancelBack}
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
      />
    </div>
  );
};