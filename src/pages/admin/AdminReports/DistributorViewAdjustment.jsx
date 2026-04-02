import {
  Button,
  Card,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "../../../components/SearchableSelect";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { BACKEND_URL } from "../../../constants";
import moment from "moment";
import { setAuthHeader } from "../../../api/api";
import { getPagePermission } from "../../../utils/permissionHelper";


const DistributorViewAdjustment = () => {
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [selectedAdjustmentType, setSelectedAdjustmentType] = useState("all"); // maps to `type`
  const [selectedStockType, setSelectedStockType] = useState("all"); // maps to `stockType`
  const [selectTransactionFor, setSelectTransactionFor] = useState("all"); // maps to `transactionFor`
  const permissionState = useSelector((state) => state.permission);
const [pagePermission, setPagePermission] = useState(null);

useEffect(() => {
  if (!permissionState?.data?.data) return;
  const permission = getPagePermission(
    permissionState,
    "distributor-inventory-report"
  );
  setPagePermission(permission);
}, [permissionState]);


  const dispatch = useDispatch();
  const { distributors } = useSelector((state) => state.distributors);
  

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleDistributorChange = (e) => {
    // SearchableSelect passes e.target.value like native <select multiple>
    let value = e.target.value;

    // Normalise to array
    if (!Array.isArray(value)) {
      value = [value];
    }

    // If "all" is selected, make it exclusive
    if (value.includes("all")) {
      setSelectedDistributors(["all"]);
    } else {
      setSelectedDistributors(value);
    }
  };

  const handleResetFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setSelectedDistributors([]);
    setSelectedAdjustmentType("all");
    setSelectedStockType("all");
    setSelectTransactionFor("all");
    setSearchTerm("");
  };

  // const downloadCSV = () => {
  //   try {
  //     const ids = selectedDistributors.map((v) => String(v));
  //     const hasAll = ids.includes("all");

  //     if (ids.length === 0) {
  //       toast.error(
  //         "Please select at least one Distributor or 'All Distributors'.",
  //         {
  //           position: "top-right",
  //         }
  //       );
  //       return;
  //     }

  //     const query = {};

  //     // Distributor filter
  //     if (!hasAll && ids.length > 0) {
  //       // e.g. "id1,id2,id3"
  //       query.distributorId = ids.join(",");
  //     }
  //     // if hasAll → no distributorId → backend returns all

  //     // Date filter
  //     if (dateRange.startDate && dateRange.endDate) {
  //       // These values come as ISO/string from react-tailwindcss-datepicker, pass as-is
  //       query.fromDate = dateRange.startDate;
  //       query.toDate = dateRange.endDate;
  //     }

  //     // Other filters
  //     if (selectedStockType !== "all") {
  //       query.stockType = selectedStockType;
  //     }

  //     if (searchTerm) {
  //       query.searchTerm = searchTerm.trim();
  //     }

  //     if (selectTransactionFor !== "all") {
  //       query.transactionFor = selectTransactionFor;
  //     }

  //     if (selectedAdjustmentType !== "all") {
  //       query.type = selectedAdjustmentType;
  //     }

  //     const params = new URLSearchParams(query).toString();
  //     const url = `${BACKEND_URL}/api/v1/transaction/view-all-transaction-report?${params}`;

  //     setDownloadLoading(true);
  //     const win = window.open(url, "_blank");
  //     if (!win) {
  //       toast.error("Please allow popups to download the CSV.", {
  //         position: "top-right",
  //       });
  //     }

  //     setTimeout(() => setDownloadLoading(false), 1000);
  //   } catch (error) {
  //     console.error(error);
  //     setDownloadLoading(false);
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.message ||
  //         "Failed to download CSV",
  //       { position: "top-right" }
  //     );
  //   }
  // };

  const downloadCSV = async () => {
    try {
      const ids = selectedDistributors.map((v) => String(v));
      const hasAll = ids.includes("all");

      if (ids.length === 0) {
        toast.error(
          "Please select at least one Distributor or 'All Distributors'.",
          {
            position: "top-center",
          },
        );
        return;
      }

      setDownloadLoading(true);
      toast.loading("Downloading report...");

      const query = {};

      if (!hasAll && ids.length > 0) {
        query.distributorId = ids.join(",");
      }

      if (dateRange.startDate && dateRange.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      if (selectedStockType !== "all") {
        query.stockType = selectedStockType;
      }

      if (searchTerm) {
        query.searchTerm = searchTerm.trim();
      }

      if (selectTransactionFor !== "all") {
        query.transactionFor = selectTransactionFor;
      }

      if (selectedAdjustmentType !== "all") {
        query.type = selectedAdjustmentType;
      }

      const params = new URLSearchParams(query).toString();
      const url = `${BACKEND_URL}/api/v1/transaction/view-all-transaction-report?${params}`;

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

      const filename = `adjustment-report-csp-${moment().format("YYYY-MM-DD")}.csv`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.dismiss();
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download report",
        { position: "top-center" },
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  // Build options with "All Distributors" at the top
  const distributorOptions = [
    { _id: "all", name: "All Distributors", dbCode: "" },
    ...(distributors || []),
  ];

 return (
  <>
    {pagePermission?.view ? (
      <div className="flex justify-start items-center flex-col w-full">

      {/* page header */}
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold">Distributor View Adjustment</h1>
        </div>
      </div>

      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="flex justify-center items-center flex-col w-full">
          <div className="flex justify-center w-full items-end gap-2 flex-wrap">
            {/* Distributor Filter */}
            <div className="w-56">
              <Label value="Select Distributor" />
              <SearchableSelect
                id="distributor-select"
                className="w-full"
                options={distributorOptions}
                value={selectedDistributors}
                onChange={handleDistributorChange}
                placeholder="Select Distributor"
                displayKey="name"
                descKey="dbCode"
                valueKey="_id"
                multiple
                disabled={downloadLoading}
              />
            </div>

            {/* Date Filter */}
            <div className="w-64">
              <div className="block">
                <Label
                  htmlFor="dateRangeSelect"
                  value="Filter by Created Date"
                />
              </div>
              <Datepicker
                inputClassName={
                  "relative py-2.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-cyan-500"
                }
                showShortcuts={true}
                value={dateRange}
                onChange={handleDateRangeChange}
                disabled={downloadLoading}
              />
            </div>

            {/* Adjustment Type */}
            <div className="w-44">
              <div className="block">
                <Label value="Adjustment Type" />
              </div>
              <Select
                value={selectedAdjustmentType}
                onChange={(e) => setSelectedAdjustmentType(e.target.value)}
                id="adjustmentTypeSelect"
                sizing={"sm"}
                disabled={downloadLoading}
              >
                <option value="all">All</option>
                <option value="In">Add</option>
                <option value="Out">Reduce</option>
              </Select>
            </div>

            {/* Stock Type */}
            <div className="w-44">
              <div className="block">
                <Label value="Stock Type" />
              </div>
              <Select
                value={selectedStockType}
                onChange={(e) => setSelectedStockType(e.target.value)}
                id="stockTypeSelect"
                sizing={"sm"}
                disabled={downloadLoading}
              >
                <option value="all">All</option>
                <option value="salable">Salable</option>
                <option value="unsalable">Unsalable</option>
                <option value="offer">Offer</option>
              </Select>
            </div>

            {/* Transaction For */}
            <div className="w-52">
              <div className="block">
                <Label value="Adjustment For" />
              </div>
              <Select
                value={selectTransactionFor}
                onChange={(e) => setSelectTransactionFor(e.target.value)}
                id="transactionForSelect"
                sizing={"sm"}
                disabled={downloadLoading}
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

            {/* Search */}
            <div className="w-56">
              <div className="block">
                <Label value="Search" />
              </div>
              <TextInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Transaction ID / Description"
                sizing={"sm"}
                disabled={downloadLoading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center items-center gap-2 w-full mt-4">
            {pagePermission?.view && (
            <Button
              className="text-xs"
              size="sm"
              color="success"
              onClick={handleResetFilter}
              disabled={downloadLoading}
            >
              <span className="flex justify-center items-center gap-2">
                <RiRefreshFill size={20} />
                Reset & Refresh
              </span>
            </Button>)}
            {pagePermission?.view && (
            <Button
              className="text-xs"
              color="blue"
              size="sm"
              onClick={downloadCSV}
              disabled={downloadLoading}
            >
              {downloadLoading ? (
                <Spinner size="sm" className="mx-2" />
              ) : (
                <FaDownload size={15} className="mx-2" />
              )}
              {downloadLoading ? "Preparing CSV..." : "Download CSV"}
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

export default DistributorViewAdjustment;
