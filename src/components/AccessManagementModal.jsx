import { Badge, Button, Label, Modal } from "flowbite-react";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateDistributor } from "../api/api";
import { ConfirmationModelContext } from "../context/ContextProvider";
import { fetchDistributors } from "../redux/distributorListSlice";

export const AccessManagementModal = ({
  showAccessManagementModal,
  onCloseAccessManagementModal,
  selectedDistributorForAccessManagement,
}) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [access, setAccess] = useState(
    selectedDistributorForAccessManagement?.access ?? []
  );

  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  const handleSave = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this distributor?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setIsEditing(true);
            const payload = {
              access: access,
            };
            await updateDistributor(
              payload,
              selectedDistributorForAccessManagement._id
            );
            dispatch(fetchDistributors());
            toast.success("Distributor Access updated successfully");
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
                "Failed to update distributor, try again"
            );
          } finally {
            setIsEditing(false);
            onCloseAccessManagementModal();
          }
        } else {
          return;
        }
      },
    });
  };

  const handleCheckboxChange = (accessId) => {
    setAccess((prevAccess) => {
      if (prevAccess.includes(accessId)) {
        return prevAccess.filter((item) => item !== accessId);
      } else {
        return [...prevAccess, accessId];
      }
    });
  };

  return (
    <>
      <Modal
        show={showAccessManagementModal}
        onClose={onCloseAccessManagementModal}
      >
        <Modal.Header>Distributor Access Management</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center items-center gap-6 flex-col">
              <div className="w-full flex justify-center items-center gap-2 flex-wrap">
                <Badge color="warning">
                  Distributor Name :{" "}
                  {selectedDistributorForAccessManagement?.name}
                </Badge>
                <Badge color="warning">
                  Distributor Email :{" "}
                  {selectedDistributorForAccessManagement?.email}
                </Badge>
                <Badge color="warning">
                  Distributor Code :{" "}
                  {selectedDistributorForAccessManagement?.dbCode}
                </Badge>
                <Badge color="warning">
                  Distributor Type :{" "}
                  {selectedDistributorForAccessManagement?.role}
                </Badge>
              </div>
              <div className="w-full flex justify-center items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="access-1"
                    id="access-1"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 outline-none"
                    checked={access.includes("access-1")}
                    onChange={() => {
                      handleCheckboxChange("access-1");
                    }}
                  />
                  <Label htmlFor="access-1">Access 1</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="access-2"
                    id="access-2"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 outline-none"
                    checked={access.includes("access-2")}
                    onChange={() => {
                      handleCheckboxChange("access-2");
                    }}
                  />
                  <Label htmlFor="access-2">Access 2</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="access-3"
                    id="access-3"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 outline-none"
                    checked={access.includes("access-3")}
                    onChange={() => {
                      handleCheckboxChange("access-3");
                    }}
                  />
                  <Label htmlFor="access-3">Access 3</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="access-4"
                    id="access-4"
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 outline-none"
                    checked={access.includes("access-4")}
                    onChange={() => {
                      handleCheckboxChange("access-4");
                    }}
                  />
                  <Label htmlFor="access-4">Access 4</Label>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-center items-center gap-2 flex-wrap">
          <Button
            onClick={() => {
              handleSave();
            }}
            disabled={isEditing}
          >
            {isEditing ? <>Saving</> : <>Save</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
