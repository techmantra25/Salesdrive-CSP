import { Button, Label, Modal } from "flowbite-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bulkUpdateRlp } from "../api/api";
import { fetchDistributors } from "../redux/distributorListSlice";
import toast from "react-hot-toast";
import SearchableSelect from "./SearchableSelect";

const BulkRLPEditModal = ({
  show,
  onClose,
}) => {
  const dispatch = useDispatch();
  const { distributors } = useSelector((state) => state.distributors);

  // Local state for the modal
  const [bulkRLPEditValue, setBulkRLPEditValue] = useState(false);
  const [bulkRLPSelectedDistributors, setBulkRLPSelectedDistributors] = useState([]);
  const [bulkRLPEditSaving, setBulkRLPEditSaving] = useState(false);

  const handleReset = () => {
    setBulkRLPEditValue(false);
    setBulkRLPSelectedDistributors([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSave = async () => {
    // Validate that either specific distributors are selected
    if (!bulkRLPSelectedDistributors || bulkRLPSelectedDistributors.length === 0) {
      toast.error("Please select at least one distributor");
      return;
    }

    // Show confirmation
    const confirmed = window.confirm(
      "Apply this RLP Edit setting to selected distributors?"
    );

    if (!confirmed) return;

    try {
      setBulkRLPEditSaving(true);

      // Prepare payload based on selection
      let payload;
      if (bulkRLPSelectedDistributors.includes("all")) {
        // Update ALL distributors
        payload = {
          distributorIds: "ALL",
          allowRLPEdit: bulkRLPEditValue,
        };
      } else {
        // Update specific distributors
        payload = {
          distributorIds: bulkRLPSelectedDistributors,
          allowRLPEdit: bulkRLPEditValue,
        };
      }

      await bulkUpdateRlp(payload);
      dispatch(fetchDistributors());
      toast.success("Bulk RLP Edit updated successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to bulk update RLP Edit:", error);
      toast.error(error?.message || "Failed to bulk update RLP Edit");
    } finally {
      setBulkRLPEditSaving(false);
    }
  };

  if (!show) return null;

  return (
    <Modal show={show} onClose={handleClose}>
      <Modal.Header>Bulk RLP Edit</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-4">
          {/* Distributor Selection */}
          <div>
            <div className="mb-2 block">
              <Label value="Select Distributors" />
              <span className="text-red-500">*</span>
            </div>
            <SearchableSelect
              id="bulk-rlp-distributors"
              options={distributors}
              value={bulkRLPSelectedDistributors}
              onChange={(e) => setBulkRLPSelectedDistributors(e.target.value)}
              placeholder="Select Distributor(s)"
              displayKey="name"
              descKey="dbCode"
              valueKey="_id"
              multiple
            />
            <p className="text-xs text-gray-500 mt-1">
              Select "all" option or choose specific distributors
            </p>
          </div>

          {/* Allow RLP Edit Toggle */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="mb-3 block">
              <Label value="Allow RLP Edit" />
              <span className="text-red-500">*</span>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
                <input
                  type="radio"
                  name="bulkRLPEditStatus"
                  value="true"
                  checked={bulkRLPEditValue === true}
                  onChange={() => setBulkRLPEditValue(true)}
                  className="w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Yes
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Allow RLP editing
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
                <input
                  type="radio"
                  name="bulkRLPEditStatus"
                  value="false"
                  checked={bulkRLPEditValue === false}
                  onChange={() => setBulkRLPEditValue(false)}
                  className="w-4 h-4"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    No
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Disallow RLP editing
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="blue"
          onClick={handleSave}
          disabled={bulkRLPEditSaving}
        >
          {bulkRLPEditSaving ? "Saving..." : "Save"}
        </Button>
        <Button color="gray" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkRLPEditModal;
