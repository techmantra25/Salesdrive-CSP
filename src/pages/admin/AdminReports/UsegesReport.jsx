import { Button, Card, Label, Select } from "flowbite-react";
import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";
import { RiRefreshFill } from "react-icons/ri";
import Datepicker from "react-tailwindcss-datepicker";
import toast from "react-hot-toast";
import { getDistributorUsageReport } from "../../../api/api";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../../utils/permissionHelper";
import moment from "moment";
import SearchableSelect from "../../../components/SearchableSelect";
import { AllDistributorList } from "../../../api/api"; 


const UsegesReport = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [dbStatus, setDbStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState("all");
  const [distributors, setDistributors] = useState([]);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  /* ---------------- GET PERMISSION ---------------- */
  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const slug = "usage-report";
    const permission = getPagePermission(permissionState, slug);
    setPagePermission(permission);
  }, [permissionState]);

  /* ---------------- FETCH DISTRIBUTORS (API) ---------------- */
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await AllDistributorList();
        setDistributors(res?.data?.data || []);
      } catch (error) {
        toast.error("Failed to load distributors");
      }
    };

    fetchDistributors();
  }, []);

  /* ---------------- DOWNLOAD ---------------- */
  const handleDownload = async () => {
    try {
      setLoading(true);

      const payload = {
        dbStatus,
        distributorId: selectedDistributor,
      };

      if (dateRange.startDate && dateRange.endDate) {
        payload.fromDate = dateRange.startDate;
        payload.toDate = dateRange.endDate;
      }

      const res = await getDistributorUsageReport(payload);

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "text/csv" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `distributor_usage_report-${moment().format("DD-MM-YYYY")}.csv`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(error.message || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDateRange({ startDate: null, endDate: null });
    setDbStatus("all");
    setSelectedDistributor("all");
  };

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex flex-col w-full h-full">
          <div className="flex justify-between w-full items-center border-b-2 py-4 px-4">
            <h1 className="text-2xl font-bold text-white">Usage Report</h1>
          </div>

          <div className="flex justify-center items-start mt-16">
            <Card className="w-[520px] bg-[#1f2937] border border-gray-700">
              <div className="grid grid-cols-2 gap-4">

                {/* DB STATUS */}
                <div>
                  <Label className="text-white mb-1" value="DB Status" />
                  <Select
                    value={dbStatus}
                    onChange={(e) => setDbStatus(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>

                {/* DATE RANGE */}
                <div>
                  <Label className="text-white mb-1" value="Filter by Date" />
                  <Datepicker
                    value={dateRange}
                    onChange={setDateRange}
                    showShortcuts={true}
                    inputClassName="bg-gray-700 border-gray-600 text-white w-full rounded-lg"
                  />
                </div>

                {/* DISTRIBUTOR (Now API Based) */}
                <SearchableSelect
                  id="distributor"
                  options={[
                    { _id: "all", name: "All Distributors" },
                    ...distributors,
                  ]}
                  value={selectedDistributor}
                  onChange={(e) =>
                    setSelectedDistributor(e.target.value || "all")
                  }
                  placeholder="Distributor"
                  displayKey="name"
                  valueKey="_id"
                  className="w-full"
                />
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <Button
                  color="success"
                  size="sm"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <RiRefreshFill size={18} className="mr-2" />
                  Reset & Refresh
                </Button>

                <Button
                  color="blue"
                  size="sm"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  <FaDownload size={14} className="mr-2" />
                  {loading ? "Downloading..." : "Download Report"}
                </Button>
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
            <div className="text-gray-400 text-lg">
              You do not have permission to view this page.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsegesReport;