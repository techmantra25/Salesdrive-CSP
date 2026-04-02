import { Badge, Button, Card, Label, Select, Spinner } from "flowbite-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import { processShadowMultiplier } from "../../../api/retailerMultiplierShadowApi";
import { RiRefreshFill } from "react-icons/ri";
import { retailerMultiplierTransactionList } from "../../../api/rewardsApi";
import PaginatedSearchableSelect from "../../../components/PaginatedSearchableSelect";
import { BACKEND_URL } from "../../../constants";
import { useDebounce } from "../../../hooks/useDebounce";
import { SearchOutletsDropdown } from "../../../api/api";
import { downloadFile } from "../../../utils/downloadFile";

const MultiplierHistoryReport = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [filteredCount, setFilteredCount] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [transactionFor, setTransactionFor] = useState("all");
  const [retailerId, setRetailerId] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchingRetailer, setIsSearchingRetailer] = useState(false);
  const [shadowLoading, setShadowLoading] = useState(false);

  const handleRunShadowMultiplier = async () => {
    if (
      !retailerId ||
      retailerId.length === 0 ||
      !selectedMonth ||
      selectedMonth === "all" ||
      !selectedYear ||
      selectedYear === "all"
    ) {
      toast.error("Please select retailer(s), month, and year.");
      return;
    }
    setShadowLoading(true);
    try {
      let payload = {
        month: Number(selectedMonth),
        year: Number(selectedYear),
      };
      if (retailerId.includes("all")) {
        payload.allRetailers = true;
      } else if (retailerId.length === 1) {
        payload.retailerId = retailerId[0];
      } else {
        payload.retailerIds = retailerId;
      }
      const response = await processShadowMultiplier(payload);
      toast.success(
        response?.data?.message || "Shadow Multiplier processed successfully",
      );
      if (response?.data?.details) {
        toast(
          (t) => (
            <div>
              <div className="font-bold">Details:</div>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(response.data.details, null, 2)}
              </pre>
            </div>
          ),
          { duration: 8000 },
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to process shadow multiplier",
      );
    } finally {
      setShadowLoading(false);
    }
  };

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

  const currentYear = moment().year();
  const years = [];
  for (let y = 2024; y <= currentYear; y++) {
    years.push(y);
  }

  const handleSearch = useCallback(async (searchValue) => {
    if (!searchValue || searchValue.trim().length === 0) {
      setIsSearchingRetailer(false);
      setRetailerId([]);
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
        setRetailerId([retailers[0]._id]);
        setIsSearchingRetailer(true);
      } else {
        setIsSearchingRetailer(false);
        setRetailerId([]);
      }
    } catch (error) {
      console.error("error searching retailers", error);
      setIsSearchingRetailer(false);
      setRetailerId([]);
    }
  }, []);

  const debouncedSearch = useDebounce(handleSearch, 500);

  useEffect(() => {
    debouncedSearch(searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchOutletsWithSearch = useCallback(
    async (searchTerm = "", page = 1) => {
      try {
        const query = {
          page: page,
          limit: 50,
          ...(searchTerm && { search: searchTerm }),
        };

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

      const query = {
        page: currentPage,
        limit: 30,
      };

      if (dateRange?.startDate && dateRange?.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      if (transactionFor !== "all") {
        query.transactionFor = transactionFor;
      }

      if (selectedMonth && selectedMonth !== "all") {
        query.month = selectedMonth;
      }
      if (selectedYear && selectedYear !== "all") {
        query.year = selectedYear;
      }
      if (retailerId && retailerId.length === 1) {
        query.retailerId = retailerId[0];
      } else if (retailerId && retailerId.length > 1) {
        query.retailerIds = retailerId;
      } else if (searchTerm && searchTerm.trim()) {
        query.search = searchTerm.trim();
      }
      const response = await retailerMultiplierTransactionList(query);

      setFilteredCount(response?.data?.pagination?.filteredCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Retailer Multiplier Transactions History",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const debouncedFetchRetailerTransactions = useDebounce(
    fetchRetailerTransactions,
    500,
  );

  useEffect(() => {
    debouncedFetchRetailerTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange,
    currentPage,
    searchTerm,
    isSearchingRetailer,
    transactionFor,
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
    transactionFor,
    retailerId,
    selectedMonth,
    selectedYear,
  ]);

  const handleResetFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setTransactionFor("all");
    setSearchTerm("");
    setIsSearchingRetailer(false);
    setCurrentPage(1);
    setRetailerId([]);
    setSelectedMonth("all");
    setSelectedYear("all");
  };

  const downloadTransactionHistory = async () => {
    const query = {};

    if (dateRange?.startDate && dateRange?.endDate) {
      query.fromDate = dateRange.startDate;
      query.toDate = dateRange.endDate;
    }

    if (transactionFor !== "all") {
      query.transactionFor = transactionFor;
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

    if (retailerId && retailerId.length === 1) {
      query.retailerId = retailerId[0];
    } else if (retailerId && retailerId.length > 1) {
      query.retailerIds = retailerId;
    }
    const params = new URLSearchParams(query).toString();
    const url = `${BACKEND_URL}/api/v1/retailerMultiplier/download-retailer-multiplier-csv?${params}`;

    // window.open(url, "_blank");

    // Use downloadFile utility for CSV export
    downloadFile({
      url: url,
      queryParams: params,
      fileName: "multiplier-history-report.csv",
    });
  };

  return (
    <div>
      <div className="flex justify-start items-center flex-col w-full gap-4">
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">
              Multiplier Transactions History
            </h1>
          </div>
        </div>

        <div className="flex justify-start items-center flex-col gap-2 w-full p-2">
          <Card className="w-full flex justify-center items-center flex-col">
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              {!pageLoading && (
                <Badge color="warning">Count: {filteredCount}</Badge>
              )}
            </div>
            <div className="flex justify-center w-full items-end gap-2 flex-wrap">
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
                  multiple={true}
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
                  <option value="Volume Multiplier">Volume Multiplier</option>
                  <option value="Bill Volume Multiplier">
                    Bill Volume Multiplier
                  </option>
                  <option value="Consistency Multiplier">
                    Consistency Multiplier
                  </option>
                  <option value="Sales Return">Sales Return</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  className="text-xs text-white"
                  size="xs"
                  color="success"
                  onClick={handleResetFilter}
                  disabled={shadowLoading}
                >
                  <span className="flex justify-center items-center gap-2">
                    <RiRefreshFill size={18} />
                    Reset Filters
                  </span>
                </Button>

                <Button
                  size="xs"
                  color="purple"
                  onClick={() => downloadTransactionHistory()}
                  disabled={shadowLoading}
                >
                  <span className="flex justify-center items-center gap-2">
                    <FaDownload size={15} />
                    Monthly Transaction History
                  </span>
                </Button>

                <Button
                  size="xs"
                  color="warning"
                  onClick={handleRunShadowMultiplier}
                  disabled={shadowLoading}
                >
                  <span className="flex justify-center items-center gap-2">
                    {shadowLoading && <Spinner size="sm" />}
                    Run Shadow Multiplier
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MultiplierHistoryReport;
