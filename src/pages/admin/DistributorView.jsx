import {
  Badge,
  Button,
  Card,
  Dropdown,
  DropdownItem,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa";
import { ImSpinner } from "react-icons/im";
import { IoIosList, IoMdAddCircle } from "react-icons/io";
import {
  MdDownloadForOffline,
  MdEdit,
  MdSimCardDownload,
} from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { VscGitFetch } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import {
  addDistributor,
  AllDistrictList,
  bulkUpload,
  getDistributorPassword,
  updateDistributor,
} from "../../api/api";
import { getSalesOrderData } from "../../api/externalApi";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { AccessManagementModal } from "../../components/AccessManagementModal";
import { BrandListModal } from "../../components/BrandListModal";
import SearchableSelect from "../../components/SearchableSelect";
import { ShowBeats } from "../../components/ShowBeats";
import { ShowCredential } from "../../components/ShowCredential";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchBrands } from "../../redux/brandSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchStates } from "../../redux/stateSlice";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { FileUpload } from "../../uploadWidget/FileUpload";

const DistributorView = () => {
  const dispatch = useDispatch();

  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );
  const { states } = useSelector((state) => state.state);
  const activeStates = states.filter((state) => state.status === true);
  const { regions } = useSelector((state) => state.region);
  const activeRegions = regions.filter((region) => region.status === true);
  const { brands } = useSelector((state) => state.brand);
  const activeBrands = brands.filter((brand) => brand.status === true);

  const [districts, setDistricts] = useState([]);
  const activeDistricts = districts.filter(
    (district) => district.status === true
  );

  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedState, setSelectedState] = useState("default");
  const [openBrandsModal, setOpenBrandsModal] = useState(false);
  const [selectedDistributorForBrands, setSelectedDistributorForBrands] =
    useState(null);
  

  const [credentialModalLoading, setCredentialModalLoading] = useState(false);
  const [
    selectedDistributorForCredential,
    setSelectedDistributorForCredential,
  ] = useState(null);
  const [disPassword, setDisPassword] = useState(null);
  const [adminPassword, setAdminPassword] = useState(null);
  const [showCredentialModal, setShowCredentialModal] = useState(false);

  const [accessManagementModal, setAccessManagementModal] = useState(false);
  const [
    selectedDistributorForAccessManagement,
    setSelectedDistributorForAccessManagement,
  ] = useState(null);

  const [showBeatsModal, setShowBeatsModal] = useState(false);
  const [selectedDistributorForBeats, setSelectedDistributorForBeats] =
    useState(null);

  // Add state for brand selection
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  let filteredDistributors = [...distributors];

  if (selectedStatus !== "default") {
    filteredDistributors = filteredDistributors.filter(
      (ele) => ele.status === (selectedStatus === "active" ? true : false)
    );
  }

  if (selectedRegion !== "default") {
    filteredDistributors = filteredDistributors.filter(
      (ele) => ele?.regionId?._id == selectedRegion
    );
  }

  if (selectedState !== "default") {
    filteredDistributors = filteredDistributors.filter(
      (ele) => ele?.stateId?._id == selectedState
    );
  }

  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm?.toLowerCase();
    filteredDistributors = filteredDistributors?.filter(
      (distributor) =>
        distributor?.name?.toLowerCase()?.includes(lowerCaseSearchTerm) ||
        distributor?.dbCode?.toLowerCase()?.includes(lowerCaseSearchTerm)
    );
  }

  if (dateRange.startDate && dateRange.endDate) {
    const start = moment(dateRange.startDate).startOf("day");
    const end = moment(dateRange.endDate).endOf("day");

    filteredDistributors = filteredDistributors?.filter((distributor) =>
      moment(distributor?.createdAt).isBetween(start, end, null, "[]")
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    dispatch(fetchDistributors());
    setSelectedRegion("default");
    setSelectedState("default");
    setDateRange({ startDate: null, endDate: null });
    setSearchTerm("");
    dispatch(fetchDistributors());
  };


  console.log(selectedDistributor, "selectedDistributor");

 


  const handleShowCredential = async (distributor) => {
    try {
      setCredentialModalLoading(true);
      setSelectedDistributorForCredential(distributor);
      setShowCredentialModal(true);
      const res = await getDistributorPassword(distributor?._id);
      setDisPassword(res?.data?.data?.password);
      setAdminPassword(res?.data?.data?.genPassword);
    } catch (error) {
      console.error(error);
    } finally {
      setCredentialModalLoading(false);
    }
  };

  const onCloseCredentialModal = () => {
    setShowCredentialModal(false);
    setSelectedDistributorForCredential(null);
    setDisPassword(null);
    setAdminPassword(null);
  };

  const onCloseAccessManagementModal = () => {
    setAccessManagementModal(false);
    setSelectedDistributorForAccessManagement(null);
  };

  const onCloseBeatsModal = () => {
    setShowBeatsModal(false);
    setSelectedDistributorForBeats(null);
  };

  const handleShowBeats = async (distributor) => {
    setSelectedDistributorForBeats(distributor);
    setShowBeatsModal(true);
  };

  const handleCSVTemplateDownload = () => {
    // Define headers
    const headers = [
      "DB Code (Required)",
      "Distributor Type (Required)",
      "Name (Required)",
      "Email (Required)",
      "Phone (Required)",
      "State Code (Required)",
      "State (Required)",
      "Brands (Required)",
      "Owner Name",
      "Address 1",
      "Address 2",
      "City",
      "Pincode",
      "District",
      "Day Off",
      "GST No",
      "PAN No",
      "Area",
    ];

    // Sample row (example values for guidance)
    const sampleRows = [
      {
        "DB Code (Required)": "DWB001",
        "Distributor Type (Required)": "GT",
        "Name (Required)": "ABC Distributors",
        "Email (Required)": "abcdistributors@example.com",
        "Phone (Required)": "9876543210",
        "State Code (Required)": "WB",
        "State (Required)": "West Bengal",
        "Brands (Required)": "MS,BM",
        "Owner Name": "Kiran Seth",
        "Address 1": "123 Main Street",
        "Address 2": "Near Market",
        City: "Kolkata",
        Pincode: "700001",
        District: "Kolkata",
        "Day Off": "Sunday",
        "GST No": "19ABCDE1234F1Z5",
        "PAN No": "ABCDE1234F",
        Area: "Barasat, Sodepur",
      },
    ];

    // Function to escape CSV values
    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return "";

      const stringValue = String(value);

      // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    };

    // Create CSV rows
    const csvRows = [
      // Header row
      headers.map((header) => escapeCsvValue(header)).join(","),
      // Sample data rows
      ...sampleRows.map((row) =>
        headers.map((header) => escapeCsvValue(row[header] || "")).join(",")
      ),
    ];

    const csvString = csvRows.join("\n");

    // Create and download the file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.setAttribute("download", "distributor_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  // get all the districts
  const getAllDistricts = async () => {
    try {
      const response = await AllDistrictList();
      const data = response?.data?.data || [];
      setDistricts(data);
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    }
  };

  useEffect(() => {
    getAllDistricts();
    dispatch(fetchDistributors());
    dispatch(fetchStates());
    dispatch(fetchRegions());
    dispatch(fetchBrands());
  }, [dispatch]);

  const handleShowBrands = (distributor) => {
    setSelectedDistributorForBrands(distributor);
    setOpenBrandsModal(true);
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Distributor Master</h1>
          </div>
        </div>

        {/* filters */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <Card className="w-full flex justify-center items-center flex-col">
            {/* filter card header */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">
                Total Count : {distributors?.length}{" "}
              </Badge>
              <Badge color="warning">
                Filtered Count : {filteredDistributors?.length}{" "}
              </Badge>
            </div>
            <div className="flex justify-center w-full items-center gap-4 flex-wrap">
              {/* filter : 1 */}
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

              {/* filter : 2 */}
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

              {/** filter 3 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="disSelect" value="Select State" />
                </div>
                <Select
                  value={selectedState}
                  onChange={(event) => setSelectedState(event.target.value)}
                >
                  <option value="default">All</option>
                  {states?.map((option, index) => (
                    <option key={index} value={option?._id}>
                      {option?.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/** filter 4 */}
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
                  {selectedState !== "default"
                    ? regions
                        ?.filter(
                          (regions) => regions?.stateId?._id === selectedState
                        )
                        .map((option, index) => (
                          <option key={index} value={option?._id}>
                            {option?.name}
                          </option>
                        ))
                    : regions.map((option, index) => (
                        <option key={index} value={option?._id}>
                          {option?.name}
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

        {/* table */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          {distributorsLoading ? (
            <div
              className="w-full flex justify-center items-center"
              role="status"
            >
              <Spinner aria-label="Default status example" size="xl" />
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table striped className="text-sm">
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    DB Code
                  </Table.HeadCell>

                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Creds
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Type
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Owner
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Email
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Phone
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Address
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    City
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    PIN
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    District
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Day Off
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    SBU
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Brands
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    GST
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    PAN
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Region
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    State
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Area
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Beats
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Created Date Time
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Status
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {filteredDistributors?.map((distributor, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Table.Cell className="px-2 py-2 text-xs font-medium text-gray-900 dark:text-gray-200">
                        <UniqueCode
                          text={distributor?.dbCode}
                          codeName="Distributor"
                        />
                      </Table.Cell>

                      <Table.Cell className="px-2 py-2 text-xs font-medium text-gray-900 dark:text-gray-200 max-w-32 truncate">
                        <span title={distributor.name}>{distributor.name}</span>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2">
                        <div className="flex justify-center items-center text-green-600 dark:text-green-400 cursor-pointer hover:text-green-800 dark:hover:text-green-300">
                          {credentialModalLoading &&
                          selectedDistributorForCredential?._id ===
                            distributor._id ? (
                            <ImSpinner className="animate-spin" size={16} />
                          ) : (
                            <FaRegEye
                              size={16}
                              onClick={() => {
                                handleShowCredential(distributor);
                              }}
                            />
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.role || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-28 truncate">
                        <span title={distributor?.ownerName}>
                          {distributor?.ownerName || ""}
                        </span>
                      </Table.Cell>

                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-32 truncate">
                        <span title={distributor?.email}>
                          {distributor?.email || ""}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.phone || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-40 truncate">
                        <span
                          title={`${distributor?.address1 || ""} ${
                            distributor?.address2 || ""
                          }`}
                        >
                          {distributor?.address1 || ""}
                          {distributor?.address2 && `, ${distributor.address2}`}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.city || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.pincode || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.district?.name || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.dayOff?.join(", ") || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.sbu || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-48 truncate">
                        {distributor?.brandId?.length > 0 ? (
                          <div
                            className="flex justify-center items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                            onClick={() => handleShowBrands(distributor)}
                          >
                            <IoIosList size={18} />
                          </div>
                        ) : null}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.gst_no || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.pan_no || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col items-center gap-1">
                          <UniqueCode
                            text={distributor?.regionId?.code}
                            codeName="Region"
                          />
                          <span
                            className="text-xs truncate max-w-20"
                            title={distributor?.regionId?.name}
                          >
                            {distributor?.regionId?.name || ""}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col items-center gap-1">
                          <UniqueCode
                            text={distributor?.stateId?.code}
                            codeName="State"
                          />
                          <span
                            className="text-xs truncate max-w-20"
                            title={distributor?.stateId?.name}
                          >
                            {distributor?.stateId?.name || ""}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-32 truncate">
                        <span title={distributor?.area?.join(", ")}>
                          {distributor?.area ? distributor.area.join(", ") : ""}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2">
                        <div
                          className="flex justify-center items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                          onClick={() => handleShowBeats(distributor)}
                        >
                          <IoIosList size={18} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2">
                        {moment(distributor?.createdAt)
                          .tz("Asia/Kolkata")
                          .format("DD-MM-YYYY hh:mm:ss A")}
                      </Table.Cell>

                      <Table.Cell className="px-2 py-2">
                        <StatusIndicator
                          status={distributor?.status}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {filteredDistributors?.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan={22}
                        className="px-2 py-8 text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        No distributors found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>


      {/* credential modal */}
      {showCredentialModal && (
        <ShowCredential
          showCredentialModal={showCredentialModal}
          selectedDistributorForCredential={selectedDistributorForCredential}
          credentialModalLoading={credentialModalLoading}
          disPassword={disPassword}
          adminPassword={adminPassword}
          onCloseCredentialModal={onCloseCredentialModal}
        />
      )}

      {/* access management modal */}
      {accessManagementModal && (
        <AccessManagementModal
          showAccessManagementModal={accessManagementModal}
          onCloseAccessManagementModal={onCloseAccessManagementModal}
          selectedDistributorForAccessManagement={
            selectedDistributorForAccessManagement
          }
        />
      )}

      {/* show beats modal */}
      {showBeatsModal && (
        <ShowBeats
          showBeatsModal={showBeatsModal}
          onCloseBeatsModal={onCloseBeatsModal}
          usedIn={"distributor"}
          config={{
            distributor: selectedDistributorForBeats,
          }}
        />
      )}

      {/* Brand List Modal */}
      {openBrandsModal && (
        <BrandListModal
          openBrandsModal={openBrandsModal}
          setOpenBrandsModal={setOpenBrandsModal}
          brandList={selectedDistributorForBrands}
        />
      )}
    </>
  );
};

export default DistributorView;
