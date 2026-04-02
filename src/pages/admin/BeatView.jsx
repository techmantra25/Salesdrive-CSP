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

const BeatView = () => {
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
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [beats, setBeats] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [regionId, setRegionId] = useState("");

  const [selectedBeatDetails, setSelectedBeatDetails] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [beatsLoading, setBeatsLoading] = useState(false);
  const [selectedBeatForDBList, setSelectedBeatForDBList] = useState(null);
  const [openDBListModal, setOpenDBListModal] = useState(false);

  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const onPageChange = (page) => setCurrentPage(page);

  const [beatIdsInput, setBeatIdsInput] = useState("");

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

  const handleBeatDetails = async (beat) => {
    setSelectedBeatDetails(beat);
    setOpenDetailModal(true);
  };

  const oncloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedBeatDetails(null);
  };

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchDistributors());
  }, [dispatch]);

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
                  Region Code
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap">
                  Region Name
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap">
                  Distributor(s)
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap">
                  Status
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
                          <UniqueCode
                            text={beat?.regionId?.code}
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
                              onClick={() => handleOpenDBListModal(beat)}
                            >
                              <IoIosList size={18} />
                            </div>
                          ) : null}
                        </Table.Cell>

                        <Table.Cell
                          className={`whitespace-nowrap font-medium `}
                        >
                          <StatusIndicator status={beat?.status} />
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
    </>
  );
};

export default BeatView;
