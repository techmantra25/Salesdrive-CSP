import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, Button, Badge } from "flowbite-react";
import { swapOutletOrder } from "../../api/salesApi";

const InactiveOutletOrder = ({ ordersData = [] }) => {
  const [swappingOrder, setSwappingOrder] = useState(null);

  // ✅ Local state so swapped items can be removed without refresh
  const [localOrders, setLocalOrders] = useState([]);

  useEffect(() => {
    setLocalOrders(ordersData);
  }, [ordersData]);

  // ✅ Swap Handler
  const handleSwapRetailer = async (recordId, recordType) => {
    try {
      setSwappingOrder(recordId);

      const response = await swapOutletOrder({
        recordId,
        recordType,
      });

      if (response.data?.success) {
        toast.success("Swapped successfully ✅");

        // ✅ Remove swapped record instantly
        setLocalOrders((prev) => prev.filter((item) => item._id !== recordId));
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Swap failed",
      );
    } finally {
      setSwappingOrder(null);
    }
  };

  // Print
  const handlePrint = () => window.print();

  // Summary statistics
  const totalRecords = localOrders.length;

  const totalPendingBills = localOrders.reduce(
    (sum, item) => sum + (item.pendingBillsCount || 0),
    0,
  );

  // Total Orders Count
  const totalOrders = localOrders.filter(
    (item) => item.type === "Order",
  ).length;

  // Total Bills Count
  const totalBills = localOrders.filter((item) => item.type === "Bill").length;

  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <Card className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-red-600">
            ⚠️ Inactive Outlet Orders & Bills Report
          </h1>

          <Button onClick={handlePrint} color="success">
            🖨️ Print Report
          </Button>
        </div>

        {/* Executive Summary Box */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">
            📊 Executive Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Records */}
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">
                Total Records Found:
              </span>
              <Badge color="failure" className="w-fit mt-1">
                {totalRecords}
              </Badge>
            </div>

            {/* Total Bills */}
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">
                Total Bills Found:
              </span>
              <Badge color="warning" className="w-fit mt-1">
                {totalBills}
              </Badge>
            </div>

            {/* Total Orders */}
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">
                Total Orders Found:
              </span>
              <Badge color="info" className="w-fit mt-1">
                {totalOrders}
              </Badge>
            </div>

            {/* Generated Time */}
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">Report Generated:</span>
              <span className="text-gray-600 mt-1">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Empty State FIX */}
        {totalRecords === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-green-600">
              🎉 All inactive outlet transactions have been swapped!
            </h2>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-4 border-b-2 border-red-200 pb-2">
              📋 Pending Transactions Under Inactive Outlets
            </h2>

            {localOrders.map((item, index) => {
              // ✅ Support both retailerInfo + retailer
              const retailerData = item.retailerInfo || item.retailer;

              return (
                <div
                  key={item._id}
                  className="mb-6 border border-gray-300 rounded-lg overflow-hidden"
                >
                  {/* Record Header */}
                  <div className="bg-gray-100 p-4 border-b border-gray-300">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-700 mb-2">
                      {item.type === "Order" ? (
                        <>
                          🧾 Order #{index + 1}:{" "}
                          <span className="text-blue-700 font-bold">
                            {item.orderNo}
                          </span>
                        </>
                      ) : (
                        <>
                          💳 Bill #{index + 1}:{" "}
                          <span className="text-purple-700 font-bold">
                            {item.billNo}
                          </span>
                        </>
                      )}
                    </h3>

                    {/* Conditional Display */}
                    {item.type === "Order" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">
                            Status:
                          </span>{" "}
                          <Badge color="warning" className="ml-1">
                            {item.status}
                          </Badge>
                        </div>

                        <div>
                          <span className="font-medium text-gray-600">
                            Created:
                          </span>{" "}
                          <span className="text-gray-800">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {item.type === "Bill" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">
                            Order No:
                          </span>{" "}
                          <span className="text-blue-700 font-semibold">
                            {item.orderNo}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-600">
                            Bill No:
                          </span>{" "}
                          <span className="text-purple-700 font-semibold">
                            {item.billNo}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-600">
                            Status:
                          </span>{" "}
                          <Badge color="warning" className="ml-1">
                            {item.status}
                          </Badge>
                        </div>

                        <div>
                          <span className="font-medium text-gray-600">
                            Bill Date:
                          </span>{" "}
                          <span className="text-gray-800">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ✅ Retailer Info FIX */}
                    {/* {retailerData && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <h4 className="font-semibold text-red-700 mb-2">
                          ⚠️ Inactive Retailer Information:
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              Outlet Code:
                            </span>{" "}
                            {retailerData.outletCode}
                          </div>

                          <div>
                            <span className="font-medium text-gray-600">
                              Outlet Name:
                            </span>{" "}
                            {retailerData.outletName}
                          </div>

                          <div>
                            <span className="font-medium text-gray-600">
                              Status:
                            </span>{" "}
                            <Badge color="failure" className="ml-1">
                              Inactive
                            </Badge>
                          </div>

                          <div>
                            <span className="font-medium text-gray-600">
                              Mobile:
                            </span>{" "}
                            {retailerData.mobile || "N/A"}
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* Swap Section */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-semibold text-blue-700 mb-3">
                        🔄 Auto Swap to Active Retailer
                      </h4>

                      <p className="text-sm text-gray-600 mb-2">
                        Inactive Outlet Mobile:{" "}
                        <span className="font-semibold text-red-600">
                          {retailerData?.mobile || "N/A"}
                        </span>
                      </p>

                      <Button
                        onClick={() => handleSwapRetailer(item._id, item.type)}
                        disabled={swappingOrder === item._id}
                        color="blue"
                      >
                        {swappingOrder === item._id ? "Swapping..." : "Swap"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ✅ Footer Fix */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
          <strong className="text-gray-700">End of Report</strong>
          <br />
          <span className="text-gray-600">
            Total Records: {totalRecords} | Total Orders: {totalOrders} | Total
            Bills: {totalBills}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default InactiveOutletOrder;
