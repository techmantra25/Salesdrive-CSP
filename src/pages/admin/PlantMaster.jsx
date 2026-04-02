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
import { IoMdAddCircle } from "react-icons/io";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { addPlant, AllPlantList, updatePlant } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import { StatusIndicatorNew } from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBeats } from "../../redux/beatSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchStates } from "../../redux/stateSlice";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { getPagePermission } from "../../utils/permissionHelper";


const PlantMaster = () => {
  const dispatch = useDispatch();

  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );

  const activeStates = states.filter((state) => state.status === true);

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  const [formLoading, setFormLoading] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [beats, setBeats] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState(null);
  const [csvLoading, setCSVLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [beatsLoading, setBeatsLoading] = useState(false);

  const [filterState, setFilterState] = useState("default");

  const [plantCode, setPlantCode] = useState("");
  const [plantName, setPlantName] = useState("");
  const [plantShortName, setPlantShortName] = useState("");
  const [address, setAddress] = useState("");
  const [pinCode, setPincode] = useState("");
  const [city, setCity] = useState("");
  //   const [state, setState] = useState("");
  const [salesOrganisation, setSalesOrganisation] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const onPageChange = (page) => setCurrentPage(page);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (permissionState) {
      const permission = getPagePermission(permissionState, "plant");
      setPagePermission(permission);
    }
  }, [permissionState]);


  let fetchOutletsPaginatedWithOutDebounce = async () => {
    try {
      setBeatsLoading(true);
      const query = {
        page: currentPage,
        limit: 1000,
      };

      if (selectedStatus !== "default") {
        query.status = selectedStatus;
      }

      if (searchTerm !== "") {
        query.search = searchTerm;
      }

      if (filterState !== "default") {
        query.stateId = filterState;
      }

      const response = await AllPlantList(query);
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

  let fetchOutletsPaginated = useDebounce(
    fetchOutletsPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setFilterState("default");
    setSearchTerm("");
    setSelectedState("");
    fetchOutletsPaginated();
  };

  const validate = () => {
    if (plantCode.trim() === "") {
      toast.error("Please enter plant code");
      return false;
    }
    if (plantName.trim() === "") {
      toast.error("Please enter plant name");
      return false;
    }
    if (plantShortName.trim() === "") {
      toast.error("Please enter plant short name");
      return false;
    }

    return true;
  };

  const handleExportToCSV = () => {
    setCSVLoading(true);
    const csvData = beats?.map((supplier) => {
      return {
        "Plant Code": supplier?.plantCode ?? "",
        "Plant Name": supplier?.plantName ?? "",
        "Plant Short Name": supplier?.plantShortName ?? "",
        Address: supplier?.address ?? "",
        PostalCode: supplier?.pinCode ?? "",
        City: supplier?.city ?? "",
        StateCode: supplier?.stateId?.code ?? "",
        StateName: supplier?.stateId?.name ?? "",
        SalesOrganization: supplier?.salesOrganisation ?? "",
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
    a.setAttribute("download", "plants.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCSVLoading(false);
  };

  //   try {
  //     setCSVLoading(true);
  //     const query = {
  //       page: currentPage,
  //       limit: 20,
  //     };

  //     if (selectedStatus !== "default") {
  //       query.status = selectedStatus;
  //     }

  //     if (searchTerm !== "") {
  //       query.search = searchTerm;
  //     }

  //     if (filterState !== "default") {
  //       query.stateId = filterState;
  //     }

  //     const response = await axios.get(
  //       `${BACKEND_URL}/api/v1/beat/beat-report`,
  //       {
  //         params: query,
  //       }
  //     );

  //     if (response.status === 200) {
  //       const csvLink = response?.data?.data?.csvLink;
  //       const link = document.createElement("a");
  //       link.href = csvLink;
  //       link.download = "beat.csv";
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     }
  //   } catch (error) {
  //     toast.error(
  //       error?.response?.data?.message ||
  //         error?.message ||
  //         "Failed to export Beats"
  //     );
  //   } finally {
  //     setCSVLoading(false);
  //   }
  // };

  const handleSetEdit = (beat) => {
    setSelectedBeat(beat);
    setModalMode("edit");
    setPlantCode(beat?.plantCode);
    setPlantName(beat?.plantName);
    setPlantShortName(beat?.plantShortName);
    setAddress(beat?.address);
    setPincode(beat?.pinCode);
    setCity(beat?.city);
    setSelectedState(beat?.stateId?._id);
    setSalesOrganisation(beat?.salesOrganisation);
    setOpenModal(true);
  };

  const handleAddBeat = async () => {
    try {
      if (!validate()) return;
      const payload = {
        plantCode,
        plantName,
        plantShortName,
        address,
        pinCode,
        city,
        stateId: selectedState,
        salesOrganisation,
      };
      await addPlant(payload);
      onCloseModal();
      toast.success("Plant added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add plant, try again"
      );
    }
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add"); // setSelectedBeat(null);
    setPlantCode("");
    setPlantName("");
    setPlantShortName("");
    setAddress("");
    setPincode("");
    setCity("");
    setSelectedState("");
    setSalesOrganisation("");
    fetchOutletsPaginated();
  };

  const handleEditBeat = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this plant?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;
            const payload = {
              plantCode,
              plantName,
              plantShortName,
              address,
              pinCode,
              city,
              stateId: selectedState,
              salesOrganisation,
            };
            await updatePlant(payload, selectedBeat._id);
            dispatch(fetchBeats());
            toast.success("Plant updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update plant, try again"
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
      question: `Are you sure you want to ${beat.status == "active" ? "deactivate" : "activate"
        } this plant?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: beat?.status == "active" ? "inactive" : "active",
            };
            const res = await updatePlant(payload, beat._id);
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated, dependency exists!");
            } else {
              toast.success("Status updated successfully");
            }
            fetchOutletsPaginated();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to update plant status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchDistributors());
  }, [dispatch]);

  useEffect(() => {
    fetchOutletsPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedStatus, searchTerm, filterState]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchTerm, filterState]);

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">


          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Plant Master</h1>
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
                {/* filter : 1 */}
                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="keyword" value="Search By Keyword" />
                  </div>
                  <TextInput
                    type="text"
                    className="px-3 rounded-sm w-full"
                    placeholder="Search By Keyword"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    id="stateSelect"
                    required
                    disabled={statesLoading}
                  >
                    <option value="default">All</option>
                    {activeStates.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* filter : 3 */}
                {/* <div className="w-56">
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
              </div> */}
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
                      Add plant
                    </span>
                  </Button>)}

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
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex justify-end items-center w-full px-4 ">
            <div className="flex overflow-x-auto sm:justify-center">
              {!beatsLoading && filteredCount > 20 && (
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
                    Plant Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Plant Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Plant Short Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Address
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Postal Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    City
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    State
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap truncate">
                    Sales Organization
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap">
                    Actions
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {beatsLoading || statesLoading ? (
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
                            <UniqueCode
                              text={beat?.plantCode}
                              codeName="Plant Code"
                            />
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 cursor-pointer hover:text-lime-600">
                            <div className="flex gap-2 justify-center items-center">
                              <button className="flex items-center justify-center gap-2">
                                {beat?.plantName}
                                {/* Uncomment below if needed */}
                                {/* <span onClick={() => handleBeatDetails(beat)}>
                  <FiExternalLink color="#3795BD" />
                </span> */}
                              </button>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.plantShortName}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 truncate">
                            {beat?.address}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.pinCode}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.city}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.stateId?.name}({beat?.stateId?.code})
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {beat?.salesOrganisation}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium">
                            <StatusIndicatorNew
                              status={beat?.status}
                              onClick={
                                pagePermission?.update
                                  ? () => handleStatusUpdate(beat)
                                  : undefined
                              }
                            />

                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex gap-2 justify-center items-center">
                              <EditButton
                                onClick={
                                  pagePermission?.update
                                    ? () => handleSetEdit(beat)
                                    : undefined
                                }
                              />

                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {beats?.length === 0 && (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan="100%"
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
              {modalMode === "add" ? "Add Plant" : "Edit Plant"}
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="beat-name">Plant Code</Label>
                  <TextInput
                    id="plant-code"
                    value={plantCode}
                    onChange={(e) => setPlantCode(e.target.value)}
                    placeholder="Enter beat name"
                    readOnly={modalMode === "edit"}
                    disabled={modalMode === "edit"}
                  />
                </div>
                <div>
                  <Label htmlFor="beat-name">Plant Name</Label>
                  <TextInput
                    id="plant-name"
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    placeholder="Enter beat name"
                  />
                </div>
                <div>
                  <Label htmlFor="beat-type">Plant Short Name</Label>
                  <TextInput
                    id="plant-short-name"
                    value={plantShortName}
                    onChange={(e) => setPlantShortName(e.target.value)}
                    placeholder="Enter beat name"
                  />
                </div>

                <div>
                  <Label htmlFor="distributor">Address</Label>
                  <TextInput
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter beat name"
                  />
                </div>

                <div>
                  <Label htmlFor="distributor">Postal Code</Label>
                  <TextInput
                    id="pinCode"
                    value={pinCode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter beat name"
                  />
                </div>

                <div>
                  <Label htmlFor="distributor">City</Label>
                  <TextInput
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter beat name"
                  />
                </div>

                <div>
                  <Label htmlFor="distributor">State</Label>
                  <Select
                    id="distributor"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    <option value="">Select State</option>
                    {activeStates.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="distributor">Sales Organization</Label>
                  <TextInput
                    id="salesOrganization"
                    value={salesOrganisation}
                    onChange={(e) => setSalesOrganisation(e.target.value)}
                    placeholder="Enter beat name"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button onClick={onCloseModal} color="gray">
                    Cancel
                  </Button>
                  {modalMode === "add" ? (
                    <Button
                      onClick={handleAddBeat}
                      disabled={formLoading || !pagePermission?.create}
                    >

                      {formLoading && <Spinner className="mr-2" />}
                      Add Plant
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEditBeat}
                      disabled={formLoading || !pagePermission?.update}
                    >

                      {formLoading && <Spinner className="mr-2" />}
                      Update Plant
                    </Button>
                  )}
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

export default PlantMaster;
