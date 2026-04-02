import { Button, Label, Modal, TextInput, Textarea, Select } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { addManualPointsToOutlet } from "../../api/outletApi";

const AddManualPointsModal = ({ show, onClose, outlet, onSuccess }) => {
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [transactionFor, setTransactionFor] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePointsChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && value.length <= 7)) {
      setPoints(value);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!points || parseInt(points) <= 0) {
      toast.error("Please enter valid points greater than 0");
      return;
    }
    if (!transactionType) {
      toast.error("Please select a transaction type");
      return;
    }
    if (!transactionFor) {
      toast.error("Please select a transaction for");
      return;
    }

    // Check if debit transaction would result in negative balance
    if (transactionType === 'debit') {
      const currentBalance = outlet?.currentPointBalance || 0;
      const pointsToDeduct = parseInt(points);
      if (pointsToDeduct > currentBalance) {
        toast.error(`Cannot deduct ${pointsToDeduct} points. Current balance is ${currentBalance} points.`);
        return;
      }
    }

    try {
      setLoading(true);
      const response = await addManualPointsToOutlet(outlet._id, {
        points: parseInt(points),
        reason: reason.trim() || null,
        transactionType,
        transactionFor,
      });
      toast.success(
        `Successfully ${transactionType === 'credit' ? 'added' : 'deducted'} ${response.data.data.pointsAdded} points ${transactionType === 'credit' ? 'to' : 'from'} ${outlet.outletName}!`
      );

      setPoints("");
      setReason("");
      setTransactionType("");
      setTransactionFor("");

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "failed to add points"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPoints("");
    setReason("");
    setTransactionType("");
    setTransactionFor("");
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} size="md">
      <Modal.Header>Add manual Points</Modal.Header>

      <Modal.Body>
        <div className="space-y-4">
          {/* outlet info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold text-blue-500">Outlet:</span>
                <p className="text-gray-700 dark:text-gray-300">
                  {outlet?.outletUID}
                </p>
              </div>

              <div>
                <span className="font-semibold text-blue-500">
                  Outlet Balance:
                </span>
                <p className="text-gray-700 dark:text-gray-300">
                  {outlet?.currentPointBalance || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="transactionType" value="Transaction Type *" />
              <Select
                id="transactionType"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select Transaction Type</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="transactionFor" value="Transaction For *" />
              <Select
                id="transactionFor"
                value={transactionFor}
                onChange={(e) => setTransactionFor(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select Transaction For</option>
                <option value="SALES">SALES</option>
                {/* <option value="Sales Multiplier">Sales Multiplier</option> */}
                <option value="Volume Multiplier">Volume Multiplier</option>
                <option value="Consistency Multiplier">Consistency Multiplier</option>
                <option value="Bill Volume Multiplier">Bill Volume Multiplier</option>
                <option value="Sales Return">Sales Return</option>
                <option value="Opening Points" disabled={outlet?.isFirstOpeningPoint}>Opening Points</option>
                <option value="Manual Point">Manual Point</option>
                {/* <option value="other">Other</option> */}
              </Select>
            </div>

            <div>
              <Label htmlFor="points" value="Points *" />
              <TextInput
                id="points"
                type="text"
                placeholder="Enter Points max 7 digits"
                value={points}
                onChange={handlePointsChange}
                required
                maxLength={7}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum 7 digits allowed
              </p>
            </div>

            <div>
              <Label htmlFor="reason" value="Reason" />
              <Textarea
                id="reason"
                placeholder="Enter reason for adding points"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={loading}
              />
            </div>

            {/* preview */}
            {points && parseInt(points) > 0 && transactionType && (
              <div className={`p-3 rounded-lg border ${
                transactionType === 'credit'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : ((outlet?.currentPointBalance || 0) - parseInt(points) < 0)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              }`}>
                <p className={`text-sm ${
                  transactionType === 'credit'
                    ? 'text-green-800 dark:text-green-200'
                    : ((outlet?.currentPointBalance || 0) - parseInt(points) < 0)
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-orange-800 dark:text-orange-200'
                }`}>
                  <span className="font-semibold">New Balance</span>{" "}
                  {transactionType === 'credit'
                    ? (outlet?.currentPointBalance || 0) + parseInt(points)
                    : (outlet?.currentPointBalance || 0) - parseInt(points)
                  }
                </p>
                <p className={`text-xs ${
                  transactionType === 'credit'
                    ? 'text-green-700 dark:text-green-300'
                    : ((outlet?.currentPointBalance || 0) - parseInt(points) < 0)
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-orange-700 dark:text-orange-300'
                }`}>
                  {transactionType === 'credit'
                    ? 'Points will be added'
                    : ((outlet?.currentPointBalance || 0) - parseInt(points) < 0)
                      ? '⚠️ Insufficient balance - transaction will be blocked'
                      : 'Points will be deducted'
                  }
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                color="gray"
                onClick={handleClose}
                disabled={loading}
              >
                cancel
              </Button>
              <Button type="submit" color="blue" disabled={loading}>
                {loading ? "Adding..." : "Add Points"}
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};
export default AddManualPointsModal;
