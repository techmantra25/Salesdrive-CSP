import { Button, Label, Modal, Spinner, Textarea } from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiCloseLine } from "react-icons/ri";
import { SiTicktick } from "react-icons/si";
import {
  ApprovedOutletDetails,
  getOutletDetails,
  outletStatusUpdate,
} from "../api/api";
import { OutletComp } from "./OutLetComp";
import moment from "moment/moment";

const OutLetDetails = ({
  openModal,
  onCloseModal,
  selectedOutletDetails,
  PageType,
}) => {
  const [formData, setFormData] = useState({});
  const [showRemark, setShowRemark] = useState(false);
  const [outletDetailsLoading, setOutletDetailsLoading] = useState(false);

  const fetchOutlet = async (id, isMounted) => {
    setOutletDetailsLoading(true);
    try {
      const response =
        PageType == "Lead"
          ? await getOutletDetails(id)
          : await ApprovedOutletDetails(id);
      if (isMounted) {
        setFormData(response?.data?.data);
      }
    } catch (error) {
      if (isMounted) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch outlet details"
        );
      }
    } finally {
      setOutletDetailsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (selectedOutletDetails?._id) {
      fetchOutlet(selectedOutletDetails._id, isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedOutletDetails]);

  const OutletApprovedFunction = async () => {
    console.log(formData);
    if (!formData?.beatId) {
      toast.error("Please select Beat");
      return;
    }
    let payload = {
      outletStatus: "Approved",
      beatId: formData?.beatId,
      distributorId: formData?.distributorId?._id || formData?.distributorId,
      remarks: "",
    };
    try {
      const response = await outletStatusUpdate(
        payload,
        selectedOutletDetails?._id
      );
      if (response?.data?.statusUpdateError) {
        toast.error("Something went wrong");
      } else {
        toast.success("Outlet Approved successfully");
        onCloseModal();
      }
    } catch (error) {
      toast.error(error?.message || "Failed to approve outlet, try again");
    }
  };

  const OutletRejectionFunction = async () => {
    if (!formData.remarks || formData.remarks.trim().length === 0) {
      toast.error("Please add remarks before rejecting");
      return;
    }

    let payload = { outletStatus: "Rejected", remarks: formData.remarks };
    try {
      const response = await outletStatusUpdate(
        payload,
        selectedOutletDetails?._id
      );
      if (response?.data?.statusUpdateError) {
        toast.error("Something went wrong");
      } else {
        toast.success("Outlet Rejected successfully");
        onCloseModal();
      }
    } catch (error) {
      toast.error(error?.message || "Failed to reject outlet, try again");
    }
  };

  return (
    <div>
      {PageType == "Lead" && (
        <Modal show={openModal} size="6xl" onClose={() => onCloseModal()}>
          <Modal.Header>
            {outletDetailsLoading ? (
              <div className="flex justify-center items-center">
                <Spinner size="md" />
              </div>
            ) : (
              <p>
                Outlet Details ({formData?.outletName} {formData?.outletCode})
              </p>
            )}
          </Modal.Header>
          <Modal.Body>
            {!showRemark ? (
              <OutletComp formData={formData} setFormData={setFormData} />
            ) : (
              <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="w-full flex justify-center items-center gap-2 flex-wrap">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="comment"
                      value="Add Remark mentioning the reason"
                      className="text-md"
                    />
                    <span className="text-red-500 ml-2">*</span>
                  </div>
                  <Textarea
                    id="comment"
                    placeholder=""
                    value={formData?.remarks || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    required
                    rows={4}
                  />
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="flex justify-end items-center gap-2">
            <p className="text-white font-bold text-lg">
              Do you want to approve this outlet?
            </p>

            <Button
              className="text-xs"
              color="green"
              size="sm"
              onClick={() => OutletApprovedFunction("Approved")}
              disabled={formData?.outletCode ? true : false}
            >
              <SiTicktick size={20} />
              {formData?.outletCode ? "Already Approved" : "Approve"}
            </Button>
            {!showRemark && (
              <Button
                className="text-xs"
                color="red"
                size="sm"
                onClick={() => setShowRemark(true)}
              >
                <RiCloseLine size={20} />
                Reject
              </Button>
            )}

            {showRemark && (
              <Button
                className="text-xs"
                color="red"
                size="sm"
                onClick={() => OutletRejectionFunction("Rejected")}
              >
                Reject with Remark
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}

      {PageType == "Outlet" && (
        <Modal show={openModal} size="5xl" onClose={() => onCloseModal()}>
          <Modal.Header>
            {outletDetailsLoading ? (
              <div className="flex justify-center items-center">
                <Spinner size="md" />
              </div>
            ) : (
              <p>
                Outlet Details ({formData?.outletName}, ({formData?.outletUID}){" "}
                [{formData?.outletCode}])
              </p>
            )}
          </Modal.Header>
          <Modal.Body>
            {outletDetailsLoading && (
              <div className="flex justify-center items-center">
                <Spinner size="md" />
              </div>
            )}

            {!outletDetailsLoading && (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      State
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.stateId?.name} ({formData?.stateId?.code})
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Beat
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.beatId?.name} ({formData?.beatId?.code})
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Outlet Name
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.outletName}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Outlet Code
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.outletCode}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Outlet UID
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.outletUID}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Owner Name
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.ownerName}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Distributor
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.distributorId?.name} (
                      {formData?.distributorId?.dbCode})
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Mobile Numbers
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.mobile1}, {formData?.mobile2}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Category of Outlet
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.categoryOfOutlet}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Selling Brands
                    </h3>
                    {formData?.sellingBrands?.map((brand, index) => (
                      <p
                        key={index}
                        className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap"
                      >
                        {brand?.name}
                      </p>
                    ))}
                  </div>
                  {formData?.competitorBrands?.length > 1 ? (
                    <div>
                      <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                        Competitor Brands
                      </h3>
                      {formData?.competitorBrands?.map((brand, index) => (
                        <p
                          key={index}
                          className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap"
                        >
                          {brand}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Address 1
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.address1}, {formData?.district},{" "}
                      {formData?.city}, {formData?.pin}
                    </p>
                  </div>
                  {formData?.address2 ? (
                    <div>
                      <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                        Address 2
                      </h3>
                      <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                        {formData?.address2}
                      </p>
                    </div>
                  ) : null}

                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Location
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.location}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Tele Calling Slot
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.teleCallingSlot?.map((item, index) => (
                        <span key={index}>{item}, </span>
                      ))}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Outlet Source
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.outletSource}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Existing Retailer
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {formData?.existingRetailer ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Approved At
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {moment(formData?.approvedDate).format("DD-MM-YYYY")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      Created At
                    </h3>
                    <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                      {moment(formData?.createdAt).format("DD-MM-YYYY")}
                    </p>
                  </div>
                  {formData?.retailerClass ? (
                    <div>
                      <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                        Retailer Class
                      </h3>
                      <p className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-wrap">
                        {formData?.retailerClass}
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      POI Front Image
                    </h3>
                    <div className="flex gap-2 justify-start items-center p-2 mt-1 ">
                      <a href={formData?.poiFrontImage} target="_blank">
                        {formData?.poiFrontImage ? (
                          <img
                            src={formData?.poiFrontImage}
                            alt="poiFrontImage"
                            className="object-cover w-auto h-32"
                          />
                        ) : (
                          <img
                            src={
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                            }
                            alt="poiFrontImage"
                            className="object-cover"
                            width={40}
                            height={40}
                          />
                        )}
                      </a>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      POI Back Image
                    </h3>
                    <div className="flex gap-2 justify-start items-center p-2 mt-1">
                      <a href={formData?.poiBackImage} target="_blank">
                        {formData?.poiBackImage ? (
                          <img
                            src={formData?.poiBackImage}
                            alt="poiBackImage"
                            className="object-cover w-auto h-32"
                            width={200}
                            height={200}
                          />
                        ) : (
                          <img
                            src={
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                            }
                            alt="poiBackImage"
                            className="object-cover"
                            width={40}
                            height={40}
                          />
                        )}
                      </a>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      POA Front Image
                    </h3>
                    <div className="flex gap-2 justify-start items-center p-2 mt-1">
                      <a href={formData?.poaFrontImage} target="_blank">
                        {formData?.poaFrontImage ? (
                          <img
                            src={formData?.poaFrontImage}
                            alt="poaFrontImage"
                            className="object-cover w-auto h-32"
                            width={200}
                            height={200}
                          />
                        ) : (
                          <img
                            src={
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                            }
                            alt="poaFrontImage"
                            className="object-cover"
                            width={40}
                            height={40}
                          />
                        )}
                      </a>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold whitespace-nowrap text-gray-900 dark:text-teal-400">
                      POA Back Image
                    </h3>
                    <div className="flex gap-2 justify-start items-center p-2 mt-1">
                      <a href={formData?.poaBackImage} target="_blank">
                        {formData?.poaBackImage ? (
                          <img
                            src={formData?.poaBackImage}
                            alt="poaBackImage"
                            className="object-cover w-auto h-32"
                            width={200}
                            height={200}
                          />
                        ) : (
                          <img
                            src={
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPHzcn5CYAhWa0R61Mg4JMXwrHfv5I87gbBQ-dYiu9Lv9_HT9RRcPFqtHvXYA-2Gw5Ww&usqp=CAU"
                            }
                            alt="poaBackImage"
                            className="object-cover"
                            width={40}
                            height={40}
                          />
                        )}
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default OutLetDetails;
