import {
  Badge,
  Button,
  Card,
  Label,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCopy, FaDownload, FaTrash, FaEdit } from "react-icons/fa";

import { RiRefreshFill } from "react-icons/ri";
import Datepicker from "react-tailwindcss-datepicker";
import { SearchOutletsDropdown } from "../../api/api";
import {
  bulkSyncRetailerMultiplierTransactions,
  getMissingRetailerMultiplierTxnCount,
  updateRetailerMultiplierTransaction,
  rebuildRetailerBalance,
} from "../../api/rbp/multiplierApi";
import { editRetailerMultiplierPoint } from "../../api/rbp/multiplierApi";

import {
  deleteRetailerMultiplierTransaction,
  retailerMultiplierTransactionList,
} from "../../api/rewardsApi";
import { DeleteRetailerTransaction } from "../../api/rbp/transaction";
import UniqueCode from "../../assets/common/UniqueCode";
// import SearchableSelect from "../../components/SearchableSelect";
import PaginatedSearchableSelect from "../../components/PaginatedSearchableSelect";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { useDispatch, useSelector } from "react-redux";
import { getPagePermission } from "../../utils/permissionHelper";
import { downloadFile } from "../../utils/downloadFile";

const RetailerMultiplierTransactions = () => {
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  // const [outletList, setOutletList] = useState([]);
  const [transactionList, setTransactionList] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [transactionType, setTransactionType] = useState("all");
  const [editMonthlyPoint, setEditMonthlyPoint] = useState("");
  const [transactionFor, setTransactionFor] = useState("all");
  const [transactionStatus, setTransactionStatus] = useState("all");
  const [retailerId, setRetailerId] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [trasactionLoading, setTransactionLoading] = useState(false);
  const [isSearchingRetailer, setIsSearchingRetailer] = useState(false);
  const [deletingTransactions, setDeletingTransactions] = useState(new Set());
  const [missingCounts, setMissingCounts] = useState({});
  const [editOpen, setEditOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [editPoint, setEditPoint] = useState("");

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "multiplier-transactions"
    );

    setPagePermission(permission);
  }, [permissionState]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const onPageChange = (page) => setCurrentPage(page);

  const months = [
    { name: "January", value: 1 },
    { name: "February", value: 2 },
    { name: "March", value: 3 },
    { name: "April", value: 4 },
    { name: "May", value: 5 },
    { name: "June", value: 6 },
    { name: "July", value: 7 },
    { name: "August", value: 8 },
    { name: "September", value: 9 },
    { name: "October", value: 10 },
    { name: "November", value: 11 },
    { name: "December", value: 12 },
  ];

  // Generate year options from 2024 to current year
  const currentYear = moment().year();
  const years = [];
  for (let y = 2024; y <= currentYear; y++) {
    years.push(y);
  }

  // async function getOutletList() {
  //   setDataLoading(true);
  //   try {
  //     const res = await getApprovedOutletList();

  //     setOutletList(res?.data?.data);
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.message ||
  //         "Failed to fetch all outlet List"
  //     );
  //   } finally {
  //     setDataLoading(false);
  //   }
  // }

  //multiple search at once
  const handleSearch = useCallback(async (searchValue) => {
    if (!searchValue || searchValue.trim().length === 0) {
      setIsSearchingRetailer(false);
      setRetailerId("all");
      return;
    }
    try {
      const query = {
        page: 1,
        limit: 10,
        includeInactive: "true",
        exactMatch: "true",
        search: searchValue.trim(),
      };
      const response = await SearchOutletsDropdown(query);
      const retailers = response?.data?.data || [];
      if (retailers.length > 0) {
        setRetailerId(retailers[0]._id);
        setIsSearchingRetailer(true);
      } else {
        setIsSearchingRetailer(false);
        setRetailerId("all");
      }
    } catch (error) {
      console.error("error searching retailers", error);
      setIsSearchingRetailer(false);
      setRetailerId("all");
    }
  }, []);

  const debouncedSearch = useDebounce(handleSearch, 500);

  useEffect(() => {
    debouncedSearch(searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  //new paginated function
  const fetchOutletsWithSearch = useCallback(
    async (searchTerm = "", page = 1) => {
      try {
        const query = {
          page: page,
          limit: 50,
          // includeInactive: "true",
          ...(searchTerm && { search: searchTerm }),
        };

        // USE THE NEW API ENDPOINT
        const response = await SearchOutletsDropdown(query);
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

  const fetchRetailerTransactions = async () => {
    try {
      setPageLoading(true);

      // Build query object
      const query = {
        page: currentPage,
        limit: 30,
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

      if (selectedMonth && selectedMonth !== "all") {
        query.month = selectedMonth;
      }
      if (selectedYear && selectedYear !== "all") {
        query.year = selectedYear;
      }
      if (retailerId && retailerId !== "all") {
        query.retailerId = retailerId;
      } else if (searchTerm && searchTerm.trim()) {
        query.search = searchTerm.trim();
      }
      const response = await retailerMultiplierTransactionList(query);

      setTransactionList(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Retailer Multiplier Transactions",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const debouncedFetchRetailerTransactions = useDebounce(
    fetchRetailerTransactions,
    500,
  );

  const fetchMissingCounts = async () => {
    try {
      const response = await getMissingRetailerMultiplierTxnCount();
      if (response.data.success) {
        setMissingCounts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching missing counts:", error);
    }
  };

  useEffect(() => {
    debouncedFetchRetailerTransactions();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange,
    currentPage,
    searchTerm,
    isSearchingRetailer,
    transactionType,
    transactionFor,
    transactionStatus,
    retailerId,
    selectedMonth,
    selectedYear,
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
    selectedMonth,
    selectedYear,
  ]);

  useEffect(() => {
    fetchMissingCounts();
  }, []);

  // useEffect(() => {
  //   getOutletList();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleResetFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setTransactionType("all");
    setTransactionFor("all");
    setTransactionStatus("all");
    setSearchTerm("");
    setIsSearchingRetailer(false);
    setCurrentPage(1);
    setRetailerId("all");
    setSelectedMonth("all");
    setSelectedYear("all");
    setTransactionList([]);
    fetchMissingCounts();
  };

  const handleRefetchTransactions = async (transactionId) => {
    setTransactionLoading(true);
    try {
      await toast.promise(updateRetailerMultiplierTransaction(transactionId), {
        loading: `Updating transaction...`,
        success: () => "Transaction updated successfully",
        error: (err) =>
          err?.response?.data?.message || "Failed to update transaction",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setTransactionLoading(false);
      debouncedFetchRetailerTransactions();
    }
  };

  const handleSyncTransactions = async () => {
    setTransactionLoading(true);
    try {
      await toast.promise(bulkSyncRetailerMultiplierTransactions(), {
        loading: "Syncing retailer multiplier transactions...",
        success: "Sync completed successfully",
        error: (err) => err?.response?.data?.message || "Sync failed!",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setTransactionLoading(false);
      debouncedFetchRetailerTransactions();
      fetchMissingCounts();
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

    if (selectedMonth && selectedMonth !== "all") {
      query.month = selectedMonth;
    }
    if (selectedYear && selectedYear !== "all") {
      query.year = selectedYear;
    }

    if (searchTerm) {
      query.search = searchTerm;
    }

    if (retailerId && retailerId !== "all") {
      query.retailerId = retailerId;
    }
    const params = new URLSearchParams(query).toString();
    const url = `${BACKEND_URL}/api/v1/retailerMultiplier/retailer-transaction-report?${params}`;
    // const url = `${BACKEND_URL}/api/v1/retailerMultiplier/download-retailer-multiplier-csv?${params}`;

    // window.open(url, "_blank");

    // Use downloadFile utility for CSV export
    downloadFile({
      url: url,
      queryParams: params,
      fileName: "retailer-multiplier-transactions.csv",
    });
  };

  const downloadTransactionHistory = async () => {
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

    if (selectedMonth && selectedMonth !== "all") {
      query.month = selectedMonth;
    }
    if (selectedYear && selectedYear !== "all") {
      query.year = selectedYear;
    }

    if (searchTerm) {
      query.search = searchTerm;
    }

    if (retailerId && retailerId !== "all") {
      query.retailerId = retailerId;
    }
    const params = new URLSearchParams(query).toString();
    const url = `${BACKEND_URL}/api/v1/retailerMultiplier/download-retailer-multiplier-csv?${params}`;

    // window.open(url, "_blank");

    // Use downloadFile utility for CSV export
    downloadFile({
      url: url,
      queryParams: params,
      fileName: "retailer-multiplier-history.csv",
    });
  };

  const handleDeleteTransaction = async (transaction) => {
    const retailerTxnId = transaction?.retailerOutletTransactionId?._id;
    const question = retailerTxnId
      ? `Are you sure you want to delete this multiplier transaction and the associated retailer outlet transaction - ${transaction.retailerOutletTransactionId?.transactionId}?`
      : "Are you sure you want to delete this transaction?";
    openConfirmationModel({
      question,
      answer: ["Yes", "No"],
      onClose: async (confirmed) => {
        if (confirmed) {
          setDeletingTransactions((prev) => new Set(prev).add(transaction._id));
          try {
            const deletePromises = [
              deleteRetailerMultiplierTransaction(transaction._id),
            ];
            if (retailerTxnId) {
              deletePromises.push(DeleteRetailerTransaction(retailerTxnId));
            }
            await Promise.all(deletePromises);
            toast.success("Transaction deleted successfully");
            debouncedFetchRetailerTransactions();
          } catch (error) {
            toast.error("Failed to delete transaction");
          } finally {
            setDeletingTransactions((prev) => {
              const newSet = new Set(prev);
              newSet.delete(transaction._id);
              return newSet;
            });
          }
        }
      },
    });
  };
  const openEditModal = (transaction) => {
    setEditTransaction(transaction);
    setEditPoint(transaction?.point || 0);
    setEditMonthlyPoint(transaction?.monthTotalPoints || 0);
    setEditOpen(true);
  };

  const handleUpdatePoint = async () => {
    if (editPoint === "" && editMonthlyPoint === "") {
      toast.error("At least one value is required");
      return;
    }

    if (
      (editPoint !== "" && Number(editPoint) < 0) ||
      (editMonthlyPoint !== "" && Number(editMonthlyPoint) < 0)
    ) {
      toast.error("Points cannot be negative");
      return;
    }

    // no-change guard
    if (
      Number(editPoint) === Number(editTransaction?.point) &&
      Number(editMonthlyPoint) === Number(editTransaction?.monthTotalPoints)
    ) {
      toast.error("No changes detected");
      return;
    }

    try {
      setTransactionLoading(true);

      await editRetailerMultiplierPoint(editTransaction._id, {
        point: Number(editPoint),
        monthTotalPoints: Number(editMonthlyPoint),
      });

      const retailerId = editTransaction?.retailerId?._id;
      if (!retailerId) {
        throw new Error("Retailer not found for rebuild");
      }

      await rebuildRetailerBalance(retailerId);

      toast.success("Points updated & balance rebuilt successfully");

      setEditOpen(false);
      setEditTransaction(null);
      setEditPoint("");
      setEditMonthlyPoint("");

      debouncedFetchRetailerTransactions();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update points",
      );
    } finally {
      setTransactionLoading(false);
    }
  };

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col w-full gap-4">
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Multiplier Transactions</h1>
            </div>
          </div>

          <div className="flex justify-start items-center flex-col gap-2 w-full p-2">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                {!pageLoading && (
                  <Badge color="warning">Count: {filteredCount}</Badge>
                )}
              </div>
              {/* Filters  */}
              <div className="flex justify-center w-full items-end gap-2 flex-wrap">
                {/* Search Transaction */}
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

                <div className="w-56">
                  <div className="block">
                    <Label value="Retailer Name" />
                  </div>
                  <PaginatedSearchableSelect
                    id="retailer-select"
                    className="w-56"
                    fetchOptions={fetchOutletsWithSearch}
                    value={retailerId}
                    onChange={(e) => setRetailerId(e.target.value)}
                    disabled={pageLoading}
                    placeholder="Select Retailer"
                    displayKey="outletName"
                    descKey="outletUID"
                    valueKey="_id"
                    searchPlaceholder="Search Retailer..."
                  />
                </div>

                <div className="w-44">
                  <div className="block">
                    <Label value="Select Month" />
                  </div>

                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    sizing={"sm"}
                  >
                    <option value="all">All</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-44">
                  <div className="block">
                    <Label value="Select Year" />
                  </div>

                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    sizing={"sm"}
                  >
                    <option value="all">All</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
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
                    {/* These options must match your Mongoose enum */}
                    <option value="Volume Multiplier">Volume Multiplier</option>
                    <option value="Bill Volume Multiplier">
                      {" "}
                      Bill Volume Multiplier
                    </option>
                    <option value="Consistency Multiplier">
                      Consistency Multiplier
                    </option>
                    <option value="Sales Return">Sales Return</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                {/* Transaction Status (New Filter) */}
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

                <div className="flex justify-center items-center gap-2 mt-4">
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
                  {pagePermission?.view && (
                    <Button
                      size="xs"
                      color="blue"
                      onClick={() => downloadReport()}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <FaDownload size={15} />
                        Download Transactions
                      </span>
                    </Button>
                  )}
                  {pagePermission?.view && (
                    <Button
                      size="xs"
                      color="purple"
                      onClick={() => downloadTransactionHistory()}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <FaDownload size={15} />
                        Monthly Transaction History
                      </span>
                    </Button>
                  )}
                  {pagePermission?.update && (
                    <Button
                      size="xs"
                      color="blue"
                      onClick={handleSyncTransactions}
                      disabled={trasactionLoading}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <RiRefreshFill size={15} />
                        Sync Transactions
                      </span>
                    </Button>
                  )}
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

          <div className="flex justify-center items-center flex-col gap-2 w-full p-2">
            <div className="flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">
                Volume Multiplier Missing:{" "}
                {missingCounts.volumeMultiplierMissing || 0}
              </Badge>
              <Badge color="warning">
                Consistency Multiplier Missing:{" "}
                {missingCounts.consistencyMultiplierMissing || 0}
              </Badge>
              <Badge color="warning">
                Bill Volume Multiplier Missing:{" "}
                {missingCounts.billVolumeMultiplierMissing || 0}
              </Badge>
              <Badge color="warning">
                Sales Return Missing: {missingCounts.salesReturnMissing || 0}
              </Badge>
              <Badge color="warning">
                Other Missing: {missingCounts.otherMissing || 0}
              </Badge>
            </div>
          </div>

          <div className="flex justify-center w-full items-center gap-2 flex-wrap p-2 mt-4">
            <div className="overflow-x-auto w-full">
              <Table striped className="rounded-none text-xs">
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction ID
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Retailer
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction For
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction Type
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Month and Year
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Month Total Point
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Applicable Slab <br />
                    for Multiplier
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Multiplier Point
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Total Point
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Retailer Transaction
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction Date
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Remark
                  </Table.HeadCell>
                  {(pagePermission?.update || pagePermission?.delete) && (
                    <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                      Actions
                    </Table.HeadCell>
                  )}
                </Table.Head>
                <Table.Body className="divide-y">
                  {pageLoading ? (
                    <Table.Row>
                      <Table.Cell colSpan="100%">
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
                            <div className="flex items-center justify-center gap-2">
                              {/* Displaying transaction _id as unique identifier */}
                              {/* <UniqueCode
                                text={ele?._id?.toUpperCase()}
                                codeName={"Transaction ID"}
                              /> */}
                              <FaCopy
                                size={15}
                                className="cursor-pointer"
                                title={ele?._id?.toUpperCase()}
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    ele?._id?.toUpperCase(),
                                  );
                                  toast.success("ID copied to clipboard");
                                }}
                              />
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {ele?.retailerId?.outletName && (
                              <>
                                {ele?.retailerId?.outletName} (
                                <UniqueCode
                                  text={ele?.retailerId?.outletUID}
                                  codeName={"Retailer ID"}
                                />
                                )
                              </>
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {ele?.transactionFor}
                          </Table.Cell>
                          <Table.Cell
                            className={`whitespace-nowrap ${
                              ele?.transactionType === "debit"
                                ? "text-red-600 font-bold"
                                : "text-green-600 font-bold"
                            } dark:text-gray-200`}
                          >
                            {ele?.transactionType === "debit"
                              ? "Debit"
                              : "Credit"}
                          </Table.Cell>
                          <Table.Cell className="font-medium text-gray-900 dark:text-gray-200">
                            {months.find((m) => m.value === ele?.month)?.name},{" "}
                            {ele?.year}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span
                              className={`flex items-center justify-center gap-2`}
                            >
                              {ele?.monthTotalPoints}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span
                              className={`flex items-center justify-center gap-2`}
                            >
                              {ele?.slabPercentage}%
                            </span>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span
                              className={`flex items-center justify-center gap-2 ${
                                ele?.transactionType === "debit"
                                  ? "text-red-400 font-bold"
                                  : "text-green-400 font-bold"
                              }`}
                            >
                              {ele?.point}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span
                              className={`flex items-center justify-center gap-2`}
                            >
                              {ele?.monthTotalPoints && ele?.point
                                ? Number(ele?.point) +
                                  Number(ele?.monthTotalPoints)
                                : null}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {ele?.retailerId?.outletName &&
                            ele?.retailerOutletTransactionId?.transactionId ? (
                              <UniqueCode
                                text={
                                  ele?.retailerOutletTransactionId
                                    ?.transactionId
                                }
                                codeName={"Retailer Transaction ID"}
                              />
                            ) : ele?.transactionFor != "" &&
                              !ele?.retailerOutletTransactionId
                                ?.transactionId ? (
                              pagePermission?.update && (
                                <Button
                                  size="xs"
                                  color="blue"
                                  onClick={() =>
                                    handleRefetchTransactions(ele?._id)
                                  }
                                  disabled={trasactionLoading}
                                >
                                  Retry
                                </Button>
                              )
                            ) : null}
                          </Table.Cell>
                          <Table.Cell
                            className={`whitespace-nowrap ${
                              ele?.status === "Success"
                                ? "text-green-400 font-bold"
                                : ele?.status === "Failed"
                                  ? "text-red-400 font-bold"
                                  : "text-yellow-400 font-bold"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={`${
                                  ele?.status === "Failed"
                                    ? "cursor-pointer"
                                    : ""
                                }`}
                                onClick={() => {
                                  if (ele?.status === "Failed") {
                                    alert(
                                      JSON.stringify(ele?.apiResponse, null, 2),
                                    );
                                  }
                                }}
                              >
                                {ele?.status}
                              </span>

                              {ele?.status === "Failed" &&
                              pagePermission?.update ? (
                                <Button
                                  size="xs"
                                  color="blue"
                                  onClick={() =>
                                    handleRefetchTransactions(ele?._id)
                                  }
                                  disabled={trasactionLoading}
                                >
                                  Retry
                                </Button>
                              ) : null}
                            </div>
                          </Table.Cell>

                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {moment(ele?.updatedAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY hh:mm A")}
                          </Table.Cell>
                          <Table.Cell className="font-medium text-gray-900 dark:text-gray-200 min-w-96">
                            {ele?.remark}
                          </Table.Cell>
                          {(pagePermission?.update ||
                            pagePermission?.delete) && (
                            <Table.Cell className="flex justify-center items-center gap-2">
                              {pagePermission?.update && (
                                <FaEdit
                                  size={18}
                                  className="cursor-pointer text-blue-500"
                                  title="Edit Point"
                                  onClick={() => openEditModal(ele)}
                                />
                              )}
                              {pagePermission?.delete && (
                                <FaTrash
                                  size={20}
                                  className="cursor-pointer text-red-500"
                                  onClick={() => handleDeleteTransaction(ele)}
                                />
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

      {editOpen && pagePermission?.update && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            className="w-[420px] rounded-xl bg-[#0f172a] border border-gray-700 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 border-b border-gray-700 pb-2">
              <h2 className="text-lg font-semibold text-white">
                Edit Multiplier Point
              </h2>
              <p className="text-xs text-gray-400">
                Update multiplier points manually
              </p>
            </div>

            {/* Info */}
            <div className="mb-3 text-sm text-gray-300">
              <span className="font-semibold text-gray-400">Retailer:</span>{" "}
              {editTransaction?.retailerId?.outletName}
            </div>

            {/* <div className="mb-4 text-sm text-gray-300">
              <span className="font-semibold text-gray-400">Previous Point:</span>{" "}
              <span className="text-yellow-400 font-semibold">
                {editTransaction?.point}
              </span>
            </div> */}

            {/* Input */}
            <div className="mb-5">
              <Label value="Point" className="text-gray-300 mb-1" />
              <TextInput
                type="number"
                min={0}
                value={editPoint}
                onChange={(e) => setEditPoint(e.target.value)}
                className="bg-[#020617] text-white border-gray-700"
              />
            </div>

            <div className="mb-5">
              <Label
                value="Monthly Total Point"
                className="text-gray-300 mb-1"
              />
              <TextInput
                type="number"
                min={0}
                value={editMonthlyPoint}
                onChange={(e) => setEditMonthlyPoint(e.target.value)}
                className="bg-[#020617] text-white border-gray-700"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                size="sm"
                color="gray"
                onClick={() => {
                  setEditOpen(false);
                  setEditTransaction(null);
                  setEditPoint("");
                  setEditMonthlyPoint("");
                }}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                color="blue"
                onClick={handleUpdatePoint}
                disabled={trasactionLoading}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerMultiplierTransactions;