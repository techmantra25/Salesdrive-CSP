import { Button, Card, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "../../../components/SearchableSelect";
import { BACKEND_URL } from "../../../constants";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import moment from "moment";
import toast from "react-hot-toast";
import { setAuthHeader } from "../../../api/api";
import { getPagePermission } from "../../../utils/permissionHelper";


const PurchaseOrderReport = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const permissionState = useSelector((state) => state.permission);
const [pagePermission, setPagePermission] = useState(null);


  const dispatch = useDispatch();

  const { distributors } = useSelector((state) => state.distributors);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };
  useEffect(() => {
  if (!permissionState?.data?.data) return;
  const permission = getPagePermission(permissionState, "purchase-order-report");
  setPagePermission(permission);
}, [permissionState]);


  const handleDistributorChange = (e) => {
    setSelectedDistributors(e.target.value);
  };

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  // const downloadReport = async () => {
  //   let query = {};
  //   if (dateRange.startDate && dateRange.endDate) {
  //     query.startDate = dateRange.startDate;
  //     query.endDate = dateRange.endDate;
  //   }
  //   if (selectedDistributors.length > 0) {
  //     if (!selectedDistributors.includes("all")) {
  //       query.distributorIds = selectedDistributors.join(",");
  //     }
  //   }
  //   const params = new URLSearchParams(query).toString();
  //   const url = `${BACKEND_URL}/api/v1/purchase-order/po-report?${params}`;

  //   window.open(url, "_blank");
  // };

  const downloadReport = async () => {
    try {
      setIsDownloading(true);
      toast.loading("Downloading report...");

      let query = {};
      if (dateRange.startDate && dateRange.endDate) {
        query.startDate = dateRange.startDate;
        query.endDate = dateRange.endDate;
      }
      if (selectedDistributors.length > 0) {
        if (!selectedDistributors.includes("all")) {
          query.distributorIds = selectedDistributors.join(",");
        }
      }

      const params = new URLSearchParams(query).toString();
      const url = `${BACKEND_URL}/api/v1/purchase-order/po-report?${params}`;

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

      const filename = `purchase-order-report-csp-${moment().format("YYYY-MM-DD")}.csv`;
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
      toast.error("Failed to download report. Please try again.");
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
  };

return (
  <>
    {pagePermission?.view ? (
      <div className="flex justify-start items-center flex-col w-full">

      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold">Purchase Order Report</h1>
        </div>
      </div>
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="flex justify-center items-center flex-col">
          <div className="flex justify-center w-full items-end gap-2 flex-wrap">
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
                disabled={isDownloading}
              />
            </div>
            <div className="w-64">
              <div className="block">
                <Label htmlFor="dateRangeSelect" value="PO Date Range" />
              </div>
              <Datepicker
                inputClassName={
                  "relative py-2.5 pl-4 pr-14 w-full border border-gray-300  rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-cyan-500"
                }
                showShortcuts={true}
                value={dateRange}
                onChange={handleDateRangeChange}
                disabled={isDownloading}
              />
            </div>
          </div>
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
              onClick={downloadReport}
              disabled={isDownloading}
            >
              <FaDownload size={15} className="mx-2" />
              Download Report
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

export default PurchaseOrderReport;
