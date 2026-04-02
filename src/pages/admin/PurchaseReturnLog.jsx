import toast from "react-hot-toast";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Badge,
  Button,
  Card,
  Label,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
  Modal,
} from "flowbite-react";

import { RiRefreshFill } from "react-icons/ri";
import UniqueCode from "../../assets/common/UniqueCode";
import Datepicker from "react-tailwindcss-datepicker";
import { useEffect, useState } from "react";
import moment from "moment";
import { getPurchaseReturnList, updatePurchaseReturn } from "../../api/prchaseApi";
import { FaRegCopy } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { fetchDistributors } from "../../redux/distributorListSlice";
import SearchableSelect from "../../components/SearchableSelect";
import { getPagePermission } from "../../utils/permissionHelper";


const PurchaseReturnLog = () => {
  const dispatch = useDispatch();
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("default");
  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [purchaseReturnsLoading, setPurchaseReturnsLoading] = useState(false);



  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );
  const activeDistributors = distributors.filter(
    (distributor) => distributor.status === true
  );

  // CREATED AT DATE FILTER
  const [createdAtRange, setCreatedAtRange] = useState({
    startDate: null,
    endDate: null,
  });

  // MODAL HANDLER
  const [openReturnDataModal, setOpenReturnDataModal] = useState(false);
  const [currentReturnData, setCurrentReturnData] = useState(null);
  const [currentReturnId, setCurrentReturnId] = useState("");

  const [returnErrors, setReturnErrors] = useState({});
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [currentErrorLogs, setCurrentErrorLogs] = useState([]);
  const [approvingReturns, setApprovingReturns] = useState(new Set());
    const permissionState = useSelector((state) => state.permission);
const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
  if (!permissionState?.data?.data) return;

  const permission = getPagePermission(
    permissionState,
    "purchase-return-log"
  );

  setPagePermission(permission);
}, [permissionState]);


  const handleCreatedAtRangeChange = (range) => {
    if (!range) {
      setCreatedAtRange({ startDate: null, endDate: null });
      return;
    }
    setCreatedAtRange({
      startDate: range.startDate ? range.startDate.split("T")[0] : null,
      endDate: range.endDate ? range.endDate.split("T")[0] : null,
    });
  };

  const onPageChange = (page) => setCurrentPage(page);

  const handleViewReturnData = (returnId, returnData) => {
    setCurrentReturnId(returnId);
    setCurrentReturnData(returnData);
    setOpenReturnDataModal(true);
  };

  let fetchPurchaseReturnsLogPaginatedWithOutDebounce = async () => {
    try {
      setPurchaseReturnsLoading(true);

      const query = {
        page: currentPage,
        limit: 20,
      };

      if (selectedStatus !== "default") query.status = selectedStatus;
      if (searchTerm) query.search = searchTerm;
      if (selectedDistributor !== "default") query.distributorId = selectedDistributor;

      // CREATED AT FILTER
      if (createdAtRange.startDate && createdAtRange.endDate) {
        query.createdFromDate = createdAtRange.startDate;
        query.createdToDate = createdAtRange.endDate;
      }

      const response = await getPurchaseReturnList(query);

      setPurchaseReturns(response?.data?.data || []);
      setTotalPages(response?.data?.pagination?.totalPages || 0);
      setFilteredCount(response?.data?.pagination?.filteredCount || 0);
      setTotalItems(response?.data?.pagination?.totalCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch purchase returns"
      );
    } finally {
      setPurchaseReturnsLoading(false);
    }
  };

  let fetchPurchaseReturnsLogPaginated = useDebounce(
    fetchPurchaseReturnsLogPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setSelectedStatus("default");
    setSearchTerm("");
    setSelectedDistributor("default");

    setCreatedAtRange({ startDate: null, endDate: null });

    fetchPurchaseReturnsLogPaginated();
  };

  useEffect(() => {
    fetchPurchaseReturnsLogPaginated();
  }, [currentPage, selectedStatus, searchTerm, selectedDistributor, createdAtRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchTerm, selectedDistributor, createdAtRange]);

  useEffect(() => {
    dispatch(fetchDistributors());
  }, [dispatch]);

  const handleCopyReturnData = () => {
    if (!currentReturnData) return;
    navigator.clipboard.writeText(JSON.stringify(currentReturnData, null, 2));
    toast.success("Return data copied");
  };

  const handleApproveReturn = async (returnId) => {
    setApprovingReturns(prev => new Set(prev).add(returnId));
    try {
      const response = await updatePurchaseReturn(returnId, { status: "Return Approved" });
      console.log(response?.data,'response');
      if (response.data.errorLogs && response.data.errorLogs.length > 0) {
        toast.error(response.data.message);
        setReturnErrors(prev => ({ ...prev, [returnId]: response.data.errorLogs }));
      } else {
        toast.success(response?.data?.message || "Return approved successfully");
      }
      // Refresh the data
      fetchPurchaseReturnsLogPaginated();
    } catch (error) {
      console.log(error,'error');
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to approve return"
      );
    } finally {
      setApprovingReturns(prev => {
        const newSet = new Set(prev);
        newSet.delete(returnId);
        return newSet;
      });
    }
  };

  const handleViewErrors = (returnId) => {
    setCurrentErrorLogs(returnErrors[returnId] || []);
    setOpenErrorModal(true);
  };

  return (
    <>
    
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* Header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <h1 className="text-2xl font-bold">Purchase Return Log</h1>
        </div>

        {/* Filters */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <Card className="w-full flex flex-col items-center">
            {/* counts */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">Total Count : {totalItems}</Badge>
              <Badge color="warning">Filtered Count : {filteredCount}</Badge>
            </div>

            {/* FILTERS UI */}
            <div className="flex justify-center w-full items-end gap-2 flex-wrap">
              {/* Search */}
              <div className="w-40">
                <div className="block">
                  <Label value="Search" />
                </div>
                <TextInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search"
                />
              </div>

              {/* Status */}
              <div className="w-56">
                <div className="block">
                  <Label value="Select Status" />
                </div>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="default">All</option>
                  <option value="Return Requested">Return Requested</option>
                  <option value="Return Approved">Return Approved</option>
                </Select>
              </div>

              {/* Distributor */}
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
                  descKey="dbCode"
                  valueKey="_id"
                  defaultValue="default"
                />
              </div>

              {/* CREATED AT DATE */}
              <div className="w-64">
                <div className="block">
                  <Label value="CreatedAt Date Range" />
                </div>
                <Datepicker
                  showShortcuts={true}
                  value={createdAtRange}
                  onChange={handleCreatedAtRangeChange}
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
            </div>
          </Card>
        </div>

        {/* Pagination */}
        <div className="flex justify-end w-full px-4">
          {filteredCount > 10 && !purchaseReturnsLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons
            />
          )}
        </div>

        {/* TABLE */}
        <div className="w-full p-4">
          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Return NO</Table.HeadCell>
                <Table.HeadCell>Invoice NO</Table.HeadCell>
                <Table.HeadCell>DB Code</Table.HeadCell>
                {/* <Table.HeadCell>Total Quantity</Table.HeadCell> */}
                <Table.HeadCell>Total Amount</Table.HeadCell>
                <Table.HeadCell>View Return Data</Table.HeadCell>
                {/* <Table.HeadCell>Return A Date</Table.HeadCell> */}
                <Table.HeadCell>Action</Table.HeadCell>
                <Table.HeadCell>Created At </Table.HeadCell>
                <Table.HeadCell>Updated At</Table.HeadCell>
              </Table.Head>

              <Table.Body>
                {purchaseReturnsLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan="9" className="text-center">
                      <Spinner size="xl" />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  <>
                    {purchaseReturns?.map((returnItem) => (
                      <Table.Row key={returnItem?._id}>
                        <Table.Cell>
                          <UniqueCode
                            text={returnItem?.code || returnItem?._id}
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <UniqueCode text={returnItem?.invoice?.invoiceNo} />
                        </Table.Cell>

                        <Table.Cell>
                          {returnItem?.distributor?.dbCode || "N/A"}
                        </Table.Cell>

                        {/* <Table.Cell>
                          {returnItem?.lineItems?.reduce(
                            (total, item) =>
                              total + (item.qty || item.quantity || 0),
                            0
                          )}
                        </Table.Cell> */}

                        <Table.Cell>
                          {returnItem?.totalInvoiceAmount}
                        </Table.Cell>

                        <Table.Cell>
                          <Button
                            size="xs"
                            onClick={() =>
                              handleViewReturnData(
                                returnItem?.code || returnItem?._id,
                                returnItem
                              )
                            }
                          >
                            View Data
                          </Button>
                        </Table.Cell>

                        {/* <Table.Cell>
                          {returnItem?.returnDate
                            ? moment(returnItem.returnDate)
                                .tz("Asia/Kolkata")
                                .format("DD-MM-YYYY hh:mm A")
                            : "N/A"}
                        </Table.Cell> */}
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            {returnItem?.status === "Return Requested" && pagePermission?.update ? (
                              <Button
                                size="xs"
                                onClick={() => handleApproveReturn(returnItem?._id)}
                                disabled={approvingReturns.has(returnItem?._id)}
                              >
                                {approvingReturns.has(returnItem?._id) ? (
                                  <>
                                    <Spinner size="sm" className="mr-2" />
                                    Approving...
                                  </>
                                ) : (
                                  "Approve Return"
                                )}
                              </Button>
                            ) : (
                              returnItem?.status
                            )}
                            {returnErrors[returnItem._id] && returnErrors[returnItem._id].length > 0 && (
                              <FiInfo
                                size={16}
                                className="cursor-pointer text-red-500"
                                onClick={() => handleViewErrors(returnItem._id)}
                              />
                            )}
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          {moment(returnItem?.createdAt)
                            .tz("Asia/Kolkata")
                            .format("DD-MM-YYYY hh:mm A")}
                        </Table.Cell>

                        <Table.Cell>
                          {moment(returnItem?.updatedAt)
                            .tz("Asia/Kolkata")
                            .format("DD-MM-YYYY hh:mm A")}
                        </Table.Cell>
                      </Table.Row>
                    ))}

                    {purchaseReturns?.length === 0 && (
                      <Table.Row>
                        <Table.Cell colSpan="9" className="text-center">
                          No Data Found !
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

      {/* MODAL */}
      <Modal
        show={openReturnDataModal}
        onClose={() => setOpenReturnDataModal(false)}
        size="2xl"
      >
        <Modal.Header>
          <h1>Return Data for ID: {currentReturnId}</h1>
          <FaRegCopy
            size={25}
            onClick={handleCopyReturnData}
            className="cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body className="text-white">
          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Product Code</Table.HeadCell>
                <Table.HeadCell>Product Name</Table.HeadCell>
                <Table.HeadCell>UOM</Table.HeadCell>
                <Table.HeadCell>Return Qty</Table.HeadCell>
              </Table.Head>

              <Table.Body>
                {currentReturnData?.lineItems?.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{item?.product?.product_code}</Table.Cell>
                    <Table.Cell>{item?.product?.name}</Table.Cell>
                    <Table.Cell>{item?.product?.uom}</Table.Cell>
                    <Table.Cell>{item?.qty}</Table.Cell>
                  </Table.Row>
                ))}

                {(!currentReturnData?.lineItems || currentReturnData?.lineItems?.length === 0) && (
                  <Table.Row>
                    <Table.Cell colSpan="4" className="text-center">
                      No line items found
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
      </Modal>

      {/* ERROR MODAL */}
      <Modal
        show={openErrorModal}
        onClose={() => setOpenErrorModal(false)}
        size="2xl"
      >
        <Modal.Header>
          <h1>Approval Errors</h1>
        </Modal.Header>
        <Modal.Body className="text-white">
          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Product</Table.HeadCell>
                <Table.HeadCell>Error</Table.HeadCell>
                <Table.HeadCell>Line Item Index</Table.HeadCell>
              </Table.Head>

              <Table.Body>
                {currentErrorLogs?.map((error, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{error?.product}</Table.Cell>
                    <Table.Cell>{error?.error}</Table.Cell>
                    <Table.Cell>{error?.lineItemIndex}</Table.Cell>
                  </Table.Row>
                ))}

                {(!currentErrorLogs || currentErrorLogs?.length === 0) && (
                  <Table.Row>
                    <Table.Cell colSpan="3" className="text-center">
                      No errors found
                    </Table.Cell>
                  </Table.Row>
        )}
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PurchaseReturnLog;
