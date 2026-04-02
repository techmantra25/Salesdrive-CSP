import toast from "react-hot-toast";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Badge,
  Button,
  Card,
  Label,
  Pagination,
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
import { getDeletedInvoiceList } from "../../api/prchaseApi";
import { FaRegCopy } from "react-icons/fa";

const DeletedDataLog = () => {
  const [deletedInvoices, setDeletedInvoices] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [deletedInvoicesLoading, setDeletedInvoicesLoading] = useState(false);

  // DELETED AT DATE FILTER
  const [deletedAtRange, setDeletedAtRange] = useState({
    startDate: null,
    endDate: null,
  });

  // MODAL HANDLER
  const [openInvoiceDataModal, setOpenInvoiceDataModal] = useState(false);
  const [currentInvoiceData, setCurrentInvoiceData] = useState(null);
  const [currentInvoiceId, setCurrentInvoiceId] = useState("");

  const handleDeletedAtRangeChange = (range) => {
    if (!range) {
      setDeletedAtRange({ startDate: null, endDate: null });
      return;
    }
    setDeletedAtRange({
      startDate: range.startDate ? range.startDate.split("T")[0] : null,
      endDate: range.endDate ? range.endDate.split("T")[0] : null,
    });
  };

  const onPageChange = (page) => setCurrentPage(page);

  const handleViewInvoiceData = (invoiceId, invoiceData) => {
    setCurrentInvoiceId(invoiceId);
    setCurrentInvoiceData(invoiceData);
    setOpenInvoiceDataModal(true);
  };

  let fetchDeletedInvoicesPaginatedWithOutDebounce = async () => {
    try {
      setDeletedInvoicesLoading(true);

      const query = {
        page: currentPage,
        limit: 50,
      };

      if (searchTerm) query.search = searchTerm;

      // DELETED AT FILTER
      if (deletedAtRange.startDate && deletedAtRange.endDate) {
        query.deletedFromDate = deletedAtRange.startDate;
        query.deletedToDate = deletedAtRange.endDate;
      }

      const response = await getDeletedInvoiceList(query);

      setDeletedInvoices(response?.data?.data || []);
      setTotalPages(response?.data?.pagination?.totalPages || 0);
      setFilteredCount(response?.data?.pagination?.filteredCount || 0);
      setTotalItems(response?.data?.pagination?.totalActiveCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch deleted invoices"
      );
    } finally {
      setDeletedInvoicesLoading(false);
    }
  };

  let fetchDeletedInvoicesPaginated = useDebounce(
    fetchDeletedInvoicesPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setSearchTerm("");
    setDeletedAtRange({ startDate: null, endDate: null });
    fetchDeletedInvoicesPaginated();
  };

  useEffect(() => {
    fetchDeletedInvoicesPaginated();
  }, [currentPage, searchTerm, deletedAtRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, deletedAtRange]);

  const handleCopyInvoiceData = () => {
    if (!currentInvoiceData) return;
    navigator.clipboard.writeText(JSON.stringify(currentInvoiceData, null, 2));
    toast.success("Invoice data copied");
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* Header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <h1 className="text-2xl font-bold">Deleted Data Log</h1>
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
              {/* Search */}
              <div className="w-44">
                <Label value="Search" />
                <TextInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search"
                />
              </div>

              {/* DELETED AT DATE */}
              <div className="w-64">
                <Label value="Deleted At Date Range" />
                <Datepicker
                  showShortcuts={true}
                  value={deletedAtRange}
                  onChange={handleDeletedAtRangeChange}
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2 mt-3">
              <Button color="success" onClick={handleResetFilter}>
                <RiRefreshFill /> Reset & Refresh
              </Button>
            </div>
          </Card>
        </div>

        {/* Pagination */}
        <div className="flex justify-end w-full px-4">
          {filteredCount > 50 && !deletedInvoicesLoading && (
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
                <Table.HeadCell>
                  Invoice NO / <br /> Multiplier / <br /> Reward
                </Table.HeadCell>
                <Table.HeadCell>Distributor Name</Table.HeadCell>
                <Table.HeadCell>View Original Data</Table.HeadCell>
                <Table.HeadCell>View DB Transactions</Table.HeadCell>
                <Table.HeadCell>View adjustments</Table.HeadCell>
                <Table.HeadCell>View Multiplier</Table.HeadCell>
                <Table.HeadCell>View Retailer Outlet</Table.HeadCell>
                <Table.HeadCell>View Rebuild Result</Table.HeadCell>
                <Table.HeadCell>Deleted At</Table.HeadCell>
              </Table.Head>

              <Table.Body>
                {deletedInvoicesLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan="9" className="text-center">
                      <Spinner size="xl" />
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  <>
                    {deletedInvoices?.map((invoice) => (
                      <Table.Row key={invoice?._id}>
                        <Table.Cell>
                          <UniqueCode text={invoice?.invoiceNo} />
                        </Table.Cell>

                        <Table.Cell>{invoice?.distributorId?.name}</Table.Cell>

                        <Table.Cell>
                          {invoice?.originalInvoiceData ? (
                            <Button
                              size="xs"
                              color="blue"
                              onClick={() =>
                                handleViewInvoiceData(
                                  `${invoice?.invoiceNo} - Original Data`,
                                  invoice?.originalInvoiceData
                                )
                              }
                            >
                              View Original
                            </Button>
                          ) : null}
                        </Table.Cell>

                        <Table.Cell>
                          {invoice?.deletedDbTransactions?.length > 0 ? (
                            <Button
                              size="xs"
                              color="green"
                              onClick={() =>
                                handleViewInvoiceData(
                                  `${invoice?.invoiceNo} - DB Transactions`,
                                  invoice?.deletedDbTransactions
                                )
                              }
                            >
                              View DB ({invoice?.deletedDbTransactions?.length})
                            </Button>
                          ) : null}
                        </Table.Cell>

                        <Table.Cell>
                          {invoice?.deletedApiTransactions?.length > 0 ? (
                            <Button
                              size="xs"
                              color="purple"
                              onClick={() =>
                                handleViewInvoiceData(
                                  `${invoice?.invoiceNo} - API Transactions`,
                                  invoice?.deletedApiTransactions
                                )
                              }
                            >
                              View API (
                              {invoice?.deletedApiTransactions?.length})
                            </Button>
                          ) : null}
                        </Table.Cell>

                         <Table.Cell>
                          {invoice?.deletedRetailerMultiplierTransactions?.length > 0 ? (
                            <Button
                              size="xs"
                              color="purple"
                              onClick={() =>
                                handleViewInvoiceData(
                                  `${invoice?.invoiceNo} - Multiplier Transactions`,
                                  invoice?.deletedRetailerMultiplierTransactions
                                )
                              }
                            >
                              View API (
                              {invoice?.deletedRetailerMultiplierTransactions?.length})
                            </Button>
                          ) : null}
                        </Table.Cell>

                        <Table.Cell>
                          {invoice?.deletedRetailerOutletTransactions?.length > 0 ? (
                            <Button
                              size="xs"
                              color="orange"
                              onClick={() =>
                                handleViewInvoiceData(
                                  `${invoice?.invoiceNo} - Retailer Outlet Transactions`,
                                  invoice?.deletedRetailerOutletTransactions
                                )
                              }
                            >
                              View Retailer Outlet (
                              {invoice?.deletedRetailerOutletTransactions?.length})
                            </Button>
                          ) : null}
                        </Table.Cell>

                        <Table.Cell>
                          {invoice?.rebuildResult ? (
                            <Button
                              size="xs"
                              color="light"
                              onClick={() =>
                                handleViewInvoiceData(
                                  `${invoice?.invoiceNo} - Rebuild Result`,
                                  invoice?.rebuildResult
                                )
                              }
                            >
                              View Result
                            </Button>
                          ) : null}
                        </Table.Cell>

                        <Table.Cell>
                          {moment(invoice?.deletedAt)
                            .tz("Asia/Kolkata")
                            .format("DD-MM-YYYY hh:mm A")}
                        </Table.Cell>
                      </Table.Row>
                    ))}

                    {deletedInvoices?.length === 0 && (
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
        show={openInvoiceDataModal}
        onClose={() => setOpenInvoiceDataModal(false)}
        size="2xl"
      >
        <Modal.Header>
          <h1>Invoice Data for ID: {currentInvoiceId}</h1>
          <FaRegCopy
            size={25}
            onClick={handleCopyInvoiceData}
            className="cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <pre className="whitespace-pre-wrap text-xs text-green-300">
            {JSON.stringify(currentInvoiceData, null, 2)}
          </pre>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DeletedDataLog;
