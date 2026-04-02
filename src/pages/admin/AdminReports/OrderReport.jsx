import {
  Button,
  Card,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import { OrderEntryPaginatedReportList } from "../../../api/orderApi";
import SearchableSelect from "../../../components/SearchableSelect";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { escapeCSVValue } from "../../../utils/escapeCSVValue";
import { getPagePermission } from "../../../utils/permissionHelper";
import { BACKEND_URL } from "../../../constants";
import { setAuthHeader } from "../../../api/api";


export const OrderReport = () => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [backendDownloadLoading, setBackendDownloadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [orderSource, setOrderSource] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);


  const dispatch = useDispatch();

  const { distributors } = useSelector((state) => state.distributors);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "sales-order-report");
    setPagePermission(permission);
  }, [permissionState]);


  const fetchAllData = async () => {
    let currentPage = 1;
    let allProcessedData = [];
    let totalPages = 1;
    let query = {
      page: 1,
      limit: 100,
    };

    if (searchTerm) {
      query.search = searchTerm;
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      query.fromDate = dateRange.startDate;
      query.toDate = dateRange.endDate;
    }

    if (orderSource !== "all") {
      query.orderSource = orderSource;
    }

    if (orderStatus !== "all") {
      query.status = orderStatus;
    }

    if (selectedDistributors.length > 0) {
      if (!selectedDistributors.includes("all")) {
        query.distributorIds = selectedDistributors.join(",");
      }
    }

    setDownloadLoading(true);

    try {
      await toast.promise(
        (async () => {
          // --- Step 1: Fetch and process the first page ---
          const firstResponse = await OrderEntryPaginatedReportList(query);
          totalPages = firstResponse?.data?.pagination?.totalPages || 1;
          const fetchedFirstPageData = firstResponse?.data?.data || [];

          // Process the first page data
          const processedFirstPageData =
            processRawDataForCSV(fetchedFirstPageData);
          allProcessedData = [...processedFirstPageData];

          // --- Step 2: Fetch and process subsequent pages ---
          while (currentPage < totalPages) {
            currentPage++;
            query.page = currentPage; // Add the current page to the query

            const response = await OrderEntryPaginatedReportList(query);
            const fetchedPageData = response?.data?.data || [];

            const processedCurrentPageData =
              processRawDataForCSV(fetchedPageData);
            allProcessedData = [
              ...allProcessedData,
              ...processedCurrentPageData,
            ];

            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        })(),
        {
          loading: "Starting download and processing...",
          success: <span>Data Fetching complete!</span>,
          error: "Error during download.",
        },
        {
          position: "top-center",
        },
      );

      return allProcessedData; // Return the fully processed data
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch or process data",
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  // Helper function to process raw data into CSV format
  const processRawDataForCSV = (rawData) => {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    // Flatten orders into line items (similar to OrderDumpReport)
    const withLineItems =
      rawData?.flatMap((order) =>
        order?.lineItems?.map((lineItem) => ({
          ...order,
          orderDeatils: lineItem,
          product: lineItem?.product,
          product_price: lineItem?.price,
        })),
      ) || [];

    const reportData = withLineItems?.map((ele) => ({
      "Distributor ID": ele?.distributorId?.dbCode,
      "Distributor Name": escapeCSVValue(ele?.distributorId?.name),
      "Order Number": ele?.orderNo,
      "Order Date": moment(ele?.updatedAt)
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY"),
      "Order Source": ele?.orderSource,
      "Salesman Code": ele?.salesmanName?.empId,
      "Salesman Name": ele?.salesmanName?.name,
      "Beat Code": ele?.routeId?.code,
      Beat: ele?.routeId?.name,
      "Retailer Code": ele?.retailerId?.outletCode,
      "Retailer UID": ele?.retailerId?.outletUID,
      Retailer: ele?.retailerId?.outletName,

      // Added fields from OrderDumpReport (Brand to Special Disc Amount)
      Brand: ele?.product?.brand?.name,
      Category: ele?.product?.cat_id?.name,
      Group: escapeCSVValue(ele?.product?.sku_group__name),
      "FG Code": ele?.product?.sku_group_id,
      "Product Code": ele?.product?.product_code,
      "Product Name": escapeCSVValue(ele?.product?.name),
      "Order Qty (Pcs)": ele?.orderDeatils?.oderQty,
      "Order Qty (BOX)": (
        ele?.orderDeatils?.oderQty /
        Number(ele?.product?.no_of_pieces_in_a_box || 1)
      )?.toFixed(2),
      MRP: ele?.product_price?.mrp_price,
      RLP: ele?.product_price?.rlp_price,
      "Gross Amount": ele?.orderDeatils?.grossAmt,
      "Scheme Discount": ele?.orderDeatils?.schemeDisc,
      "Special Disc Amount": ele?.orderDeatils?.distributorDisc,
      "Net Amount": ele?.orderDeatils?.netAmt,

      "Order to Bill Status": `${ele.status === "Partially_Billed"
          ? "Partially Billed"
          : ele.status === "Completed_Billed"
            ? "Completely Billed"
            : ele.status
        }`,
    }));

    return reportData;
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => escapeCSVValue(value))
        .join(","),
    );

    return [headers, ...rows].join("\n");
  };

  const downloadCSV = async () => {
    try {
      const allData = await fetchAllData();

      if (!allData || allData.length === 0) {
        toast.dismiss("downloadProgress"); // Ensure toast is dismissed if no data
        toast.error("No data to download", { position: "top-center" });
        return;
      }

      const csvContent = convertToCSV(allData);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `order-report-csp-${moment()
          .tz("Asia/Kolkata")
          .format("DD-MM-YY")}.csv`,
      );
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully!", { position: "top-center" });
      setTimeout(() => {
        toast.dismiss();
      }, 1000);
    } catch (error) {
      toast.dismiss();
      toast.error(error?.message || "Failed to download CSV", {
        position: "top-center",
      });
    }
  };

  // Backend download function
  const downloadFromBackend = async () => {
    try {
      setBackendDownloadLoading(true);
      toast.loading("Downloading report...");

      const query = {};

      if (searchTerm) {
        query.search = searchTerm;
      }

      if (dateRange?.startDate && dateRange?.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      if (orderSource !== "all") {
        query.orderSource = orderSource;
      }

      if (orderStatus !== "all") {
        query.status = orderStatus;
      }

      if (selectedDistributors.length > 0) {
        if (!selectedDistributors.includes("all")) {
          query.distributorIds = selectedDistributors.join(",");
        }
      }

      const params = new URLSearchParams(query).toString();
      const url = `${BACKEND_URL}/api/v1/order-entry/generate-report?${params}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          ...setAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      link.download = `order-report-csp-${moment().tz("Asia/Kolkata").format("DD-MM-YYYY")}.csv`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.dismiss();
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.dismiss();
      toast.error("Failed to download report. Please try again.");
    } finally {
      setBackendDownloadLoading(false);
    }
  };

  const handleDistributorChange = (e) => {
    setSelectedDistributors(e.target.value);
  };

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  const handleResetFilter = () => {
    setOrderSource("all");
    setOrderStatus("all");
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setSelectedDistributors([]);
    setSearchTerm("");
  };

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col w-full">

          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Sales Order Report</h1>
            </div>
          </div>

          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="flex justify-center items-center flex-col">
              <div className="flex justify-center w-full items-center gap-2 flex-wrap">
                <div className="w-56">
                  <Label value="Select Distributor(s)" />
                  <SearchableSelect
                    id="distributor-select"
                    className="w-full"
                    options={distributors}
                    value={selectedDistributors}
                    onChange={handleDistributorChange}
                    placeholder="Select Distributor(s)"
                    displayKey="name"
                    descKey="dbCode"
                    valueKey="_id"
                    multiple
                    disabled={downloadLoading}
                  />
                </div>
                <div className="w-44">
                  <Label value="Order Entry Date" />

                  <Datepicker
                    inputClassName="relative py-1.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500"
                    showShortcuts={true}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    size="sm"
                    disabled={downloadLoading}
                  />
                </div>

                <div className="w-44">
                  <div className="block">
                    <Label value="Order Source" />
                  </div>
                  <Select
                    value={orderSource}
                    onChange={(e) => setOrderSource(e.target.value)}
                    id="orderSourceSelect"
                    required
                    sizing={"sm"}
                    disabled={downloadLoading}
                  >
                    <option value="all">All</option>
                    <option value="SFA">SFA</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Telecaller">Telecaller</option>
                  </Select>
                </div>

                <div className="w-44">
                  <div className="block">
                    <Label value="Search Order" />
                  </div>
                  <TextInput
                    placeholder="Search Order No"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value?.trim())}
                    sizing={"sm"}
                    disabled={downloadLoading}
                  />
                </div>

                <div className="w-44">
                  <div className="block">
                    <Label value="Order Status" />
                  </div>
                  <Select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    id="orderType"
                    sizing={"sm"}
                    disabled={downloadLoading}
                  >
                    <option value="all">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed_Billed">Completely Billed</option>
                    <option value="Partially_Billed">Partially Billed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center w-full items-center gap-2 flex-wrap">
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="success"
                    disabled={downloadLoading}
                    onClick={() => handleResetFilter()}
                  >
                    <RiRefreshFill size={18} className="mx-2" />
                    Reset Filters
                  </Button>)}
                {/* {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    color="blue"
                    size="sm"
                    disabled={downloadLoading}
                    onClick={() => downloadCSV()}
                  >
                    {downloadLoading ? (
                      <Spinner size="sm" className="mx-2" />
                    ) : (
                      <FaDownload size={15} className="mx-2" />
                    )}
                    {downloadLoading ? "Downloading..." : "Download Report"}
                  </Button>)} */}
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    color="purple"
                    size="sm"
                    disabled={backendDownloadLoading}
                    onClick={() => downloadFromBackend()}
                  >
                    {backendDownloadLoading ? (
                      <Spinner size="sm" className="mx-2" />
                    ) : (
                      <FaDownload size={15} className="mx-2" />
                    )}
                    {backendDownloadLoading ? "Downloading..." : "Download Report"}
                  </Button>)}
              </div>
            </Card>
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
