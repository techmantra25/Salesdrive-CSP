import {
  Badge,
  Button,
  Card,
  Label,
  Pagination,
  Spinner,
  Table,
  TextInput,
  Select,
} from "flowbite-react";
import moment from "moment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { RiRefreshFill } from "react-icons/ri";
import { HiChevronDown } from "react-icons/hi";
import Datepicker from "react-tailwindcss-datepicker";
import UniqueCode from "../../assets/common/UniqueCode";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchDistributors } from "../../redux/distributorListSlice";
import SearchableSelect from "../../components/SearchableSelect";
import { AllDBpaginatedOrderList } from "../../api/orderApi";
import {
  getApprovedOutletList,
  ApprovedOutletPaginated,
  SearchOutletsDropdown,
  viewGodownList,
  AllZoneList,
} from "../../api/api";
import PaginatedSearchableSelect from "../../components/PaginatedSearchableSelect";
import { getPagePermission } from "../../utils/permissionHelper";


const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  loading,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setSearchTerm("");
    }
  }, [open]);

  const toggleOption = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const displayText = loading
    ? "Loading..."
    : selected.length === 0
      ? "All"
      : selected.length === options.length
        ? "All"
        : `${selected.length} selected`;

  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;

    const searchableText = [opt.label].filter(Boolean).join(" ").toLowerCase();

    const keywords = searchTerm.toLowerCase().trim().split(/\s+/);

    return keywords.every((keyword) => searchableText.includes(keyword));
  });

  return (
    <div className="w-56 relative" ref={containerRef}>
      <div className="block">
        <Label value={label} className="dark:text-white" />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((prev) => !prev)}
        className="relative block w-full p-2.5 pr-8 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-left focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {displayText}
        <HiChevronDown
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
          size={18}
        />
      </button>

      {open && !loading && (
        <div className="absolute z-50 mt-1 w-72 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg text-sm">
          <div className="p-1.5 border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${label}...`}
              className="w-full py-1 px-2 text-xs border border-gray-300 dark:border-gray-500 rounded-sm bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white/80 focus:outline-none focus:ring-1 focus:border-cyan-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <ul className="max-h-96 overflow-y-auto py-1">
            <li
              onClick={() => onChange([])}
              className={`px-4 py-1.5 cursor-pointer select-none ${selected.length === 0
                ? "bg-blue-600 text-white"
                : "text-gray-900 dark:text-white/80 hover:bg-blue-100 dark:hover:bg-gray-600"
                }`}
            >
              All
            </li>
            {filteredOptions.length === 0 && (
              <li className="px-4 py-1.5 text-gray-400 select-none">
                No results found
              </li>
            )}
            {filteredOptions.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <li
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`px-4 py-1.5 cursor-pointer select-none ${isSelected
                    ? "bg-blue-600 text-white"
                    : "text-gray-900 dark:text-white/80 hover:bg-blue-100 dark:hover:bg-gray-600"
                    }`}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

// Order status values as seen on distributor orders (order.status), same
// enum used by the Sales Order list.
const STATUS_OPTIONS = [
  { id: "Pending", label: "Pending" },
  { id: "Completed_Billed", label: "Completely Billed" },
  { id: "Partially_Billed", label: "Partially Billed" },
  { id: "Cancelled", label: "Cancelled" },
];

const AllDistributorOrderList = () => {
  const [dataLoading, setDataLoading] = useState(true);
  const [allDBOrders, setAllDBOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDB, setSelectedDB] = useState("default");
  const [selectedRetailer, setSelectedRetailer] = useState("default");
  const [godownList, setGodownList] = useState([]);
  const [selectedGodown, setSelectedGodown] = useState("");
  const [salesOrdersLoading, setSalesOrdersLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  // const [outletList, setOutletList] = useState([]);

  // Multi-select filters (arrays of ids), same pattern as the Sales Order list
  const [salesman, setSalesman] = useState([]);
  const [cso, setCso] = useState([]);
  const [route, setRoute] = useState([]);
  const [zone, setZone] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);

  const [zoneList, setZoneList] = useState([]);
  const [zoneLoading, setZoneLoading] = useState(false);

  const { distributors } = useSelector((state) => state.distributors);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "db-orders-list"
    );

    setPagePermission(permission);
  }, [permissionState]);

  const fetchOutletsWithSearch = useCallback(
    async (searchTerm = "", page = 1) => {
      try {
        const query = {
          page: page,
          limit: 50,
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
          "Failed to fetch outlet list"
        );
        return { data: [], hasMore: false };
      }
    },
    []
  );

  const fetchGodownList = async () => {
    try {
      const response = await viewGodownList({
        page: 1,
        limit: 1000,
      });

      setGodownList(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch godown list:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch godown list"
      );
    }
  };

  const fetchZoneList = async () => {
    setZoneLoading(true);
    try {
      const response = await AllZoneList();
      setZoneList(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch zone list:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch zone list"
      );
    } finally {
      setZoneLoading(false);
    }
  };

  useEffect(() => {
    fetchGodownList();
    fetchZoneList();
  }, []);

  // Salesman / CSO / Route options are derived from the orders currently
  // loaded (same approach the Sales Order list uses for CSO), since there's
  // no distributor-agnostic salesman/route directory available here.
  const salesmanOptions = useMemo(() => {
    const uniqueSalesmen = new Map();
    allDBOrders?.forEach((o) => {
      const s = o?.salesmanName;
      if (s?._id && !uniqueSalesmen.has(s._id)) {
        uniqueSalesmen.set(s._id, s.name);
      }
    });
    return Array.from(uniqueSalesmen.entries()).map(([id, label]) => ({
      id,
      label,
    }));
  }, [allDBOrders]);

  const csoOptions = useMemo(() => {
    const uniqueCso = new Map();
    allDBOrders?.forEach((o) => {
      const c = o?.retailerId?.cso;
      if (c) uniqueCso.set(c, c);
    });
    return Array.from(uniqueCso.keys()).map((code) => ({
      id: code,
      label: code,
    }));
  }, [allDBOrders]);

  const routeOptions = useMemo(() => {
    const uniqueRoutes = new Map();
    allDBOrders?.forEach((o) => {
      const r = o?.routeId;
      if (r?._id && !uniqueRoutes.has(r._id)) {
        uniqueRoutes.set(r._id, `${r.name}${r.code ? ` (${r.code})` : ""}`);
      }
    });
    return Array.from(uniqueRoutes.entries()).map(([id, label]) => ({
      id,
      label,
    }));
  }, [allDBOrders]);

  const zoneOptions =
    zoneList?.map((z) => ({
      id: z._id,
      label: z.name,
    })) || [];

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const onPageChange = (page) => setCurrentPage(page);

  let fetchSalesOrdersLogPaginatedWithOutDebounce = async () => {
    try {
      setSalesOrdersLoading(true);
      const query = {
        page: currentPage,
        limit: 50,
      };

      if (searchTerm) {
        query.search = searchTerm.trim();
      }

      if (dateRange.startDate && dateRange.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      if (selectedDB && selectedDB !== "default") {
        query.distributorId = selectedDB;
      }
      if (selectedRetailer && selectedRetailer !== "default") {
        query.retailerId = selectedRetailer;
      }
      if (selectedGodown) {
        query.godownId = selectedGodown;
      }
      if (salesman.length > 0) {
        query.salesmanName = salesman.join(",");
      }
      if (cso.length > 0) {
        query.cso = cso.join(",");
      }
      if (route.length > 0) {
        query.routeId = route.join(",");
      }
      if (zone.length > 0) {
        query.zoneId = zone.join(",");
      }
      if (orderStatus.length > 0) {
        query.status = orderStatus.join(",");
      }
      const response = await AllDBpaginatedOrderList(query); // Use mock API for demonstration

      setAllDBOrders(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalItems);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Sales Orders"
      );
    } finally {
      setSalesOrdersLoading(false);
    }
  };

  let fetchSalesOrdersLogPaginated = useDebounce(
    fetchSalesOrdersLogPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setSearchTerm("");
    setSelectedDB("default");
    setSelectedRetailer("default");
    setSelectedGodown("");
    setSalesman([]);
    setCso([]);
    setRoute([]);
    setZone([]);
    setOrderStatus([]);
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
    fetchSalesOrdersLogPaginated();
  };

  useEffect(() => {
    fetchSalesOrdersLogPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    searchTerm,
    selectedDB,
    dateRange,
    selectedRetailer,
    selectedGodown,
    salesman,
    cso,
    route,
    zone,
    orderStatus,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedDB,
    dateRange,
    selectedRetailer,
    selectedGodown,
    salesman,
    cso,
    route,
    zone,
    orderStatus,
  ]);

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Distributor Orders List</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count : {totalItems} </Badge>
                <Badge color="warning">Filtered Count : {filteredCount} </Badge>
              </div>
              {/* filter div */}
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
                {/* Distributor Filter */}
                <div className="w-56">
                  <Label value="Select Distributor" />
                  <SearchableSelect
                    id="distributor-select"
                    className="w-full"
                    options={distributors}
                    value={selectedDB}
                    onChange={(e) => setSelectedDB(e.target.value)}
                    placeholder="Select Distributor"
                    displayKey="name"
                    descKey="dbCode"
                    valueKey="_id"
                    defaultValue="default"
                  />
                </div>

                <div className="w-56">
                  <Label value="Select Retailer" />
                  <PaginatedSearchableSelect
                    id="retailer-select"
                    className="w-full"
                    fetchOptions={fetchOutletsWithSearch}
                    value={selectedRetailer}
                    onChange={(e) => setSelectedRetailer(e.target.value)}
                    disabled={salesOrdersLoading}
                    placeholder="Select Retailer"
                    displayKey="outletName"
                    descKey="outletCode"
                    valueKey="_id"
                    searchPlaceholder="Search Retailer..."
                  />
                </div>

                <div className="w-56">
                  <Label value="Godown" />
                  <Select
                    value={selectedGodown}
                    onChange={(e) => setSelectedGodown(e.target.value)}
                  >
                    <option value="">All Godown</option>
                    {godownList?.map((godown) => (
                      <option key={godown?._id} value={godown?._id}>
                        {godown?.godownName}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Zone */}
                <MultiSelectDropdown
                  label="Zone"
                  options={zoneOptions}
                  selected={zone}
                  onChange={setZone}
                  loading={zoneLoading}
                />

                {/* Salesman */}
                <MultiSelectDropdown
                  label="Salesman"
                  options={salesmanOptions}
                  selected={salesman}
                  onChange={setSalesman}
                  loading={salesOrdersLoading}
                />

                {/* CSO
                <MultiSelectDropdown
                  label="CSO"
                  options={csoOptions}
                  selected={cso}
                  onChange={setCso}
                  loading={salesOrdersLoading}
                /> */}

                {/* Route */}
                <MultiSelectDropdown
                  label="Route"
                  options={routeOptions}
                  selected={route}
                  onChange={setRoute}
                  loading={salesOrdersLoading}
                />

                {/* Order Status */}
                <MultiSelectDropdown
                  label="Order Status"
                  options={STATUS_OPTIONS}
                  selected={orderStatus}
                  onChange={setOrderStatus}
                  loading={false}
                />

                <div className="w-56">
                  <div className="block">
                    <Label value="Search" />
                  </div>
                  <TextInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search"
                  />
                </div>
                <div className="w-64">
                  <div className="block">
                    <Label
                      htmlFor="dateRangeSelect"
                      value="Created At Date Range"
                    />
                  </div>
                  <Datepicker
                    showShortcuts={true}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                  />
                </div>
              </div>
              {/* btns */}
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="success"
                    onClick={handleResetFilter}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <RiRefreshFill size={20} />
                      Reset & Refresh
                    </span>
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="flex justify-end items-center w-full px-4 ">
            <div className="flex overflow-x-auto sm:justify-center">
              {!salesOrdersLoading && filteredCount > 10 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  showIcons
                />
              )}
            </div>
          </div>

          {/* table */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <div className="overflow-x-auto w-full">
              <Table striped>
                <Table.Head className="text-center">
                  <Table.HeadCell>Order NO</Table.HeadCell>
                  <Table.HeadCell>Distributor</Table.HeadCell>
                  <Table.HeadCell>Retailer</Table.HeadCell>
                  <Table.HeadCell>Sales Man</Table.HeadCell>
                  <Table.HeadCell>Route</Table.HeadCell>
                  <Table.HeadCell>Godown</Table.HeadCell>
                  <Table.HeadCell>Order Status</Table.HeadCell>
                  <Table.HeadCell>Net Amount</Table.HeadCell>
                  <Table.HeadCell>No of Bills</Table.HeadCell>
                  <Table.HeadCell>Bill Amount</Table.HeadCell>
                  <Table.HeadCell>Created Date</Table.HeadCell>
                  <Table.HeadCell>Updated At</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {salesOrdersLoading ? (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="16"
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
                      {allDBOrders?.map((order) => (
                        <Table.Row
                          key={order?._id}
                          className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={order?.orderNo}
                              codeName="Order No"
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order?.distributorId?.name && (
                              <>
                                {order?.distributorId?.name}
                                (
                                <UniqueCode
                                  text={order?.distributorId?.name}
                                  codeName={"DB Code"}
                                />
                                )
                              </>
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order?.retailerId?.outletName && (
                              <>
                                {order?.retailerId?.outletName}
                                (
                                <UniqueCode
                                  text={order?.retailerId?.outletCode}
                                  codeName={"Retailer Code"}
                                />
                                )
                              </>
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order?.salesmanName?.name}(
                            {order?.salesmanName?.empId})
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order?.routeId?.name}({order?.routeId?.code})
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order?.godownId?.godownName || "-"}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order?.status}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            ₹{order?.netAmount?.toLocaleString("en-IN")}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order?.billIds?.length > 0 ? (
                              <span className="flex items-center justify-center gap-1 text-sm">
                                {order.billIds.length} Bills
                              </span>
                            ) : null}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span className="">
                              {order?.billIds?.length > 0 &&
                                `₹${order?.billIds
                                  .filter((bill) => bill?.status !== "Cancelled")
                                  ?.reduce(
                                    (acc, bill) => acc + bill?.netAmount,
                                    0
                                  )
                                  .toLocaleString("en-IN")}`}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {moment(order?.createdAt)
                              .tz("Asia/Kolkata")
                              .format("LLL")}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {moment(order?.updatedAt)
                              .tz("Asia/Kolkata")
                              .format("LLL")}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {allDBOrders?.length === 0 && (
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
    </>
  );
};

export default AllDistributorOrderList;