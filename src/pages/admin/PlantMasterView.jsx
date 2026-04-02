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

const PlantMasterView = () => {
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
                          <StatusIndicatorNew status={beat?.status} />
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
      </div>
    </>
  );
};

export default PlantMasterView;
