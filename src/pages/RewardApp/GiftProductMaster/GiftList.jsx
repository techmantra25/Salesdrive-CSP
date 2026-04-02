import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Label,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiExternalLink } from "react-icons/fi";
import { RiRefreshFill } from "react-icons/ri";
import { FaDownload } from "react-icons/fa";
import { MdSimCardDownload, MdDownloadForOffline } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  getGiftProductListPaginated,
  getGiftProductBulkUpload,
} from "../../../api/rewardsApi";
import { BiPlusCircle } from "react-icons/bi";
import GiftDetails from "./GiftDetails";
import EditButton from "../../../assets/common/EditButton";
import { StatusIndicatorNew } from "../../../assets/common/StatusIndicator";
import { FileUpload } from "../../../uploadWidget/FileUpload";
import { escapeCSVValue } from "../../../utils/escapeCSVValue";
import { useSelector } from "react-redux";
import { getPagePermission } from "../../../utils/permissionHelper";


export const GiftList = () => {
    const role = useSelector((state) => state.permission?.data?.role);
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [giftProductList, setGiftOrderList] = useState([]);
  const [status, setStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [errorLog, setErrorLog] = useState([]);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  console.log("Role IN GIFTLIST", role)

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "reward-products"
    );

    setPagePermission(permission);
  }, [permissionState]);

  const onPageChange = (page) => setCurrentPage(page);

  let fetchPurchaseOrderPaginatedWithOutDebounce = async () => {
    try {
      setPageLoading(true);
      const query = {
        page: currentPage,
        limit: 20,
      };

      if (status !== "All") {
        query.status = status;
      }

      if (searchTerm) {
        query.search = searchTerm;
      }

      const response = await getGiftProductListPaginated(query);

      setGiftOrderList(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch suppliers",
      );
    } finally {
      setPageLoading(false);
    }
  };

  let fetchPurchaseOrderPaginated = useDebounce(
    fetchPurchaseOrderPaginatedWithOutDebounce,
    500,
  );

  const handleResetFilter = () => {
    setCurrentPage(1);
    setStatus("All");
    setSearchTerm("");
    fetchPurchaseOrderPaginated();
  };

  const handleCSVTemplateDownload = () => {
    const headers = [
      "Product Name",
      "Description",
      "Points",
      "Image URL",
      "Status",
    ];

    const descriptions = [
      "(Required)",
      "(Required)",
      "(Required)",
      "(Required)",
      "(Required - active/draft/inactive)",
    ];

    // Escape and join
    const csvString =
      headers.map(escapeCSVValue).join(",") +
      "\n" +
      descriptions.map(escapeCSVValue).join(",");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "gift_products_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleBulkUpload = async (url) => {
    try {
      const payload = {
        file: url,
      };
      const res = await getGiftProductBulkUpload(payload);

      toast.success(
        `${res?.data?.summary?.successCount} products created successfully${
          res?.data?.summary?.skippedCount > 0
            ? ` and ${res?.data?.summary?.skippedCount} products failed to create`
            : ""
        }`,
      );

      setErrorLog(res?.data?.skippedData || []);
      fetchPurchaseOrderPaginated();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to upload gift products, try again",
      );
    }
  };

  const handleErrorLogDownload = async () => {
    try {
      if (!errorLog.length) {
        toast.error("No error log to download.");
        return;
      }

      // Dynamically get all unique keys from all objects
      const allKeys = Array.from(
        errorLog.reduce((keys, row) => {
          Object.keys(row).forEach((k) => keys.add(k));
          return keys;
        }, new Set()),
      );

      // CSV header
      const csv = [allKeys.join(",")];

      // CSV rows
      errorLog.forEach((row) => {
        const csvRow = allKeys
          .map((key) => {
            // Escape quotes and wrap in quotes
            const value = row[key] !== undefined ? String(row[key]) : "";
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",");
        csv.push(csvRow);
      });

      // Join all rows into a single CSV string
      const csvString = csv.join("\n");

      // Create a blob and trigger the download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
      a.setAttribute("download", "gift_products_error_log.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Optionally clear the error log
      setErrorLog([]);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download error log, try again",
      );
    }
  };

  useEffect(() => {
    fetchPurchaseOrderPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, status, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [status, searchTerm]);

  return (
    <div className="flex justify-start items-center flex-col w-full">
      {pagePermission?.view ? (
        <>
          <div className="flex justify-between w-full items-center py-1">
            <div className="flex justify-start items-center w-full">
              <Breadcrumb aria-label="Solid background breadcrumb example">
                <Breadcrumb.Item>RVP App</Breadcrumb.Item>
                <Breadcrumb.Item href={`/admin/rbp-reward-products`}>
                  Product List
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex justify-start items-center flex-col gap-2 w-full p-1">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="indigo">Total Items : {totalItems}</Badge>
                <Badge color="indigo">Filtered Items : {filteredCount}</Badge>
              </div>
              <div className="flex justify-center w-full items-end gap-2 flex-wrap">
                <div className="w-40">
                  <div className="block">
                    <Label value="Status" />
                  </div>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="All">All</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>
                <div className="flex flex-1 overflow-x-auto md:justify-center min-w-75">
                  <TextInput
                    type="text"
                    className="px-3 rounded-sm w-full"
                    placeholder="Search Product by Name or Description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex justify-center items-center gap-2">
                  {pagePermission?.view && (
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
                  )}
                  {pagePermission?.create && (
                    <Button
                      className="text-xs"
                      size="sm"
                      color="purple"
                      onClick={() => navigate(`/${role}/rbp-prodicut-create`)}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <BiPlusCircle size={20} />
                        Add Product
                      </span>
                    </Button>
                  )}
                </div>
                <div className="flex gap-3 justify-center items-center">
                  {pagePermission?.create && (
                    <Button
                      className="text-xs"
                      color="light"
                      size="sm"
                      onClick={() => {
                        handleCSVTemplateDownload();
                      }}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <MdSimCardDownload size={20} />
                        Template
                      </span>
                    </Button>
                  )}
                  {pagePermission?.create && (
                    <FileUpload
                      type="single-file"
                      page="bulk-import"
                      onSetFileUrl={(url) => {
                        handleBulkUpload(url);
                      }}
                      btnTitle="Upload Gift Products"
                    />
                  )}
                  {pagePermission?.view && (
                    <Link
                      to="/admin/image-converter"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open("/admin/image-converter", "_blank");
                      }}
                      className="font-medium text-[#0860ee]  hover:bg-blue-300 p-3 hover:font-bold"
                    >
                      Use Image Converter
                    </Link>
                  )}

                  {errorLog.length > 0 && pagePermission?.view && (
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
            <div className="overflow-x-auto w-full">
              <Table striped className="rounded-none border">
                <Table.Head className="text-center">
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100 w-16">
                    Image
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Product Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Product Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Description
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Points
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                    Status
                  </Table.HeadCell>
                  {pagePermission?.update && (
                    <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                      Action
                    </Table.HeadCell>
                  )}
                </Table.Head>
                <Table.Body className="divide-y">
                  {pageLoading ? (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="10"
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
                      {giftProductList?.map((po) => (
                        <Table.Row
                          key={po._id}
                          className="text-center bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 p-2">
                            <div className="flex justify-center">
                              <img
                                src={po.image[0]}
                                alt={po.name}
                                className="w-18 h-18 rounded-sm border-2 border-gray-200 dark:border-gray-600 object-contain"
                              />
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-semibold">{po?.name}</span>
                              <FiExternalLink
                                color="#3795BD"
                                className="cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => {
                                  setSelectedProduct(po);
                                  setShowInfoModal(true);
                                }}
                                title="View Details"
                              />
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {po.code}
                          </Table.Cell>
                          <Table.Cell className="whitespace-wrap truncate font-medium text-gray-900 dark:text-gray-200 max-w-xs">
                            {po.description.length > 40
                              ? po.description.slice(0, 40) + "..."
                              : po.description}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex justify-center items-center">
                              <Badge color="purple" className="font-bold">
                                {po?.point} pts
                              </Badge>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <StatusIndicatorNew status={po?.status} />
                          </Table.Cell>
                          {pagePermission?.update && (
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <EditButton
                                onClick={() =>
                                  navigate(`/${role}/rbp-prodicut-edit/${po?._id}`)
                                }
                                additionalText=""
                              />
                            </Table.Cell>
                          )}
                        </Table.Row>
                      ))}
                      {giftProductList?.length === 0 && (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan="10"
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
          {showInfoModal && (
            <GiftDetails
              product={selectedProduct}
              openModal={showInfoModal}
              setOpenModal={setShowInfoModal}
              onCloseInfoModal={() => setShowInfoModal(false)}
            />
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-[70vh] w-full">
          <div className="text-center">
            <div className="text-red-600 text-4xl font-bold mb-2">
              NO Access
            </div>
            <div className="text-gray-500 text-lg">
              You do not have permission to view this page.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftList;