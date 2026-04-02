import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { addDistrict, AllDistrictList, updateDistrict } from "../../api/api";
import toast from "react-hot-toast";
import { fetchStates } from "../../redux/stateSlice";
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
import { RiRefreshFill } from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";
import { BiSolidFileExport } from "react-icons/bi";
import { MdDownloadForOffline } from "react-icons/md";
import UniqueCode from "../../assets/common/UniqueCode";
import StatusIndicator from "../../assets/common/StatusIndicator";
import EditButton from "../../assets/common/EditButton";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { getPagePermission } from "../../utils/permissionHelper";

const District = () => {
  const dispatch = useDispatch();
  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );
  const activeStates = [...states].filter((state) => state.status === true);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [stateId, setStateId] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [allDistricts, setAllDistricts] = useState([]);
  const [disLoading, setDisLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedState, setSelectedState] = useState("default");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [errorLog, setErrorLog] = useState([]);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const slug = "district";
    const permission = getPagePermission(permissionState, slug);
    setPagePermission(permission);
  }, [permissionState]);


  async function fetchDistricts() {
    try {
      setDisLoading(true);
      const res = await AllDistrictList();
      setAllDistricts(res?.data?.data);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load Districts,try again"
      );
    } finally {
      setDisLoading(false);
    }
  }

  let filteredDistricts = [...allDistricts];

  if (selectedStatus !== "default") {
    filteredDistricts = [...filteredDistricts].filter(
      (dis) => dis.status === (selectedStatus === "active" ? true : false)
    );
  }

  if (selectedState !== "default") {
    filteredDistricts = [...filteredDistricts].filter(
      (dis) => dis?.stateId?._id === selectedState
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setSelectedState("default");
    fetchDistricts();
    dispatch(fetchStates());
  };

  const validate = () => {
    if (code.trim() === "") {
      toast.error("Please enter region code and it should be unique");
      return false;
    }
    if (name.trim() === "") {
      toast.error("Please enter region name");
      return false;
    }
    if (!stateId) {
      toast.error("Please select a state");
      return false;
    }
    return true;
  };

  const handleCSVTemplateDownload = () => {
    const csv = [
      "Region Name,Zone Code,Zone Name,State Code,State Name",
      "Region Name 1,Z-LX-004,Test Zone1,State Code 1,State Name 1",
      "Region Name 2,Z-LX-004,Test Zone1,State Code 2,State Name 2",
    ];
    const csvString = csv.join("\n");
    const a = document.createElement("a");

    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "region_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportToCSV = () => {
    const csvData = filteredDistricts.map((dis) => {
      return {
        "District Code": dis.code,
        "District Name": dis.name,
        "State Code": dis.stateId?.slug,
        "State Name": dis.stateId?.name,
        Status: dis.status ? "Active" : "Inactive",
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
    a.setAttribute("download", "districts.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCSVImport = (url) => {
    try {
      openConfirmationModel({
        question: "Are you sure you want to import this districts CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };
              const res = await bulkUpload(payload, "Region");
              fetchDistricts();

              if (
                res?.data?.data?.length === 0 &&
                res?.data?.skippedRows?.length === 0
              ) {
                toast.error("No data found in the file to import");
                return;
              } else if (res?.data?.skippedRows?.length > 0) {
                toast.error(
                  `${res?.data?.skippedRows?.length} rows skipped, ${res?.data?.data?.length ? res?.data?.data?.length : 0
                  } rows imported in the Region Master`
                );
                setErrorLog(res?.data?.skippedRows);
              } else {
                toast.success(
                  `${res?.data?.data?.length} rows imported in the Region Master`
                );
              }

              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                "Failed to import districts, try again"
              );
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

  const handleSetEdit = (dis) => {
    setSelectedDistrict(dis);
    setModalMode("edit");
    setName(dis?.name);
    setCode(dis?.code);
    setStateId(dis?.stateId?._id);
    setOpenModal(true);
  };

  const handleAddDistrict = async () => {
    try {
      setFormLoading(true);
      if (!validate()) return;
      const payload = {
        code,
        name,
        stateId: stateId ? stateId : null,
      };
      await addDistrict(payload);
      fetchDistricts();
      onCloseModal();
      toast.success("District added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add district, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  function onCloseModal() {
    setOpenModal(false);
    setModalMode("add");
    setSelectedDistrict(null);
    setName("");
    setCode("");
    setStateId(null);
  }

  const handleEditDistrict = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this region?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;
            const payload = {
              code,
              name,
              stateId: stateId ? stateId : null,
            };
            await updateDistrict(payload, selectedDistrict._id);
            fetchDistricts();
            toast.success("District updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update region, try again"
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

  const handleStatusUpdate = async (dis) => {
    openConfirmationModel({
      question: `Are you sure you want to ${dis.status ? "deactivate" : "activate"
        } this region?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !dis.status,
            };
            const res = await updateDistrict(payload, dis._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
            fetchDistricts();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update district status"
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
      [
        "Region Name",
        "Zone Code",
        "Zone Name",
        "State Code",
        "State Name",
        "Index",
        "Reason",
      ], // CSV headers
      ...errorLog.map((row) => [
        row["Region Name"] || "",
        row["Zone Code"] || "",
        row["Zone Name"] || "",
        row["State Code"] || "",
        row["State Name"] || "",
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
    link.setAttribute("download", "districts-error-log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear error log if necessary
    setErrorLog([]);
  };

  useEffect(() => {
    fetchDistricts();
    dispatch(fetchStates());
  }, []);

  return (
    <>
      {pagePermission?.view && (
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">District Master</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">
                  Total Count : {allDistricts?.length}
                </Badge>
                <Badge color="warning">
                  Filtered Count : {filteredDistricts?.length}
                </Badge>
              </div>

              {/* filter div */}
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">

                {/* status filter */}
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

                {/* state filter */}
                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="stateSelect" value="Select State" />
                  </div>
                  <Select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    id="stateSelect"
                    required
                  >
                    <option value="default">All</option>
                    {activeStates?.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </Select>
                </div>

              </div>

              {/* buttons */}
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
                      Add District
                    </span>
                  </Button>
                )}

                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="blue"
                    onClick={handleExportToCSV}
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
                    onClick={handleErrorLogDownload}
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
            {disLoading || statesLoading ? (
              <div className="w-full flex justify-center items-center">
                <Spinner size="xl" />
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table striped>

                  <Table.Head className="text-center">
                    <Table.HeadCell>District Code</Table.HeadCell>
                    <Table.HeadCell>District Name</Table.HeadCell>
                    <Table.HeadCell>State Code</Table.HeadCell>
                    <Table.HeadCell>State Name</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>

                  <Table.Body>

                    {filteredDistricts.map((dis, index) => (

                      <Table.Row key={index} className="text-center">

                        <Table.Cell>
                          <UniqueCode text={dis?.code} codeName="District Code" />
                        </Table.Cell>

                        <Table.Cell>
                          {dis.name}
                        </Table.Cell>

                        <Table.Cell>
                          <UniqueCode
                            text={dis?.stateId?.slug}
                            codeName="State Code"
                          />
                        </Table.Cell>

                        <Table.Cell>
                          {dis?.stateId?.name}
                        </Table.Cell>

                        <Table.Cell>

                          <StatusIndicator
                            status={dis.status}
                            onClick={
                              pagePermission?.update
                                ? () => handleStatusUpdate(dis)
                                : undefined
                            }
                          />

                        </Table.Cell>

                        <Table.Cell>

                          <div className="flex gap-2 justify-center items-center">

                            {pagePermission?.update && (
                              <EditButton
                                onClick={() => handleSetEdit(dis)}
                              />
                            )}

                          </div>

                        </Table.Cell>

                      </Table.Row>

                    ))}

                    {filteredDistricts.length === 0 && (
                      <Table.Row className="text-center">
                        <Table.Cell colSpan={"100%"}>
                          No data found
                        </Table.Cell>
                      </Table.Row>
                    )}

                  </Table.Body>

                </Table>
              </div>
            )}
          </div>

          {/* modal */}
          <Modal show={openModal} size="sm" onClose={onCloseModal} popup>

            <Modal.Header />

            <Modal.Body>

              <div className="space-y-5">

                <div className="w-full">
                  <Label value="District Code" />
                  <TextInput
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="w-full">
                  <Label value="District Name" />
                  <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="w-full">
                  <Label value="Select State" />
                  <Select
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                  >
                    <option value="">Select State</option>
                    {activeStates.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-full">

                  {modalMode === "add" && pagePermission?.create && (
                    <Button onClick={handleAddDistrict} disabled={formLoading}>
                      {formLoading ? <Spinner size="sm" /> : "Add District"}
                    </Button>
                  )}

                  {modalMode === "edit" && pagePermission?.update && (
                    <Button onClick={handleEditDistrict} disabled={formLoading}>
                      {formLoading ? <Spinner size="sm" /> : "Update District"}
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

export default District;
