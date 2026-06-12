import { useEffect, useState } from "react";
import moment from "moment";
import Papa from "papaparse";
import { AllBillListReport } from "../../../api/salesBillApi";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Button,
  Card,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import SearchableSelect from "../../../components/SearchableSelect";
import Datepicker from "react-tailwindcss-datepicker";
import { RiRefreshFill } from "react-icons/ri";
import { MdFileDownload } from "react-icons/md";
import { getPagePermission } from "../../../utils/permissionHelper";
import { ApprovedOutletPaginated, beatListPaginated } from "../../../api/api";
import PaginatedSearchableSelect from "../../../components/PaginatedSearchableSelect";
import { fetchBrands } from "../../../redux/brandSlice";

const SalesBillReport = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [deliveryDateRange, setDeliveryDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [billStatus, setBillStatus] = useState("all");

  // State for CSV and page loading (example usage)
  const [loading, setLoading] = useState(false);
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  const [billNo, setBillNo] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);

  const [salesman, setSalesman] = useState("all");
  const [route, setRoute] = useState("");
  const [retailer, setRetailer] = useState("");

  const [retailerPhone, setRetailerPhone] = useState("all");
  const [outletCode, setOutletCode] = useState("all");

  const [orderType, setOrderType] = useState("all");
  const [paymentMode, setPaymentMode] = useState("all");
  const [orderSource, setOrderSource] = useState("all");
  const [salesmanList, setSalesmanList] = useState([]);
  const [routeList, setRouteList] = useState([]);
  const [retailerPhoneList, setRetailerPhoneList] = useState([]);
  const [outletCodeList, setOutletCodeList] = useState([]);
  const [orderStatus, setOrderStatus] = useState("all");
  const { brands } = useSelector((state) => state.brand);
  const activeBrands = brands.filter((b) => b.status === true);
  const dispatch = useDispatch();

  const { distributors } = useSelector((state) => state.distributors);

  let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Handler for resetting filters
  const handleResetFilter = () => {
    setDateRange({ startDate: null, endDate: null });
    setDeliveryDateRange({ startDate: null, endDate: null });

    setBillStatus("all");

    setBillNo("");
    setOrderNo("");

    setSalesman("all");
    setRoute("all");
    setRetailer("all");


    setRetailerPhone("all");
    setOutletCode("all");

    setOrderType("all");
    setPaymentMode("all");
    setOrderSource("all");
    setOrderStatus("all");

    setSelectedDistributors([]);
  };

  const fetchOutletsWithSearch = async (searchTerm = "", page = 1) => {
    try {
      const query = {
        page,
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
      toast.error("Failed to fetch retailers");
      return { data: [], hasMore: false };
    }
  };

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "sales-bill-report");
    setPagePermission(permission);
  }, [permissionState]);

  let downloadReport = async () => {
    try {
      setLoading(true);
      let allData = [];
      let currentPage = 1;
      let toastId = toast.loading("Processing...");

      // Check if at least one date range is selected
      const hasCreationDateRange = dateRange?.startDate && dateRange?.endDate;
      const hasDeliveryDateRange =
        deliveryDateRange?.startDate && deliveryDateRange?.endDate;

      if (!hasCreationDateRange && !hasDeliveryDateRange) {
        toast.error(
          "Please select either bill creation date range or bill delivery date range.",
          {
            id: toastId,
          },
        );
        setLoading(false);
        return;
      }

      // Check if both date ranges are selected (not allowed)
      if (hasCreationDateRange && hasDeliveryDateRange) {
        toast.error(
          "Please select only one date range - either bill creation date or bill delivery date.",
          {
            id: toastId,
          },
        );
        setLoading(false);
        return;
      }

      // Check if delivery date range is selected but bill status is not "Delivered"
      if (hasDeliveryDateRange && billStatus !== "Delivered") {
        toast.error(
          "Bill status must be 'Delivered' when using delivery date range filter.",
          {
            id: toastId,
          },
        );
        setLoading(false);
        return;
      }

      while (currentPage) {
        // Changed loop condition, break logic handles exit
        toast.loading(`Processing Page ${currentPage}...`, {
          id: toastId,
        });

        // Build query object
        const query = {
          page: currentPage,
          limit: 200,
        };

        // ✅ Date filters
        if (hasCreationDateRange) {
          query.fromDate = dateRange.startDate;
          query.toDate = dateRange.endDate;
        }

        if (hasDeliveryDateRange) {
          query.deliveryFromDate = deliveryDateRange.startDate;
          query.deliveryToDate = deliveryDateRange.endDate;
        }

        // ✅ Basic filters
        if (billStatus !== "all") query.billStatus = billStatus;
        if (billNo) query.billNo = billNo;
        if (orderNo) query.orderNo = orderNo;
        if (selectedBrands.length > 0) {
          if (!selectedBrands.includes("all")) {
            query.brandIds = selectedBrands.join(",");
          }
        }
        // ✅ Dropdown filters
        if (salesman !== "all") query.salesmanName = salesman;
        if (route) query.routeId = route;
        if (retailer) query.retailerId = retailer;

        if (retailerPhone !== "all") query.retailerPhone = retailerPhone;
        if (outletCode !== "all") query.outletCode = outletCode;

        if (orderType !== "all") query.orderType = orderType;
        if (paymentMode !== "all") query.paymentMode = paymentMode;
        if (orderSource !== "all") query.orderSource = orderSource;
        if (orderStatus !== "all") query.orderStatus = orderStatus;

        // ✅ Distributor
        if (selectedDistributors.length > 0) {
          if (!selectedDistributors.includes("all")) {
            query.distributorIds = selectedDistributors.join(",");
          }
        }
        console.log("ROUTE STATE:", route);
        console.log("FINAL QUERY:", query);

        // Fetching the paginated data from backend
        const response = await AllBillListReport({ ...query });

        const data = response?.data?.data || [];
        const pagination = response?.data?.pagination;

        if (data.length > 0) {
          allData = [...allData, ...data];
        }

        // Use a small delay to prevent UI freeze and potential rate limits
        await delay(200); // Reduced delay slightly

        // Check break conditions
        if (data.length === 0) {
          // No more data on this page, assume we're done
          break;
        }
        // Optional: More robust check using totalPages if available and reliable
        const totalPages = pagination?.totalPages || 0;
        if (currentPage >= totalPages) {
          break;
        }

        currentPage++;
      }

      if (allData.length === 0) {
        toast.error("No data available for the selected criteria.", {
          id: toastId,
        });
        setLoading(false);
        return;
      }

      toast.success("Data fetched. Preparing download...", {
        id: toastId,
      });

      // console.log({ allData });

      // --- Transformation Step: Flatten data for CSV ---
      const flattenedData = allData.flatMap((bill) => {

        // Handle cases where lineItems might be missing or empty
        if (!bill.lineItems || bill.lineItems.length === 0) {
          // Optionally create a row for the bill itself with empty item details
          // Or simply skip this bill if no line items exist
          return []; // Skip bills with no line items
        }

        return bill?.lineItems
          ?.filter((item) => item?.itemBillType !== "Item Removed")
          ?.map((item) => ({
            // --- Bill Level Information ---
            "Bill No": bill.new_billno || bill.billNo,
            "Bill Creation Date": moment(bill.createdAt)
              .tz("Asia/Kolkata")
              .format("DD/MM/YYYY"),
            "Bill Delivery Date": moment(bill?.dates?.deliveryDate)
              .tz("Asia/Kolkata")
              .format("DD/MM/YYYY"),
            "Bill Status": bill.status,
            "Order No": bill.orderNo,
            "Order Date": moment(bill?.orderId?.createdAt)
              .tz("Asia/Kolkata")
              .format("DD/MM/YYYY hh:mm a"),
            "Distributor Code": bill.distributorId?.dbCode,
            "Distributor Name": bill.distributorId?.name,
            // "Distributor's Zone": bill.distributorId?.stateId?.zoneId?.name,
            "Distributor's State": bill.distributorId?.stateId?.name,
            "Distributor's City": bill.distributorId?.city,
            // "Allocation No": bill?.loadSheetId?.allocationNo,
            // "Vehicle No": bill?.loadSheetId?.vehicleId?.vehicle_no,

            "Salesman Emp ID": bill.salesmanName?.empId,
            "Salesman Name": bill.salesmanName?.name,
            "Reporting Manager":
              bill?.salesmanName?.empMappingId?.rmEmpId?.name &&
              bill?.salesmanName?.empMappingId?.rmEmpId?.empId
                ? `${bill.salesmanName.empMappingId.rmEmpId.name}(${bill.salesmanName.empMappingId.rmEmpId.empId})`
                : "",
            "Route Code": bill.routeId?.code,
            "Route Name": bill.routeId?.name,
            "Retailer Code": bill.retailerId?.outletCode,
            "Retailer UID": bill.retailerId?.outletUID,
            "Retailer Name": bill.retailerId?.outletName,
            // --- Line Item Information ---
            "Product Code": item.product?.product_code,
            "Product Name": item.product?.name,
            "SKU Group Code": item.product?.sku_group_id,
            "SKU Group Name": item.product?.sku_group__name,
            // "Category Code": item.product?.cat_id?.code,
            "Category Name": item.product?.cat_id?.name,
            // "Collection Code": item.product?.collection_id?.code,
            "Collection Name": item.product?.collection_id?.name,
            // "Brand Code": item.product?.brand?.code,
            "Brand Name": item?.product?.brand?.name,
            "Sub-Brand Name": item?.product?.subBrand?.name,
            Size: item.product?.size,
            "HSN Code": item?.product?.product_hsn_code,
            UOM: item.uom,
            RLP: item.price?.rlp_price,
            DLP: item.price?.dlp_price,
            MRP: item.price?.mrp_price,
            "Order Qty in PCs": item?.oderQty,
            "Order Qty in BOX":
              item?.oderQty /
              Number(item?.product?.no_of_pieces_in_a_box || 1)?.toFixed(2),
            "Bill Qty": item?.billQty,
            "Gross Amt": item?.grossAmt,
            "Scheme Discount": item?.schemeDisc,
            "Distributor Discount": item?.distributorDisc,
            "Taxable Amt": item?.taxableAmt,
            CGST: item?.totalCGST,
            SGST: item?.totalSGST,
            IGST: item?.totalIGST,
            "Net Amt": item?.netAmt,
            "Total Bill Value": bill?.netAmount,
            // "Bill Type": item?.itemBillType,
            "Goods Type": item?.goodsType,
            Remark: item?.remark,
            // "Base Point":
            //   bill?.distributorId?.RBPSchemeMapped === "yes"
            //     ? Number(
            //       Number(
            //         item?.useBasePoint ?? item?.product?.base_point ?? 0,
            //       ) * Number(item?.billQty ?? 0),
            //     )
            //     : 0,
            // "Total Bill Points":
            //   bill?.distributorId?.RBPSchemeMapped === "yes"
            //     ? Number(bill?.totalBasePoints ?? 0)
            //     : 0,
          }));
      });
      // --- End Transformation Step ---

      if (flattenedData.length === 0) {
        // This might happen if all bills had empty lineItems
        toast.error("No line item data found in the fetched bills.", {
          id: toastId,
        });
        setLoading(false);
        return;
      }

      // Generate CSV using PapaParse
      const csv = Papa.unparse(flattenedData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none"; // Hide the link
      a.href = url;
      a.download = `sales-bill-report-csp-${moment()
        .tz("Asia/Kolkata")
        .format("DD-MM-YY")}.csv`; // Updated filename
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Report downloaded successfully!", {
        id: toastId,
      });
    } catch (error) {
      console.error("Download Report Error:", error);
      // Use the existing toastId to update the message
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download report",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesman();
    fetchRoutes();
  }, []);


  const fetchSalesman = async () => {
    const res = await EmployeesListByDistributor();
    setSalesmanList(res?.data?.data || []);
  };

  const fetchRoutes = async () => {
    const res = await BeatListByDistributor();
    setRouteList(res?.data?.data || []);
  };


  useEffect(() => {
    dispatch(fetchDistributors());
    dispatch(fetchBrands());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleDeliveryDateRangeChange = (range) => {
    setDeliveryDateRange(range);
  };

  const handleDistributorChange = (e) => {
    setSelectedDistributors(e.target.value);
  };

  const fetchBeatsWithSearch = async (search = "", page = 1) => {
    try {
      const query = {
        page,
        limit: 20,
        ...(search && { search }),
      };

      const res = await beatListPaginated(query);

      const totalPages = res?.data?.pagination?.totalPages || 0;

      return {
        data: (res?.data?.data || []).map((item) => ({
          _id: item._id,
          name: item.name,
          desc: item.code,
        })),
        pagination: {
          hasMore: page < totalPages,
        },
      };
    } catch (err) {
      console.error(err);
      return {
        data: [],
        pagination: { hasMore: false },
      };
    }
  };

 return (
  <>
    {pagePermission?.view ? (
      <div className="flex justify-start items-center flex-col w-full">
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Sales Bill Report</h1>
          </div>
        </div>

        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <Card className="flex justify-center items-center flex-col w-full p-4">

            {/* ✅ FIXED GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

              {/* Bill Creation Date */}
              <div>
                <Label value="Bill Creation Date" />
                <Datepicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  showShortcuts
                  disabled={loading}
                />
              </div>

              {/* Delivery / Cancelled Date */}
              <div>
                <Label value="Delivery / Cancelled Date" />
                <Datepicker
                  value={deliveryDateRange}
                  onChange={handleDeliveryDateRangeChange}
                  showShortcuts
                  disabled={loading}
                />
              </div>

              {/* Bill Status */}
              <div>
                <Label value="Bill Status" />
                <Select
                  value={billStatus}
                  onChange={(e) => setBillStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </div>

              {/* Route */}
              <div>
                <Label value="Route" />
                <PaginatedSearchableSelect
                  id="route-select"
                  className="w-full"
                  fetchOptions={fetchBeatsWithSearch}
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="Select Route"
                  displayKey="name"
                  valueKey="_id"
                  descKey="desc"
                  searchPlaceholder="Search Route..."
                />
              </div>

              {/* Distributor */}
              <div>
                <Label value="Select Distributor(s)" />
                <SearchableSelect
                  id="distributor-select"
                  className="w-full"
                  options={distributors}
                  value={selectedDistributors}
                  onChange={handleDistributorChange}
                  placeholder="Select Distributor(s)"
                  disabled={loading}
                  displayKey="name"
                  descKey="dbCode"
                  valueKey="_id"
                  multiple
                />
              </div>

              {/* Retailer */}
              <div>
                <Label value="Retailer" />
                <PaginatedSearchableSelect
                  id="retailer-select"
                  className="w-full"
                  fetchOptions={fetchOutletsWithSearch}
                  value={retailer}
                  onChange={(e) => setRetailer(e.target.value)}
                  placeholder="Select Retailer"
                  displayKey="outletName"
                  descKey="outletUID"
                  valueKey="_id"
                  searchPlaceholder="Search Retailer..."
                />
              </div>

              {/* ✅ FIXED BRAND (no center wrapper) */}
              <div>
                <Label value="Brand" />
                <SearchableSelect
                  id="brand-select"
                  options={activeBrands}
                  value={selectedBrands}
                  onChange={(e) => setSelectedBrands(e.target.value)}
                  placeholder="Select Brand"
                  displayKey="name"
                  valueKey="_id"
                  multiple={true}
                />
              </div>
    {/* Retailer Phone */}
                {/* <div className="w-56">
                  <Label value="Retailer Phone" />
                  <SearchableSelect
                    options={retailerPhoneList}
                    value={retailerPhone}
                    onChange={(e) => setRetailerPhone(e.target.value)}
                    displayKey="phoneDisplay"
                    valueKey="mobile1"
                  />
                </div> */}

                {/* Outlet Code */}
                {/* <div className="w-56">
                  <Label value="Outlet Code" />
                  <SearchableSelect
                    options={outletCodeList}
                    value={outletCode}
                    onChange={(e) => setOutletCode(e.target.value)}
                    displayKey="outletCodeDisplay"
                    valueKey="outletCode"
                  />
                </div> */}

                {/* Order Status */}
                {/* <div className="w-44">
                  <Label value="Order Status" />
                  <Select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                    <option value="all">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed_Billed">Completed</option>
                  </Select>
                </div> */}
            </div>

            {/* ✅ BUTTON ALIGN FIX */}
            <div className="flex justify-end items-center gap-3 mt-4">
              {pagePermission?.view && (
                <Button
                  className="text-xs text-white"
                  size="xs"
                  color="success"
                  onClick={handleResetFilter}
                  disabled={loading}
                >
                  <span className="flex justify-center items-center gap-2">
                    <RiRefreshFill size={20} />
                    Reset Filters
                  </span>
                </Button>
              )}

              {pagePermission?.view && (
                <Button
                  className="text-xs text-oWhite-100"
                  size="xs"
                  color="blue"
                  disabled={loading}
                  onClick={() => downloadReport()}
                >
                  {loading ? (
                    <Spinner size="sm" className="mx-2" />
                  ) : (
                    <MdFileDownload size={20} className="mx-2" />
                  )}
                  {loading ? "Downloading..." : "Download Report"}
                </Button>
              )}
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

export default SalesBillReport;
