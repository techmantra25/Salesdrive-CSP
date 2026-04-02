import {
  Badge,
  Button,
  Card,
  Label,
  Pagination,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiRefreshFill } from "react-icons/ri";
import Datepicker from "react-tailwindcss-datepicker";
import UniqueCode from "../../assets/common/UniqueCode";
import { useDispatch, useSelector } from "react-redux";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchDistributors } from "../../redux/distributorListSlice";
import SearchableSelect from "../../components/SearchableSelect";
import { AllDBpaginatedOrderList } from "../../api/orderApi";
import { getApprovedOutletList, ApprovedOutletPaginated,SearchOutletsDropdown } from "../../api/api";
import PaginatedSearchableSelect from "../../components/PaginatedSearchableSelect";
import { getPagePermission } from "../../utils/permissionHelper";

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
  const [salesOrdersLoading, setSalesOrdersLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  // const [outletList, setOutletList] = useState([]);

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

  // Add this function after your state declarations

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
  }, [currentPage, searchTerm, selectedDB, dateRange, selectedRetailer]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDB, dateRange, selectedRetailer]);

  // useEffect(() => {
  //   getOutletList();
  //   dispatch(fetchDistributors());
  // }, [dispatch]);

  // const downloadReport = async () => {
  //   const query = {};

  //   if (searchTerm) {
  //     query.search = searchTerm.trim();
  //   }

  //   if (dateRange.startDate && dateRange.endDate) {
  //     query.fromDate = dateRange.startDate;
  //     query.toDate = dateRange.endDate;
  //   }

  //   if (selectedDB && selectedDB !== "default") {
  //     query.distributorId = selectedDB;
  //   }

  //   if (selectedRetailer && selectedRetailer !== "default") {
  //     query.retailerId = selectedRetailer;
  //   }
  //   const params = new URLSearchParams(query).toString();
  //   const url = `${BACKEND_URL}/api/v1/external/secondary-order-entry-log-report?${params}`;

  //   window.open(url, "_blank");
  // };

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
                    descKey="outletUID"
                    valueKey="_id"
                    searchPlaceholder="Search Retailer..."
                  />
                </div>

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
                {/* <Button size="sm" color="purple" onClick={() => downloadReport()}>
                  <span className="flex justify-center items-center gap-2">
                    <FaDownload size={15} />
                    CSV Download
                  </span>
                </Button> */}
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
                                  text={order?.retailerId?.outletUID}
                                  codeName={"Retailer ID"}
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