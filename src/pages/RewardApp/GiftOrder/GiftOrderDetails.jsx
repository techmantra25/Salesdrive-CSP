import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Label,
  Modal,
  Spinner,
  Table,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import {
  GiftOrderCancel,
  GiftOrderDetail,
  GiftOrderStatusUpdate,
  GiftOrderFixMissingApprovals,
} from "../../../api/giftOrderApi";
import OrderTrack from "./components/OrderTrack";
import { useSelector } from "react-redux";

const GiftOrderDetails = () => {
  const role = useSelector((state) => state.permission?.data?.role);
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchData, setDispatchData] = useState({
    docketNumber: "",
    dispatchDate: "",
    ExpecteddeliveryDate: "",
    dispatchRemark: "",
  });
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    deliveryDate: "",
    deliveryRemark: "",
  });
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState("");

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await GiftOrderDetail(id);

      setOrder({
        ...response?.data?.data,
        distributorApprovals: response?.data?.distributorApprovals,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch order details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleConfirmStatus = async () => {
    try {
      await GiftOrderStatusUpdate({ status: confirmStatus }, order._id);
      toast.success(`Status updated to ${confirmStatus}`);
      await fetchOrderDetails();
      setShowConfirmModal(false);
      setConfirmStatus("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update status",
      );
    }
  };

  const handleFixMissingApprovals = async () => {
    try {
      await GiftOrderFixMissingApprovals(order?.orderId);
      toast.success("Missing approvals fixed successfully");
      await fetchOrderDetails();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fix missing approvals",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner aria-label="Loading..." size="xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>No order found</p>
      </div>
    );
  }

  return (
    <div className="flex justify-start items-center flex-col w-full">
      <div className="flex justify-between w-full items-center py-1">
        <div className="flex justify-start items-center w-full">
          <Breadcrumb aria-label="Solid background breadcrumb example">
            <Breadcrumb.Item>RVP App</Breadcrumb.Item>
            <Breadcrumb.Item href={`/${role}/retailer-orders`}>
              Gift Orders
            </Breadcrumb.Item>
            <Breadcrumb.Item>Order Details</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="w-full">
          <h2 className="text-xl font-bold">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label value="Order ID" />
              <p className="font-semibold">{order?.orderId || order?._id}</p>
            </div>
            <div>
              <Label value="Status" />
              <div className="flex justify-start">
                <Badge
                  color={
                    order?.status === "Waiting for NOC"
                      ? "warning"
                      : order?.status === "NOC Approved"
                        ? "success"
                        : order?.status === "Address Confirmed"
                          ? "info"
                          : order?.status === "Gift Ordered"
                            ? "purple"
                            : order?.status === "Gift Dispatched"
                              ? "info"
                              : order?.status === "Gift Delivered"
                                ? "success"
                                : order?.status === "Cancelled"
                                  ? "failure"
                                  : "gray"
                  }
                  className="font-bold"
                >
                  {order?.status || "Unknown"}
                </Badge>
              </div>
            </div>
            <div>
              <Label value="Total Points" />
              <div className="flex justify-start">
                <Badge color="purple" className="font-bold text-md">
                  {order?.totalRedemptionPoints || 0}
                </Badge>
              </div>
            </div>
            <div>
              <Label value="Order Date" />
              <p>
                {order?.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <Label value="Order Modified Date" />
              <p>
                {order?.updatedAt
                  ? new Date(order.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card>

        <OrderTrack order={order} />

        <Card className="w-full">
          <h3 className="text-lg font-bold">Update Order Status</h3>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const statuses = [
                "Waiting for NOC",
                "NOC Approved",
                "Address Confirmed",
                "Gift Ordered",
                "Gift Dispatched",
                "Gift Delivered",
                "Cancelled",
              ];
              const disabledStatuses = []; // Disabled for admin as approved by distributor
              const currentIndex = statuses.indexOf(order?.status);
              return statuses.map((status, index) => (
                <Button
                  key={status}
                  color={status === "Cancelled" ? "failure" : "success"}
                  size="sm"
                  disabled={
                    order?.status === "Cancelled" ||
                    disabledStatuses.includes(status) ||
                    (index !== currentIndex + 1 && status !== "Cancelled") ||
                    (status === "Cancelled" &&
                      (order?.status === "Gift Delivered" ||
                        order?.status === "Gift Dispatched"))
                  }
                  onClick={async () => {
                    if (status === "Cancelled") {
                      setIsCancelModalOpen(true);
                    } else if (status === "Gift Dispatched") {
                      setIsDispatchModalOpen(true);
                    } else if (status === "Gift Delivered") {
                      setIsDeliveryModalOpen(true);
                    } else {
                      setConfirmStatus(status);
                      setShowConfirmModal(true);
                    }
                  }}
                >
                  {status == "NOC Approved" ? "Approve NOC" : status}
                </Button>
              ));
            })()}
          </div>
        </Card>

        <Card className="w-full">
          <h3 className="text-lg font-bold">
            Distributor Approvals{" "}
            {order?.distributorApprovals?.length === 0 && (
              <Button
                color="success"
                size="sm"
                onClick={handleFixMissingApprovals}
              >
                Send Approval
              </Button>
            )}
          </h3>
          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Distributor</Table.HeadCell>
                <Table.HeadCell>DB Code</Table.HeadCell>
                <Table.HeadCell>Requested Points</Table.HeadCell>
                <Table.HeadCell>Approved Points</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Remark</Table.HeadCell>
                <Table.HeadCell>Requested At</Table.HeadCell>
                <Table.HeadCell>Approved At</Table.HeadCell>
              </Table.Head>

              <Table.Body>
                {order?.distributorApprovals?.length > 0 ? (
                  order.distributorApprovals.map((d) => (
                    <Table.Row key={d._id}>
                      <Table.Cell className="font-medium">
                        {d.distributorId?.name}
                      </Table.Cell>

                      <Table.Cell>{d.distributorId?.dbCode}</Table.Cell>

                      <Table.Cell>
                        <div className="flex justify-center items-center">
                          <Badge color="info">{d.requestedPoints}</Badge>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex justify-center items-center">
                          <Badge color="purple">{d.approvedPoints}</Badge>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="flex justify-center items-center">
                          <Badge
                            color={
                              d.status === "Approved"
                                ? "success"
                                : d.status === "Rejected"
                                  ? "failure"
                                  : "warning"
                            }
                          >
                            {d.status}
                          </Badge>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="max-w-xs">
                        {d.remark || "-"}
                      </Table.Cell>

                      <Table.Cell>
                        {new Date(d.requestedAt).toLocaleString("en-IN")}
                      </Table.Cell>

                      <Table.Cell>
                        {new Date(d.updatedAt).toLocaleString("en-IN")}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={8} className="text-center">
                      No distributor approvals found
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Card>

        <Card className="w-full">
          <h3 className="text-lg font-bold">Retailer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label value="Outlet Name" />
              <p>{order?.retailer?.outletApprovedId?.outletName ?? "N/A"}</p>
            </div>
            <div>
              <Label value="Outlet UID" />
              <p>{order?.retailer?.outletApprovedId?.outletUID ?? "N/A"}</p>
            </div>
            <div>
              <Label value="Outlet Code" />
              <p>{order?.retailer?.outletApprovedId?.outletCode ?? "N/A"}</p>
            </div>
            <div>
              <Label value="Owner Name" />
              <p>{order?.retailer?.outletApprovedId?.ownerName ?? "N/A"}</p>
            </div>
            <div>
              <Label value="Mobile 1" />
              <p>{order?.retailer?.outletApprovedId?.mobile1 ?? "N/A"}</p>
            </div>
            <div>
              <Label value="Address" />
              <p>{order?.retailer?.outletApprovedId?.address1 ?? "N/A"}</p>
            </div>
            <div>
              <Label value="City" />
              <p>{order?.retailer?.outletApprovedId?.city ?? "N/A"}</p>
            </div>
            <div>
              <Label value="Email" />
              <p>{order?.retailer?.outletApprovedId?.email ?? "N/A"}</p>
            </div>
            <div>
              <Label value="WhatsApp Number" />
              <p>
                {order?.retailer?.outletApprovedId?.whatsappNumber ?? "N/A"}
              </p>
            </div>
            <div>
              <Label value="Pincode" />
              <p>{order?.retailer?.outletApprovedId?.pin ?? "N/A"}</p>
            </div>
            <div>
              <Label value="PAN Number" />
              <p>{order?.retailer?.outletApprovedId?.panNumber ?? "N/A"}</p>
            </div>
            <div>
              <Label value="Aadhaar Number" />
              <p>{order?.retailer?.outletApprovedId?.aadharNumber ?? "N/A"}</p>
            </div>
            <div>
              <Label value="GSTIN" />
              <p>{order?.retailer?.outletApprovedId?.gstin ?? "N/A"}</p>
            </div>
            <div>
              <Label value="Store Image" />
              {order?.retailer?.outletApprovedId?.outletImage ? (
                <img
                  src={order.retailer.outletApprovedId.outletImage}
                  alt="Store Image"
                  className="w-32 h-32 object-cover rounded shadow-md"
                />
              ) : (
                "N/A"
              )}
            </div>
            <div>
              <Label value="PAN Image" />
              {order?.retailer?.outletApprovedId?.panImage ? (
                <img
                  src={order.retailer.outletApprovedId.panImage}
                  alt="PAN Image"
                  className="w-32 h-32 object-cover rounded shadow-md"
                />
              ) : (
                "N/A"
              )}
            </div>
            <div>
              <Label value="Aadhaar Image" />
              {order?.retailer?.outletApprovedId?.aadharImage ? (
                <img
                  src={order.retailer.outletApprovedId.aadharImage}
                  alt="Aadhaar Image"
                  className="w-32 h-32 object-cover rounded shadow-md"
                />
              ) : (
                "N/A"
              )}
            </div>
            <div>
              <Label value="Current Balance" />
              <div className="flex justify-start">
                <Badge color="warning" className="font-bold text-md">
                  {order?.retailer?.outletApprovedId?.currentPointBalance !=
                  null
                    ? Number.isInteger(
                        order.retailer.outletApprovedId.currentPointBalance,
                      )
                      ? order.retailer.outletApprovedId.currentPointBalance
                      : Number(
                          order.retailer.outletApprovedId.currentPointBalance,
                        ).toFixed(2)
                    : 0}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="w-full">
          <h3 className="text-lg font-bold">Products</h3>
          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Image</Table.HeadCell>
                <Table.HeadCell>Product Name</Table.HeadCell>
                <Table.HeadCell>Product ID</Table.HeadCell>
                <Table.HeadCell>Points</Table.HeadCell>
                <Table.HeadCell>Quantity</Table.HeadCell>
                <Table.HeadCell>Total Points</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {order?.orderItems?.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell className="text-center">
                      <img
                        src={item.productImage?.[0]}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg mx-auto shadow-md"
                      />
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap text-gray-900 dark:text-gray-200">
                      <div>
                        <div className="font-semibold">{item.productName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.cartItemId?.productId?.description
                            ? item.cartItemId.productId.description.length > 75
                              ? item.cartItemId.productId.description.slice(
                                  0,
                                  75,
                                ) + "..."
                              : item.cartItemId.productId.description
                            : "N/A"}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                      {item.productId}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <div className="flex justify-center">
                        <Badge color="purple" className="font-bold">
                          {item.pointsPerUnit}
                        </Badge>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap text-center font-medium text-gray-900 dark:text-gray-200">
                      {item.quantity}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <div className="flex justify-center">
                        <Badge color="success" className="font-bold">
                          {item.totalPoints}
                        </Badge>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>
        <Card className="w-full">
          <h3 className="text-lg font-bold">Shipping Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            <div>
              <Label value="Full Address" />
              <p>{order?.shippingInfo?.shippingAddress || "N/A"}</p>
            </div>

            <div>
              <Label value="Landmark" />
              <p>{order?.shippingInfo?.shippingLandmark || "N/A"}</p>
            </div>

            <div>
              <Label value="City" />
              <p>{order?.shippingInfo?.shippingCity || "N/A"}</p>
            </div>

            <div>
              <Label value="State" />
              <p>{order?.shippingInfo?.shippingState || "N/A"}</p>
            </div>

            <div>
              <Label value="Country" />
              <p>{order?.shippingInfo?.shippingCountry || "N/A"}</p>
            </div>

            <div>
              <Label value="Pincode" />
              <p>{order?.shippingInfo?.shippingPin || "N/A"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        show={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
      >
        <Modal.Header>Dispatch Order</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="docketNumber" value="Docket Number" />
              <TextInput
                id="docketNumber"
                type="text"
                value={dispatchData.docketNumber}
                onChange={(e) =>
                  setDispatchData({
                    ...dispatchData,
                    docketNumber: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="dispatchDate" value="Dispatch Date" />
              <TextInput
                id="dispatchDate"
                type="date"
                value={dispatchData.dispatchDate}
                onChange={(e) =>
                  setDispatchData({
                    ...dispatchData,
                    dispatchDate: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label
                htmlFor="ExpecteddeliveryDate"
                value="Expected Delivery Date"
              />
              <TextInput
                id="ExpecteddeliveryDate"
                type="date"
                value={dispatchData.ExpecteddeliveryDate}
                onChange={(e) =>
                  setDispatchData({
                    ...dispatchData,
                    ExpecteddeliveryDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="dispatchRemark" value="Dispatch Remark" />
              <Textarea
                id="dispatchRemark"
                value={dispatchData.dispatchRemark}
                onChange={(e) =>
                  setDispatchData({
                    ...dispatchData,
                    dispatchRemark: e.target.value,
                  })
                }
                rows={4}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={async () => {
              if (!dispatchData.docketNumber || !dispatchData.dispatchDate) {
                toast.error("Please fill all required fields");
                return;
              }
              try {
                await GiftOrderStatusUpdate(
                  { status: "Gift Dispatched", ...dispatchData },
                  order._id,
                );
                toast.success("Order dispatched successfully");
                setIsDispatchModalOpen(false);
                setDispatchData({
                  docketNumber: "",
                  dispatchDate: "",
                  ExpecteddeliveryDate: "",
                  dispatchRemark: "",
                });
                await fetchOrderDetails();
              } catch (error) {
                toast.error(
                  error?.response?.data?.message ||
                    error?.message ||
                    "Failed to dispatch order",
                );
              }
            }}
          >
            Dispatch
          </Button>
          <Button color="gray" onClick={() => setIsDispatchModalOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
      >
        <Modal.Header>Deliver Order</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deliveryDate" value="Delivery Date" />
              <TextInput
                id="deliveryDate"
                type="date"
                value={deliveryData.deliveryDate}
                onChange={(e) =>
                  setDeliveryData({
                    ...deliveryData,
                    deliveryDate: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="deliveryRemark" value="Delivery Remark" />
              <Textarea
                id="deliveryRemark"
                value={deliveryData.deliveryRemark}
                onChange={(e) =>
                  setDeliveryData({
                    ...deliveryData,
                    deliveryRemark: e.target.value,
                  })
                }
                rows={4}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={async () => {
              if (!deliveryData.deliveryDate) {
                toast.error("Please fill the delivery date");
                return;
              }
              try {
                await GiftOrderStatusUpdate(
                  { status: "Gift Delivered", ...deliveryData },
                  order._id,
                );
                toast.success("Order delivered successfully");
                setIsDeliveryModalOpen(false);
                setDeliveryData({ deliveryDate: "", deliveryRemark: "" });
                await fetchOrderDetails();
              } catch (error) {
                toast.error(
                  error?.response?.data?.message ||
                    error?.message ||
                    "Failed to deliver order",
                );
              }
            }}
          >
            Deliver
          </Button>
          <Button color="gray" onClick={() => setIsDeliveryModalOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      >
        <Modal.Header>Cancel Order</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelReason" value="Cancellation Reason" />
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={async () => {
              if (!cancelReason.trim()) {
                toast.error("Please provide a cancellation reason");
                return;
              }
              try {
                await GiftOrderCancel(order._id, cancelReason);
                toast.success("Order cancelled");
                setIsCancelModalOpen(false);
                setCancelReason("");
                await fetchOrderDetails();
              } catch (error) {
                toast.error(
                  error?.response?.data?.message ||
                    error?.message ||
                    "Failed to cancel order",
                );
              }
            }}
          >
            Cancel Order
          </Button>
          <Button color="gray" onClick={() => setIsCancelModalOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <Modal.Header>Confirm Status Update</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to update the status to {confirmStatus}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button color="success" onClick={handleConfirmStatus}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GiftOrderDetails;
