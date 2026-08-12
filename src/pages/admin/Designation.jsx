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
import { BiSolidFileExport } from "react-icons/bi";
import { IoMdAddCircle } from "react-icons/io";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { addDesignation, updateDesignation } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchDesignations } from "../../redux/designationSlice";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { getPagePermission } from "../../utils/permissionHelper";


const Designation = () => {
  const dispatch = useDispatch();
  const { designations, loading } = useSelector((state) => state.designations);
  let filteredDesignations = [...designations];
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [modalMode, setModalMode] = useState("add");
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [parentDesignation, setParentDesignation] = useState("");
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "designation");
    setPagePermission(permission);
  }, [permissionState]);


  if (selectedStatus !== "default") {
    filteredDesignations = [...filteredDesignations].filter(
      (designation) =>
        designation.status === (selectedStatus === "active" ? true : false)
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    dispatch(fetchDesignations());
  };

  const validate = () => {
    if (name.trim() === "") {
      toast.error("Please enter designation name");
      return false;
    }
    if (code.trim() === "") {
      toast.error("Please enter designation code");
      return false;
    }
    return true;
  };

  const handleSetEdit = (designation) => {
    setSelectedDesignation(designation);
    setModalMode("edit");
    setName(designation?.name);
    setCode(designation?.code);
    setParentDesignation(designation?.parent_desg?._id);
    setOpenModal(true);
  };

  const handleAddDesignation = async () => {
    try {
      if (!validate()) return;

      const payload = {
        name: name,
        code: code,
        parent_desg: parentDesignation.trim() === "" ? null : parentDesignation,
      };

      await addDesignation(payload);
      dispatch(fetchDesignations());
      onCloseModal();
      toast.success("Designation added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add designation, try again"
      );
    }
  };

  function onCloseModal() {
    setOpenModal(false);
    setModalMode("add");
    setSelectedDesignation(null);
    setName("");
    setCode("");
    setParentDesignation(null);
  }

  const handleEditDesignation = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this designation?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            if (!validate()) return;
            const payload = {
              name: name,
              code: code,
              // If parentDesignation is empty, set it to null
              parent_desg:
                parentDesignation.trim() === "" ? null : parentDesignation,
            };
            await updateDesignation(payload, selectedDesignation._id);
            dispatch(fetchDesignations());
            toast.success("Designation updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update designation, try again"
            );
          }
        } else {
          onCloseModal();
          return;
        }
      },
    });
  };

  const handleStatusUpdate = async (designation) => {
    openConfirmationModel({
      question: `Are you sure you want to ${designation.status ? "deactivate" : "activate"
        } this designation?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !designation.status,
            };
            const res = await updateDesignation(payload, designation._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
            dispatch(fetchDesignations());
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update designation status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleExportToCSV = () => {
    const csvData = filteredDesignations.map((designation) => {
      return {
        "Designation Code": designation?.code,
        "Parent Designation": designation?.parent_desg?.name,
        "Parent Designation Code": designation?.parent_desg?.code,
        "Designation Name": designation?.name,
        Status: designation?.status ? "Active" : "Inactive",
      };
    });

    const csv = csvData.map((row) => Object.values(row).join(","));
    csv.unshift(Object.keys(csvData[0]).join(","));

    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "designations.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    dispatch(fetchDesignations());
  }, [dispatch]);

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">

          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Designation Master</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">
                  Total Count : {designations?.length}{" "}
                </Badge>
                <Badge color="warning">
                  Filtered Count : {filteredDesignations?.length}
                </Badge>
              </div>
              {/* filter div */}
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
                {/* filter : 1 */}
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
                      Add Designation
                    </span>
                  </Button>)}
                {pagePermission?.export && (
                  <Button
                    className="text-xs"
                    color="blue"
                    size="sm"
                    onClick={handleExportToCSV}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <BiSolidFileExport size={20} />
                      CSV Download
                    </span>
                  </Button>)}
              </div>
            </Card>
          </div>

          {/* table */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            {loading ? (
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
                    <Table.HeadCell>Designation Code</Table.HeadCell>
                    <Table.HeadCell>Designation Name</Table.HeadCell>
                    <Table.HeadCell>Parent Designation</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredDesignations.map((designation, index) => (
                      <Table.Row
                        key={index}
                        className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode
                            text={designation?.code}
                            codeName="Designation"
                          />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {designation.name}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {designation.parent_desg?.name}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <StatusIndicator
                            status={designation.status}
                            onClick={
                              pagePermission?.update
                                ? () => handleStatusUpdate(designation)
                                : undefined
                            }
                            disabled={!pagePermission?.update}
                          />

                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex justify-center items-center gap-2">
                            {pagePermission?.update && (
                              <EditButton
                                onClick={() => handleSetEdit(designation)}
                              />
                            )}

                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}
          </div>


          {/* Modal for adding/editing Designation */}
          <Modal show={openModal} size="lg" popup={true} onClose={onCloseModal}>
            <Modal.Header />
            <Modal.Body>
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  {modalMode === "add" ? "Add Designation" : "Edit Designation"}
                </h3>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="designationCode" value="Designation Code" />
                    <span className="text-red-500">*</span>
                  </div>
                  <TextInput
                    id="designationCode"
                    type="text"
                    placeholder="Enter designation Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="designationName" value="Designation Name" />
                    <span className="text-red-500">*</span>
                  </div>
                  <TextInput
                    id="designationName"
                    type="text"
                    placeholder="Enter designation Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="parentID" value="Parent Designation" />
                  </div>
                  <Select
                    id="parentID"
                    value={parentDesignation}
                    onChange={(e) => setParentDesignation(e.target.value)}
                    required
                  >
                    <option value="">Select Parent Designation</option>
                    {filteredDesignations
                      .filter(
                        (element) =>
                          element.name === "ASM" || element.name === "RSM"
                      )
                      .map((element) => (
                        <option key={element._id} value={element._id}>
                          {element.name}
                        </option>
                      ))}
                  </Select>
                </div>

                <div className="flex justify-end items-center gap-2">
                  <Button color="gray" onClick={onCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={
                      modalMode === "add"
                        ? handleAddDesignation
                        : handleEditDesignation
                    }
                  >
                    {modalMode === "add" ? "Add" : "Update"}
                  </Button>
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

export default Designation;
