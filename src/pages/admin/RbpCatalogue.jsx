import { Badge, Button, Card, Label, Modal, Select, Spinner, Table, TextInput, Textarea } from "flowbite-react";
import { useEffect, useState, useMemo, useContext } from "react";
import toast from "react-hot-toast";
import { IoMdAddCircle } from "react-icons/io";
import { RiRefreshFill } from "react-icons/ri";
import { MdPictureAsPdf } from "react-icons/md";
import { RBPCatalogueList, createRBPCatalogue, updateRBPCatalogue, deleteRBPCatalogue } from "../../api/rbp-catalogue";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../utils/permissionHelper";

const RbpCatalogue = () => {
  const [catalogueData, setCatalogueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal and form states
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    fileUrl: "",
    status: true,
  });

  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "rbp-catalogue"
    );

    setPagePermission(permission);
  }, [permissionState]);

  // CRUD Handlers
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!formData.imageUrl.trim()) {
      toast.error("Image URL is required");
      return false;
    }
    if (!formData.fileUrl.trim()) {
      toast.error("File URL is required");
      return false;
    }
    return true;
  };

  const handleCreateCatalogue = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        fileUrl: formData.fileUrl,
        status: formData.status,
      };

      await createRBPCatalogue(payload);
      toast.success("Catalogue created successfully");
      onCloseModal();
      fetchCatalogueData();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create catalogue");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCatalogue = async () => {
    if (!validateForm()) return;

    openConfirmationModel({
      question: "Are you sure you want to update this catalogue?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            const payload = {
              title: formData.title,
              description: formData.description,
              imageUrl: formData.imageUrl,
              fileUrl: formData.fileUrl,
              status: formData.status,
            };

            await updateRBPCatalogue(selectedCatalogue._id, payload);
            toast.success("Catalogue updated successfully");
            onCloseModal();
            fetchCatalogueData();
          } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update catalogue");
          } finally {
            setFormLoading(false);
          }
        }
      },
    });
  };

  const handleDeleteCatalogue = async (catalogue) => {
    openConfirmationModel({
      question: "Are you sure you want to delete this catalogue?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            await deleteRBPCatalogue(catalogue._id);
            toast.success("Catalogue deleted successfully");
            fetchCatalogueData();
          } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to delete catalogue");
          }
        }
      },
    });
  };

  const handleStatusUpdate = async (catalogue) => {
    openConfirmationModel({
      question: `Are you sure you want to ${catalogue.status ? "deactivate" : "activate"} this catalogue?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = { status: !catalogue.status };
            await updateRBPCatalogue(catalogue._id, payload);
            toast.success("Status updated successfully");
            fetchCatalogueData();
          } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
          }
        }
      },
    });
  };

  const handleSetEdit = (catalogue) => {
    setSelectedCatalogue(catalogue);
    setModalMode("edit");
    setFormData({
      title: catalogue.title || "",
      description: catalogue.description || "",
      imageUrl: catalogue.imageUrl || "",
      fileUrl: catalogue.fileUrl || "",
      status: catalogue.status,
    });
    setOpenModal(true);
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      fileUrl: "",
      status: true,
    });
    setSelectedCatalogue(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const fetchCatalogueData = async () => {
    setLoading(true);
    try {
      const payload = {};

      // Add status filter if not "all"
      if (statusFilter !== "all") {
        payload.status = statusFilter === "active";
      }

      const response = await RBPCatalogueList(payload);

      if (response.status === 200) {
        setCatalogueData(response.data.data || []);
      } else {
        toast.error(response.message || "Failed to fetch catalogue data");
      }
    } catch (error) {
      console.error("Error fetching catalogue data:", error);
      toast.error("Failed to fetch catalogue data");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };



  // Filter data client-side (only search, status filtering is done server-side)
  const filteredData = useMemo(() => {
    let filtered = catalogueData;

    // Apply search filter only (status filtering is done via API)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.catalogueId && item.catalogueId.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [catalogueData, searchQuery]);

  useEffect(() => {
    fetchCatalogueData();
  }, [statusFilter]);

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">RBP Catalogue</h1>
            </div>
          </div>

          {/* Filters Section */}
          <div className="w-full p-2">
            <Card className="w-full p-3 flex flex-col gap-3 text-xs">
              {/* Header Badges */}
              <div className="flex flex-wrap justify-center gap-2">
                <Badge color="warning" className="px-2 py-1">
                  Total: {filteredData.length}
                </Badge>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 justify-center items-center">
                {/* Search */}
                <div className="w-40">
                  <Label
                    htmlFor="searchInput"
                    value="Search"
                    className="sr-only"
                  />
                  <TextInput
                    id="searchInput"
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sizing="sm"
                    className="h-8 text-xs"
                    aria-label="Search"
                  />
                </div>

                {/* Status */}
                <div className="w-40">
                  <Label
                    htmlFor="statusSelect"
                    value="Select Status"
                    className="sr-only"
                  />
                  <Select
                    id="statusSelect"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sizing="sm"
                    className="h-8 text-xs"
                    aria-label="Select Status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>

                {pagePermission?.view && (
                  <Button
                    size="xs"
                    color="success"
                    onClick={handleResetFilter}
                    aria-label="Reset and Refresh"
                    className="text-[11px]"
                  >
                    <span className="flex items-center gap-1">
                      <RiRefreshFill size={16} />
                      <span className="hidden sm:inline">Reset & Refresh</span>
                    </span>
                  </Button>
                )}

                {pagePermission?.create && (
                  <Button
                    size="xs"
                    onClick={() => setOpenModal(true)}
                    aria-label="Add Catalogue"
                    className="text-[11px]"
                  >
                    <span className="flex items-center gap-1">
                      <IoMdAddCircle size={16} />
                      <span className="hidden sm:inline">Add Catalogue</span>
                    </span>
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Catalogue List */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            {loading ? (
              <div
                className="w-full flex justify-center items-center"
                role="status"
              >
                <Spinner aria-label="Loading data" size="xl" />
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table hoverable className="w-full">
                  <Table.Head>
                    <Table.HeadCell className="text-center bg-gray-50 dark:bg-gray-700">
                      PDF
                    </Table.HeadCell>
                    <Table.HeadCell className="text-center bg-gray-50 dark:bg-gray-700">
                      Image
                    </Table.HeadCell>
                    <Table.HeadCell className="text-center bg-gray-50 dark:bg-gray-700">
                      Title
                    </Table.HeadCell>
                    <Table.HeadCell className="text-center bg-gray-50 dark:bg-gray-700">
                      Status
                    </Table.HeadCell>
                    {(pagePermission?.update || pagePermission?.delete) && (
                      <Table.HeadCell className="text-center bg-gray-50 dark:bg-gray-700">
                        Actions
                      </Table.HeadCell>
                    )}
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {filteredData?.length > 0 ? (
                      filteredData?.map((item) => (
                        <Table.Row
                          key={item?._id}
                          className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="text-center">
                            <MdPictureAsPdf
                              size={40}
                              className="text-red-500 cursor-pointer hover:text-red-700 mx-auto"
                              onClick={() => window.open(item?.fileUrl, '_blank')}
                              title="View PDF"
                            />
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <img
                              src={item?.imageUrl}
                              alt={item?.title}
                              className="w-16 h-16 object-contain rounded mx-auto block"
                              onClick={() => window.open(item?.imageUrl, '_blank')}
                              style={{ cursor: 'pointer' }}
                            />
                          </Table.Cell>
                          <Table.Cell className="text-center font-medium">
                            {item?.title}
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <StatusIndicator
                              status={item?.status}
                              onClick={pagePermission?.update ? () => handleStatusUpdate(item) : undefined}
                            />
                          </Table.Cell>
                          {(pagePermission?.update || pagePermission?.delete) && (
                            <Table.Cell className="text-center">
                              <div className="flex justify-center gap-4">
                                {pagePermission?.update && (
                                  <EditButton onClick={() => handleSetEdit(item)} />
                                )}
                                {pagePermission?.delete && (
                                  <Button
                                    size="xs"
                                    color="failure"
                                    onClick={() => handleDeleteCatalogue(item)}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </Table.Cell>
                          )}
                        </Table.Row>
                      ))
                    ) : (
                      <Table.Row>
                        <Table.Cell
                          colSpan={5}
                          className="text-center py-4 text-gray-500"
                        >
                          No catalogue items found
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            )}
          </div>
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

      {/* Create/Edit Modal */}
      {pagePermission?.create && (
        <Modal show={openModal && modalMode === "add"} onClose={onCloseModal} size="4xl">
          <Modal.Header>Add RBP Catalogue</Modal.Header>
          <Modal.Body>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" value="Title *" />
                  <TextInput
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter catalogue title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status" value="Status" />
                  <Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value === "true" }))}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" value="Description" />
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter catalogue description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageUrl" value="Image URL *" />
                  <div className="flex gap-2">
                    <TextInput
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      placeholder="Enter image URL"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="flex-1"
                      required
                    />
                    <FileUpload
                      onSetFileUrl={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      type="single-image"
                      page="modal-form"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fileUrl" value="File URL *" />
                  <div className="flex gap-2">
                    <TextInput
                      id="fileUrl"
                      name="fileUrl"
                      type="url"
                      placeholder="Enter file URL"
                      value={formData.fileUrl}
                      onChange={handleChange}
                      className="flex-1"
                      required
                    />
                    <FileUpload
                      onSetFileUrl={(url) => setFormData(prev => ({ ...prev, fileUrl: url }))}
                      type="single-file"
                      page="modal-form"
                    />
                  </div>
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={onCloseModal}>
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleCreateCatalogue}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Catalogue"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {pagePermission?.update && (
        <Modal show={openModal && modalMode === "edit"} onClose={onCloseModal} size="4xl">
          <Modal.Header>Edit RBP Catalogue</Modal.Header>
          <Modal.Body>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" value="Title *" />
                  <TextInput
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter catalogue title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status" value="Status" />
                  <Select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value === "true" }))}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" value="Description" />
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter catalogue description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageUrl" value="Image URL *" />
                  <div className="flex gap-2">
                    <TextInput
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      placeholder="Enter image URL"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="flex-1"
                      required
                    />
                    <FileUpload
                      onSetFileUrl={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      type="single-image"
                      page="modal-form"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fileUrl" value="File URL *" />
                  <div className="flex gap-2">
                    <TextInput
                      id="fileUrl"
                      name="fileUrl"
                      type="url"
                      placeholder="Enter file URL"
                      value={formData.fileUrl}
                      onChange={handleChange}
                      className="flex-1"
                      required
                    />
                    <FileUpload
                      onSetFileUrl={(url) => setFormData(prev => ({ ...prev, fileUrl: url }))}
                      type="single-file"
                      page="modal-form"
                    />
                  </div>
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={onCloseModal}>
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleUpdateCatalogue}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Catalogue"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default RbpCatalogue;
