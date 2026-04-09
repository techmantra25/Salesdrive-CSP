import {
  Badge,
  Button,
  Card,
  Label,
  Pagination,
  Select,
  Spinner,
  Table,
} from "flowbite-react";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdDownloadForOffline } from "react-icons/md";
import moment from "moment";
import { RiRefreshFill } from "react-icons/ri";
import { getPriceCSV, PriceCSVStatusUpdate } from "../../api/api";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { FaCopy } from "react-icons/fa";
import { useSelector } from "react-redux";

const PriceUpdate = () => {
  const [priceCSVs, setPriceCSVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("default");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  // ----- useSelector: read user from redux store (robust to common shapes) -----
  // Adjust this selector if your store uses a different path.
  const userFromStore = useSelector(
    (state) =>
      state.auth?.user ||
      state.auth?.userInfo ||
      state.user?.userInfo ||
      state.user?.currentUser ||
      state.user ||
      null
  );

  const role =
    userFromStore?.role ||
    userFromStore?.data?.role ||
    userFromStore?.user?.role ||
    null;

  const isAdmin = role === "admin";
  const isSubAdmin = ["sub-admin-primary", "sub-admin-rbp"].includes(role);
  // ---------------------------------------------------------------------------

  const fetchPriceCSVs = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        page: currentPage,
        limit: 10,
      };
      if (selectedStatus !== "default") {
        query.status = selectedStatus;
      }
      const response = await getPriceCSV(query);
      setPriceCSVs(response?.data?.data || []);
      setTotalPages(response?.data?.pagination?.totalPages || 0);
      setFilteredCount(response?.data?.pagination?.filteredCount || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch price csv list"
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus]);

  const handleDownload = (url) => {
    setDownloadLoading(true);
    try {
      if (!url) {
        toast.error("File URL is not available.");
        setDownloadLoading(false);
        return;
      }

      // Extract filename from URL
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastsubBrand = pathname.substring(pathname.lastIndexOf("/") + 1);
      const filename = decodeURIComponent(lastsubBrand.split("?")[0]);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename; // Suggest filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("File download started.");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to initiate file download.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const [importingCsv, setImportingCsv] = useState(false);
  const [errorLog, setErrorLog] = useState(null);
  const skippedRows = errorLog?.skippedRows || [];

  const handleCSVImport = async (url, csvId) => {
    openConfirmationModel({
      question: "Are you sure you want to import this pricing?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          setImportingCsv(true);
          try {
            const body = {
              id: csvId,
              status: "Modified & Uploaded",
              modifiedURL: url,
            };

            const res = await PriceCSVStatusUpdate(body);
            const successRows = res?.data?.data?.bulkAddData?.data || [];
            const skippedRows = res?.data?.data?.bulkAddData?.skippedRows || [];

            if (skippedRows.length > 0) {
              setErrorLog({
                csvId: csvId,
                skippedRows: skippedRows,
              });
            }

            toast.success(
              `CSV imported successfully. Success: ${successRows.length}, Skipped: ${skippedRows.length}`
            );
            fetchPriceCSVs();
          } catch (error) {
            toast.error(
              error?.response?.data?.message || "Failed to import CSV"
            );
          } finally {
            setImportingCsv(false);
          }
        } else {
          return;
        }
      },
    });
  };

  const handleApprove = async (csvId) => {
    openConfirmationModel({
      question: "Are you sure you want to approve this pricing?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          setImportingCsv(true);
          try {
            const body = {
              id: csvId,
              status: "Approved & Uploaded",
            };
            const res = await PriceCSVStatusUpdate(body);

            const successRows = res?.data?.data?.bulkAddData?.data || [];
            const skippedRows = res?.data?.data?.bulkAddData?.skippedRows || [];

            if (skippedRows.length > 0) {
              setErrorLog({
                csvId: csvId,
                skippedRows: skippedRows,
              });
            }

            toast.success(
              `CSV approved successfully. Success: ${successRows.length}, Skipped: ${skippedRows.length}`
            );
            fetchPriceCSVs();
          } catch (error) {
            toast.error(
              error?.response?.data?.message || "Failed to approve CSV"
            );
          } finally {
            setImportingCsv(false);
          }
        } else {
          return;
        }
      },
    });
  };

  const handleCancelCSVImport = async (csvId) => {
    openConfirmationModel({
      question: "Are you sure you want to cancel this pricing?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          setImportingCsv(true);
          try {
            const body = {
              id: csvId,
              status: "Canceled",
            };

            await PriceCSVStatusUpdate(body);

            toast.success("CSV import canceled successfully");
            fetchPriceCSVs();
          } catch (error) {
            toast.error(
              error?.response?.data?.message || "Failed to cancel CSV import"
            );
          } finally {
            setImportingCsv(false);
          }
        } else {
          return;
        }
      },
    });
  };

  const handleErrorLogDownload = async () => {
    try {
      if (!skippedRows || skippedRows.length === 0) {
        toast.error("No error log to download.");
        return;
      }

      // Dynamically get all unique keys from the errorLog array
      const headers = Array.from(
        new Set(skippedRows.flatMap((obj) => Object.keys(obj)))
      );

      // CSV header
      const csv = [headers.join(",")];

      // CSV rows
      skippedRows.forEach((row) => {
        const rowData = headers.map((header) => {
          // Escape double quotes by doubling them
          const value = row[header] !== undefined ? String(row[header]) : "";
          return `"${value.replace(/"/g, '""')}"`;
        });
        csv.push(rowData.join(","));
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

      // Clear the skipped rows log (if needed)
      setErrorLog(null);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to export error log, try again"
      );
    }
  };

  const handleResetFilter = () => {
    setSelectedStatus("default");
    setCurrentPage(1);
    fetchPriceCSVs();
  };

  useEffect(() => {
    fetchPriceCSVs();
  }, [currentPage, selectedStatus, fetchPriceCSVs]);

  // Compute column count dynamically so colSpan for "No data" and loading rows stays correct
  const colCount = isAdmin ? 7 : 6;

  return (
    <div className="flex flex-col gap-2 w-full items-center">
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Price CSV Management</h1>
      </div>

      <div className="flex flex-col gap-2 w-full p-4 items-center">
        <Card className="w-full flex flex-col items-center">
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Count : {filteredCount}</Badge>
          </div>
          <div className="flex justify-center w-full items-center gap-2 flex-wrap">
            <div className="w-56">
              <div className="mb-2 block">
                <Label htmlFor="statusSelect" value="Select Status" />
              </div>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                id="statusSelect"
                required
                disabled={loading}
              >
                <option value="default">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved & Uploaded">Approved & Uploaded</option>
                <option value="Canceled">Canceled</option>
                <option value="Modified & Uploaded">Modified & Uploaded</option>
              </Select>
            </div>
            <div className="w-56 pt-8">
              <Button
                className="text-xs"
                size="sm"
                color="success"
                onClick={handleResetFilter}
                disabled={loading}
              >
                <span className="flex items-center gap-2">
                  <RiRefreshFill size={20} />
                  Reset & Refresh
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end w-full px-4">
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showIcons
            disabled={loading}
          />
        )}
      </div>

      <div className="flex flex-col gap-4 w-full p-4 items-center">
        <div className="overflow-x-auto w-full">
          <Table striped className="text-xs">
            <Table.Head className="text-center">
              <Table.HeadCell className="px-2 py-1">ID</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">Created At</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">Cron CSV</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">
                Modified CSV
              </Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">Status</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">
                Success & Skipped
              </Table.HeadCell>
              {isAdmin && (
                <Table.HeadCell className="px-2 py-1">Actions</Table.HeadCell>
              )}
            </Table.Head>
            <Table.Body>
              {loading ? (
                <Table.Row className="text-center">
                  <Table.Cell colSpan={colCount} className="px-2 py-1">
                    <Spinner size="md" />
                  </Table.Cell>
                </Table.Row>
              ) : priceCSVs?.length ? (
                priceCSVs.map((csv) => {
                  const showButtons = ["Pending"].includes(csv?.status);
                  const showErrorLog =
                    errorLog &&
                    skippedRows.length > 0 &&
                    csv._id === errorLog?.csvId;

                  return (
                    <Table.Row
                      key={csv._id}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200 uppercase">
                        <span className="flex justify-center items-center gap-2">
                          <FaCopy
                            size={15}
                            className="cursor-pointer"
                            title={csv?._id?.toUpperCase()}
                            onClick={() => {
                              navigator.clipboard.writeText(
                                csv?._id?.toUpperCase()
                              );
                              toast.success("ID copied to clipboard");
                            }}
                          />
                        </span>
                      </Table.Cell>

                      <Table.Cell className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                        {moment(csv?.createdAt).format("DD/MM/YYYY hh:mm A")}
                      </Table.Cell>

                      <Table.Cell className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex justify-center items-center">
                          <span
                            onClick={() => handleDownload(csv?.url?.cronURL)}
                            disabled={downloadLoading}
                            title="Download Cron CSV"
                            className="px-2 py-1 cursor-pointer"
                          >
                            {downloadLoading ? (
                              <Spinner size="sm" className="mr-1" />
                            ) : (
                              <MdDownloadForOffline
                                size={16}
                                className="mr-1"
                              />
                            )}
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex justify-center items-center">
                          {csv.url?.modifiedURL && (
                            <span
                              onClick={() =>
                                handleDownload(csv?.url?.modifiedURL)
                              }
                              disabled={
                                downloadLoading || !csv.url?.modifiedURL
                              }
                              title="Download Modified CSV"
                              className="px-2 py-1 cursor-pointer"
                            >
                              {downloadLoading ? (
                                <Spinner size="sm" className="mr-1" />
                              ) : (
                                <MdDownloadForOffline
                                  size={16}
                                  className="mr-1"
                                />
                              )}
                            </span>
                          )}
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          <Badge
                            color={
                              csv?.status === "Pending"
                                ? "warning"
                                : csv?.status === "Approved & Uploaded"
                                ? "success"
                                : csv?.status === "Canceled"
                                ? "failure"
                                : csv?.status === "Modified & Uploaded"
                                ? "success"
                                : "gray"
                            }
                            className="capitalize"
                          >
                            {csv?.status}
                          </Badge>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          {csv?.count?.success !== null && (
                            <Badge color="success">
                              {csv?.count?.success} Success
                            </Badge>
                          )}
                          {csv?.count?.failure !== null && (
                            <Badge color="failure">
                              {csv?.count?.failure} Skipped
                            </Badge>
                          )}
                        </div>
                      </Table.Cell>

                      {isAdmin && (
                        <Table.Cell className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex justify-center items-center gap-2 flex-wrap">
                            {showButtons && (
                              <>
                                <Button
                                  size="xs"
                                  color="success"
                                  disabled={importingCsv}
                                  onClick={() => handleApprove(csv._id)}
                                >
                                  <span className="flex items-center gap-1">
                                    Approve
                                  </span>
                                </Button>

                                <Button
                                  size="xs"
                                  color="failure"
                                  disabled={importingCsv}
                                  onClick={() => handleCancelCSVImport(csv._id)}
                                >
                                  <span className="flex items-center gap-1">
                                    Cancel
                                  </span>
                                </Button>

                                {importingCsv ? (
                                  <Button
                                    disabled
                                    className="text-xs"
                                    size="xs"
                                    color="warning"
                                  >
                                    <span className="flex justify-center items-center gap-2 whitespace-nowrap">
                                      <Spinner size="xs" />
                                      Upload Modified CSV
                                    </span>
                                  </Button>
                                ) : (
                                  <FileUpload
                                    type="single-file"
                                    page="bulk-import"
                                    size="xs"
                                    btnTitle="Upload Modified CSV"
                                    onSetFileUrl={(url) =>
                                      handleCSVImport(url, csv._id)
                                    }
                                  />
                                )}
                              </>
                            )}

                            {csv?.count?.failure !== null &&
                              csv?.count?.failure > 0 && (
                                <>
                                  {importingCsv ? (
                                    <Button
                                      disabled
                                      className="text-xs"
                                      size="xs"
                                      color="warning"
                                    >
                                      <span className="flex justify-center items-center gap-2">
                                        <Spinner size="xs" />
                                        Modify & Upload CSV
                                      </span>
                                    </Button>
                                  ) : (
                                    <FileUpload
                                      type="single-file"
                                      page="bulk-import"
                                      size="xs"
                                      btnTitle="Modify & Upload CSV"
                                      onSetFileUrl={(url) =>
                                        handleCSVImport(url, csv._id)
                                      }
                                    />
                                  )}
                                </>
                              )}

                            {showErrorLog && (
                              <Button
                                size={"xs"}
                                className="text-xs"
                                color="red"
                                onClick={() => handleErrorLogDownload()}
                              >
                                <span className="flex justify-center items-center gap-2">
                                  <MdDownloadForOffline size={15} />
                                  Error Log
                                  <Badge color="gray">
                                    {skippedRows.length}
                                  </Badge>
                                </span>
                              </Button>
                            )}
                          </div>
                        </Table.Cell>
                      )}
                    </Table.Row>
                  );
                })
              ) : (
                <Table.Row className="text-center">
                  <Table.Cell colSpan={colCount} className="px-2 py-1">
                    No data found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PriceUpdate;
