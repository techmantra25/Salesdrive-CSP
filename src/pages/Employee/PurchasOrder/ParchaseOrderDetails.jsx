import { Breadcrumb, Button, Label, Spinner, TextInput } from "flowbite-react";
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPurchaseOrderDetails,
  updatePurchaseOrderStatusByEmp,
} from "../../../api/api";

export const ParchaseOrderDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const { userInfo } = useSelector((state) => state.user);

  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseOrderDetails(id);
      setOrder(res.data.data);
      setCancelReason(res.data.data?.rejectedReason);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      let payload = {
        approvedStatus: "Rejected",
        rejectedReason: cancelReason,
      };
      const res = await updatePurchaseOrderStatusByEmp(id, payload);
      toast.success(res?.data?.message || "Order Rejected");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reject Order"
      );
    } finally {
      fetchDetails();
      setLoading(false);
    }
  };

  const handleSaveOrder = async () => {
    setLoading(true);
    try {
      let payload = {
        approvedStatus: "Approved",
      };
      const res = await updatePurchaseOrderStatusByEmp(id, payload);
      toast.success(res?.data?.message || "Order Approved");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to approve Order"
      );
    } finally {
      fetchDetails();
      setLoading(false);
    }
  };

  const handleEditOrder = async (id) => {
    navigate(`/${userInfo?.role}/purchase-order-edit/` + id);
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col w-full">
        <div className="flex justify-between w-full items-center py-2">
          <div className="flex justify-start items-center w-full">
            <Breadcrumb aria-label="Solid background breadcrumb example">
              <Breadcrumb.Item>Purchase</Breadcrumb.Item>
              <Breadcrumb.Item href={`/${userInfo?.role}/purchase-order-list`}>
                Purchase Order List
              </Breadcrumb.Item>
              <Breadcrumb.Item href="">Purchase Order Details</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex justify-start items-center flex-col gap-2 w-full p-2">
          {loading && (
            <div className="flex justify-center items-center">
              <Spinner size="lg" />
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          {!loading && !error && order && (
            <div className="w-full">
              <div className="p-6 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 w-full gap-4">
                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] dark:bg-slate-800 justify-center">
                    <Label
                      htmlFor="Distributor"
                      value="Distributor"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="order-no"
                      value={
                        order?.distributorId
                          ? `${order.distributorId.name} (${order.distributorId.dbCode})`
                          : ""
                      }
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>

                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] dark:bg-slate-800 justify-center">
                    <Label
                      htmlFor="order-no"
                      value="PO Number"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="order-no"
                      value={order?.purchaseOrderNo || ""}
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>
                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] justify-center dark:bg-slate-800">
                    <Label
                      htmlFor="order-entry-date"
                      value="Order Date"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="order-entry-date"
                      value={
                        moment(order?.createdAt).format("DD-MM-YYYY") || ""
                      }
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>
                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] justify-center dark:bg-slate-800">
                    <Label
                      htmlFor="order-status"
                      value="Order Status"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="order-status"
                      value={order?.status || ""}
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>
                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] justify-center dark:bg-slate-800">
                    <Label
                      htmlFor="expected-delivery"
                      value="Expected Delivery"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="expected-delivery"
                      value={
                        moment(order?.expectedDeliveryDate).format(
                          "DD-MM-YYYY"
                        ) || ""
                      }
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>

                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] justify-center dark:bg-slate-800">
                    <Label
                      htmlFor="supplier"
                      value="Supplier Name"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="supplier"
                      value={order?.supplierId?.supplierName || ""}
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>
                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] justify-center dark:bg-slate-800">
                    <Label
                      htmlFor="address"
                      value="Supplier Address"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="address"
                      value={order?.supplierId?.address || ""}
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>
                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] justify-center dark:bg-slate-800">
                    <Label
                      htmlFor="mobile"
                      value="Supplier Mobile"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="mobile"
                      value={order?.supplierId?.contactNo || ""}
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>
                  <div className="flex flex-col border gap-2 p-4 shadow bg-[#F5F7F8] justify-center dark:bg-slate-800">
                    <Label
                      htmlFor="gst"
                      value="Supplier GST No"
                      className="truncate font-semibold text-lavender-900 text-xs"
                    />
                    <Label
                      htmlFor="gst"
                      value={order?.supplierId?.gstNo || ""}
                      className="truncate text-black font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="w-full mt-5">
                  {/* Product List Table */}
                  <div className="overflow-x-auto">
                    <div className="overflow-y-auto max-h-64">
                      <table className="w-full border-collapse text-xs border border-gray-200 text-black dark:text-white dark:border-gray-700">
                        <thead>
                          <tr className="bg-lavender-900 text-white">
                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Product Code
                            </th>
                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Product Name
                            </th>

                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              UOM
                            </th>
                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Order Qty (BOX)
                            </th>
                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Order Qty (PCS)
                            </th>
                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Stock Qty
                            </th>
                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              In Transit Qty
                            </th>

                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Price
                            </th>
                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Gross Amount
                            </th>
                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Taxable Amount
                            </th>

                            <th className="whitespace-nowrap text-center border text-xs border-black rounded-none dark:bg-gray-800 p-1">
                              Net Amt
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order?.lineItems?.map((item) => (
                            <tr
                              key={item?._id}
                              className="bg-[#F5F7F8] dark:bg-gray-800"
                            >
                              <td className="text-center border border-black p-1">
                                <div className="truncate">
                                  {item.product?.product_code || ""}
                                </div>
                              </td>
                              <td className="text-center border border-black p-1">
                                <div className="truncate">
                                  {item.product?.name || ""}
                                </div>
                              </td>

                              <td className="text-center border border-black p-1">
                                {item?.lineItemUOM || ""}
                              </td>
                              <td className="text-center border border-black p-1">
                                {item?.lineItemUOM === "box"
                                  ? item?.boxOrderQty
                                  : ""}
                              </td>
                              <td className="text-center border border-black p-1">
                                {item?.oderQty || 0}
                              </td>
                              <td className="text-center border border-black p-1">
                                {item?.inventoryId?.availableQty || 0}
                              </td>
                              <td className="text-center border border-black p-1">
                                {item?.inventoryId?.intransitQty || 0}
                              </td>

                              <td className="text-center border border-black p-1">
                                ₹{item?.price?.dlp_price || 0}
                              </td>
                              <td className="text-center border border-black p-1">
                                ₹{item?.grossAmt?.toLocaleString("en-IN") || 0}
                              </td>
                              <td className="text-center border border-black p-1">
                                ₹{item?.taxableAmt?.toLocaleString("en-IN") || 0}
                              </td>

                              <td className="text-center border border-black p-1">
                                ₹{item?.netAmt?.toLocaleString("en-IN") || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 mb-4">
                    <div></div>
                    <div></div>
                    <div className="col-span-1 border border-gray-300 p-4 bg-[#F5F7F8] shadow space-y-2 dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="total-items"
                          value="Total Items"
                          className="font-semibold text-xs"
                        />
                        <Label
                          htmlFor="total-items"
                          className="text-lavender-900 text-xs font-semibold"
                        >
                          {order?.totalLines || 0}
                        </Label>
                      </div>
                    </div>

                    <div className="col-span-1 border border-gray-300 p-4 bg-[#F5F7F8] shadow space-y-2 dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="gross-amount"
                          value="Gross Amount (INR)"
                          className="font-semibold text-xs"
                        />
                        <Label
                          htmlFor="gross-amount"
                          className="text-lavender-900 text-sm font-semibold"
                        >
                          {order?.grossAmount?.toLocaleString("en-IN") || 0}
                        </Label>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="taxable-Amount"
                          value="Taxable Amount (INR)"
                          className="font-semibold text-xs"
                        />
                        <Label
                          htmlFor="taxable-Amount"
                          className="text-lavender-900 font-semibold text-sm"
                        >
                          {order?.taxableAmount?.toLocaleString("en-IN") || 0}
                        </Label>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="total-gst"
                          value="Total GST Amount (INR)"
                          className="font-semibold text-xs"
                        />
                        <Label
                          htmlFor="total-gst"
                          className="text-lavender-900 font-semibold text-sm"
                        >
                          ₹{" "}
                          {order?.totalGSTAmount?.toLocaleString("en-IN") || 0}
                        </Label>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="net-Amount"
                          value="Net Amount (INR)"
                          className="font-semibold text-xs"
                        />
                        <Label
                          htmlFor="net-Amount"
                          className="text-lavender-900 font-semibold text-sm"
                        >
                          ₹ {order?.netAmount?.toLocaleString("en-IN") || 0}
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="w-full justify-end mt-[30px] gap-4 flex flex-wrap items-center">
                    <TextInput
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      required
                      placeholder="Add Remarks to cancel"
                      className="w-48"
                      disabled={order?.approvedStatus !== "Not Approved"}
                    />
                    <Button
                      color="failure"
                      size="sm"
                      onClick={() => handleCancelOrder()}
                      disabled={order?.approvedStatus !== "Not Approved"}
                      className="w-28"
                    >
                      {loading ? "loading..." : "Reject"}
                    </Button>

                    <Button
                      color="purple"
                      size="sm"
                      disabled={order?.approvedStatus !== "Not Approved"}
                      onClick={() => handleEditOrder(order?._id)}
                      className="w-28"
                    >
                      Edit
                    </Button>

                    <Button
                      color="warning"
                      size="sm"
                      onClick={() => handleSaveOrder()}
                      disabled={order?.approvedStatus !== "Not Approved"}
                      className="w-28"
                    >
                      {loading ? "loading..." : "Approve"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
