import { Button, Modal, TextInput } from "flowbite-react";
import React, { useState } from "react";

const LeavingDate = ({
  openLeavingDateModal,
  setOpenLeavingDateModal,
  selectedEmployee,
  setSelectedEmployee,
  handleStatusUpdate,
}) => {
  const [leavingDate, setLeavingDate] = useState(null);

  return (
    <Modal
      show={openLeavingDateModal}
      onClose={() => setOpenLeavingDateModal(false)}
    >
      <Modal.Body>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 dark:text-gray-100">
                Leaving Date
              </label>
              <span className="text-gray-500 dark:text-gray-400">
                (yyyy-mm-dd)
              </span>
            </div>
            <TextInput
              type="date"
              name="leaving_date"
              className=" text-gray-700 dark:text-gray-100"
              value={leavingDate}
              onChange={(e) => setLeavingDate(e.target.value)}
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => handleStatusUpdate(selectedEmployee, leavingDate)}
        >
          De-Activate
        </Button>
        <Button color="gray" onClick={() => setOpenLeavingDateModal(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LeavingDate;
