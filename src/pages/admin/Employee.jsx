import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Label,
  Modal,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa";
import { ImSpinner } from "react-icons/im";
import { IoIosList, IoMdAddCircle } from "react-icons/io";
import {
  MdDownloadForOffline,
  MdInfoOutline,
  MdSimCardDownload,
} from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  addEmployee,
  bulkUpload,
  getEmployeeByDesignation,
  getEmployeePassword,
  updateEmployee,
} from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { BrandListModal } from "../../components/BrandListModal";
import { DBListModal } from "../../components/DBListModal";
import LeavingDate from "../../components/LeavingDate";
import ShowEmployeeCredential from "../../components/ShowEmployeeCredential";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBrands } from "../../redux/brandSlice";
import { fetchDesignations } from "../../redux/designationSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchStates } from "../../redux/stateSlice";
import { fetchZones } from "../../redux/zoneSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { cleanFormData } from "../../utils/cleanFormData";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { IoInformationCircleSharp } from "react-icons/io5";
import { getPagePermission } from "../../utils/permissionHelper";


export const Employee = () => {
  const { config } = useSelector((state) => state.config);
  const { functionalSettings } = config || {};
  const approval_stage =
    functionalSettings?.need_employee_approval_for_po || "admin approval";

  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    employeeLabel: "",
    whatsapp: "",
    alternateMobile: "",
    phone: "",
    email: "",
    dob: "",
    joiningDate: "",
    headquarter: "",
    tenure: "",
    stateId: "",
    desgId: "",
    zoneId: "",
    regionId: [],
    brandId: [],
    area: [],
    reporting_manager: "",
    status: true,
    distributorId: [],
  });
  const [modalMode, setModalMode] = useState("add");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedBrand, setSelectedBrand] = useState("default");
  const [selectedDesignation, setSelectedDesignation] = useState("default");
  const [statusFilter, setStatusFilter] = useState("active");
  const [formLoading, setFormLoading] = useState(false);
  const [csvLoading, setCSVLoading] = useState(false);
  const [openLeavingDateModal, setOpenLeavingDateModal] = useState(false);
  const [reportingMangers, setReportingMangers] = useState([]);
  const [regionToRemove, setRegionToRemove] = useState(null);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);


  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "employee");
    setPagePermission(permission);
  }, [permissionState]);

  const [manLoading, setManLoading] = useState(false);
  const activeReportingManger = reportingMangers.filter(
    (man) => man.status === true
  );
  const [credentialModalLoading, setCredentialModalLoading] = useState(false);
  const [selectedEmployeeForCredential, setSelectedEmployeeForCredential] =
    useState(null);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [empPassword, setEmpPassword] = useState(null);
  const [openDBListModal, setOpenDBListModal] = useState(false);
  const [selectedEmployeeForDBList, setSelectedEmployeeForDBList] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [importingCsv, setImportingCsv] = useState(false);
  const [errorLog, setErrorLog] = useState([]);
  const [selectedEmployeeForBrands, setSelectedEmployeeForBrands] =
    useState(null);
  const [openBrandsModal, setOpenBrandsModal] = useState(false);
  const [currentRegionSelection, setCurrentRegionSelection] = useState("");
  const [currentDistributorSelection, setCurrentDistributorSelection] =
    useState("");
  const [distributorSearchTerm, setDistributorSearchTerm] = useState("");
  const [regionSearchTerm, setRegionSearchTerm] = useState("");
  const [showDistributorDropdown, setShowDistributorDropdown] = useState(false);

  const onPageChange = (page) => setCurrentPage(page);

  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const dispatch = useDispatch();

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
  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );

  let fetchEmployeesPaginatedWithOutDebounce = async () => {
    try {
      setEmployeesLoading(true);
      const query = {
        page: currentPage,
        limit: 30,
      };

      if (searchTerm) {
        query.search = searchTerm.trim();
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
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
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

  const handleResetFilter = () => {
    setCurrentPage(1);
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
    } else if (name === "regionId") {
      setFormData((prev) => {
        let updatedRegions = [...prev.regionId];

        if (checked) {
          updatedRegions.push(value);
        } else {
          updatedRegions = updatedRegions.filter((id) => id !== value);
        }

        return { ...prev, regionId: updatedRegions };
      });
    } else if (name === "area") {
      // Split the input value by commas and remove extra whitespace
      const areaArray = value.split(",").map((item) => item.trim());

      setFormData((prev) => ({
        ...prev,
        area: areaArray, // Update 'area' field as an array
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    if (
      !formData.name?.trim() ||
      !formData.phone?.trim() ||
      !formData.whatsapp?.trim() ||
      !formData.email?.trim() ||
      !formData.desgId?.trim()
    ) {
      toast.error(
        "Name, Phone, WhatsApp, Email and Designation are required"
      );
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setFormLoading(true);

    let cleanedFormData = cleanFormData(formData);
    cleanedFormData = {
      ...cleanedFormData,
      brandId:
        cleanedFormData?.brandId?.length > 0 ? cleanedFormData.brandId : [],
      distributorId:
        cleanedFormData?.distributorId?.length > 0
          ? cleanedFormData.distributorId
          : [],
      area: cleanedFormData?.area?.length > 0 ? cleanedFormData.area : [],
    };

    try {
      if (modalMode === "add") {
        await addEmployee(cleanedFormData);
        toast.success("Employee added successfully");
      } else {
        console.log(cleanedFormData, "cleanedFormData");
        console.log(selectedEmployee._id, "selectedEmployee._id");
        await updateEmployee(cleanedFormData, selectedEmployee._id);
        toast.success("Employee updated successfully");
      }
      setOpenModal(false);
      setFormData({
        name: "",
        empId: "",
        employeeLabel: "",
        phone: "",
        email: "",
        dob: "",
        joiningDate: "",
        headquarter: "",
        tenure: "",
        stateId: "",
        desgId: "",
        zoneId: "",
        regionId: [],
        brandId: [],
        area: [],
        reporting_manager: "",
        status: true,
        distributorId: [],
      });
      setSelectedEmployee(null);
      setModalMode("add");
      setCurrentRegionSelection("");
      setCurrentDistributorSelection("");
      setDistributorSearchTerm("");
    } catch (error) {
      console.error("Error saving employee", error);
      toast.error("Failed to save employee, try again");
    } finally {
      fetchEmployeesPaginated();
      setFormLoading(false);
    }
  };
  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee?.name,
      empId: employee?.empId,
      employeeLabel: employee?.employeeLabel,
      phone: employee?.phone || "",
      email: employee?.email || "",
      dob: employee?.dob
        ? new Date(employee.dob).toISOString().split("T")[0]
        : "",
      joiningDate: employee?.joiningDate
        ? new Date(employee.joiningDate).toISOString().split("T")[0]
        : "",
      headquarter: employee?.headquarter || "",
      tenure: employee?.tenure || "",
      stateId: employee?.stateId?._id || "",
      desgId: employee.desgId?._id,
      zoneId: employee.zoneId?._id,
      regionId: Array.isArray(employee.regionId)
        ? employee.regionId.map((region) => region._id)
        : employee.regionId?._id
          ? [employee.regionId._id]
          : [],
      brandId: employee.brandId?.map((brand) => brand._id),
      area: employee.area.map((area) => area),
      reporting_manager: employee?.empMappingId?.rmEmpId?._id,
      leaving_date: employee.leaving_date
        ? new Date(employee.leaving_date).toISOString().split("T")[0]
        : "",
      status: employee.status,
      distributorId: employee?.distributorId?.map(
        (distributor) => distributor._id
      ),
    });
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleStatusUpdate = (employee, leaving_date) => {
    openConfirmationModel({
      question: `Are you sure you want to ${employee.status ? "deactivate" : "activate"
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

  const EmpLeavingDateHandler = (employee) => {
    setSelectedEmployee(employee);
    setOpenLeavingDateModal(true);
  };

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
      employeeLabel: "",
      phone: "",
      email: "",
      dob: "",
      joiningDate: "",
      headquarter: "",
      tenure: "",
      stateId: "",
      desgId: "",
      zoneId: "",
      regionId: [],
      brandId: [],
      area: [],
      reporting_manager: "",
      leaving_date: "",
      status: true,
      distributorId: [],
    });
    setSelectedEmployee(null);
    setModalMode("add");
    setCurrentRegionSelection("");
    setCurrentDistributorSelection("");
    setDistributorSearchTerm("");
    setRegionToRemove(null);
  };

  const fetchReportingMangers = async (desgId) => {
    try {
      setManLoading(true);
      const response = await getEmployeeByDesignation(desgId);
      setReportingMangers(response?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setManLoading(false);
    }
  };

  const getParentDesignation = (desgId) => {
    let parentDesg = designations.find((desg) => desg._id === desgId)
      ?.parent_desg?._id;
    return parentDesg;
  };

  const handleShowCredential = async (employee) => {
    try {
      setCredentialModalLoading(true);
      setSelectedEmployeeForCredential(employee);
      setShowCredentialModal(true);
      const res = await getEmployeePassword(employee?._id);
      setEmpPassword(res?.data?.data?.password);
    } catch (error) {
      console.error(error);
    } finally {
      setCredentialModalLoading(false);
    }
  };

  const getDesgNameById = (desgId) => {
    const designation = designations.find((desg) => desg._id === desgId);
    return designation ? designation.name : "Unknown Designation";
  };

  const onCloseCredentialModal = () => {
    setShowCredentialModal(false);
    setSelectedEmployeeForCredential(null);
    setEmpPassword(null);
  };
  useEffect(() => {
    dispatch(fetchDesignations());
    dispatch(fetchZones());
    dispatch(fetchRegions());
    dispatch(fetchBrands());
    dispatch(fetchDistributors());
    dispatch(fetchStates());
  }, [dispatch]);

  useEffect(() => {
    if (
      formData?.desgId?.trim() !== "" &&
      getParentDesignation(formData?.desgId)
    ) {
      const parentDesg = getParentDesignation(formData?.desgId);
      fetchReportingMangers(parentDesg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.desgId]);

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

  const handleOpenDBListModal = (employee) => {
    console.log("handleOpenDBListModal", employee);
    setSelectedEmployeeForDBList(employee);
    setOpenDBListModal(true);
  };

  const handleCSVTemplateDownload = () => {
    const headers = [
      "Employee ID",
      "Employee Label",
      "Employee Name",
      "Designation Code",
      "RM Employee ID",
      "RM Designation Code",
      "State Code",

      "Distributor Code",
      "Brand Code",
      "Email",
      "Phone",
      "WhatsApp",
      "Date of Birth",
      "Joining Date",
      "Headquarter",
      "Tenure",
    ];

    const descriptions = [
      "(Optional)",
      "(Optional)",
      "(Required)",
      "(Required)",
      "(Optional)",
      "(Required)",
      "(Optional)[example: WB]",

      "(Optional)[example: DB01,DB02]",
      "(Optional)[example: CL,FT]",
      "(Required)",
      "(Required)",
      "(Required)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
    ];

    // Escape and join
    const csvString =
      headers.map(escapeCSVValue).join(",") +
      "\n" +
      descriptions.map(escapeCSVValue).join(",");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "employee_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const handleCSVImport = (url) => {
    setImportingCsv(true);
    fetchEmployeesPaginated();
    openConfirmationModel({
      question: "Are you sure you want to import this Employee CSV?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            let payload = {
              file: url,
            };
            const res = await bulkUpload(payload, "employee");

            toast.success(
              `${res?.data?.data?.length} rows updated in the Employee Master and ${res?.data?.skippedRows?.length} rows failed to update`
            );

            setErrorLog(res?.data?.skippedRows);

            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to import Employees, try again"
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

      // Dynamically get all unique keys from all objects
      const allKeys = Array.from(
        errorLog.reduce((keys, row) => {
          Object.keys(row).forEach((k) => keys.add(k));
          return keys;
        }, new Set())
      );

      // CSV header
      const csv = [allKeys.join(",")];

      // CSV rows
      errorLog.forEach((row) => {
        const csvRow = allKeys
          .map((key) => {
            // Escape quotes and wrap in quotes
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
        `skipped-employees-log_${moment()
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
        "Failed to download skipped employees log, try again"
      );
    }
  };

  const handleShowBrands = (emp) => {
    setSelectedEmployeeForBrands(emp);
    setOpenBrandsModal(true);
  };

  // Handle Select All distributors
  const handleSelectAllDistributors = (distributorsList, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        distributorId: distributorsList.map((d) => d._id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        distributorId: [],
      }));
    }
  };

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">

          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <h1 className="text-2xl font-bold">Employee Master</h1>
          </div>

          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count: {totalItems}</Badge>
                <Badge color="warning">Filtered Count: {filteredCount}</Badge>
              </div>
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
                <div className="w-44">
                  <div className="block">
                    <Label value="Search" />
                  </div>
                  <TextInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search "
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
                {/* filter 3 */}
                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="brandSelect" value="Select Brand" />
                  </div>
                  <Select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    id="brandSelect"
                    required
                  >
                    <option value="default">All</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
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
                {pagePermission?.create && (
                  <Button
                    className="text-xs"
                    size="sm"
                    onClick={() => setOpenModal(true)}
                  >
                    <IoMdAddCircle size={20} />
                    Add Employee
                  </Button>
                )}

                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    color="blue"
                    size="sm"
                    onClick={handleExportToCSV}
                    disabled={csvLoading}
                  >
                    <BiSolidFileExport size={20} />
                    {csvLoading ? "Downloading..." : "CSV Download"}
                  </Button>
                )}

                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    color="light"
                    size="sm"
                    onClick={() => {
                      handleCSVTemplateDownload();
                    }}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <MdSimCardDownload size={20} />
                      Template
                    </span>
                  </Button>
                )}

                {importingCsv ? (
                  <Button className="text-xs" size="sm" color="warning">
                    <span className="flex justify-center items-center gap-2">
                      <Spinner size="sm" />
                      Importing CSV...
                    </span>
                  </Button>
                ) : (
                  <FileUpload
                    type="single-file"
                    page="bulk-import"
                    onSetFileUrl={(url) => {
                      handleCSVImport(url);
                    }}
                  />
                )}

                {errorLog.length > 0 && (
                  <Button
                    className="text-xs"
                    color="red"
                    onClick={() => {
                      handleErrorLogDownload();
                    }}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <MdDownloadForOffline size={20} />
                      Error Log
                      <Badge color="gray">{errorLog.length}</Badge>
                    </span>
                  </Button>
                )}
              </div>
              {/* <div>
                <p className="text-sm text-red-500 flex items-center gap-2 mb-1">
                  <IoInformationCircleSharp size={20} /> CSP field:{" "}
                  <u>EMPLOYEE ID</u> is SFA field: <u>LABEL</u>
                </p>
                <p className="text-sm text-red-500 flex items-center gap-2">
                  <IoInformationCircleSharp size={20} /> CSP field: <u>LABEL</u> is
                  SFA field: <u>Emp_id</u>
                </p>
              </div> */}
            </Card>
          </div>

          {/* paginated table */}
          <div className="flex justify-end items-center w-full px-4 ">
            <div className="flex overflow-x-auto sm:justify-center">
              {!employeesLoading && filteredCount > 10 && (
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
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <div className="overflow-x-auto w-full">
              <Table striped>
                {" "}
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Employee ID

                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Employee Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    EMP Label

                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Email
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Phone
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Designation
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Zone
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    State
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Region
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    HQ
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Brand
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Reporting Manager
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Distributor(s)
                  </Table.HeadCell>
                  {approval_stage === "agent approval" && (
                    <Table.HeadCell className="whitespace-nowrap">
                      Show Credential
                    </Table.HeadCell>
                  )}
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Created At
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Updated At
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap text-center">
                    Action
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {employeesLoading ||
                    regionsLoading ||
                    brandsLoading ||
                    statesLoading ||
                    designationsLoading ? (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="17"
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
                      {employees?.map((employee, index) => (
                        <Table.Row
                          key={index}
                          className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          {" "}
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode text={employee.empId} codeName="Employee" />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {employee.name}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={employee.employeeLabel}
                              codeName="Employee Label"
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {employee.email || ""}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {employee.phone || ""}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {employee.desgId ? (
                              <>
                                {employee?.desgId?.name} (
                                <UniqueCode
                                  text={employee?.desgId?.code}
                                  codeName="Designation"
                                />
                                )
                              </>
                            ) : (
                              ""
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {employee?.zoneId ? (
                              <>
                                {employee?.zoneId?.name} (
                                <UniqueCode
                                  text={employee?.zoneId?.code}
                                  codeName="Zone"
                                />
                                )
                              </>
                            ) : (
                              ""
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {employee.stateId ? (
                              <>
                                {employee?.stateId?.name} (
                                <UniqueCode
                                  text={employee?.stateId?.slug}
                                  codeName="State"
                                />
                                )
                              </>
                            ) : (
                              ""
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {employee?.regionId ? (
                              <>
                                {employee?.regionId?.name} (
                                <UniqueCode
                                  text={employee?.regionId?.code}
                                  codeName="Region"
                                />
                                )
                              </>
                            ) : (
                              ""
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {employee.headquarter || ""}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span className="text-wrap">
                              {employee.brandId && employee.brandId.length > 0 ? (
                                <div
                                  className="flex justify-center items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={
                                    pagePermission?.view
                                      ? () => handleShowBrands(employee)
                                      : undefined
                                  }

                                >
                                  <IoIosList size={18} />
                                </div>
                              ) : null}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={employee?.empMappingId?.rmEmpId?.empId}
                              codeName="Employee"
                            />
                            {employee?.empMappingId?.rmEmpId?.empId ? " - " : ""}
                            {employee?.empMappingId?.rmEmpId
                              ? employee?.empMappingId?.rmEmpId?.name +
                              " - " +
                              employee?.empMappingId?.rmEmpId?.desgId?.name +
                              "-"
                              : ""}
                            {employee?.empMappingId?.rmEmpId ? (
                              <UniqueCode
                                text={employee?.empMappingId?.rmEmpId?.desgId?.code}
                                codeName="RM Designation"
                              />
                            ) : (
                              ""
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div
                              className="flex justify-center items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                              onClick={
                                pagePermission?.view
                                  ? () => handleOpenDBListModal(employee)
                                  : undefined
                              }

                            >
                              {employee?.distributorId?.length > 0 ? (
                                <IoIosList size={18} />
                              ) : null}
                            </div>
                          </Table.Cell>
                          {approval_stage === "agent approval" && (
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex gap-2 justify-center items-center text-black dark:text-white cursor-pointer">
                                {credentialModalLoading &&
                                  selectedEmployeeForCredential?._id ===
                                  employee._id ? (
                                  <ImSpinner className="animate-spin" size={20} />
                                ) : (
                                  <FaRegEye
                                    size={20}
                                    onClick={() => {
                                      handleShowCredential(employee);
                                    }}
                                  />
                                )}
                              </div>
                            </Table.Cell>
                          )}
                          <Table.Cell className="whitespace-nowrap font-medium">
                            {moment(employee?.createdAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY HH:mm:ss A")}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium">
                            {moment(employee?.updatedAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY HH:mm:ss A")}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium">
                            <StatusIndicator
                              status={employee.status}
                              onClick={
                                pagePermission?.update
                                  ? () => EmpLeavingDateHandler(employee)
                                  : undefined
                              }
                              disabled={!pagePermission?.update}
                            />

                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex gap-2 justify-center items-center">
                              {pagePermission?.update && (
                                <EditButton
                                  onClick={() => handleEditEmployee(employee)}
                                />
                              )}

                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}{" "}
                      {employees?.length === 0 && (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan="17"
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

          {openLeavingDateModal && (
            <LeavingDate
              openLeavingDateModal={openLeavingDateModal}
              setOpenLeavingDateModal={setOpenLeavingDateModal}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
              handleStatusUpdate={handleStatusUpdate}
            />
          )}

          <Modal show={openModal} onClose={() => onCloseModal()}>
            <Modal.Header>
              {modalMode === "add" ? "Add Employee" : "Edit Employee"}
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {" "}
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
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Employee Label(SFA field: Emp_Id)*" />
                    </div>
                    <TextInput
                      name="employeeLabel"
                      placeholder="Enter Employee Label"
                      value={formData.employeeLabel}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Employee Id (SFA field: Label)" />
                    </div>
                    <TextInput
                      name="empId"
                      placeholder="Enter Employee ID"
                      value={formData.empId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Email" />
                    </div>
                    <TextInput
                      name="email"
                      type="email"
                      placeholder="Enter Email *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="WhatsApp *" />
                    </div>
                    <TextInput
                      name="whatsapp"
                      placeholder="Enter WhatsApp Number"
                      value={formData.whatsapp || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Phone *" />
                    </div>
                    <TextInput
                      name="phone"
                      placeholder="Enter Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Alternate Mobile Number" />
                    </div>
                    <TextInput
                      name="alternateMobile"
                      placeholder="Enter Alternate Mobile Number"
                      value={formData.alternateMobile || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Date of Birth" />
                    </div>
                    <TextInput
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      onFocus={(e) => e.target.showPicker()}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Joining Date" />
                    </div>
                    <TextInput
                      name="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      onFocus={(e) => e.target.showPicker()}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Headquarter" />
                    </div>
                    <TextInput
                      name="headquarter"
                      placeholder="Enter Headquarter"
                      value={formData.headquarter}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Tenure (Years)" />
                    </div>
                    <TextInput
                      name="tenure"
                      type="number"
                      placeholder="Enter Tenure"
                      value={formData.tenure}
                      onChange={handleChange}
                    />
                  </div>
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
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="State" />
                    </div>
                    <Select
                      name="stateId"
                      value={formData.stateId}
                      onChange={handleChange}
                    >
                      <option value="">Select State</option>
                      {states?.length > 0 &&
                        states?.map((state) => (
                          <option key={state?._id} value={state?._id}>
                            {state?.name}
                          </option>
                        ))}
                    </Select>
                  </div>
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Area" />
                    </div>
                    <TextInput
                      name="area"
                      placeholder="Enter Areas (comma-separated)"
                      value={formData?.area?.join(", ")}
                      onChange={handleChange}
                    />
                  </div>
                  {formData?.desgId?.trim() !== "" &&
                    getParentDesignation(formData?.desgId) && (
                      <div className="w-full">
                        <div className="mb-2 block text-gray-700 dark:text-gray-100">
                          <Label>
                            Reporting Manager
                            <span className="text-blue-500 ml-2">
                              {manLoading && "[ Loading Manager ... ]"}
                            </span>
                            <span className="text-red-500 ml-2">
                              {!manLoading &&
                                activeReportingManger.length === 0 &&
                                "[ No Manager found for this Designation ]"}
                            </span>
                          </Label>
                        </div>
                        <Select
                          name="reporting_manager"
                          value={formData?.reporting_manager}
                          onChange={handleChange}
                        >
                          <option value="">Select Reporting Manager</option>
                          {activeReportingManger.map((man) => {
                            return (
                              <option key={man?._id} value={man?._id}>
                                {man?.name} [{man?.desgId?.name} - {man?.empId}]
                                {man?.regionId?.name &&
                                  man?.zoneId?.name &&
                                  `[
                                ${man?.regionId?.name}, ${man?.zoneId?.name}]`}
                              </option>
                            );
                          })}
                        </Select>
                      </div>
                    )}
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Brand(s)" />
                    </div>
                    <div className="flex flex-row flex-wrap gap-4 justify-start items-center">
                      {brands?.length > 0 &&
                        brands
                          ?.filter((brand) => brand.status == true)
                          .map((brand) => (
                            <div
                              key={brand._id}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                name="brandId"
                                id={brand._id}
                                value={brand._id}
                                checked={formData?.brandId?.includes(brand?._id)}
                                onChange={handleChange}
                              />
                              <Label
                                htmlFor={`brand-${brand._id}`}
                                value={`${brand?.name} (${brand?.desc})`}
                              />
                            </div>
                          ))}
                    </div>
                  </div>
                  <div className="w-full space-y-4">
                    {/* Selected Regions & Distributors Display - Collapsible */}
                    {formData.regionId.length > 0 && (
                      <div className="w-full">
                        <div className="mb-2 block text-gray-700 dark:text-gray-100">
                          <Label value="Selected Regions & Distributors" />

                        </div>
                        <div className="space-y-2">
                          {formData.regionId.map((regId) => {
                            const region = regions.find((r) => r._id === regId);
                            const regionDistributors = formData.distributorId
                              .map((distId) =>
                                distributors.find((d) => d._id === distId)
                              )
                              .filter((dist) => dist?.regionId?._id === regId);

                            return region ? (
                              <details
                                key={regId}
                                className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                                open={regionToRemove === regId}
                              >
                                <summary className="cursor-pointer font-semibold flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <Badge color="info">
                                      {region.name} ({region.code})
                                    </Badge>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {regionDistributors.length} distributor(s)
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setRegionToRemove(regId);
                                    }}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                  >
                                    Remove Region
                                  </button>
                                </summary>

                                {/* Warning Alert */}
                                {regionToRemove === regId && (
                                  <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded">
                                    <div className="flex flex-col gap-3">
                                      <div className="flex items-start gap-2">
                                        <MdInfoOutline
                                          className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                                          size={20}
                                        />
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                            Warning: Remove Region
                                          </p>
                                          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                            Removing this region will automatically remove all associated
                                            beats for this region. Do you want to continue?
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          size="xs"
                                          color="gray"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setRegionToRemove(null);
                                          }}
                                        >
                                          No, Cancel
                                        </Button>
                                        <Button
                                          size="xs"
                                          color="failure"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setFormData((prev) => ({
                                              ...prev,
                                              regionId: prev.regionId.filter((id) => id !== regId),
                                              distributorId: prev.distributorId.filter((distId) => {
                                                const dist = distributors.find((d) => d._id === distId);
                                                return dist?.regionId?._id !== regId;
                                              }),
                                            }));
                                            setRegionToRemove(null);
                                          }}
                                        >
                                          Yes, Remove
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Distributor List */}
                                <div className="mt-3 pl-4 space-y-2">
                                  {regionDistributors.length > 0 ? (
                                    regionDistributors.map((dist) => (
                                      <div
                                        key={dist._id}
                                        className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded"
                                      >
                                        <span className="text-sm">
                                          {dist.name} ({dist.dbCode})
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setFormData((prev) => ({
                                              ...prev,
                                              distributorId: prev.distributorId.filter(
                                                (id) => id !== dist._id
                                              ),
                                            }));
                                          }}
                                          className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">
                                      No distributors selected for this region
                                    </p>
                                  )}
                                </div>
                              </details>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Region Dropdown */}
                    <div className="w-full">
                      <div className="mb-2 block text-gray-700 dark:text-gray">
                        <Label value="Select Region" />
                      </div>

                      {/* dropdown */}

                      <Select
                        value={currentDistributorSelection}
                        onChange={(e) => {
                          const selectedRegionId = e.target.value;
                          setCurrentRegionSelection(selectedRegionId);
                          setCurrentDistributorSelection(""); //reset the distrbutor for the current region

                          if (
                            selectedRegionId &&
                            !formData.regionId.includes(selectedRegionId)
                          ) {
                            setFormData((prev) => ({
                              ...prev,
                              regionId: [...prev.regionId, selectedRegionId],
                            }));
                          }
                        }}
                      >
                        <option value="">Choose a region</option>
                        {regions?.length > 0 &&
                          regions.map((region) => (
                            <option key={region._id} value={region._id}>
                              {region.name} ({region.code})
                            </option>
                          ))}
                      </Select>
                    </div>

                    {/* Distributor Selection with Checkboxes & Search */}
                    {currentRegionSelection && (
                      <div className="w-full">
                        <div className="mb-2 block text-gray-700 dark:text-gray-100">
                          <Label
                            value={`Select Distributors from ${regions.find((r) => r._id === currentRegionSelection)
                              ?.name || "Region"
                              }`}
                          />
                        </div>

                        <div className="border rounded-lg p-3 bg-white dark:bg-gray-800">
                          {/* Search Bar */}
                          <TextInput
                            type="text"
                            placeholder="Search distributors..."
                            value={distributorSearchTerm}
                            onChange={(e) =>
                              setDistributorSearchTerm(e.target.value)
                            }
                            className="mb-3"
                          />

                          {/* Select All Checkbox */}
                          <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-600">
                            <Checkbox
                              id={`select-all-${currentRegionSelection}`}
                              checked={
                                distributors
                                  .filter(
                                    (d) =>
                                      d?.regionId?._id === currentRegionSelection
                                  )
                                  .filter(
                                    (d) =>
                                      d.name
                                        .toLowerCase()
                                        .includes(
                                          distributorSearchTerm.toLowerCase()
                                        ) ||
                                      d.dbCode
                                        .toLowerCase()
                                        .includes(
                                          distributorSearchTerm.toLowerCase()
                                        )
                                  ).length > 0 &&
                                distributors
                                  .filter(
                                    (d) =>
                                      d?.regionId?._id === currentRegionSelection
                                  )
                                  .filter(
                                    (d) =>
                                      d.name
                                        .toLowerCase()
                                        .includes(
                                          distributorSearchTerm.toLowerCase()
                                        ) ||
                                      d.dbCode
                                        .toLowerCase()
                                        .includes(
                                          distributorSearchTerm.toLowerCase()
                                        )
                                  )
                                  .every((d) =>
                                    formData.distributorId.includes(d._id)
                                  )
                              }
                              onChange={(e) => {
                                const regionDistributors = distributors
                                  .filter(
                                    (d) =>
                                      d?.regionId?._id === currentRegionSelection
                                  )
                                  .filter(
                                    (d) =>
                                      d.name
                                        .toLowerCase()
                                        .includes(
                                          distributorSearchTerm.toLowerCase()
                                        ) ||
                                      d.dbCode
                                        .toLowerCase()
                                        .includes(
                                          distributorSearchTerm.toLowerCase()
                                        )
                                  );

                                if (e.target.checked) {
                                  // Add all filtered distributors
                                  const newDistributorIds = regionDistributors
                                    .filter(
                                      (d) => !formData.distributorId.includes(d._id)
                                    )
                                    .map((d) => d._id);

                                  setFormData((prev) => ({
                                    ...prev,
                                    distributorId: [
                                      ...prev.distributorId,
                                      ...newDistributorIds,
                                    ],
                                  }));
                                } else {
                                  // Remove all filtered distributors
                                  const distributorIdsToRemove =
                                    regionDistributors.map((d) => d._id);
                                  setFormData((prev) => ({
                                    ...prev,
                                    distributorId: prev.distributorId.filter(
                                      (id) => !distributorIdsToRemove.includes(id)
                                    ),
                                  }));
                                }
                              }}
                            />
                            <Label
                              htmlFor={`select-all-${currentRegionSelection}`}
                              className="ml-2 font-semibold"
                            >
                              Select All
                            </Label>
                          </div>

                          {/* Distributor List with Checkboxes */}
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {distributors
                              .filter(
                                (d) => d?.regionId?._id === currentRegionSelection
                              )
                              .filter(
                                (d) =>
                                  d.name
                                    .toLowerCase()
                                    .includes(
                                      distributorSearchTerm.toLowerCase()
                                    ) ||
                                  d.dbCode
                                    .toLowerCase()
                                    .includes(distributorSearchTerm.toLowerCase())
                              )
                              .map((distributor) => (
                                <div
                                  key={distributor._id}
                                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                  <Checkbox
                                    id={`dist-${distributor._id}`}
                                    checked={formData.distributorId.includes(
                                      distributor._id
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData((prev) => ({
                                          ...prev,
                                          distributorId: [
                                            ...prev.distributorId,
                                            distributor._id,
                                          ],
                                        }));
                                      } else {
                                        setFormData((prev) => ({
                                          ...prev,
                                          distributorId: prev.distributorId.filter(
                                            (id) => id !== distributor._id
                                          ),
                                        }));
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`dist-${distributor._id}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    {distributor.name} ({distributor.dbCode})
                                  </Label>
                                </div>
                              ))}

                            {distributors
                              .filter(
                                (d) => d?.regionId?._id === currentRegionSelection
                              )
                              .filter(
                                (d) =>
                                  d.name
                                    .toLowerCase()
                                    .includes(
                                      distributorSearchTerm.toLowerCase()
                                    ) ||
                                  d.dbCode
                                    .toLowerCase()
                                    .includes(distributorSearchTerm.toLowerCase())
                              ).length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  No distributors found
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Button to clear current selections */}
                    {currentRegionSelection && (
                      <Button
                        type="button"
                        size="sm"
                        color="light"
                        onClick={() => {
                          setCurrentRegionSelection("");
                          setDistributorSearchTerm("");
                        }}
                      >
                        Clear & Choose Another Region
                      </Button>
                    )}
                  </div>
                  <div className="w-full">
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className={`${formLoading ? "opacity-60 cursor-not-allowed" : ""
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

          {/* credential modal */}
          {showCredentialModal && (
            <ShowEmployeeCredential
              showCredentialModal={showCredentialModal}
              selectedEmployeeForCredential={selectedEmployeeForCredential}
              credentialModalLoading={credentialModalLoading}
              empPassword={empPassword}
              onCloseCredentialModal={onCloseCredentialModal}
            />
          )}

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
      ) : (
        <div className="w-full h-[70vh] flex justify-center items-center">
          <h1 className="text-xl font-semibold text-red-500">
            Access Denied
          </h1>
        </div>
      )}
    </>
  );

};
