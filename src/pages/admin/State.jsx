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
import { MdSimCardDownload } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { addState, bulkUpload, updateState } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchStates } from "../../redux/stateSlice";
import { fetchZones } from "../../redux/zoneSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { MdDownloadForOffline } from "react-icons/md";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { getPagePermission } from "../../utils/permissionHelper";


const State = () => {
  const dispatch = useDispatch();
  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );
  let filteredStates = [...states];
  const { zones, loading: zonesLoading } = useSelector((state) => state.zone);
  const activeZones = zones.filter((zone) => zone.status === true);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [zoneId, setZoneId] = useState(null);
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [modalMode, setModalMode] = useState("add");
  const [selectedState, setSelectedState] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedZone, setSelectedZone] = useState("default");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [errorLog, setErrorLog] = useState([]);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const slug = "state";
    const permission = getPagePermission(permissionState, slug);
    setPagePermission(permission);
  }, [permissionState]);


  if (selectedStatus !== "default") {
    filteredStates = [...filteredStates].filter(
      (state) => state.status === (selectedStatus === "active" ? true : false)
    );
  }

  if (selectedZone !== "default") {
    filteredStates = [...filteredStates].filter((state) => {
      return state.zoneId && state.zoneId._id === selectedZone;
    });
  }

  // sort by name
  filteredStates.sort((a, b) => a.name.localeCompare(b.name));

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setSelectedZone("default");
    dispatch(fetchStates());
  };

  const validate = () => {
    if (code.trim() === "") {
      toast.error("Please enter state code");
      return false;
    }
    if (name.trim() === "") {
      toast.error("Please enter state name");
      return false;
    }
    if (slug.trim() === "") {
      toast.error("Please enter state alpha code");
      return false;
    }
    return true;
  };

  const handleCSVTemplateDownload = () => {
    const csv = [
      "State GST Code,State Name,State Alpha Code,Zone Code,Zone Name",
      "12,State Name 1,NR,Z-LX-004,Zone1",
    ];
    const csvString = csv.join("\n");
    const a = document.createElement("a");

    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "state_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportToCSV = () => {
    const csvData = filteredStates.map((state) => {
      return {
        "State Code": state?.slug,
        "State Name": state?.name,
        "Stat GST Code": state?.code,
        "Zone Code": state?.zoneId?.code,
        "Zone Name": state?.zoneId?.name,
        Status: state.status ? "Active" : "Inactive",
      };
    });
    // to escape CSV values >> so that commas, quotes, and new lines are handled correctly
    const csv = csvData.map((row) =>
      Object.values(row).map(escapeCSVValue).join(",")
    );
    csv.unshift(Object.keys(csvData[0]).map(escapeCSVValue).join(","));
    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "states.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCSVImport = (url) => {
    try {
      console.log(url);
      dispatch(fetchStates());
      openConfirmationModel({
        question: "Are you sure you want to import this State CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              setFormLoading(true);
              let payload = {
                file: url,
              };
              const res = await bulkUpload(payload, "State");
              dispatch(fetchStates());
              if (
                res?.data?.data?.length === 0 &&
                res?.data?.skippedRows?.length === 0
              ) {
                toast.error("No data found in the file to import");
                return;
              } else if (res?.data?.skippedRows?.length > 0) {
                toast.error(
                  `${res?.data?.skippedRows?.length} rows skipped, ${res?.data?.data?.length ? res?.data?.data?.length : 0
                  } rows imported in the State Master`
                );
                setErrorLog(res?.data?.skippedRows);
              } else {
                toast.success(
                  `${res?.data?.data?.length} rows imported in the State Master`
                );
              }
              onCloseModal();
            } catch (error) {
              console.error(error);
              console.log(error);
              toast.error(
                error?.response?.data?.message ||
                "Failed to import states, try again"
              );
            } finally {
              setFormLoading(false);
            }
          } else {
            onCloseModal();
            return;
          }
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetEdit = (state) => {
    setSelectedState(state);
    setModalMode("edit");
    setName(state?.name);
    setCode(state?.code);
    setSlug(state?.slug);
    setZoneId(state?.zoneId?._id);
    setOpenModal(true);
  };

  const handleAddState = async () => {
    try {
      if (!validate()) return;
      const payload = {
        code,
        slug,
        name,
        zoneId: zoneId ? zoneId : null,
      };
      await addState(payload);
      dispatch(fetchStates());
      onCloseModal();
      toast.success("State added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add state, try again"
      );
    }
  };

  function onCloseModal() {
    setOpenModal(false);
    setModalMode("add");
    setSelectedState(null);
    setName("");
    setCode("");
    setSlug("");
    setZoneId(null);
  }

  const handleEditState = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this state?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;
            const payload = {
              code,
              slug,
              name,
              zoneId: zoneId ? zoneId : null,
            };
            await updateState(payload, selectedState._id);
            dispatch(fetchStates());
            toast.success("State updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update state, try again"
            );
          } finally {
            setFormLoading(false);
          }
        } else {
          onCloseModal();
          return;
        }
      },
    });
  };

  const handleStatusUpdate = async (state) => {
    openConfirmationModel({
      question: `Are you sure you
      want to ${state.status ? "deactivate" : "activate"} this state?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !state.status,
            };
            const res = await updateState(payload, state._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
            dispatch(fetchStates());
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to update state status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleErrorLogDownload = () => {
    // Construct CSV content
    const csv = [
      ["State Name", "Zone Code", "Zone Name", "Index", "Reason"], // CSV headers
      ...errorLog.map((row) => [
        row["State Name"] || "",
        row["Zone Code"] || "",
        row["Zone Name"] || "",
        row["index"] || "",
        row["reason"] || "",
      ]),
    ];

    // Create CSV string
    const csvContent =
      "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");

    // Encode URI
    const encodedUri = encodeURI(csvContent);

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "states-error-log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear error log if necessary
    setErrorLog([]);
  };

  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchZones());
  }, [dispatch]);

  return (
    <>
      {pagePermission?.view && (
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">State Master</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count : {states?.length} </Badge>
                <Badge color="warning">
                  Filtered Count : {filteredStates?.length}{" "}
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
                {/* filter : 2 */}
                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="zoneSelect" value="Select Zone" />
                  </div>
                  <Select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    id="zoneSelect"
                    required
                  >
                    <option value="default">All</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone._id}>
                        {zone.name}
                      </option>
                    ))}
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
                      Add State
                    </span>
                  </Button>
                )}

                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="blue"
                    onClick={() => {
                      handleExportToCSV();
                    }}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <BiSolidFileExport size={20} />
                      CSV Download
                    </span>
                  </Button>
                )}

                {errorLog.length > 0 && pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="red"
                    onClick={() => {
                      handleErrorLogDownload();
                    }}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <MdDownloadForOffline size={20} />
                      Error Log
                      <Badge color="gray">{errorLog.length}</Badge>
                    </span>
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* table */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            {statesLoading || zonesLoading ? (
              <div className="w-full flex justify-center items-center" role="status">
                <Spinner aria-label="Default status example" size="xl" />
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table striped>
                  <Table.Head className="text-center">
                    <Table.HeadCell>State Code</Table.HeadCell>
                    <Table.HeadCell>State Name</Table.HeadCell>
                    <Table.HeadCell>State GST Code</Table.HeadCell>
                    <Table.HeadCell>Zone Code</Table.HeadCell>
                    <Table.HeadCell>Zone Name</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredStates.map((state, index) => (
                      <Table.Row
                        key={index}
                        className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode text={state?.slug} codeName="State code" />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {state.name}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode text={state?.code} codeName="GST code" />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode
                            text={state?.zoneId?.code}
                            codeName="Zone Code"
                          />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {state?.zoneId?.name}
                        </Table.Cell>
                        <Table.Cell className={`whitespace-nowrap font-medium `}>
                          <StatusIndicator
                            status={state.status}
                            onClick={
                              pagePermission?.update
                                ? () => handleStatusUpdate(state)
                                : undefined
                            }
                          />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex gap-2 justify-center items-center">
                            {pagePermission?.update && (
                              <EditButton onClick={() => handleSetEdit(state)} />
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}

                    {filteredStates.length === 0 && (
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
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="State GST Code" />
                  </div>
                  <TextInput
                    placeholder="Enter State GST Code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                  />
                </div>

                <div className="w-full">
                  {modalMode === "add" && pagePermission?.create && (
                    <Button onClick={handleAddState} disabled={formLoading}>
                      {formLoading ? (
                        <Spinner size="sm" aria-label="Loading spinner" />
                      ) : (
                        "Add State"
                      )}
                    </Button>
                  )}

                  {modalMode === "edit" && pagePermission?.update && (
                    <Button onClick={handleEditState} disabled={formLoading}>
                      {formLoading ? (
                        <Spinner size="sm" aria-label="Loading spinner" />
                      ) : (
                        "Update State"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Modal.Body>
          </Modal>

        </div>
      )}
    </>
  );

};

export default State;
