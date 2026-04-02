import { Button, Card, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "../../../components/SearchableSelect";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { BACKEND_URL } from "../../../constants";
import toast from "react-hot-toast";
import { fetchBrands } from "../../../redux/brandSlice";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { setAuthHeader } from "../../../api/api";
import { getPagePermission } from "../../../utils/permissionHelper";


const DistributorRBPLedger = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const permissionState = useSelector((state) => state.permission);
const [pagePermission, setPagePermission] = useState(null);


  const dispatch = useDispatch();
  const { distributors } = useSelector((state) => state.distributors);

  const { brands } = useSelector((state) => state.brand);
  const activeBrands = brands.filter((brand) => brand.status === true);

  useEffect(() => {
  if (!permissionState?.data?.data) return;
  const permission = getPagePermission(permissionState, "distributor-rbp-ledger");
  setPagePermission(permission);
}, [permissionState]);


  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleDistributorChange = (e) => {
    setSelectedDistributors(e.target.value);
  };

  const downloadLedger = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select a Date Range.");
      return;
    }

    try {
      setIsDownloading(true);
      toast.loading("Downloading ledger...");

      const query = {};
      if (dateRange.startDate && dateRange.endDate) {
        query.startDate = dateRange.startDate;
        query.endDate = dateRange.endDate;
      }
      if (selectedDistributors.length > 0) {
        if (!selectedDistributors.includes("all")) {
          query.distributorIds = selectedDistributors.join(",");
        }
      }

      if (selectedDistributors.includes("all")) {
        query.distributorIds = "all";
      }

      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes("all")) {
          query.brandIds = selectedBrands.join(",");
        }
      }

      if (selectedBrands.includes("all")) {
        query.brandIds = "all";
      }

      const params = new URLSearchParams(query).toString();
      const url = `${BACKEND_URL}/api/v1/db-transaction/download-report?${params}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          ...setAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download ledger");
      }

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      link.download = `distributor-rbp-ledger-csp-${moment().format("DD-MM-YYYY")}.csv`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.dismiss();
      toast.success("Ledger downloaded successfully!");
    } catch (error) {
      console.error("Error downloading ledger:", error);
      toast.dismiss();
      toast.error("Failed to download ledger. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleResetFilter = () => {
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setSelectedDistributors([]);
    setSelectedBrands([]);
  };

  useEffect(() => {
    dispatch(fetchDistributors());
    dispatch(fetchBrands());
  }, [dispatch]);

return (
  <>
    {pagePermission?.view ? (
      <div className="flex justify-start items-center flex-col w-full">

      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold">Distributor RBP Ledger</h1>
        </div>
      </div>
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="flex justify-center items-center flex-col">
          <div className="flex justify-center w-full items-end gap-2 flex-wrap">
            {/* Brands Filter */}
            <div className="w-56">
              <Label value="Select Brands" />
              <SearchableSelect
                id="brandId"
                options={activeBrands}
                value={selectedBrands}
                onChange={(e) => setSelectedBrands(e.target.value)}
                placeholder="Select Brands"
                displayKey="name"
                valueKey="_id"
                descKey="desc"
                multiple={true}
                disabled={isDownloading}
              />
            </div>

            {/* Distributor Filter */}
            <div className="w-56">
              <Label value="Select Distributor" />
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
                disabled={isDownloading}
              />
            </div>
            {/* Date Filter */}
            <div className="w-64">
              <div className="block">
                <Label htmlFor="dateRangeSelect" value="Filter by Date" />
              </div>
              <Datepicker
                inputClassName={
                  "relative py-2.5 pl-4 pr-14 w-full border border-gray-300  rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-cyan-500"
                }
                containerClassName="relative z-50"
                showShortcuts={true}
                value={dateRange}
                onChange={handleDateRangeChange}
                disabled={isDownloading}
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
              disabled={isDownloading}
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
              onClick={downloadLedger}
              disabled={isDownloading}
            >
              <FaDownload size={15} className="mx-2" />
              {isDownloading ? "Downloading..." : "Download Ledger"}
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

export default DistributorRBPLedger;
