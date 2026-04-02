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
import { createPrimarySlab, getAllPrimarySlab, deletePrimarySlab, updatePrimarySlab } from "../../api/api";

import { TbReceiptYuan } from "react-icons/tb";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../utils/permissionHelper";
import { getPrimaryTargetsList } from "../../api/primaryTargetsApi";
import { useRef } from "react";
import { Modal } from "flowbite-react";
import UniqueCode from "../../assets/common/UniqueCode";



const PrimarySlab = () => {
  const [formData, setFormData] = useState({
    name: "",
    slab_type: "",
    min_range: "",
    max_range: "",
    total_percentage: "",
    discount_percentage: "",
    is_active: true,
  });
  const [slabs, setSlabs] = useState([]);
  const [slabsLoading, setSlabsLoading] = useState(false);
  const [filterSlabType, setFilterSlabType] = useState("");
  const [editingSlabId, setEditingSlabId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  const [targets, setTargets] = useState([]);
  const [targetSearch, setTargetSearch] = useState("");
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const dropdownRef = useRef();
  const [openTargets, setOpenTargets] = useState(null);
  const [showTargetsModal, setShowTargetsModal] = useState(false);
  const [selectedSlabTargets, setSelectedSlabTargets] = useState([]);


  const openTargetsModal = (targets) => {
    setSelectedSlabTargets(targets || []);
    setShowTargetsModal(true);
  };

const fetchTargets = async () => {
  try {
    const response = await getPrimaryTargetsList({
      page: 1,
      limit: 1000,
    });

    const allTargets = response?.data?.data || [];

    // ✅ FILTER HERE
    const activeTargets = allTargets.filter(
      (t) => t.isActive === true && t.approval_status === "Approved"
    );


    setTargets(activeTargets);

  } catch (error) {
    console.log(error);
    toast.error("Failed to load targets");
  }
};

  useEffect(() => {
    fetchTargets();
  }, []);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "primary-slab-setting"
    );

    setPagePermission(permission);
  }, [permissionState]);


  const validateForm = () => {
    return true;
  };
  const filteredTargets = targets.filter((target) =>
    target?.distributorId?.name
      ?.toLowerCase()
      .includes(targetSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      let payload = {
        name: formData.name,
        slab_type: formData.slab_type,
        is_active: formData.is_active,
        targetIds: selectedTargets.map((t) => t._id),
      };

      if (formData.slab_type === "percentage") {
        payload.total_percentage = Number(formData.total_percentage);
        payload.discount_percentage = Number(formData.discount_percentage);
      } else {
        payload.min_range = Number(formData.min_range);
        payload.max_range = Number(formData.max_range);
        payload.discount_percentage = Number(formData.discount_percentage);
      }

      const response = await createPrimarySlab(payload);

      if (response?.status === 201) {
        toast.success(response?.data?.message || "Slab created successfully");
        fetchSlabs();
      }

      setFormData({
        name: "",
        slab_type: "",
        min_range: "",
        max_range: "",
        total_percentage: "",
        discount_percentage: "",
        is_active: true,
      });

      setSelectedTargets([]);

    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create slab"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const fetchSlabs = async () => {
    try {
      setSlabsLoading(true);
      const query = {};

      if (filterSlabType && filterSlabType.trim() !== "") {
        query.slab_type = filterSlabType.toLowerCase();
      }

      if (statusFilter !== "") {
        query.status = statusFilter; // active / inactive
      }
      const response = await getAllPrimarySlab(query);
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
  }, [filterSlabType, statusFilter]);

  const handleReset = () => {
    setFormData({
      name: "",
      slab_type: "",
      min_range: "",
      max_range: "",
      is_active: true,
      discount_percentage: "",
    });
    setSelectedTargets([]);
    setTargetSearch("");

    setIsEditMode(false);
    setEditingSlabId(null);
  };

  const handleEditSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      let payload = {
        name: formData.name,
        slab_type: formData.slab_type,
        is_active: formData.is_active,
      };

      if (formData.slab_type === "percentage") {
        payload.total_percentage = Number(formData.total_percentage);
        payload.discount_percentage = Number(formData.discount_percentage);
      } else {
        payload.min_range = Number(formData.min_range);
        payload.max_range = Number(formData.max_range);
        payload.discount_percentage = Number(formData.discount_percentage);
      }

      await updatePrimarySlab(editingSlabId, payload);

      toast.success("Slab updated successfully");
      fetchSlabs();
      handleReset();

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update slab"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (slab) => {
    setIsEditMode(true);
    setEditingSlabId(slab._id);

    setFormData({
      name: slab.name,
      slab_type: slab.slab_type,
      min_range: slab.min_range || "",
      max_range: slab.max_range || "",
      total_percentage: slab.total_percentage || "",
      discount_percentage: slab.discount_percentage || "",
      is_active: slab.is_active,
    });

    const target = targets.find(
      (t) => t._id === slab.targetId?._id
    );

    setSelectedTargets(target ? [target] : []);
  };
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deletePrimarySlab(deleteId);

      toast.success(response?.data?.message || "Deleted successfully");

      fetchSlabs();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete slab"
      );
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTargetDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex flex-col gap-4 w-full">

          {/* Header */}
          <div className="border-b-2 py-4">
            <h1 className="text-2xl font-bold">Target Slab Setting</h1>
          </div>

          {(pagePermission?.create || pagePermission?.update) && (
            <div className="w-full p-4 flex justify-center">
              <Card className="w-full max-w-2xl mx-auto">

                <div className="space-y-4">

                  {/* Slab Name */}
                  <div>
                    <Label>
                      Slab Name <span className="text-red-500">*</span>
                    </Label>
                    <TextInput
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter Slab Name"
                    />
                  </div>

                  {/* Slab Type + Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <Label>
                        Slab Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.slab_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slab_type: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Slab Type</option>
                        <option value="volume">Volume</option>
                        <option value="value">Value</option>
                        <option value="percentage">Percentage</option>
                      </Select>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select
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
                  <div className="border-t pt-6">

                    <Label className="text-lg font-semibold mb-4 block">
                      Slab Range Configuration
                    </Label>

                    {formData.slab_type !== "percentage" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div>
                          <Label>Min Range *</Label>
                          <TextInput
                            type="number"
                            value={formData.min_range}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                min_range: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>Max Range *</Label>
                          <TextInput
                            type="number"
                            value={formData.max_range}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                max_range: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>Scheme Percentage % *</Label>
                          <TextInput
                            type="number"
                            value={formData.discount_percentage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                discount_percentage: e.target.value,
                              })
                            }
                          />
                        </div>

                      </div>
                    )}

                    {formData.slab_type === "percentage" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                          <Label>Total Percentege % *</Label>
                          <TextInput
                            type="number"
                            value={formData.total_percentage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                total_percentage: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>Scheme Percentage % *</Label>
                          <TextInput
                            type="number"
                            value={formData.discount_percentage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                discount_percentage: e.target.value,
                              })
                            }
                          />
                        </div>

                      </div>
                    )}

                    {/* Target Select */}
                    {
                      !isEditMode && (
                        <div className="mt-6 relative">

                          <Label>Target</Label>

                          <div className="flex items-center border rounded-lg bg-white dark:bg-gray-800">

                            <div
                              className="flex-1 px-3 py-2 text-sm cursor-pointer"
                              onClick={() =>
                                setShowTargetDropdown(!showTargetDropdown)
                              }
                            >
                              {selectedTargets.length > 0
                                ? `${selectedTargets.length} target(s) selected`
                                : "Select Target"}
                            </div>

                            {selectedTargets.length > 0 && (
                              <button
                                className="px-3 text-gray-500 hover:text-red-500"
                                onClick={() => {
                                  setSelectedTargets([]);
                                  setTargetSearch("");
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {showTargetDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow">

                              <div className="p-2 border-b">
                                <TextInput
                                  placeholder="Search distributor..."
                                  value={targetSearch}
                                  onChange={(e) =>
                                    setTargetSearch(e.target.value)
                                  }
                                />
                              </div>

                              <div className="max-h-56 overflow-y-auto">

                                {filteredTargets.map((target) => (
                                  <div
                                    key={target._id}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => {
                                      const exists = selectedTargets.find((t) => t._id === target._id);

                                      if (!exists) {
                                        setSelectedTargets([...selectedTargets, target]);
                                      }
                                    }}
                                  >
                                    {target.name} |{" "}
                                    {`${target.distributorId?.name} | ${target.brandId?.name || "All Brand"
                                      } | ${target.target_type === "value"
                                        ? target.targetValue
                                        : target.targetVolume + " Pc"
                                      } `}
                                  </div>
                                ))}

                                {filteredTargets.length === 0 && (
                                  <div className="p-3 text-center text-gray-400 text-sm">
                                    No targets found
                                  </div>
                                )}

                              </div>
                            </div>
                          )}

                        </div>
                      )
                    }


                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">

                    <Button color="gray" onClick={handleReset}>
                      Reset
                    </Button>

                    <Button
                      color="blue"
                      onClick={isEditMode ? handleEditSubmit : handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Spinner size="sm" className="mr-2" />
                      )}
                      {isEditMode ? "Update Slab" : "Create Slab"}
                    </Button>

                  </div>

                </div>

              </Card>
            </div>

          )}
          {/* Slab List Table */}
          <div className="w-full p-4">
            <Card>

              <div className="flex justify-between items-center mb-4">

                <div className="flex gap-3 items-center mb-4">
                  <h2 className="text-xl font-semibold">Slab List</h2>

                  {/* Slab Type Filter */}
                  <Select
                    className="w-48"
                    value={filterSlabType}
                    onChange={(e) => setFilterSlabType(e.target.value)}
                  >
                    <option value="">All Type</option>
                    <option value="volume">Volume</option>
                    <option value="value">Value</option>
                    <option value="percentage">Percentage</option>
                  </Select>

                  {/* ✅ NEW Status Filter */}
                  <Select
                    className="w-40"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>



              </div>

              {slabsLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table striped>

                    <Table.Head>
                      <Table.HeadCell>Slab UID</Table.HeadCell>
                      <Table.HeadCell>Slab Name</Table.HeadCell>

                      <Table.HeadCell>Target</Table.HeadCell>
                      <Table.HeadCell>Slab Type</Table.HeadCell>
                      <Table.HeadCell>Range / Percentage</Table.HeadCell>
                      <Table.HeadCell>Scheme %</Table.HeadCell>
                      <Table.HeadCell>Status</Table.HeadCell>
                      <Table.HeadCell>Action</Table.HeadCell>
                    </Table.Head>


                    <Table.Body className="divide-y">

                      {slabs?.length > 0 ? (
                        slabs.map((slab) => (
                          <Table.Row key={slab._id}>



                            <Table.Cell className="whitespace-nowrap font-medium text-blue-600 hover:!text-blue-800 cursor-pointer">
                              <UniqueCode
                                text={slab.slabUid || "-"}
                                codeName="SLAB UID"
                                className="text-yellow-300 font-semibold"

                              />
                            </Table.Cell>



                            <Table.Cell className="font-medium">
                              {slab.name}
                            </Table.Cell>
                            <Table.Cell>
                              <Button
                                size="xs"
                                color="gray"
                                onClick={() => openTargetsModal(slab.targetIds)}
                              >
                                View Targets ({slab.targetIds?.length || 0})
                              </Button>
                            </Table.Cell>

                            <Table.Cell className="capitalize">
                              {slab.slab_type}
                            </Table.Cell>

                            <Table.Cell>
                              {slab.slab_type === "percentage" ? (
                                <span>Total: {slab.total_percentage}%</span>
                              ) : (
                                <span>
                                  {slab.min_range} (min) -  {slab.max_range} (max)
                                </span>
                              )}
                            </Table.Cell>

                            <Table.Cell>
                              {slab.discount_percentage}%
                            </Table.Cell>

                            <Table.Cell>
                              <Badge color={slab.is_active ? "success" : "failure"}>
                                {slab.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </Table.Cell>

                            <Table.Cell className="flex gap-2">
                              {pagePermission?.update && (
                                <Button size="xs" color="info" onClick={() => handleEdit(slab)}>
                                  Edit
                                </Button>
                              )}

                              {pagePermission?.delete && (
                                <Button
                                  size="xs"
                                  color={slab.is_active ? "failure" : "gray"}
                                  onClick={() => handleDeleteClick(slab._id)}
                                  disabled={!slab.is_active}
                                >
                                  {slab.is_active ? "Deactivate" : "Inactive"}
                                </Button>
                              )}
                            </Table.Cell>

                          </Table.Row>
                        ))
                      ) : (
                        <Table.Row>
                          <Table.Cell colSpan="5" className="text-center py-6">
                            No slabs found
                          </Table.Cell>
                        </Table.Row>
                      )}

                    </Table.Body>

                  </Table>
                </div>
              )}

            </Card>
          </div>
          <Modal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            size="md"
            popup
          >
            <Modal.Header />

            <Modal.Body>
              <div className="text-center space-y-4">

                <div className="text-red-600 text-4xl">
                  ⚠
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Delete
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this slab?
                  This action cannot be undone.
                </p>

                <div className="flex justify-center gap-3 pt-4">

                  <Button color="failure" onClick={confirmDelete}>
                    Yes, Delete
                  </Button>

                  <Button
                    color="gray"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>

                </div>

              </div>
            </Modal.Body>

          </Modal>
          <Modal
            show={showTargetsModal}
            onClose={() => setShowTargetsModal(false)}
            size="lg"
          >
            <Modal.Header>
              Target Details
            </Modal.Header>

            <Modal.Body>

              {selectedSlabTargets.length > 0 ? (

                <Table striped>

                  <Table.Head>
                    <Table.HeadCell>Target Name</Table.HeadCell>
                    <Table.HeadCell>Distributor</Table.HeadCell>
                    <Table.HeadCell>Distributor Code</Table.HeadCell>



                  </Table.Head>

                  <Table.Body>

                    {selectedSlabTargets.map((target) => (
                      <Table.Row key={target._id}>
                        <Table.Cell>{target.name}</Table.Cell>
                        <Table.Cell>{target.distributorName}</Table.Cell>
                        <Table.Cell>{target.distributorCode}</Table.Cell>

                      </Table.Row>
                    ))}

                  </Table.Body>

                </Table>

              ) : (
                <div className="text-center py-6 text-gray-400">
                  No targets found
                </div>
              )}

            </Modal.Body>

            <Modal.Footer>
              <Button color="gray" onClick={() => setShowTargetsModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      ) : (
        <div className="flex justify-center items-center h-[70vh]">
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

export default PrimarySlab;