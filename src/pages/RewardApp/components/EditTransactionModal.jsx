import { Button, Label, Modal, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Datepicker from "react-tailwindcss-datepicker";
import { editRetailerOutletTransaction } from "../../../api/api";

const EditTransactionModal = ({ transaction, onClose,onSuccess }) => {
  // States to hold the change
  const [loading, setLoading] = useState(false);
  const [point, setPoint] = useState(transaction?.point ?? "");
  const [remark, setRemark] = useState(transaction?.remark ?? "");
  const [date, setDate] = useState({
    startDate: transaction?.createdAt
      ? new Date(transaction.createdAt).toISOString().split("T")[0]
      : null,
    endDate: transaction?.createdAt
      ? new Date(transaction.createdAt).toISOString().split("T")[0]
      : null,
  });

  //   Fucntion to handle the submit

  const handleSubmit = async () => {
    // points can not be less then 0
    if (point !== "" && (isNaN(point) || Number(point) < 0)) {
      toast.error("Point must be a error greater than or equal to 0");
      return;
    }
    // Date can not be greater then today
    if (date?.startDate && new Date(date.startDate) > new Date()) {
      toast.error("Date can not be a future date");
      return;
    }

    const payload = {};

    if (point !== "" && Number(point) !== transaction?.point) {
      payload.point = Number(point);
    }
    if (remark !== transaction?.remark) {
      payload.remark = remark;
    }
    if (
      date?.startDate &&
      new Date(date.startDate).toISOString().split("T")[0] !==
        new Date(transaction?.createdAt).toISOString().split("T")[0]
    ) {
      payload.date = date.startDate;
    }

    if (Object.keys(payload).length === 0) {
      toast.error("No changes detected");
      return;
    }

    try {
      setLoading(true);
      await editRetailerOutletTransaction(transaction._id, payload);
      toast.success("Transaction updated");
      onSuccess();
    } catch (error) {
      toast.error(error?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={true} onClose={onClose} size="md">
      <Modal.Header>Edit Transaction</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-4">
          {/* information that would be read only */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
            <span>
              <span className="font-semibold">Retailer: </span>
              {transaction?.retailerId?.outletName}
            </span>
            <span>
              <span className="font-semibold">Transaction For: </span>
              {transaction?.transactionFor}
            </span>
            <span>
              <span className="font-semibold">Transaction Type: </span>
              {transaction?.transactionType}
            </span>
          </div>

          {/* points */}
          <div>
            <div className="block mb-1">
              <Label htmlFor="point" value="Point" />
            </div>
            <TextInput
              id="point"
              type="number"
              min={0}
              value={point}
              onChange={(e) => setPoint(e.target.value)}
              placeholder="Enter Points"
              sizing="sm"
            />
          </div>

          {/* Date */}
          <div>
            <div className="block  mb-1">
              <Label value="Transaction Data" />
            </div>
            <Datepicker
              inputClassName="relative py-1.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none"
              asSingle={true}
              useRange={false}
              value={date}
              onChange={(val) => setDate(val)}
              maxDate={new Date()}
            />
          </div>

          {/* Remark */}
          <div>
            <div className="block mb-1">
              <Label htmlFor="remark" value="remark" />
            </div>
            <TextInput
              id="remark"
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter Remark"
              sizing="sm"
            />
          </div>
        </div>
      </Modal.Body>
      {/* footer */}
      <Modal.Footer>
        <div className="flex justify-end gap-2 w-full">
          <Button color="gray" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {/* /////////////// */}

          <Button
            color="blue"
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Updating...
              </span>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTransactionModal;
