import {
  Button,
  Card,
  Label,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "../../../components/SearchableSelect";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { paginatedOrderToBillReport } from "../../../api/orderApi";
import { getPagePermission } from "../../../utils/permissionHelper";
import { viewGodownList } from "../../../api/api"; // NEW


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Simple CSV converter - backend already handles escaping
const convertToCSV = (data, headers) => {
  if (!data?.length) return "";
  const rows = data.map((row) => headers.map((h) => row[h] || "").join(","));
  return [headers.join(","), ...rows].join("\n");
};

const OrderToBillReport = () => {
  const [downloadLoading, setDownloadLoading] = useState(false);
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

  // NEW: godown filter state
  const [godownList, setGodownList] = useState([]);
  const [godownLoading, setGodownLoading] = useState(false);
  const [selectedGodowns, setSelectedGodowns] = useState([]);

  const dispatch = useDispatch();
  const { distributors } = useSelector((s) => s.distributors);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "order-vs-bill-report");
    setPagePermission(permission);
  }, [permissionState]);

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  // NEW: fetch godown list
  useEffect(() => {
    const fetchGodowns = async () => {
      setGodownLoading(true);
      try {
        const res = await viewGodownList({ page: 1, limit: 100 });
        setGodownList(res?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch godown list", error);
        toast.error("Failed to fetch Godown List");
      } finally {
        setGodownLoading(false);
      }
    };
    fetchGodowns();
  }, []);

  const fetchAllData = async () => {
    let currentPage = 1;
    let allData = [];
    let headers = [];
    let totalPages = 1;

    const query = {};
    if (searchTerm) query.search = searchTerm;
    if (dateRange?.startDate && dateRange?.endDate) {
      query.fromDate = dateRange.startDate;
      query.toDate = dateRange.endDate;
    }
    if (orderSource !== "all") query.orderSource = orderSource;
    if (orderStatus !== "all") query.status = orderStatus;
    if (selectedDistributors.length && !selectedDistributors.includes("all")) {
      query.distributorIds = selectedDistributors.join(",");
    }

    // NEW: godown filter
    if (selectedGodowns.length && !selectedGodowns.includes("all")) {
      query.godownIds = selectedGodowns.join(",");
    }

    try {
      setDownloadLoading(true);
      toast.loading("Downloading data...", { id: "downloadProgress" });

      const first = await paginatedOrderToBillReport({
        page: 1,
        limit: 200,
        ...query,
      });

      headers = first?.data?.headers || [];
      totalPages = first?.data?.pagination?.totalPages || 1;
      allData = [...(first?.data?.data || [])];

      while (currentPage < totalPages) {
        currentPage++;
        toast.loading(`Fetching ${currentPage}/${totalPages}`, {
          id: "downloadProgress",
        });
        await sleep(200);
        const resp = await paginatedOrderToBillReport({
          page: currentPage,
          limit: 200,
          ...query,
        });
        allData = [...allData, ...(resp?.data?.data || [])];
      }

      return { allData, headers };
    } finally {
      setDownloadLoading(false);
      toast.dismiss("downloadProgress");
    }
  };

  const downloadCSV = async () => {
    try {
      const { allData, headers } = await fetchAllData();
      if (!allData.length) {
        toast.error("No data available");
        return;
      }

      const csv = convertToCSV(allData, headers);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `order-vs-bill-report-csp-${moment()
          .tz("Asia/Kolkata")
          .format("DD-MM-YY")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report downloaded");
    } catch (err) {
      toast.error(err?.message || "Failed to download");
    }
  };

  const handleDistributorChange = (e) => {
    setSelectedDistributors(e.target.value);
  };

  const handleGodownChange = (e) => {  // NEW
    setSelectedGodowns(e.target.value);
  };

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex flex-col w-full">

          <div className="flex w-full items-center border-b py-4">
            <h1 className="text-2xl font-bold">Order Vs Bill Report</h1>
          </div>
          <div className="flex flex-col p-4 gap-4">
            <Card>
              <div className="flex gap-2 justify-center items-center flex-wrap">
                <div className="w-68">
                  <Label value="Date Range" />
                  <Datepicker
                    value={dateRange}
                    onChange={setDateRange}
                    showShortcuts={true}
                    inputClassName="relative py-1.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 text-sm tracking-wide placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none"
                    containerClassName="relative z-50"
                    disabled={downloadLoading}
                  />
                </div>
                <div className="w-56">
                  <Label value="Distributors" />
                  <SearchableSelect
                    id="distributor-select"
                    className="w-full"
                    options={distributors}
                    value={selectedDistributors}
                    placeholder="Select Distributors"
                    onChange={handleDistributorChange}
                    displayKey="name"
                    descKey="dbCode"
                    valueKey="_id"
                    multiple
                    disabled={downloadLoading}
                  />
                </div>

                {/* NEW: Godown filter */}
                <div className="w-56">
                  <Label value="Godown" />
                  <SearchableSelect
                    id="godown-select"
                    className="w-full"
                    options={godownList}
                    value={selectedGodowns}
                    placeholder="Select Godown(s)"
                    onChange={handleGodownChange}
                    displayKey="godownName"
                    valueKey="_id"
                    multiple
                    disabled={downloadLoading || godownLoading}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-4 gap-4">
                {pagePermission?.view && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setOrderSource("all");
                      setOrderStatus("all");
                      setSelectedDistributors([]);
                      setSelectedGodowns([]); // NEW
                      setDateRange({ startDate: null, endDate: null });
                    }}
                    size="sm"
                    color="success"
                    disabled={downloadLoading}
                  >
                    <RiRefreshFill className="mr-2" /> Reset
                  </Button>)}
                {pagePermission?.view && (
                  <Button
                    onClick={downloadCSV}
                    disabled={downloadLoading}
                    size="sm"
                    color="blue"
                  >
                    {downloadLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <FaDownload className="mr-2" />
                    )}
                    {downloadLoading ? "Downloading..." : "Download Report"}
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

export default OrderToBillReport;