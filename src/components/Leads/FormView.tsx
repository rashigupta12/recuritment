
// components/Leads/LeadsFormView.tsx
import LeadForm from "@/components/Leads/Form";
import ConfirmationDialog from "../comman/ConfirmationDialog";
import { Lead } from "@/stores/leadStore";

interface LeadsFormViewProps {
  currentView: 'add' | 'edit';
  selectedLead: Lead | null;
  showConfirmation: boolean;
  onBack: () => void;
  onFormClose: () => void;
  onConfirmBack: () => void;
  onCancelBack: () => void;
}

export const LeadsFormView = ({
  currentView,
  selectedLead,
  showConfirmation,
  onBack,
  onFormClose,
  onConfirmBack,
  onCancelBack
}: LeadsFormViewProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-2">
        <div className="w-full mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentView === 'add' ? 'Add New Lead' : 'Edit Lead'}
              </h2>
            </div>
            
            <div className="p-4">
              <LeadForm 
                onClose={onFormClose}
                editLead={currentView === 'edit' ? selectedLead : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onConfirm={onConfirmBack}
        onCancel={onCancelBack}
        message="Your form is not saved. Do you really want to go back?"
      />
    </div>
  );
};
