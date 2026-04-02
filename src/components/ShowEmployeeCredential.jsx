import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaRegCopy } from "react-icons/fa";
import { sendEmployeeCredentialMail } from "../api/api";
import { logout } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ShowEmployeeCredential = ({
  showCredentialModal,
  selectedEmployeeForCredential,
  credentialModalLoading,
  empPassword,
  onCloseCredentialModal,
}) => {
  const [SendingMail, setSendingMail] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendCredentialMail = async (empId) => {
    try {
      setSendingMail(true);
      await sendEmployeeCredentialMail(empId);
      toast.success("Credential mail sent successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to send credential mail"
      );
    } finally {
      setSendingMail(false);
    }
  };

  return (
    <>
      <Modal
        show={
          showCredentialModal &&
          selectedEmployeeForCredential &&
          !credentialModalLoading
        }
        onClose={onCloseCredentialModal}
        size={"md"}
      >
        <Modal.Header>Show Credential</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="empCodeToShow" value="Employee Id" />
              </div>
              <div className="flex w-full justify-center items-center gap-4">
                <TextInput
                  id="empCodeToShow"
                  name="empCodeToShow"
                  type="text"
                  className="w-full"
                  value={selectedEmployeeForCredential?.empId}
                  disabled
                />
                <span
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selectedEmployeeForCredential?.empId
                    );
                    toast.success("Employee Id copied to clipboard");
                  }}
                  className="text-black dark:text-white cursor-pointer"
                >
                  <FaRegCopy size={25} />
                </span>
              </div>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="empPassword" value="Employee Password" />
              </div>
              <div className="flex w-full justify-center items-center gap-4">
                <TextInput
                  id="empPassword"
                  name="empPassword"
                  type="text"
                  className="w-full"
                  value={empPassword}
                  disabled
                />
                <span
                  onClick={() => {
                    navigator.clipboard.writeText(empPassword);
                    toast.success("Password copied to clipboard");
                  }}
                  className="text-black dark:text-white cursor-pointer"
                >
                  <FaRegCopy size={25} />
                </span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-center items-center gap-2 flex-wrap">
          {/* <Button
            onClick={() => {
              handleSendCredentialMail(selectedEmployeeForCredential?._id);
            }}
            disabled={SendingMail}
          >
            {SendingMail ? <>Sending Mail</> : <>Send Mail</>}
          </Button> */}
          {/* <Button
            onClick={() => {
              if (role === "admin") {
                dispatch(logout());
                navigate("/sign-in?mode=admin");
                toast.success("Logout Successful!");
                window.open(`/sign-in?mode=employee&employeeId=${selectedEmployeeForCredential?.empId}&password=${empPassword}`, "_blank");
              }
            }}
            color={"yellow"}
          >
            LogIn as Employee
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShowEmployeeCredential;
