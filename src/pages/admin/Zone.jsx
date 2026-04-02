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
import { addZone, updateZone } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchZones } from "../../redux/zoneSlice";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { getPagePermission } from "../../utils/permissionHelper";

const Zone = () => {
  const dispatch = useDispatch();
  const { zones, loading } = useSelector((state) => state.zone);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  let filteredZones = [...zones];
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [modalMode, setModalMode] = useState("add");
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const slug = "zone";
    const permission = getPagePermission(permissionState, slug);
    setPagePermission(permission);
  }, [permissionState]);

  if (selectedStatus !== "default") {
    filteredZones = [...filteredZones].filter(
      (zone) => zone.status === (selectedStatus === "active" ? true : false)
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    dispatch(fetchZones());
  };

  const validate = () => {
    if (code.trim() === "") {
      toast.error("Please enter zone code");
      return false;
    }
    if (name.trim() === "") {
      toast.error("Please enter zone name");
      return false;
    }
    return true;
  };

  const handleSetEdit = (zone) => {
    setSelectedZone(zone);
    setModalMode("edit");
    setName(zone.name);
    setCode(zone.code);
    setOpenModal(true);
  };

  const handleAddZone = async () => {
    try {
      if (!validate()) return;
      const payload = {
        name: name,
        code: code,
      };
      await addZone(payload);
      dispatch(fetchZones());
      onCloseModal();
      toast.success("Zone added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add zone, try again"
      );
    }
  };

  function onCloseModal() {
    setOpenModal(false);
    setModalMode("add");
    setSelectedZone(null);
    setName("");
    setCode("");
  }

  const handleEditZone = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this zone?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            if (!validate()) return;
            const payload = {
              name: name,
              code: code,
            };
            await updateZone(payload, selectedZone._id);
            dispatch(fetchZones());
            toast.success("Zone updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update zone  try again"
            );
          }
        } else {
          onCloseModal();
          return;
        }
      },
    });
  };

  const handleStatusUpdate = async (zone) => {
    openConfirmationModel({
      question: `Are you sure you want to ${zone.status ? "deactivate" : "activate"
        } this zone?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !zone.status,
            };
            const res = await updateZone(payload, zone._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
            dispatch(fetchZones());
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to update zone status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleExportToCSV = () => {
    const csvData = filteredZones.map((zone) => {
      return {
        "Zone Code": zone?.code,
        "Zone Name": zone?.name,
        Status: zone?.status ? "Active" : "Inactive",
      };
    });

    const csv = csvData.map((row) => Object.values(row).join(","));
    csv.unshift(Object.keys(csvData[0]).join(","));

    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "zones.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    dispatch(fetchZones());
  }, [dispatch]);

  return (
    <>
      {pagePermission?.view && (
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Zone Master</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count : {zones?.length} </Badge>
                <Badge color="warning">
                  Filtered Count : {filteredZones?.length}
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
                {pagePermission?.view && (
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
                )}
                {pagePermission?.create && (
                  <Button
                    className="text-xs"
                    size="sm"
                    onClick={() => setOpenModal(true)}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <IoMdAddCircle size={20} />
                      Add Zone
                    </span>
                  </Button>
                )}
                {pagePermission?.view && (
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
                  </Button>
                )}
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
                    <Table.HeadCell>Zone Code</Table.HeadCell>
                    <Table.HeadCell>Zone Name</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredZones.map((zone, index) => (
                      <Table.Row
                        key={index}
                        className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode text={zone?.code} codeName="Zone" />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {zone.name}
                        </Table.Cell>
                        <Table.Cell className={`whitespace-nowrap font-medium `}>
                          {pagePermission?.update && (
                            <StatusIndicator
                              status={zone.status}
                              onClick={() => handleStatusUpdate(zone)}
                            />
                          )}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex gap-2 justify-center items-center">
                            {pagePermission?.update && (
                              <EditButton onClick={() => handleSetEdit(zone)} />
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    {filteredZones.length === 0 && (
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

          <Modal show={openModal} size="sm" onClose={onCloseModal} popup>
            <Modal.Header />
            <Modal.Body>
              <div className="space-y-5">
                <div className="w-full ">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Zone Code" />
                  </div>
                  <TextInput
                    placeholder="Enter Zone Code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                  />
                </div>
                <div className="w-full ">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Zone Name" />
                  </div>
                  <TextInput
                    placeholder="Enter Zone Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="w-full">
                  {pagePermission?.create || pagePermission?.update ? (
                    <Button
                      onClick={modalMode == "add" ? handleAddZone : handleEditZone}
                    >
                      {modalMode == "add" ? "Add Zone" : "Update Zone"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      )}
    </>
  );
};

export default Zone;
