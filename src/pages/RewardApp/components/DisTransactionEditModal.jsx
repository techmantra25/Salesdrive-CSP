import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import {
  editDistributorTransaction,
  rebuildDistributorBalance,
  rebuildRetailerBalance,
} from "../../../api/distributorTransactionApi";
import toast from "react-hot-toast";

const DisTransactionEditModal = ({
  showEditModal,
  setShowEditModal,
  editFormData,
  setEditFormData,
  editLoading,
  setEditLoading,
  onSuccess,
  activeDistributors,
}) => {
  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateTransaction = async () => {
    setEditLoading(true);

    try {
      // Prepare the data object
      const updateData = {
        transactionType: editFormData.transactionType,
        transactionFor: editFormData.transactionFor,
        point: editFormData.point,
        remark: editFormData.Remarks,
      };

      // Add createdAt and updatedAt if they have values
      if (editFormData.createdAt) {
        updateData.createdAt = new Date(editFormData.createdAt).toISOString();
      }
      if (editFormData.updatedAt) {
        updateData.updatedAt = new Date(editFormData.updatedAt).toISOString();
      }

      await editDistributorTransaction(editFormData._id, updateData);

      await rebuildDistributorBalance(editFormData.distributorId);

      if (editFormData.retailerId) {
        await rebuildRetailerBalance(editFormData.retailerId);
      }
      toast.success("Transaction & balances updated successfully");

      setShowEditModal(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update or rebuild failed");
    } finally {
      setEditLoading(false);
    }
  };

  const isFormValid = () => {
    return editFormData.point && editFormData.transactionType;
  };

  console.log("check")

  return (
    <Modal
      show={showEditModal}
      onClose={() => setShowEditModal(false)}
      size="lg"
    >
      <Modal.Header>Edit Reward Transaction</Modal.Header>

      <Modal.Body>
        <div className="space-y-4">
          {/* Distributor */}
          <div>
            <div>
              <Label value="Distributor" />
              <TextInput
                value={
                  activeDistributors.find(
                    (d) => d._id === editFormData.distributorId,
                  )?.name || ""
                }
                disabled
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <Label value="Transaction Type *" />
            <Select
              value={editFormData.transactionType}
              onChange={(e) =>
                handleEditFormChange("transactionType", e.target.value)
              }
            >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </Select>
          </div>

          {/* Points */}
          <div>
            <Label value="Points *" />
            <TextInput
              type="number"
              value={editFormData.point}
              onChange={(e) => handleEditFormChange("point", e.target.value)}
            />
          </div>

          {/* Created At Date */}
          <div>
            <Label value="Created Date" />
            <TextInput
              type="date"
              value={editFormData.createdAt || ""}
              onChange={(e) =>
                handleEditFormChange("createdAt", e.target.value)
              }
              placeholder="Select created date"
            />
          </div>

          {/* Updated At Date */}
          <div>
            <Label value="Updated Date" />
            <TextInput
              type="date"
              value={editFormData.updatedAt || ""}
              onChange={(e) =>
                handleEditFormChange("updatedAt", e.target.value)
              }
              placeholder="Select updated date"
            />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          onClick={handleUpdateTransaction}
          disabled={editLoading || !isFormValid()}
        >
          {editLoading ? "Updating..." : "Update Transaction"}
        </Button>

        <Button
          color="gray"
          onClick={() => setShowEditModal(false)}
          disabled={editLoading}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisTransactionEditModal;
