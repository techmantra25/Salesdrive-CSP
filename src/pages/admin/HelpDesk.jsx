import {
  Badge,
  Button,
  Label,
  Modal,
  Spinner,
  Table,
  TextInput,
  Textarea,
  Select,
} from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoMdAddCircle } from "react-icons/io";
import { RiRefreshFill } from "react-icons/ri";
import EditButton from "../../assets/common/EditButton";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import {
  createHelpDesk,
  getAllHelpDeskList,
  updateHelpDeskById,
  deleteHelpDeskById,
} from "../../api/api";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { MdDelete } from "react-icons/md";
import moment from "moment";
import {
  FaFileAlt,
  FaFileImage,
  FaFilePdf,
  FaFileVideo,
  FaFileWord,
} from "react-icons/fa";
import { LuDatabaseBackup } from "react-icons/lu";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getPagePermission } from "../../utils/permissionHelper";


const HelpDesk = () => {
  const [helpDeskList, setHelpDeskList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedHelpDesk, setSelectedHelpDesk] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [formLoading, setFormLoading] = useState(false);
  const [helpDeskLoading, setHelpDeskLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(""); // New type field
  const [fileUrl, setFileUrl] = useState("");

  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  const { userInfo } = useSelector((state) => state.user);

  const role = userInfo?.role;
  const navigate = useNavigate();
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "helpdesk");
    setPagePermission(permission);
  }, [permissionState]);


  // Fetch help desk list
  const fetchHelpDeskList = async () => {
    try {
      setHelpDeskLoading(true);
      const response = await getAllHelpDeskList();
      setHelpDeskList(response?.data?.data || response?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch help desk entries"
      );
    } finally {
      setHelpDeskLoading(false);
    }
  };

  // Form validation
  const validate = () => {
    if (title.trim() === "") {
      toast.error("Please enter title");
      return false;
    }
    if (type.trim() === "") {
      toast.error("Please select type");
      return false;
    }
    if (fileUrl.trim() === "") {
      toast.error("Please upload a file");
      return false;
    }
    return true;
  };

  // Handle edit
  const handleSetEdit = async (helpDesk) => {
    try {
      setSelectedHelpDesk(helpDesk);
      setModalMode("edit");
      setTitle(helpDesk?.title || "");
      setDescription(helpDesk?.description || "");
      setType(helpDesk?.type || "");
      setFileUrl(helpDesk?.fileUrl || "");
      setOpenModal(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch help desk details");
    }
  };

  // Handle add
  const handleAddHelpDesk = async () => {
    try {
      if (!validate()) return;
      setFormLoading(true);

      const payload = {
        title,
        description,
        type,
        fileUrl: fileUrl,
      };

      await createHelpDesk(payload);
      onCloseModal();
      toast.success("Help desk entry added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add help desk entry"
      );
    } finally {
      setFormLoading(false);
      fetchHelpDeskList();
    }
  };

  // Handle edit
  const handleEditHelpDesk = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this help desk entry?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;

            const payload = {
              title,
              description,
              type,
              fileUrl: fileUrl,
            };

            await updateHelpDeskById(selectedHelpDesk._id, payload);
            toast.success("Help desk entry updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update help desk entry"
            );
          } finally {
            setFormLoading(false);
            fetchHelpDeskList();
          }
        } else {
          onCloseModal();
        }
      },
    });
  };

  // Handle delete
  const handleDelete = async (helpDesk) => {
    openConfirmationModel({
      question: "Are you sure you want to delete this help desk entry?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            await deleteHelpDeskById(helpDesk._id);
            toast.success("Help desk entry deleted successfully");
            fetchHelpDeskList();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to delete help desk entry"
            );
          }
        }
      },
    });
  };

  // Close modal and reset form
  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedHelpDesk(null);
    setTitle("");
    setDescription("");
    setType("");
    setFileUrl("");
  };

  // Handle file upload success from your FileUpload component
  const handleFileUpload = (url) => {
    setFileUrl(url);
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FaFilePdf className="text-2xl text-red-500" size={30} />;
      case "image":
        return <FaFileImage className="text-2xl text-blue-500" size={30} />;
      case "video":
        return <FaFileVideo className="text-2xl text-green-500" size={30} />;
      case "docs":
        return <FaFileWord className="text-2xl text-blue-700" size={30} />;
      default:
        return <FaFileAlt className="text-2xl text-gray-500" size={30} />;
    }
  };

  useEffect(() => {
    fetchHelpDeskList();
  }, []);

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">

          {/* Page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Help Desk Management</h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <div className="w-full flex flex-wrap justify-between items-center gap-2">
              <Badge color="warning">
                Total Entries: {helpDeskList?.length || 0}
              </Badge>

              <div className="flex justify-center items-center gap-2 flex-wrap">
                <Button
                  className="text-xs"
                  size="sm"
                  color="success"
                  onClick={fetchHelpDeskList}
                >
                  <span className="flex justify-center items-center gap-2">
                    <RiRefreshFill size={20} />
                    Refresh
                  </span>
                </Button>
                {pagePermission?.create && (
                  <Button
                    className="text-xs"
                    size="sm"
                    onClick={() => setOpenModal(true)}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <IoMdAddCircle size={20} />
                      Add Help Desk Entry
                    </span>
                  </Button>)}
                <LuDatabaseBackup
                  size={20}
                  className="cursor-pointer"
                  onClick={() => navigate(`/${role}/deleted-data-log`)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <div className="overflow-x-auto w-full">
              <Table striped>
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap">#</Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Title
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Description
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Type
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    File Preview
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Created At
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Updated At
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Actions
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {helpDeskLoading ? (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="100%"
                        className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                      >
                        <div className="w-full flex justify-center items-center">
                          <Spinner aria-label="Loading data" size="xl" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    <>
                      {helpDeskList?.map((item, index) => (
                        <Table.Row
                          key={item._id}
                          className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {index + 1}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {item?.title}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 max-w-xs truncate">
                            {item?.description}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <Badge
                              color={
                                item?.type === "image"
                                  ? "info"
                                  : item?.type === "video"
                                    ? "success"
                                    : item?.type === "pdf"
                                      ? "failure"
                                      : "warning"
                              }
                            >
                              {item?.type?.toUpperCase()}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex justify-center items-center">
                              {item?.type === "video" ? (
                                <video
                                  width="300"
                                  height="200"
                                  controls
                                  className="rounded cursor-pointer"
                                  onClick={() =>
                                    window.open(item?.fileUrl, "_blank")
                                  }
                                >
                                  <source src={item?.fileUrl} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              ) : item?.type === "image" ? (
                                <img
                                  src={item?.fileUrl}
                                  alt={item?.title}
                                  className="w-20 h-12 object-cover rounded cursor-pointer"
                                  onClick={() =>
                                    window.open(item?.fileUrl, "_blank")
                                  }
                                />
                              ) : (
                                <div
                                  className="flex flex-col items-center cursor-pointer"
                                  onClick={() =>
                                    window.open(item?.fileUrl, "_blank")
                                  }
                                >
                                  {getFileIcon(item?.type)}
                                  <span className="text-xs text-gray-500 mt-1">
                                    {item?.type?.toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {moment(item?.createdAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY hh:mm A")}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {moment(item?.updatedAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY hh:mm A")}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex gap-5 justify-center items-center">
                              {pagePermission?.update && (
                                <EditButton onClick={() => handleSetEdit(item)} />)}
                              {pagePermission?.delete && (
                                <Button
                                  size="xs"
                                  color={"dark"}
                                  title="Delete this help desk entry"
                                  onClick={() => handleDelete(item)}
                                >
                                  <MdDelete size={18} />
                                </Button>)}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {helpDeskList?.length === 0 && (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan="100%"
                            className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                          >
                            No help desk entries found
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>

          {/* Add/Edit Modal */}
          <Modal show={openModal} onClose={onCloseModal} size="lg">
            <Modal.Header>
              {modalMode === "add" ? "Add Help Desk Entry" : "Edit Help Desk Entry"}
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <TextInput
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="">Select file type</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="docs">Documents</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fileUpload">Upload File</Label>
                  <TextInput id="fileUrl" value={fileUrl} readOnly />
                  <div className="flex items-center gap-2 mt-2">
                    <FileUpload
                      type="single-file"
                      page="modal-form"
                      onSetFileUrl={handleFileUpload}
                    />
                    {fileUrl && (
                      <span className="text-sm text-green-700 dark:text-green-400">
                        File added successfully
                      </span>
                    )}
                  </div>

                  {fileUrl && (
                    <div className="mt-2">
                      <Label>Current File Preview:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {type === "video" ? (
                          <video width="200" controls className="rounded">
                            <source src={fileUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : type === "image" ? (
                          <img
                            src={fileUrl}
                            alt="Preview"
                            className="w-32 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="p-4 border rounded bg-gray-50 flex items-center gap-2">
                            {getFileIcon(type)}
                            <span className="text-gray-600">
                              {type?.toUpperCase()} file uploaded
                            </span>
                          </div>
                        )}
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-yellow-400 hover:underline text-sm"
                        >
                          View Full File
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button onClick={onCloseModal} color="gray">
                    Cancel
                  </Button>
                  {modalMode === "add" ? (
                    <Button
                      onClick={handleAddHelpDesk}
                      disabled={formLoading || !fileUrl || !type || !title}
                    >
                      {formLoading && <Spinner className="mr-2" />}
                      Add Entry
                    </Button>
                  ) : (
                    <Button onClick={handleEditHelpDesk} disabled={formLoading}>
                      {formLoading && <Spinner className="mr-2" />}
                      Update Entry
                    </Button>
                  )}
                </div>
              </div>
            </Modal.Body>
          </Modal>
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
    </>
  );

};

export default HelpDesk;
