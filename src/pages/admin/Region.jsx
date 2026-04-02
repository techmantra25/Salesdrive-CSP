import {
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TableHead,
  TextInput,
} from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { IoMdAddCircle } from "react-icons/io";
import { MdSimCardDownload } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { addRegion, bulkUpload, updateRegion } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchZones } from "../../redux/zoneSlice";
import { fetchStates } from "../../redux/stateSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { MdDownloadForOffline } from "react-icons/md";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { getPagePermission } from "../../utils/permissionHelper";


const Region = () => {
  const dispatch = useDispatch();
  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.region
  );
  let filteredRegions = [...regions];
  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );
  const { zones, loading: zonesLoading } = useSelector((state) => state.zone);
  const activeZones = [...zones].filter((zone) => zone.status === true);
  const activeStates = [...states].filter((state) => state.status === true);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [zoneId, setZoneId] = useState(null);
  const [stateId, setStateId] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedZone, setSelectedZone] = useState("default");
  const [selectedState, setSelectedState] = useState("default");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [errorLog, setErrorLog] = useState([]);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const slug = "region";
    const permission = getPagePermission(permissionState, slug);
    setPagePermission(permission);
  }, [permissionState]);


  if (selectedStatus !== "default") {
    filteredRegions = [...filteredRegions].filter(
      (region) => region.status === (selectedStatus === "active" ? true : false)
    );
  }

  if (selectedZone !== "default") {
    filteredRegions = [...filteredRegions].filter(
      (region) => region.zoneId?._id === selectedZone
    );
  }

  if (selectedState !== "default") {
    filteredRegions = [...filteredRegions].filter(
      (region) => region.stateId?._id === selectedState
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setSelectedZone("default");
    setSelectedState("default");
    dispatch(fetchRegions());
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
    const csvData = filteredRegions.map((region) => {
      return {
        "Region Code": region.code,
        "Region Name": region.name,
        "State Code": region.stateId?.slug,
        "State Name": region.stateId?.name,
        Status: region.status ? "Active" : "Inactive",
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
    a.setAttribute("download", "regions.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCSVImport = (url) => {
    try {
      dispatch(fetchRegions());
      openConfirmationModel({
        question: "Are you sure you want to import this Regions CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };
              const res = await bulkUpload(payload, "Region");
              dispatch(fetchRegions());

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
                "Failed to import regions, try again"
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

  const handleSetEdit = (region) => {
    setSelectedRegion(region);
    setModalMode("edit");
    setName(region?.name);
    setCode(region?.code);
    setZoneId(region?.zoneId?._id);
    setStateId(region?.stateId?._id);
    setOpenModal(true);
  };

  const handleAddRegion = async () => {
    try {
      setFormLoading(true);
      if (!validate()) return;
      const payload = {
        code,
        name,
        zoneId: zoneId ? zoneId : null,
        stateId: stateId ? stateId : null,
      };
      await addRegion(payload);
      dispatch(fetchRegions());
      onCloseModal();
      toast.success("Region added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add region, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  function onCloseModal() {
    setOpenModal(false);
    setModalMode("add");
    setSelectedRegion(null);
    setName("");
    setCode("");
    setZoneId(null);
    setStateId(null);
  }

  const handleEditRegion = async () => {
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
              zoneId: zoneId ? zoneId : null,
              stateId: stateId ? stateId : null,
            };
            await updateRegion(payload, selectedRegion._id);
            dispatch(fetchRegions());
            toast.success("Region updated successfully");
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

  const handleStatusUpdate = async (region) => {
    openConfirmationModel({
      question: `Are you sure you want to ${region.status ? "deactivate" : "activate"
        } this region?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !region.status,
            };
            const res = await updateRegion(payload, region._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
            dispatch(fetchRegions());
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to update region status"
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
    link.setAttribute("download", "regions-error-log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear error log if necessary
    setErrorLog([]);
  };

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchZones());
    dispatch(fetchStates());
  }, [dispatch]);

  return (
    <>
      {pagePermission?.view && (
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Region Master</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">

              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count : {regions?.length} </Badge>
                <Badge color="warning">
                  Filtered Count : {filteredRegions?.length}
                </Badge>
              </div>

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
                    <Label htmlFor="stateSelect" value="Select State" />
                  </div>
                  <Select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    id="stateSelect"
                    required
                  >
                    <option value="default">All</option>
                    {selectedZone !== "default"
                      ? states
                        .filter((ele) => ele?.zoneId?._id == selectedZone)
                        .map((state) => (
                          <option key={state._id} value={state._id}>
                            {state.name}
                          </option>
                        ))
                      : states.map((state) => (
                        <option key={state._id} value={state._id}>
                          {state.name}
                        </option>
                      ))}
                  </Select>
                </div>

              </div>

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
                      Add Region
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
            {regionsLoading || zonesLoading || statesLoading ? (
              <div className="w-full flex justify-center items-center">
                <Spinner size="xl" />
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table striped>
                  <Table.Head className="text-center">
                    <Table.HeadCell>Region Code</Table.HeadCell>
                    <Table.HeadCell>Region Name</Table.HeadCell>
                    <Table.HeadCell>State Code</Table.HeadCell>
                    <Table.HeadCell>State Name</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>

                  <Table.Body>
                    {filteredRegions.map((region, index) => (
                      <Table.Row key={index} className="text-center">

                        <Table.Cell>
                          <UniqueCode text={region?.code} codeName="Region" />
                        </Table.Cell>

                        <Table.Cell>
                          {region.name}
                        </Table.Cell>

                        <Table.Cell>
                          <UniqueCode
                            text={region?.stateId?.slug}
                            codeName="State"
                          />
                        </Table.Cell>

                        <Table.Cell>
                          {region?.stateId?.name}
                        </Table.Cell>

                        <Table.Cell>
                          <StatusIndicator
                            status={region.status}
                            onClick={
                              pagePermission?.update
                                ? () => handleStatusUpdate(region)
                                : undefined
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex gap-2 justify-center items-center">
                            {pagePermission?.update && (
                              <EditButton onClick={() => handleSetEdit(region)} />
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

          <Modal show={openModal} size="sm" onClose={onCloseModal} popup>
            <Modal.Body>

              {modalMode === "add" && pagePermission?.create && (
                <Button onClick={handleAddRegion} disabled={formLoading}>
                  Add Region
                </Button>
              )}

              {modalMode === "edit" && pagePermission?.update && (
                <Button onClick={handleEditRegion} disabled={formLoading}>
                  Update Region
                </Button>
              )}

            </Modal.Body>
          </Modal>

        </div>
      )}
    </>
  );

};

export default Region;
