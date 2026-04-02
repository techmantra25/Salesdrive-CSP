import { Button, Card, Label, Select } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "../../../components/SearchableSelect";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { BACKEND_URL } from "../../../constants";
import toast from "react-hot-toast";
import moment from "moment";
import { setAuthHeader } from "../../../api/api";
import { getPagePermission } from "../../../utils/permissionHelper";
import { AllBrandList } from "../../../api/api";


const PrimaryInvoiceReport = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [grnDateRange, setGrnDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);


  const dispatch = useDispatch();

  const { distributors } = useSelector((state) => state.distributors);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "primary-invoice-report");
    setPagePermission(permission);
  }, [permissionState]);


  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleGRNDateRangeChange = (range) => {
    setGrnDateRange(range);
  };

  // let downloadReport = async () => {
  //   const query = {};
  //   if (selectedStatus !== "all") query.status = selectedStatus;
  //   if (dateRange.startDate && dateRange.endDate) {
  //     query.startDate = dateRange.startDate;
  //     query.endDate = dateRange.endDate;
  //   }

  //   if (
  //     (grnDateRange.startDate || grnDateRange.endDate) &&
  //     selectedStatus !== "Confirmed"
  //   ) {
  //     toast.error(
  //       "GRN date filter can only be applied when status is 'Confirmed'. Please Select the Status 'Confirmed'"
  //     );
  //     return;
  //   }
  //   if (grnDateRange.startDate && grnDateRange.endDate) {
  //     query.grnStartDate = grnDateRange.startDate;
  //     query.grnEndDate = grnDateRange.endDate;
  //   }
  //   if (selectedDistributors.length > 0) {
  //     if (!selectedDistributors.includes("all")) {
  //       query.distributorIds = selectedDistributors.join(",");
  //     }
  //   }
  //   const params = new URLSearchParams(query).toString();
  //   const url = `${BACKEND_URL}/api/v1/invoice/paginated-invoice-report?${params}`;

  //   window.open(url, "_blank");
  // };
useEffect(() => {
  const fetchBrands = async () => {
    try {
      const res = await AllBrandList();

      const formattedBrands = (res?.data?.data || [])
        .filter((brand) => brand.status === true)
        .map((brand) => ({
          ...brand,
          displayLabel: `${brand.code || ""} - ${brand.desc || ""}`,
        }));

      setBrands(formattedBrands);
    } catch (error) {
      toast.error("Failed to fetch brands");
    }
  };

  fetchBrands();
}, []);
  let downloadReport = async () => {
    const query = {};
    if (selectedStatus !== "all") query.status = selectedStatus;
    if (dateRange.startDate && dateRange.endDate) {
      query.startDate = dateRange.startDate;
      query.endDate = dateRange.endDate;
    }
    if (selectedBrands.length > 0 && !selectedBrands.includes("all")) {
      query.brandIds = selectedBrands.join(",");
    }
    if (
      (grnDateRange.startDate || grnDateRange.endDate) &&
      selectedStatus !== "Confirmed"
    ) {
      toast.error(
        "GRN date filter can only be applied when status is 'Confirmed'. Please Select the Status 'Confirmed'",
      );
      return;
    }
    if (grnDateRange.startDate && grnDateRange.endDate) {
      query.grnStartDate = grnDateRange.startDate;
      query.grnEndDate = grnDateRange.endDate;
    }
    if (selectedDistributors.length > 0) {
      if (!selectedDistributors.includes("all")) {
        query.distributorIds = selectedDistributors.join(",");
      }
    }

    try {
      setIsDownloading(true);
      toast.loading("Downloading report...");

      const params = new URLSearchParams(query).toString();
      const url = `${BACKEND_URL}/api/v1/invoice/paginated-invoice-report?${params}`;

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

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      const filename = `primary-invoice-report-csp-${moment().format("YYYY-MM-DD")}.csv`;
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

  const handleDistributorChange = (e) => {
    setSelectedDistributors(e.target.value);
  };

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  const handleResetFilter = () => {
    setSelectedStatus("all");
    setSelectedBrands([]);
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setGrnDateRange({
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
              <h1 className="text-2xl font-bold">Primary Invoice Report</h1>
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
                <div className="w-56">
                  <Label value="Select Brand(s)" />
                  <SearchableSelect
                    id="brand-select"
                    className="w-full"
                    options={brands}
                    value={selectedBrands}
                    onChange={(e) => setSelectedBrands(e.target.value)}
                    placeholder="Select Brand(s)"
                    displayKey="code"
                    descKey="desc"
                    valueKey="_id"
                    multiple
                    disabled={isDownloading}
                  />
                </div>
                <div className="w-40">
                  <div className="block">
                    <Label value="Select Status" />
                  </div>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    required
                    disabled={isDownloading}
                  >
                    <option value="all">All</option>
                    <option value="In-Transit">In-Transit(GRN Pending)</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Ignored">Ignored</option>
                  </Select>
                </div>

                <div className="w-64">
                  <div className="block">
                    <Label
                      htmlFor="grnDateRangeSelect"
                      value="Filter by GRN Date"
                    />
                  </div>
                  <Datepicker
                    inputClassName={
                      "relative py-2.5 pl-4 pr-14 w-full border border-gray-300  rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 focus:ring-cyan-500"
                    }
                    showShortcuts={true}
                    value={grnDateRange}
                    onChange={handleGRNDateRangeChange}
                    disabled={isDownloading}
                  />
                </div>

                <div className="w-64">
                  <div className="block">
                    <Label
                      htmlFor="dateRangeSelect"
                      value="Filter by Invoice Creation Date"
                    />
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

export default PrimaryInvoiceReport;
