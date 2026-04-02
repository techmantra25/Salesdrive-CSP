import {
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrashAlt } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { RiRefreshFill } from "react-icons/ri";
import {
  addReason,
  deleteReason,
  getReasonsList,
  updateReason,
} from "../../api/api";
import StatusIndicator from "../../assets/common/StatusIndicator";
import { ConfirmationModelContext } from "../../context/ContextProvider";


// For permission
import { getPagePermission } from "../../utils/permissionHelper";
import { useSelector } from "react-redux";

const ReasonMaster = () => {
  const [selectedModule, setSelectedModule] = useState("");
  const [inputFields, setInputFields] = useState([{ name: "" }]);
  const [openModal, setOpenModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [allReasons, setAllReasons] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("default");
  const [filterModule, setFilterModule] = useState("default");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  // For permission
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  let filtersReasons = [...allReasons];

  if (filterModule !== "default") {
    filtersReasons = allReasons.filter((item) => item?.module === filterModule);
  }

  if (selectedStatus !== "default") {
    filtersReasons = filtersReasons.filter(
      (item) => item?.status === (selectedStatus === "active" ? true : false)
    );
  }

  const handleAddField = () => {
    setInputFields([...inputFields, { name: "" }]);
  };

  async function getReasonsData(isMounted) {
    setPageLoading(true);
    const res = await getReasonsList();
    console.log(res?.data?.data);
    if (isMounted) {
      setAllReasons(res.data.data);
    }
    setPageLoading(false);
  }

  useEffect(() => {
    let isMounted = true;
    getReasonsData(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (index, event) => {
    const newFields = inputFields.map((field, i) => {
      if (i === index) {
        return { ...field, name: event.target.value };
      }
      return field;
    });
    setInputFields(newFields);
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      let finalInputFields = inputFields?.map((ele) => ele?.name);
      console.log(finalInputFields);
      let payload = {
        data: finalInputFields,
        module: selectedModule,
      };
      let res = await addReason(payload);
      if (res?.data?.statusUpdateError) {
        toast.error("Something went wrong");
      } else {
        toast.success("Reason added successfully");
      }
      setFormLoading(false);
      getReasonsData(true);
      setOpenModal(false);
    } catch (error) {
      console.error(error);
      setFormLoading(false);
      toast.error(error?.response?.data?.message || "Failed to add Reason");
    } finally {
      setFormLoading(false);
    }
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setSelectedModule(null);
    setInputFields([{ name: "" }]);
  };

  const onCloseInfoModal = () => {
    setOpenInfoModal(false);
  };

  const handleStatusUpdate = async (Reason) => {
    openConfirmationModel({
      question: `Are you sure you want to ${Reason.status ? "deactivate" : "activate"
        } this Reason?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !Reason.status,
            };
            const res = await updateReason(payload, Reason._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
            getReasonsData(true);
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to update Reason status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleDelete = async (id) => {
    openConfirmationModel({
      question: `Are you sure you want to delete this Reason?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const res = await deleteReason(id);
            if (res?.data?.statusUpdateError) {
              toast.error("Reason Not Deleted");
            } else {
              toast.success("Reason deleted successfully");
            }
            getReasonsData(true);
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to delete Reason"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleResetFilter = () => {
    getReasonsData(true);
    setInputFields([{ name: "" }]);
    setSelectedModule(null);
    setOpenModal(false);
    setSelectedStatus("default");
    filterModule("default");
  };



  // For permission
  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const slug = "reasons";
    const permission = getPagePermission(permissionState, slug);
    setPagePermission(permission);
  }, [permissionState]);


return (
  <>
    {pagePermission?.view ? (
      <div className="flex justify-start items-center flex-col gap-4 w-full">

        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Return & Reason Master</h1>
          </div>
        </div>

        {/* filters */}
        <div className="flex justify-start items-center flex-col w-full gap-4 p-4">
          <Card className="w-full flex justify-center items-center flex-col">
            {/* filter card header */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">Total Count : {allReasons?.length} </Badge>
              <Badge color="warning">
                Filtered Count : {filtersReasons?.length}{" "}
              </Badge>
            </div>
            {/* filter div */}
            <div className="flex justify-center w-full items-center gap-4 flex-wrap">
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="statusSelect" value="Select Status" />
                </div>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  id="statusSelect"
                  required
                >
                  <option value="default">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="zoneSelect" value="Select Mode" />
                </div>
                <Select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  id="zoneSelect"
                  required
                >
                  <option value="default">All</option>
                  <option value="Purchase-Order-Cancellation">
                    Purchase-Order-Cancellation
                  </option>
                  <option value="Order-To-Bill">Order-To-Bill</option>
                  <option value="Order-Cancellation">Order-Cancellation</option>
                  <option value="Bill-Cancellation">Bill Cancellation</option>
                  <option value="Sales-Return">Sales-Return</option>
                  <option value="Purchase-Return">Purchase-Return</option>
                </Select>
              </div>
            </div>
            {/* btns */}
            <div className="flex justify-center w-full items-center gap-2 flex-wrap">
              <Button
                className="text-xs"
                size="sm"
                color="success"
                onClick={handleResetFilter}
              >
                <span className="flex justify-center items-center gap-2">
                  <RiRefreshFill size={20} />
                  Reset & Refresh
                </span>
              </Button>
              {pagePermission?.create && (
                <Button
                  className="text-xs"
                  size="sm"
                  onClick={() => setOpenModal(true)}
                >
                  <span className="flex justify-center items-center gap-2">
                    <IoMdAddCircle size={20} />
                    Add Reason/Remark
                  </span>
                </Button>
              )}

            </div>
          </Card>
        </div>

        {/* table header with Info button */}

        {pagePermission?.view && (
          <div className="flex justify-between w-full items-center px-4">
            <Button size="sm" onClick={() => setOpenInfoModal(true)}>
              Show Info
            </Button>
          </div>
        )}


        {/* table */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          {pageLoading ? (
            <div
              className="w-full flex justify-center items-center"
              role="status"
            >
              <Spinner aria-label="Default status example" size="xl" />
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table striped>
                <Table.Head className="text-center">
                  <Table.HeadCell>Module</Table.HeadCell>
                  <Table.HeadCell>Reason</Table.HeadCell>
                  <Table.HeadCell>Create Date</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Action</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {filtersReasons.map((item) => (
                    <Table.Row
                      key={item?._id}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {item.module}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {item.reason}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <StatusIndicator
                          status={item.status}
                          onClick={() => {
                            if (pagePermission?.update) {
                              handleStatusUpdate(item);
                            }
                          }}
                          disabled={!pagePermission?.update}
                        />

                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">

                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {pagePermission?.delete && (
                            <div
                              className="flex gap-2 justify-center items-center"
                              onClick={() => handleDelete(item._id)}
                            >
                              <FaTrashAlt className="text-red-500 hover:text-red-700 cursor-pointer" />
                            </div>
                          )}
                        </Table.Cell>

                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {filtersReasons.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan={"100%"}
                        className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                      >
                        No data found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
        {/* Add or Edit Modal  */}
        <Modal show={openModal} size="lg" onClose={onCloseModal} popup>
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-5">
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Select Module" />
                </div>
                <Select
                  value={selectedModule}
                  onChange={(event) => setSelectedModule(event.target.value)}
                  required
                >
                  <option value="">Select Module</option>
                  <option value="Purchase-Order-Cancellation">
                    Purchase-Order-Cancellation
                  </option>
                  <option value="Order-To-Bill">Order-To-Bill</option>
                  <option value="Order-Cancellation">Order-Cancellation</option>
                  <option value="Bill-Cancellation">Bill Cancellation</option>
                  <option value="Sales-Return">Sales-Return</option>
                  <option value="Purchase-Return">Purchase-Return</option>
                </Select>
              </div>

              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value={`Select Reason For ${selectedModule}`} />
                </div>

                <div className="w-full">
                  {inputFields.map((inputField, index) => (
                    <div key={index} className="mb-2">
                      <TextInput
                        placeholder="Enter Reason Name"
                        value={inputField.name}
                        onChange={(event) => handleInputChange(index, event)}
                        required
                      />
                    </div>
                  ))}
                  <div>
                    <p
                      className="text-green-400 cursor-pointer text-xs font-medium"
                      onClick={handleAddField}
                    >
                      <span className="mx-2">+</span>Add More
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  disabled={!selectedModule}
                >
                  {formLoading ? (
                    <Spinner size="sm" aria-label="Loading spinner" />
                  ) : (
                    "Add Reasons"
                  )}
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        {/* Information Modal */}
        <Modal show={openInfoModal} size="lg" onClose={onCloseInfoModal}>
          <Modal.Header>Instructions</Modal.Header>
          <Modal.Body>
            <div className="space-y-2 text-gray-700 dark:text-gray-100">
              <div>
                <h4 className="text-xl font-bold">
                  1. Purchase Order Cancellation
                </h4>
                <p>
                  This reason will be used for Purchase Order or Primary Order
                  cancellation for distributor.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold">2. Order-To-Bill</h4>
                <p>
                  This reason will be used for Order-To-Bill for distributor.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold">3. Order-Cancellation</h4>
                <p>
                  This reason will be used for Order-Cancellation for
                  distributor.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold">4. Bill Cancellation</h4>
                <p>
                  This reason will be used for Bill Cancellation for
                  distributor.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold">5. Sales-Return</h4>
                <p>
                  This reason will be used for Sales-Return for distributor.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold">6. Purchase-Return</h4>
                <p>
                  This reason will be used for Purchase-Return for distributor.
                </p>
              </div>
            </div>
          </Modal.Body>
        </Modal>
         </div>
    ) : (
      <div className="w-full h-[70vh] flex justify-center items-center">
        <h1 className="text-xl font-semibold text-red-500">
          Access Denied
        </h1>
      </div>
    )}
  </>
);

};

export default ReasonMaster;
