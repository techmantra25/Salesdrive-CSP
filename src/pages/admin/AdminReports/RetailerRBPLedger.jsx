import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApprovedOutletPaginated,
  getApprovedOutletList,
  SearchOutletsDropdown,
  setAuthHeader,
} from "../../../api/api";
import toast from "react-hot-toast";
import { Button, Card, Label } from "flowbite-react";
import PaginatedSearchableSelect from "../../../components/PaginatedSearchableSelect";
import Datepicker from "react-tailwindcss-datepicker";
import { RiRefreshFill } from "react-icons/ri";
import { FaDownload } from "react-icons/fa";
import { BACKEND_URL } from "../../../constants";
import moment from "moment";
import { getPagePermission } from "../../../utils/permissionHelper";
import { useDispatch, useSelector } from "react-redux";

const RetailerRBPLedger = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedRetailers, setSelectedRetailers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  // Function to fetch outlets with pagination and search
  // const fetchOutletsWithSearch = useCallback(async (searchTerm = "", page = 1) => {
  //   try {
  //     const query = {
  //       page: page,
  //       limit: 50,
  //       ...(searchTerm && { search: searchTerm }),
  //     };

  //     const response = await ApprovedOutletPaginated(query);
  //     const totalPages = response?.data?.pagination?.totalPages || 0;

  //     return {
  //       data: response?.data?.data || [],
  //       hasMore: page < totalPages,
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.message ||
  //         "Failed to fetch outlet list"
  //     );
  //     return { data: [], hasMore: false };
  //   }
  // }, []);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "retailer-rbp-ledger");
    setPagePermission(permission);
  }, [permissionState]);

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
          "Failed to fetch outlet list",
        );
        return { data: [], hasMore: false };
      }
    },
    [],
  );

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleRetailerChange = (e) => {
    setSelectedRetailers(e.target.value);
  };

  const downloadLedger = async () => {
    if (selectedRetailers.length === 0) {
      toast.error("Please Select a Retailer to view ledger.");
      return;
    }
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
      if (selectedRetailers.length > 0) {
        if (!selectedRetailers.includes("all")) {
          query.retailerIds = selectedRetailers.join(",");
        }
      }

      if (selectedRetailers.includes("all")) {
        query.retailerIds = "all";
      }

      const params = new URLSearchParams(query).toString();
      const url = `${BACKEND_URL}/api/v1/outlet-retailer-transaction/download-retailer-ledger-report?${params}`;

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

      link.download = `retailer-rbp-ledger-csp-${moment().format("DD-MM-YYYY")}.csv`;

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
    setSelectedRetailers([]);
  };

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col w-full">

          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Retailer RBP Ledger</h1>
            </div>
          </div>
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="flex justify-center items-center flex-col">
              <div className="flex justify-center w-full items-end gap-2 flex-wrap">
                {/* Retailer Filter */}
                <div className="w-56">
                  <Label value="Select Retailer" />
                  <PaginatedSearchableSelect
                    id="retailer-select"
                    className="w-full"
                    fetchOptions={fetchOutletsWithSearch}
                    value={selectedRetailers}
                    onChange={handleRetailerChange}
                    disabled={dataLoading || isDownloading}
                    placeholder={`Select Retailer`}
                    displayKey="outletName"
                    descKey="outletUID"
                    valueKey="_id"
                    multiple
                    searchPlaceholder="Search Retailer..."
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

                {/* <Button
              className="text-xs"
              color="blue"
              size="sm"
              onClick={downloadLedger}
            >
              <FaDownload size={15} className="mx-2" />
              Download Ledger
            </Button> */}

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

export default RetailerRBPLedger;
