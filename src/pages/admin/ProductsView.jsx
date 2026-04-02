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
import moment from "moment-timezone";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { IoMdAddCircle } from "react-icons/io";
import { IoSyncCircleSharp } from "react-icons/io5";
import { MdDownloadForOffline, MdSimCardDownload } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  addProduct,
  AllSubBrandList,
  bulkUpload,
  getSuppliersList,
  updateProduct,
} from "../../api/api";
import { getProductsSync } from "../../api/externalApi";
import { getAllProductPaginated } from "../../api/productsApi";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBrands } from "../../redux/brandSlice";
import { fetchCategories } from "../../redux/categorySlice";
import { fetchCollections } from "../../redux/collectionSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { downloadFile } from "../../utils/downloadFile";

const ProductsView = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("default");
  const [selectedBrand, setSelectedBrand] = useState("default");
  const [selectedSubBrand, setSelectedSubBrand] = useState("default");
  const [selectedCollection, setSelectedCollection] = useState("default");
  const [openModal, setOpenModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [errorLog, setErrorLog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierList, setSupperlierList] = useState([]);
  const [subBrandList, setSubBrandList] = useState([]);

  // Pagination state
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [paginatedLoading, setPaginatedLoading] = useState(false);

  const itemsPerPage = 30;

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // Function to handle page change
  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  let fetchSuppliersPaginatedWithOutDebounce = async () => {
    try {
      const query = {
        page: 1,
        limit: 1000,
      };

      const response = await getSuppliersList(query);
      // console.log("response", response);
      setSupperlierList(
        response?.data?.data?.filter((supllier) => supllier.status === "active")
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch suppliers"
      );
    }
  };
  // Function to fetch paginated products
  const fetchProductsPaginatedWithoutDebounce = async () => {
    setPaginatedLoading(true);
    try {
      // Build query parameters
      const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
      };

      // Add filters if selected
      if (selectedStatus !== "default") {
        queryParams.status = selectedStatus === "active" ? "true" : "false";
      }

      if (selectedCategory !== "default") {
        queryParams.category = selectedCategory;
      }

      if (selectedBrand !== "default") {
        queryParams.brand = selectedBrand;
      }

      if (selectedCollection !== "default") {
        queryParams.collection = selectedCollection;
      }

      if (selectedSubBrand !== "default") {
        queryParams.subBrand = selectedSubBrand;
      }

      if (searchQuery.trim() !== "") {
        queryParams.search = searchQuery.trim();
      }

      // Add date range if selected
      if (dateRange.startDate && dateRange.endDate) {
        queryParams.startDate = dateRange.startDate;
        queryParams.endDate = dateRange.endDate;
      }

      const response = await getAllProductPaginated(queryParams);

      if (response.status === 200) {
        setPaginatedProducts(response.data);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
        setFilteredCount(response.pagination.filteredCount);
      } else {
        toast.error(response.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching paginated products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setPaginatedLoading(false);
    }
  };
  // Apply debounce to the fetch function
  const fetchProductsPaginated = useDebounce(
    fetchProductsPaginatedWithoutDebounce,
    500
  );

  let fetchSuppliersPaginated = useDebounce(
    fetchSuppliersPaginatedWithOutDebounce,
    500
  );

  // Add this utility function at the top of your component
  const sortByName = (list) =>
    [...list].sort((a, b) => a.name.localeCompare(b.name));

  // Then use it for all your lists
  const { categories: categoryList } = useSelector((state) => state.category);
  const sortedCategoryList = sortByName(categoryList);
  const activeCategories = sortedCategoryList.filter(
    (cat) => cat.status === true
  );

  const { brands: brandList } = useSelector((state) => state.brand);
  const sortedBrandList = sortByName(brandList);
  const activeBrands = sortedBrandList.filter((brand) => brand.status === true);

  const { collections: collectionList } = useSelector(
    (state) => state.collection
  );
  const sortedCollectionList = sortByName(collectionList);
  const activeCollections = sortedCollectionList.filter(
    (collection) => collection.status === true
  );

  // Update subBrandList sorting
  const sortedSubBrandList = sortByName(subBrandList);
  const activeSubBrands = sortedSubBrandList.filter(
    (subBrand) => subBrand.status === true
  );

  const fetchAllSubBrands = async () => {
    try {
      const res = await AllSubBrandList();
      if (res?.data?.data) {
        setSubBrandList(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch Sub-Brands, try again"
      );
    }
  };

  const handleResetFilter = () => {
    setSelectedCategory("default");
    setSelectedBrand("default");
    setSelectedCollection("default");
    setSelectedSubBrand("default");
    setSelectedStatus("active");
    setSearchQuery("");
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
    dispatch(fetchBrands());
    dispatch(fetchCategories());
    dispatch(fetchCollections());
    fetchProductsPaginated();
  };

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCategories());
    dispatch(fetchCollections());
    fetchAllSubBrands();
    fetchProductsPaginated();
    fetchSuppliersPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Effect for fetching paginated products when filters or pagination change
  useEffect(() => {
    fetchProductsPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedCategory,
    selectedBrand,
    selectedSubBrand,
    selectedCollection,
    selectedStatus,
    searchQuery,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    // Only reset if not already on page 1
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    selectedBrand,
    selectedSubBrand,
    selectedCollection,
    selectedStatus,
    searchQuery,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  let filteredProducts = [...paginatedProducts];

  //CSV Export Handler
  const handleExportToCSV = () => {
    // Build query parameters
    const queryParams = {};
    if (selectedStatus !== "default") {
      queryParams.status = selectedStatus === "active" ? "true" : "false";
    }
    if (selectedCategory !== "default") {
      queryParams.category = selectedCategory;
    }
    if (selectedBrand !== "default") {
      queryParams.brand = selectedBrand;
    }
    if (selectedCollection !== "default") {
      queryParams.collection = selectedCollection;
    }
    if (selectedSubBrand !== "default") {
      queryParams.subBrand = selectedSubBrand;
    }
    if (searchQuery) {
      queryParams.search = searchQuery;
    }
    if (dateRange.startDate && dateRange.endDate) {
      queryParams.startDate = dateRange.startDate;
      queryParams.endDate = dateRange.endDate;
    }

    // Build query string
    const params = new URLSearchParams(queryParams).toString();
    const url = `${BACKEND_URL}/api/v1/product/product-download?${params}`;

    // window.open(url, "_blank");

    // Use downloadFile utility for CSV export
    downloadFile({
      url: url,
      queryParams: params,
      fileName: "products.csv",
    });
  };

  // sort by product code
  // filteredProducts?.sort((a, b) => {
  //   const codeA = a?.product_code?.toLowerCase() || "";
  //   const codeB = b?.product_code?.toLowerCase() || "";
  //   return codeA.localeCompare(codeB);
  // });

  // sort according to size
  // const sizeOrder = getSize();
  // filteredProducts?.sort((a, b) => {
  //   const sizeA = a?.size ? sizeOrder.indexOf(a.size) : -1;
  //   const sizeB = b?.size ? sizeOrder.indexOf(b.size) : -1;
  //   return sizeA - sizeB;
  // });

  // first take the product according to the sku group code inside multiple arrays sort them then return them thn the filteredProducts
  // const multiProductArray = filteredProducts.reduce((acc, product) => {
  //   const skuGroupCode = product?.sku_group_id || "";
  //   if (!acc[skuGroupCode]) {
  //     acc[skuGroupCode] = [];
  //   }
  //   acc[skuGroupCode].push(product);
  //   return acc;
  // }, {});

  // // Sort each group by size
  // Object.keys(multiProductArray).forEach((skuGroupCode) => {
  //   multiProductArray[skuGroupCode].sort((a, b) => {
  //     const sizeOrder = getSize();
  //     const sizeA = a?.size ? sizeOrder.indexOf(a.size) : -1;
  //     const sizeB = b?.size ? sizeOrder.indexOf(b.size) : -1;
  //     return sizeA - sizeB;
  //   });
  // });

  // // Flatten the sorted groups back into a single array
  // filteredProducts = Object.values(multiProductArray).flat();

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Product Master</h1>
          </div>
        </div>

        {/* Compact Filters Section */}
        {/* Compact Filters + Actions */}
        <div className="w-full p-2">
          <Card className="w-full p-3 flex flex-col gap-3 text-xs">
            {/* Header Badges (compact) */}
            <div className="flex flex-wrap justify-center gap-2">
              <Badge color="warning" className="px-2 py-1">
                Total: {totalItems}
              </Badge>
              <Badge color="warning" className="px-2 py-1">
                Filtered: {filteredCount}
              </Badge>
            </div>

            {/* Filters (dense row, wraps on small screens) */}
            <div className="flex flex-wrap gap-2 justify-center items-center">
              {/* Search */}
              <div className="w-40">
                <Label
                  htmlFor="searchInput"
                  value="Search"
                  className="sr-only"
                />
                <TextInput
                  id="searchInput"
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sizing="sm"
                  className="h-8 text-xs"
                  aria-label="Search"
                />
              </div>

              {/* Status */}
              <div className="w-40">
                <Label
                  htmlFor="statusSelect"
                  value="Select Status"
                  className="sr-only"
                />
                <Select
                  id="statusSelect"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sizing="sm"
                  className="h-8 text-xs"
                  aria-label="Select Status"
                >
                  <option value="default">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              {/* Brand */}
              <div className="w-44">
                <Label
                  htmlFor="brandSelect"
                  value="Select Brand"
                  className="sr-only"
                />
                <Select
                  id="brandSelect"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  sizing="sm"
                  className="h-8 text-xs"
                  aria-label="Select Brand"
                >
                  <option value="default">All Brands</option>
                  {activeBrands?.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name} {brand.desc ? `(${brand.desc})` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Sub Brand */}
              {selectedBrand !== "default" && (
                <div className="w-44">
                  <Label
                    htmlFor="subBrandSelect"
                    value="Select Sub Brand"
                    className="sr-only"
                  />
                  <Select
                    id="subBrandSelect"
                    value={selectedSubBrand}
                    onChange={(e) => setSelectedSubBrand(e.target.value)}
                    sizing="sm"
                    className="h-8 text-xs"
                    aria-label="Select Sub Brand"
                  >
                    <option value="default">All Sub Brands</option>
                    {activeSubBrands
                      ?.filter((ele) => ele?.brandId?._id === selectedBrand)
                      ?.map((subBrand) => (
                        <option key={subBrand._id} value={subBrand._id}>
                          {subBrand.name}{" "}
                          {subBrand.desc ? `(${subBrand.desc})` : ""}
                        </option>
                      ))}
                  </Select>
                </div>
              )}

              {/* Category */}
              {selectedBrand !== "default" && (
                <div className="w-44">
                  <Label
                    htmlFor="categorySelect"
                    value="Select Category"
                    className="sr-only"
                  />
                  <Select
                    id="categorySelect"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sizing="sm"
                    className="h-8 text-xs"
                    aria-label="Select Category"
                  >
                    <option value="default">All Categories</option>
                    {activeCategories
                      ?.filter((ele) =>
                        ele?.brandId?.some(
                          (brand) => brand._id === selectedBrand
                        )
                      )
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </Select>
                </div>
              )}

              {/* Collection */}
              {selectedCategory !== "default" && (
                <div className="w-44">
                  <Label
                    htmlFor="collectionSelect"
                    value="Select Collection"
                    className="sr-only"
                  />
                  <Select
                    id="collectionSelect"
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    sizing="sm"
                    className="h-8 text-xs"
                    aria-label="Select Collection"
                  >
                    <option value="default">All Collections</option>
                    {activeCollections
                      ?.filter((ele) => ele?.cat_id?._id === selectedCategory)
                      ?.map((collection) => (
                        <option key={collection?._id} value={collection?._id}>
                          {collection?.name}
                        </option>
                      ))}
                  </Select>
                </div>
              )}

              <Button
                size="xs"
                color="blue"
                onClick={handleExportToCSV}
                aria-label="Download CSV"
                className="text-[11px]"
              >
                <span className="flex items-center gap-1">
                  <BiSolidFileExport size={16} />
                  <span className="hidden sm:inline">Download CSV</span>
                </span>
              </Button>

              <Button
                size="xs"
                color="success"
                onClick={handleResetFilter}
                aria-label="Reset and Refresh"
                className="text-[11px]"
              >
                <span className="flex items-center gap-1">
                  <RiRefreshFill size={16} />
                  <span className="hidden sm:inline">Reset & Refresh</span>
                </span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center w-full px-4">
          <div className="flex overflow-x-auto sm:justify-center">
            {!paginatedLoading && filteredCount > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showIcons
              />
            )}
          </div>
        </div>

        {/* product list */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          {" "}
          {paginatedLoading ? (
            <div
              className="w-full flex justify-center items-center"
              role="status"
            >
              <Spinner aria-label="Loading data" size="xl" />
            </div>
          ) : (
            <div className="overflow-x-auto w-full overflow-y-auto">
              <Table className="text-sm whitespace-nowrap bg-white dark:bg-gray-800">
                <Table.Head className="text-center text-sm bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 sticky left-0 z-20 bg-white dark:bg-gray-800">
                    SKU Group Code <br /> (Base Code)
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 sticky left-[140px] z-20 bg-white dark:bg-gray-800">
                    Product Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Product Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Size
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Color
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Pack
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Supplier
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Brand
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Sub Brand
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Category
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Collection
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    SKU Group Name
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Product Type
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Product Valuation Type
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    UOM
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Pieces in Box
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    HSN Code
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    CGST
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    SGST
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    IGST
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Base Point
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Created Date Time
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Updated Date Time
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Status
                  </Table.HeadCell>
                </Table.Head>

                <Table.Body className="divide-y bg-white dark:bg-gray-800">
                  {filteredProducts?.length > 0 ? (
                    filteredProducts?.map((product) => (
                      <Table.Row
                        key={product?._id}
                        className="text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Table.Cell className="px-2 py-1 text-gray-900 dark:text-gray-200 whitespace-nowrap sticky left-0 z-10 bg-white dark:bg-gray-800">
                          <UniqueCode
                            text={product?.sku_group_id}
                            codeName="SKU Group"
                          />
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1 text-gray-900 dark:text-gray-200 whitespace-nowrap sticky left-[140px] z-10 bg-white dark:bg-gray-800">
                          <UniqueCode
                            text={product?.product_code}
                            codeName="Product"
                          />
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.name}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.size}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.color}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.pack}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.supplier && (
                            <>
                              <UniqueCode
                                text={product?.supplier?.supplierCode}
                                codeName="Supplier"
                              />{" "}
                              ({product?.supplier?.supplierName}
                              {product?.supplier?.city
                                ? " - " + product?.supplier?.city
                                : ""}
                              )
                            </>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.brand && (
                            <>
                              <UniqueCode
                                text={product?.brand?.code}
                                codeName="Brand"
                              />{" "}
                              ({product?.brand?.desc})
                            </>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.subBrand && (
                            <>
                              <UniqueCode
                                text={product?.subBrand?.code}
                                codeName="Sub Brand"
                              />{" "}
                              ({product?.subBrand?.desc})
                            </>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.cat_id && (
                            <>
                              <UniqueCode
                                text={product?.cat_id?.code}
                                codeName="Category"
                              />{" "}
                              ({product?.cat_id?.name})
                            </>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.collection_id && (
                            <>
                              <UniqueCode
                                text={product?.collection_id?.code}
                                codeName="Collection"
                              />{" "}
                              ({product?.collection_id?.name})
                            </>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.sku_group__name}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.product_type}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.product_valuation_type}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.uom}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.no_of_pieces_in_a_box}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          <UniqueCode
                            text={product?.product_hsn_code}
                            codeName="HSN"
                          />
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.cgst}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.sgst}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.igst}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.base_point}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.createdAt
                            ? moment(product?.createdAt)
                                .tz("Asia/Kolkata")
                                .format("DD-MM-YYYY hh:mm A")
                            : ""}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {product?.updatedAt
                            ? moment(product?.updatedAt)
                                .tz("Asia/Kolkata")
                                .format("DD-MM-YYYY hh:mm A")
                            : ""}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          <StatusIndicator status={product.status} />
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell
                        colSpan={"100%"}
                        className="text-center px-2 py-1 text-sm"
                      >
                        No products found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsView;
