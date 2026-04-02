import {
  Button,
  Card,
  Label,
  Modal,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSlab, updateSlab } from "../../api/rewardsApi";
import { useSelector } from "react-redux";

export const RetailerMultiplierSlabConfig = () => {
  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role;

  const [slabConfigs, setSlabConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    slabType: "",
    description: "",
    status: "active",
    slabs: [],
  });

  // Fetch reward slabs on component mount
  useEffect(() => {
    fetchSlabConfigs();
  }, []);

  const fetchSlabConfigs = async () => {
    try {
      setLoading(true);
      const response = await getSlab();
      if (response?.data?.data) {
        setSlabConfigs(response.data.data);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch slab configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlab = (slabConfig) => {
    setFormData({
      slabType: slabConfig.slabType || "",
      description: slabConfig.description || "",
      status: slabConfig.status || "active",
      slabs: slabConfig.slabs || [],
    });
    setOpenModal(true);
  };

  const handleSlabChange = (index, field, value) => {
    const updatedSlabs = [...formData.slabs];
    updatedSlabs[index] = {
      ...updatedSlabs[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      slabs: updatedSlabs,
    });
  };

  const addNewSlab = () => {
    const newSlab = {
      slabName: "",
      description: "",
      percentage: 0,
    };
    setFormData({
      ...formData,
      slabs: [...formData.slabs, newSlab],
    });
  };

  const removeSlab = (index) => {
    const updatedSlabs = formData.slabs.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      slabs: updatedSlabs,
    });
  };

  const validateForm = () => {
    if (!formData.slabType.trim()) {
      toast.error("Slab type is required");
      return false;
    }

    if (formData.slabs.length === 0) {
      toast.error("At least one slab is required");
      return false;
    }

    for (let i = 0; i < formData.slabs.length; i++) {
      const slab = formData.slabs[i];
      if (!slab.slabName.trim()) {
        toast.error(`Slab name is required for slab ${i + 1}`);
        return false;
      }
      if (slab.percentage < 0 || slab.percentage > 100) {
        toast.error(`Percentage must be between 0 and 100 for slab ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleUpdateSlab = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const payload = {
        slabType: formData.slabType,
        description: formData.description,
        status: formData.status,
        slabs: formData.slabs,
      };

      await updateSlab(payload);
      toast.success("Slab configuration updated successfully");
      setOpenModal(false);
      fetchSlabConfigs(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to update slab configuration");
    } finally {
      setFormLoading(false);
    }
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setFormData({
      slabType: "",
      description: "",
      status: "active",
      slabs: [],
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Retailer Multiplier Slab Configuration
          </h1>
          <Button onClick={fetchSlabConfigs} color="gray" size="sm">
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          {slabConfigs.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No slab configurations found. Default slabs will be created
                  automatically.
                </p>
              </div>
            </Card>
          ) : (
            slabConfigs.map((slabConfig) => (
              <Card key={slabConfig._id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {slabConfig.slabType}
                    </h3>
                    {slabConfig.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {slabConfig.description}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                        slabConfig.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {slabConfig.status}
                    </span>
                  </div>
                  {role === "admin" ? (
                    <Button
                      size="sm"
                      onClick={() => handleEditSlab(slabConfig)}
                    >
                      Edit Configuration
                    </Button>
                  ) : null}
                </div>

                {slabConfig.slabs && slabConfig.slabs.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Slabs:
                    </h4>
                    <div className="grid gap-3">
                      {slabConfig.slabs.map((slab, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {slab.slabName}
                            </p>
                            {slab.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {slab.description}
                              </p>
                            )}
                          </div>
                          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {slab.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={openModal} size="2xl" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Edit Slab Configuration
            </h3>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="slabType" value="Slab Type *" />
                <TextInput
                  id="slabType"
                  value={formData.slabType}
                  disabled
                  onChange={(e) =>
                    setFormData({ ...formData, slabType: e.target.value })
                  }
                  placeholder="Enter slab type"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" value="Description" />
                <TextInput
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description (optional)"
                />
              </div>

              <div>
                <Label htmlFor="status" value="Status *" />
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label value="Slabs *" />
                  <Button size="sm" onClick={addNewSlab}>
                    Add Slab
                  </Button>
                </div>

                <div className="space-y-3 max-h-64">
                  {formData.slabs.map((slab, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Slab {index + 1}
                        </span>
                        <Button
                          size="xs"
                          color="failure"
                          onClick={() => removeSlab(index)}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        <div>
                          <Label
                            htmlFor={`slabName-${index}`}
                            value="Slab Name *"
                          />
                          <TextInput
                            id={`slabName-${index}`}
                            value={slab.slabName || ""}
                            onChange={(e) =>
                              handleSlabChange(
                                index,
                                "slabName",
                                e.target.value
                              )
                            }
                            placeholder="Enter slab name"
                            required
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor={`slabDescription-${index}`}
                            value="Description"
                          />
                          <TextInput
                            id={`slabDescription-${index}`}
                            value={slab.description || ""}
                            onChange={(e) =>
                              handleSlabChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Enter description (optional)"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor={`percentage-${index}`}
                            value="Percentage *"
                          />
                          <TextInput
                            id={`percentage-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={slab.percentage || ""}
                            onChange={(e) =>
                              handleSlabChange(
                                index,
                                "percentage",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Enter percentage (0-100)"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.slabs.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                      No slabs configured. Click "Add Slab" to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleUpdateSlab} disabled={formLoading}>
            {formLoading ? <Spinner size="sm" /> : "Update Configuration"}
          </Button>
          <Button color="gray" onClick={onCloseModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
