import toast from "react-hot-toast";
import { useDebounce } from "../../hooks/useDebounce";
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
  TextInput,
  Modal,
} from "flowbite-react";

import { RiRefreshFill } from "react-icons/ri";
import UniqueCode from "../../assets/common/UniqueCode";
import Datepicker from "react-tailwindcss-datepicker";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  getPurchaseOrderEntryLog,
  syncGRNDate,
  findAndRemoveInvoice,
  deleteGRNLog,
  fetchSAPGRNData,
} from "../../api/prchaseApi";
import { FaRegCopy, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../utils/permissionHelper";


const PuchaseInvoiceLog = () => {
  const [purchaseOrders, setpurchaseOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("default");
  const [purchaseOrdersLoading, setpurchaseOrdersLoading] = useState(false);
  const [deletingOrders, setDeletingOrders] = useState(new Set());
  const [viewDbCode, setViewDbCode] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [currentOrderToDelete, setCurrentOrderToDelete] = useState(null);
  const [syncGRNForDelete, setSyncGRNForDelete] = useState(false);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);


  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "purchase-invoice-log"
    );

    setPagePermission(permission);
  }, [permissionState]);


  // ORIGINAL PO DATE FILTER
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // NEW: CREATED AT DATE FILTER
  const [createdAtRange, setCreatedAtRange] = useState({
    startDate: null,
    endDate: null,
  });

  // MODAL HANDLER
  const [openOrderDataModal, setOpenOrderDataModal] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState("");

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // FIX TIMEZONE SHIFT: strip "T00:00:00.000Z"
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

  const handleViewOrderData = (orderId, orderData, dbcode) => {
    setCurrentOrderId(orderId);
    setCurrentOrderData(orderData);
    console.log(orderId, "dbCode");
    setViewDbCode(dbcode);
    setOpenOrderDataModal(true);
  };

  let fetchpurchaseOrdersLogPaginatedWithOutDebounce = async () => {
    try {
      setpurchaseOrdersLoading(true);

      const query = {
        page: currentPage,
        limit: 10,
      };

      if (selectedOrderStatus !== "default") query.status = selectedOrderStatus;
      if (searchTerm) query.search = searchTerm;

      // ORIGINAL PO DATE
      if (dateRange.startDate && dateRange.endDate) {
        query.fromDate = dateRange.startDate;
        query.toDate = dateRange.endDate;
      }

      // NEW: CREATED AT FILTER
      if (createdAtRange.startDate && createdAtRange.endDate) {
        query.createdFromDate = createdAtRange.startDate;
        query.createdToDate = createdAtRange.endDate;
      }

      const response = await getPurchaseOrderEntryLog(query);

      setpurchaseOrders(response?.data?.data || []);
      setTotalPages(response?.data?.pagination?.totalPages || 0);
      setFilteredCount(response?.data?.pagination?.filteredCount || 0);
      setTotalItems(response?.data?.pagination?.totalActiveCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch purchase orders"
      );
    } finally {
      setpurchaseOrdersLoading(false);
    }
  };

  let fetchpurchaseOrdersLogPaginated = useDebounce(
    fetchpurchaseOrdersLogPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setSelectedOrderStatus("default");
    setSearchTerm("");

    setDateRange({ startDate: null, endDate: null });
    setCreatedAtRange({ startDate: null, endDate: null });

    fetchpurchaseOrdersLogPaginated();
  };

  useEffect(() => {
    fetchpurchaseOrdersLogPaginated();
  }, [currentPage, selectedOrderStatus, searchTerm, dateRange, createdAtRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedOrderStatus, searchTerm, dateRange, createdAtRange]);

  const handleCopyOrderData = () => {
    if (!currentOrderData) return;
    navigator.clipboard.writeText(JSON.stringify(currentOrderData, null, 2));
    toast.success("Order data copied");
  };

  const handleSyncGRN = async () => {
    try {
      const response = await syncGRNDate();
      toast.success(response?.data?.message || "GRN Date Synced");
      fetchpurchaseOrdersLogPaginated();
    } catch (e) {
      toast.error("Failed to sync GRN");
    }
  };

  const handleDelete = (order) => {
    setCurrentOrderToDelete(order);
    setSyncGRNForDelete(false);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setOpenDeleteModal(false);
    const order = currentOrderToDelete;
    setDeletingOrders((prev) => new Set(prev).add(order._id));

    try {
      await findAndRemoveInvoice({
        distributorId: order?.invoiceId?.distributorId?._id,
        invoiceNo: order?.Grn_Id,
      });
      await deleteGRNLog(order?._id);
      toast.success("Invoice deleted successfully");
      setSearchTerm("");
      if (syncGRNForDelete) {
        FetchSapGrnData(order);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete invoice completely");
    } finally {
      setDeletingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(order._id);
        return newSet;
      });
      fetchpurchaseOrdersLogPaginated();
    }
  };

  const FetchSapGrnData = async (order) => {
    try {
      const payload = {
        startDate: moment().subtract(120, "days").format("DD-MM-YYYY"),
        endDate: moment().format("DD-MM-YYYY"),
        neededDbCodes: order?.invoiceId?.distributorId?.dbCode,
      };

      await fetchSAPGRNData(payload);

      toast.success(
        `GRN data synced for ${order?.invoiceId?.distributorId?.name} successfully`
      );
    } catch (error) {
      console.error("SAP GRN sync failed:", error);
      toast.error("GRN sync failed (invoice already deleted)");
    }
  };

  return (
    <>

      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* Header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <h1 className="text-2xl font-bold">Purchase Invoice Log</h1>
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
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
                {/* Status */}
                <div className="w-40">
                  <Label value="Select Status" />
                  <Select
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                  >
                    <option value="default">All</option>
                    <option value="Import_Success">Successfully Imported</option>
                    <option value="Import_Failed">Import Failed</option>
                    <option value="Issue_Resolved">Issue Resolved</option>
                  </Select>
                </div>

                {/* Search */}
                <div className="w-44">
                  <Label value="Search" />
                  <TextInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search"
                  />
                </div>

                {/* ORIGINAL PO DATE */}
                <div className="w-64">
                  <Label value="Original PO Date Range" />
                  <Datepicker
                    showShortcuts={true}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                  />
                </div>

                {/* CREATED AT DATE — NEW */}
                <div className="w-64">
                  <Label value="CreatedAt Date Range" />
                  <Datepicker
                    showShortcuts={true}
                    value={createdAtRange}
                    onChange={handleCreatedAtRangeChange}
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2 mt-3">
                <Button color="success" onClick={handleResetFilter}>
                  <RiRefreshFill /> Reset & Refresh
                </Button>
                {pagePermission?.update && (
                  <button
                    className="bg-indigo-700 text-white px-4 py-2 rounded-md"
                    onClick={handleSyncGRN}
                  >
                    Sync GRN Date
                  </button>)}
              </div>
            </Card>
          </div>

          {/* Pagination */}
          <div className="flex justify-end w-full px-4">
            {filteredCount > 10 && !purchaseOrdersLoading && (
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
                  <Table.HeadCell>Invoice NO</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>View PO Data</Table.HeadCell>
                  {/* <Table.HeadCell>Error Log</Table.HeadCell> */}
                  <Table.HeadCell>Original PO Date</Table.HeadCell>
                  <Table.HeadCell>Created At (DMS)</Table.HeadCell>
                  <Table.HeadCell>Updated At</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>

                <Table.Body>
                  {purchaseOrdersLoading ? (
                    <Table.Row>
                      <Table.Cell colSpan="8" className="text-center">
                        <Spinner size="xl" />
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    <>
                      {purchaseOrders?.map((order) => (
                        <Table.Row key={order?._id}>
                          <Table.Cell>
                            <UniqueCode
                              text={order?.Grn_Id}
                              codeName={"Purchase Log"}
                            />
                          </Table.Cell>

                          <Table.Cell>
                            {order?.GrnStatus === "Import_Success"
                              ? "Successfully Imported"
                              : order?.GrnStatus === "Import_Failed"
                                ? "Import Failed"
                                : order?.GrnStatus === "Issue_Resolved"
                                  ? "Issue Resolved"
                                  : null}
                          </Table.Cell>

                          <Table.Cell>
                            {order?.GrnData ? (
                              <Button
                                size="xs"
                                onClick={() =>
                                  handleViewOrderData(
                                    order?.Grn_Id,
                                    order?.GrnData,
                                    order?.invoiceId?.distributorId?.dbCode
                                  )
                                }
                              >
                                View Data
                              </Button>
                            ) : null}
                          </Table.Cell>

                          {/* <Table.Cell className="text-red-500 w-96">
                            {order?.ErrorLog}
                          </Table.Cell> */}

                          <Table.Cell>
                            {order?.invoiceId?.GRNFKDATE
                              ? moment(order.invoiceId.GRNFKDATE)
                                .tz("Asia/Kolkata")
                                .format("DD-MM-YYYY hh:mm A")
                              : "N/A"}
                          </Table.Cell>

                          <Table.Cell>
                            {moment(order?.createdAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY hh:mm A")}
                          </Table.Cell>

                          <Table.Cell>
                            {moment(order?.updatedAt)
                              .tz("Asia/Kolkata")
                              .format("DD-MM-YYYY hh:mm A")}
                          </Table.Cell>

                          <Table.Cell className="flex justify-center items-center">
                            {deletingOrders.has(order._id) ? (
                              <Spinner size="sm" />
                            ) : (
                              pagePermission?.delete && (
                                <FaTrash
                                  size={20}
                                  className="cursor-pointer text-red-500 hover:text-red-700"
                                  onClick={() => handleDelete(order)}
                                />)
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))}

                      {purchaseOrders?.length === 0 && (
                        <Table.Row>
                          <Table.Cell colSpan="8" className="text-center">
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
        </div>) : (<div className="flex justify-center items-center h-[70vh] w-full">
          <div className="text-center">
            <div className="text-red-600 text-4xl font-bold mb-2">
              No Access
            </div>
            <div className="text-gray-500 text-lg">
              You do not have permission to view this page.
            </div>
          </div>
        </div>
      )}
      {console.log(currentOrderData)}

      {/* MODAL */}
      <Modal
        show={openOrderDataModal}
        onClose={() => setOpenOrderDataModal(false)}
        size="2xl"
      >
        <Modal.Header>
          <h1>
            Order Data for ID: {currentOrderId} for distributor {viewDbCode}
          </h1>
          <FaRegCopy
            size={25}
            onClick={handleCopyOrderData}
            className="cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <pre className="whitespace-pre-wrap text-xs text-green-400">
            {JSON.stringify(currentOrderData, null, 2)}
          </pre>
        </Modal.Body>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        show={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        size="md"
      >
        <Modal.Header>
          <div className="flex items-center gap-3">
            <FaTrash className="text-red-500" size={24} />
            <span className="text-lg font-semibold">Confirm Deletion</span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                Are you sure you want to delete this invoice?
              </p>
              <p className="text-red-600 text-sm mt-1">
                This action cannot be undone. The invoice and associated GRN log
                will be permanently removed.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="syncGRNDelete"
                  checked={syncGRNForDelete}
                  onChange={(e) => setSyncGRNForDelete(e.target.checked)}
                  className="text-blue-600"
                />
                <div>
                  <Label
                    htmlFor="syncGRNDelete"
                    className="!text-blue-800 !font-medium cursor-pointer"
                  >
                    Sync GRN Data After Deletion
                  </Label>
                  <p className="text-blue-600 text-sm mt-1">
                    Automatically fetch and sync new GRN data for this
                    distributor after deletion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end gap-3">
          <Button
            color="gray"
            onClick={() => setOpenDeleteModal(false)}
            className="px-6"
          >
            Cancel
          </Button>
          {pagePermission?.delete && (
            <Button
              color="red"
              onClick={handleConfirmDelete}
              className="px-6 bg-red-600 hover:bg-red-700"
            >
              <FaTrash className="mr-2" size={16} />
              Delete Invoice
            </Button>)}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PuchaseInvoiceLog;
