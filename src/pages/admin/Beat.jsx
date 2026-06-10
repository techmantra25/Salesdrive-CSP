import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { FiExternalLink } from "react-icons/fi";
import { IoIosList, IoMdAddCircle } from "react-icons/io";
import { MdDownloadForOffline, MdSimCardDownload } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  addBeat,
  beatListPaginated,
  bulkUpload,
  updateBeat,
} from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import BeatDetails from "../../components/BeatDetails";
import { DBListModal } from "../../components/DBListModal";
import SearchableSelect from "../../components/SearchableSelect";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBeats } from "../../redux/beatSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { getPagePermission } from "../../utils/permissionHelper";
import { getSubDivisionList } from "../../api/sub-divisionapi";

const Beat = () => {
  const dispatch = useDispatch();
  // let filteredBeats = [...beats];
  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.region
  );
  const activeRegions = regions.filter((region) => region.status === true);
  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );
  const activeDistributors = distributors.filter(
    (distributor) => distributor.status === true
  );

  const [beatType, setBeatType] = useState("normal");
  const [distributorId, setDistributorId] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [name, setName] = useState("");
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [beats, setBeats] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [regionId, setRegionId] = useState("");
  const [subDivisionId, setSubDivisionId] = useState("");
  const [allSubDivisions, setAllSubDivisions] = useState([]);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [csvLoading, setCSVLoading] = useState(false);
  const [selectedBeatDetails, setSelectedBeatDetails] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [beatsLoading, setBeatsLoading] = useState(false);
  const [selectedBeatForDBList, setSelectedBeatForDBList] = useState(null);
  const [openDBListModal, setOpenDBListModal] = useState(false);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const onPageChange = (page) => setCurrentPage(page);

  const [beatIdsInput, setBeatIdsInput] = useState("");
  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "beat");
    setPagePermission(permission);
  }, [permissionState]);

  let fetchOutletsPaginatedWithOutDebounce = async () => {
    try {
      setBeatsLoading(true);
      const query = {
        page: currentPage,
        limit: 30,
      };

      if (searchTerm) {
        query.search = searchTerm;
      }

      if (selectedStatus !== "default") {
        query.status = selectedStatus === "active" ? true : false;
      }

      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }
      if (selectedDistributor !== "default") {
        query.distributorId = selectedDistributor;
      }

      const response = await beatListPaginated(query);
      setBeats(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Outlets"
      );
    } finally {
      setBeatsLoading(false);
    }
  };

  const distributorListByRegion = activeDistributors.filter(
    (distributor) => distributor?.regionId?._id === regionId
  );

  let fetchOutletsPaginated = useDebounce(
    fetchOutletsPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setSelectedRegion("default");
    setSelectedDistributor("default");
    setSearchTerm("");
    fetchOutletsPaginated();
  };

  const parseBeatIdsInput = (inputString) => {
    if (!inputString) return [];
    return inputString
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");
  };

  const validate = () => {
    if (
      name.trim() === "" ||
      subDivisionId.trim() === "" ||
      regionId.trim() === "" ||
      distributorId.length === 0
    ) {
      toast.error("Beat name, zone, region or distributor is missing");
      return false;
    }
    return true;
  };

  const handleExportToCSV = async () => {
    try {
      setCSVLoading(true);
      const query = {
        page: currentPage,
        limit: 10,
      };
      if (searchTerm) {
        query.search = searchTerm;
      }

      if (selectedStatus !== "default") {
        query.status = selectedStatus === "active" ? true : false;
      }

      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }
      if (selectedDistributor !== "default") {
        query.distributorId = selectedDistributor;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/beat/beat-report`,
        {
          params: query,
        }
      );

      if (response.status === 200) {
        const csvLink = response?.data?.data?.csvLink;
        const link = document.createElement("a");
        link.href = csvLink;
        link.download = "beat.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to export Beats"
      );
    } finally {
      setCSVLoading(false);
    }
  };

  const handleSetEdit = (beat) => {
    setSelectedBeat(beat);
    setModalMode("edit");
    setName(beat?.name);
    setBeatType(beat?.beat_type);
    setRegionId(beat?.regionId?._id);
    setSubDivisionId(beat?.subDivisionId?._id || "");
    setDistributorId(beat?.distributorId?.map((dist) => dist._id) || []);
    setBeatIdsInput(beat?.beatIds?.join(", ") || "");
    setOpenModal(true);
  };

  const handleAddBeat = async () => {
    try {
      if (!validate()) return;
      const beatIdsArray = parseBeatIdsInput(beatIdsInput);
      const payload = {
        name,
        beat_type: beatType,
        regionId,
        subDivisionId: subDivisionId || undefined,
        distributorId,
        beatIds: beatIdsArray ?? [],
      };
      // console.log(payload, "Payload for add beat");

      await addBeat(payload);
      dispatch(fetchBeats());
      onCloseModal();
      toast.success("Beat added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add beat, try again"
      );
    }
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedBeat(null);
    setName("");
    setBeatType("normal");
    setRegionId("");
    setSubDivisionId("");
    setDistributorId([]);
    setBeatIdsInput("");
    fetchOutletsPaginated();
  };

  const handleEditBeat = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this beat?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;
            const beatIdsArray = parseBeatIdsInput(beatIdsInput);
            const payload = {
              name,
              beat_type: beatType,
              regionId,
              subDivisionId: subDivisionId || undefined,
              distributorId,
              beatIds: beatIdsArray ?? [],
            };
            // console.log("Payload for update:", payload);

            await updateBeat(payload, selectedBeat._id);
            dispatch(fetchBeats());
            toast.success("Beat updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update beat, try again"
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

  const handleStatusUpdate = async (beat) => {
    openConfirmationModel({
      question: `Are you sure you want to ${beat.status ? "deactivate" : "activate"
        } this beat?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !beat.status,
            };
            const res = await updateBeat(payload, beat._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated, dependency exists!");
            } else {
              toast.success("Status updated successfully");
            }
            dispatch(fetchBeats());
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to update beat status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleBeatDetails = async (beat) => {
    setSelectedBeatDetails(beat);
    setOpenDetailModal(true);
  };

  const oncloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedBeatDetails(null);
  };

  const [errorLog, setErrorLog] = useState([]);

  const handleCSVTemplateDownload = () => {
    const headers = [
      "Beat Name",
      "Beat IDs",
      "Beat Type",
      "Zone Code",
      "Distributor Codes",
    ];

    const descriptions = [
      "(Required)",
      "[Example: 74674,94899 - comma separated for multiple]",
      "(Required)[Example: normal, split]",
      "(Required)[Example: Budge Budge]",
      "(Required)[Example: DIS001,DIS002 - comma separated for multiple DB codes]",
    ];

    // Helper function to escape CSV values
    const escapeCSVValue = (value) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Escape and join
    const csvString =
      headers.map(escapeCSVValue).join(",") +
      "\n" +
      descriptions.map(escapeCSVValue).join(",");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "beat_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBulkImport = async (url) => {
    try {
      fetchOutletsPaginated();
      openConfirmationModel({
        question: "Are you sure you want to import this csv?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };
              const res = await bulkUpload(payload, "beat");

              toast.success(
                `${res?.data?.data?.length} rows uploaded and ${res?.data?.skippedRows?.length} rows failed to upload`
              );

              setErrorLog(res?.data?.skippedRows);

              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message || "Failed to import, try again"
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
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to import, try again"
      );
    }
  };

  const handleErrorLogDownload = () => {
    try {
      if (!errorLog.length) {
        toast.error("No error log to download.");
        return;
      }

      // Dynamically get all unique keys from all objects
      const allKeys = Array.from(
        errorLog.reduce((keys, row) => {
          Object.keys(row).forEach((k) => keys.add(k));
          return keys;
        }, new Set())
      );

      // CSV header
      const csv = [allKeys.join(",")];

      // CSV rows
      errorLog.forEach((row) => {
        const csvRow = allKeys
          .map((key) => {
            // Escape quotes and wrap in quotes
            const value = row[key] !== undefined ? String(row[key]) : "";
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",");
        csv.push(csvRow);
      });

      // Join all rows into a single CSV string
      const csvString = csv.join("\n");

      // Create a blob and trigger the download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
      a.setAttribute("download", "skipped-beat-log.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Optionally clear the error log
      setErrorLog([]);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download skipped log, try again"
      );
    }
  };

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchDistributors());
    fetchSubDivisions();
  }, [dispatch]);

  const fetchSubDivisions = async () => {
    try {
      const res = await getSubDivisionList();
      setAllSubDivisions(res?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOutletsPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedRegion,
    selectedDistributor,
    selectedStatus,
    searchTerm,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, selectedDistributor, selectedStatus, searchTerm]);

  const handleOpenDBListModal = (employee) => {
    console.log("handleOpenDBListModal", employee);
    setSelectedBeatForDBList(employee);
    setOpenDBListModal(true);
  };

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">

          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Beat Master</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count : {totalItems} </Badge>
                <Badge color="warning">Filtered Count : {filteredCount} </Badge>
              </div>
              {/* filter div */}
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
                <div className="w-44">
                  <div className="block">
                    <Label value="Search" />
                  </div>
                  <TextInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search"
                  />
                </div>
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
                    <Label htmlFor="regionSelect" value="Select Region" />
                  </div>
                  <Select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    id="regionSelect"
                    required
                  >
                    <option value="default">All</option>
                    {regions?.map((region) => (
                      <option key={region?._id} value={region?._id}>
                        {region?.name}
                      </option>
                    ))}
                  </Select>
                </div>
                {/* filter : 3 */}
                <div className="w-56">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="selectDistributor"
                      value="Select Distributor"
                    />
                  </div>
                  <Select
                    value={selectedDistributor}
                    onChange={(e) => setSelectedDistributor(e.target.value)}
                    id="selectDistributor"
                    required
                  >
                    <option value="default">All</option>
                    {selectedRegion !== "default"
                      ? distributors
                        .filter(
                          (distributor) =>
                            distributor?.regionId?._id === selectedRegion
                        )
                        .map((distributor) => (
                          <option
                            key={distributor?._id}
                            value={distributor?._id}
                          >
                            {distributor?.name}
                          </option>
                        ))
                      : distributors.map((distributor) => (
                        <option key={distributor?._id} value={distributor?._id}>
                          {distributor?.name}
                        </option>
                      ))}
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
                      Add beat
                    </span>
                  </Button>)}
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="blue"
                    onClick={() => {
                      handleExportToCSV();
                    }}
                    disabled={beatsLoading || csvLoading}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <BiSolidFileExport size={20} />
                      {csvLoading ? "Downloading..." : "CSV Download"}
                    </span>
                  </Button>)}
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    color="light"
                    size="sm"
                    onClick={() => {
                      handleCSVTemplateDownload();
                    }}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <MdSimCardDownload size={20} />
                      Template
                    </span>
                  </Button>)}

                {pagePermission?.create && (
                  <FileUpload
                    type="single-file"
                    page="bulk-import"
                    onSetFileUrl={(url) => {
                      handleBulkImport(url);
                    }}
                    btnTitle="File Upload"
                  />
                )}


                {pagePermission?.view && errorLog.length > 0 && (

                  <Button
                    className="text-xs"
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

          <div className="flex justify-end items-center w-full px-4 ">
            <div className="flex overflow-x-auto sm:justify-center">
              {!beatsLoading && filteredCount > 10 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  showIcons
                />
              )}
            </div>
          </div>

          {/* table */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <div className="overflow-x-auto w-full">
              <Table striped>
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap">
                    Beat Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Associated Beat IDs
                  </Table.HeadCell>{" "}
                  <Table.HeadCell className="whitespace-nowrap">
                    Beat Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Beat Type
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Zone
                  </Table.HeadCell>
                  {/* <Table.HeadCell className="whitespace-nowrap">
                    Region Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Region Name
                  </Table.HeadCell> */}
                  <Table.HeadCell className="whitespace-nowrap">
                    State Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    State Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Distributor(s)
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Actions
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {beatsLoading || regionsLoading || distributorsLoading ? (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="16"
                        className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                      >
                        <div
                          className="w-full flex justify-center items-center"
                          role="status"
                        >
                          <Spinner aria-label="Loading data" size="xl" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    <>
                      {beats?.map((beat) => (
                        <Table.Row
                          key={beat._id}
                          className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <button className="flex items-center justify-center gap-2">
                              <UniqueCode text={beat?.code} codeName="Beat" />{" "}
                              <span onClick={() => handleBeatDetails(beat)}>
                                <FiExternalLink color="#3795BD" />
                              </span>
                            </button>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.beatIds && beat.beatIds.length > 0 ? (
                              <div className="flex flex-wrap justify-center items-center gap-1">
                                {beat.beatIds
                                  .map((bId) => (
                                    <UniqueCode
                                      key={bId}
                                      text={bId}
                                      codeName="Beat ID"
                                    />
                                  ))
                                  .reduce((prev, curr) => [prev, ", ", curr])}
                              </div>
                            ) : (
                              ""
                            )}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 cursor-pointer hover:text-lime-600">
                            <div className="flex gap-2 justify-center items-center">
                              <button className="flex items-center justify-center gap-2">
                                {beat?.name}
                                <span onClick={() => handleBeatDetails(beat)}>
                                  <FiExternalLink color="#3795BD" />
                                </span>
                              </button>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.beat_type}{" "}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.subDivisionId ? `${beat?.subDivisionId?.name} (${beat?.subDivisionId?.code})` : "-"}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={beat?.regionId?.stateId?.slug}
                              codeName="Region"
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat.regionId ? beat?.regionId?.name : ""}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.distributorId?.length > 0 ? (
                              <div
                                className="flex justify-center items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                                onClick={
                                  pagePermission?.view
                                    ? () => handleOpenDBListModal(beat)
                                    : undefined
                                }

                              >
                                <IoIosList size={18} />
                              </div>
                            ) : null}
                          </Table.Cell>

                          <Table.Cell
                            className={`whitespace-nowrap font-medium `}
                          >
                            <StatusIndicator
                              status={beat?.status}
                              onClick={
                                pagePermission?.update
                                  ? () => handleStatusUpdate(beat)
                                  : undefined
                              }
                              disabled={!pagePermission?.update}
                            />

                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex gap-2 justify-center items-center">
                              {pagePermission?.update && (
                                <EditButton onClick={() => handleSetEdit(beat)} />
                              )}

                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {beats?.length === 0 && (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan={"100%"}
                            className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                          >
                            No data found
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>

          {/* Add/Edit Modal  */}
          <Modal show={openModal} onClose={onCloseModal}>
            <Modal.Header>
              {modalMode === "add" ? "Add Beat" : "Edit Beat"}
            </Modal.Header>
            <Modal.Body className="min-h-[50vh]">
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="beat-name">Beat Name *</Label>
                  <TextInput
                    id="beat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter beat name"
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="associatedBeatIds">
                      Associated Beat IDs (comma-separated)
                    </Label>
                  </div>
                  <TextInput
                    id="associatedBeatIds"
                    value={beatIdsInput}
                    onChange={(e) => setBeatIdsInput(e.target.value)}
                    placeholder=" Enter Beat Ids   e.g: 12345, 5654, 6789"
                  />
                </div>
                <div>
                  <Label htmlFor="beat-type">Beat Type </Label>
                  <Select
                    id="beat-type"
                    value={beatType}
                    onChange={(e) => setBeatType(e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="split">Split</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subDivision">Zone *</Label>
                  <Select
                    id="subDivision"
                    value={subDivisionId}
                    onChange={(e) => {
                      const selectedSDId = e.target.value;
                      setSubDivisionId(selectedSDId);
                      setDistributorId([]);

                      const selectedSD = allSubDivisions.find((sd) => sd._id === selectedSDId);
                      const autoStateId = selectedSD?.districtId?.stateId?._id || "";
                      const matchedRegion = activeRegions.find((r) => r?.stateId?._id === autoStateId);
                      setRegionId(matchedRegion?._id || autoStateId);
                    }}
                  >
                    <option value="">Select Zone</option>
                    {allSubDivisions
                      .filter((sd) => sd.status === true)
                      .map((sd) => (
                        <option key={sd._id} value={sd._id}>
                          {sd.name} ({sd.code})
                        </option>
                      ))}
                  </Select>
                </div>
                <div>
                  {/* <Label htmlFor="region">Region *</Label> */}
                   <Label htmlFor="region">State *</Label>
                  <Select
                    id="region"
                    value={regionId}
                    onChange={(e) => {
                      setRegionId(e.target.value);
                      setDistributorId([]); // Clear selected distributors when state changes
                    }}
                  >
                    <option value="">Select State</option>
                    {activeRegions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {regionId ? (
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="distributorId" value="Distributors *" />
                    </div>
                    <SearchableSelect
                      id="distributorId"
                      options={distributorListByRegion}
                      value={distributorId}
                      onChange={(e) => setDistributorId(e.target.value)}
                      placeholder="Select Distributor"
                      displayKey="name"
                      valueKey="_id"
                      descKey="desc"
                      multiple={true}
                    />
                  </div>
                ) : null}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="flex justify-end space-x-2">
                <Button onClick={onCloseModal} color="gray">
                  Cancel
                </Button>
                {modalMode === "add" ? (
                  <Button onClick={handleAddBeat} disabled={formLoading}>
                    {formLoading && <Spinner className="mr-2" />}
                    Add Beat
                  </Button>
                ) : (
                  <Button onClick={handleEditBeat} disabled={formLoading}>
                    {formLoading && <Spinner className="mr-2" />}
                    Update Beat
                  </Button>
                )}
              </div>
            </Modal.Footer>
          </Modal>

          {/* Beat Detail Modal */}
          {openDetailModal && (
            <BeatDetails
              openDetailModal={openDetailModal}
              oncloseDetailModal={oncloseDetailModal}
              beat={selectedBeatDetails}
            />
          )}

          {/* DB List Modal */}
          {openDBListModal && (
            <DBListModal
              openDBListModal={openDBListModal}
              setOpenDBListModal={setOpenDBListModal}
              DBList={selectedBeatForDBList}
            />
          )}
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

export default Beat;
