import {
  Badge,
  Card,
  Label,
  Pagination,
  Select,
  Spinner,
  TextInput,
} from "flowbite-react";
import { HiDownload } from "react-icons/hi";
import moment from "moment";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import {
  getCategoryDateWiseMatrix,
  getProductDateWiseMatrix,
  exportCategoryDateWiseMatrix,
  exportProductDateWiseMatrix,
} from "../../api/api";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchCategories } from "../../redux/categorySlice";
// NOTE: adjust this import to match wherever regions are fetched into redux
// in your app (the same slice/action used by the "Add Price" region select).
import { fetchRegions } from "../../redux/regionSlice";
import { getPagePermission } from "../../utils/permissionHelper";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
];

const CategoryPricing = () => {
  const dispatch = useDispatch();

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  const sortByName = (list) =>
    [...list].sort((a, b) => a.name.localeCompare(b.name));

  const { categories: categoryList } = useSelector((state) => state.category);
  const sortedCategoryList = sortByName(categoryList);
  const activeCategories = sortedCategoryList.filter(
    (category) => category.status === true,
  );

  // Regions list for the region filter dropdown.
  const { regions: regionList } = useSelector(
    (state) => state.region || { regions: [] },
  );
  const sortedRegionList = sortByName(regionList || []);

  // -------------------- TAB STATE --------------------
  const [activeTab, setActiveTab] = useState("product"); // "product" | "category"

  // -------------------- SHARED FILTERS --------------------
  const [selectedCategory, setSelectedCategory] = useState("default");
  const [selectedProductCode, setSelectedProductCode] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedStatus, setSelectedStatus] = useState("active"); // active | inactive | all
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    if (permissionState) {
      const permission = getPagePermission(permissionState, "pricing");
      setPagePermission(permission);
    }
  }, [permissionState]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchRegions());
  }, [dispatch]);

  const handleDateRangeChange = (range) => setDateRange(range);

  const buildFilterQuery = () => {
    const query = {};
    if (selectedCategory !== "default") {
      query.selectedCategory = selectedCategory;
    }
    if (selectedProductCode.trim() !== "") {
      query.productCode = selectedProductCode.trim();
    }
    if (selectedRegion !== "default") {
      query.selectedRegion = selectedRegion;
    }
    // Always send status — backend defaults to "active" anyway, but being
    // explicit keeps the UI and API in sync.
    query.selectedStatus = selectedStatus;
    if (dateRange.startDate && dateRange.endDate) {
      query.dateRange = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
    }
    return query;
  };

  const handleResetFilter = () => {
    setSelectedCategory("default");
    setSelectedProductCode("");
    setSelectedRegion("default");
    setSelectedStatus("active");
    setDateRange({ startDate: null, endDate: null });
  };

  // -------------------- PRODUCT-WISE MATRIX STATE --------------------
  const [productMatrixData, setProductMatrixData] = useState({
    dates: [],
    rows: [],
  });
  const [productMatrixLoading, setProductMatrixLoading] = useState(true);
  const [productMatrixPage, setProductMatrixPage] = useState(1);
  const productMatrixItemsPerPage = 20; // products per page
  const [productMatrixTotalPages, setProductMatrixTotalPages] = useState(0);
  const [productMatrixTotalProducts, setProductMatrixTotalProducts] =
    useState(0);
  const [productMatrixTotalPriceRows, setProductMatrixTotalPriceRows] =
    useState(0);

  let fetchProductMatrixWithOutDebounce = async () => {
    try {
      setProductMatrixLoading(true);
      const query = {
        ...buildFilterQuery(),
        page: productMatrixPage,
        limit: productMatrixItemsPerPage,
      };

      const response = await getProductDateWiseMatrix(query);

      setProductMatrixData(response?.data?.data || { dates: [], rows: [] });
      setProductMatrixTotalPages(response?.data?.pagination?.totalPages || 0);
      setProductMatrixTotalProducts(
        response?.data?.pagination?.totalProducts || 0,
      );
      setProductMatrixTotalPriceRows(
        response?.data?.pagination?.totalPriceRows || 0,
      );
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch product wise pricing",
      );
    } finally {
      setProductMatrixLoading(false);
    }
  };

  let fetchProductMatrix = useDebounce(fetchProductMatrixWithOutDebounce, 500);

  // -------------------- CATEGORY-WISE MATRIX STATE --------------------
  const [categoryMatrixData, setCategoryMatrixData] = useState({
    dates: [],
    rows: [],
  });
  const [categoryMatrixLoading, setCategoryMatrixLoading] = useState(true);
  const [categoryMatrixPage, setCategoryMatrixPage] = useState(1);
  const categoryMatrixItemsPerPage = 20; // categories per page
  const [categoryMatrixTotalPages, setCategoryMatrixTotalPages] = useState(0);
  const [categoryMatrixTotalCategories, setCategoryMatrixTotalCategories] =
    useState(0);
  const [categoryMatrixTotalPriceRows, setCategoryMatrixTotalPriceRows] =
    useState(0);

  let fetchCategoryMatrixWithOutDebounce = async () => {
    try {
      setCategoryMatrixLoading(true);
      const query = {
        ...buildFilterQuery(),
        page: categoryMatrixPage,
        limit: categoryMatrixItemsPerPage,
      };

      const response = await getCategoryDateWiseMatrix(query);

      setCategoryMatrixData(response?.data?.data || { dates: [], rows: [] });
      setCategoryMatrixTotalPages(response?.data?.pagination?.totalPages || 0);
      setCategoryMatrixTotalCategories(
        response?.data?.pagination?.totalCategories || 0,
      );
      setCategoryMatrixTotalPriceRows(
        response?.data?.pagination?.totalPriceRows || 0,
      );
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch category wise pricing",
      );
    } finally {
      setCategoryMatrixLoading(false);
    }
  };

  let fetchCategoryMatrix = useDebounce(
    fetchCategoryMatrixWithOutDebounce,
    500,
  );

  // Product matrix fetch
  useEffect(() => {
    if (activeTab !== "product") return;
    fetchProductMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    productMatrixPage,
    selectedCategory,
    selectedProductCode,
    selectedRegion,
    selectedStatus,
    dateRange,
  ]);

  // Category matrix fetch
  useEffect(() => {
    if (activeTab !== "category") return;
    fetchCategoryMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    categoryMatrixPage,
    selectedCategory,
    selectedProductCode,
    selectedRegion,
    selectedStatus,
    dateRange,
  ]);

  // Reset pagination for both tabs whenever a filter changes
  useEffect(() => {
    setProductMatrixPage(1);
    setCategoryMatrixPage(1);
  }, [selectedCategory, selectedProductCode, selectedRegion, selectedStatus, dateRange]);

  // -------------------- DOWNLOAD (EXPORT) --------------------
  // Downloads ALL rows that match the current filters for whichever tab is
  // active — not just the current page. Product Wise tab -> product-wise
  // export endpoint, Category Wise tab -> category-wise export endpoint.
  const [downloading, setDownloading] = useState(false);

  const triggerBlobDownload = (blobData, filename) => {
    const blobUrl = URL.createObjectURL(
      new Blob([blobData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const query = buildFilterQuery(); // same filters as on-screen matrix, no page/limit
      const isProduct = activeTab === "product";

      const response = isProduct
        ? await exportProductDateWiseMatrix(query)
        : await exportCategoryDateWiseMatrix(query);

      const filename = `${isProduct ? "product" : "category"}-wise-pricing-${moment().format(
        "YYYYMMDD-HHmmss",
      )}.xlsx`;

      triggerBlobDownload(response.data, filename);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to download pricing data",
      );
    } finally {
      setDownloading(false);
    }
  };

  // -------------------- CELL STYLING --------------------
  // isCarried  -> price unchanged, carried forward from an earlier date (orange tint)
  // status === false -> inactive price row, only ever appears when the
  //                      status filter is "Inactive" or "All" (muted/red tint)
  const getCellClassName = (cell) => {
    if (!cell) return "";
    if (cell.status === false) {
      return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
    }
    if (cell.isCarried) {
      return "bg-orange-50 dark:bg-orange-900/20";
    }
    return "bg-green-50 dark:bg-green-900/10"; // price changed on this exact date
  };

  const getCellTitle = (cell) => {
    if (!cell) return "";
    if (cell.status === false) return "Inactive price";
    if (cell.isCarried) return "Carried forward — no change on this date";
    return "Changed on this date";
  };

  // -------------------- SHARED MATRIX TABLE RENDERER --------------------
  // Each group (product or category) is rendered as N sub-rows: one
  // "National" row plus one row per region that has regional pricing.
  // The group name is shown once via rowSpan on the sticky left column.
  //
  // IMPORTANT: this uses a plain HTML <table> with ONE <thead> containing
  // two real <tr> rows (not two separate Flowbite Table.Head blocks, and
  // not colSpan={3} data cells with an inner 3-col grid). That combination
  // was the cause of the MRP/DLP/RLP columns drifting out of alignment
  // with their header: a colSpan cell containing 3 evenly-split grid
  // columns does NOT necessarily line up with 3 separate <th> cells whose
  // natural widths differ (long numbers like "15,696" want more room than
  // the header text "MRP"). Giving every date exactly 3 real <td> cells —
  // one per header <th> — lets the browser compute one consistent column
  // grid for the whole table, so header and data always line up.
  const renderMatrixTable = (matrixData, getGroupKey, getGroupLabel) => (
    <div className="overflow-x-auto w-full border border-gray-300 dark:border-gray-600 rounded-lg">
      <table className="min-w-full text-xs whitespace-nowrap bg-white dark:bg-gray-800 border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-700 text-center">
          <tr>
            <th
              rowSpan={2}
              className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-700 px-2 py-2 border-r border-b border-gray-300 dark:border-gray-600 align-bottom text-left"
            >
              {activeTab === "product" ? "Product" : "Category"}
            </th>
            <th
              rowSpan={2}
              className="bg-gray-50 dark:bg-gray-700 px-2 py-2 border-r border-b border-gray-300 dark:border-gray-600 align-bottom text-left"
            >
              Price Type
            </th>
            {matrixData.dates.map((d) => (
              <th
                key={d}
                colSpan={3}
                className="px-2 py-2 border-l border-b border-gray-300 dark:border-gray-600"
              >
                {moment(d).format("DD.MM.YYYY")}
              </th>
            ))}
          </tr>
          <tr>
            {matrixData.dates.map((d) => (
              <Fragment key={`${d}-subhead`}>
                <th className="px-2 py-1 border-l border-b border-gray-200 dark:border-gray-600 font-medium">
                  MRP
                </th>
                <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-600 font-medium">
                  DLP
                </th>
                <th className="px-2 py-1 border-b border-r border-gray-300 dark:border-gray-600 font-medium">
                  RLP
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {matrixData.rows.map((group) => {
            const groupKey = getGroupKey(group);
            const subRows = group.subRows || [];

            return subRows.map((subRow, subRowIdx) => (
              <tr
                key={`${groupKey}-${subRow.price_type}-${subRow.regionId || "national"}`}
                className="text-center hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {subRowIdx === 0 && (
                  <td
                    rowSpan={subRows.length}
                    className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-2 py-1 border-r border-gray-300 dark:border-gray-600 font-medium text-left align-top"
                  >
                    {getGroupLabel(group)}
                  </td>
                )}
                <td
                  className={`px-2 py-1 border-r border-gray-300 dark:border-gray-600 text-left whitespace-nowrap ${
                    subRow.price_type === "national"
                      ? "bg-blue-50 dark:bg-blue-900/20 font-semibold"
                      : ""
                  }`}
                  title={subRow.region?.name || subRow.region?.code || undefined}
                >
                  {subRow.label}
                  {subRow.mixedWarning && (
                    <span
                      className="ml-1 text-red-500"
                      title="Multiple prices land on the same date for this row"
                    >
                      ⚠
                    </span>
                  )}
                </td>
                {matrixData.dates.map((d) => {
                  const cell = subRow.pricesByDate[d];
                  const cellClass = getCellClassName(cell);
                  const cellTitle = getCellTitle(cell);
                  return (
                    <Fragment key={`${groupKey}-${subRow.regionId || "national"}-${d}`}>
                      <td
                        className={`px-2 py-1 border-l border-gray-200 dark:border-gray-600 ${cellClass}`}
                        title={cellTitle}
                      >
                        {cell ? Number(cell.mrp_price).toLocaleString() : "-"}
                      </td>
                      <td
                        className={`px-2 py-1 border-gray-200 dark:border-gray-600 ${cellClass}`}
                        title={cellTitle}
                      >
                        {cell ? Number(cell.dlp_price).toLocaleString() : "-"}
                      </td>
                      <td
                        className={`px-2 py-1 border-r border-gray-300 dark:border-gray-600 ${cellClass}`}
                        title={cellTitle}
                      >
                        {cell ? Number(cell.rlp_price).toLocaleString() : "-"}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-2 w-full">
          {/* page header with tabs */}
          <div className="flex justify-between w-full items-center border-b-2 py-4 flex-wrap gap-3">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Date Wise Pricing</h1>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setActiveTab("product")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "product"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                Product Wise
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("category")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "category"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                Category Wise
              </button>
            </div>
          </div>

          {/* filters (shared by both tabs) */}
          <div className="flex justify-start items-center flex-col gap-2 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                {activeTab === "product" ? (
                  <>
                    <Badge color="warning">
                      Products : {productMatrixTotalProducts}
                    </Badge>
                    <Badge color="warning">
                      Filtered Price Rows : {productMatrixTotalPriceRows}
                    </Badge>
                    <Badge color="warning">
                      Date Columns : {productMatrixData.dates?.length || 0}
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge color="warning">
                      Categories : {categoryMatrixTotalCategories}
                    </Badge>
                    <Badge color="warning">
                      Filtered Price Rows : {categoryMatrixTotalPriceRows}
                    </Badge>
                    <Badge color="warning">
                      Date Columns : {categoryMatrixData.dates?.length || 0}
                    </Badge>
                  </>
                )}
                <Badge color={selectedStatus === "active" ? "success" : selectedStatus === "inactive" ? "failure" : "info"}>
                  Showing : {STATUS_OPTIONS.find((s) => s.value === selectedStatus)?.label}
                </Badge>
              </div>

              <div className="flex justify-center w-full items-center gap-2 flex-wrap">
                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="categorySelect" value="Select Category" />
                  </div>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    id="categorySelect"
                  >
                    <option value="default">All</option>
                    {activeCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.code}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="regionSelect" value="Select Region" />
                  </div>
                  <Select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    id="regionSelect"
                  >
                    <option value="default">All Regions</option>
                    {sortedRegionList.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name || region.code}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="statusSelect" value="Price Status" />
                  </div>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    id="statusSelect"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-56">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="productCodeSelect"
                      value="Search by Product"
                    />
                  </div>
                  <TextInput
                    id="productCodeSelect"
                    placeholder="Search by Product Code / Name"
                    value={selectedProductCode}
                    onChange={(e) => setSelectedProductCode(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="w-56">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="effectiveDateSelect"
                      value="Filter By Effective Date"
                    />
                  </div>
                  <Datepicker
                    showShortcuts={true}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                  />
                </div>

                <div className="w-56 self-end">
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* pagination + download */}
          <div className="flex justify-between items-center w-full px-4 flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <Spinner size="sm" light />
              ) : (
                <HiDownload className="h-4 w-4" />
              )}
              {downloading
                ? "Downloading..."
                : `Download ${activeTab === "product" ? "Product Wise" : "Category Wise"} Data`}
            </button>

            <div className="flex overflow-x-auto sm:justify-center">
              {activeTab === "product" &&
                !productMatrixLoading &&
                productMatrixTotalProducts > productMatrixItemsPerPage && (
                  <Pagination
                    currentPage={productMatrixPage}
                    totalPages={productMatrixTotalPages}
                    onPageChange={setProductMatrixPage}
                    showIcons
                  />
                )}
              {activeTab === "category" &&
                !categoryMatrixLoading &&
                categoryMatrixTotalCategories >
                categoryMatrixItemsPerPage && (
                  <Pagination
                    currentPage={categoryMatrixPage}
                    totalPages={categoryMatrixTotalPages}
                    onPageChange={setCategoryMatrixPage}
                    showIcons
                  />
                )}
            </div>
          </div>

          {/* ==================== PRODUCT WISE MATRIX ==================== */}
          {activeTab === "product" && (
            <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
              {productMatrixLoading ? (
                <div className="w-full flex justify-center items-center py-16">
                  <Spinner aria-label="Loading data" size="xl" />
                </div>
              ) : productMatrixData?.rows?.length > 0 ? (
                renderMatrixTable(
                  productMatrixData,
                  (row) => row.product._id,
                  (row) =>
                    `${row.product?.name || ""}${row.product?.product_code ? ` (${row.product.product_code})` : ""
                    }`,
                )
              ) : (
                <div className="w-full text-center py-16 text-sm text-gray-500">
                  No data found
                </div>
              )}
            </div>
          )}

          {/* ==================== CATEGORY WISE MATRIX ==================== */}
          {activeTab === "category" && (
            <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
              {categoryMatrixLoading ? (
                <div className="w-full flex justify-center items-center py-16">
                  <Spinner aria-label="Loading data" size="xl" />
                </div>
              ) : categoryMatrixData?.rows?.length > 0 ? (
                renderMatrixTable(
                  categoryMatrixData,
                  (row) => row.category._id,
                  (row) => row.category?.name || row.category?.code,
                )
              ) : (
                <div className="w-full text-center py-16 text-sm text-gray-500">
                  No data found
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-[70vh] flex justify-center items-center">
          <h1 className="text-xl font-semibold text-red-500">Access Denied</h1>
        </div>
      )}
    </>
  );
};

export default CategoryPricing;