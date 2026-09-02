import {
  Badge,
  Card,
  Label,
  Pagination,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import {
  getCategoryDateWiseMatrix,
  getProductDateWiseMatrix,
} from "../../api/api";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchCategories } from "../../redux/categorySlice";
import { getPagePermission } from "../../utils/permissionHelper";

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

  // -------------------- TAB STATE --------------------
  const [activeTab, setActiveTab] = useState("product"); // "product" | "category"

  // -------------------- SHARED FILTERS --------------------
  const [selectedCategory, setSelectedCategory] = useState("default");
  const [selectedProductCode, setSelectedProductCode] = useState("");
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
    dateRange,
  ]);

  // Reset pagination for both tabs whenever a filter changes
  useEffect(() => {
    setProductMatrixPage(1);
    setCategoryMatrixPage(1);
  }, [selectedCategory, selectedProductCode, dateRange]);

  // -------------------- SHARED MATRIX TABLE RENDERER --------------------
  const renderMatrixTable = (matrixData, getRowKey, getRowLabel) => (
    <div className="overflow-x-auto w-full">
      <Table className="text-xs whitespace-nowrap bg-white dark:bg-gray-800">
        <Table.Head className="text-center text-xs bg-gray-50 dark:bg-gray-700">
          <Table.HeadCell className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-700 px-2 py-1 border-r border-gray-300 dark:border-gray-600">
            {activeTab === "product" ? "Product" : "Category"}
          </Table.HeadCell>
          {matrixData.dates.map((d) => (
            <Table.HeadCell
              key={d}
              colSpan={3}
              className="px-2 py-1 border-l border-gray-300 dark:border-gray-600"
            >
              w.e.f {moment(d).format("DD.MM.YYYY")}
            </Table.HeadCell>
          ))}
        </Table.Head>
        <Table.Head className="text-center text-xs bg-gray-50 dark:bg-gray-700">
          <Table.HeadCell className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-700 px-2 py-1 border-r border-gray-300 dark:border-gray-600" />
          {matrixData.dates.map((d) => (
            <Table.HeadCell
              key={`${d}-subhead`}
              colSpan={3}
              className="px-0 py-0 border-l border-gray-300 dark:border-gray-600"
            >
              <div className="grid grid-cols-3">
                <span className="px-2 py-1 border-r border-gray-200 dark:border-gray-600">
                  MRP
                </span>
                <span className="px-2 py-1 border-r border-gray-200 dark:border-gray-600">
                  DLP
                </span>
                <span className="px-2 py-1">RLP</span>
              </div>
            </Table.HeadCell>
          ))}
        </Table.Head>
        <Table.Body className="divide-y bg-white dark:bg-gray-800">
          {matrixData.rows.map((row) => (
            <Table.Row
              key={getRowKey(row)}
              className="text-center hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Table.Cell className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-2 py-1 border-r border-gray-300 dark:border-gray-600 font-medium text-left">
                {getRowLabel(row)}
                {row.mixedWarning && (
                  <span
                    className="ml-1 text-red-500"
                    title="Multiple prices land on the same date for this row"
                  >
                    ⚠
                  </span>
                )}
              </Table.Cell>
              {matrixData.dates.map((d) => {
                const cell = row.pricesByDate[d];
                return (
                  <Table.Cell
                    key={`${getRowKey(row)}-${d}`}
                    colSpan={3}
                    className="px-0 py-0 border-l border-gray-300 dark:border-gray-600"
                  >
                    <div
                      className={`grid grid-cols-3 ${cell?.isCarried
                          ? "bg-orange-50 dark:bg-orange-900/20"
                          : ""
                        }`}
                      title={
                        cell?.isCarried
                          ? "Carried forward — no change on this date"
                          : cell
                            ? "Changed on this date"
                            : ""
                      }
                    >
                      <span className="px-2 py-1 border-r border-gray-200 dark:border-gray-600">
                        {cell ? Number(cell.mrp_price).toLocaleString() : "-"}
                      </span>
                      <span className="px-2 py-1 border-r border-gray-200 dark:border-gray-600">
                        {cell ? Number(cell.dlp_price).toLocaleString() : "-"}
                      </span>
                      <span className="px-2 py-1">
                        {cell ? Number(cell.rlp_price).toLocaleString() : "-"}
                      </span>
                    </div>
                  </Table.Cell>
                );
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-2 w-full">
          {/* page header with tabs */}
          <div className="flex justify-between w-full items-center border-b-2 py-4 flex-wrap gap-3">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Date Wise Pricing Matrix</h1>
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

          {/* pagination */}
          <div className="flex justify-end items-center w-full px-4 ">
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