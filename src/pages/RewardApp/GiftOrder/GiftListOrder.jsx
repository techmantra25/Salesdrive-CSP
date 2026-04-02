import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Label,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
  Modal,
} from "flowbite-react";

import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import Datepicker from "react-tailwindcss-datepicker";
import { FiExternalLink, FiDownload, FiSettings } from "react-icons/fi";
import { RiRefreshFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import {
  GiftOrderList,
  GiftOrderCsvDownload,
  GiftFlowGet,
  GiftFlowToggleCancel,
} from "../../../api/giftOrderApi";
import UniqueCode from "../../../assets/common/UniqueCode";
import SearchableSelect from "../../../components/SearchableSelect";
import { useDebounce } from "../../../hooks/useDebounce";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../../utils/permissionHelper";

const GiftListOrder = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [showFlowConfig, setShowFlowConfig] = useState(false);
  const [flowSettings, setFlowSettings] = useState(null);
  const [loadingFlow, setLoadingFlow] = useState(false);

  // Fetch gift flow configuration when modal opens
  useEffect(() => {
    if (showFlowConfig) {
      setLoadingFlow(true);
      const fetchGiftFlow = async () => {
        try {
          const response = await GiftFlowGet({});
          console.log(
            "Gift Flow Configuration Response:",
            response?.data?.data,
          );
          setFlowSettings(response?.data?.data);
        } catch (error) {
          console.error("Error fetching gift flow:", error);
        } finally {
          setLoadingFlow(false);
        }
      };
      fetchGiftFlow();
    }
  }, [showFlowConfig]);

  const handleToggleCancel = async (value) => {
    try {
      setLoadingFlow(true);
      await GiftFlowToggleCancel({
        directDistributorCancel: value,
      });
      console.log("Toggle Cancel Response:", { directDistributorCancel: value });
      
      // Fetch updated flow settings after toggle
      const response = await GiftFlowGet({});
      console.log("Gift Flow Configuration Response after toggle:", response?.data?.data);
      setFlowSettings(response?.data?.data);
      
      toast.success("Setting updated successfully");
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error(error?.response?.data?.message || "Failed to update setting");
    } finally {
      setLoadingFlow(false);
    }
  };
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [giftOrderList, setGiftOrderList] = useState([]);
  const [status, setStatus] = useState("All");
  const [outletOptions, setOutletOptions] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  const role = useSelector((state) => state.permission?.data?.role);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(permissionState, "retailer-orders");

    setPagePermission(permission);
  }, [permissionState]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const onPageChange = (page) => setCurrentPage(page);

  const fetchOutletOptions = async () => {
    try {
      console.log("🔍 Fetching outlet options...");
      const res = await GiftOrderList({ page: 1, limit: 1000 });

      console.log("📦 Total orders received:", res?.data?.data?.length);

      const seen = new Set();
      const outlets = [];

      // Add "All Outlets" option first

      res?.data?.data?.forEach((order, index) => {
        const outlet = order?.retailer?.outletApprovedId;

        if (!outlet?.outletUID) {
          console.log(`⚠️ Order ${index} has no outletUID`);
          return;
        }

        if (seen.has(outlet.outletUID)) {
          console.log(`⏭️ Skipping duplicate: ${outlet.outletUID}`);
          return;
        }

        seen.add(outlet.outletUID);

        const outletData = {
          _id: outlet._id,
          name: outlet.outletName?.trim() || outlet.outletUID,
          desc: outlet.outletUID,
        };

        outlets.push(outletData);
        console.log(`✅ Added outlet:`, outletData);
      });

      console.log("🎯 Final outlets array:", outlets);
      console.log(`📊 Total unique outlets: ${outlets.length - 1}`); // -1 for "All" option

      setOutletOptions(outlets);

      if (outlets.length === 1) {
        console.warn("⚠️ No outlets found in orders!");
      }
    } catch (err) {
      console.error("❌ Outlet load failed:", err);
      toast.error(err?.response?.data?.message || "Failed to load outlets");
    }
  };

  // Updated fetch function to handle empty string for "All"
  const fetchGiftOrderPaginatedWithOutDebounce = async () => {
    try {
      setPageLoading(true);

      const query = {
        page: currentPage,
        limit: 20,
      };

      if (orderIdSearch?.trim()) {
        query.orderId = orderIdSearch.trim();
      }

      if (status !== "All") {
        query.status = status;
      }

      // Only add outletUID filter if a specific outlet is selected
      if (selectedOutlet && selectedOutlet !== "") {
        query.outletID = selectedOutlet;

        console.log("🔍 Filtering by outlet:", selectedOutlet);
      } else {
        console.log("📋 Showing all outlets");
      }

      if (dateRange?.startDate && dateRange?.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
        console.log(
          "fromDate",
          dateRange.startDate,
          "toDate",
          dateRange.endDate,
        );
      }

      console.log("📡 Fetching orders with query:", query);
      const response = await GiftOrderList(query);

      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
      setGiftOrderList(response?.data?.data);

      console.log("✅ Fetched orders:", response?.data?.data?.length);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch gift orders",
      );
    } finally {
      setPageLoading(false);
    }
  };

  const fetchGiftOrderPaginated = useDebounce(
    fetchGiftOrderPaginatedWithOutDebounce,
    500,
  );

  const handleCsvDownload = async () => {
    try {
      setDownloadingCsv(true);

      const query = {};

      if (orderIdSearch?.trim()) {
        query.orderId = orderIdSearch.trim();
      }

      if (status !== "All") {
        query.status = status;
      }

      if (selectedOutlet && selectedOutlet !== "") {
        query.outletID = selectedOutlet;
      }

      if (dateRange?.startDate && dateRange?.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      console.log("📥 Downloading CSV with filters:", query);

      const response = await GiftOrderCsvDownload(query);

      // Create a blob from the response
      const blob = new Blob([response.data], { type: "text/csv" });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `Gift_Orders_${new Date().toISOString().slice(0, 10)}.csv`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully!");
    } catch (error) {
      console.error("❌ CSV Download error:", error);
      toast.error(error?.response?.data?.message || "Failed to download CSV");
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleResetFilter = () => {
    setCurrentPage(1);
    setStatus("All");
    setSelectedOutlet("");
    setOrderIdSearch("");
    setDateRange({
      startDate: null,
      endDate: null,
    });
    fetchGiftOrderPaginated();
  };

  useEffect(() => {
    fetchGiftOrderPaginated();
  }, [currentPage, status, selectedOutlet, orderIdSearch, dateRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [status, selectedOutlet, orderIdSearch, dateRange]);

  useEffect(() => {
    fetchOutletOptions();
  }, []);

  return (
    <div>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col w-full">
          <div className="flex justify-between w-full items-center py-1">
            <div className="flex justify-start items-center w-full">
              <Breadcrumb aria-label="Solid background breadcrumb example">
                <Breadcrumb.Item>RVP App</Breadcrumb.Item>
                <Breadcrumb.Item href={`/${role}/retailer-orders`}>
                  Gift Orders
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div className="flex justify-end items-center w-full">
              <Button
                onClick={() => setShowFlowConfig(true)}
                color="light"
                size="sm"
              >
                <FiSettings className="mr-2" size={22}/>
                Gift Order Delivery Settings
              </Button>
            </div>
          </div>

          <div className="flex justify-start items-center flex-col gap-2 w-full p-1">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="indigo">Total Items : {totalItems}</Badge>
                <Badge color="indigo">Filtered Items : {filteredCount}</Badge>
              </div>
              <div className="flex justify-center w-full items-end gap-4 flex-wrap">
                <div className="w-40">
                  <div className="block">
                    <Label value="Status" />
                  </div>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="All">All</option>
                    <option value="Waiting for NOC">Waiting for NOC</option>
                    <option value="NOC Approved">NOC Approved</option>
                    <option value="Address Confirmed">Address Confirmed</option>
                    <option value="Gift Ordered">Gift Ordered</option>
                    <option value="Gift Dispatched">Gift Dispatched</option>
                    <option value="Gift Delivered">Gift Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </div>
                <div className="w-64 flex-col">
                  <div className="block mb-1">
                    <Label value="Outlet Name / UID" />
                  </div>

                  <SearchableSelect
                    options={outletOptions}
                    value={selectedOutlet}
                    onChange={(e) => setSelectedOutlet(e.target.value)}
                    placeholder="Select Outlet"
                    displayKey="name"
                    descKey="desc"
                    valueKey="_id"
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="w-64">
                  <div className="block mb-1">
                    <Label value="Order Date Range" />
                  </div>
                  <Datepicker
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    showFooter={true}
                    placeholder="Select Date Range"
                    primaryColor="indigo"
                  />
                </div>

                <div className="w-52">
                  <div className="block">
                    <Label value="Order ID" />
                  </div>
                  <TextInput
                    placeholder="Search Order ID"
                    value={orderIdSearch}
                    onChange={(e) => setOrderIdSearch(e.target.value)}
                  />
                </div>

                <div className="flex justify-center items-center gap-2">
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

                  {pagePermission?.view && (
                    <Button
                      className="text-xs"
                      size="sm"
                      color="info"
                      onClick={handleCsvDownload}
                      disabled={downloadingCsv}
                    >
                      <span className="flex justify-center items-center gap-2">
                        {downloadingCsv ? (
                          <Spinner size="sm" />
                        ) : (
                          <FiDownload size={20} />
                        )}
                        {downloadingCsv ? "Downloading..." : "CSV Download"}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* pagination */}
          <div className="flex justify-end items-center w-full px-4 ">
            <div className="flex overflow-x-auto sm:justify-center">
              {!pageLoading && totalPages > 1 && (
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
          <div className="flex justify-start items-center flex-col gap-2 w-full p-4">
            <div className="overflow-x-auto w-full">
              <Table striped className="rounded-none border">
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Order ID
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Order Date
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Outlet Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Outlet UID
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Mobile
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Email
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Product
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Points
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Current Balance
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Updated Date
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Distributor Status
                  </Table.HeadCell>

                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    DB Code
                  </Table.HeadCell>

                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Action
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {pageLoading ? (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="12"
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
                      {giftOrderList?.map((order) => {
                        const distributorApproval =
                          order?.distributorApprovals?.[0];

                        return (
                          <Table.Row
                            key={order._id}
                            className="text-center bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex items-center justify-center gap-2">
                                <UniqueCode
                                  text={order?.orderId || order?._id}
                                  codeName={"Transaction ID"}
                                />

                                <FiExternalLink
                                  color="#3795BD"
                                  className="cursor-pointer hover:scale-110 transition-transform"
                                  onClick={() => {
                                    navigate(
                                      `/${role}/retailer-orders/${order._id}`,
                                    );
                                  }}
                                  title="View Details"
                                />
                              </div>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {order?.createdAt
                                ? new Date(order.createdAt).toLocaleString()
                                : "N/A"}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {order?.retailer?.outletApprovedId?.outletName ||
                                "N/A"}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <UniqueCode
                                text={
                                  order?.retailer?.outletApprovedId
                                    ?.outletUID || "N/A"
                                }
                                codeName={"Outlet UID"}
                              />
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {order?.retailer?.outletApprovedId?.mobile1 ||
                                "N/A"}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {order?.retailer?.outletApprovedId?.email ||
                                "N/A"}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex items-center gap-2 flex-wrap">
                                {order?.orderItems?.length > 0 ? (
                                  <>
                                    {order.orderItems.map((item, index) => (
                                      <img
                                        key={index}
                                        src={item.productImage?.[0]}
                                        alt={item.productName}
                                        className="w-10 h-10 object-cover rounded"
                                      />
                                    ))}
                                    <span>
                                      {order.orderItems.length} Products
                                    </span>
                                  </>
                                ) : (
                                  "N/A"
                                )}
                              </div>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex justify-center items-center">
                                <Badge
                                  color="purple"
                                  className="font-bold text-md"
                                >
                                  {order?.totalRedemptionPoints || 0}
                                </Badge>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex justify-center items-center">
                                <Badge
                                  color="info"
                                  className="font-bold text-md"
                                >
                                  {order?.retailer?.outletApprovedId
                                    ?.currentPointBalance != null
                                    ? Number.isInteger(
                                        order.retailer.outletApprovedId
                                          .currentPointBalance,
                                      )
                                      ? order.retailer.outletApprovedId
                                          .currentPointBalance
                                      : Number(
                                          order.retailer.outletApprovedId
                                            .currentPointBalance,
                                        ).toFixed(2)
                                    : "N/A"}
                                </Badge>
                              </div>
                            </Table.Cell>

                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {order?.updatedAt
                                ? new Date(order.updatedAt).toLocaleString()
                                : "N/A"}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex justify-center items-center">
                                <Badge
                                  color={
                                    order?.status === "Waiting for NOC"
                                      ? "warning"
                                      : order?.status === "NOC Approved"
                                        ? "success"
                                        : order?.status === "Address Confirmed"
                                          ? "info"
                                          : order?.status === "Gift Ordered"
                                            ? "purple"
                                            : order?.status ===
                                                "Gift Dispatched"
                                              ? "info"
                                              : order?.status ===
                                                  "Gift Delivered"
                                                ? "success"
                                                : order?.status === "Cancelled"
                                                  ? "failure"
                                                  : "gray"
                                  }
                                  className="font-bold"
                                >
                                  {order?.status || "Unknown"}
                                </Badge>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {order?.distributorApprovals?.length > 0 ? (
                                <div className="flex flex-col gap-1 items-center">
                                  {order.distributorApprovals.map((da) => (
                                    <Badge
                                      key={da._id}
                                      color={
                                        da.status === "Approved"
                                          ? "success"
                                          : da.status === "Rejected"
                                            ? "failure"
                                            : "warning"
                                      }
                                      className="font-bold"
                                    >
                                      {da.distributorId?.dbCode} : {da.status}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <Badge color="gray">N/A</Badge>
                              )}
                            </Table.Cell>

                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {order?.distributorApprovals?.length > 0 ? (
                                <div className="flex flex-col gap-1 items-center">
                                  {order.distributorApprovals.map((da) =>
                                    da?.distributorId?.dbCode ? (
                                      <UniqueCode
                                        key={da._id}
                                        text={da.distributorId.dbCode}
                                        codeName="DB Code"
                                      />
                                    ) : (
                                      <span key={da._id}>N/A</span>
                                    ),
                                  )}
                                </div>
                              ) : (
                                "N/A"
                              )}
                            </Table.Cell>

                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <Button
                                size="sm"
                                color="info"
                                onClick={() =>
                                  navigate(
                                    `/${role}/retailer-orders/${order._id}`,
                                  )
                                }
                              >
                                View
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}

                      {giftOrderList?.length === 0 && (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan="12"
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

      {/* Gift Order Flow Configuration Modal */}
      <Modal
        show={showFlowConfig}
        onClose={() => setShowFlowConfig(false)}
        size="lg"
      >
        <Modal.Header>Gift Order Flow Configuration</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Configure the gift order workflow settings for your organization.
            </p>
            {loadingFlow ? (
              <div className="flex justify-center items-center py-4">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                {/* Toggle Setting */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <Label
                        htmlFor="directDistributorCancel"
                        value="Allow Distributor Direct Cancel"
                        className="text-gray-900 dark:text-white font-medium text-base"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Turn this on to automatically cancel the gift order if any
                        distributor rejects the request. If turned off, the order
                        will remain pending for admin review.
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        id="directDistributorCancel"
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        checked={
                          flowSettings?.settings?.directDistributorCancel || false
                        }
                        onChange={(e) => handleToggleCancel(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Last Modified Date */}
                {flowSettings?.updatedAt && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last Modified:{" "}
                      {new Date(flowSettings.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowFlowConfig(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GiftListOrder;
