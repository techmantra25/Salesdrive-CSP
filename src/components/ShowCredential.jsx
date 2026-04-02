import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaRegCopy } from "react-icons/fa";
import { sendCredentialMail } from "../api/api";

export const ShowCredential = ({
  showCredentialModal,
  selectedDistributorForCredential,
  credentialModalLoading,
  disPassword,
  adminPassword,
  onCloseCredentialModal,
}) => {
  const [SendingMail, setSendingMail] = useState(false);

  const handleSendCredentialMail = async (distributorId) => {
    try {
      setSendingMail(true);
      await sendCredentialMail(distributorId);
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
          selectedDistributorForCredential &&
          !credentialModalLoading
        }
        onClose={onCloseCredentialModal}
        size={"lg"}
      >
        <Modal.Header>
          <div className="text-md font-normal">
            {selectedDistributorForCredential?.name}(
            {selectedDistributorForCredential?.dbCode})
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="dbCodeToShow" value="DB Code" />
              </div>
              <div className="flex w-full justify-center items-center gap-4">
                <TextInput
                  id="dbCodeToShow"
                  name="dbCodeToShow"
                  type="text"
                  className="w-full"
                  value={selectedDistributorForCredential?.dbCode}
                  disabled
                />
                <span
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selectedDistributorForCredential?.dbCode
                    );
                    toast.success("Email copied to clipboard");
                  }}
                  className="text-black dark:text-white cursor-pointer"
                >
                  <FaRegCopy size={25} />
                </span>
              </div>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="disPassword" value="Distributor Password" />
              </div>
              <div className="flex w-full justify-center items-center gap-4">
                <TextInput
                  id="disPassword"
                  name="disPassword"
                  type="text"
                  className="w-full"
                  value={disPassword}
                  disabled
                />
                <span
                  onClick={() => {
                    navigator.clipboard.writeText(disPassword);
                    toast.success("Password copied to clipboard");
                  }}
                  className="text-black dark:text-white cursor-pointer"
                >
                  <FaRegCopy size={25} />
                </span>
              </div>
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="adminPassword" value="Admin Password" />
              </div>
              <div className="flex w-full justify-center items-center gap-4">
                <TextInput
                  id="adminPassword"
                  name="adminPassword"
                  type="text"
                  className="w-full"
                  value={adminPassword}
                  disabled
                />
                <span
                  onClick={() => {
                    navigator.clipboard.writeText(adminPassword);
                    toast.success("Password copied to clipboard");
                  }}
                  className="text-black dark:text-white cursor-pointer"
                >
                  <FaRegCopy size={25} />
                </span>
              </div>
            </div>
            <div className="mt-2">
              <Button
                outline
                size="sm"
                className="w-full"
                onClick={() => {
                  const credentialDetails = `Distributor Credential
------------------------
DB CODE: ${selectedDistributorForCredential?.dbCode}
Distributor Name: ${selectedDistributorForCredential?.name || "N/A"}
DB PASSWORD: ${disPassword}
DB ADMIN PASSWORD: ${adminPassword} (Only for admin usage not for db)`;

                  navigator.clipboard.writeText(credentialDetails);
                  toast.success("All credential details copied to clipboard");
                }}
              >
                <FaRegCopy className="mr-2" /> Copy All Credential Details
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-center items-center gap-2 flex-wrap">
          {/* <Button
            onClick={() => {
              handleSendCredentialMail(selectedDistributorForCredential?._id);
            }}
            disabled={SendingMail}
          >
            {SendingMail ? <>Sending Mail</> : <>Send Mail</>}
          </Button> */}

          {/* 
          <Button
            onClick={() => {
              window.open(
                `https://lux-distributor.netlify.app/sign-in?mode=distributor&dbCode=${selectedDistributorForCredential?.dbCode}&password=${disPassword}`
              );
            }}
            color={"yellow"}
          >
            LogIn as Distributor
          </Button>
           */}
          {/* <Button
            onClick={() => {
              window.open(
                `https://lux-distributor.netlify.app/sign-in?mode=distributor&dbCode=${selectedDistributorForCredential?.dbCode}&password=${adminPassword}`
              );
            }}
            color={"yellow"}
          >
            LogIn as Distributor Admin
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
};
