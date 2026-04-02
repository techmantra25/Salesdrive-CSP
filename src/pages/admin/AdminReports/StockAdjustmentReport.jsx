import { useEffect, useState } from "react";
import { getAllTransactionListReport } from "../../../api/stockTransactionApi";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { Button, Card, Label, Select, Spinner } from "flowbite-react";
import Datepicker from "react-tailwindcss-datepicker";
import { RiRefreshFill } from "react-icons/ri";
import { MdFileDownload } from "react-icons/md";
import SearchableSelect from "../../../components/SearchableSelect";
import moment from "moment";
import Papa from "papaparse";

const StockAdjustmentReport = () => {
  const [selectedAdjustmentType, setSelectedAdjustmentType] = useState("all");
  const [selectedStockType, setSelectedStockType] = useState("all");
  const [selectTransactionFor, setSelectTransactionFor] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const { distributors } = useSelector((state) => state.distributors);

  let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  let downloadReport = async () => {
    try {
      setLoading(true);
      let allData = [];
      let currentPage = 1;
      let toastId = toast.loading("Processing...");

      if (!dateRange.startDate || !dateRange.endDate) {
        toast.error("Please select date range.", {
          id: toastId,
        });
        return;
      }

      while (currentPage) {
        toast.loading(`Processing Page ${currentPage}...`, {
          id: toastId,
        });

        const query = {
          page: currentPage,
          limit: 200,
        };

        if (selectedDistributors.length > 0) {
          if (!selectedDistributors.includes("all")) {
            query.distributorIds = selectedDistributors.join(",");
          }
        }

        if (selectedStockType !== "all") {
          query.stockType = selectedStockType;
        }

        if (selectTransactionFor !== "all") {
          query.transactionFor = selectTransactionFor;
        }

        if (selectedAdjustmentType !== "all") {
          query.type = selectedAdjustmentType;
        }

        if (dateRange.startDate && dateRange.endDate) {
          query.fromDate = dateRange.startDate;
          query.toDate = dateRange.endDate;
        }

        const response = await getAllTransactionListReport(query);

        const data = response?.data?.data || [];
        const totalPages = response?.data?.pagination?.totalPages || 0;

        if (data.length > 0) {
          allData = [...allData, ...data];
        }

        await delay(100);

        if (allData.length === 0 || currentPage >= totalPages) {
          break;
        }

        currentPage++;
      }

      if (allData.length === 0) {
        toast.error("No data available to download.", {
          id: toastId,
        });
        return;
      }

      toast.success("Data fetched successfully.", {
        id: toastId,
      });

      let csvData = [...allData];

      csvData = csvData.map((item) => {
        return {
          "Distributor Code": item?.distributorId?.dbCode,
          "Distributor Name": item?.distributorId?.name,
          "Adjustment No": item.transactionId,
          "Adjustment Date Time": moment(item.date)
            .tz("Asia/Kolkata")
            .format("DD/MM/YYYY hh:mm A"),
          "Product Code": item.productId?.product_code,
          "Product Name": item.productId?.name,
          "Adjustment Type": item.type,
          "Adjustment For": item.transactionType,
          "Stock Type": item.stockType,
          "Adjustment Quantity": item.qty,
          // "Remaining Balance Count": item.balanceCount,
          Remarks: item.description,
        };
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectTransactionFor}_adjustment_report_${moment()
        .tz("Asia/Kolkata")
        .format("DD-MM-YY_hh-mm-ss-a")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded successfully!", { position: "top-right" });
      setTimeout(() => {
        toast.dismiss(); // Dismiss the loading toast
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch adjustment list"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setDateRange({ startDate: null, endDate: null });
    setSelectedAdjustmentType("all");
    setSelectTransactionFor("all");
    setSelectedStockType("all");
    setSelectedDistributors([]);
  };

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  const handleDistributorChange = (e) => {
    setSelectedDistributors(e.target.value);
  };

  return (
    <div className="flex justify-start items-center flex-col w-full">
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold">Stock Adjustment Report</h1>
        </div>
      </div>
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="flex justify-center items-center flex-col">
          {/* filters */}
          <div className="flex justify-center w-full items-end gap-2 flex-wrap">
            <div className="w-64">
              <div className="mb-2 block">
                <Label htmlFor="dateRangeSelect" value="Select Date Range" />
                <span className="text-md text-red-500 ms-1">*</span>
              </div>
              <Datepicker
                inputClassName={
                  "relative py-2.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-cyan-500"
                }
                showShortcuts={true}
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>

            <div className="w-56">
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

            <div className="w-40">
              <div className="mb-2 block">
                <Label
                  htmlFor="AdjustmentType"
                  value="Select Adjustment Type"
                />
              </div>
              <Select
                value={selectedAdjustmentType}
                onChange={(e) => setSelectedAdjustmentType(e.target.value)}
                id="AdjustmentTypeSelect"
                required
              >
                <option value="all">All</option>
                <option value="In">Add</option>
                <option value="Out">Reduce</option>
              </Select>
            </div>

            <div className="w-40">
              <div className="mb-2 block">
                <Label htmlFor="StockType" value="Select Stock Type" />
              </div>
              <Select
                value={selectedStockType}
                onChange={(e) => setSelectedStockType(e.target.value)}
                id="StockType"
              >
                <option value="all">All</option>
                <option value="salable">Salable</option>
                <option value="unsalable">Unsalable</option>
                <option value="offer">Offer</option>
              </Select>
            </div>

            <div className="w-40">
              <div className="mb-2 block">
                <Label htmlFor="StockType" value="Select Adjustment For" />
              </div>
              <Select
                value={selectTransactionFor}
                onChange={(e) => setSelectTransactionFor(e.target.value)}
                id="StockType"
              >
                <option value="all">All</option>
                <option value="openingstock">Opening Stock</option>
                <option value="stockadjustment">Stock Adjustment</option>
                <option value="invoice">Invoice</option>
                <option value="stocktransfer">Stock Transfer</option>
                <option value="salesreturn">Sales Return</option>
                <option value="delivery">Delivery</option>
              </Select>
            </div>
          </div>

          {/* buttons */}
          <div className="flex justify-center w-full items-end gap-2 flex-wrap">
            <div>
              <Button
                className="text-xs text-oWhite-100"
                size="sm"
                color="success"
                onClick={handleResetFilter}
                disabled={loading}
              >
                <span className="flex justify-center items-center ">
                  <RiRefreshFill size={20} />
                  Reset & Refresh
                </span>
              </Button>
            </div>
            <div>
              <Button
                className="text-xs text-oWhite-100"
                size="sm"
                color="blue"
                disabled={loading}
                onClick={() => downloadReport()}
              >
                {loading ? (
                  <Spinner size="sm" className="mx-2" />
                ) : (
                  <span className="flex justify-center items-center">
                    <MdFileDownload size={20} />
                    {selectTransactionFor === "all" && "All Adjustment Report"}
                    {selectTransactionFor === "openingstock" &&
                      "Opening Stock Adjustment Report"}
                    {selectTransactionFor === "stockadjustment" &&
                      "Stock Adjustment Report"}
                    {selectTransactionFor === "invoice" &&
                      "Invoice Stock Adjustment Report"}
                    {selectTransactionFor === "stocktransfer" &&
                      "Stock Transfer Adjustment Report"}
                    {selectTransactionFor === "salesreturn" &&
                      "Sales Return Adjustment Report"}
                    {selectTransactionFor === "delivery" &&
                      "Delivery Adjustment Report"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StockAdjustmentReport;
