import { Card } from "flowbite-react";
import moment from "moment";

const STATUS_STEPS = [
  "Waiting for NOC",
  "NOC Approved",
  "Address Confirmed",
  "Gift Ordered",
  "Gift Dispatched",
  "Gift Delivered",
  "Cancelled",
];

const OrderTrack = ({ order }) => {
  return (
    <Card className="w-full">
      <h3 className="text-lg font-bold mb-4">Order Tracking</h3>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        {(() => {
          const steps = STATUS_STEPS.map(step => {
            const historyItem = order?.statusHistory?.find(h => h.status === step);
            const completed = !!historyItem;
            const date = historyItem ? moment(historyItem.updatedStatusDate).format("LLL") : null;
            let details = null;
            if (step === "Gift Dispatched" && order?.dispatchInfo) {
              details = (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Docket:</strong> {order.dispatchInfo.docketNumber} | <strong>Dispatch Date:</strong> {moment(order.dispatchInfo.dispatchDate).format("LLL")}
                  {order.dispatchInfo.ExpecteddeliveryDate && moment(order.dispatchInfo.ExpecteddeliveryDate).isValid() ? (
                    <>
                      {" | "}
                      <strong>Expected Delivery:</strong> {moment(order.dispatchInfo.ExpecteddeliveryDate).format("LLL")}
                    </>
                  ) : ""}
                  {" | "}
                  <strong>Remark:</strong> {order.dispatchInfo.dispatchRemark}
                </p>
              );
            } else if (step === "Gift Delivered" && order?.deliveryInfo) {
              details = (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Delivery Date:</strong> {moment(order.deliveryInfo.deliveryDate).format("LLL")} | <strong>Remark:</strong> {order.deliveryInfo.deliveryRemark}
                </p>
              );
            } else if (step === "Cancelled" && order?.cancellationInfo) {
              details = (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Cancelled At:</strong> {moment(order.cancellationInfo.cancelledAt).format("LLL")} | <strong>Reason:</strong> {order.cancellationInfo.reason}
                </p>
              );
            }
            return { status: step, completed, date, details };
          });

          return steps.map((step, index) => (
            <div key={index} className="relative flex items-start mb-8">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                step.completed
                  ? step.status === "Cancelled"
                    ? "bg-red-500"
                    : "bg-green-500"
                  : "bg-gray-400"
              }`}>
                {step.completed ? (step.status === "Cancelled" ? "✗" : "✓") : "○"}
              </div>
              <div className="ml-4 flex-1">
                <h4 className={`text-lg font-semibold ${step.completed ? "text-gray-900" : "text-gray-500"}`}>
                  {step.status}
                </h4>
                {step.date && (
                  <p className="text-sm text-gray-500 mt-1">
                    {step.date}
                  </p>
                )}
                {step.details}
              </div>
            </div>
          ));
        })()}
      </div>
    </Card>
  );
};

export default OrderTrack;