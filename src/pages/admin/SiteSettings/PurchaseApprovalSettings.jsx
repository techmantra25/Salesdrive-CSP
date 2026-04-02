import { Label } from "flowbite-react";
import { BsBoundingBox } from "react-icons/bs";

const PurchaseApprovalSettings = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BsBoundingBox size={20} />
        <Label
          className="text-lg font-semibold"
          value="Approval Settings for Purchase Orders"
        />
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex items-center  gap-3">
          <input
            type="radio"
            name="functionalSettings.need_employee_approval_for_po"
            value="no approval"
            checked={
              formData.functionalSettings?.need_employee_approval_for_po ===
              "no approval"
            }
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                functionalSettings: {
                  ...prev.functionalSettings,
                  need_employee_approval_for_po: value,
                },
              }));
            }}
          />
          <div>
            <p className="font-medium text-base">No Approval Needed</p>
            <p className="text-sm text-gray-600">
              Purchase orders can be processed without requiring any Agent or
              Admin&apos;s approval.
            </p>
          </div>
        </label>

        {/* <label className="flex items-center gap-3">
          <input
            type="radio"
            name="functionalSettings.need_employee_approval_for_po"
            value="agent approval"
            checked={
              formData.functionalSettings?.need_employee_approval_for_po ===
              "agent approval"
            }
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                functionalSettings: {
                  ...prev.functionalSettings,
                  need_employee_approval_for_po: value,
                },
              }));
            }}
          />
          <div>
            <p className="font-medium text-base">Agent Approval Required</p>
            <p className="text-sm text-gray-600">
              A designated Agent must review and approve the purchase order
              before processing.
            </p>
          </div>
        </label> */}

        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="functionalSettings.need_employee_approval_for_po"
            value="admin approval"
            checked={
              formData.functionalSettings?.need_employee_approval_for_po ===
              "admin approval"
            }
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                functionalSettings: {
                  ...prev.functionalSettings,
                  need_employee_approval_for_po: value,
                },
              }));
            }}
          />
          <div>
            <p className="font-medium text-base">Admin Approval Required</p>
            <p className="text-sm text-gray-600">
              Central Portal Admin must review and approve the purchase order
              before processing.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PurchaseApprovalSettings;
