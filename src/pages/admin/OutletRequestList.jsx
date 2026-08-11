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
} from "flowbite-react";
import { beatListPaginated } from "../../api/api";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTimesCircle } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { MdDownloadForOffline, MdSimCardDownload } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import { bulkUpload } from "../../api/api";
import { ApprovedRejectOutlet } from "../../api/outletApi";
import { StatusIndicator2 } from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchStates } from "../../redux/stateSlice";
import { fetchZones } from "../../redux/zoneSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { getPagePermission } from "../../utils/permissionHelper";
import { createSingleOutlet } from "../../api/api";
import { TextInput } from "flowbite-react";
import SearchableSelect from "../../components/SearchableSelect";
import validatePhone from "../../utils/validatePhone";
import {SearchEmployeeById} from "../../api/api";


const OutletRequestList = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedOutletDetails, setSelectedOutletDetails] = useState(null);
  const [outletsLoading, setOutletsLoading] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedState, setSelectedState] = useState("default");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [approveRejectLoading, setApproveRejectLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [employeeSearchLoading, setEmployeeSearchLoading] = useState(false);
  const [errorLog, setErrorLog] = useState([]);
  const [selectedOutletIds, setSelectedOutletIds] = useState([]);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  const [openAddOutletModal, setOpenAddOutletModal] = useState(false);

  const [singleOutletLoading, setSingleOutletLoading] = useState(false);
  const [beats, setBeats] = useState([]);
  const [beatsLoading, setBeatsLoading] = useState(false);

  const [singleOutletForm, setSingleOutletForm] = useState({
    outletCode: "",
    outletName: "",
    sudoName: "",
    ownerName: "",

    employeeCode: "",
    employeeName: "",
    cso: "",

    beatCode: "",
    subDivisionCode: "",

    stateCode: "",
    region: "",
    distributor: "",
    beatType: "",

    mobile1: "",
    mobile2: "",
    whatsappNumber: "",
    email: "",

    address1: "",
    city: "",
    pin: "",

    // NEW
    gstImage: "",
    panImage: "",
    aadhaarImage: "",
    bankImage: "",
  });
const fetchEmployeeByCodeWithoutDebounce = async (code) => {
  if (!code?.trim()) {
    setSingleOutletForm((prev) => ({ ...prev, employeeName: "" }));
    return;
  }
  try {
    setEmployeeSearchLoading(true);
    const response = await SearchEmployeeById(code.trim());
    const match =
      response?.data?.data?.find(
        (emp) => emp.empId?.toLowerCase() === code.trim().toLowerCase()
      ) || response?.data?.data?.[0];

    setSingleOutletForm((prev) => ({
      ...prev,
      employeeName: match?.name || "",
    }));

    if (!match) {
      toast.error("No employee found for this code");
    }
  } catch (error) {
    setSingleOutletForm((prev) => ({ ...prev, employeeName: "" }));
    toast.error(
      error?.message || "Failed to fetch employee details"
    );
  } finally {
    setEmployeeSearchLoading(false);
  }
};

const fetchEmployeeByCode = useDebounce(
  fetchEmployeeByCodeWithoutDebounce,
  500
);
  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "outlet-lead");
    setPagePermission(permission);
  }, [permissionState]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };
  const onPageChange = (page) => setCurrentPage(page);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchZones());
    dispatch(fetchRegions());
    dispatch(fetchStates());
  }, [dispatch]);
  useEffect(() => {
    fetchOutletsPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedRegion, selectedState, statusFilter, dateRange]);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, selectedState, statusFilter, dateRange]);
  // const { zones } = useSelector((state) => state.zone);


  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.region
  );

  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );

  let fetchOutletsPaginatedWithOutDebounce = async () => {
    try {
      setOutletsLoading(true);
      const query = {
        page: currentPage,
        limit: 50,
      };

      if (statusFilter !== "All") {
        query.outletStatus = statusFilter;
      }
      if (statusFilter === "All") {
        delete query.outletStatus;
      }

      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }

      if (selectedState !== "default") {
        query.stateId = selectedState;
      }

      if (dateRange.startDate && dateRange.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/outlet/paginated-outlet-list`,
        {
          params: query,
        }
      );

      setOutlets(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Outlets"
      );
    } finally {
      setOutletsLoading(false);
    }
  };

  let fetchOutletsPaginated = useDebounce(
    fetchOutletsPaginatedWithOutDebounce,
    500
  );
  const handleResetFilter = () => {
    setStatusFilter("Pending");
    setSelectedRegion("default");
    setSelectedState("default");
    setSelectedOutletDetails(null);
    setDateRange({
      startDate: null,
      endDate: null,
    });
    fetchOutletsPaginated();
  };

  const handleOutletDetails = (outlet) => {
    setSelectedOutletDetails(outlet);
    setOpenModal(true);
  };

  const onCloseModal = () => {
    fetchOutletsPaginated();
    setOpenModal(false);
    setSelectedOutletDetails(null);
  };

  const handleErrorLogDownload = async () => {
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
      a.setAttribute("download", "skipped-outlets-log.csv");
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
        "Failed to download skipped outlets log, try again"
      );
    }
  };

  const allOutletsSelected = () => {
    // Only consider pending outlets for selection
    const pendingOutlets = outlets.filter(
      (outlet) => outlet.outletStatus === "Pending"
    );
    return (
      pendingOutlets.length > 0 &&
      pendingOutlets.every((outlet) => selectedOutletIds.includes(outlet._id))
    );
  };
  const handleApprovedReject = (status) => {
    fetchOutletsPaginated();
    openConfirmationModel({
      question: `Are you sure you want to ${status.toLowerCase()} ${selectedOutletIds.length
        } selected outlet${selectedOutletIds.length > 1 ? "s" : ""}?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          setApproveRejectLoading(true);
          let payload = {
            outletIds: selectedOutletIds,
            status: status,
          };

          await toast.promise(ApprovedRejectOutlet(payload), {
            loading: `${status === "Approved" ? "Approving" : "Rejecting"
              } outlets...`,
            success: (res) => {
              setErrorLog(res?.data?.skippedOutlets);
              onCloseModal();
              setApproveRejectLoading(false);
              fetchOutletsPaginated();
              console.log(res, "res");
              return `${res?.data?.totalProcessed
                } outlets processed successfully${res?.data?.totalSkipped > 0
                  ? ` and ${res?.data?.totalSkipped} failed`
                  : ""
                }`;
            },
            error: (error) => {
              setApproveRejectLoading(false);
              fetchOutletsPaginated();
              return (
                error?.response?.data?.message ||
                "Operation failed, please try again"
              );
            },
          });

          setSelectedOutletIds([]);
        } else {
          onCloseModal();
          setSelectedOutletIds([]);
          return;
        }
      },
    });
  };

  const handleBulkApprovedReject = async (url) => {
    try {
      fetchOutletsPaginated();
      openConfirmationModel({
        question: "Are you sure you want to import this pending Outlet CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };
              const res = await bulkUpload(payload, "outlet");

              toast.success(
                `${res?.data?.data?.length} rows updated in the Outlet Master and ${res?.data?.skippedRows?.length} rows failed to update`
              );

              setErrorLog(res?.data?.skippedRows);

              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                "Failed to import Outlets, try again"
              );
            }
          } else {
            onCloseModal();
            return;
          }
        },
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to import Outlets, try again"
      );
    }
  };
  // console.log(outlets);

  const handleCSVTemplateDownload = () => {
    const headers = [
      "Outlet Code",
      "Outlet Name",
      "Sudo Name",
      "CSO",
      "Owner Name",
      "Employee Code",
      "Beat Code",
      "State Code",
      "Mobile Number",
      "Alternate Number",
      "WhatsApp Number",
      "Email",
      "Zone",
      "Region",
      "Address 1",
      "PIN",
      "Ship To Address",
      "Ship To Pincode",
      "City",
      "Aadhar Number",
      "PAN Number",
      "GSTIN",
      "Retailer Class",
      "Brand Code",
      "Google Map Link",
    ];

    const descriptions = [
      "(Required)",
      "(Required)",
      "(Optional)",
      "(Optional)",
      "(Required)",
      "(Optional)",
      "(Required) [Example: BEAT-492,BEAT-183]",
      "(Required)[Example: WB]",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      "(Optional)",
      '(Optional)[Example: A][Valid: "A", "B", "C", "D"]',
      "(Optional) [Exmaple: BRAND001,BRAND002]",
      "(Optional)",
    ];

    // Escape and join
    const csvString =
      headers.map(escapeCSVValue).join(",") +
      "\n" +
      descriptions.map(escapeCSVValue).join(",");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "outlet_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


const handleSingleOutletChange = (e) => {
  const { name, value } = e.target;
  if (["mobile1", "mobile2", "whatsappNumber"].includes(name)) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 10) return;
    setSingleOutletForm((prev) => ({ ...prev, [name]: cleaned }));
    return;
  }

  setSingleOutletForm({
    ...singleOutletForm,
    [name]: value,
  });

  if (name === "employeeCode") {
    fetchEmployeeByCode(value);
  }
};

  const handleCreateSingleOutlet = async () => {
    try {

      // =========================
      // REQUIRED FIELD VALIDATION
      // =========================

      if (
        !singleOutletForm.outletCode?.trim() ||
        !singleOutletForm.outletName?.trim() ||
        !singleOutletForm.ownerName?.trim() ||
        !singleOutletForm.beatCode?.trim()
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      // =========================
      // MOBILE VALIDATION (Optional - only validate if provided)
      // =========================

      if (singleOutletForm.mobile1?.trim()) {
        const mobile1Result = validatePhone(singleOutletForm.mobile1);
        if (!mobile1Result.valid) {
          toast.error(mobile1Result.message);
          return;
        }
      }

      if (singleOutletForm.mobile2?.trim()) {
        const mobile2Result = validatePhone(singleOutletForm.mobile2);
        if (!mobile2Result.valid) {
          toast.error(mobile2Result.message);
          return;
        }
      }

      if (singleOutletForm.whatsappNumber?.trim()) {
        const whatsappResult = validatePhone(singleOutletForm.whatsappNumber);
        if (!whatsappResult.valid) {
          toast.error(whatsappResult.message);
          return;
        }
      }

      setSingleOutletLoading(true);

      const payload = {

        outletCode:
          singleOutletForm.outletCode?.trim(),

        outletName:
          singleOutletForm.outletName?.trim(),

        sudoName:
          singleOutletForm.sudoName?.trim(),

        ownerName:
          singleOutletForm.ownerName?.trim(),

        employeeCode:
          singleOutletForm.employeeCode?.trim(),
        cso: singleOutletForm.cso?.trim(),
        beatCode:
          singleOutletForm.beatCode?.trim(),

        stateCode:
          singleOutletForm.stateCode?.trim(),

        mobile1:
          singleOutletForm.mobile1?.trim(),

        mobile2:
          singleOutletForm.mobile2?.trim(),

        whatsappNumber:
          singleOutletForm.whatsappNumber?.trim(),

        email:
          singleOutletForm.email?.trim(),

        address1:
          singleOutletForm.address1?.trim(),

        city:
          singleOutletForm.city?.trim(),

        pin:
          singleOutletForm.pin?.trim(),
        gstImage: singleOutletForm.gstImage,
        panImage: singleOutletForm.panImage,
        aadhaarImage: singleOutletForm.aadhaarImage,
        bankImage: singleOutletForm.bankImage,
      };

      console.log(
        "CREATE OUTLET PAYLOAD",
        payload
      );

      const response =
        await createSingleOutlet(payload);

      toast.success(
        response?.data?.message ||
        "Outlet created successfully"
      );

      setOpenAddOutletModal(false);

      // =========================
      // RESET FORM
      // =========================

      setSingleOutletForm({
        outletCode: "",
        outletName: "",
        sudoName: "",
        ownerName: "",

        employeeCode: "",
        employeeName: "",

        beatCode: "",

        subDivisionCode: "",

        stateCode: "",
        region: "",
        distributor: "",
        beatType: "",

        mobile1: "",
        mobile2: "",
        whatsappNumber: "",
        email: "",

        address1: "",

        city: "",
        pin: "",
      });

      fetchOutletsPaginated();

    } catch (error) {

      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create outlet"
      );

    } finally {

      setSingleOutletLoading(false);

    }
  };

  const fetchBeatList = async () => {
    try {
      setBeatsLoading(true);

      const response = await beatListPaginated({
        page: 1,
        limit: 1000,
      });

      setBeats(response?.data?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch beats"
      );
    } finally {
      setBeatsLoading(false);
    }
  };

  const commonInputClass =
    "[&_input]:!h-[44px] " +
    "[&_input]:!rounded-xl " +
    "[&_input]:!border " +
    "[&_input]:!border-slate-600 " +
    "[&_input]:!bg-slate-700/80 " +
    "[&_input]:!px-4 " +
    "[&_input]:!text-sm " +
    "[&_input]:!font-medium " +
    "[&_input]:!text-white " +
    "[&_input]:placeholder:!text-slate-400 " +
    "[&_input]:!shadow-sm " +
    "[&_input]:!transition-all " +
    "[&_input]:!duration-200 " +
    "[&_input]:focus:!border-indigo-500 " +
    "[&_input]:focus:!ring-2 " +
    "[&_input]:focus:!ring-indigo-500/40 " +
    "[&_input]:focus:!bg-slate-700";
  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">

          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <h1 className="text-2xl font-bold">Lead Approvals</h1>
          </div>

          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count: {totalItems}</Badge>
                <Badge color="warning">Filtered Count: {filteredCount}</Badge>
              </div>
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
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
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    {/* <option value="Rejected">Rejected</option> */}
                  </Select>
                </div>
                {/* filter 2 */}
                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="stateSelect" value="Select State" />
                  </div>
                  <Select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    id="stateSelect"
                    required
                  >
                    <option value="default">All</option>
                    {states.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </Select>
                </div>
                {/* filter 3 */}
                {/* <div className="w-56">
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
                </div> */}

                {/* filter 4 */}
                <div className="w-64">
                  <div className="mb-2 block">
                    <Label htmlFor="dateRangeSelect" value="Select Date Range" />
                  </div>
                  <Datepicker
                    showShortcuts={true}
                    value={dateRange}
                    onChange={handleDateRangeChange}
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
                    fetchBeatList();
                    setOpenAddOutletModal(true);
                  }}
                >
                  Add Outlet
                </Button>
                {/* <Button
              className="text-xs"
              color="blue"
              size="sm"
              onClick={handleExportToCSV}
              disabled={csvLoading}
            >
              <BiSolidFileExport size={20} />
              {csvLoading ? "Downloading..." : "CSV Download"}
            </Button> */}

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
                {pagePermission?.create && (
                  <FileUpload
                    type="single-file"
                    page="bulk-import"
                    onSetFileUrl={(url) => {
                      handleBulkApprovedReject(url);
                    }}
                    btnTitle="File Upload"
                  />)}

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
              {selectedOutletIds.length > 0 && (
                <div className="flex justify-center w-full items-center gap-2 flex-wrap">
                  <div className="flex justify-center items-center gap-2 text-sm bg-yellow-400 py-1 px-2 rounded-md text-white">
                    <span>{selectedOutletIds.length} Outlets Selected</span>
                    <span
                      className="text-xs cursor-pointer"
                      onClick={() => {
                        setSelectedOutletIds([]);
                      }}
                    >
                      <FaTimesCircle color="red" size={15} />
                    </span>
                  </div>
                  {pagePermission?.update && (
                    <Button
                      className="text-xs"
                      size="sm"
                      color="success"
                      onClick={() => {
                        handleApprovedReject("Approved");
                      }}
                      disabled={approveRejectLoading}
                    >
                      {approveRejectLoading ? "wait..." : "Approve"}
                    </Button>)}
                  {pagePermission?.update && (
                    <Button
                      className="text-xs"
                      size="sm"
                      color="red"
                      onClick={() => {
                        handleApprovedReject("Rejected");
                      }}
                      disabled={approveRejectLoading}
                    >
                      {approveRejectLoading ? "wait..." : "Reject"}
                    </Button>)}
                </div>
              )}
            </Card>
          </div>

          {/* paginated table */}
          <div className="flex justify-end items-center w-full px-4 ">
            <div className="flex overflow-x-auto sm:justify-center">
              {!outletsLoading && filteredCount > 10 && (
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
                  <Table.HeadCell className="whitespace-nowrap">
                    <Checkbox
                      checked={allOutletsSelected()}
                      onChange={
                        pagePermission?.update
                          ? () => {
                            if (allOutletsSelected()) {
                              setSelectedOutletIds(
                                selectedOutletIds.filter(
                                  (id) =>
                                    !outlets
                                      .map((outlet) => outlet._id)
                                      .includes(id)
                                )
                              );
                            } else {
                              let newSelectedOutlets = [
                                ...selectedOutletIds,
                              ];
                              outlets.forEach((outlet) => {
                                if (
                                  !newSelectedOutlets.includes(
                                    outlet._id
                                  ) &&
                                  outlet.outletStatus === "Pending"
                                ) {
                                  newSelectedOutlets.push(outlet._id);
                                }
                              });
                              setSelectedOutletIds([
                                ...newSelectedOutlets,
                              ]);
                            }
                          }
                          : undefined
                      }
                      disabled={!pagePermission?.update}
                    />

                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Lead ID
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Outlet Code
                  </Table.HeadCell>
                  {/* <Table.HeadCell className="whitespace-nowrap">
                    Outlet UID
                  </Table.HeadCell> */}
                  <Table.HeadCell className="whitespace-nowrap">
                    Outlet Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Owner Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Phone Number
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    State
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    City
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Location
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Outlet Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Remarks
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {outletsLoading || regionsLoading || statesLoading ? (
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
                      {outlets?.map((outlet, index) => {
                        // console.log({ outlet });

                        return (
                          <Table.Row
                            key={index}
                            className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                          >
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <Checkbox
                                checked={selectedOutletIds.includes(outlet._id)}
                                onChange={
                                  pagePermission?.update
                                    ? () => {
                                      if (selectedOutletIds.includes(outlet._id)) {
                                        setSelectedOutletIds(
                                          selectedOutletIds.filter(
                                            (id) => id !== outlet._id
                                          )
                                        );
                                      } else {
                                        if (outlet.outletStatus === "Pending") {
                                          setSelectedOutletIds([
                                            ...selectedOutletIds,
                                            outlet._id,
                                          ]);
                                        } else {
                                          toast.error(
                                            "Only pending outlets can be selected"
                                          );
                                        }
                                      }
                                    }
                                    : undefined
                                }
                                disabled={
                                  outlet.outletStatus !== "Pending" ||
                                  !pagePermission?.update
                                }
                              />

                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex gap-2 justify-center items-center">
                                <UniqueCode
                                  text={outlet?.leadId}
                                  codeName="Lead Code"
                                />
                                <span
                                  className="cursor-pointer"
                                  onClick={() => handleOutletDetails(outlet)}
                                >
                                  <FiExternalLink color="#3795BD" />
                                </span>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex gap-2 justify-center items-center">
                                <UniqueCode
                                  text={outlet?.outletCode}
                                  codeName="Outlet Code"
                                />
                                <span onClick={() => handleOutletDetails(outlet)}>
                                  <FiExternalLink color="#3795BD" />
                                </span>
                              </div>
                            </Table.Cell>
                            {/* <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex gap-2 justify-center items-center">
                                <UniqueCode
                                  text={outlet?.outletUID}
                                  codeName="Outlet UID Code"
                                />
                                <span
                                  className="cursor-pointer"
                                  onClick={() => handleOutletDetails(outlet)}
                                >
                                  <FiExternalLink color="#3795BD" />
                                </span>
                              </div>
                            </Table.Cell> */}
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 cursor-pointer">
                              <div className="flex gap-2 justify-center items-center">
                                <span>
                                  {outlet?.outletName}
                                  {outlet?.sudoName && ` (${outlet.sudoName})`}
                                </span>

                                <span
                                  className="cursor-pointer"
                                  onClick={() => handleOutletDetails(outlet)}
                                >
                                  <FiExternalLink color="#3795BD" />
                                </span>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {outlet?.ownerName}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {outlet?.mobile1}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {outlet?.stateId?.name}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {outlet?.city}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {outlet?.location}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium">
                              <StatusIndicator2 status={outlet?.outletStatus} />
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium">
                              <p>{outlet?.remarks}</p>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                      {outlets?.length === 0 && (
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

          {/* Details Modal */}
          <Modal show={openModal} onClose={onCloseModal} size="6xl">
            <Modal.Header>Outlet Details</Modal.Header>
            <Modal.Body>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {selectedOutletDetails &&
                          [
                            ["Outlet Code", selectedOutletDetails?.outletCode],
                            // ["Outlet UID", selectedOutletDetails?.outletUID],
                            ["Outlet Name", selectedOutletDetails?.outletName],
                            ["Sudo Name", selectedOutletDetails?.sudoName],
                            ["Owner Name", selectedOutletDetails?.ownerName],
                            ["Mobile 1", selectedOutletDetails?.mobile1],
                            ["Mobile 2", selectedOutletDetails?.mobile2],
                            [
                              "Category of Outlet",
                              selectedOutletDetails?.categoryOfOutlet,
                            ],
                            ["Address", selectedOutletDetails?.address1],
                            ["City", selectedOutletDetails?.city],
                            ["Location", selectedOutletDetails?.location],
                            ["State", selectedOutletDetails?.stateId?.name],
                            [
                              "Region",
                              selectedOutletDetails?.distributorId?.regionId?.name,
                            ],
                            ["District", selectedOutletDetails?.district?.name],
                            ["Beat Name", selectedOutletDetails?.beatId?.name],
                            [
                              "Employee Name",
                              selectedOutletDetails?.employeeId?.name,
                            ],
                            ["ASM Name", selectedOutletDetails?.asm?.name],
                            ["RSM Name", selectedOutletDetails?.rsm?.name],
                            [
                              "Existing Retailer",
                              selectedOutletDetails?.existingRetailer
                                ? "Yes"
                                : "No",
                            ],
                            [
                              "Outlet Status",
                              selectedOutletDetails?.status ? "Active" : "Inactive",
                            ],
                            ["Outlet Source", selectedOutletDetails?.outletSource],
                            [
                              "Tele Calling Slots",
                              selectedOutletDetails?.teleCallingSlot?.join(", "),
                            ],
                            [
                              "Selling Brands",
                              selectedOutletDetails?.sellingBrands
                                ?.map((brand) => brand.name)
                                .join(", "),
                            ],
                            [
                              "Competitor Brands",
                              selectedOutletDetails?.competitorBrands?.length > 0
                                ? selectedOutletDetails.competitorBrands.join(", ")
                                : "N/A",
                            ],
                            [
                              "Google Map Link",
                              selectedOutletDetails?.googleMapLink || "N/A",
                            ],
                            [
                              "Created At",
                              selectedOutletDetails?.createdAt
                                ? new Date(
                                  selectedOutletDetails?.createdAt
                                ).toLocaleString()
                                : "",
                            ],
                            [
                              "Last Updated",
                              selectedOutletDetails?.updatedAt
                                ? new Date(
                                  selectedOutletDetails?.updatedAt
                                ).toLocaleString()
                                : "",
                            ],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="flex border-b border-gray-100 dark:border-gray-800 py-2"
                            >
                              <div className="w-40 font-semibold text-gray-700 dark:text-gray-300">
                                {label}:
                              </div>
                              <div className="flex-1 text-gray-900 dark:text-gray-100">
                                {value || <span className="text-gray-400">—</span>}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </Modal>










          {/* Add Outlet Modal */}
          <Modal
            show={openAddOutletModal}
            onClose={() => setOpenAddOutletModal(false)}
            size="5xl"
            popup
          >
            <Modal.Body className="p-0 bg-transparent">
              <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-gradient-to-r from-[#111827] to-[#1e293b] px-6 py-4">

                  <div>
                    <h2 className="text-3xl font-bold tracking-wide text-white">
                      Add New Outlet
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Create outlet with complete retailer information
                    </p>
                  </div>

                  <button
                    onClick={() => setOpenAddOutletModal(false)}
                    className="rounded-full p-2 text-slate-400 transition-all duration-200 hover:bg-slate-700 hover:text-white"
                  >
                    <FaTimesCircle size={22} />
                  </button>
                </div>

                {/* Body */}
                <div className="max-h-[72vh] overflow-y-auto bg-[#0f172a] px-6 py-5">

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* Outlet Code */}
                    <div>
                      <Label
                        value={
                          <>
                            Outlet Code <span className="text-red-500">*</span>
                          </>
                        }
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        required
                        name="outletCode"
                        placeholder="Enter outlet code"
                        value={singleOutletForm.outletCode}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* Outlet Name */}
                    <div>
                      <Label
                        value={
                          <>
                            Outlet Name <span className="text-red-500">*</span>
                          </>
                        }
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        required
                        name="outletName"
                        placeholder="Enter outlet name"
                        value={singleOutletForm.outletName}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* Sudo Name */}
                    <div>
                      <Label
                        value="Sudo Name"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        name="sudoName"
                        placeholder="Enter sudo name"
                        value={singleOutletForm.sudoName}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* Owner Name */}
                    <div>
                      <Label
                        value={
                          <>
                            Owner Name <span className="text-red-500">*</span>
                          </>
                        }
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        required
                        name="ownerName"
                        placeholder="Enter owner name"
                        value={singleOutletForm.ownerName}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* Beat Select */}
                    <div>
                      <Label
                        value={
                          <>
                            Select Beat <span className="text-red-500">*</span>
                          </>
                        }
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <SearchableSelect
                        options={beats}
                        value={singleOutletForm.beatCode}
                        onChange={(e) => {
                          const selectedBeat = beats.find(
                            (beat) => beat.code === e.target.value
                          );
                          console.log("selectedBeat:", selectedBeat);
                          console.log("subDivisionId:", selectedBeat?.subDivisionId);

                          setSingleOutletForm({
                            ...singleOutletForm,

                            beatCode: selectedBeat?.code || "",

                            subDivisionCode:
                              selectedBeat?.subDivisionId?.code || "",

                            stateCode:
                              selectedBeat?.regionId?.stateId?.slug || "",

                            city:
                              selectedBeat?.distributorId?.[0]?.city || "",

                            pin:
                              selectedBeat?.distributorId?.[0]?.pincode || "",

                            employeeCode:
                              selectedBeat?.employeeId?.[0]?.empId || "",

                            employeeName:
                              selectedBeat?.employeeId?.[0]?.name || "",

                            region:
                              selectedBeat?.regionId?.name || "",

                            distributor:
                              selectedBeat?.distributorId?.[0]?.name || "",

                            beatType:
                              selectedBeat?.beat_type || "",
                          });
                        }}
                        placeholder="Select Beat"
                        disabled={beatsLoading}
                        displayKey="name"
                        valueKey="code"
                        descKey="code"
                        id="beat-select"
                        className="w-full"
                      />
                    </div>

                    {/* Employee Code */}
                    {/* Employee Code */}
                    <div>
                      <Label
                        value={
                          <>
                            Employee Code <span className="text-red-500">*</span>
                          </>
                        }
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        required
                        name="employeeCode"
                        placeholder="Enter employee code"
                        value={singleOutletForm.employeeCode}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* Employee Name */}
                    <div>
                      <Label
                        value="Employee Name"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                     <TextInput
  value={
    employeeSearchLoading ? "Searching..." : singleOutletForm.employeeName
  }
  readOnly
  className={commonInputClass}
/>
                    </div>

                    {/* CSO */}
                    <div>
                      <Label
                        value="CSO"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        name="cso"
                        placeholder="Enter CSO"
                        value={singleOutletForm.cso}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>
                    {/* State Code */}
                    <div>
                      <Label
                        value="State Code"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        value={singleOutletForm.stateCode}
                        readOnly
                        className={commonInputClass}
                      />
                    </div>

                    {/* Region */}
                    {/* <div>
                      <Label
                        value="Region"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        value={singleOutletForm.region}
                        readOnly
                        className={commonInputClass}
                      />
                    </div> */}

                    {/* Beat Type */}
                    <div>
                      <Label
                        value="Beat Type"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        value={singleOutletForm.beatType}
                        readOnly
                        className={commonInputClass}
                      />
                    </div>

                    {/* Zone Code */}
                    <div>
                      <Label
                        value="Zone Code"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        value={singleOutletForm.subDivisionCode}
                        readOnly
                        className={commonInputClass}
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <Label
                        value="Mobile Number"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        name="mobile1"
                        placeholder="Mobile number"
                        value={singleOutletForm.mobile1}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* Alternate Number */}
                    <div>
                      <Label
                        value="Alternate Number"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        name="mobile2"
                        placeholder="Alternate number"
                        value={singleOutletForm.mobile2}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <Label
                        value="WhatsApp Number"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        name="whatsappNumber"
                        placeholder="WhatsApp number"
                        value={singleOutletForm.whatsappNumber}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label
                        value="Email"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        sizing="md"
                        shadow
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={singleOutletForm.email}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* City */}
                    <div>
                      <Label
                        value="City"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        name="city"
                        value={singleOutletForm.city}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* PIN */}
                    <div>
                      <Label
                        value="PIN Code"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <TextInput
                        name="pin"
                        value={singleOutletForm.pin}
                        onChange={handleSingleOutletChange}
                        className={commonInputClass}
                      />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <Label
                        value="Address"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300"
                      />

                      <textarea
                        rows={4}
                        name="address1"
                        placeholder="Enter complete address"
                        value={singleOutletForm.address1}
                        onChange={handleSingleOutletChange}
                        className="
                w-full
                rounded-xl
                border
                border-slate-600
                bg-slate-700
                px-4
                py-3
                text-sm
                font-medium
                text-white
                placeholder-slate-400
                shadow-sm
                transition-all
                duration-200
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/40
                focus:outline-none
              "
                      />
                    </div>
                    {/* GST Upload */}






                    <div className="md:col-span-2 mt-2">
                      <Label
                        value="Documents"
                        className="mb-4 block text-sm font-semibold text-slate-200"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* GST */}
                        <div className="rounded-xl border border-slate-600 bg-slate-800 p-4">
                          <p className="mb-3 text-sm font-medium text-white">
                            GST Certificate
                          </p>

                          <FileUpload
                            type="single-image"
                            page="modal-form"
                            onSetFileUrl={(url) =>
                              setSingleOutletForm((prev) => ({
                                ...prev,
                                gstImage: url,
                              }))
                            }
                          />

                          {singleOutletForm.gstImage && (
                            <div className="relative mt-3">
                              <img
                                src={singleOutletForm.gstImage}
                                alt="GST"
                                className="h-24 w-full rounded-lg object-cover border border-slate-600"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setSingleOutletForm((prev) => ({
                                    ...prev,
                                    gstImage: "",
                                  }))
                                }
                                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                              >
                                <FaTimesCircle size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* PAN */}
                        <div className="rounded-xl border border-slate-600 bg-slate-800 p-4">
                          <p className="mb-3 text-sm font-medium text-white">
                            PAN Card
                          </p>

                          <FileUpload
                            type="single-image"
                            page="modal-form"
                            onSetFileUrl={(url) =>
                              setSingleOutletForm((prev) => ({
                                ...prev,
                                panImage: url,
                              }))
                            }
                          />

                          {singleOutletForm.panImage && (
                            <div className="relative mt-3">
                              <img
                                src={singleOutletForm.panImage}
                                alt="PAN"
                                className="h-24 w-full rounded-lg object-cover border border-slate-600"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setSingleOutletForm((prev) => ({
                                    ...prev,
                                    panImage: "",
                                  }))
                                }
                                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                              >
                                <FaTimesCircle size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Aadhaar */}
                        <div className="rounded-xl border border-slate-600 bg-slate-800 p-4">
                          <p className="mb-3 text-sm font-medium text-white">
                            Aadhaar Card
                          </p>

                          <FileUpload
                            type="single-image"
                            page="modal-form"
                            onSetFileUrl={(url) =>
                              setSingleOutletForm((prev) => ({
                                ...prev,
                                aadhaarImage: url,
                              }))
                            }
                          />

                          {singleOutletForm.aadhaarImage && (
                            <div className="relative mt-3">
                              <img
                                src={singleOutletForm.aadhaarImage}
                                alt="Aadhaar"
                                className="h-24 w-full rounded-lg object-cover border border-slate-600"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setSingleOutletForm((prev) => ({
                                    ...prev,
                                    aadhaarImage: "",
                                  }))
                                }
                                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                              >
                                <FaTimesCircle size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Bank */}
                        <div className="rounded-xl border border-slate-600 bg-slate-800 p-4">
                          <p className="mb-3 text-sm font-medium text-white">
                            Bank Details
                          </p>

                          <FileUpload
                            type="single-image"
                            page="modal-form"
                            onSetFileUrl={(url) =>
                              setSingleOutletForm((prev) => ({
                                ...prev,
                                bankImage: url,
                              }))
                            }
                          />

                          {singleOutletForm.bankImage && (
                            <div className="relative mt-3">
                              <img
                                src={singleOutletForm.bankImage}
                                alt="Bank"
                                className="h-24 w-full rounded-lg object-cover border border-slate-600"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setSingleOutletForm((prev) => ({
                                    ...prev,
                                    bankImage: "",
                                  }))
                                }
                                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                              >
                                <FaTimesCircle size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>




                  </div>

                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-700 bg-[#111827] px-6 py-4">

                  <Button
                    color="gray"
                    onClick={() => setOpenAddOutletModal(false)}
                    className="border-0 bg-slate-700 text-sm hover:bg-slate-600"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleCreateSingleOutlet}
                    disabled={singleOutletLoading}
                    className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm hover:from-blue-500 hover:to-indigo-500"
                  >
                    {singleOutletLoading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Creating...
                      </div>
                    ) : (
                      "Create Outlet"
                    )}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
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

export default OutletRequestList;
