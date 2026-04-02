import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  Select,
  TextInput,
  Spinner,
  Modal,
} from "flowbite-react";
import toast from "react-hot-toast";
import { editSlab, getSecondaryTargetDropdown } from "../api/api";

const EditSlabModal = ({ show, onClose, slab, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    min_range: "",
    max_range: "",
    perc_slab: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target states
  const [targetDropdown, setTargetDropdown] = useState([]);
  const [targetDropdownLoading, setTargetDropdownLoading] = useState(false);
  const [addTargetIds, setAddTargetIds] = useState([]);
  const [removeTargetIds, setRemoveTargetIds] = useState([]);

  // Populate form when slab changes
  useEffect(() => {
    if (slab) {
      setFormData({
        name: slab.name || "",
        min_range: slab.min_range?.toString() || "",
        max_range: slab.max_range?.toString() || "",
        perc_slab: slab.perc_slab?.toString() || "",
        discount: slab.discount?.toString() || "",
        is_active: slab.is_active ?? true,
      });
      //reset when a new slab opens
      setAddTargetIds([]);
      setRemoveTargetIds([]);
      if (slab.slab_type) fetchTargetDropdown(slab.slab_type);
    }
  }, [slab]);

  // fetch the dropdown as per the type of the slab
  const fetchTargetDropdown = async (slabType) => {
    if (!slabType) {
      return;
    }
    try {
      setTargetDropdownLoading(true);
      const response = await getSecondaryTargetDropdown({
        params: { slab_type: slabType },
      });
      setTargetDropdown(response?.data || []);
    } catch (error) {
      toast.error("Failed to fetch targets");
      setTargetDropdown([]);
    } finally {
      setTargetDropdownLoading(false);
    }
  };

  // validate the form details
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Slab name is required");
      return false;
    }

    if (slab?.slab_type === "volume" || slab?.slab_type === "value") {
      if (formData.min_range === "" || formData.max_range === "") {
        toast.error("Min range and max range are required");
        return false;
      }
      if (Number(formData.min_range) >= Number(formData.max_range)) {
        toast.error("Min range must be less than max range");
        return false;
      }
    }

    if (slab?.slab_type === "percentage") {
      if (formData.perc_slab === "") {
        toast.error("Percentage is required for percentage slabs");
        return false;
      }
      if (Number(formData.perc_slab) < 0) {
        toast.error("Percentage must be a non-negative number");
        return false;
      }
    }

    if (formData.discount !== "") {
      const d = Number(formData.discount);
      if (d < 0 || d > 100) {
        toast.error("Discount must be between 0 and 100");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name,
        is_active: formData.is_active,
      };

      if (slab.slab_type === "volume" || slab.slab_type === "value") {
        payload.min_range = Number(formData.min_range);
        payload.max_range = Number(formData.max_range);
      }

      if (slab.slab_type === "percentage") {
        payload.perc_slab = Number(formData.perc_slab);
      }

      if (formData.discount !== "") {
        payload.discount = Number(formData.discount);
      }

      if (addTargetIds.length > 0) payload.addTargetIds = addTargetIds;
      if (removeTargetIds.length > 0) payload.removeTargetIds = removeTargetIds;

      const response = await editSlab(payload, slab._id);

      if (response?.status === 200) {
        toast.success(response?.data?.message || "Slab updated successfully");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update slab",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="2xl">
      <Modal.Header>Edit Slab</Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit-slab-name">
                Slab Name <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="edit-slab-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter Slab Name"
              />
            </div>

            {/* Slab type shown as read-only badge — not editable */}
            <div>
              <Label>Slab Type</Label>
              <div className="mt-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 inline-flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold
              ${
                slab?.slab_type === "volume"
                  ? "bg-blue-100 text-blue-700"
                  : slab?.slab_type === "value"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
              }`}
                >
                  {slab?.slab_type?.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  (cannot be changed)
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-is-active">Status</Label>
              <Select
                id="edit-is-active"
                value={formData.is_active}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_active: e.target.value === "true",
                  })
                }
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </Select>
            </div>
          </div>

          {/* Range / Percentage config */}
          <div className="border-t pt-4">
            <Label className="text-base font-semibold mb-3 block">
              {slab?.slab_type === "percentage"
                ? "Percentage Configuration"
                : "Slab Range Configuration"}
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(slab?.slab_type === "volume" ||
                slab?.slab_type === "value") && (
                <>
                  <div>
                    <Label htmlFor="edit-min-range">
                      Min Range <span className="text-red-500">*</span>
                    </Label>
                    <TextInput
                      id="edit-min-range"
                      type="number"
                      value={formData.min_range}
                      onChange={(e) =>
                        setFormData({ ...formData, min_range: e.target.value })
                      }
                      placeholder="Min Range"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-max-range">
                      Max Range <span className="text-red-500">*</span>
                    </Label>
                    <TextInput
                      id="edit-max-range"
                      type="number"
                      value={formData.max_range}
                      onChange={(e) =>
                        setFormData({ ...formData, max_range: e.target.value })
                      }
                      placeholder="Max Range"
                      min="0"
                    />
                  </div>
                </>
              )}

              {slab?.slab_type === "percentage" && (
                <div>
                  <Label htmlFor="edit-perc-slab">
                    Achievement Percentage (%){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="edit-perc-slab"
                    type="number"
                    value={formData.perc_slab}
                    onChange={(e) =>
                      setFormData({ ...formData, perc_slab: e.target.value })
                    }
                    placeholder="e.g. 80"
                    min="0"
                  />
                </div>
              )}

              {/* Discount — available for all slab types */}
              <div>
                <Label htmlFor="edit-discount">Scheme % (Discount)</Label>
                <TextInput
                  id="edit-discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  placeholder="Optional discount"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Target Management */}
          <div className="border-t pt-4">
            <Label className="text-base font-semibold mb-3 block">
              Manage Targets
            </Label>

            {/* Currently mapped targets — shown as removable pills */}
            {slab?.targets && slab.targets.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                  Currently mapped — click ✕ to remove:
                </p>
                <div className="flex flex-wrap gap-2">
                  {slab.targets
                    .filter((t) => !removeTargetIds.includes(t._id))
                    .map((t) => (
                      <span
                        key={t._id}
                        className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        <span>{t.name}</span>
                        <span className="text-green-400 text-xs">
                          ({t.retailerUID})
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRemoveTargetIds((prev) => [...prev, t._id])
                          }
                          className="ml-1 text-green-400 hover:text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  {/* show removed ones as faded so user can undo */}
                  {slab.targets
                    .filter((t) => removeTargetIds.includes(t._id))
                    .map((t) => (
                      <span
                        key={t._id}
                        className="inline-flex items-center gap-1.5 bg-red-50 text-red-400 border border-red-200 rounded-full px-3 py-1 text-xs font-medium line-through"
                      >
                        <span>{t.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setRemoveTargetIds((prev) =>
                              prev.filter((id) => id !== t._id),
                            )
                          }
                          className="ml-1 text-red-400 hover:text-green-600 transition-colors no-underline"
                          title="Undo remove"
                        >
                          ↩
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Add new targets */}
            <p className="text-xs text-gray-500 mb-2">Add new targets:</p>
            {targetDropdownLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> Loading targets...
              </div>
            ) : targetDropdown.length === 0 ? (
              <p className="text-sm text-gray-400">
                No targets available for this slab type
              </p>
            ) : (
              <>
                <Select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !addTargetIds.includes(val)) {
                      setAddTargetIds((prev) => [...prev, val]);
                    }
                  }}
                >
                  <option value="">Select a target to add...</option>
                  {targetDropdown
                    // exclude already mapped targets and ones already queued to add
                    .filter((t) => {
                      const alreadyMapped = slab?.targets?.some(
                        (st) => st._id === t._id,
                      );
                      const alreadyAdded = addTargetIds.includes(t._id);
                      return !alreadyMapped && !alreadyAdded;
                    })
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} — {t.retailerName} ({t.retailerUID}) |{" "}
                        {t.distributorName}
                      </option>
                    ))}
                </Select>

                {/* newly queued to add — shown as blue pills */}
                {addTargetIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {addTargetIds.map((id) => {
                      const t = targetDropdown.find((x) => x._id === id);
                      if (!t) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium"
                        >
                          <span>{t.name}</span>
                          <span className="text-blue-400 text-xs">
                            ({t.retailerUID})
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAddTargetIds((prev) =>
                                prev.filter((x) => x !== id),
                              )
                            }
                            className="ml-1 text-blue-400 hover:text-red-500 transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button color="blue" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Spinner className="mr-2" size="sm" />}
          {isSubmitting ? "Updating..." : "Update Slab"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSlabModal;
