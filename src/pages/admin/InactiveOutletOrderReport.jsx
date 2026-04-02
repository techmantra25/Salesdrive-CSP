import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import toast from "react-hot-toast";

import InactiveOutletOrder from "../../pages/admin/InactiveOutletOrder";
import { getInactiveOutletOrder } from "../../api/salesApi";
import { useSelector } from "react-redux";

const InactiveOutletOrderReport = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = useSelector((state) => state.permission?.data?.role);
  const navigate = useNavigate();

  // ✅ Fetch fresh report data
  const fetchReportData = async () => {
    try {
      setLoading(true);

      const response = await getInactiveOutletOrder();

      if (response?.data?.success) {
        setOrdersData(response.data.data);
      } else {
        toast.error("Failed to fetch inactive outlet transactions");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Error fetching report",
      );
    } finally {
      setLoading(false);
    }
  };

  // Load report on mount
  useEffect(() => {
    fetchReportData();
  }, []);

  // Close report
  const handleClose = () => {
    navigate(`/${role}/sales-order-log`);
  };

  // Refresh report
  const handleRefresh = () => {
    toast.success("Refreshing report...");
    fetchReportData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">
          Loading inactive outlet report...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          Inactive Outlet Transactions Report
        </h1>

        <div className="flex gap-2">
          <Button onClick={handleRefresh} color="blue">
            ↻ Refresh
          </Button>

          <Button onClick={handleClose} color="gray">
            Close
          </Button>
        </div>
      </div>

      {/* Report Component */}
      <InactiveOutletOrder ordersData={ordersData} />
    </div>
  );
};

export default InactiveOutletOrderReport;
