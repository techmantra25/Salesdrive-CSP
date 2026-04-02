import axios from "axios";
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
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { CiCircleList } from "react-icons/ci";
import { FaPlus } from "react-icons/fa";
import { IoIosList } from "react-icons/io";
import {
  MdDownloadForOffline,
  MdInfoOutline,
  MdSimCardDownload,
} from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { addEmployee, bulkUpload, updateEmployee } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import UniqueCode from "../../assets/common/UniqueCode";
import { BrandListModal } from "../../components/BrandListModal";
import { DBListModal } from "../../components/DBListModal";
import EditBeatMapping from "../../components/EditBeatMapping";
import LeavingDate from "../../components/LeavingDate";
import { ShowBeats } from "../../components/ShowBeats";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBrands } from "../../redux/brandSlice";
import { fetchDesignations } from "../../redux/designationSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchZones } from "../../redux/zoneSlice";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import moment from "moment";
import { FileUpload } from "../../uploadWidget/FileUpload";

export const BeatMappingView = () => {
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    desgId: "",
    zoneId: "",
    regionId: "",
    brandId: [],
    area: "",
    reporting_manager: "",
    leaving_date: null,
    status: true,
    distributorId: [],
  });
  const [modalMode, setModalMode] = useState("add");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedBrand, setSelectedBrand] = useState("default");
  const [selectedDesignation, setSelectedDesignation] = useState("default");
  const [statusFilter, setStatusFilter] = useState("active");
  const [formLoading, setFormLoading] = useState(false);
  const [openLeavingDateModal, setOpenLeavingDateModal] = useState(false);
  const [totalItems, setTotalItems] = useState({
    total: 0,
    active: 0,
    filtered: 0,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [openBeatsModal, setOpenBeatsModal] = useState(false);
  const [selectedBeatDetails, setSelectedBeatDetails] = useState(null);
  const [showBeatsDetailModal, setShowBeatsDetailModal] = useState(false);
  const [openDBListModal, setOpenDBListModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [importingCsv, setImportingCsv] = useState(false);
  const [errorLog, setErrorLog] = useState([]);

  const [selectedEmployeeForDBList, setSelectedEmployeeForDBList] =
    useState(null);

  const onCloseBeatsModal = () => {
    setOpenBeatsModal(false);
    setSelectedEmployee(null);
  };

  const onCloseBeatsDetailModal = () => {
    setShowBeatsDetailModal(false);
    setSelectedBeatDetails(null);
  };

  const onPageChange = (page) => setCurrentPage(page);

  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDesignations());
    dispatch(fetchZones());
    dispatch(fetchRegions());
    dispatch(fetchBrands());
    dispatch(fetchDistributors());
  }, [dispatch]);

  const { designations, loading: designationsLoading } = useSelector(
    (state) => state.designations
  );

  const { zones } = useSelector((state) => state.zone);

  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.region
  );

  const { brands, loading: brandsLoading } = useSelector(
    (state) => state.brand
  );
  const { distributors } = useSelector((state) => state.distributors);

  let filteredEmployees = employees
    ? employees.filter((employee) => {
        if (statusFilter === "default") return true;
        return employee?.status === (statusFilter === "active");
      })
    : [];

  let fetchEmployeesPaginatedWithOutDebounce = async () => {
    try {
      setEmployeesLoading(true);
      const query = {
        page: currentPage,
        limit: 30,
      };
      if (searchTerm) {
        query.search = searchTerm;
      }

      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }
      if (selectedBrand !== "default") {
        query.brandId = selectedBrand;
      }
      if (selectedDesignation !== "default") {
        query.desgId = selectedDesignation;
      }

      if (statusFilter !== "default") {
        query.status = statusFilter === "active" ? true : false;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/employee/all-list-paginated`,
        {
          params: query,
        }
      );

      setEmployees(response?.data?.data);
      setTotalItems({
        total: response?.data?.pagination?.totalCount,
        active: response?.data?.pagination?.totalActiveCount,
        filtered: response?.data?.pagination?.filteredCount,
      });
      setTotalPages(response?.data?.pagination?.totalPages);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch pricing"
      );
    } finally {
      setEmployeesLoading(false);
    }
  };

  let fetchEmployeesPaginated = useDebounce(
    fetchEmployeesPaginatedWithOutDebounce,
    500
  );

  if (formData?.desgId !== "") {
    let filterDesignation = designations.find(
      (desg) => desg._id === formData?.desgId
    );
    filteredEmployees = [...filteredEmployees].filter(
      (emp) => emp?.desgId?._id === filterDesignation?.parent_desg?._id
    );
  }

  const handleResetFilter = () => {
    setStatusFilter("active");
    setSelectedRegion("default");
    setSelectedBrand("default");
    setSelectedDesignation("default");
    fetchEmployeesPaginated();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "distributorId") {
      setFormData((prev) => {
        let updatedDistributors = [...prev.distributorId];

        if (type === "checkbox") {
          if (checked) {
            updatedDistributors.push(value);
          } else {
            updatedDistributors = updatedDistributors.filter(
              (id) => id !== value
            );
          }
        }

        return { ...prev, distributorId: updatedDistributors };
      });
    } else if (name === "brandId") {
      setFormData((prev) => {
        let updatedBrands = [...prev.brandId];

        if (checked) {
          updatedBrands.push(value);
        } else {
          updatedBrands = updatedBrands.filter((id) => id !== value);
        }

        return { ...prev, brandId: updatedBrands };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      leaving_date: e.target.value,
    }));
  };

  const validate = () => {
    if (formData.name.trim() === "" || formData.empId.trim() === "") {
      toast.error("Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setFormLoading(true);
    console.log(formData, "formData");

    if (formData.leaving_date) {
      delete formData.leaving_date;
    }
    try {
      if (modalMode === "add") {
        const res = await addEmployee(formData);
        fetchEmployeesPaginated();
        if (res?.data?.statusUpdateError) {
          toast.error("Something went wrong");
        } else {
          toast.success("Employee added successfully");
        }
      } else {
        const res = await updateEmployee(formData, selectedEmployee._id);
        fetchEmployeesPaginated();
        if (res?.data?.statusUpdateError) {
          toast.error("Something went wrong");
        } else {
          toast.success("Employee updated successfully");
        }
      }
      setOpenModal(false);
      setFormData({
        name: "",
        empId: "",
        desgId: "",
        zoneId: "",
        regionId: "",
        brandId: "",
        area: "",
        reporting_manager: "",
        leaving_date: "",
        status: true,
        distributorId: [],
      });
      setSelectedEmployee(null);
      setModalMode("add");
    } catch (error) {
      console.error("Error saving employee", error);
      toast.error("Failed to save employee, try again");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusUpdate = (employee, leaving_date) => {
    openConfirmationModel({
      question: `Are you sure you want to ${
        employee.status ? "deactivate" : "activate"
      } this employee?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            let payload = {
              status: !employee.status,
              leaving_date: employee.status ? leaving_date : null,
            };
            let res = await updateEmployee(payload, employee._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Something went wrong");
            } else {
              toast.success("Employee updated successfully");
            }
            toast.success("Status updated successfully");
            setOpenLeavingDateModal(false);
            fetchEmployeesPaginated();
          } catch (error) {
            console.error("Error updating status", error);
            toast.error("Failed to update employee status");
          }
        }
      },
    });
  };

  const [csvLoading, setCSVLoading] = useState(false);

  const handleExportToCSV = async () => {
    try {
      setCSVLoading(true);
      const query = {};

      if (searchTerm) {
        query.search = searchTerm;
      }

      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }
      if (selectedBrand !== "default") {
        query.brandId = selectedBrand;
      }
      if (selectedDesignation !== "default") {
        query.desgId = selectedDesignation;
      }

      if (statusFilter !== "default") {
        query.status = statusFilter === "active" ? true : false;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/employee/employee-report`,
        {
          params: query,
        }
      );

      const csvLink = response?.data?.data?.csvLink;
      const link = document.createElement("a");
      link.href = csvLink;
      link.download = "employees-report.csv"; // Set file name if needed
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download CSV"
      );
    } finally {
      setCSVLoading(false);
    }
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setFormData({
      name: "",
      empId: "",
      desgId: "",
      zoneId: "",
      regionId: "",
      brandId: [],
      area: "",
      reporting_manager: "",
      leaving_date: "",
      status: true,
      distributorId: [],
    });
    setSelectedEmployee(null);
    setModalMode("add");
  };

  useEffect(() => {
    fetchEmployeesPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedBrand,
    selectedRegion,
    selectedDesignation,
    statusFilter,
    searchTerm,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedBrand,
    selectedRegion,
    selectedDesignation,
    statusFilter,
    searchTerm,
  ]);

  const handleOpenBeatsModal = (employee) => {
    setSelectedEmployee(employee);
    setOpenBeatsModal(true);
  };

  const handleShowBeats = (employee) => {
    setSelectedEmployee(employee);
    setSelectedBeatDetails(employee.beatId);
    setShowBeatsDetailModal(true);
  };

  const [openEditBeatsModal, setOpenEditBeatsModal] = useState(false);

  const onCloseEditBeatsModal = () => {
    setOpenEditBeatsModal(false);
    setSelectedEmployee(null);
  };

  const handleEditBeats = (employee) => {
    setSelectedEmployee(employee);
    setOpenEditBeatsModal(true);
  };

  const handleOpenDBListModal = (employee) => {
    console.log("handleOpenDBListModal", employee);
    setSelectedEmployeeForDBList(employee);
    setOpenDBListModal(true);
  };

  const [selectedEmployeeForBrands, setSelectedEmployeeForBrands] =
    useState(null);
  const [openBrandsModal, setOpenBrandsModal] = useState(false);

  const handleShowBrands = (emp) => {
    setSelectedEmployeeForBrands(emp);
    setOpenBrandsModal(true);
  };

  const handleCSVTemplateDownload = () => {
    const headers = ["Employee ID", "Beat Codes"];
    const descriptions = [
      "(Required)",
      "(Required)[Example: BEAT-001,BEAT-002]",
    ];

    // Escape and join
    const csvString =
      headers.map(escapeCSVValue).join(",") +
      "\n" +
      descriptions.map(escapeCSVValue).join(",");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "employee_beat_mapping_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCSVImport = (url) => {
    fetchEmployeesPaginated();
    openConfirmationModel({
      question:
        "Are you sure you want to import this Employee Beat Mapping CSV?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          setImportingCsv(true);
          try {
            let payload = {
              file: url,
            };
            const res = await bulkUpload(payload, "employeeBeatMapping");

            toast.success(
              `${res?.data?.data?.totalMapped} rows updated and ${res?.data?.data?.totalSkipped} rows failed`
            );

            setErrorLog(res?.data?.skippedRows);

            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
                "Failed to import Employee Beat Mappings, try again"
            );
          } finally {
            setImportingCsv(false);
            fetchEmployeesPaginated();
          }
        } else {
          onCloseModal();
          return;
        }
      },
    });
  };

  const handleErrorLogDownload = () => {
    try {
      if (!errorLog.length) {
        toast.error("No error log to download.");
        return;
      }

      // Define the custom headers and their corresponding keys
      const headerMap = [
        { label: "Row", key: "row" },
        { label: "Employee ID", key: "employeeId" },
        { label: "Beat Codes", key: "beatCodes" },
        { label: "Reason", key: "reason" },
      ];

      // CSV header
      const csv = [headerMap.map((h) => h.label).join(",")];

      // CSV rows
      errorLog.forEach((row) => {
        const csvRow = headerMap
          .map(({ key }) => {
            const value = row[key] !== undefined ? String(row[key]) : "";
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",");
        csv.push(csvRow);
      });

      // Join all rows into a single CSV string
      const csvString = csv.join("\n");

      // Create a blob and trigger the download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
      a.setAttribute(
        "download",
        `skipped-employees-beat-mapping-log_${moment()
          .tz("Asia/Kolkata")
          .format("DD-MM-YY_hh-mm-ss-a")}.csv`
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Optionally clear the error log
      setErrorLog([]);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download skipped employee beat mapping log, try again"
      );
    }
  };

  return (
    <div className="flex justify-start items-center flex-col gap-4 w-full">
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Employee Beat Mapping</h1>
      </div>

      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="w-full flex justify-center items-center flex-col">
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Count: {totalItems?.total}</Badge>
            <Badge color="warning">Active Count: {totalItems?.active}</Badge>
            <Badge color="warning">
              Filtered Count: {totalItems?.filtered}
            </Badge>
          </div>
          <div className="flex justify-center w-full items-center gap-4 flex-wrap">
            <div className="w-44">
              <div className="block">
                <Label value="Search" />
              </div>
              <TextInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
              />
            </div>
            {/* filter 1 */}
            <div className="w-56">
              <div className="mb-2 block">
                <Label htmlFor="statusSelect" value="Select Status" />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                id="statusSelect"
                required
              >
                <option value="default">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            {/* filter 2 */}
            <div className="w-56">
              <div className="mb-2 block">
                <Label htmlFor="regionSelect" value="Select Region" />
              </div>
              <Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                id="regionSelect"
                required
              >
                <option value="default">All</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </Select>
            </div>
            {/* filter 4 */}
            <div className="w-56">
              <div className="mb-2 block">
                <Label htmlFor="designationSelect" value="Select Designation" />
              </div>
              <Select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                id="designationSelect"
                required
              >
                <option value="default">All</option>
                {designations.map((desg) => (
                  <option key={desg._id} value={desg._id}>
                    {desg.name}
                  </option>
                ))}
              </Select>
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
          </div>
        </Card>
      </div>

      {/* paginated table */}
      <div className="flex justify-end items-center w-full px-4 ">
        <div className="flex overflow-x-auto sm:justify-center">
          {!employeesLoading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons
            />
          )}
        </div>
      </div>

      {/* table  */}
      {/* Concise Employee Table */}
      <div className="w-full p-4">
        <div className="overflow-x-auto">
          <Table striped>
            <Table.Head className="text-center">
              <Table.HeadCell>ID</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell>Zone | State | Region</Table.HeadCell>
              <Table.HeadCell>Brand</Table.HeadCell>
              <Table.HeadCell>Manager</Table.HeadCell>
              <Table.HeadCell>Distributors</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {employeesLoading ||
              regionsLoading ||
              brandsLoading ||
              designationsLoading ? (
                <Table.Row className="bg-white dark:bg-gray-800">
                  <Table.Cell colSpan="9" className="text-center">
                    <Spinner aria-label="Loading data" size="xl" />
                  </Table.Cell>
                </Table.Row>
              ) : (
                <>
                  {employees?.map((employee, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:bg-gray-800"
                    >
                      <Table.Cell className="font-medium text-gray-900 dark:text-gray-200">
                        <UniqueCode text={employee.empId} codeName="Employee" />
                      </Table.Cell>

                      <Table.Cell className="font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap">
                        {employee.name}
                      </Table.Cell>

                      <Table.Cell className="font-medium text-gray-900 whitespace-nowrap dark:text-gray-200">
                        {employee.desgId?.name || ""}
                      </Table.Cell>

                      <Table.Cell className="font-medium text-gray-900 dark:text-gray-200 text-xs">
                        <div className="flex justify-center items-center gap-2 flex-wrap min-w-80">
                          {employee.zoneId?.name && (
                            <span>
                              {employee.zoneId.name} (
                              <UniqueCode
                                text={employee.zoneId.code}
                                codeName="Zone Code"
                              />
                              )
                            </span>
                          )}
                          {employee.stateId?.name && (
                            <span>
                              {employee.stateId.name} (
                              <UniqueCode
                                text={employee.stateId.code}
                                codeName="State Code"
                              />
                              )
                            </span>
                          )}
                          {employee.regionId?.name && (
                            <span>
                              {employee.regionId.name} (
                              <UniqueCode
                                text={employee.regionId.code}
                                codeName="Region Code"
                              />
                              )
                            </span>
                          )}
                        </div>
                      </Table.Cell>

                      <Table.Cell className="font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap">
                        <span className="text-wrap">
                          {employee.brandId && employee.brandId.length > 0 ? (
                            <div
                              className="flex justify-center items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                              onClick={() => handleShowBrands(employee)}
                            >
                              <IoIosList size={18} />
                            </div>
                          ) : null}
                        </span>
                      </Table.Cell>

                      <Table.Cell className="font-medium text-gray-900 dark:text-gray-200 text-xs">
                        {employee?.empMappingId?.rmEmpId && (
                          <div className="flex justify-center items-center gap-2 flex-wrap min-w-80">
                            <UniqueCode
                              text={employee.empMappingId.rmEmpId.empId}
                              codeName="Employee"
                            />
                            <span>{employee.empMappingId.rmEmpId.name}</span>
                            <span>
                              ({employee.empMappingId.rmEmpId.desgId?.name})
                            </span>
                          </div>
                        )}
                      </Table.Cell>

                      <Table.Cell className="font-medium text-gray-900 dark:text-gray-200">
                        <div
                          className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800"
                          onClick={() => handleOpenDBListModal(employee)}
                        >
                          <CiCircleList size={16} />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}

                  {employees?.length === 0 && (
                    <Table.Row className="bg-white dark:bg-gray-800">
                      <Table.Cell
                        colSpan="9"
                        className="text-center font-medium text-gray-900 dark:text-gray-200"
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

      {openLeavingDateModal && (
        <LeavingDate
          openLeavingDateModal={openLeavingDateModal}
          setOpenLeavingDateModal={setOpenLeavingDateModal}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          handleStatusUpdate={handleStatusUpdate}
        />
      )}

      {openBeatsModal && (
        <EditBeatMapping
          showBeatsModal={openBeatsModal}
          onCloseBeatsModal={onCloseBeatsModal}
          selectedEmployee={selectedEmployee}
          fetchEmployeesPaginated={fetchEmployeesPaginated}
        />
      )}

      {openEditBeatsModal && (
        <EditBeatMapping
          showBeatsModal={openEditBeatsModal}
          onCloseBeatsModal={onCloseEditBeatsModal}
          selectedEmployee={selectedEmployee}
          fetchEmployeesPaginated={fetchEmployeesPaginated}
        />
        // <BeatAdding
        //   showBeatsModal={openEditBeatsModal}
        //   onCloseBeatsModal={onCloseEditBeatsModal}
        //   selectedEmployee={selectedEmployee}
        //   fetchEmployeesPaginated={fetchEmployeesPaginated}
        // />
      )}

      {showBeatsDetailModal && (
        <ShowBeats
          showBeatsModal={showBeatsDetailModal}
          onCloseBeatsModal={onCloseBeatsDetailModal}
          usedIn={"beat-mapping"}
          config={{
            beats: selectedBeatDetails,
          }}
        />
      )}

      <Modal show={openModal} onClose={() => onCloseModal()}>
        <Modal.Header>
          {modalMode === "add" ? "Add Employee" : "Edit Employee"}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Employee Name *" />
                </div>
                <TextInput
                  name="name"
                  placeholder="Enter Employee Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {modalMode === "edit" && (
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Code" />
                  </div>
                  <TextInput value={formData.empId} disabled />
                </div>
              )}
              {modalMode === "add" && (
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Employee ID *" />
                  </div>
                  <TextInput
                    name="empId"
                    placeholder="Enter Employee ID"
                    value={formData.empId}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Designation *" />
                </div>
                <Select
                  name="desgId"
                  value={formData.desgId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Designation</option>
                  {designations?.length > 0 &&
                    designations?.map((designation) => (
                      <option key={designation?._id} value={designation?._id}>
                        {designation?.name}
                      </option>
                    ))}
                </Select>
              </div>
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Zone *" />
                </div>
                <Select
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Zone</option>
                  {zones?.length > 0 &&
                    zones?.map((zone) => (
                      <option key={zone?._id} value={zone?._id}>
                        {zone?.name}
                      </option>
                    ))}
                </Select>
              </div>
              {formData.zoneId && (
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Region *" />
                  </div>
                  <Select
                    name="regionId"
                    value={formData.regionId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Region</option>
                    {regions?.length > 0 &&
                      regions
                        ?.filter((ele) => ele.zoneId?._id === formData.zoneId)
                        .map((region) => (
                          <option key={region?._id} value={region?._id}>
                            {region?.name}
                          </option>
                        ))}
                  </Select>
                </div>
              )}

              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Area" />
                </div>
                <TextInput
                  name="area"
                  placeholder="Enter Areas (comma-separated)"
                  value={formData.area}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Reporting Manager" />
                </div>
                <Select
                  name="reporting_manager"
                  value={formData.reporting_manager}
                  onChange={handleChange}
                >
                  <option value="">Select Reporting Manager</option>
                  {filteredEmployees?.length > 0 &&
                    filteredEmployees.map((employee) => (
                      <option key={employee?._id} value={employee?._id}>
                        {employee?.name} ({employee?.empId}) [
                        {employee?.desgId?.name}]
                      </option>
                    ))}
                </Select>
              </div>
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Brand *" />
                </div>
                <div className="flex flex-row flex-wrap gap-4 justify-start items-center">
                  {brands?.length > 0 &&
                    brands.map((brand) => (
                      <div key={brand._id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={brand._id}
                          name="brandId"
                          value={brand._id}
                          onChange={handleChange}
                          checked={formData?.brandId?.includes(brand?._id)}
                        />
                        <label
                          htmlFor={brand._id}
                          className="ml-2 dark:text-white"
                        >
                          {brand.name}
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              {formData?.regionId && (
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Select Distributor(s)" />
                  </div>
                  {distributors
                    ?.filter((ele) => ele?.regionId?._id === formData?.regionId)
                    .map((distributor) => (
                      <div key={distributor._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`distributor-${distributor._id}`}
                          name="distributorId"
                          value={distributor._id}
                          checked={formData?.distributorId?.includes(
                            distributor?._id
                          )}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor={`distributor-${distributor._id}`}
                          className="ml-2 mb-2 block text-gray-700 dark:text-gray-100"
                        >
                          {distributor.name} ({distributor.dbCode})
                        </label>
                      </div>
                    ))}
                  {distributors?.filter(
                    (ele) => ele?.regionId?._id === formData?.regionId
                  ).length === 0 && (
                    <div className="flex items-center w-full">
                      <label className="ml-2 mb-2 block text-gray-700 dark:text-gray-100">
                        <MdInfoOutline /> No Distributors found for this region
                      </label>
                    </div>
                  )}
                </div>
              )}
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Leaving Date" />
                </div>
                <TextInput
                  type="date"
                  //   disabled={modalMode === "edit"}
                  name="leaving_date"
                  className=" text-gray-700 dark:text-gray-100"
                  value={formData?.leaving_date}
                  onChange={handleDateChange}
                />
              </div>
              <div className="w-full">
                <Button
                  type="submit"
                  disabled={formLoading}
                  className={`${
                    formLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {formLoading ? (
                    <Spinner size="sm" aria-label="Loading spinner" />
                  ) : modalMode === "add" ? (
                    "Add Employee"
                  ) : (
                    "Update Employee"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>

      {/* DB List Modal */}
      {openDBListModal && (
        <DBListModal
          openDBListModal={openDBListModal}
          setOpenDBListModal={setOpenDBListModal}
          DBList={selectedEmployeeForDBList}
        />
      )}

      {/* Brand List Modal */}
      {openBrandsModal && (
        <BrandListModal
          openBrandsModal={openBrandsModal}
          setOpenBrandsModal={setOpenBrandsModal}
          brandList={selectedEmployeeForBrands}
        />
      )}
    </div>
  );
};
