import toast from "react-hot-toast";
import { useDebounce } from "../../hooks/useDebounce";
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
  Modal, // Import Modal
} from "flowbite-react";
import { RiRefreshFill } from "react-icons/ri";
import UniqueCode from "../../assets/common/UniqueCode";
import {
  getSalesOrderEntryLog,
  getInactiveOutletOrder,
} from "../../api/salesApi";
import Datepicker from "react-tailwindcss-datepicker";
import { useEffect, useState } from "react";
import moment from "moment";
import { FaDownload, FaRegCopy } from "react-icons/fa";
import { BACKEND_URL } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import { fetchDistributors } from "../../redux/distributorListSlice";
import SearchableSelect from "../../components/SearchableSelect";
import { getPagePermission } from "../../utils/permissionHelper";
import { downloadFile } from "../../utils/downloadFile";
import { setAuthHeader } from "../../api/api";


const SalesOrderLog = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("default");
  const [selectedDBCode, setSelectedDBCode] = useState("default");
  const [salesOrdersLoading, setSalesOrdersLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [originalOrderDateRange, setOriginalOrderDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // New state for modal
  const [openOrderDataModal, setOpenOrderDataModal] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [inactiveOutletLoading, setInactiveOutletLoading] = useState(false);
  const { distributors } = useSelector((state) => state.distributors);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "sales-order-log"
    );

    setPagePermission(permission);
  }, [permissionState]);


  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleOriginalOrderDateRangeChange = (range) => {
    setOriginalOrderDateRange(range);
  };

  const onPageChange = (page) => setCurrentPage(page);

  // Function to open the modal and set the data
  const handleViewOrderData = (orderId, orderData) => {
    setCurrentOrderId(orderId);
    setCurrentOrderData(orderData);
    setOpenOrderDataModal(true);
  };

  let fetchSalesOrdersLogPaginatedWithOutDebounce = async () => {
    try {
      setSalesOrdersLoading(true);
      const query = {
        page: currentPage,
        limit: 20,
      };

      if (selectedOrderStatus !== "default") {
        query.status = selectedOrderStatus;
      }

      if (searchTerm) {
        query.search = searchTerm.trim();
      }

      if (dateRange.startDate && dateRange.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }
      if (originalOrderDateRange.startDate && originalOrderDateRange.endDate) {
        query.originalStartDate = originalOrderDateRange.startDate;
        query.originalEndDate = originalOrderDateRange.endDate;
      }

      if (selectedDBCode && selectedDBCode !== "default") {
        query.dbCode = selectedDBCode;
      }
      const response = await getSalesOrderEntryLog(query); // Use mock API for demonstration

      setSalesOrders(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalActiveCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Sales Orders",
      );
    } finally {
      setSalesOrdersLoading(false);
    }
  };

  let fetchSalesOrdersLogPaginated = useDebounce(
    fetchSalesOrdersLogPaginatedWithOutDebounce,
    500,
  );

  const handleResetFilter = () => {
    setSelectedOrderStatus("default");
    setSearchTerm("");
    setSelectedDBCode("default");
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setOriginalOrderDateRange({
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
    fetchSalesOrdersLogPaginated();
  };

  function isOlderThan7Days(dateStr) {
    // Parse the date in Asia/Kolkata timezone
    const orderDate = moment.tz(dateStr, "DD/MM/YYYY", "Asia/Kolkata");
    const now = moment.tz("Asia/Kolkata");
    return now.diff(orderDate, "days") > 7;
  }

  useEffect(() => {
    fetchSalesOrdersLogPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedOrderStatus,
    searchTerm,
    selectedDBCode,
    dateRange,
    originalOrderDateRange,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedOrderStatus,
    searchTerm,
    selectedDBCode,
    dateRange,
    originalOrderDateRange,
  ]);

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  const handleCopyOrderData = () => {
    if (!currentOrderData) return;

    const textToCopy = JSON.stringify(currentOrderData, null, 2);

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Order data JSON copied to clipboard.");
      })
      .catch((err) => {
        console.error("Failed to copy order data: ", err);
        toast.error("Failed to copy Order Data JSON.");
      });
  };

  const [dateOrderFetchLoading, setDateOrderFetchLoading] = useState(false);

  const fetchDateOrder = async (date) => {
    setDateOrderFetchLoading(true);
    await toast.promise(
      (async () => {
        const response = await fetch(
          `${BACKEND_URL}/api/v1/external/fetch-sap-secondary-order-entry-data?date=${encodeURIComponent(
            date,
          )}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              ...setAuthHeader(),
            },
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch order data for the date");
        }
        // Optionally, refresh the table data
        await fetchSalesOrdersLogPaginated();
      })(),
      {
        loading: "Refetching order data...",
        success: "Order data refetched successfully!",
        error: (err) => err.message || "Failed to refetch order data.",
      },
    );
    setDateOrderFetchLoading(false);
  };

  const downloadReport = async () => {
    const query = {};
    if (selectedOrderStatus !== "default") {
      query.status = selectedOrderStatus;
    }

    if (searchTerm) {
      query.search = searchTerm.trim();
    }

    if (dateRange.startDate && dateRange.endDate) {
      query.fromDate = dateRange.startDate;
      query.toDate = dateRange.endDate;
    }
    if (originalOrderDateRange.startDate && originalOrderDateRange.endDate) {
      query.originalStartDate = originalOrderDateRange.startDate;
      query.originalEndDate = originalOrderDateRange.endDate;
    }

    if (selectedDBCode && selectedDBCode !== "default") {
      query.dbCode = selectedDBCode;
    }

    // Use downloadFile utility for CSV export
    downloadFile({
      url: `${BACKEND_URL}/api/v1/external/secondary-order-entry-log-report`,
      queryParams: query,
      fileName: "sales-order-log.csv",
    });
  };

  const handleInactiveOutletOrders = async () => {
    console.log("Fetching inactive outlet orders...");
    try {
      console.log("Setting loading state to true");
      setInactiveOutletLoading(true);
      const response = await getInactiveOutletOrder();
      console.log("Inactive Outlet Orders Response:", response?.data);

      if (response?.data?.success) {
        console.log("Processing inactive outlet orders data");
        const ordersData = response?.data?.data;

        if (Array.isArray(ordersData) && ordersData.length > 0) {
          // Store data in localStorage for the new tab
          localStorage.setItem(
            "inactiveOutletOrderData",
            JSON.stringify(ordersData),
          );

          // Open new tab with the report
          const newTab = window.open(
            "/admin/inactive-outlet-order-report",
            "_blank",
          );

          if (!newTab) {
            toast.error("Please allow popups for this site to view the report.");
            return;
          }

          toast.success(
            `Found ${ordersData.length} order(s) with inactive outlets!`,
          );
        } else {
          toast.info("No orders with inactive outlets found.");
        }
      } else {
        toast.error("Failed to fetch inactive outlet orders");
      }
    } catch (error) {
      console.error("Error fetching inactive outlet orders:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch inactive outlet orders",
      );
    } finally {
      setInactiveOutletLoading(false);
    }
  };

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Sales Order Log</h1>
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
                <div className="w-40">
                  <div className="block">
                    <Label htmlFor="statusSelect" value="Select Order Status" />
                  </div>
                  <Select
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                    id="statusSelect"
                    required
                  >
                    <option value="default">All</option>
                    <option value="Import_Success">Successfully Imported</option>
                    <option value="Import_Failed">Import Failed</option>
                    <option value="Issue_Resolved">Issue Resolved</option>
                  </Select>
                </div>

                {/* Distributor Filter */}
                <div className="w-56">
                  <Label value="Select Distributor" />
                  <SearchableSelect
                    id="distributor-select"
                    className="w-full"
                    options={distributors}
                    value={selectedDBCode}
                    onChange={(e) => setSelectedDBCode(e.target.value)}
                    placeholder="Select Distributor(s)"
                    displayKey="name"
                    descKey="dbCode"
                    valueKey="dbCode"
                    defaultValue="default"
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
                      htmlFor="originalOrderdateRangeSelect"
                      value="Original Order Date Range"
                    />
                  </div>
                  <Datepicker
                    showShortcuts={true}
                    value={originalOrderDateRange}
                    onChange={handleOriginalOrderDateRangeChange}
                  />
                </div>
                <div className="w-64">
                  <div className="block">
                    <Label
                      htmlFor="dateRangeSelect"
                      value="Last Fetched Date Range"
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
                {pagePermission?.view && (
                  <Button size="sm" color="purple" onClick={() => downloadReport()}>
                    <span className="flex justify-center items-center gap-2">
                      <FaDownload size={15} />
                      CSV Download
                    </span>
                  </Button>
                )}
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="failure"
                    onClick={handleInactiveOutletOrders}
                    disabled={inactiveOutletLoading}
                  >
                    <span className="flex justify-center items-center gap-2">
                      {inactiveOutletLoading ? (
                        <Spinner size="sm" className="mr-2" />
                      ) : null}
                      {inactiveOutletLoading ? "Loading..." : "Inactive Outlets"}
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
                  <Table.HeadCell>Order ID</Table.HeadCell>
                  <Table.HeadCell>Order Entry NO</Table.HeadCell>
                  <Table.HeadCell>Order Status</Table.HeadCell>
                  <Table.HeadCell>View Order Data</Table.HeadCell>
                  <Table.HeadCell>Error Log</Table.HeadCell>
                  <Table.HeadCell>Original Order Date</Table.HeadCell>
                  <Table.HeadCell>First Fetched At</Table.HeadCell>
                  <Table.HeadCell>Last Fetched At</Table.HeadCell>
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
                      {salesOrders?.map((order) => (
                        <Table.Row
                          key={order?._id}
                          className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={order?.Order_Id}
                              codeName="Order Id"
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={order?.orderId?.orderNo}
                              codeName="Order No"
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {order?.OrderStatus}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <span className="flex justify-center items-center gap-2">
                              {order?.OrderData &&
                                Object.keys(order.OrderData).length > 0 &&
                                pagePermission?.view && (
                                  <Button
                                    size="xs"
                                    onClick={() =>
                                      handleViewOrderData(
                                        order?.Order_Id,
                                        order?.OrderData,
                                      )
                                    }
                                  >
                                    View Data
                                  </Button>
                                )}
                            </span>
                          </Table.Cell>
                          <Table.Cell className="whitespace-wrap font-medium text-gray-900 dark:text-gray-200">
                            <span className="text-xs flex justify-center items-center gap-2 text-red-500 w-96">
                              {order?.ErrorLog}
                            </span>
                          </Table.Cell>
                          <Table.Cell className={`whitespace-nowrap font-medium`}>
                            <span className="flex justify-center items-center gap-2">
                              <span
                                className={`${
                                  isOlderThan7Days(
                                    order?.OrderData?.Order_Date,
                                  ) && order?.OrderStatus !== "Import_Success"
                                    ? "text-red-600"
                                    : "text-gray-900 dark:text-gray-200"
                                }`}
                              >
                                {/* DD/MM/YYYY format */}
                                {order?.OrderData?.Order_Date}
                              </span>
                              {isOlderThan7Days(order?.OrderData?.Order_Date) &&
                                order?.OrderStatus !== "Import_Success" && (
                                  <span>
                                    <Button
                                      onClick={() => {
                                        fetchDateOrder(
                                          order?.OrderData?.Order_Date,
                                        );
                                      }}
                                      disabled={dateOrderFetchLoading}
                                      color="light"
                                      size="xs"
                                      className="ml-2"
                                    >
                                      Refetch
                                    </Button>
                                  </span>
                                )}
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
                      {salesOrders?.length === 0 && (
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

      {/* Order Data Modal */}
      <Modal
        show={openOrderDataModal}
        onClose={() => setOpenOrderDataModal(false)}
        size="2xl"
      >
        <Modal.Header>
          <div className="flex justify-between items-center gap-6">
            Order Data for Order ID: {currentOrderId}
            <span
              onClick={() => {
                handleCopyOrderData();
              }}
              className="text-black dark:text-white cursor-pointer"
            >
              <FaRegCopy size={25} />
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4 dark:text-gray-200 text-xs">
            {currentOrderData && Object.keys(currentOrderData).length > 0 ? (
              <>
                <ul className="list-disc list-inside space-y-2">
                  {Object.entries(currentOrderData).map(([key, value]) => (
                    <li key={key}>
                      <strong className="capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </strong>{" "}
                      {typeof value === "object" && value !== null ? (
                        <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded-md font-mono dark:bg-gray-700 dark:text-gray-200">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {String(value)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No additional order data available.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SalesOrderLog;
