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
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiExternalLink, FiEye } from "react-icons/fi";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Datepicker from "react-tailwindcss-datepicker";
import { getPurchaseOrderList } from "../../../api/api";
import UniqueCode from "../../../assets/common/UniqueCode";
import { useDebounce } from "../../../hooks/useDebounce";

import { fetchDistributors } from "../../../redux/distributorListSlice";
import { FaRegCopy } from "react-icons/fa";
import SearchableSelect from "../../../components/SearchableSelect";
import { IoSyncCircleSharp } from "react-icons/io5";
import { ConfirmationModelContext } from "../../../context/ContextProvider";
import { fetchQuotationStatus } from "../../../api/prchaseApi";
import { getPagePermission } from "../../../utils/permissionHelper";


export const ViewPurchaseOrder = () => {
  const dispatch = useDispatch();
  const [pageLoading, setPageLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [approvedStatus, setApprovedStatus] = useState("All");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");

  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );
  const activeDistributors = distributors.filter(
    (distributor) => distributor.status === true
  );

  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [openOrderDataModal, setOpenOrderDataModal] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [openStatusDataModal, setOpenStatusDataModal] = useState(false);
  const [currentStatusData, setCurrentStatusData] = useState(null);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);


  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role;

  const onPageChange = (page) => setCurrentPage(page);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "purchase-order-list"
    );

    setPagePermission(permission);
  }, [permissionState]);


  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  let fetchPurchaseOrderPaginatedWithOutDebounce = async () => {
    try {
      setPageLoading(true);
      const query = {
        page: currentPage,
        limit: 10,
      };

      if (dateRange?.startDate && dateRange?.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      if (approvedStatus !== "All") {
        query.approvedStatus = approvedStatus;
      }

      if (selectedDistributor !== "default") {
        query.distributorId = selectedDistributor;
      }

      if (purchaseOrderNo.trim() !== "") {
        query.purchaseOrderNo = purchaseOrderNo.trim();
      }

      const response = await getPurchaseOrderList(query);

      setPurchaseOrderList(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch suppliers"
      );
    } finally {
      setPageLoading(false);
    }
  };

  let fetchPurchaseOrderPaginated = useDebounce(
    fetchPurchaseOrderPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setCurrentPage(1);
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setPurchaseOrderNo("");
    setApprovedStatus("All");
    setSelectedDistributor("default");
    fetchPurchaseOrderPaginated();
    dispatch(fetchDistributors());
  };

  useEffect(() => {
    fetchPurchaseOrderPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    dateRange,
    approvedStatus,
    selectedDistributor,
    purchaseOrderNo,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, approvedStatus, selectedDistributor, purchaseOrderNo]);

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  const handleViewOrderData = (orderData) => {
    setCurrentOrderData(orderData);
    setOpenOrderDataModal(true);
  };

  const handleCopyOrderData = () => {
    if (!currentOrderData) return;

    const textToCopy = JSON.stringify(currentOrderData, null, 2);

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Quotation Data copied to clipboard.");
      })
      .catch((err) => {
        console.error("Failed to copy quotation data: ", err);
        toast.error("Failed to copy Quotation Data JSON.");
      });
  };

  const handleViewStatusData = (statusData) => {
    setCurrentStatusData(statusData);
    setOpenStatusDataModal(true);
  };

  const handleCopyStatusData = () => {
    if (!currentStatusData) return;
    const textToCopy = JSON.stringify(currentStatusData, null, 2);
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Quotation Status Data copied to clipboard.");
      })
      .catch((err) => {
        console.error("Failed to copy status data: ", err);
        toast.error("Failed to copy Quotation Status Data JSON.");
      });
  };

  const handleFetchStatus = async () => {
    openConfirmationModel({
      question: "Are you sure you want to Fetch Quotation Status?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFetchingStatus(true);
            const payload = {};
            const res = await fetchQuotationStatus(payload);
            toast.success(res?.data?.message);
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to fetch quotation status"
            );
          } finally {
            setFetchingStatus(false);
            fetchPurchaseOrderPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  return (
    <div className="flex justify-start items-center flex-col w-full">
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Purchase Order Log</h1>
      </div>

      <div className="flex justify-start items-center flex-col gap-2 w-full p-1 pt-6">
        <Card className="w-full flex justify-center items-center flex-col">
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="indigo">Total Items : {totalItems}</Badge>
            <Badge color="indigo">Filtered Items : {filteredCount}</Badge>
          </div>
          <div className="flex justify-center w-full items-end gap-2 flex-wrap">
            <div className="w-40">
              <div className="block">
                <Label value="Search" />
              </div>
              <TextInput
                value={purchaseOrderNo}
                onChange={(e) => setPurchaseOrderNo(e.target.value)}
                required
                placeholder="Search"
              />
            </div>
            <div className="w-56">
              <div className="block">
                <Label>
                  Approval Status <br />
                  (Quotation Send Status)
                </Label>
              </div>
              <Select
                value={approvedStatus}
                onChange={(e) => setApprovedStatus(e.target.value)}
                required
              >
                <option value="All">All</option>
                <option value="Approved">Approved (Quotation Sent)</option>
                <option value="Not Approved">
                  Not Approved (Quotation Not Sent)
                </option>
                <option value="Rejected">
                  Rejected (Quotation Sent Approval Rejected)
                </option>
              </Select>
            </div>

            <div className="w-56">
              <Label value="Select Distributor" />
              <SearchableSelect
                id="distributor-select"
                className="w-full"
                options={activeDistributors}
                value={selectedDistributor}
                onChange={(e) => setSelectedDistributor(e.target.value)}
                placeholder="Select Distributor"
                disabled={distributorsLoading}
                displayKey="name"
                descKey="desc"
                valueKey="_id"
                defaultValue="default"
              />
            </div>

            <div className="w-64">
              <div className="block">
                <Label value="Select Date Range" />
              </div>
              <Datepicker
                inputClassName="relative py-1.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500"
                showShortcuts={true}
                value={dateRange}
                onChange={handleDateRangeChange}
                size="sm"
              />
            </div>
            <div>
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
            <div>
              {role === "admin" ? (
                <Button
                  className="text-xs"
                  size="sm"
                  color="blue"
                  disabled={fetchingStatus}
                  onClick={() => {
                    handleFetchStatus();
                  }}
                >
                  <span className="flex justify-center items-center gap-2">
                    <IoSyncCircleSharp size={20} />
                    {fetchingStatus ? "Fetching..." : "Fetch Quotation status"}
                  </span>
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      </div>

      {/* pagination */}
      <div className="flex justify-end items-center w-full px-4 ">
        <div className="flex overflow-x-auto sm:justify-center">
          {!pageLoading && totalPages > 1 && (
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
      <div className="flex justify-start items-center flex-col gap-2 w-full p-4">
        {/* old table normal table  */}
        {/* <div className="overflow-x-auto w-full">
          <Table striped className="rounded-none">
            <Table.Head className="text-center">
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100"></Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Purchase Order No
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                View
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Distributor Code
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Distributor Name
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Supplier Name
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Created
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Expected Delivery Date
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Net Amount
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Total <br /> Line Items
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Order Status
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Quotation Response
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Quotation Status
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                SAP <br /> Quotation No
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Sap <br /> Sales Order No
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Quotation <br />
                Status Data
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {pageLoading ? (
                <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell
                    colSpan={"100%"}
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
                  {purchaseOrderList?.map((po) => (
                    <Table.Row
                      key={po._id}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="text-center"></Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <UniqueCode
                            text={po?.purchaseOrderNo}
                            codeName="Purchase Order No"
                          />
                          <Link
                            to={`/${userInfo?.role}/purchase-order-detail/${po?._id}`}
                            className="cursor-pointer"
                          >
                            <FiExternalLink color="#3795BD" />
                          </Link>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <Link
                          to={`/${userInfo?.role}/purchase-order-detail/${po?._id}`}
                          className="flex items-center justify-center gap-1 text-blue-500 hover:text-blue
                            -700 text-xs font-bold cursor-pointer"
                        >
                          <Button size="xs" className="flex items-center gap-1">
                            View
                          </Button>
                        </Link>
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <UniqueCode
                          text={po?.distributorId?.dbCode}
                          codeName="Distributor Code"
                        />
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.distributorId?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.supplierId?.supplierName}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {moment(po?.createdAt).tz("Asia/Kolkata").format("LLL")}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.expectedDeliveryDate
                          ? moment(po?.expectedDeliveryDate)
                              .tz("Asia/Kolkata")
                              .format("LLL")
                          : ""}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.netAmount?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.lineItems?.length > 0 && (
                          <span
                            className="flex items-center justify-center gap-2 text-green-500 font-bold 
                             cursor-pointer
                            "
                          >
                            {po.lineItems.length} Items
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.status}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <span className="flex justify-center items-center gap-2">
                          {po?.quotationResponse && (
                            <Button
                              size="xs"
                              onClick={() =>
                                handleViewOrderData(po?.quotationResponse)
                              }
                            >
                              <span className="flex items-center gap-1">
                                <FiEye size={16} />
                                Show
                              </span>
                            </Button>
                          )}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.sapStatus}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.sapStatusData ? (
                          <UniqueCode
                            text={po?.sapStatusData?.Vbeln}
                            codeName={"SAP Quotation No"}
                          />
                        ) : (
                          ""
                        )}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {po?.sapStatusData ? (
                          <UniqueCode
                            text={po?.sapStatusData?.Vbelnso}
                            codeName={"SAP Sales Order No"}
                          />
                        ) : (
                          ""
                        )}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <span className="flex justify-center items-center gap-2">
                          {po?.sapStatusData && (
                            <Button
                              size="xs"
                              onClick={() =>
                                handleViewStatusData(po?.sapStatusData)
                              }
                            >
                              <span className="flex items-center gap-1">
                                <FiEye size={16} />
                                Show
                              </span>
                            </Button>
                          )}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {purchaseOrderList?.length === 0 && (
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
        </div> */}
        {/* new table with sticky columns and horizontal scroll */}
        <div className="overflow-x-auto w-full">
          <Table
            striped
            className="rounded-none min-w-[1800px] border border-gray-200 dark:border-gray-700"
          >
            <Table.Head className="text-center sticky top-0 z-30">
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100 sticky left-0 z-40 w-[180px]">
                Purchase Order No
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100 sticky left-[180px] z-40 w-[120px]">
                View
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100 sticky left-[300px] z-40 w-[160px]">
                Distributor Code
              </Table.HeadCell>

              {/* Scrollable Columns */}
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Distributor Name
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Created
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Net Amount
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Order Status
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Quotation Response
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Quotation Status
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                SAP Quotation No
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                SAP Sales Order No
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Quotation Status Data
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Supplier Name
              </Table.HeadCell>
              <Table.HeadCell className="bg-lavender-900 text-oWhite-100">
                Total Line Items
              </Table.HeadCell>
            </Table.Head>

            <Table.Body className="divide-y">
              {purchaseOrderList?.map((po) => (
                <Table.Row
                  key={po._id}
                  className="text-center bg-white dark:bg-gray-800 dark:border-gray-700"
                >
                  {/* Sticky Columns */}
                  <Table.Cell className="sticky left-0 w-[180px] bg-white dark:bg-gray-800 z-20 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <UniqueCode
                        text={po?.purchaseOrderNo}
                        codeName="Purchase Order No"
                      />
                      <Link
                        to={`/${userInfo?.role}/purchase-order-detail/${po?._id}`}
                        className="cursor-pointer"
                      >
                        <FiExternalLink color="#3795BD" />
                      </Link>
                    </div>
                  </Table.Cell>

                  <Table.Cell className="sticky left-[180px] w-[120px] bg-white dark:bg-gray-800 z-20">
                    <Link
                      to={`/${userInfo?.role}/purchase-order-detail/${po?._id}`}
                    >
                      <Button size="xs">View</Button>
                    </Link>
                  </Table.Cell>

                  <Table.Cell className="sticky left-[300px] w-[160px] bg-white dark:bg-gray-800 z-20">
                    <UniqueCode
                      text={po?.distributorId?.dbCode}
                      codeName="Distributor Code"
                    />
                  </Table.Cell>

                  {/* Scrollable Rest */}
                  <Table.Cell>{po?.distributorId?.name}</Table.Cell>
                  <Table.Cell>
                    {moment(po?.createdAt).tz("Asia/Kolkata").format("LLL")}
                  </Table.Cell>
                  <Table.Cell>
                    {po?.netAmount?.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </Table.Cell>
                  <Table.Cell>{po?.status}</Table.Cell>
                  <Table.Cell>
                    {po?.quotationResponse && (
                      <Button
                        size="xs"
                        onClick={() =>
                          handleViewOrderData(po?.quotationResponse)
                        }
                      >
                        <FiEye size={16} /> Show
                      </Button>
                    )}
                  </Table.Cell>
                  <Table.Cell>{po?.sapStatus}</Table.Cell>
                  <Table.Cell>
                    {po?.sapStatusData?.Vbeln && (
                      <UniqueCode
                        text={po?.sapStatusData?.Vbeln}
                        codeName="SAP Quotation No"
                      />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {po?.sapStatusData?.Vbelnso && (
                      <UniqueCode
                        text={po?.sapStatusData?.Vbelnso}
                        codeName="SAP Sales Order No"
                      />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {po?.sapStatusData && (
                      <Button
                        size="xs"
                        onClick={() => handleViewStatusData(po?.sapStatusData)}
                      >
                        <FiEye size={16} /> Show
                      </Button>
                    )}
                  </Table.Cell>
                  <Table.Cell>{po?.supplierId?.supplierName}</Table.Cell>
                  <Table.Cell>
                    {po?.lineItems?.length > 0 && (
                      <span className="text-green-500 font-bold">
                        {po.lineItems.length} Items
                      </span>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
      {/* Order Data Modal */}
      <Modal
        show={openOrderDataModal}
        onClose={() => setOpenOrderDataModal(false)}
        size="2xl"
      >
        <Modal.Header>
          <div className="flex justify-between items-center gap-6">
            Quotation Response Data
            <span
              onClick={() => {
                handleCopyOrderData();
              }}
              className="text-black dark:text-white cursor-pointer"
            >
              <FaRegCopy size={25} />
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4 dark:text-gray-200 text-xs">
            {currentOrderData && Object.keys(currentOrderData).length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {Object.entries(currentOrderData).map(([key, value]) => (
                  <li key={key}>
                    <strong className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </strong>{" "}
                    {typeof value === "object" && value !== null ? (
                      <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded-md font-mono dark:bg-gray-700 dark:text-gray-200">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">
                        {String(value)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No additional order data available.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {/* Status Data Modal */}
      <Modal
        show={openStatusDataModal}
        onClose={() => setOpenStatusDataModal(false)}
        size="2xl"
        className="overflow-y-auto"
      >
        <Modal.Header>
          <div className="flex justify-between items-center gap-6">
            Quotation Status Data
            <span
              onClick={handleCopyStatusData}
              className="text-black dark:text-white cursor-pointer"
            >
              <FaRegCopy size={25} />
            </span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4 dark:text-gray-200 text-xs">
            {currentStatusData && Object.keys(currentStatusData).length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {Object.entries(currentStatusData).map(([key, value]) => (
                  <li key={key}>
                    <strong className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </strong>{" "}
                    {typeof value === "object" && value !== null ? (
                      <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-md font-mono dark:bg-gray-700 dark:text-gray-200">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">
                        {String(value)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No additional status data available.</p>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ViewPurchaseOrder;
