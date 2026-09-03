import { Button, Card, Label, Select } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "../../../components/SearchableSelect";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import { BACKEND_URL } from "../../../constants";
import { setAuthHeader, viewGodownList } from "../../../api/api";
import { toast } from "react-hot-toast";
import moment from "moment";
import { getPagePermission } from "../../../utils/permissionHelper";

const StockReport = () => {
  const [showZeroStock, setShowZeroStock] = useState(false);
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [selectedGodowns, setSelectedGodowns] = useState([]); // NEW
  const [godownList, setGodownList] = useState([]);           // NEW
  const [godownLoading, setGodownLoading] = useState(false);  // NEW
  const [isDownloading, setIsDownloading] = useState(false);

  const dispatch = useDispatch();

  const { distributors } = useSelector((state) => state.distributors);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "stock-report");
    setPagePermission(permission);
  }, [permissionState]);

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

  let downloadReport = async () => {
    try {
      setIsDownloading(true);
      toast.loading("Downloading report...");

      const query = {};

      if (showZeroStock) {
        query.showZeroStock = true;
      }

      if (selectedDistributors.length > 0) {
        if (!selectedDistributors.includes("all")) {
          query.distributorIds = selectedDistributors.join(",");
        }
      }

      // NEW: godown filter
      if (selectedGodowns.length > 0) {
        if (!selectedGodowns.includes("all")) {
          query.godownIds = selectedGodowns.join(",");
        }
      }

      const params = new URLSearchParams(query).toString();
      const url = `${BACKEND_URL}/api/v1/inventory/all-inventories-paginatedList-report?${params}`;

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

      const filename = `stock-report-csp-${moment().format("YYYY-MM-DD")}.csv`;
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

  const handleGodownChange = (e) => {   // NEW
    setSelectedGodowns(e.target.value);
  };

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  const handleResetFilter = () => {
    setShowZeroStock(false);
    setSelectedDistributors([]);
    setSelectedGodowns([]); // NEW
  };

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col w-full">
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Stock Report</h1>
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

                {/* NEW: Godown filter */}
                <div className="w-56">
                  <Label value="Select Godown(s)" />
                  <SearchableSelect
                    id="godown-select"
                    className="w-full"
                    options={godownList}
                    value={selectedGodowns}
                    onChange={handleGodownChange}
                    placeholder="Select Godown(s)"
                    displayKey="godownName"
                    valueKey="_id"
                    multiple
                    disabled={isDownloading || godownLoading}
                  />
                </div>

                <div className="w-40">
                  <div className="block">
                    <Label value="Show Zero Stock" />
                  </div>
                  <Select
                    value={showZeroStock ? "true" : "false"}
                    onChange={(e) => setShowZeroStock(e.target.value === "true")}
                    disabled={isDownloading}
                  >
                    <option value="true">Show</option>
                    <option value="false">Hide</option>
                  </Select>
                </div>
              </div>
              <div className="flex justify-center items-center gap-2 w-full mt-4">
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
                </Button>
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    color="blue"
                    size="sm"
                    onClick={downloadReport}
                    disabled={isDownloading}
                  >
                    <FaDownload size={15} className="mx-2" />
                    {isDownloading ? "Downloading..." : "Download Report"}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-[70vh] w-full">
          <div className="text-center">
            <div className="text-red-600 text-4xl font-bold mb-2">NO Access</div>
            <div className="text-gray-500 text-lg">
              You do not have permission to view this page.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StockReport;