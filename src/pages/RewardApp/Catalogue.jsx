import {
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoMdAddCircle } from "react-icons/io";
import { RiRefreshFill } from "react-icons/ri";
import EditButton from "../../assets/common/EditButton";
import { StatusIndicatorNew } from "../../assets/common/StatusIndicator";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import {
  addCatalogue,
  getAllCatalogues,
  updateCatalogue,
} from "../../api/rewardsApi";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { FiExternalLink } from "react-icons/fi";

const Catalogue = () => {
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCatalogues, setFilteredCatalogues] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState([{ url: "", fileType: "image" }]);
  const [status, setStatus] = useState("draft");
  const [modalMode, setModalMode] = useState("add");
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState("default");

  // Fetch catalogues on component mount
  const fetchCatalogues = async () => {
    setLoading(true);
    try {
      const res = await getAllCatalogues(); // Implement this API call
      setCatalogues(res?.data?.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch catalogues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogues();
  }, []);

  // Apply filter
  useEffect(() => {
    if (filterStatus === "default") {
      setFilteredCatalogues(catalogues);
    } else {
      setFilteredCatalogues(
        catalogues?.filter((cat) => cat?.status === filterStatus)
      );
    }
  }, [catalogues, filterStatus]);

  const handleResetFilter = () => {
    setFilterStatus("default");
    fetchCatalogues();
  };

  const validate = () => {
    if (title.trim() === "") {
      toast.error("Please enter catalogue title");
      return false;
    }
    if (!url || !Array.isArray(url) || url.length === 0) {
      toast.error("At least one URL is required");
      return false;
    }
    for (let i = 0; i < url.length; i++) {
      if (!url[i].url || url[i].url.trim() === "") {
        toast.error(`URL at index ${i} is required`);
        return false;
      }
      if (
        !url[i].fileType ||
        !["pdf", "image", "video"].includes(url[i].fileType)
      ) {
        toast.error(`Invalid fileType at index ${i}`);
        return false;
      }
    }
    return true;
  };

  const handleSetEdit = (catalogue) => {
    setSelectedCatalogue(catalogue);
    setModalMode("edit");
    setTitle(catalogue?.title);
    setUrl(catalogue?.url ?? [{ url: "", fileType: "image" }]);
    setStatus(catalogue?.status ?? "draft");
    setOpenModal(true);
  };

  const handleAddCatalogue = async () => {
    try {
      setFormLoading(true);
      if (!validate()) return;
      const payload = {
        title,
        url,
        status,
      };
      await addCatalogue(payload); // Implement this API call
      await fetchCatalogues(); // Refresh list after adding
      onCloseModal();
      toast.success("Catalogue added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add catalogue, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedCatalogue(null);
    setTitle("");
    setUrl([{ url: "", fileType: "image" }]);
    setStatus("draft");
  };

  const handleEditCatalogue = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this catalogue?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;
            const payload = {
              title,
              url,
              status,
            };
            await updateCatalogue(selectedCatalogue?._id, payload); // Implement this API call
            await fetchCatalogues(); // Refresh list after update
            toast.success("Catalogue updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
                "Failed to update catalogue, try again"
            );
          } finally {
            setFormLoading(false);
          }
        } else {
          onCloseModal();
        }
      },
    });
  };

  const handleStatusUpdate = async (catalogue) => {
    openConfirmationModel({
      question: `Are you sure you want to ${
        catalogue.status === "active" ? "deactivate" : "activate"
      } this catalogue?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: catalogue.status === "active" ? "inactive" : "active",
            };
            await updateCatalogue(catalogue._id, payload); // API call
            await fetchCatalogues(); // Refresh list
            toast.success("Status updated successfully");
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
                "Failed to update catalogue status"
            );
          }
        }
      },
    });
  };

  // Function to render file preview based on file type
  const renderFilePreview = (file) => {
    if (!file || !file.url) return null;

    switch (file.fileType) {
      case "image":
        return (
          <img
            src={file.url}
            alt="Catalogue Image"
            className="max-w-full h-40 rounded-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "placeholder-image-url";
            }} // Optional: add error handling for broken images
          />
        );
      case "video":
        return (
          <video controls className="max-w-full h-auto rounded-lg">
            <source src={file.url} type="video/mp4" />{" "}
            {/* You might need to adjust types */}
            Your browser does not support the video tag.
          </video>
        );
      case "pdf":
        return (
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            View PDF
            <FiExternalLink size={16} />
          </a>
        );
      default:
        return <p>Unsupported file type</p>;
    }
  };

  return (
    <div className="flex justify-start items-center flex-col gap-4 w-full">
      {/* page header */}
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold">Catalogue Master</h1>
        </div>
      </div>

      {/* filters */}
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="w-full flex justify-center items-center flex-col">
          {/* filter card header */}
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Count : {catalogues.length} </Badge>
            <Badge color="warning">
              Filtered Count : {filteredCatalogues.length}{" "}
            </Badge>
          </div>
          {/* filter div */}
          <div className="flex justify-center w-full items-center gap-4 flex-wrap">
            {/* filter : 1 */}
            <div className="w-56">
              <div className="mb-2 block">
                <Label htmlFor="statusSelect" value="Select Status" />
              </div>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                id="statusSelect"
                required
              >
                <option value="default">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
          </div>
          {/* btns */}
          <div className="flex justify-center w-full items-center gap-2 flex-wrap">
            <Button
              className="text-xs"
              size="sm"
              color="success"
              onClick={handleResetFilter}
            >
              <span className="flex justify-center items-center gap-2">
                <RiRefreshFill size={20} />
                Reset & Refresh
              </span>
            </Button>
            <Button
              className="text-xs"
              size="sm"
              onClick={() => setOpenModal(true)}
            >
              <span className="flex justify-center items-center gap-2">
                <IoMdAddCircle size={20} />
                Add Catalogue
              </span>
            </Button>
          </div>
        </Card>
      </div>

      {/* table */}
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        {loading ? (
          <div
            className="w-full flex justify-center items-center"
            role="status"
          >
            <Spinner aria-label="Default status example" size="xl" />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table striped>
              <Table.Head className="text-center">
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Image</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {filteredCatalogues?.map((catalogue, index) => (
                  <Table.Row
                    key={index}
                    className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                      <div className="flex justify-center items-center gap-2">
                        {catalogue?.title}
                        <FiExternalLink
                          color="#3795BD"
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedCatalogue(catalogue);
                            setShowDetailModal(true);
                          }}
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                      <div className="flex justify-center items-center">
                        {catalogue?.url[0]?.fileType === "image" ? (
                          <img
                            src={catalogue?.url[0]?.url}
                            alt="Catalogue"
                            className="w-20 h-20 object-cover rounded"
                          />
                        ) : (
                          "--"
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                      <StatusIndicatorNew
                        status={catalogue.status}
                        onClick={() => handleStatusUpdate(catalogue)}
                      />
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                      <div className="flex gap-2 justify-center items-center">
                        <EditButton onClick={() => handleSetEdit(catalogue)} />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {filteredCatalogues.length === 0 && (
                  <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell
                      colSpan={"100%"}
                      className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                    >
                      No data found
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <Modal show={openModal} size="xl" onClose={onCloseModal}>
        <Modal.Header>
          {modalMode === "add" ? "Add Catalogue" : "Edit Catalogue"}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-5">
            <div className="w-full">
              <div className="mb-2 block text-gray-700 dark:text-gray-100">
                <Label value="Catalogue Title *" />
              </div>
              <TextInput
                placeholder="Enter Catalogue Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            {/* URLs */}
            {url?.map((file, index) => (
              <div key={index} className="w-full flex items-center gap-2">
                {" "}
                {/* Added `items-center` and `gap-2` */}
                <div className="flex-shrink-0">
                  {" "}
                  {/* Added a container for Select */}
                  <Select
                    value={file.fileType}
                    onChange={(e) => {
                      const newUrls = [...url];
                      newUrls[index].fileType = e.target.value;
                      setUrl(newUrls);
                    }}
                  >
                    <option value="pdf">PDF</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </Select>
                </div>
                <div className="flex-grow">
                  {" "}
                  {/* Added a container for TextInput to take available space */}
                  <TextInput
                    placeholder="Enter URL"
                    value={file?.url}
                    onChange={(e) => {
                      const newUrls = [...url];
                      newUrls[index].url = e.target.value;
                      setUrl(newUrls);
                    }}
                  />
                </div>
                {/* Upload button */}
                <div className="flex-shrink-0">
                  {" "}
                  {/* Added a container for FileUpload */}
                  <FileUpload
                    onSetFileUrl={(uploadedUrl) => {
                      const newUrls = [...url];
                      newUrls[index].url = uploadedUrl; // Set uploaded file URL
                      setUrl(newUrls);
                    }}
                    type="single-file"
                    page="modal-form"
                  />
                </div>
                {/* Optional: Add button to remove URL */}
                {index > 0 && ( // Changed condition to allow removing all but the first
                  <div className="flex-shrink-0">
                    {" "}
                    {/* Added a container for the Remove button */}
                    <Button
                      size="xs"
                      color="gray"
                      onClick={() => {
                        const newUrls = [...url];
                        newUrls.splice(index, 1);
                        setUrl(
                          newUrls.length > 0
                            ? newUrls
                            : [{ url: "", fileType: "image" }]
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {/* Button to add more URLs */}
            <Button
              size="xs"
              onClick={() => setUrl([...url, { url: "", fileType: "image" }])}
            >
              Add More URLs
            </Button>
            {/* Status */}
            <div className="w-full">
              <div className="mb-2 block text-gray-700 dark:text-gray-100">
                <Label value="Status" />
              </div>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                id="statusSelect"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            {/* Submit Button */}
            <div className="w-full">
              <Button
                onClick={
                  modalMode === "add" ? handleAddCatalogue : handleEditCatalogue
                }
                disabled={formLoading}
                className={`${
                  formLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {formLoading ? (
                  <Spinner size="sm" aria-label="Loading spinner" />
                ) : modalMode === "add" ? (
                  "Add Catalogue"
                ) : (
                  "Update Catalogue"
                )}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        size="xl" // Adjust size as needed
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCatalogue(null); // Clear selected catalogue when closing
        }}
        className="dark: text-white"
      >
        <Modal.Header>{selectedCatalogue?.title} Details</Modal.Header>
        <Modal.Body>
          {selectedCatalogue && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Title:</h3>
                <p>{selectedCatalogue.title}</p>
              </div>
              <div className="flex flex-col gap-2 w-fit">
                <h3 className="text-lg font-bold">Status:</h3>
                <Badge
                  color={
                    selectedCatalogue.status === "active"
                      ? "success"
                      : selectedCatalogue.status === "inactive"
                      ? "failure"
                      : "warning"
                  }
                  className=""
                >
                  {selectedCatalogue?.status?.toUpperCase()}
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">Images:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedCatalogue.url.map((file, index) => (
                    <div key={index} className="border p-2 rounded-lg">
                      <p className="font-normal text-sm">
                        {file.fileType === "image"
                          ? "Image File"
                          : file.fileType === "pdf"
                          ? "PDF File"
                          : "Video File"}
                      </p>
                      {renderFilePreview(file)}
                    </div>
                  ))}
                </div>
              </div>
              {/* You can add more details here as needed */}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Catalogue;
