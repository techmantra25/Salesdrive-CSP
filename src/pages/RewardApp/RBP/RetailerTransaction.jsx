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
import moment from "moment";
import { useCallback, useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import { FaCopy, FaDownload, FaPencilAlt, FaTrash } from "react-icons/fa";
import { MdDownloadForOffline, MdSimCardDownload } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import UniqueCode from "../../../assets/common/UniqueCode";
import PaginatedSearchableSelect from "../../../components/PaginatedSearchableSelect";
import SearchableSelect from "../../../components/SearchableSelect";
import { BACKEND_URL } from "../../../constants";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  ApprovedOutletPaginated,
  deleteRetailerOutletTransaction,
} from "../../../api/api";
import {
  getRetailerTransactionHistory,
  getRetailerTransactionBulkUpload,
  getRetailerManualPointBulkUpload,
} from "../../../api/rbp/transaction";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { escapeCSVValue } from "../../../utils/escapeCSVValue";
import { FileUpload } from "../../../uploadWidget/FileUpload";
import { ConfirmationModelContext } from "../../../context/ContextProvider";
import EditTransactionModal from "../components/EditTransactionModal";
import { getPagePermission } from "../../../utils/permissionHelper";
import { downloadFile } from "../../../utils/downloadFile";

const RetailerTransaction = () => {
  const { userInfo } = useSelector((state) => state.user);
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const role = userInfo?.role;
  const dispatch = useDispatch();
  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors,
  );
  const activeDistributors = distributors.filter(
    (distributor) => distributor.status === true,
  );

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "retailer-transaction-history"
    );

    setPagePermission(permission);
  }, [permissionState]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [transactionList, setTransactionList] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [transactionType, setTransactionType] = useState("all");
  const [transactionFor, setTransactionFor] = useState("all");
  const [transactionStatus, setTransactionStatus] = useState("all");
  const [retailerId, setRetailerId] = useState("all");
  const [distributorId, setDistributorId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [errorLog, setErrorLog] = useState([]);
  const [errorLogType, setErrorLogType] = useState("opening");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualUploadModalOpen, setIsManualUploadModalOpen] = useState(false);

  // edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Function to fetch outlets with pagination and search
  const fetchOutletsWithSearch = useCallback(
    async (searchTerm = "", page = 1) => {
      try {
        const query = {
          page: page,
          limit: 50,
          ...(searchTerm && { search: searchTerm }),
        };

        const response = await ApprovedOutletPaginated(query);
        const totalPages = response?.data?.pagination?.totalPages || 0;

        return {
          data: response?.data?.data || [],
          hasMore: page < totalPages,
        };
      } catch (error) {
        console.error(error);
        toast.error(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch outlet list",
        );
        return { data: [], hasMore: false };
      }
    },
    [],
  );

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const onPageChange = (page) => setCurrentPage(page);

  // Function to fetch paginated retailer transactions
  const fetchRetailerTransactions = async () => {
    try {
      setPageLoading(true);

      // Build query object
      const query = {
        page: currentPage,
        limit: 40,
      };
      if (dateRange?.startDate && dateRange?.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      if (transactionType !== "all") {
        query.transactionType = transactionType;
      }

      if (transactionFor !== "all") {
        query.transactionFor = transactionFor;
      }

      if (transactionStatus !== "all") {
        query.status = transactionStatus;
      }

      if (searchTerm) {
        query.search = searchTerm;
      }

      if (retailerId && retailerId !== "all") {
        query.retailerId = retailerId;
      }

      if (distributorId && distributorId !== "all") {
        query.distributorId = distributorId;
      }

      const response = await getRetailerTransactionHistory(query);

      setTransactionList(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Retailer Transactions",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const downloadReport = async () => {
    const query = {};

    if (dateRange?.startDate && dateRange?.endDate) {
      query.fromDate = dateRange.startDate;
      query.toDate = dateRange.endDate;
    }

    if (transactionType !== "all") {
      query.transactionType = transactionType;
    }

    if (transactionFor !== "all") {
      query.transactionFor = transactionFor;
    }

    if (transactionStatus !== "all") {
      query.status = transactionStatus;
    }

    if (searchTerm) {
      query.search = searchTerm;
    }

    if (retailerId && retailerId !== "all") {
      query.retailerId = retailerId;
    }

    if (distributorId && distributorId !== "all") {
      query.distributorId = distributorId;
    }

    const params = new URLSearchParams(query).toString();
    const url = `${BACKEND_URL}/api/v1/outlet-retailer-transaction/download-retailer-transaction-data`;

    downloadFile({
      url: url,
      queryParams: params,
      fileName: "retailer-transactions.csv",
    });
  };

  const handleCSVTemplateDownload = () => {
    const headers = [
      "RetailerUID",
      "RetailerName",
      "Mobile No",
      "Opening Balance",
      "Transaction Date",
    ];

    const descriptions = [
      "(Required)",
      "(Required)",
      "(Required)",
      "(Required)",
      "(Required Format - 2025-07-15)",
    ];

    // Escape and join
    const csvString =
      headers.map(escapeCSVValue).join(",") +
      "\n" +
      descriptions.map(escapeCSVValue).join(",");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "opening_points_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCSVManualTemplateDownload = () => {
    const headers = [
      "Retailer UID",
      "Retailer Name",
      "Transaction Type",
      "Transaction For",
      "Point",
      "Transaction Date",
      "Remark",
    ];

    const descriptions = [
      "(Required)",
      "(Required)",
      "(Required)Format - (credit, debit)",
      "(Required)Format - (SALES, Sales Multiplier, Volume Multiplier, Consistency Multiplier, Bill Volume Multiplier, Multiplier Sales Return, Sales Return, Opening Points, Manual Point, Gift Redemption, Gift Order Cancellation, other)",
      "(Required)",
      "(Required Format - 2025-07-15)",
      "(Required)",
    ];

    // Escape and join
    const csvString =
      headers.map(escapeCSVValue).join(",") +
      "\n" +
      descriptions.map(escapeCSVValue).join(",");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "manual_points_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBulkUpload = async (url) => {
    try {
      const payload = {
        file: url,
      };
      const res = await getRetailerTransactionBulkUpload(payload);
      setErrorLogType("opening");
      toast.success(
        `${res?.data?.summary?.successCount} rows updated successfully${res?.data?.summary?.skippedCount > 0
          ? ` and ${res?.data?.summary?.skippedCount} rows failed to update`
          : ""
        }`,
      );

      setErrorLog(res?.data?.skippedData || []);
      fetchRetailerTransactions();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to upload opening points, try again",
      );
    }
  };

  const handleBulkManualPointsUpload = async (url) => {
    try {
      const payload = {
        csvUrl: url,
      };

      const res = await getRetailerManualPointBulkUpload(payload);

      setErrorLogType("manual");
      setErrorLog(res?.data?.skippedData || []);

      toast.success(
        `${res?.data?.summary?.successCount} rows updated successfully${res?.data?.summary?.skippedCount > 0
          ? ` and ${res?.data?.summary?.skippedCount} rows failed`
          : ""
        }`,
      );

      fetchRetailerTransactions();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Bulk manual points upload failed",
      );
    }
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
        }, new Set()),
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

      const fileName =
        errorLogType === "manual"
          ? "manual_points_error_log.csv"
          : "opening_points_error_log.csv";

      // Create a blob and trigger the download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
      a.setAttribute("download", fileName);
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
        "Failed to download error log, try again",
      );
    }
  };

  // handeling what will happen when modal i clicked open
  const handleEditClick = (transaction) => {
    // console.log("clicked",ele);
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const debouncedFetchRetailerTransactions = useDebounce(
    fetchRetailerTransactions,
    500,
  );

  const handleDeleteClick = (transaction) => {
    openConfirmationModel({
      question: `Are you sure you want to delete this transaction?`,
      answer: ["Yes", "No"],
      onClose: async (confirmed) => {
        if (!confirmed) return;
        try {
          await deleteRetailerOutletTransaction(transaction._id);
          toast.success("Transaction deleted successfully");
          fetchRetailerTransactions();
        } catch (error) {
          toast.error(error?.message || "Failed to delete transaction");
        }
      },
    });
  };

  useEffect(() => {
    debouncedFetchRetailerTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange,
    currentPage,
    searchTerm,
    transactionType,
    transactionFor,
    transactionStatus,
    retailerId,
    distributorId,
  ]);

  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange,
    searchTerm,
    transactionType,
    transactionFor,
    transactionStatus,
    retailerId,
    distributorId,
  ]);

  useEffect(() => {
    dispatch(fetchDistributors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleResetFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setTransactionType("all");
    setTransactionFor("all");
    setTransactionStatus("all");
    setSearchTerm("");
    setCurrentPage(1);
    setRetailerId("all");
    setDistributorId("all");
    setTransactionList([]);
  };

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col w-full">
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Retailer Transaction History</h1>
            </div>
          </div>
          <div className="flex justify-start items-center flex-col gap-2 w-full p-2">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                {!pageLoading ? (
                  <>
                    <Badge color="indigo">Count: {filteredCount}</Badge>
                  </>
                ) : (
                  <Spinner aria-label="Loading..." size="sm" />
                )}
              </div>

              <div className="flex justify-center w-full items-end gap-2 flex-wrap">
                <div className="w-44">
                  <div className="block">
                    <Label value="Search" />
                  </div>
                  <TextInput
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value?.trim())}
                    sizing={"sm"}
                  />
                </div>

                {/* Transaction Type */}
                <div className="w-44">
                  <div className="block">
                    <Label value="Transaction Type" />
                  </div>
                  <Select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    id="transactionType"
                    sizing={"sm"}
                  >
                    <option value="all">All</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </Select>
                </div>

                {/* Transaction For */}
                <div className="w-44">
                  <div className="block">
                    <Label value="Transaction For" />
                  </div>
                  <Select
                    value={transactionFor}
                    onChange={(e) => setTransactionFor(e.target.value)}
                    id="transactionFor"
                    sizing={"sm"}
                  >
                    <option value="all">All</option>
                    <option value="SALES">SALES</option>
                    <option value="Volume Multiplier">Volume Multiplier</option>
                    <option value="Consistency Multiplier">
                      Consistency Multiplier
                    </option>
                    <option value="Bill Volume Multiplier">
                      Bill Volume Multiplier
                    </option>
                    <option value="Multiplier Sales Return">
                      Multiplier Sales Return
                    </option>
                    <option value="Sales Return">Sales Return</option>
                    <option value="Opening Points">Opening Points</option>
                    <option value="Manual Point">Manual Point</option>
                    {/* <option value="Sales Multiplier">Sales Multiplier</option> */}
                    <option value="Gift Redemption">Gift Redemption</option>
                    <option value="Gift Order Cancellation">
                      Gift Order Cancellation
                    </option>
                    <option value="other">other</option>
                  </Select>
                </div>

                {/* Transaction Status */}
                <div className="w-44">
                  <div className="block">
                    <Label value="Transaction Status" />
                  </div>
                  <Select
                    value={transactionStatus}
                    onChange={(e) => setTransactionStatus(e.target.value)}
                    id="transactionStatus"
                    sizing={"sm"}
                  >
                    <option value="all">All</option>
                    <option value="Success">Success</option>
                    <option value="Failed">Failed</option>
                    <option value="Pending">Pending</option>
                  </Select>
                </div>

                {/* Search Retailer */}
                <div className="w-56">
                  <div className="block">
                    <Label value="Retailer Name" />
                  </div>
                  <PaginatedSearchableSelect
                    id="retailer-select"
                    className="w-full"
                    fetchOptions={fetchOutletsWithSearch}
                    value={retailerId}
                    onChange={(e) => setRetailerId(e.target.value)}
                    disabled={pageLoading}
                    placeholder={`Select Retailer`}
                    displayKey="outletName"
                    descKey="outletUID"
                    valueKey="_id"
                    searchPlaceholder="Search Retailer..."
                  />
                </div>

                <div>
                  <div className="block">
                    <Label htmlFor="distributorId" value="Distributors *" />
                  </div>
                  <SearchableSelect
                    id="distributorId"
                    options={activeDistributors}
                    value={distributorId}
                    onChange={(e) => setDistributorId(e.target.value)}
                    placeholder="Select Distributor"
                    displayKey="name"
                    disabled={distributorsLoading || pageLoading}
                    valueKey="_id"
                    descKey="dbCode"
                    label="Distributor Name"
                    defaultValue="all"
                    className={"w-44"}
                  />
                </div>

                {/* Date Range */}
                <div className="w-64">
                  <div className="block">
                    <Label value="Select Date Range" />
                  </div>
                  <Datepicker
                    inputClassName="relative py-1.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500"
                    showShortcuts={true}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    size="sm"
                  />
                </div>

                <div>
                  {pagePermission?.view && (
                    <Button
                      className="text-xs text-white"
                      size="xs"
                      color="success"
                      onClick={handleResetFilter}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <RiRefreshFill size={18} />
                        Reset Filters
                      </span>
                    </Button>
                  )}
                </div>
                <div className="flex gap-3 justify-center items-center">
                  {role === "admin" ? (
                    <>
                      {pagePermission?.view && (
                        <Button
                          size="sm"
                          color="purple"
                          onClick={() => downloadReport()}
                        >
                          <span className="flex justify-center items-center gap-2">
                            <FaDownload size={15} />
                            Download Report
                          </span>
                        </Button>
                      )}

                      {pagePermission?.create && (
                        <Button
                          color="yellow"
                          size="sm"
                          onClick={() => setIsUploadModalOpen(true)}
                        >
                          <span className="flex justify-center items-center gap-2">
                            <MdSimCardDownload size={20} />
                            Upload Opening Points
                          </span>
                        </Button>
                      )}

                      {pagePermission?.create && (
                        <Button
                          color="purple"
                          size="sm"
                          onClick={() => setIsManualUploadModalOpen(true)}
                        >
                          <span className="flex justify-center items-center gap-2">
                            <MdSimCardDownload size={20} />
                            Upload Bulk Manual Points
                          </span>
                        </Button>
                      )}

                      {errorLog.length > 0 && pagePermission?.view && (
                        <Button
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
                    </>
                  ) : null}
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end items-center w-full px-4">
            <div className="flex overflow-x-auto sm:justify-center">
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  showIcons
                />
              )}
            </div>
          </div>

          <div className="flex justify-center w-full items-center gap-2 flex-wrap p-2 mt-4">
            <div className="overflow-x-auto w-full">
              <Table striped className="rounded-none text-xs">
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Retailer Transaction ID
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Retailer Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Retailer UID
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Distributor Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Distributor Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction For
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction Type
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Point
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Balance
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Distributor Transaction ID
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Invoice No
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Bill No
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Sales Return No
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction Date
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction Last Updated Date
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Remark
                  </Table.HeadCell>
                  {(pagePermission?.update || pagePermission?.delete) && (
                    <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                      Action
                    </Table.HeadCell>
                  )}
                </Table.Head>
                <Table.Body className="divide-y">
                  {pageLoading ? (
                    <Table.Row>
                      <Table.Cell colSpan="70%">
                        <div
                          className="w-full flex justify-center items-center py-4"
                          role="status"
                        >
                          <Spinner aria-label="Loading..." size="xl" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    <>
                      {transactionList?.map((ele, index) => (
                        <Table.Row
                          key={index}
                          className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={ele?.transactionId}
                              codeName={"Transaction ID"}
                            />
                            <div className="flex items-center justify-center gap-2">
                              <FaCopy
                                size={15}
                                className="cursor-pointer"
                                title={ele?.transactionId?.toUpperCase()}
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    ele?.transactionId?.toUpperCase(),
                                  );
                                  toast.success("ID copied to clipboard");
                                }}
                              />
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {ele?.retailerId?.outletName}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={ele?.retailerId?.outletUID}
                              codeName={"Retailer UID"}
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {ele?.distributorId?.name}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={ele?.distributorId?.dbCode}
                              codeName={"Distributor Code"}
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {ele?.transactionFor}
                          </Table.Cell>
                          <Table.Cell
                            className={`whitespace-nowrap ${ele?.transactionType === "debit"
                                ? "text-red-600 font-bold"
                                : "text-green-600 font-bold"
                              } dark:text-gray-200`}
                          >
                            {ele?.transactionType === "debit"
                              ? "Debit"
                              : "Credit"}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span
                              className={`flex items-center justify-center gap-2 ${ele?.transactionType === "debit"
                                  ? "text-red-400 font-bold"
                                  : "text-green-400 font-bold"
                                }`}
                            >
                              {ele?.point}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span className="flex items-center justify-center gap-2">
                              {Number.isInteger(ele?.balance)
                                ? ele?.balance
                                : Number(ele?.balance).toFixed(2)}
                            </span>
                          </Table.Cell>

                          <Table.Cell
                            className={`whitespace-nowrap ${ele?.status === "Success"
                                ? "text-green-500 font-bold"
                                : ele?.status === "Failed"
                                  ? "text-red-500 font-bold"
                                  : "text-yellow-500 font-bold"
                              }`}
                          >
                            {ele?.status}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={ele?.distributorTransactionId?._id?.toUpperCase()}
                              codeName={"Distributor Transaction ID"}
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex items-center justify-center gap-2">
                              {ele?.invoiceId?.invoiceNo ? (
                                <UniqueCode
                                  text={ele?.invoiceId?.invoiceNo?.toUpperCase()}
                                  codeName={"Invoice No"}
                                />
                              ) : null}
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex items-center justify-center gap-2">
                              {ele?.billId?.billNo ? (
                                <UniqueCode
                                  text={ele?.billId?.billNo?.toUpperCase()}
                                  codeName={"Bill No"}
                                />
                              ) : null}
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex items-center justify-center gap-2">
                              {ele?.salesReturnId?.salesReturnNo ? (
                                <UniqueCode
                                  text={ele?.salesReturnId?.salesReturnNo?.toUpperCase()}
                                  codeName={"Sales Return No"}
                                />
                              ) : null}
                            </div>
                          </Table.Cell>

                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {moment(ele?.createdAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY hh:mm A")}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {moment(ele?.updatedAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY hh:mm A")}
                          </Table.Cell>
                          <Table.Cell className="font-medium text-gray-900 dark:text-gray-200 min-w-96">
                            {ele?.remark}
                          </Table.Cell>

                          {(pagePermission?.update || pagePermission?.delete) && (
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {(ele?.transactionFor === "Opening Points" ||
                                ele?.transactionFor === "Manual Point") && (
                                  <div className="flex items-center justify-center gap-3">
                                    {pagePermission?.update && (
                                      <button
                                        onClick={() => handleEditClick(ele)}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Edit Transaction"
                                      >
                                        <FaPencilAlt size={14} />
                                      </button>
                                    )}

                                    {pagePermission?.delete && (
                                      <button
                                        onClick={() => handleDeleteClick(ele)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete Transaction"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    )}
                                  </div>
                                )}
                            </Table.Cell>
                          )}
                        </Table.Row>
                      ))}
                      {transactionList?.length === 0 && (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan="100%"
                            className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                          >
                            <span className="w-full flex justify-center items-center gap-2 py-4">
                              No transactions found
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </>
                  )}
                </Table.Body>
              </Table>
            </div>
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

      {/* Upload Opening Points Modal */}
      {pagePermission?.create && (
        <Modal
          show={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        >
          <Modal.Header>Upload Opening Points</Modal.Header>
          <Modal.Body>
            <div className="flex gap-3 justify-center items-center">
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
              <FileUpload
                type="single-file"
                page="bulk-import"
                onSetFileUrl={(url) => {
                  handleBulkUpload(url);
                }}
                btnTitle="Upload Opening Points"
                btnClassName="!bg-yellow-500 hover:!bg-yellow-700 !text-white"
              />
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* Upload Bulk Manual Points Modal */}
      {pagePermission?.create && (
        <Modal
          show={isManualUploadModalOpen}
          onClose={() => setIsManualUploadModalOpen(false)}
        >
          <Modal.Header>Upload Bulk Manual Points</Modal.Header>
          <Modal.Body>
            <div className="flex gap-3 justify-center items-center">
              <Button
                className="text-xs"
                color="light"
                size="sm"
                onClick={() => {
                  handleCSVManualTemplateDownload();
                }}
              >
                <span className="flex justify-center items-center gap-2">
                  <MdSimCardDownload size={20} />
                  Manual Template
                </span>
              </Button>
              <FileUpload
                type="single-file"
                page="bulk-import"
                onSetFileUrl={(url) => {
                  handleBulkManualPointsUpload(url);
                }}
                btnTitle="Upload Bulk Manual Points"
                btnClassName="!bg-blue-600 hover:!bg-blue-700 !text-white"
              />
            </div>
          </Modal.Body>
        </Modal>
      )}

      {isEditModalOpen && selectedTransaction && pagePermission?.update && (
        <EditTransactionModal
          transaction={selectedTransaction}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
            fetchRetailerTransactions();
          }}
        />
      )}
    </div>
  );
};

export default RetailerTransaction;