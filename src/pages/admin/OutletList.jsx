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
import { HiOutlineMenu } from "react-icons/hi";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { FiExternalLink } from "react-icons/fi";
import { IoSyncCircleSharp, IoWallet } from "react-icons/io5";
import { MdDownloadForOffline } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { FiEye } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  ApprovedOutletPaginated,
  outletApprovedUpdate,
  getOutletDistributors,
} from "../../api/api";
import {
  fetchOutletsCurrentPointBalance,
  getDuplicateOutlet,
  getOutletSynced,
  updateOutletStatus,
  bulkOutletModification,
  cleanCurrentBalance,
  rebuildBalance,
  syncOutletCodeUpdates,
  getCustomOutletSynced,
} from "../../api/outletApi";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBeats } from "../../redux/beatSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchStates } from "../../redux/stateSlice";
import moment from "moment";
import Datepicker from "react-tailwindcss-datepicker";
import { BiSolidFileExport } from "react-icons/bi";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import SearchableSelect from "../../components/SearchableSelect";
import AddManualPointsModal from "../../components/OutLetComp/AddManualPointsModal";
import { BulkRebuildRetailerTransaction } from "../../api/rbp/transaction";
import { IoClose } from "react-icons/io5";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { downloadFile } from "../../utils/downloadFile";

// Keep this in sync with the backend SORTABLE_FIELDS whitelist
// (controllers/outletApproved/paginatedOutletApproved.js). Only fields that
// live directly on the OutletApproved document can be sorted — populated
// fields (stateId.name, beatId.name, district.name, etc.) can't be, since
// population happens after the sort/query resolves.
const SORTABLE_COLUMNS = new Set([
  "outletName",
  "sudoName",
  "ownerName",
  "outletCode",
  // "outletUID",
  "mobile1",
  "mobile2",
  "email",
  "city",
  "pin",
  "location",
  "address1",
  "gstin",
  "panNumber",
  "aadharNumber",
  "status",
  "outletSource",
  "retailerClass",
  "categoryOfOutlet",
  "createdAt",
  "updatedAt",
  "beat",
]);

const OutletList = () => {
  // State
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedOutletDetails, setSelectedOutletDetails] = useState(null);
  const [editOutletData, setEditOutletData] = useState(null);
  const [outletsLoading, setOutletsLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [openDocumentModal, setOpenDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [newSourceId, setNewSourceId] = useState("");
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("default");
  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [selectedBeat, setSelectedBeat] = useState("default");
  const [statusFilter, setStatusFilter] = useState("active");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [updatedDateRange, setUpdatedDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [csvLoading, setCSVLoading] = useState(false);
  const [errorLog, setErrorLog] = useState([]);
  const [syncingOutlets, setSyncingOutlets] = useState(false);
  const [updatingSync, setUpdatingSync] = useState(false);
  const [fetchingPointBalance, setFetchingPointBalance] = useState(false);
  const [syncingRetailerBalances, setSyncingRetailerBalances] = useState(false);
  const [duplicateDataLoading, setDuplicateDataLoading] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedOutletSource, setSelectedOutletSource] = useState("default");
  const [beatSearch, setBeatSearch] = useState("");

  const [openAddPointsModal, setOpenAddPointsModal] = useState(false);
  const [selectedOutletForPoints, setSelectedOutletForPoints] = useState(null);
  const [openBulkModal, setOpenBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkCsvData, setBulkCsvData] = useState([]);
  const [openBulkConfirmModal, setOpenBulkConfirmModal] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResponseMessage, setBulkResponseMessage] = useState("");
  const [cleanCurrentBalanceLoading, setCleanCurrentBalanceLoading] =
    useState(false);
  const [rebuildingBalance, setRebuildingBalance] = useState(new Set());
  const [openCustomSyncModal, setOpenCustomSyncModal] = useState(false);
  const [customSyncDateRange, setCustomSyncDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [customSyncing, setCustomSyncing] = useState(false);
  const [selectedCustomSyncDistributor, setSelectedCustomSyncDistributor] = useState("");

  // Generic column sort state — replaces the old single-purpose
  // outletNameSort. `field` is any key in SORTABLE_COLUMNS, `order` is
  // "asc" | "desc". Both null means "no explicit sort" (backend defaults
  // to newest-first).
  const [sortConfig, setSortConfig] = useState({ field: null, order: null });

  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [openDistributorModal, setOpenDistributorModal] = useState(false);
  const [distributorData, setDistributorData] = useState([]);
  const [distributorLoading, setDistributorLoading] = useState(false);

  // Redux selectors
  const { states, loading: statesLoading } = useSelector(
    (state) => state.state,
  );
  const activeStates = states.filter((state) => state.status === true);

  const { distributors } = useSelector((state) => state.distributors);
  const { beats } = useSelector((state) => state.beat);

  const dispatch = useDispatch();

  // Pagination
  const onPageChange = (page) => setCurrentPage(page);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Fetch data on mount and when filters change
  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchDistributors());
    dispatch(fetchBeats());
  }, [dispatch]);

  // Fetch outlets when filters change
  useEffect(() => {
    fetchOutletsPaginated();
  }, [
    currentPage,
    selectedState,
    selectedDistributor,
    selectedBeat,
    statusFilter,
    dateRange,
    updatedDateRange,
    searchTerm,
    phoneSearch,
    selectedOutletSource,
    sortConfig,
  ]);
  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedState,
    selectedDistributor,
    selectedBeat,
    statusFilter,
    dateRange,
    searchTerm,
    phoneSearch,
    selectedOutletSource,
    sortConfig,
  ]);
  // Debounced fetch
  const fetchOutletsPaginated = useDebounce(async () => {
    try {
      setOutletsLoading(true);
      const query = {
        page: currentPage,
        limit: 50,
        ...(statusFilter !== "All" && {
          statusFilter: statusFilter,
        }),

        ...(selectedState !== "default" && { stateId: selectedState }),
        ...(selectedDistributor !== "default" && {
          distributorId: selectedDistributor,
        }),
        ...(selectedBeat !== "default" && { beatId: selectedBeat }),
        ...(selectedOutletSource !== "default" && {
          outletSource: selectedOutletSource,
        }),
        ...(searchTerm && { search: searchTerm }),

        // Created Date filter
        ...(dateRange.startDate &&
          dateRange.endDate && {
          fromDate: dateRange.startDate,
          toDate: dateRange.endDate,
        }),

        // Updated Date filter (SEPARATE)
        ...(updatedDateRange.startDate &&
          updatedDateRange.endDate && {
          updatedFromDate: updatedDateRange.startDate,
          updatedToDate: updatedDateRange.endDate,
        }),

        ...(phoneSearch && { phoneSearch }),

        // Generic column sort — mirrors backend SORTABLE_FIELDS whitelist
        ...(sortConfig.field && {
          sortBy: sortConfig.field,
          sortOrder: sortConfig.order,
        }),
      };

      const response = await ApprovedOutletPaginated(query);

      setOutlets(response?.data?.data || []);
      setTotalPages(response?.data?.pagination?.totalPages || 0);
      setFilteredCount(response?.data?.pagination?.filteredCount || 0);
      setTotalItems(response?.data?.pagination?.totalCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Outlets",
      );
    } finally {
      setOutletsLoading(false);
    }
  }, 700);

  // Handlers
  const handleResetFilter = () => {
    setStatusFilter("active");
    setSelectedState("default");
    setSelectedDistributor("default");
    setSelectedBeat("default");
    setSelectedOutletDetails(null);
    setDateRange({ startDate: null, endDate: null });
    setSearchTerm("");
    setPhoneSearch("");
    fetchOutletsPaginated();
    setSelectedOutletSource("default");
    setUpdatedDateRange({ startDate: null, endDate: null });
    setSortConfig({ field: null, order: null });
  };

  // Generic sort toggle for any whitelisted column: asc -> desc -> none.
  // Clicking a different column starts that column fresh at "asc".
  const handleSortToggle = (field) => {
    if (!SORTABLE_COLUMNS.has(field)) return;

    setSortConfig((prev) => {
      if (prev.field !== field) return { field, order: "asc" };
      if (prev.order === "asc") return { field, order: "desc" };
      return { field: null, order: null };
    });
  };

  // Renders the appropriate sort icon for a given column header based on
  // current sortConfig — neutral icon when this column isn't the active
  // sort, up/down triangle when it is.
  const renderSortIcon = (field) => {
    if (sortConfig.field !== field) {
      return <FaSort className="inline ml-1 opacity-40" size={14} />;
    }
    return sortConfig.order === "asc" ? (
      <FaSortUp className="inline ml-1" size={14} />
    ) : (
      <FaSortDown className="inline ml-1" size={14} />
    );
  };

  // Small helper for sortable <Table.HeadCell> content so every column
  // wires into the same handler/icon instead of one-off implementations.
  const SortableHeader = ({ field, children }) => (
    <span
      className="inline-flex items-center cursor-pointer select-none"
      onClick={() => handleSortToggle(field)}
    >
      {children}
      {renderSortIcon(field)}
    </span>
  );

  const handleOutletDetails = (outlet) => {
    setSelectedOutletDetails(outlet);
    setOpenModal(true);
  };

  const handleEditOutlet = (outlet) => {
    setEditOutletData({
      outletName: outlet?.outletName || "",
      sudoName: outlet?.sudoName || "",
      ownerName: outlet?.ownerName || "",
      mobile1: outlet?.mobile1 || "",
      mobile2: outlet?.mobile2 || "",
      whatsappNumber: outlet?.whatsappNumber || "",
      address1: outlet?.address1 || "",
      address2: outlet?.address2 || "",
      city: outlet?.city || "",
      pin: outlet?.pin || "",
      location: outlet.location || "",
      categoryOfOutlet: outlet?.categoryOfOutlet || "",
      contactPerson: outlet?.contactPerson || "",
      email: outlet?.email || "",
      gstin: outlet?.gstin || "",
      aadharNumber: outlet?.aadharNumber || "",
      panNumber: outlet?.panNumber || "",
      retailerClass: outlet?.retailerClass || "",
      empId: outlet?.employeeId?.empId || "",
      enrolledStatus: outlet?.enrolledStatus || "",
      shipToAddress: outlet?.shipToAddress || "",
      shipToPincode: outlet?.shipToPincode || "",
      competitorBrands: outlet?.competitorBrands || [],
      preferredLanguage: outlet?.preferredLanguage || "",
      teleCallDay: outlet?.teleCallDay || "",
      marketCenter: outlet?.marketCenter || "",
      gpsLocation: outlet?.gpsLocation || "",
      beatId: Array.isArray(outlet?.beatId)
        ? outlet.beatId.map((b) => b._id)
        : outlet?.beatId?._id
          ? [outlet.beatId._id]
          : [],
      massistRefIds: Array.isArray(outlet?.massistRefIds)
        ? outlet.massistRefIds
        : [],
      googleMapLink: outlet?.googleMapLink || "",
    });
    setSelectedOutletDetails(outlet);
    setOpenEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Source IDs sent to backend:", editOutletData.massistRefIds);
    if (!editOutletData || !selectedOutletDetails?._id) return;
    console.log(editOutletData, "editOutletData");
    try {
      setEditLoading(true);
      await outletApprovedUpdate(editOutletData, selectedOutletDetails._id);
      toast.success("Outlet updated successfully");
      setOpenEditModal(false);
      setEditOutletData(null);
      setSelectedOutletDetails(null);
      fetchOutletsPaginated();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update outlet",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const onCloseEditModal = () => {
    setOpenEditModal(false);
    setEditOutletData(null);
    setSelectedOutletDetails(null);
  };

  const onCloseModal = () => {
    fetchOutletsPaginated();
    setOpenModal(false);
    setSelectedOutletDetails(null);
  };

  const handleErrorLogDownload = async () => {
    if (!errorLog.length) return;

    const allKeys = Array.from(
      errorLog.reduce((keys, obj) => {
        Object.keys(obj).forEach((key) => keys.add(key));
        return keys;
      }, new Set()),
    );

    const csv = [allKeys.join(",")];

    errorLog.forEach((entry) => {
      const row = allKeys
        .map((key) => {
          let value = entry[key] ?? "";
          value = String(value).replace(/"/g, '""');
          if (/[",\n]/.test(value)) value = `"${value}"`;
          return value;
        })
        .join(",");
      csv.push(row);
    });

    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "Bulk_Outlet_Modification_Errors.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setErrorLog([]);
  };

  const handleSyncOutlets = async () => {
    openConfirmationModel({
      question: "Are you sure you want to sync outlets?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setSyncingOutlets(true);
            const res = await getOutletSynced();
            toast.success(
              `${res?.data?.metadata?.totalInserted} outlet synced successfully! & ${res?.data?.metadata?.totalSkipped} outlets skipped.`,
              { duration: 10000 },
            );

            if (res?.data?.data?.skippedRows.length > 0) {
              setErrorLog(res?.data?.data?.skippedRows);
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to sync outlets",
            );
          } finally {
            setSyncingOutlets(false);
            handleUpdateSync();
            fetchOutletsPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  const handleCustomSync = async () => {
    if (!customSyncDateRange.startDate || !customSyncDateRange.endDate) {
      toast.error("Please select a date range");
      return;
    }
    if (!selectedCustomSyncDistributor) {
      toast.error("Please select a distributor");
      return;
    }
    try {
      setCustomSyncing(true);
      const queryParams = {
        startDate: customSyncDateRange.startDate,
        endDate: customSyncDateRange.endDate,
      };

      // Add distributor DBCode if selected
      if (selectedCustomSyncDistributor) {
        const selectedDist = distributors.find(d => d._id === selectedCustomSyncDistributor);
        if (selectedDist?.dbCode) {
          queryParams.ClientCode = selectedDist.dbCode;
        }
      }

      const res = await getCustomOutletSynced(queryParams);
      toast.success(
        `${res?.data?.metadata?.totalInserted || 0} outlet synced successfully! & ${res?.data?.metadata?.totalSkipped || 0} outlets skipped.`,
        { duration: 10000 },
      );
      if (res?.data?.data?.skippedRows?.length > 0) {
        setErrorLog(res?.data?.data?.skippedRows);
      }
      setOpenCustomSyncModal(false);
      setCustomSyncDateRange({ startDate: null, endDate: null });
      fetchOutletsPaginated();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to custom sync outlets",
      );
    } finally {
      setCustomSyncing(false);
    }
  };

  const handleUpdateSync = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update sync outlet codes?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setUpdatingSync(true);
            const res = await syncOutletCodeUpdates();
            toast.success(
              `${res?.data?.metadata?.updated || res?.data?.data?.updated || 0} outlet codes updated successfully!`,
              { duration: 10000 },
            );
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update sync outlet codes",
            );
          } finally {
            setUpdatingSync(false);
            fetchOutletsPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  const fetchPointBalance = async () => {
    openConfirmationModel({
      question: "Are you sure you want to fetch Current Balances?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFetchingPointBalance(true);
            const res = await fetchOutletsCurrentPointBalance();
            console.log(res);

            toast.success(
              `${res?.data?.data?.totalUpdated} Outlets Balance Updated Successfully! & ${res?.data?.data?.totalProcessed} Outlets Processed.`,
              { duration: 6000 },
            );
          } catch (error) {
            console.error(error);
            toast.error(
              error.message ||
              error?.response?.data?.message ||
              "Failed to fetch outlet balance",
            );
          } finally {
            setFetchingPointBalance(false);
            fetchOutletsPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  const handleExportToCSV = async () => {
    setCSVLoading(true);
    const query = {
      page: currentPage,
      limit: 50,
      ...(statusFilter !== "All" && {
        statusFilter: statusFilter === "active",
      }),
      ...(selectedState !== "default" && { stateId: selectedState }),
      ...(selectedDistributor !== "default" && {
        distributorId: selectedDistributor,
      }),
      ...(selectedBeat !== "default" && { beatId: selectedBeat }),
      ...(searchTerm && { search: searchTerm }),
      ...(dateRange.startDate &&
        dateRange.endDate && {
        fromDate: dateRange.startDate,
        toDate: dateRange.endDate,
      }),
      // NOTE: hits the separate outlet-report endpoint — only include
      // sort params if that endpoint has been updated to honor them too.
      ...(sortConfig.field && {
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
      }),
    };

    const params = new URLSearchParams(query).toString();
    const url = `${BACKEND_URL}/api/v1/outletApproved/outlet-report?${params}`;

    //window.open(url, "_blank");
    downloadFile({
      url,
      //queryParams: query,
      fileName: "OutletReport",
      showToast: false,
    });

    setCSVLoading(false);
  };

  const handleDuplicateData = async () => {
    try {
      setDuplicateDataLoading(true);
      const response = await getDuplicateOutlet();
      console.log("Duplicate Outlet Response:", response?.data?.data);

      const duplicateGroups = response?.data?.data;

      if (
        duplicateGroups &&
        Array.isArray(duplicateGroups) &&
        duplicateGroups.length > 0
      ) {
        // Calculate total duplicates
        const totalDuplicates = duplicateGroups.reduce(
          (sum, group) => sum + group.count,
          0,
        );

        // Store data in localStorage for the new tab
        localStorage.setItem(
          "duplicateOutletData",
          JSON.stringify(duplicateGroups),
        );

        // Open new tab with the report
        const rolePrefix = window.location.pathname.split("/")[1];

        const newTab = window.open(
          `/${rolePrefix}/duplicate-outlet-report`,
          "_blank",
        );

        if (!newTab) {
          toast.error("Please allow popups for this site to view the report.");
          return;
        }

        toast.success(
          `Found ${duplicateGroups.length} duplicate groups with ${totalDuplicates} total duplicates!`,
        );
      } else {
        toast.info("No duplicate data found.");
      }
    } catch (error) {
      console.error("Error fetching duplicate data:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch duplicate data",
      );
    } finally {
      setDuplicateDataLoading(false);
    }
  };

  const handleAddPoints = (outlet) => {
    setSelectedOutletForPoints(outlet);
    setOpenAddPointsModal(true);
  };

  const handleCloseAddPointsModal = () => {
    setOpenAddPointsModal(false);
    setSelectedOutletForPoints(null);
  };
  const handleAddPointsSuccess = () => {
    fetchOutletsPaginated();
  };

  const handleRebuildBalance = async (outletId) => {
    setRebuildingBalance((prev) => new Set(prev).add(outletId));
    try {
      const response = await rebuildBalance(outletId);

      // Show appropriate message based on transaction count
      if (response.data.totalTransactions === 0) {
        toast.success("Balance reset to 0 (no transactions found)");
      } else {
        toast.success(`Balance reset: ${response.data.finalBalance} points`);
      }

      fetchOutletsPaginated();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to rebuild balance",
      );
    } finally {
      setRebuildingBalance((prev) => {
        const newSet = new Set(prev);
        newSet.delete(outletId);
        return newSet;
      });
    }
  };

  const handleStatusToggle = (outlet) => {
    const newStatus = !outlet.status;

    openConfirmationModel({
      question: `Are you sure you want to ${newStatus ? "activate" : "deactivate"
        } this outlet?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (!result) return;

        const res = await updateOutletStatus(outlet._id, newStatus);

        if (res?.success) {
          toast.success(res.message);
          fetchOutletsPaginated();
        } else {
          toast.error(res.message);
        }
      },
    });
  };

  const downloadBulkTemplate = () => {
    const headers = [

      "Outlet Code",
      "Source ID",
      "Outlet Name",
      "Owner Name",
      "Employee Code",
      "Beat Code",
      "State",
      "Mobile Number",
      "Alternate Number",
      "WhatsApp Number",
      "Email",
      "Zone",
      "Region",
      "Address",
      "Pincode",
      "Shipping Address",
      "City",
      "Aadhar Number",
      "PAN Number",
      "GSTIN",
      "Retailer Class",
      "Brand Code",
    ];

    const requirements = [

      "REQUIRED",
      '"(OPTIONAL) :[Example: 5985455, 588744]"',
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      '"(OPTIONAL) :[Example: BEAT-001,BEAT-002]"',
      '"(OPTIONAL) :[Example: WB]"',
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
      "(OPTIONAL)",
    ];

    const csvContent = [headers.join(","), requirements.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Bulk_Outlet_Modification_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const parseCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("CSV Parse Errors:", results.errors);
            reject("CSV format error. Check commas and quotes.");
            return;
          }

          const rows = results.data;

          if (!rows || rows.length === 0) {
            reject("CSV file is empty or invalid");
            return;
          }

          const parsedData = rows.map((row, index) => ({
            rowNumber: index + 2,
            ...row,
          }));

          resolve(parsedData);
        },
      });
    });
  };

  const handleBulkUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const parsed = await parseCSVFile(file);
        setBulkFile(file);
        setBulkCsvData(parsed);
        setBulkResponseMessage("");
        setOpenBulkConfirmModal(true);
      } catch (err) {
        // no toast
        console.error(err);
      }
    };

    input.click();
  };

  const handleBulkConfirmSubmit = async () => {
    try {
      setBulkUploading(true);

      const res = await bulkOutletModification(bulkCsvData); // 👈 BODY sent internally

      if (res?.message) {
        toast(res.message);
      }

      if (res?.failedRows && res.failedRows.length > 0) {
        setErrorLog(res.failedRows);
      }

      if (res?.success) {
        setOpenBulkConfirmModal(false);
        setBulkCsvData([]);
        setBulkFile(null);
        fetchOutletsPaginated();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Bulk upload failed");
    } finally {
      setBulkUploading(false);
    }
  };

  const downloadErrorCSV = (failedRows, originalRows) => {
    if (!failedRows.length) return;

    // Map failed rows by rowNumber for quick lookup
    const errorMap = new Map(failedRows.map((r) => [r.rowNumber, r.reason]));

    // Build CSV rows
    const csvRows = originalRows
      .filter((row) => errorMap.has(row.rowNumber))
      .map((row) => ({
        ...row,
        Reason: errorMap.get(row.rowNumber),
      }));

    const headers = Object.keys(csvRows[0]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) =>
        headers
          .map((h) => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Bulk_Outlet_Modification_Errors.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cleanCurrentBalanceHnandler = async () => {
    openConfirmationModel({
      question: "Are you sure you want to clean current balance?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setCleanCurrentBalanceLoading(true);
            const res = await cleanCurrentBalance();
            toast.success(
              `${res?.data?.message || "Cleaning current balance"}`,
              { duration: 10000 },
            );
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to clean current balance",
            );
          } finally {
            setCleanCurrentBalanceLoading(false);
            fetchOutletsPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  const SyncingAllRetailerBalances = async () => {
    openConfirmationModel({
      question: "Are you sure you want to sync all retailer balances?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setSyncingRetailerBalances(true);
            const res = await BulkRebuildRetailerTransaction();
            toast.success(
              `${res?.data?.message || "Syncing all retailer balances"}`,
              { duration: 10000 },
            );
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Syncing all retailer balances failed",
            );
          } finally {
            setSyncingRetailerBalances(false);
            fetchOutletsPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  const handleRemoveSourceId = (idToRemove) => {
    openConfirmationModel({
      question: `Are you sure you want to remove Source ID "${idToRemove}"?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (!result) return;

        try {
          const updatedSourceIds = editOutletData.massistRefIds.filter(
            (id) => id !== idToRemove,
          );

          // Call backend immediately
          await outletApprovedUpdate(
            {
              ...editOutletData,
              massistRefIds: updatedSourceIds,
            },
            selectedOutletDetails._id,
          );

          // Only update UI if backend allows
          setEditOutletData((prev) => ({
            ...prev,
            massistRefIds: updatedSourceIds,
          }));

          toast.success("Source ID removed successfully");
        } catch (error) {
          toast.error(
            error?.response?.data?.message ||
            "This Main Source ID Can't Be Removed.",
          );
        }
      },
    });
  };

  const handleViewDistributors = async (outletId) => {
    try {
      setDistributorLoading(true);
      const res = await getOutletDistributors(outletId);

      setDistributorData(res?.data?.distributors || []);
      setOpenDistributorModal(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch distributors",
      );
    } finally {
      setDistributorLoading(false);
    }
  };
  // UI
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Outlet Master List </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 w-full p-4">
        <Card className="w-full flex flex-col items-center">
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Count: {totalItems}</Badge>
            <Badge color="warning">Filtered Count: {filteredCount}</Badge>
          </div>
          <div className="flex flex-wrap justify-center w-full items-center gap-4">
            {/* Status Filter */}
            <div className="w-56">
              <Label
                htmlFor="statusSelect"
                value="Select Status"
                className="mb-2 block"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                id="statusSelect"
                required
              >
                <option value="All">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            {/* State Filter */}
            <div className="w-56">
              <Label
                htmlFor="stateSelect"
                value="Select State"
                className="mb-2 block"
              />
              <Select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                id="stateSelect"
                required
              >
                <option value="default">All</option>
                {activeStates.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))}
              </Select>
            </div>
            {/* Distributor Filter */}
            {selectedState !== "default" && (
              <div className="w-56">
                <Label
                  htmlFor="distributorSelect"
                  value="Select Distributor"
                  className="mb-2 block"
                />
                <Select
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  id="distributorSelect"
                  required
                >
                  <option value="default">All</option>
                  {distributors
                    .filter((d) => d?.stateId?._id === selectedState)
                    .map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.dbCode})
                      </option>
                    ))}
                </Select>
              </div>
            )}

            <div className="w-64">
              <div className="mb-2 block">
                <Label
                  htmlFor="dateRangeSelect"
                  value="Select Created Date Range"
                />
              </div>
              <Datepicker
                showShortcuts={true}
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>
            <div className="w-64">
              <Label value="Select Updated Date Range" />
              <Datepicker
                showShortcuts
                value={updatedDateRange}
                onChange={setUpdatedDateRange}
              />
            </div>

            {/* Search */}
            <div className="w-56">
              <Label
                htmlFor="search"
                value="Search Outlet"
                className="mb-2 block"
              />
              <TextInput
                type="text"
                className="px-3 rounded-sm w-full"
                placeholder="Search Outlet"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-56">
              <Label
                htmlFor="outletSourceSelect"
                value="Outlet Source"
                className="mb-2 block"
              />
              <Select
                id="outletSourceSelect"
                value={selectedOutletSource}
                onChange={(e) => setSelectedOutletSource(e.target.value)}
              >
                <option value="default">All</option>
                <option value="Admin">Admin</option>
                <option value="SFA">SFA</option>
              </Select>
            </div>

            <div className="w-56">
              <Label
                htmlFor="phoneSearch"
                value="Search Phone"
                className="mb-2 block"
              />
              <TextInput
                type="text"
                className="px-3 rounded-sm w-full"
                placeholder="Search by Phone Number"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-wrap justify-center w-full items-center gap-2">
            <Button
              className="text-xs"
              size="sm"
              color="success"
              onClick={handleResetFilter}
            >
              <RiRefreshFill size={20} />
              Reset & Refresh
            </Button>

            {errorLog.length > 0 && (
              <Button
                className="text-xs"
                color="red"
                onClick={handleErrorLogDownload}
              >
                <span className="flex items-center gap-2">
                  <MdDownloadForOffline size={20} />
                  Error Log
                  <Badge color="gray">{errorLog.length}</Badge>
                </span>
              </Button>
            )}

            <Button
              className="text-xs"
              size="sm"
              color="blue"
              onClick={() => {
                handleExportToCSV();
              }}
              disabled={csvLoading}
            >
              <span className="flex justify-center items-center gap-2">
                <BiSolidFileExport size={20} />
                {csvLoading ? "Downloading..." : "CSV Download"}
              </span>
            </Button>

            <Button
              className="text-xs"
              size="sm"
              color="purple"
              onClick={handleDuplicateData}
              disabled={duplicateDataLoading}
            >
              <span className="flex justify-center items-center gap-2">
                {duplicateDataLoading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : null}
                {duplicateDataLoading ? "Fetching..." : "Duplicate Data"}
              </span>
            </Button>
            <Button onClick={() => setOpenBulkModal(true)}>
              <span>
                <strong>Bulk Modification</strong>
              </span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex justify-end flex-wrap items-center w-full px-4">
        {!outletsLoading && filteredCount > 10 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showIcons
          />
        )}
      </div>

      {/* Table */}
      <div className="flex flex-col gap-4 w-full p-4">
        <div className="overflow-x-auto w-full">
          <Table striped>
            <Table.Head className="text-center">
              {/* <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="outletUID">Outlet UID</SortableHeader>
              </Table.HeadCell> */}
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="outletCode">Outlet Code</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                View
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="outletName">Outlet Name</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Distributor
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="ownerName">Owner Name</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="mobile1">Phone Number</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="gstin">GST IN</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="panNumber">PAN no</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="status">Outlet Status</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                State
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="beat">Beat</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Sub Division
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="city">City</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="location">Location</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="outletSource">
                  Outlet Source
                </SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="createdAt">Created At</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                <SortableHeader field="updatedAt">Updated At</SortableHeader>
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Action
              </Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {outletsLoading || statesLoading ? (
                <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell
                    colSpan={"100%"}
                    className="font-medium text-gray-900 dark:text-gray-200"
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
                  {outlets?.map((outlet, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      {/* <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.outletUID && (
                          <UniqueCode
                            text={outlet?.outletUID}
                            codeName="Outlet UID"
                          />
                        )}
                      </Table.Cell> */}
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.outletCode && (
                          <div className="flex gap-2 justify-center items-center">
                            <button className="flex items-center gap-2">
                              <UniqueCode
                                text={outlet?.outletCode}
                                codeName="Outlet Code"
                              />
                              <span
                                className="cursor-pointer"
                                onClick={() => handleOutletDetails(outlet)}
                              >
                                <FiExternalLink color="#3795BD" />
                              </span>
                            </button>
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <Button
                          size="xs"
                          color="blue"
                          pill
                          onClick={() => handleOutletDetails(outlet)}
                        >
                          <FiEye size={14} />
                        </Button>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 cursor-pointer">
                        <div className="flex gap-2 justify-center items-center">
                          <span>
                            {outlet?.outletName}
                            {outlet?.sudoName ? ` (${outlet.sudoName})` : ""}
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
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => handleViewDistributors(outlet._id)}
                          title="View Distributors"
                        >
                          <HiOutlineMenu size={16} />
                        </Button>
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.ownerName}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.mobile1}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.gstin}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.panNumber}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(outlet)}
                          className="cursor-pointer"
                        >
                          <StatusIndicator status={outlet?.status} />
                        </button>
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.stateId?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {Array.isArray(outlet?.beatId) ? (
                          outlet.beatId.map((beat, index) => (
                            <div key={index} className="mb-1">
                              {beat.name} - <UniqueCode text={beat.code} />
                            </div>
                          ))
                        ) : (
                          <>
                            {outlet?.beatId?.name} -{" "}
                            <UniqueCode text={outlet?.beatId?.code} />
                          </>
                        )}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {Array.isArray(outlet?.beatId)
                          ? outlet.beatId[0]?.subDivisionId?.name
                          : outlet?.beatId?.subDivisionId?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.city}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.location}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.outletSource}
                      </Table.Cell>
                      <Table.Cell className="px-y px-2">
                        {moment(outlet?.createdAt)
                          ?.tz("Asia/Kolkata")
                          ?.format("DD-MM-YYYY hh:mm:ss A")}
                      </Table.Cell>
                      <Table.Cell className="px-y px-2">
                        {moment(outlet?.updatedAt)
                          ?.tz("Asia/Kolkata")
                          ?.format("DD-MM-YYYY hh:mm:ss A")}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex gap-2 justify-center items-center">
                          <EditButton
                            onClick={() => handleEditOutlet(outlet)}
                          />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {outlets?.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan={"100%"}
                        className="font-medium text-gray-900 dark:text-gray-200"
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

      {/* Outlet Details Modal */}
      <Modal show={openModal} onClose={onCloseModal} size="6xl">
        <Modal.Header>Outlet Details</Modal.Header>

        <Modal.Body>
          <div className="overflow-x-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  ["Outlet Code", selectedOutletDetails?.outletCode],
                  // ["Outlet UID", selectedOutletDetails?.outletUID],
                  ["Outlet Name", selectedOutletDetails?.outletName],
                  ["Sudo Name", selectedOutletDetails?.sudoName],
                  ["Owner Name", selectedOutletDetails?.ownerName],

                  ["Mobile 1", selectedOutletDetails?.mobile1],
                  ["Mobile 2", selectedOutletDetails?.mobile2],

                  ["WhatsApp", selectedOutletDetails?.whatsappNumber],
                  ["Email", selectedOutletDetails?.email],

                  [
                    "GST IN",
                    <div className="flex items-center gap-2">
                      <span>{selectedOutletDetails?.gstin || "—"}</span>

                      {selectedOutletDetails?.gstImage && (
                        <Button
                          size="xs"
                          color="blue"
                          pill
                          onClick={() => {
                            setDocumentTitle("GST Certificate");
                            setSelectedDocument(
                              selectedOutletDetails.gstImage
                            );
                            setOpenDocumentModal(true);
                          }}
                        >
                          <FiEye size={14} />
                        </Button>
                      )}
                    </div>,
                  ],

                  [
                    "PAN No",
                    <div className="flex items-center gap-2">
                      <span>{selectedOutletDetails?.panNumber || "—"}</span>

                      {selectedOutletDetails?.panImage && (
                        <Button
                          size="xs"
                          color="blue"
                          pill
                          onClick={() => {
                            setDocumentTitle("PAN Card");
                            setSelectedDocument(
                              selectedOutletDetails.panImage
                            );
                            setOpenDocumentModal(true);
                          }}
                        >
                          <FiEye size={14} />
                        </Button>
                      )}
                    </div>,
                  ],

                  [
                    "Aadhaar No",
                    <div className="flex items-center gap-2">
                      <span>{selectedOutletDetails?.aadharNumber || "—"}</span>

                      {selectedOutletDetails?.aadharImage && (
                        <Button
                          size="xs"
                          color="blue"
                          pill
                          onClick={() => {
                            setDocumentTitle("Aadhaar Card");
                            setSelectedDocument(
                              selectedOutletDetails.aadharImage
                            );
                            setOpenDocumentModal(true);
                          }}
                        >
                          <FiEye size={14} />
                        </Button>
                      )}
                    </div>,
                  ],

                  [
                    "Bank Document",
                    selectedOutletDetails?.bankImage ? (
                      <Button
                        size="xs"
                        color="blue"
                        pill
                        onClick={() => {
                          setDocumentTitle("Bank Document");
                          setSelectedDocument(
                            selectedOutletDetails.bankImage
                          );
                          setOpenDocumentModal(true);
                        }}
                      >
                        <FiEye size={14} />
                      </Button>
                    ) : (
                      "—"
                    ),
                  ],

                  [
                    "Category Of Outlet",
                    selectedOutletDetails?.categoryOfOutlet,
                  ],

                  ["Address", selectedOutletDetails?.address1],

                  ["Pincode", selectedOutletDetails?.pin],

                  ["City", selectedOutletDetails?.city],

                  ["Location", selectedOutletDetails?.location],

                  ["State", selectedOutletDetails?.stateId?.name],

                  ["District", selectedOutletDetails?.district?.name],

                  [
                    "Beat",
                    Array.isArray(selectedOutletDetails?.beatId)
                      ? selectedOutletDetails.beatId
                        .map((beat) => beat.name)
                        .join(", ")
                      : selectedOutletDetails?.beatId?.name,
                  ],

                  [
                    "Employee Name",
                    selectedOutletDetails?.employeeId?.name,
                  ],

                  [
                    "Existing Retailer",
                    selectedOutletDetails?.existingRetailer
                      ? "Yes"
                      : "No",
                  ],

                  [
                    "Outlet Status",
                    selectedOutletDetails?.status
                      ? "Active"
                      : "Inactive",
                  ],

                  [
                    "Outlet Source",
                    selectedOutletDetails?.outletSource,
                  ],

                  [
                    "Tele Calling Slots",
                    selectedOutletDetails?.teleCallingSlot?.join(
                      ", "
                    ),
                  ],

                  [
                    "Selling Brands",
                    selectedOutletDetails?.sellingBrands?.length
                      ? selectedOutletDetails.sellingBrands
                        .map((brand) => brand.name)
                        .join(", ")
                      : "—",
                  ],

                  [
                    "Competitor Brands",
                    selectedOutletDetails?.competitorBrands?.length
                      ? selectedOutletDetails.competitorBrands.join(
                        ", "
                      )
                      : "N/A",
                  ],

                  [
                    "Created At",
                    selectedOutletDetails?.createdAt
                      ? new Date(
                        selectedOutletDetails.createdAt
                      ).toLocaleString()
                      : "—",
                  ],

                  [
                    "Updated At",
                    selectedOutletDetails?.updatedAt
                      ? new Date(
                        selectedOutletDetails.updatedAt
                      ).toLocaleString()
                      : "—",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex border-b border-gray-200 dark:border-gray-700 py-3"
                  >
                    <div className="w-44 font-semibold text-gray-700 dark:text-gray-300">
                      {label}
                    </div>

                    <div className="flex-1 text-gray-900 dark:text-gray-100">
                      {value || (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        show={openDocumentModal}
        onClose={() => setOpenDocumentModal(false)}
        size="lg"
      >
        <Modal.Header>{documentTitle}</Modal.Header>

        <Modal.Body>
          <div className="flex justify-center items-center">
            {selectedDocument ? (
              <img
                src={selectedDocument}
                alt={documentTitle}
                className="max-h-[75vh] w-auto rounded-lg border shadow-md"
              />
            ) : (
              <p>No document available</p>
            )}
          </div>
        </Modal.Body>
      </Modal>
      {/* Add Manual Points Modal */}
      <AddManualPointsModal
        show={openAddPointsModal}
        onClose={handleCloseAddPointsModal}
        outlet={selectedOutletForPoints}
        onSuccess={handleAddPointsSuccess}
      />
      {/* Bulk Modification Modal */}

      <Modal
        show={openBulkModal}
        onClose={() => setOpenBulkModal(false)}
        size="4xl" // ✅ BIG MODAL
      >
        <Modal.Header>Bulk Modification</Modal.Header>

        <Modal.Body>
          <div className="flex justify-center gap-6 py-10">
            <Button
              color="blue"
              size="sm"
              className="px-6 py-2 text-sm font-medium rounded-lg shadow hover:shadow-md transition-all"
              onClick={() => {
                downloadBulkTemplate();
                setOpenBulkModal(false);
              }}
            >
              Download Template
            </Button>

            <Button
              color="green"
              size="sm"
              className="px-6 py-2 text-sm font-medium rounded-lg shadow hover:shadow-md transition-all"
              onClick={() => {
                setOpenBulkModal(false);
                handleBulkUploadClick();
              }}
            >
              Upload File
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Bulk Upload Confirmation Modal */}
      <Modal
        show={openBulkConfirmModal}
        onClose={() => setOpenBulkConfirmModal(false)}
        size="lg"
      >
        <Modal.Header>Confirm Bulk Upload</Modal.Header>

        <Modal.Body>
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              📄
            </div>

            <p className="text-sm text-gray-600 text-center">
              CSV file selected successfully.
              <br />
              Click <strong>Confirm Upload</strong> to proceed.
            </p>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button color="gray" onClick={() => setOpenBulkConfirmModal(false)}>
            Cancel
          </Button>

          <Button
            color="green"
            disabled={bulkUploading}
            onClick={handleBulkConfirmSubmit}
          >
            {bulkUploading ? "Uploading..." : "Confirm Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom Sync Modal */}
      <Modal
        show={openCustomSyncModal}
        onClose={() => setOpenCustomSyncModal(false)}
        size="4xl"
      >
        <Modal.Header>Custom Sync Outlets</Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label value="Select Distributor (Optional)" />
                <SearchableSelect
                  id="custom-sync-distributor"
                  className="w-full"
                  options={distributors}
                  value={selectedCustomSyncDistributor}
                  onChange={(e) => setSelectedCustomSyncDistributor(e.target.value)}
                  placeholder="Select Distributor"
                  displayKey="name"
                  descKey="dbCode"
                  valueKey="_id"
                />
              </div>
              <div>
                <Label value="Select Date Range" />
                <Datepicker
                  inputClassName="relative py-1.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500"
                  showShortcuts={true}
                  value={customSyncDateRange}
                  onChange={(date) => setCustomSyncDateRange(date)}
                  placeholder="Select date range"
                  orientation="bottom"  // 👈 added here
                />
              </div>

            </div>
            <p className="text-sm text-gray-500">
              Select a date range and distributor to sync outlets from that specific period.
            </p>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            color="blue"
            onClick={handleCustomSync}
            disabled={
              customSyncing ||
              !customSyncDateRange.startDate ||
              !customSyncDateRange.endDate ||
              !selectedCustomSyncDistributor
            }
          >
            {customSyncing ? "Syncing..." : "Sync Outlets"}
          </Button>

          <Button
            color="gray"
            onClick={() => {
              setOpenCustomSyncModal(false);
              setSelectedCustomSyncDistributor("");
              setCustomSyncDateRange({ startDate: null, endDate: null });
            }}
            disabled={customSyncing}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={openDistributorModal}
        onClose={() => setOpenDistributorModal(false)}
        size="lg"
      >
        <Modal.Header className="!text-white">Distributors</Modal.Header>

        <Modal.Body className="!text-white">
          {distributorLoading ? (
            <div className="flex justify-center">
              <Spinner size="xl" />
            </div>
          ) : distributorData.length > 0 ? (
            distributorData.map((d) => (
              <div
                key={d._id}
                className="border-b border-gray-600 py-2 flex justify-between !text-white"
              >
                <div>
                  <p className="font-semibold !text-white">{d.name}</p>
                  <p className="text-sm !text-white">Code: {d.dbCode}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center !text-white">No distributor mapped</p>
          )}
        </Modal.Body>
      </Modal>
      {/* Edit Outlet Modal */}
      <Modal show={openEditModal} onClose={onCloseEditModal} size="6xl">
        <Modal.Header>Edit Outlet</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="outletName" value="Outlet Name *" />
                  <TextInput
                    id="outletName"
                    type="text"
                    value={editOutletData?.outletName || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        outletName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sudoName" value="Sudo Name" />
                  <TextInput
                    id="sudoName"
                    type="text"
                    value={editOutletData?.sudoName || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        sudoName: e.target.value,
                      })
                    }
                    placeholder="Enter sudo name"
                  />
                </div>

                <div>
                  <Label htmlFor="ownerName" value="Owner Name *" />
                  <TextInput
                    id="ownerName"
                    type="text"
                    value={editOutletData?.ownerName || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        ownerName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="empId" value="Employee Code" />
                  <TextInput
                    id="empId"
                    type="text"
                    value={editOutletData?.empId || ""}
                    onChange={(e) =>
                      setEditOutletData((prev) => ({
                        ...prev,
                        empId: e.target.value,
                      }))
                    }
                    placeholder="Enter Employee Code"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-b pb-4 dark:text-white">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="mobile1" value="Mobile Number" />
                  <TextInput
                    id="mobile1"
                    type="tel"
                    value={editOutletData?.mobile1 || ""}
                    onChange={(e) =>
                      setEditOutletData({ ...editOutletData, mobile1: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="mobile2" value="Alternate Number" />
                  <TextInput
                    id="mobile2"
                    type="tel"
                    value={editOutletData?.mobile2 || ""}
                    onChange={(e) =>
                      setEditOutletData({ ...editOutletData, mobile2: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappNumber" value="WhatsApp Number" />
                  <TextInput
                    id="whatsappNumber"
                    type="tel"
                    value={editOutletData?.whatsappNumber || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        whatsappNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email" value="Email" />
                  <TextInput
                    id="email"
                    type="email"
                    value={editOutletData?.email || ""}
                    onChange={(e) =>
                      setEditOutletData({ ...editOutletData, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-b pb-4 dark:text-white">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label value="Select Beat" />
                  <SearchableSelect
                    id="beatId"
                    label="Select Beat"
                    placeholder="Beat"
                    multiple={true}
                    options={beats}
                    value={editOutletData?.beatId}
                    onChange={(e) =>
                      setEditOutletData({ ...editOutletData, beatId: e.target.value })
                    }
                    displayKey="name"
                    descKey="code"
                    valueKey="_id"
                  />
                </div>
                <div>
                  <Label htmlFor="address1" value="Address" />
                  <TextInput
                    id="address1"
                    type="text"
                    value={editOutletData?.address1 || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        address1: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="city" value="City" />
                  <TextInput
                    id="city"
                    type="text"
                    value={editOutletData?.city || ""}
                    onChange={(e) =>
                      setEditOutletData({ ...editOutletData, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pin" value="PIN Code" />
                  <TextInput
                    id="pin"
                    type="text"
                    value={editOutletData?.pin || ""}
                    onChange={(e) =>
                      setEditOutletData({ ...editOutletData, pin: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="shipToAddress" value="Ship To Address" />
                  <TextInput
                    id="shipToAddress"
                    type="text"
                    value={editOutletData?.shipToAddress || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        shipToAddress: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="shipToPincode" value="Ship To PIN Code" />
                <TextInput
                  id="shipToPincode"
                  type="text"
                  value={editOutletData?.shipToPincode || ""}
                  onChange={(e) =>
                    setEditOutletData({
                      ...editOutletData,
                      shipToPincode: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="border-b pb-4 dark:text-white">
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="categoryOfOutlet" value="Category of Outlet (required)" />
                  <Select
                    id="categoryOfOutlet"
                    value={editOutletData?.categoryOfOutlet || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        categoryOfOutlet: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Category</option>
                    <option value="Economy">Economy</option>
                    <option value="Premium">Premium</option>
                    <option value="RETAILER">Retailer</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retailerClass" value="Retailer Class (Required)" />
                  <Select
                    id="retailerClass"
                    value={editOutletData?.retailerClass || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        retailerClass: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Class</option>
                    <option value="A">Class A</option>
                    <option value="B">Class B</option>
                    <option value="C">Class C</option>
                    <option value="D">Class D</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="border-b pb-4 dark:text-white">
              <h3 className="text-lg font-semibold mb-4">Legal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gstin" value="GST IN" />
                  <TextInput
                    id="gstin"
                    type="text"
                    value={editOutletData?.gstin || ""}
                    onChange={(e) =>
                      setEditOutletData({ ...editOutletData, gstin: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="aadharNumber" value="Aadhar Number" />
                  <TextInput
                    id="aadharNumber"
                    type="text"
                    value={editOutletData?.aadharNumber || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        aadharNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="panNumber" value="PAN Number" />
                  <TextInput
                    id="panNumber"
                    type="text"
                    value={editOutletData?.panNumber || ""}
                    onChange={(e) =>
                      setEditOutletData({
                        ...editOutletData,
                        panNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 dark:text-white">
              <Button
                type="button"
                color="gray"
                onClick={onCloseEditModal}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button type="submit" color="blue" disabled={editLoading}>
                {editLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Outlet"
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OutletList;