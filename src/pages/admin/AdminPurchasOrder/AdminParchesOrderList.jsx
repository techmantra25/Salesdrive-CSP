import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Label,
  Modal,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiExternalLink } from "react-icons/fi";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Datepicker from "react-tailwindcss-datepicker";
import {
  getPurchaseOrderList,
  updatePurchaseOrderStatusByEmp,
} from "../../../api/api";
import UniqueCode from "../../../assets/common/UniqueCode";
import { useDebounce } from "../../../hooks/useDebounce";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { fetchStates } from "../../../redux/stateSlice";
import { getPurchaseOrderExcelView } from "../../../api/configApi";
import { MdDownloading } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";
import SearchableSelect from "../../../components/SearchableSelect";

export const AdminParchesOrderList = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [approvedStatus, setApprovedStatus] = useState("All");

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");

  const dispatch = useDispatch();

  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );
  const activeDistributors = distributors.filter(
    (distributor) => distributor.status === true
  );

  const [selectedDistributor, setSelectedDistributor] = useState("default");

  const { userInfo } = useSelector((state) => state.user);
  const [openOrderDataModal, setOpenOrderDataModal] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);

  useEffect(() => {
    dispatch(fetchDistributors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const onPageChange = (page) => setCurrentPage(page);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  let fetchPurchaseOrderPaginatedWithOutDebounce = async () => {
    try {
      setPageLoading(true);
      const query = {
        page: currentPage,
        limit: 20,
        status: "Confirmed",
      };

      if (dateRange?.startDate && dateRange?.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      if (approvedStatus !== "All") {
        query.approvedStatus = approvedStatus;
      }

      if (selectedDistributor !== "default") {
        query.distributorId = selectedDistributor;
      }

      if (purchaseOrderNo !== "") {
        query.purchaseOrderNo = purchaseOrderNo;
      }

      const response = await getPurchaseOrderList(query);

      setPurchaseOrderList(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch suppliers"
      );
    } finally {
      setPageLoading(false);
    }
  };

  let fetchPurchaseOrderPaginated = useDebounce(
    fetchPurchaseOrderPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setCurrentPage(1);
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setPurchaseOrderNo("");
    setApprovedStatus("All");
    setSelectedDistributor("default");
    fetchPurchaseOrderPaginated();
    dispatch(fetchDistributors());
  };

  useEffect(() => {
    fetchPurchaseOrderPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    dateRange,
    approvedStatus,
    selectedDistributor,
    purchaseOrderNo,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, approvedStatus, selectedDistributor, purchaseOrderNo]);

  const handleCancelOrder = async (id) => {
    try {
      let payload = {
        approvedStatus: "Rejected",
      };
      const res = await updatePurchaseOrderStatusByEmp(id, payload);
      toast.success(res?.data?.message || "Order Rejected");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reject Order"
      );
    } finally {
      fetchPurchaseOrderPaginated();
    }
  };

  const handleSaveOrder = async (id) => {
    try {
      let payload = {
        approvedStatus: "Approved",
      };
      const res = await updatePurchaseOrderStatusByEmp(id, payload);
      toast.success(res?.data?.message || "Order Approved");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to approve Order"
      );
    } finally {
      fetchPurchaseOrderPaginated();
    }
  };

  const [selectedOrders, setSelectedOrders] = useState([]);

  const allOutletsSelected = () => {
    let check;
    check = purchaseOrderList.every((order) =>
      selectedOrders
        .map((selectedOrder) => selectedOrder._id)
        .includes(order._id)
    );
    return check;
  };

  console.log(selectedOrders, "selectedOrders");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const [downloadLoading, setDownloadLoading] = useState(false);

  const fetchAllData = async () => {
    let currentPage = 1;
    let allData = [];
    let isFetching = true;
    let totalPages = 1;
    let query = {};

    let allIds = selectedOrders?.map((order) => order._id);

    console.log(allIds, "allIds");

    // if (selectedApprovedStatus !== "all") {
    //   query.approvedStatus = selectedApprovedStatus;
    // }

    if (purchaseOrderNo !== "") {
      query.purchaseOrderNo = purchaseOrderNo;
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      query.fromDate = dateRange.startDate;
      query.toDate = dateRange.endDate;
    }

    if (selectedOrders?.length > 0) {
      query.purchaseOrderId = allIds?.join(",");
    }

    try {
      setDownloadLoading(true);
      toast.loading(`Starting download...`, {
        id: "downloadProgress",
        position: "top-right",
      });

      // Fetch first page to get total pages
      const firstResponse = await getPurchaseOrderExcelView({
        page: 1,
        limit: 20,
        ...query,
      });
      totalPages = firstResponse?.data?.pagination?.totalPages || 1;

      console.log(firstResponse, "firstResponse");

      console.log(totalPages, "totalPagestotalPages");

      let fetchedData = firstResponse?.data?.data || [];

      console.log(fetchedData, "fetchedData");

      let withLineItems = [];

      withLineItems =
        firstResponse?.data?.data?.flatMap((order) =>
          order?.lineItems?.map((lineItem) => ({
            ...order,
            orderDeatils: lineItem,
            product: lineItem?.product,
            // product_price: lineItem?.price,
          }))
        ) || [];

      console.log(withLineItems, "withLineItems");

      let OriginalReportData = withLineItems.map((ele) => ({
        "Purcg Order No": ele?.purchaseOrderNo,
        "Purch Order Date": moment(ele?.updatedAt).format("DD-MM-YYYY"),
        "Order Status": ele?.status,
        "Approval Stage":
          ele?.approvedStatus === "Not Approved"
            ? "Pending"
            : ele?.approvedStatus === "Rejected"
            ? "Rejected"
            : ele?.approvedStatus,
        "Expected Delivery Date": moment(ele?.expectedDeliveryDate).format(
          "DD-MM-YYYY"
        ),
        "Supplier Name": ele?.supplierId?.supplierName,
        "Product Code": ele?.product?.product_code,
        "Product Name": ele?.product?.name,
        UOM: ele?.orderDeatils?.lineItemUOM,
        "Order Qty (BOX)": ele?.orderDeatils?.boxOrderQty,
        "Order Qty (PCS)": ele?.orderDeatils?.oderQty,
        "Stock Qty": ele?.orderDeatils?.inventoryId?.availableQty,
        "In-Transit Qty": ele?.orderDeatils?.inventoryId?.intransitQty,
        Price: ele?.orderDeatils?.price?.dlp_price,
        "Gross Amount": ele?.orderDeatils?.grossAmt,
        "Taxable Amount": ele?.orderDeatils?.taxableAmt,
        "Net Amt": ele?.orderDeatils?.netAmt,
      }));

      allData = [...OriginalReportData];

      while (isFetching && currentPage < totalPages) {
        currentPage++;
        toast.loading(`Downloading page ${currentPage} of ${totalPages}...`, {
          id: "downloadProgress",
          position: "bottom-right",
        });

        await sleep(300);
        const response = await getPurchaseOrderExcelView({
          page: currentPage,
          limit: 20,
          ...query,
        });

        fetchedData = response?.data?.data || [];
        allData = [...allData, ...fetchedData];

        if (fetchedData.length < 20) isFetching = false;
      }

      return allData;
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching all data", { position: "top-right" });
      return [];
    } finally {
      setDownloadLoading(false);
    }
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return "";

    // Include "Index" in headers but don't add index in rows
    const headers = [Object.keys(data[0])].join(",");

    const rows = data.map((row) => Object.values(row).join(","));

    return [headers, ...rows].join("\n");
  };

  const downloadCSV = async () => {
    try {
      const allData = await fetchAllData();

      console.log({
        allData,
      });

      toast.dismiss(); // Clear any existing toasts

      if (!allData || allData.length === 0) {
        toast.error("No data to download", { position: "top-right" });
        return; // Exit early to prevent "Starting download..."
      }

      toast.loading("Starting download...", {
        id: "downloadProgress",
        position: "top-right",
      });

      const csvData = allData;

      console.log(csvData, "csvData");

      const csvContent = convertToCSV(csvData);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Create a temporary download link
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "purchase_order_report.csv");
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully!", { position: "top-right" });
      setTimeout(() => {
        toast.dismiss(); // Dismiss the loading toast
      }, 1000);
    } catch (error) {
      toast.dismiss(); // Dismiss previous messages before showing an error
      toast.error(error?.message || "Failed to download CSV", {
        position: "top-right",
      });
    }
  };

  const handleViewOrderData = (orderData) => {
    setCurrentOrderData(orderData);
    setOpenOrderDataModal(true);
  };

  const handleCopyOrderData = () => {
    if (!currentOrderData) return;

    const textToCopy = JSON.stringify(currentOrderData, null, 2);

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Quotation Data copied to clipboard.");
      })
      .catch((err) => {
        console.error("Failed to copy quotation data: ", err);
        toast.error("Failed to copy Quotation Data JSON.");
      });
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col w-full">
        <div className="flex justify-between w-full items-center py-1">
          <div className="flex justify-start items-center w-full">
            <Breadcrumb aria-label="Solid background breadcrumb example">
              <Breadcrumb.Item>Admin Purchase Browser</Breadcrumb.Item>
              <Breadcrumb.Item href={`/${userInfo?.role}/purchase-order-list`}>
                Purchase Order List
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex justify-start items-center flex-col gap-2 w-full p-1">
          <Card className="w-full flex justify-center items-center flex-col">
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="indigo">Total Items : {totalItems}</Badge>
              <Badge color="indigo">Filtered Items : {filteredCount}</Badge>
            </div>
            <div className="flex justify-center w-full items-end gap-2 flex-wrap">
              <div className="w-56">
                <div className="block">
                  <Label value="Purchase Order No" />
                </div>
                <TextInput
                  value={purchaseOrderNo}
                  onChange={(e) => setPurchaseOrderNo(e.target.value)}
                  required
                  placeholder="Purchase Order No"
                />
              </div>
              <div className="w-40">
                <div className="block">
                  <Label value="Approved Status" />
                </div>
                <Select
                  value={approvedStatus}
                  onChange={(e) => setApprovedStatus(e.target.value)}
                  required
                >
                  <option value="All">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Not Approved">Pending</option>
                  <option value="Rejected">Rejected</option>
                </Select>
              </div>

              <div className="w-56">
                <Label value="Select Distributor" />
                <SearchableSelect
                  id="distributor-select"
                  className="w-full"
                  options={activeDistributors}
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  placeholder="Select Distributor"
                  disabled={distributorsLoading}
                  displayKey="name"
                  descKey="desc"
                  valueKey="_id"
                  defaultValue="default"
                />
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
              <div>
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
              </div>
            </div>
            {selectedOrders?.length > 0 && (
              <div className="flex justify-center w-full items-end gap-2 flex-wrap">
                <div>
                  <button
                    className="w-48 border-2 border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-purple-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-purple-500 hover:bg-purple-500 hover:text-white p-2 hover:shadow-lg hover:font-bold"
                    size="xs"
                    onClick={downloadCSV}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <MdDownloading size={20} />
                      Download CSV{" "}
                      <span className="text-purple-500 font-bold">
                        {selectedOrders?.length}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            )}
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
                <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                  <Checkbox
                    checked={allOutletsSelected()}
                    className="cursor-pointer"
                    onChange={() => {
                      if (allOutletsSelected()) {
                        // Deselect all orders by filtering out orders that are in the current list

                        setSelectedOrders([
                          ...selectedOrders.filter(
                            (order) =>
                              !purchaseOrderList
                                .map((order) => order._id)
                                .includes(order._id)
                          ),
                        ]);
                      } else {
                        let newSelectedOrders = [...selectedOrders];

                        purchaseOrderList.forEach((order) => {
                          if (
                            !newSelectedOrders
                              .map((o) => o._id)
                              .includes(order._id)
                          ) {
                            newSelectedOrders.push(order); // Push the entire order object
                          }
                        });

                        setSelectedOrders([...newSelectedOrders]);
                      }
                    }}
                    size="sm"
                  />
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Purchase Order No
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Distributor Code
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Distributor Name
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Supplier Name
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Created
                </Table.HeadCell>

                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Status
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Expected Delivery Date
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Net Amount
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Total Line Items
                </Table.HeadCell>

                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Action
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                  Quotation Response
                </Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {pageLoading ? (
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
                    {purchaseOrderList?.map((po) => (
                      <Table.Row
                        key={po._id}
                        className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="text-center">
                          <Checkbox
                            className="cursor-pointer"
                            checked={selectedOrders
                              .map((order) => order._id)
                              .includes(po._id)}
                            onChange={() => {
                              if (
                                selectedOrders
                                  .map((order) => order._id)
                                  .includes(po._id)
                              ) {
                                // Deselect an individual order by filtering it out
                                setSelectedOrders(
                                  selectedOrders.filter(
                                    (order) => order._id !== po._id
                                  )
                                );
                              } else {
                                // Select an individual order and add the entire object
                                setSelectedOrders([...selectedOrders, po]);
                              }
                            }}
                          />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex items-center justify-center gap-2">
                            <UniqueCode
                              text={po?.purchaseOrderNo}
                              codeName="Purchase Order No"
                            />
                            <Link
                              to={`/${userInfo?.role}/purchase-order-detail/${po?._id}`}
                              className="cursor-pointer"
                            >
                              <FiExternalLink color="#3795BD" />
                            </Link>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {po?.distributorId?.dbCode}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {po?.distributorId?.name}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {po?.supplierId?.supplierName}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {moment(po?.createdAt)
                            .tz("Asia/Kolkata")
                            .format("LLL")}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {po?.status}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {moment(po?.expectedDeliveryDate)
                            .tz("Asia/Kolkata")
                            .format("LLL")}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {po?.netAmount?.toLocaleString("en-IN", {
                            style: "currency",
                            currency: "INR",
                          })}
                        </Table.Cell>

                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {po?.lineItems?.length > 0 && (
                            <span
                              className="flex items-center justify-center gap-2 text-green-500 font-bold 
                             cursor-pointer
                            "
                            >
                              {po.lineItems.length} Items
                            </span>
                          )}
                        </Table.Cell>

                        <Table.Cell className="whitespace-nowrap  font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex justify-center items-center w-full gap-4">
                            {po?.approvedStatus == "Not Approved" && (
                              <Button
                                color="success"
                                size="xs"
                                className="text-xs w-28"
                              >
                                <span
                                  className="flex justify-center items-center gap-2"
                                  onClick={() => handleSaveOrder(po?._id)}
                                >
                                  Approve
                                </span>
                              </Button>
                            )}
                            {po?.approvedStatus == "Approved" && (
                              <Button
                                color="gray"
                                size="xs"
                                className="text-xs w-28"
                                disabled
                              >
                                <span
                                  className="flex justify-center items-center gap-2"
                                  disabled
                                >
                                  Approved
                                </span>
                              </Button>
                            )}
                            {po?.approvedStatus == "Not Approved" && (
                              <Button
                                color="failure"
                                size="xs"
                                className="text-xs w-28"
                              >
                                <span
                                  className="flex justify-center items-center gap-2"
                                  onClick={() => handleCancelOrder(po?._id)}
                                >
                                  Reject
                                </span>
                              </Button>
                            )}
                            {po?.approvedStatus == "Rejected" && (
                              <Button
                                color="gray"
                                size="xs"
                                className="text-xs w-28"
                                disabled
                              >
                                <span
                                  className="flex justify-center items-center gap-2"
                                  disabled
                                >
                                  Reject
                                </span>
                              </Button>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <span className="flex justify-center items-center gap-2">
                            {po?.quotationResponse && (
                              <Button
                                size="xs"
                                onClick={() =>
                                  handleViewOrderData(po?.quotationResponse)
                                }
                              >
                                View Data
                              </Button>
                            )}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    {purchaseOrderList?.length === 0 && (
                      <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell
                          colSpan="10"
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

      {/* Order Data Modal */}
      <Modal
        show={openOrderDataModal}
        onClose={() => setOpenOrderDataModal(false)}
        size="2xl"
      >
        <Modal.Header>
          <div className="flex justify-between items-center gap-6">
            Quotation Response Data
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
            ) : (
              <p>No additional order data available.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminParchesOrderList;
