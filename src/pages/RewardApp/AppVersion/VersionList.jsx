import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Label,
  Modal,
  Spinner,
  Table,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createAppVersion,
  listAppVersions,
  updateAppVersion,
} from "../../../api/appversions";
import EditButton from "../../../assets/common/EditButton";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../../utils/permissionHelper";

const VersionList = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [appVersionList, setAppVersionList] = useState([]);
  const [versionCodeSearch, setVersionCodeSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [formData, setFormData] = useState({
    androidVersionCode: "",
    message: "",
    status: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const role = useSelector((state) => state.permission?.data?.role);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "app-versions"
    );

    setPagePermission(permission);
  }, [permissionState]);

  // Fetch app versions
  const fetchAppVersions = async () => {
    try {
      setPageLoading(true);
      const query = {};

      if (versionCodeSearch?.trim()) {
        query.androidVersionCode = versionCodeSearch.trim();
      }

      console.log("Fetching app versions with query:", query);
      const response = await listAppVersions(query);

      setAppVersionList(response?.data?.data || []);

      console.log("Fetched app versions:", response?.data?.data?.length);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch app versions"
      );
    } finally {
      setPageLoading(false);
    }
  };

  // Fetch on search change
  useEffect(() => {
    fetchAppVersions();
  }, [versionCodeSearch]);

  const handleResetFilter = () => {
    setVersionCodeSearch("");
    fetchAppVersions();
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      androidVersionCode: "",
      message: "",
    });
    setSelectedVersion(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (version) => {
    setSelectedVersion(version);
    setFormData({
      androidVersionCode: version.androidVersionCode || "",
      message: version.message || "",
      status: version.status || false,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        androidVersionCode: formData.androidVersionCode,
        message: formData.message,
      };

      console.log("Creating app version:", payload);
      await createAppVersion(payload);

      toast.success("App version created successfully!");
      setIsCreateModalOpen(false);
      fetchAppVersions();
    } catch (error) {
      console.error("Create error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create app version"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        androidVersionCode: formData.androidVersionCode,
        message: formData.message,
        status: formData.status,
      };

      console.log("Updating app version:", payload);
      await updateAppVersion(selectedVersion._id, payload);

      toast.success("App version updated successfully!");
      setIsEditModalOpen(false);
      fetchAppVersions();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update app version"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Check if version is latest
  const isLatestVersion = (version) => {
    return appVersionList[0]?._id === version._id;
  };

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col w-full">
          <div className="flex justify-between w-full items-center py-1">
            <div className="flex justify-start items-center w-full">
              <Breadcrumb aria-label="Solid background breadcrumb example">
                <Breadcrumb.Item>RVP App</Breadcrumb.Item>
                <Breadcrumb.Item href={`/${role}/app-versions`}>
                  App Versions
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex justify-start items-center flex-col gap-2 w-full p-1">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2 mb-4">
                <Badge color="indigo">Total Versions : {appVersionList?.length || 0}</Badge>
              </div>
              <div className="flex justify-center w-full items-end gap-4 flex-wrap">
                <div className="w-52">
                  <div className="block">
                    <Label value="Version Code" />
                  </div>
                  <TextInput
                    placeholder="Search Version Code"
                    value={versionCodeSearch}
                    onChange={(e) => setVersionCodeSearch(e.target.value)}
                  />
                </div>

                <div className="flex justify-center items-center gap-2">
                  <Button
                    className="text-xs"
                    size="sm"
                    color="success"
                    onClick={handleResetFilter}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <FiRefreshCw size={20} />
                      Reset
                    </span>
                  </Button>

                  {pagePermission?.create && (
                    <Button
                      className="text-xs"
                      size="sm"
                      color="purple"
                      onClick={openCreateModal}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <FiPlus size={20} />
                        Create Version
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* table */}
          <div className="flex justify-start items-center flex-col gap-2 w-full p-4">
            <div className="overflow-x-auto w-full">
              <Table striped className="rounded-none border">
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Version Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Message
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Created At
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Updated At
                  </Table.HeadCell>
                  {pagePermission?.update && (
                    <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                      Actions
                    </Table.HeadCell>
                  )}
                </Table.Head>
                <Table.Body className="divide-y">
                  {pageLoading ? (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="6"
                        className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                      >
                        <div
                          className="w-full flex justify-center items-center"
                          role="status"
                        >
                          <Spinner aria-label="Loading data" size="xl" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    <>
                      {appVersionList?.length === 0 ? (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan="6"
                            className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                          >
                            No app versions found
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        appVersionList?.map((version) => (
                          <Table.Row
                            key={version._id}
                            className="text-center bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {version.androidVersionCode || "N/A"}
                              {isLatestVersion(version) && (
                                <Badge color="green" className="ml-2">
                                  Latest
                                </Badge>
                              )}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 max-w-xs truncate">
                              {version.message || "N/A"}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex justify-center items-center">
                                <Badge
                                  color={version.status ? "green" : "gray"}
                                >
                                  {version.status ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {version.createdAt
                                ? new Date(version.createdAt).toLocaleString()
                                : "N/A"}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {version.updatedAt
                                ? new Date(version.updatedAt).toLocaleString()
                                : "N/A"}
                            </Table.Cell>
                            {pagePermission?.update && (
                              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                                <div className="flex justify-center items-center gap-2">
                                  <EditButton
                                    onClick={() => openEditModal(version)}
                                    tooltipText="Edit Version"
                                  />
                                </div>
                              </Table.Cell>
                            )}
                          </Table.Row>
                        ))
                      )}
                    </>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>

          {/* Create Modal */}
          <Modal
            show={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            size="md"
          >
            <Modal.Header>Create New App Version</Modal.Header>
            <Modal.Body>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <Label value="Android Version Code" />
                  <TextInput
                    name="androidVersionCode"
                    value={formData.androidVersionCode}
                    onChange={handleInputChange}
                    placeholder="e.g., 1.0.0 or 100"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label value="Message" />
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter update message for users"
                    rows={4}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    color="gray"
                    onClick={() => setIsCreateModalOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button color="purple" type="submit" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Creating...
                      </span>
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>

          {/* Edit Modal */}
          <Modal
            show={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            size="md"
          >
            <Modal.Header>Edit App Version</Modal.Header>
            <Modal.Body>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label value="Android Version Code" />
                  <TextInput
                    name="androidVersionCode"
                    value={formData.androidVersionCode}
                    onChange={handleInputChange}
                    placeholder="e.g., 1.0.0 or 100"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label value="Message" />
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter update message for users"
                    rows={4}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <Label htmlFor="status" value="Active" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    color="gray"
                    onClick={() => setIsEditModalOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button color="purple" type="submit" disabled={submitting}>
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Updating...
                      </span>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </form>
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
    </div>
  );
};

export default VersionList;