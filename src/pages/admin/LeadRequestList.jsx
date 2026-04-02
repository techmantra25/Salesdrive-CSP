import axios from "axios";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Label,
  Pagination,
  Select,
  Spinner,
  Table,
} from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { FaRegEye, FaTimesCircle } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { MdDownloadForOffline } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import { BulkOutletApproval } from "../../api/api";
import { StatusIndicator2 } from "../../assets/common/StatusIndicator";
import OutLetDetails from "../../components/OutLetDetails";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchZones } from "../../redux/zoneSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";

const LeadRequestList = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedOutletDetails, setSelectedOutletDetails] = useState(null);
  const [outletsLoading, setOutletsLoading] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [csvLoading, setCSVLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [errorLog, setErrorLog] = useState([]);
  const [selectedOutletIds, setSelectedOutletIds] = useState([]);
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };
  const onPageChange = (page) => setCurrentPage(page);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchZones());
    dispatch(fetchRegions());
  }, [dispatch]);

  useEffect(() => {
    fetchOutletsPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedRegion, statusFilter, dateRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, statusFilter, dateRange]);

  // const { zones } = useSelector((state) => state.zone);

  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.region
  );

  let fetchOutletsPaginatedWithOutDebounce = async () => {
    try {
      setOutletsLoading(true);
      const query = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "All") {
        query.outletStatus = statusFilter;
      }
      if (statusFilter === "All") {
        delete query.outletStatus;
      }

      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }

      if (dateRange.startDate && dateRange.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/outlet/paginated-outlet-list`,
        {
          params: query,
        }
      );

      setOutlets(response?.data?.data);
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
      setOutletsLoading(false);
    }
  };

  let fetchOutletsPaginated = useDebounce(
    fetchOutletsPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setStatusFilter("Pending");
    setSelectedRegion("default");
    setSelectedOutletDetails(null);
    setDateRange({
      startDate: null,
      endDate: null,
    });
    fetchOutletsPaginated();
  };

  const handleOutletDetails = (outlet) => {
    setSelectedOutletDetails(outlet);
    setOpenModal(true);
  };

  const handleExportToCSV = async () => {
    try {
      setCSVLoading(true);
      const query = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "All") {
        query.outletStatus = statusFilter;
      }
      if (statusFilter === "All") {
        delete query.outletStatus;
      }

      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }

      if (dateRange.startDate && dateRange.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/outlet/bulk-approve-reject-outlet-template`,
        {
          selectedOutletIds: selectedOutletIds,
        },
        {
          params: query,
        }
      );

      if (response.status === 200) {
        const csvLink = response?.data?.data?.csvLink;
        const link = document.createElement("a");
        link.href = csvLink;
        link.download = "outlets.csv"; // Set file name if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      // console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download CSV"
      );
    } finally {
      setCSVLoading(false);
    }
  };

  const onCloseModal = () => {
    fetchOutletsPaginated();
    setOpenModal(false);
    setSelectedOutletDetails(null);
  };

  const handleBulkApprovedReject = async (url) => {
    try {
      fetchOutletsPaginated();
      openConfirmationModel({
        question: "Are you sure you want to import this pending Outlet CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                csvUrl: url,
              };
              const res = await BulkOutletApproval(payload);

              toast.success(
                `${res?.data?.successCount} rows updated in the Outlet Master and ${res?.data?.skippedCount} rows failed to update`
              );

              setErrorLog(res?.data?.skippedRows);

              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                  "Failed to import Outlets, try again"
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
          "Failed to import Outlets, try again"
      );
    }
  };

  const handleErrorLogDownload = async () => {
    try {
      // CSV header
      const csv = ["Lead Id,Error"];

      // Convert each entry in skippedRows to a CSV row
      errorLog.forEach(({ _id, error }) => {
        // Escape any commas or special characters by enclosing fields in quotes
        csv.push(`"${_id}","${error}"`);
      });

      // Join all rows into a single CSV string
      const csvString = csv.join("\n");

      // Create a blob and trigger the download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
      a.setAttribute("download", "error-log.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clear the skipped rows log (assuming you have a state or function to handle this)
      setErrorLog([]); // Adjust based on how you manage your skipped rows state
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to import Outlets, try again"
      );
    }
  };

  const allOutletsSelected = () => {
    return (
      outlets.length > 0 &&
      outlets.every((outlet) => selectedOutletIds.includes(outlet._id))
    );
  };

  // console.log(outlets);

  return (
    <div className="flex justify-start items-center flex-col gap-4 w-full">
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Lead Approvals</h1>
      </div>

      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="w-full flex justify-center items-center flex-col">
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Count: {totalItems}</Badge>
            <Badge color="warning">Filtered Count: {filteredCount}</Badge>
          </div>
          <div className="flex justify-center w-full items-center gap-4 flex-wrap">
            {/* filter 1 */}
            <div className="w-56">
              <div className="mb-2 block">
                <Label htmlFor="statusSelect" value="Select Status" />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                id="statusSelect"
                required
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>
            {/* filter 2 */}
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
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* filter 3 */}
            <div className="w-64">
              <div className="mb-2 block">
                <Label htmlFor="dateRangeSelect" value="Select Date Range" />
              </div>
              <Datepicker
                showShortcuts={true}
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>
          </div>
          <div className="flex justify-center w-full items-center gap-2 flex-wrap">
            <Button
              className="text-xs"
              size="sm"
              color="success"
              onClick={handleResetFilter}
            >
              <RiRefreshFill size={20} />
              Reset & Refresh
            </Button>
            <Button
              className="text-xs"
              color="blue"
              size="sm"
              onClick={handleExportToCSV}
              disabled={csvLoading}
            >
              <BiSolidFileExport size={20} />
              {csvLoading ? "Downloading..." : "CSV Download"}
            </Button>
            <FileUpload
              type="single-file"
              page="bulk-import"
              onSetFileUrl={(url) => {
                handleBulkApprovedReject(url);
              }}
              btnTitle="Bulk Approve/Reject"
            />

            {errorLog.length > 0 && (
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
          {selectedOutletIds.length > 0 && (
            <div className="flex justify-center w-full items-center gap-2 flex-wrap">
              <div className="flex justify-center items-center gap-2 text-sm bg-yellow-400 py-1 px-2 rounded-md text-white">
                <span>{selectedOutletIds.length} Outlets Selected</span>
                <span
                  className="text-xs cursor-pointer"
                  onClick={() => {
                    setSelectedOutletIds([]);
                  }}
                >
                  <FaTimesCircle color="red" size={15} />
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* paginated table */}
      <div className="flex justify-end items-center w-full px-4 ">
        <div className="flex overflow-x-auto sm:justify-center">
          {!outletsLoading && filteredCount > 10 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons
            />
          )}
        </div>
      </div>

      {/* table  */}
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <div className="overflow-x-auto w-full">
          <Table striped>
            <Table.Head className="text-center">
              <Table.HeadCell className="whitespace-nowrap">
                <Checkbox
                  checked={allOutletsSelected()}
                  onChange={() => {
                    if (allOutletsSelected()) {
                      setSelectedOutletIds([
                        ...selectedOutletIds.filter(
                          (id) =>
                            !outlets.map((outlet) => outlet._id).includes(id)
                        ),
                      ]);
                    } else {
                      let newSelectedOutlets = [...selectedOutletIds];
                      outlets.forEach((outlet) => {
                        if (!newSelectedOutlets.includes(outlet._id)) {
                          newSelectedOutlets.push(outlet._id);
                        }
                      });

                      setSelectedOutletIds([...newSelectedOutlets]);
                    }
                  }}
                />
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Lead ID
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Outlet Name
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Zone
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Region
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                State
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Owner Name
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Market Centre
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                DB Code
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                DB Name
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                View
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Status
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap">
                Remarks
              </Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {outletsLoading || regionsLoading ? (
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
                  {outlets?.map((outlet, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <Checkbox
                          checked={selectedOutletIds.includes(outlet._id)}
                          onChange={() => {
                            if (selectedOutletIds.includes(outlet._id)) {
                              setSelectedOutletIds(
                                selectedOutletIds.filter(
                                  (id) => id !== outlet._id
                                )
                              );
                            } else {
                              setSelectedOutletIds([
                                ...selectedOutletIds,
                                outlet._id,
                              ]);
                            }
                          }}
                        />
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.leadId}
                      </Table.Cell>
                      <Table.Cell
                        className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 cursor-pointer"
                        onClick={() => handleOutletDetails(outlet)}
                      >
                        <div className="flex gap-2 justify-center items-center">
                          {outlet?.outletName}{" "}
                          <span>
                            <FiExternalLink color="#3795BD" />
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.zone?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.region?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.state?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.ownerName}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.marketCenter}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.distributor?.dbCode}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {outlet?.distributor?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex justify-center items-center">
                          <FaRegEye
                            size={20}
                            className="cursor-pointer"
                            onClick={() => handleOutletDetails(outlet)}
                          />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium">
                        <StatusIndicator2 status={outlet?.outletStatus} />
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium">
                        <p>{outlet?.remarks}</p>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {outlets?.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="16"
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

      {openModal && (
        <OutLetDetails
          openModal={openModal}
          onCloseModal={onCloseModal}
          selectedOutletDetails={selectedOutletDetails}
          PageType="Lead"
        />
      )}
    </div>
  );
};

export default LeadRequestList;
