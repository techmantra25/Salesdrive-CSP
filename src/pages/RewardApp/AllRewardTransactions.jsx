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
  Textarea,
} from "flowbite-react";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCopy, FaDownload, FaPlus, FaTrash, FaPen } from "react-icons/fa";

import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import { SearchOutletsDropdown } from "../../api/api";
import {
  AllDistributorTransactionList,
  bulkRetryDistributorTransactions,
  bulkSyncRetailerOutletTransactions,
  countRetailerIdMissingTransactionsV2,
  createDistributorTransaction,
  deleteDistributorTransaction,
  updateDistributorTransaction,
} from "../../api/distributorTransactionApi";
import UniqueCode from "../../assets/common/UniqueCode";
import PaginatedSearchableSelect from "../../components/PaginatedSearchableSelect";
import SearchableSelect from "../../components/SearchableSelect";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchStates } from "../../redux/stateSlice";
import { DeleteRetailerTransaction } from "../../api/rbp/transaction";
import { getPagePermission } from "../../utils/permissionHelper";
import { downloadFile } from "../../utils/downloadFile";
import DisTransactionEditModal from "./components/DisTransactionEditModal";

const AllRewardTransactions = () => {
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role;
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  //const [outletList, setOutletList] = useState([]);
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
  const [stateId, setStateId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [trasactionLoading, setTransactionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    distributorId: "",
    point: "",
    transactionFor: "",
    transactionType: "",
    Remarks: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [isSearchingRetailer, setIsSearchingRetailer] = useState(false);
  const [deletingTransactions, setDeletingTransactions] = useState(new Set());
  const [missingData, setMissingData] = useState({
    salesMissing: 0,
    salesReturnMissing: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    distributorId: "",
    transactionType: "",
    transactionFor: "",
    point: "",
    Remarks: "",
    createdAt: "",
    updatedAt: "",
  });

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "distributor-transactions"
    );

    setPagePermission(permission);
  }, [permissionState]);

  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors,
  );
  const activeDistributors = distributors.filter(
    (distributor) => distributor.status === true,
  );

  const { states, loading: statesLoading } = useSelector(
    (state) => state.state,
  );
  const activeStates = states.filter((state) => state.status === true);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const onPageChange = (page) => setCurrentPage(page);


  //multi search searchbar
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
      console.log("error searching retailers", error);
      setIsSearchingRetailer(false);
      setRetailerId("all");
    }
  }, []);

  const debouncedSearch = useDebounce(handleSearch, 500);
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

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

  // Function to fetch paginated distributor transactions

  // Add this function after your state declarations
  // Find this function (around line 92-112)
  // Find this function (around line 92-112) and replace it with:
  const fetchOutletsWithSearch = useCallback(
    async (searchTerm = "", page = 1) => {
      try {
        const query = {
          page: page,
          limit: 50,
          // includeInactive: "true",
          ...(searchTerm && { search: searchTerm.trim() }),
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

  const fetchDistributorTransactions = async () => {
    try {
      setPageLoading(true);

      // Build query object
      const query = {
        page: currentPage,
        limit: 40,
        dateFilterType: "created"
      };

      if (distributorId && distributorId !== "all") {
        query.distributorId = distributorId;
      }

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


      if (retailerId && retailerId !== "all") {
        query.retailerId = retailerId;
      } else if (searchTerm && searchTerm.trim()) {
        query.search = searchTerm.trim();
      }

      if (stateId && stateId !== "all") {
        query.stateId = stateId;
      }

      const response = await AllDistributorTransactionList(query);

      setTransactionList(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Distributor Transactions",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const fetchMissingData = async () => {
    try {
      const response = await countRetailerIdMissingTransactionsV2();
      if (response.data.success) {
        setMissingData(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // console all the reatailer uid from transaction list
  useEffect(() => {
    transactionList.forEach((transaction) => {
      console.log(
        "Retailer name and outletUID and id:",
        transaction.retailerId?.outletName,
        transaction.retailerId?.outletUID,
        transaction.retailerId?._id,
      );
    });
  }, [transactionList]);

  const downloadReport = async () => {
    const query = {
      dateFilterType: "created",
    };
    if (distributorId && distributorId !== "all") {
      query.distributorId = distributorId;
    }

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

    if (retailerId && retailerId !== "all") {
      query.retailerId = retailerId;
    } else if (searchTerm) {
      query.search = searchTerm;
    }

    if (stateId && stateId !== "all") {
      query.stateId = stateId;
    }
    const params = new URLSearchParams(query).toString();
    const url = `${BACKEND_URL}/api/v1/db-transaction/all-transactions-report?${params}`;

    // window.open(url, "_blank");

    // Use downloadFile utility for CSV export
    downloadFile({
      url: url,
      queryParams: params,
      fileName: "reward-transactions.csv",
    });
  };

  const debouncedFetchDistributorTransactions = useDebounce(
    fetchDistributorTransactions,
    500,
  );

  useEffect(() => {
    debouncedFetchDistributorTransactions();
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
    distributorId,
    stateId,
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
    stateId,
  ]);

  // useEffect(() => {
  //   getOutletList();
  //   dispatch(fetchDistributors());
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDistributors());
    dispatch(fetchStates());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    fetchMissingData();
  }, []);

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
    setDistributorId("all");
    setStateId("all");
    setTransactionList([]);
    fetchMissingData();
  };

  const handleRefetchTransactions = async (transactionId) => {
    setTransactionLoading(true);
    try {
      await toast.promise(updateDistributorTransaction(transactionId), {
        loading: `Updating transaction...`,
        success: () => "Transaction updated successfully",
        error: (err) =>
          err?.response?.data?.message || "Failed to update transaction",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setTransactionLoading(false);
      debouncedFetchDistributorTransactions();
    }
  };

  const handleCreateTransaction = async () => {
    setCreateLoading(true);
    try {
      await toast.promise(createDistributorTransaction(createFormData), {
        loading: `Creating transaction...`,
        success: () => "Transaction created successfully",
        error: (err) =>
          err?.response?.data?.message || "Failed to create transaction",
      });

      // Reset form and close modal
      setCreateFormData({
        distributorId: "",
        point: "",
        transactionFor: "",
        transactionType: "",
        Remarks: "",
      });
      setShowCreateModal(false);
      debouncedFetchDistributorTransactions();
    } catch (error) {
      console.error(error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateFormChange = (field, value) => {
    setCreateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isCreateFormValid = () => {
    return (
      createFormData.distributorId &&
      createFormData.point &&
      createFormData.transactionFor &&
      createFormData.transactionType &&
      createFormData.Remarks
    );
  };

  const handleBulkRetry = async () => {
    setTransactionLoading(true);

    try {
      await toast.promise(
        bulkRetryDistributorTransactions(), // ✔ no payload sent
        {
          loading: "Retrying all failed transactions...",
          success: "Bulk retry triggered successfully",
          error: (err) => err?.response?.data?.message || "Bulk retry failed!",
        },
      );
    } catch (error) {
      console.error(error);
    } finally {
      setTransactionLoading(false);
      debouncedFetchDistributorTransactions();
    }
  };

  const handleSyncAll = async () => {
    setTransactionLoading(true);
    try {
      await toast.promise(bulkSyncRetailerOutletTransactions(), {
        loading: "Syncing retailer outlet transactions...",
        success: "Sync completed successfully",
        error: (err) => err?.response?.data?.message || "Sync failed!",
      });
      // After sync, refetch missing data
      fetchMissingData();
    } catch (error) {
      console.error(error);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleDeleteTransaction = (transaction) => {
    openConfirmationModel({
      question: `Are you sure you want to delete this transaction for ${transaction.distributorId.name} with RBP - ${transaction.distributorId.RBPSchemeMapped} and Delete Retailer Transaction - ${transaction.retailerOutletTransactionId?.transactionId}?`,
      answer: ["Yes", "No"],
      onClose: async (confirmed) => {
        if (!confirmed) return;

        const distributorTxnId = transaction._id;
        const retailerTxnId = transaction?.retailerOutletTransactionId?._id;

        setDeletingTransactions((prev) => {
          const newSet = new Set(prev);
          newSet.add(distributorTxnId);
          return newSet;
        });

        try {
          const deletePromises = [
            deleteDistributorTransaction(distributorTxnId),
          ];

          // delete retailer transaction only if exists
          if (retailerTxnId) {
            deletePromises.push(DeleteRetailerTransaction(retailerTxnId));
          }

          await Promise.all(deletePromises);

          toast.success("Transaction deleted successfully");
          debouncedFetchDistributorTransactions();
        } catch (error) {
          console.error("Delete transaction error:", error);
          toast.error("Failed to delete transaction");
        } finally {
          setDeletingTransactions((prev) => {
            const newSet = new Set(prev);
            newSet.delete(distributorTxnId);
            return newSet;
          });
        }
      },
    });
  };

  const handleOpenEditModal = (transaction) => {
    const retailerId =
      transaction?.retailerId?._id ||
      transaction?.salesReturnId?.retailerId ||
      "";

    setEditFormData({
      _id: transaction._id,
      distributorId: transaction?.distributorId?._id || "",
      retailerId,
      transactionType: transaction?.transactionType || "",
      transactionFor: transaction?.transactionFor || "",
      point: transaction?.point || "",
      Remarks: transaction?.remark || "",
      createdAt: transaction?.createdAt ? new Date(transaction.createdAt).toISOString().split('T')[0] : "",
      updatedAt: transaction?.updatedAt ? new Date(transaction.updatedAt).toISOString().split('T')[0] : "",
    });

    setShowEditModal(true);
  };

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col w-full">
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Distributors Transactions</h1>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sizing={"sm"}
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
                    {/* These options must match your Mongoose enum */}
                    <option value="GRN">GRN</option>
                    <option value="SALES">SALES</option>
                    <option value="Sales Return">Sales Return</option>
                    <option value="Purchase Return">Purchase Return</option>
                    <option value="Opening Points">Opening Stock Point</option>
                    <option value="Manual Stock Point">Manual Stock Point</option>
                    <option value="Adjustment Point">
                      Adjustment Stock Point
                    </option>
                    <option value="Sales Multiplier">Sales Multiplier</option>
                    <option value="other">Other</option>
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

                {/* Search Transaction */}

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
                    defaultValue="all"
                  />
                </div>

                {/* State Filter */}
                <div className="w-44">
                  <div className="block">
                    <Label value="State" />
                  </div>
                  <SearchableSelect
                    id="stateId"
                    options={activeStates}
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                    placeholder="Select State"
                    displayKey="name"
                    disabled={statesLoading || pageLoading}
                    valueKey="_id"
                    descKey="code"
                    label="State Name"
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
                      {pagePermission?.create && (
                        <Button
                          size="xs"
                          color="blue"
                          onClick={() => setShowCreateModal(true)}
                        >
                          <span className="flex justify-center items-center gap-2">
                            <FaPlus size={14} />
                            Create Transaction
                          </span>
                        </Button>
                      )}
                      {pagePermission?.view && (
                        <Button
                          size="xs"
                          color="purple"
                          onClick={() => downloadReport()}
                        >
                          <span className="flex justify-center items-center gap-2">
                            <FaDownload size={15} />
                            Download Transactions
                          </span>
                        </Button>
                      )}
                    </>
                  ) : null}
                </div>
                <div>
                  {pagePermission?.update && (
                    <Button
                      size="xs"
                      color="warning"
                      onClick={handleBulkRetry}
                      disabled={trasactionLoading}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <RiRefreshFill size={15} />
                        Bulk Retry All Failed
                      </span>
                    </Button>
                  )}
                </div>
                <div></div>
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

          <div className="w-full flex justify-center items-center gap-4 p-2">
            <Badge color="red">Retailer Sales Missing: {missingData.salesMissing}</Badge>
            <Badge color="red">
              Retailer Sales Return Missing: {missingData.salesReturnMissing}
            </Badge>
            {pagePermission?.update && (
              <Button
                size="xs"
                color="blue"
                onClick={handleSyncAll}
                disabled={trasactionLoading}
              >
                Sync All
              </Button>
            )}
          </div>

          <div className="flex justify-center w-full items-center gap-2 flex-wrap p-2 mt-4">
            <div className="overflow-x-auto w-full">
              <Table striped className="rounded-none text-xs">
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Transaction ID
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Distributor
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
                    Retailer
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Retailer Transaction
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
                    Purchase Return No
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
                          <Table.Cell
                            className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                ele?.distributorId.dbCode,
                              );
                              toast.success("DB Code copied to clipboard");
                            }}
                          >
                            {ele?.distributorId.name} ({ele?.distributorId.dbCode}
                            )
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
                              {ele?.balance}
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
                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={`${ele?.status === "Failed" &&
                                  (ele?.transactionFor === "SALES" ||
                                    ele?.transactionFor === "Sales Return")
                                  ? "cursor-pointer"
                                  : ""
                                  }`}
                                onClick={() => {
                                  if (
                                    ele?.status === "Failed" &&
                                    (ele?.transactionFor === "SALES" ||
                                      ele?.transactionFor === "Sales Return")
                                  ) {
                                    alert(
                                      JSON.stringify(ele?.apiResponse, null, 2),
                                    );
                                  }
                                }}
                              >
                                {ele?.status}
                              </span>

                              {ele?.status === "Failed" &&
                                (ele?.transactionFor === "SALES" ||
                                  ele?.transactionFor === "Sales Return") &&
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
                            {ele?.retailerId?.outletName && (
                              <>
                                {ele?.retailerId?.outletName}
                                (
                                <UniqueCode
                                  text={ele?.retailerId?.outletUID}
                                  codeName={"Retailer ID"}
                                />
                                )
                              </>
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {ele?.retailerId?.outletName &&
                              ele?.retailerOutletTransactionId?.transactionId ? (
                              <UniqueCode
                                text={
                                  ele?.retailerOutletTransactionId?.transactionId
                                }
                                codeName={"Retailer Transaction ID"}
                              />
                            ) : (ele?.transactionFor === "SALES" ||
                              ele?.transactionFor === "Sales Return") &&
                              !ele?.retailerOutletTransactionId?.transactionId &&
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
                                  text={
                                    ele?.billId?.new_billno ||
                                    ele?.billId?.billNo?.toUpperCase()
                                  }
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
                            <div className="flex items-center justify-center gap-2">
                              {ele?.purchaseReturnId?.code ? (
                                <UniqueCode
                                  text={ele?.purchaseReturnId?.code?.toUpperCase()}
                                  codeName={"Purchase Return No"}
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
                            <Table.Cell className="flex justify-center items-center gap-3">
                              {pagePermission?.update && (
                                <FaPen
                                  size={18}
                                  className="cursor-pointer text-blue-500 hover:text-blue-700"
                                  title="Edit Transaction"
                                  onClick={() => handleOpenEditModal(ele)}
                                />
                              )}
                              {pagePermission?.delete && (
                                deletingTransactions.has(ele._id) ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <FaTrash
                                    size={18}
                                    className="cursor-pointer text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteTransaction(ele)}
                                  />
                                )
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

      {/* Create Transaction Modal */}
      {pagePermission?.create && (
        <Modal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          size="lg"
        >
          <Modal.Header>Create Reward Transaction</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              {/* Distributor Selection */}
              <div>
                <Label htmlFor="modal-distributorId" value="Distributor *" />
                <SearchableSelect
                  id="modal-distributorId"
                  options={activeDistributors}
                  value={createFormData.distributorId}
                  onChange={(e) =>
                    handleCreateFormChange("distributorId", e.target.value)
                  }
                  placeholder="Select Distributor"
                  displayKey="name"
                  disabled={distributorsLoading || createLoading}
                  valueKey="_id"
                  descKey="dbCode"
                  label="Distributor Name"
                  className="w-full"
                />
              </div>

              {/* Transaction Type */}
              <div>
                <Label
                  htmlFor="modal-transactionType"
                  value="Transaction Type *"
                />
                <Select
                  id="modal-transactionType"
                  value={createFormData.transactionType}
                  onChange={(e) =>
                    handleCreateFormChange("transactionType", e.target.value)
                  }
                  disabled={createLoading}
                >
                  <option value="">Select Transaction Type</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </Select>
              </div>

              {/* Transaction For */}
              <div>
                <Label htmlFor="modal-transactionFor" value="Transaction For *" />
                <Select
                  id="modal-transactionFor"
                  value={createFormData.transactionFor}
                  onChange={(e) =>
                    handleCreateFormChange("transactionFor", e.target.value)
                  }
                  disabled={createLoading}
                >
                  <option value="">Select Transaction For</option>
                  <option value="Opening Points">Opening Points</option>
                  <option value="Manual Stock Point">Manual Stock Point</option>
                  <option value="Adjustment Point">Adjustment Point</option>
                </Select>
              </div>

              {/* Points */}
              <div>
                <Label htmlFor="modal-point" value="Points *" />
                <TextInput
                  id="modal-point"
                  type="number"
                  placeholder="Enter points"
                  value={createFormData.point}
                  onChange={(e) =>
                    handleCreateFormChange("point", e.target.value)
                  }
                  disabled={createLoading}
                  min="0"
                  step="1"
                />
              </div>

              {/* Remarks */}
              <div>
                <Label htmlFor="modal-remarks" value="Remarks *" />
                <Textarea
                  id="modal-remarks"
                  placeholder="Enter remarks"
                  value={createFormData.Remarks}
                  onChange={(e) =>
                    handleCreateFormChange("Remarks", e.target.value)
                  }
                  disabled={createLoading}
                  rows={3}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={handleCreateTransaction}
              disabled={!isCreateFormValid() || createLoading}
            >
              {createLoading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Creating...</span>
                </>
              ) : (
                "Create Transaction"
              )}
            </Button>
            <Button
              color="gray"
              onClick={() => setShowCreateModal(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit Transaction Modal */}
      {pagePermission?.update && (
        <DisTransactionEditModal
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          editLoading={editLoading}
          setEditLoading={setEditLoading}
          onSuccess={debouncedFetchDistributorTransactions}
          activeDistributors={activeDistributors}
        />
      )}
    </div>
  );
};

export default AllRewardTransactions;