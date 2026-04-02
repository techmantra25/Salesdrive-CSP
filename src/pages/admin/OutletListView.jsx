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
import { FiExternalLink } from "react-icons/fi";
import { IoSyncCircleSharp } from "react-icons/io5";
import { MdDownloadForOffline } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { ApprovedOutletPaginated, outletApprovedUpdate } from "../../api/api";
import { getOutletSynced } from "../../api/outletApi";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBeats } from "../../redux/beatSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchStates } from "../../redux/stateSlice";
import moment from "moment";
import Datepicker from "react-tailwindcss-datepicker";

const OutletListView = () => {
  // State
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedOutletDetails, setSelectedOutletDetails] = useState(null);
  const [editOutletData, setEditOutletData] = useState(null);
  const [outletsLoading, setOutletsLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("default");
  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [selectedBeat, setSelectedBeat] = useState("default");
  const [statusFilter, setStatusFilter] = useState("active");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [errorLog, setErrorLog] = useState([]);

  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  // Redux selectors
  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );
  const activeStates = states.filter((state) => state.status === true);

  const { distributors } = useSelector((state) => state.distributors);
  const { beats } = useSelector((state) => state.beat);

  const dispatch = useDispatch();

  // Pagination
  const onPageChange = (page) => setCurrentPage(page);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchDistributors());
    dispatch(fetchBeats());
  }, [dispatch]);

  // Fetch outlets when filters change
  useEffect(() => {
    fetchOutletsPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedState,
    selectedDistributor,
    selectedBeat,
    statusFilter,
    dateRange,
    searchTerm,
  ]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedState,
    selectedDistributor,
    selectedBeat,
    statusFilter,
    dateRange,
    searchTerm,
  ]);

  // Debounced fetch
  const fetchOutletsPaginated = useDebounce(async () => {
    try {
      setOutletsLoading(true);
      const query = {
        page: currentPage,
        limit: 50,
        ...(statusFilter !== "All" && {
          statusFilter: statusFilter === "active",
        }),
        ...(selectedState !== "default" && { stateId: selectedState }),
        ...(selectedDistributor !== "default" && {
          distributorId: selectedDistributor,
        }),
        ...(selectedBeat !== "default" && { beatId: selectedBeat }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateRange.startDate &&
          dateRange.endDate && {
            fromDate: dateRange.startDate,
            toDate: dateRange.endDate,
          }),
      };

      const response = await ApprovedOutletPaginated(query);

      setOutlets(response?.data?.data || []);
      setTotalPages(response?.data?.pagination?.totalPages || 0);
      setFilteredCount(response?.data?.pagination?.filteredCount || 0);
      setTotalItems(response?.data?.pagination?.totalCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Outlets"
      );
    } finally {
      setOutletsLoading(false);
    }
  }, 700);

  // Handlers
  const handleResetFilter = () => {
    setStatusFilter("active");
    setSelectedState("default");
    setSelectedDistributor("default");
    setSelectedBeat("default");
    setSelectedOutletDetails(null);
    setDateRange({ startDate: null, endDate: null });
    setSearchTerm("");
    fetchOutletsPaginated();
  };

  const handleOutletDetails = (outlet) => {
    setSelectedOutletDetails(outlet);
    setOpenModal(true);
  };

  const handleEditOutlet = (outlet) => {
    setEditOutletData({
      outletName: outlet.outletName || "",
      ownerName: outlet.ownerName || "",
      mobile1: outlet.mobile1 || "",
      mobile2: outlet.mobile2 || "",
      whatsappNumber: outlet.whatsappNumber || "",
      address1: outlet.address1 || "",
      address2: outlet.address2 || "",
      city: outlet.city || "",
      pin: outlet.pin || "",
      location: outlet.location || "",
      categoryOfOutlet: outlet.categoryOfOutlet || "",
      contactPerson: outlet.contactPerson || "",
      email: outlet.email || "",
      gstin: outlet.gstin || "",
      aadharNumber: outlet.aadharNumber || "",
      panNumber: outlet.panNumber || "",
      retailerClass: outlet.retailerClass || "",
      enrolledStatus: outlet.enrolledStatus || "",
      shipToAddress: outlet.shipToAddress || "",
      shipToPincode: outlet.shipToPincode || "",
      competitorBrands: outlet.competitorBrands || [],
      preferredLanguage: outlet.preferredLanguage || "",
      teleCallDay: outlet.teleCallDay || "",
      marketCenter: outlet.marketCenter || "",
      gpsLocation: outlet.gpsLocation || "",
    });
    setSelectedOutletDetails(outlet);
    setOpenEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editOutletData || !selectedOutletDetails?._id) return;

    try {
      setEditLoading(true);
      await outletApprovedUpdate(editOutletData, selectedOutletDetails._id);
      toast.success("Outlet updated successfully");
      setOpenEditModal(false);
      setEditOutletData(null);
      setSelectedOutletDetails(null);
      fetchOutletsPaginated();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update outlet"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const onCloseEditModal = () => {
    setOpenEditModal(false);
    setEditOutletData(null);
    setSelectedOutletDetails(null);
  };

  const onCloseModal = () => {
    fetchOutletsPaginated();
    setOpenModal(false);
    setSelectedOutletDetails(null);
  };

  const handleErrorLogDownload = async () => {
    try {
      if (!errorLog.length) {
        toast.error("No error log data to download.");
        return;
      }

      // Collect all unique keys from the error log
      const allKeys = Array.from(
        errorLog.reduce((keys, obj) => {
          Object.keys(obj).forEach((key) => keys.add(key));
          return keys;
        }, new Set())
      );

      // Prepare CSV header
      const csv = [allKeys.join(",")];

      // Prepare CSV rows
      errorLog.forEach((entry) => {
        const row = allKeys
          .map((key) => {
            let value = entry[key];
            // Handle null/undefined
            if (value === null || value === undefined) value = "";
            // Escape quotes
            value = String(value).replace(/"/g, '""');
            // Wrap in quotes if contains comma, quote, or newline
            if (/[",\n]/.test(value)) value = `"${value}"`;
            return value;
          })
          .join(",");
        csv.push(row);
      });

      const csvString = csv.join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
      a.setAttribute("download", "error-log.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setErrorLog([]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download error log"
      );
    }
  };

  const [syncingOutlets, setSyncingOutlets] = useState(false);

  const handleSyncOutlets = async () => {
    openConfirmationModel({
      question: "Are you sure you want to sync outlets?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setSyncingOutlets(true);
            const res = await getOutletSynced();
            toast.success(
              `${res?.data?.metadata?.totalInserted} outlet synced successfully! & ${res?.data?.metadata?.totalSkipped} products skipped.`
            );

            if (res?.data?.data?.skippedRows.length > 0) {
              setErrorLog(res?.data?.data?.skippedRows);
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to sync outlets"
            );
          } finally {
            setSyncingOutlets(false);
            fetchOutletsPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  // UI
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Outlet Master List</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 w-full p-4">
        <Card className="w-full flex flex-col items-center">
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Count: {totalItems}</Badge>
            <Badge color="warning">Filtered Count: {filteredCount}</Badge>
          </div>
          <div className="flex flex-wrap justify-center w-full items-center gap-4">
            {/* Status Filter */}
            <div className="w-56">
              <Label
                htmlFor="statusSelect"
                value="Select Status"
                className="mb-2 block"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                id="statusSelect"
                required
              >
                <option value="All">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            {/* State Filter */}
            <div className="w-56">
              <Label
                htmlFor="stateSelect"
                value="Select State"
                className="mb-2 block"
              />
              <Select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                id="stateSelect"
                required
              >
                <option value="default">All</option>
                {activeStates.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))}
              </Select>
            </div>
            {/* Distributor Filter */}
            {selectedState !== "default" && (
              <div className="w-56">
                <Label
                  htmlFor="distributorSelect"
                  value="Select Distributor"
                  className="mb-2 block"
                />
                <Select
                  value={selectedDistributor}
                  onChange={(e) => setSelectedDistributor(e.target.value)}
                  id="distributorSelect"
                  required
                >
                  <option value="default">All</option>
                  {distributors
                    .filter((d) => d?.stateId?._id === selectedState)
                    .map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.dbCode})
                      </option>
                    ))}
                </Select>
              </div>
            )}
            {/* Beat Filter */}
            {/* {selectedDistributor !== "default" && (
              <div className="w-56">
                <Label
                  htmlFor="beatSelect"
                  value="Select Beat"
                  className="mb-2 block"
                />
                <Select
                  value={selectedBeat}
                  onChange={(e) => setSelectedBeat(e.target.value)}
                  id="beatSelect"
                  required
                >
                  <option value="default">All</option>
                  {beats
                    .filter(
                      (b) =>
                        Array.isArray(b?.distributorId) &&
                        b.distributorId
                          .map((d) => d._id)
                          .includes(selectedDistributor)
                    )
                    .map((b) => (
                      <option key={b._id} value={b._id}>
                        {b?.name} ({b?.code})
                      </option>
                    ))}
                </Select>
              </div>
            )} */}

            <div className="w-64">
              <div className="mb-2 block">
                <Label
                  htmlFor="dateRangeSelect"
                  value="Select Created Date Range"
                />
              </div>
              <Datepicker
                showShortcuts={true}
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>
            {/* Search */}
            <div className="w-56">
              <Label
                htmlFor="search"
                value="Search Outlet"
                className="mb-2 block"
              />
              <TextInput
                type="text"
                className="px-3 rounded-sm w-full"
                placeholder="Search Outlet by Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Filter Actions */}
          <div className="flex flex-wrap justify-center w-full items-center gap-2">
            <Button
              className="text-xs"
              size="sm"
              color="success"
              onClick={handleResetFilter}
            >
              <RiRefreshFill size={20} />
              Reset & Refresh
            </Button>
          </div>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex justify-end flex-wrap items-center w-full px-4">
        {!outletsLoading && filteredCount > 10 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showIcons
          />
        )}
      </div>

      {/* Table */}
      <div className="flex flex-col gap-4 w-full p-4">
        <div className="overflow-x-auto w-full">
          <Table striped>
            <Table.Head className="text-center">
              <Table.HeadCell className="whitespace-nowrap">
                Outlet UID
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Outlet Code
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Outlet Name
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Current Point <br /> Balance
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Owner Name
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                GST IN
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                PAN no
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Outlet Status
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                State
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Beat
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                City
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Location
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Outlet Source
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Created At
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Updated At
              </Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {outletsLoading || statesLoading ? (
                <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell
                    colSpan={"100%"}
                    className="font-medium text-gray-900 dark:text-gray-200"
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
                  {outlets?.map((outlet, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.outletUID && (
                          <UniqueCode
                            text={outlet?.outletUID}
                            codeName="Outlet UID"
                          />
                        )}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.outletCode && (
                          <div className="flex gap-2 justify-center items-center">
                            <button className="flex items-center gap-2">
                              <UniqueCode
                                text={outlet?.outletCode}
                                codeName="Outlet Code"
                              />
                              <span
                                className="cursor-pointer"
                                onClick={() => handleOutletDetails(outlet)}
                              >
                                <FiExternalLink color="#3795BD" />
                              </span>
                            </button>
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 cursor-pointer">
                        <div className="flex gap-2 justify-center items-center">
                          {outlet?.outletName}
                          <span
                            className="cursor-pointer"
                            onClick={() => handleOutletDetails(outlet)}
                          >
                            <FiExternalLink color="#3795BD" />
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.currentPointBalance}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.ownerName}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.gstin}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.panNumber}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <StatusIndicator status={outlet?.status} />
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.stateId?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.beatId?.name} -{" "}
                        <UniqueCode text={outlet?.beatId?.code} />
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.city}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.location}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.outletSource}
                      </Table.Cell>
                      <Table.Cell className="px-y px-2">
                        {moment(outlet?.createdAt)
                          ?.tz("Asia/Kolkata")
                          ?.format("DD-MM-YYYY hh:mm:ss A")}
                      </Table.Cell>
                      <Table.Cell className="px-y px-2">
                        {moment(outlet?.updatedAt)
                          ?.tz("Asia/Kolkata")
                          ?.format("DD-MM-YYYY hh:mm:ss A")}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {outlets?.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan={"100%"}
                        className="font-medium text-gray-900 dark:text-gray-200"
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

      {/* Outlet Details Modal */}
      <Modal show={openModal} onClose={onCloseModal} size="6xl">
        <Modal.Header>Outlet Details</Modal.Header>
        <Modal.Body>
          <div className="overflow-x-auto">
            <div className="w-full">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {[
                      ["Outlet Code", selectedOutletDetails?.outletCode],
                      ["Outlet UID", selectedOutletDetails?.outletUID],
                      ["Outlet Name", selectedOutletDetails?.outletName],
                      ["Owner Name", selectedOutletDetails?.ownerName],
                      ["Mobile 1", selectedOutletDetails?.mobile1],
                      ["Mobile 2", selectedOutletDetails?.mobile2],
                      ["Email", selectedOutletDetails?.email],
                      ["GST In", selectedOutletDetails?.gstin],
                      ["PAN No", selectedOutletDetails?.panNumber],
                      ["Adhaar No", selectedOutletDetails?.aadharNumber],

                      [
                        "Category of Outlet",
                        selectedOutletDetails?.categoryOfOutlet,
                      ],
                      ["Address", selectedOutletDetails?.address1],
                      ["Pincode", selectedOutletDetails?.pin],
                      ["City", selectedOutletDetails?.city],
                      ["Location", selectedOutletDetails?.location],
                      ["State", selectedOutletDetails?.stateId?.name],
                      [
                        "Region",
                        selectedOutletDetails?.distributorId?.regionId?.name,
                      ],
                      ["District", selectedOutletDetails?.district?.name],
                      ["Beat Name", selectedOutletDetails?.beatId?.name],
                      [
                        "Employee Name",
                        selectedOutletDetails?.employeeId?.name,
                      ],
                      ["ASM Name", selectedOutletDetails?.asm?.name],
                      ["RSM Name", selectedOutletDetails?.rsm?.name],
                      [
                        "Existing Retailer",
                        selectedOutletDetails?.existingRetailer ? "Yes" : "No",
                      ],
                      [
                        "Outlet Status",
                        selectedOutletDetails?.status ? "Active" : "Inactive",
                      ],
                      ["Outlet Source", selectedOutletDetails?.outletSource],
                      ["Outlet Class", selectedOutletDetails?.retailerClass],
                      [
                        "Tele Calling Slots",
                        selectedOutletDetails?.teleCallingSlot?.join(", "),
                      ],
                      [
                        "Selling Brands",
                        selectedOutletDetails?.sellingBrands
                          ?.map((brand) => brand.name)
                          .join(", "),
                      ],
                      [
                        "Competitor Brands",
                        selectedOutletDetails?.competitorBrands?.length > 0
                          ? selectedOutletDetails.competitorBrands.join(", ")
                          : "N/A",
                      ],
                      [
                        "Shipping Address",
                        selectedOutletDetails?.shipToAddress,
                      ],
                      [
                        "Shipping Pincode",
                        selectedOutletDetails?.shipToPincode,
                      ],
                      [
                        "Preferred Language",
                        selectedOutletDetails?.preferredLanguage,
                      ],
                      [
                        "Created At",
                        selectedOutletDetails?.createdAt
                          ? new Date(
                              selectedOutletDetails?.createdAt
                            ).toLocaleString()
                          : "",
                      ],
                      [
                        "Last Updated",
                        selectedOutletDetails?.updatedAt
                          ? new Date(
                              selectedOutletDetails?.updatedAt
                            ).toLocaleString()
                          : "",
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex border-b border-gray-100 dark:border-gray-800 py-2"
                      >
                        <div className="w-40 font-semibold text-gray-700 dark:text-gray-300">
                          {label}:
                        </div>
                        <div className="flex-1 text-gray-900 dark:text-gray-100">
                          {value || <span className="text-gray-400">—</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OutletListView;
