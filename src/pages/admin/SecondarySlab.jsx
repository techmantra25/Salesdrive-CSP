import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Label,
  Select,
  TextInput,
  Spinner,
  Table,
  Badge,
} from "flowbite-react";
import toast from "react-hot-toast";
import {
  createSlab,
  getAllSecondarySlab,
  deleteSlab,
  getSecondaryTargetDropdown,
} from "../../api/api";
import { TbReceiptYuan } from "react-icons/tb";
import EditSlabModal from "../../components/EditSlabModal";
import { HiPencil, HiTrash } from "react-icons/hi";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../utils/permissionHelper";
import TargetPopover from "../../components/TargetPopover";

const SecondarySlab = () => {
  const [formData, setFormData] = useState({
    name: "",
    slab_type: "",
    min_range: "",
    max_range: "",
    perc_slab: "",
    discount: "",
    percentage: "",
    is_active: true,
  });

  // animated reveal for range/percentage fields
  const [showRangeFields, setShowRangeFields] = useState(false);

  const [slabs, setSlabs] = useState([]);
  const [slabsLoading, setSlabsLoading] = useState(false);
  const [filterSlabType, setFilterSlabType] = useState("");

  // target dropdown states
  const [targetDropdown, setTargetDropdown] = useState([]);
  const [targetDropdownLoading, setTargetDropdownLoading] = useState(false);
  const [selectedTargetIds, setSelectedTargetIds] = useState([]);

  // edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlab, setSelectedSlab] = useState(null);

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slabToDelete, setSlabToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filterIsActive, setFilterIsActive] = useState("true");

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "secondary-slab-setting",
    );

    setPagePermission(permission);
  }, [permissionState]);

  // function to fetch the resepected target

  const fetchTargetDropdown = async (slabType) => {
    if (!slabType) {
      setTargetDropdown([]);
      setSelectedTargetIds([]);
      return;
    }
    try {
      setTargetDropdownLoading(true);
      const response = await getSecondaryTargetDropdown({
        params: { slab_type: slabType },
      });
      setTargetDropdown(response?.data || []);
    } catch (error) {
      toast.error("Failed to fetch the targets");
      setTargetDropdown([]);
    } finally {
      setTargetDropdownLoading(false);
    }
  };

  // useEffect to trigger the animation
  useEffect(() => {
    if (formData.slab_type) {
      setShowRangeFields(false);
      setSelectedTargetIds([]);
      // small delay of 500 ms
      const t = setTimeout(() => setShowRangeFields(true), 50);
      fetchTargetDropdown(formData.slab_type);
      return () => clearTimeout(t);
    } else {
      setShowRangeFields(false);
      setTargetDropdown([]);
      setSelectedTargetIds([]);
    }
  }, [formData.slab_type]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Slab name is required");
      return false;
    }

    if (!formData.slab_type) {
      toast.error("slab type is required");
      return false;
    }

    if (formData.slab_type === "volume" || formData.slab_type === "value") {
      if (formData.min_range === "" || formData.max_range === "") {
        toast.error("Min range and max range are required ");
        return false;
      }

      if (Number(formData.min_range) >= Number(formData.max_range)) {
        toast.error("Min Range must be less than max Range");
        return false;
      }
    }
    if (formData.slab_type === "percentage") {
      if (formData.perc_slab === "") {
        toast.error("percentage is required for percentage slabs");
        return false;
      }
      if (Number(formData.perc_slab) < 0) {
        toast.error("percentage must be a non negative number");
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

  // handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name,
        slab_type: formData.slab_type,
        is_active: formData.is_active,
      };

      if (formData.slab_type === "volume" || formData.slab_type === "value") {
        payload.min_range = Number(formData.min_range);
        payload.max_range = Number(formData.max_range);
      }
      if (formData.slab_type === "percentage") {
        payload.perc_slab = Number(formData.perc_slab);
      }
      if (formData.discount !== "") {
        payload.discount = Number(formData.discount);
      }

      if (selectedTargetIds.length > 0) {
        payload.targetIds = selectedTargetIds;
      }

      const response = await createSlab(payload);

      if (response?.status === 201) {
        toast.success(response?.data?.message || "Slab created successfully");
        fetchSlabs();
      }

      // Reset form
      setFormData({
        name: "",
        slab_type: "",
        min_range: "",
        max_range: "",
        percentage: "",
        is_active: true,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create slab",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // handle delete modal

  const handleDeleteClick = (slab) => {
    setSlabToDelete(slab);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!slabToDelete) return;
    try {
      setIsDeleting(true);
      const response = await deleteSlab(slabToDelete._id);
      if (response?.status === 200) {
        toast.success(response?.data?.message || "Slab delted successfully");
        fetchSlabs();
        setShowDeleteModal(false);
        setSlabToDelete(null);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delte slab",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchSlabs = async () => {
    try {
      setSlabsLoading(true);
      const query = {};
      if (filterSlabType) {
        query.slab_type = filterSlabType;
      }

      if (filterIsActive !== "all") {
        query.is_active = filterIsActive;
      }
      const response = await getAllSecondarySlab(query);
      setSlabs(response?.data?.data);
    } catch (error) {
      console.log(error);
      toast.error("failed to fetch slabs");
    } finally {
      setSlabsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlabs();
  }, [filterSlabType, filterIsActive]);

  const handleReset = () => {
    setFormData({
      name: "",
      slab_type: "",
      min_range: "",
      max_range: "",
      perc_slab: "",
      discount: "",
      is_active: true,
    });
    setShowRangeFields(false);
    setSelectedTargetIds([]);
  };

  const handleEditClick = (slab) => {
    setSelectedSlab(slab);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    fetchSlabs();
  };

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Page Header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">
                Secondary Target Slab Setting
              </h1>
            </div>
          </div>

          {/* Form Card */}
          {pagePermission?.create && (
            <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
              <Card className="w-full max-w-4xl">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="slab-name">
                        Slab Name <span className="text-red-500">*</span>
                      </Label>
                      <TextInput
                        id="slab-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter Slab Name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="slab-type">
                        Slab Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        id="slab-type"
                        value={formData.slab_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slab_type: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Slab Type</option>
                        <option value="volume">Volume</option>
                        <option value="value">Value</option>
                        <option value="percentage">Percentage</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="is-active">Status</Label>
                      <Select
                        id="is-active"
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

                  {/* Slab Range Section */}
                  {/* <div className="border-t pt-6">
                    <Label className="text-lg font-semibold mb-4 block">
                      Slab Range Configuration
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="min-range">
                          Min Range <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="min-range"
                          type="number"
                          value={formData.min_range}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              min_range: e.target.value,
                            })
                          }
                          placeholder="Min Range"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="max-range">
                          Max Range <span className="text-red-500">*</span>
                        </Label>
                        <TextInput
                          id="max-range"
                          type="number"
                          value={formData.max_range}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              max_range: e.target.value,
                            })
                          }
                          placeholder="Max Range"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="percentage">
                          Scheme Percentage (%)
                        </Label>
                        <TextInput
                          id="percentage"
                          type="number"
                          value={formData.percentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              percentage: e.target.value,
                            })
                          }
                          placeholder="Percentage"
                          min="0"
                          max="100"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div> */}

                  {/* slab range section  */}
                  {formData.slab_type && (
                    <div
                      className={`border-t pt-6 transition-all duration-500 ease-out ${
                        showRangeFields
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-4 pointer-events-none"
                      }`}
                    >
                      <Label className="text-lg font-semibold mb-b block ">
                        {formData.slab_type === "percentage"
                          ? "Percentage Configuration"
                          : "Slab Range Configuration"}
                      </Label>

                      <div>
                        {/* volume/value — show min and max range */}
                        {(formData.slab_type === "volume" ||
                          formData.slab_type === "value") && (
                          <>
                            <div>
                              <Label>
                                {" "}
                                Min Range{" "}
                                <span className="text-red-500">*</span>
                              </Label>

                              <TextInput
                                id="min-range"
                                type="number"
                                value={formData.min_range}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    min_range: e.target.value,
                                  })
                                }
                                placeholder="Min Range"
                                min="0"
                              />
                            </div>
                            <div>
                              <Label>
                                Max Range{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <TextInput
                                id="max-range"
                                type="number"
                                value={formData.max_range}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    max_range: e.target.value,
                                  })
                                }
                                placeholder="Max Range"
                                min="0"
                              />
                            </div>
                          </>
                        )}

                        {/* PErcentage case */}

                        {formData.slab_type === "percentage" && (
                          <div>
                            <Label htmlFor="perc-slab">
                              Achievement Percentage (%){" "}
                              <span className="text-red-500">*</span>
                            </Label>

                            <TextInput
                              id="perc-slab"
                              type="number"
                              value={formData.perc_slab}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  perc_slab: e.target.value,
                                })
                              }
                              placeholder="e.g. 80"
                              min="0"
                            />
                          </div>
                        )}

                        {/* dropdown to select the target */}
                        <div className="md:col-span-2 border-t pt-4 mt-2">
                          <Label className="text-base font-semibold mb-3 block">
                            Map Targets{" "}
                            <span className="text-gray-400 text-xs font-normal">
                              (optional)
                            </span>
                          </Label>

                          {targetDropdownLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Spinner size="sm" /> Loading Targets...
                            </div>
                          ) : targetDropdown.length === 0 ? (
                            <p className="text-sm text-gray-400">
                              No targets found for this slab type
                            </p>
                          ) : (
                            <>
                              {/* dropdown to add the targets */}

                              <Select
                                value=""
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val && !selectedTargetIds.includes(val)) {
                                    setSelectedTargetIds((prev) => [
                                      ...prev,
                                      val,
                                    ]);
                                  }
                                }}
                              >
                                <option value="">Select a target to add</option>
                                {targetDropdown
                                  .filter(
                                    (t) => !selectedTargetIds.includes(t._id),
                                  )
                                  .map((t) => (
                                    <option key={t._id} value={t._id}>
                                      {t.name} — {t.retailerName} (
                                      {t.retailerUID}) | {t.distributorName}
                                    </option>
                                  ))}
                              </Select>

                              {/* Selected targets as removable pills */}
                              {selectedTargetIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {selectedTargetIds.map((id) => {
                                    const t = targetDropdown.find(
                                      (x) => x._id === id,
                                    );
                                    if (!t) return null;
                                    return (
                                      <span
                                        key={id}
                                        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium"
                                      >
                                        <span>{t.name}</span>
                                        <span className="text-blue-400 text-xs">
                                          {t.retailerUID}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedTargetIds((prev) =>
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

                        {/* dicount box */}
                        <div>
                          <Label htmlFor="discount">Discount (%)</Label>
                          <TextInput
                            id="discount"
                            type="number"
                            value={formData.discount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                discount: e.target.value,
                              })
                            }
                            placeholder="Optional discount"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button color="gray" onClick={handleReset}>
                      Reset
                    </Button>
                    <Button
                      color="blue"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Spinner className="mr-2" size="sm" />}
                      {isSubmitting ? "Creating..." : "Create Slab"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Add Filter Section before the table */}
          <div className="w-full max-w-4xl mb-4">
            <div className="flex gap-4 items-center">
              <Label htmlFor="filter-status">Filter by Status:</Label>
              <Select
                id="filter-status"
                value={filterIsActive}
                onChange={(e) => setFilterIsActive(e.target.value)}
                className="w-48"
              >
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </Select>
            </div>
          </div>

          {/* Active Slabs Table */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <div className="w-full max-w-4xl overflow-x-auto">
              <Table striped>
                <Table.Head className="text-center">
                  <Table.HeadCell>Slab Name</Table.HeadCell>
                  <Table.HeadCell>Slab UID</Table.HeadCell>
                  <Table.HeadCell>Slab Type</Table.HeadCell>

                  <Table.HeadCell>Linked Targets</Table.HeadCell>
                  <Table.HeadCell>Range / Percentage</Table.HeadCell>
                  <Table.HeadCell>Scheme % (Discount)</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  {(pagePermission?.update || pagePermission?.delete) && (
                    <Table.HeadCell>Actions</Table.HeadCell>
                  )}
                </Table.Head>
                <Table.Body>
                  {slabsLoading ? (
                    <Table.Row className="text-center">
                      <Table.Cell colSpan="6">
                        <div className="w-full flex justify-center items-center">
                          <Spinner size="xl" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : slabs.length === 0 ? (
                    <Table.Row className="text-center">
                      <Table.Cell colSpan="6">
                        {" "}
                        No Active Slabse are found
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    slabs.map((slab) => (
                      <Table.Row key={slab._id} className="text-center">
                        {/* slab name */}
                        <Table.Cell className="font-medium">
                          {slab.name}
                        </Table.Cell>
                        {/* Slab uid */}
                         <Table.Cell className="font-medium">
                          {slab.slab_uid}
                        </Table.Cell>
                        {/* slab type */}
                        <Table.Cell>
                          <Badge
                            color={
                              slab.slab_type === "volume"
                                ? "info"
                                : slab.slab_type === "value"
                                  ? "purple"
                                  : "success"
                            }
                            className="justify-center items-center"
                          >
                            {slab.slab_type.toUpperCase()}
                          </Badge>
                        </Table.Cell>

                        {/* Linked Targets */}
                        <Table.Cell>
                          <TargetPopover targets={slab.targets} />
                        </Table.Cell>

                        {/* Range/Percentage */}
                        <Table.Cell>
                          {slab.slab_type === "percentage" ? (
                            <span className="text-green-600 font-semibold text-sm">
                              {slab.perc_slab}%
                            </span>
                          ) : (
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {slab.min_range?.toLocaleString()} –{" "}
                              {slab.max_range?.toLocaleString()}
                            </span>
                          )}
                        </Table.Cell>

                        {/* Scheme percentage(discount) */}
                        <Table.Cell>
                          {slab.discount != null ? (
                            <Badge
                              color="warning"
                              className="justify-center items-center"
                            >
                              {slab.discount}%
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </Table.Cell>

                        {/* Status */}
                        <Table.Cell>
                          <Badge
                            color={slab.is_active ? "success" : "failure"}
                            className="justify-center items-center"
                          >
                            {slab.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </Table.Cell>

                        {/* Actions */}
                        {(pagePermission?.update || pagePermission?.delete) && (
                          <Table.Cell>
                            <div className="flex justify-center gap-2">
                              {pagePermission?.update && (
                                <Button
                                  color="light"
                                  size="sm"
                                  onClick={() => handleEditClick(slab)}
                                >
                                  <HiPencil className="h-4 w-4" />
                                </Button>
                              )}
                              {pagePermission?.delete && (
                                <Button
                                  color="failure"
                                  size="sm"
                                  onClick={() => handleDeleteClick(slab)}
                                >
                                  <HiTrash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </Table.Cell>
                        )}
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>

          <EditSlabModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            slab={selectedSlab}
            onSuccess={handleEditSuccess}
          />

          <DeleteConfirmModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
            slabName={slabToDelete?.name}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center h-[70vh] w-full">
          <div className="text-center">
            <div className="text-red-600 text-4xl font-bold mb-2">
              NO Access
            </div>
            <div className="text-gray-500 text-lg">
              You do not have permission to view this page.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondarySlab;
