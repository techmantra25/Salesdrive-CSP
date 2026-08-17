import {
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiRefreshFill } from "react-icons/ri";
import { addGodown, viewGodownList } from "../../api/godownApi";
import { AllDistributorList } from "../../api/api";
import { useDebounce } from "../../hooks/useDebounce";

const initialGodownForm = {
  distributorId: "",
  godownCode: "",
  godownName: "",
  godownType: "MAIN",
  location: "",
  contactPerson: "",
  isActive: true,
  remarks: "",
};

const godownTypeOptions = ["MAIN", "SUB", "TRANSIT", "OTHER"];

const AddGodown = () => {
  const [godowns, setGodowns] = useState([]);
  const [godownsLoading, setGodownsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  const [openAddGodownModal, setOpenAddGodownModal] = useState(false);
  const [godownForm, setGodownForm] = useState(initialGodownForm);
  const [addGodownLoading, setAddGodownLoading] = useState(false);

  const [distributors, setDistributors] = useState([]);
  const [distributorsLoading, setDistributorsLoading] = useState(false);

  // Filter: which distributor's godowns to view in the list
  const [selectedDistributorFilter, setSelectedDistributorFilter] =
    useState("default");

  const fetchDistributors = async () => {
    try {
      setDistributorsLoading(true);
      const response = await AllDistributorList();
      setDistributors(response?.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch distributors"
      );
    } finally {
      setDistributorsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  const onPageChange = (page) => setCurrentPage(page);

  const fetchGodownsWithoutDebounce = async () => {
    try {
      setGodownsLoading(true);

      const query = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm.trim()) {
        query.godownName = searchTerm.trim();
      }

      if (selectedDistributorFilter !== "default") {
        query.distributorId = selectedDistributorFilter;
      }

      const response = await viewGodownList(query);

      setGodowns(response?.data?.data || []);
      setTotalPages(response?.data?.pagination?.totalPages || 0);
      setTotalRecords(response?.data?.pagination?.totalRecords || 0);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch godowns"
      );
    } finally {
      setGodownsLoading(false);
    }
  };

  const fetchGodowns = useDebounce(fetchGodownsWithoutDebounce, 500);

  useEffect(() => {
    fetchGodowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedDistributorFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDistributorFilter]);

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedDistributorFilter("default");
    setCurrentPage(1);
    fetchGodownsWithoutDebounce();
  };

  const handleGodownFormChange = (e) => {
    const { name, value } = e.target;
    setGodownForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateGodown = async () => {
    try {
      if (!godownForm.distributorId) {
        toast.error("Please select a distributor");
        return;
      }

      if (!godownForm.godownCode?.trim()) {
        toast.error("Godown code is required");
        return;
      }

      if (!godownForm.godownName?.trim()) {
        toast.error("Godown name is required");
        return;
      }

      setAddGodownLoading(true);

      const payload = {
        distributorId: godownForm.distributorId,
        godownCode: godownForm.godownCode.trim(),
        godownName: godownForm.godownName.trim(),
        godownType: godownForm.godownType,
        location: godownForm.location.trim(),
        contactPerson: godownForm.contactPerson.trim(),
        isActive: godownForm.isActive,
        remarks: godownForm.remarks.trim(),
      };

      const response = await addGodown(payload);

      toast.success(response?.data?.message || "Godown added successfully");

      setOpenAddGodownModal(false);
      setGodownForm(initialGodownForm);
      setCurrentPage(1);
      fetchGodownsWithoutDebounce();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add godown"
      );
    } finally {
      setAddGodownLoading(false);
    }
  };

  const commonInputClass =
    "[&_input]:!h-[42px] " +
    "[&_input]:!rounded-lg " +
    "[&_input]:!border " +
    "[&_input]:!border-gray-300 " +
    "[&_input]:!text-sm";

  return (
    <div className="flex justify-start items-center flex-col gap-4 w-full">
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Godown Management</h1>
      </div>

      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="w-full flex justify-center items-center flex-col">
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Godowns: {totalRecords}</Badge>
          </div>

          <div className="flex justify-center w-full items-center gap-4 flex-wrap">
            <div className="w-64">
              <div className="mb-2 block">
                <Label htmlFor="distributorFilter" value="Select Distributor" />
              </div>
              <Select
                id="distributorFilter"
                value={selectedDistributorFilter}
                onChange={(e) => setSelectedDistributorFilter(e.target.value)}
                disabled={distributorsLoading}
              >
                <option value="default">All Distributors</option>
                {distributors.map((dist) => (
                  <option key={dist._id} value={dist._id}>
                    {dist.name} {dist.dbCode ? `(${dist.dbCode})` : ""}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-64">
              <div className="mb-2 block">
                <Label htmlFor="godownSearch" value="Search Godown Name" />
              </div>
              <TextInput
                id="godownSearch"
                placeholder="Search by godown name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center w-full items-center gap-2 flex-wrap">
            <Button
              className="text-xs"
              size="sm"
              color="success"
              onClick={handleResetFilter}
            >
              <RiRefreshFill size={20} />
              Reset & Refresh
            </Button>

            <Button
              color="blue"
              size="sm"
              onClick={() => {
                setGodownForm(initialGodownForm);
                setOpenAddGodownModal(true);
              }}
            >
              Add Godown
            </Button>
          </div>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center w-full px-4">
        <div className="flex overflow-x-auto sm:justify-center">
          {!godownsLoading && totalRecords > 10 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <div className="overflow-x-auto w-full">
          <Table striped>
            <Table.Head className="text-center">
              <Table.HeadCell className="whitespace-nowrap">
                Godown Code
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Godown Name
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Type
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Location
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Contact Person
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Status
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Remarks
              </Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {godownsLoading ? (
                <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell
                    colSpan={"100%"}
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
                  {godowns?.map((godown) => (
                    <Table.Row
                      key={godown._id}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {godown?.godownCode}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {godown?.godownName}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {godown?.godownType}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {godown?.location || "—"}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {godown?.contactPerson || "—"}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium">
                        <Badge color={godown?.isActive ? "success" : "failure"}>
                          {godown?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {godown?.remarks || "—"}
                      </Table.Cell>
                    </Table.Row>
                  ))}

                  {godowns?.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan={"100%"}
                        className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                      >
                        No data found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* Add Godown Modal */}
      <Modal
        show={openAddGodownModal}
        onClose={() => setOpenAddGodownModal(false)}
        size="2xl"
        popup
      >
        <Modal.Header className="px-6 pt-4">
          <span className="text-lg font-semibold">Add New Godown</span>
        </Modal.Header>

        <Modal.Body>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 pt-2">
            <div className="md:col-span-2">
              <Label
                value={
                  <>
                    Distributor <span className="text-red-500">*</span>
                  </>
                }
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              />
              <Select
                required
                name="distributorId"
                value={godownForm.distributorId}
                onChange={handleGodownFormChange}
                disabled={distributorsLoading}
              >
                <option value="">Select distributor</option>
                {distributors.map((dist) => (
                  <option key={dist._id} value={dist._id}>
                    {dist.name} {dist.dbCode ? `(${dist.dbCode})` : ""}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label
                value={
                  <>
                    Godown Code <span className="text-red-500">*</span>
                  </>
                }
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              />
              <TextInput
                required
                name="godownCode"
                placeholder="Enter godown code"
                value={godownForm.godownCode}
                onChange={handleGodownFormChange}
                className={commonInputClass}
              />
            </div>

            <div>
              <Label
                value={
                  <>
                    Godown Name <span className="text-red-500">*</span>
                  </>
                }
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              />
              <TextInput
                required
                name="godownName"
                placeholder="Enter godown name"
                value={godownForm.godownName}
                onChange={handleGodownFormChange}
                className={commonInputClass}
              />
            </div>

            <div>
              <Label
                value="Godown Type"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              />
              <Select
                name="godownType"
                value={godownForm.godownType}
                onChange={handleGodownFormChange}
              >
                {godownTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label
                value="Status"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              />
              <Select
                name="isActive"
                value={godownForm.isActive ? "true" : "false"}
                onChange={(e) =>
                  setGodownForm((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }))
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>

            <div>
              <Label
                value="Contact Person"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              />
              <TextInput
                name="contactPerson"
                placeholder="Enter contact person"
                value={godownForm.contactPerson}
                onChange={handleGodownFormChange}
                className={commonInputClass}
              />
            </div>

            <div>
              <Label
                value="Location"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              />
              <TextInput
                name="location"
                placeholder="Enter location"
                value={godownForm.location}
                onChange={handleGodownFormChange}
                className={commonInputClass}
              />
            </div>

            <div className="md:col-span-2">
              <Label
                value="Remarks"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide"
              />
              <textarea
                rows={3}
                name="remarks"
                placeholder="Enter remarks"
                value={godownForm.remarks}
                onChange={handleGodownFormChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-3">
          <Button
            color="gray"
            onClick={() => setOpenAddGodownModal(false)}
          >
            Cancel
          </Button>

          <Button onClick={handleCreateGodown} disabled={addGodownLoading}>
            {addGodownLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                Creating...
              </div>
            ) : (
              "Create Godown"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddGodown;