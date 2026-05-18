import { useEffect, useState } from "react";
import {
  Label,
  Select,
  Spinner,
  Table,
  TextInput,
  Pagination,
  Button,
  Badge,
  Checkbox,
} from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchBrands } from "../../redux/brandSlice";
// import { fetchCategories } from "../../redux/categorySlice";
// import { fetchCollections } from "../../redux/collectionSlice";
// import { useDebounce } from "../../hooks/useDebounce";
// import UniqueCode from "../../assets/common/UniqueCode";
// import StatusIndicator from "../../assets/common/StatusIndicator";
// import { fetchBrands } from "../redux/brandSlice";
// import { fetchCategories } from "../redux/categorySlice";
// import { fetchCollections } from "../redux/collectionSlice";
import { useDebounce } from "../hooks/useDebounce";
import UniqueCode from "../assets/common/UniqueCode";
import StatusIndicator from "../assets/common/StatusIndicator";
import { AllSubBrandList, getAllProductPaginated } from "../api/api";

import toast from "react-hot-toast";
import { fetchBrands } from "../redux/brandSlice";
import { fetchCategories } from "../redux/categorySlice";
import { fetchCollections } from "../redux/collectionSlice";

const PriceProductModal = ({ setProductId, productId, setPriceModal }) => {
  //   const dispatch = useDispatch();

  //   // Filters & UI states
  //   const [searchQuery, setSearchQuery] = useState("");
  //   const [selectedStatus, setSelectedStatus] = useState("default");
  //   const [selectedBrand, setSelectedBrand] = useState("default");
  //   const [selectedSubBrand, setSelectedSubBrand] = useState("default");
  //   const [selectedCategory, setSelectedCategory] = useState("default");
  //   const [selectedCollection, setSelectedCollection] = useState("default");
  //   const [currentPage, setCurrentPage] = useState(1);
  //   const itemsPerPage = 10;

  //   const debouncedSearch = useDebounce(searchQuery, 500);

  //   // Dummy data - replace with actual Redux or API fetched data
  //   const paginatedProducts = useSelector((state) => state.product.list); // adjust as needed
  //   const brandList = useSelector((state) => state.brand.list);
  //   const categoryList = useSelector((state) => state.category.list);
  //   const collectionList = useSelector((state) => state.collection.list);
  //   const activeSubBrands = []; // fetch if available

  //   const [paginatedLoading, setPaginatedLoading] = useState(false);
  //   const [selectedProductIds, setSelectedProductIds] = useState([]);

  //   const totalPages = Math.ceil(paginatedProducts?.length / itemsPerPage);
  //   const filteredCount = paginatedProducts?.length;

  //   useEffect(() => {
  //     dispatch(fetchBrands());
  //     dispatch(fetchCategories());
  //     dispatch(fetchCollections());
  //   }, []);

  //   const handleCheckboxChange = (productId) => {
  //     setSelectedProductIds((prev) =>
  //       prev.includes(productId)
  //         ? prev.filter((id) => id !== productId)
  //         : [...prev, productId]
  //     );
  //   };

  const dispatch = useDispatch();

  //   const handleSelectAll = (e) => {
  //     const allIds = paginatedProducts.map((p) => p._id);
  //     setSelectedProductIds(e.target.checked ? allIds : []);
  //   };

  const { brands: brandList } = useSelector((state) => state.brand);
  const activeBrands = brandList
    .filter((brand) => brand.status === true)
    .sort((a, b) => a.name.localeCompare(b.name));

  const { categories: categoryList } = useSelector((state) => state.category);
  const activeCategories = categoryList
    .filter((cat) => cat.status === true)
    .sort((a, b) => a.name.localeCompare(b.name));

  const { collections: collectionList } = useSelector(
    (state) => state.collection
  );
  const activeCollections = collectionList
    .filter((collection) => collection.status === true)
    .sort((a, b) => a.name.localeCompare(b.name));

  const [paginatedLoading, setPaginatedLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState("");
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedBrand, setSelectedBrand] = useState("default");
  const [selectedSubBrand, setSelectedSubBrand] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("default");
  const [selectedCollection, setSelectedCollection] = useState("default");
  const [subBrandList, setSubBrandList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const activeSubBrands = subBrandList
    .filter((subBrand) => subBrand.status === true)
    .sort((a, b) => a.name.localeCompare(b.name));

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

  useEffect(() => {
    setSelectedProductIds([]);
  }, [
    selectedStatus,
    selectedBrand,
    selectedSubBrand,
    selectedCategory,
    selectedCollection,
  ]);

  const fetchProductsPaginatedWithoutDebounce = async () => {
    setPaginatedLoading(true);
    try {
      // Build query parameters
      const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
        status: "true",
      };

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

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCategories());
    dispatch(fetchCollections());
    fetchAllSubBrands();
    fetchProductsPaginated();
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

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  console.log(brandList, "brandList");

  const handleSelectAll = (e) => {
    const allIds = paginatedProducts.map((p) => p._id);
    setSelectedProductIds(e.target.checked ? allIds : []);
  };

  const handleCheckboxChange = (productData) => {
    setProductId(productData);
    setPriceModal(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full p-4 bg-gray-800 text-white dark:bg-gray-800 dark:text-white">
      {/* Filters */}
      <div className="w-full flex flex-wrap justify-center items-center gap-2">
        {" "}
        <Badge color="warning">Total Products : {totalItems} </Badge>
        <Badge color="warning">Filtered Products : {filteredCount} </Badge>
      </div>
      <div className="flex justify-start w-full items-center gap-2 flex-wrap">
        <div className="w-56">
          <Label htmlFor="searchInput" value="Search" className="text-white dark:text-white" />
          <TextInput
            id="searchInput"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sizing={"sm"}
          />
        </div>
        <div className="w-56">
          <Label htmlFor="brandSelect" value="Select Brand" className="text-white dark:text-white" />
          <Select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            id="brandSelect"
            sizing={"sm"}
          >
            <option value="default">All</option>
            {activeBrands?.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name} ({brand.desc})
              </option>
            ))}
          </Select>
        </div>
        <div className="w-56">
          <Label htmlFor="subBrandSelect" value="Select Sub Brand" className="text-white dark:text-white" />
          <Select
            value={selectedSubBrand}
            onChange={(e) => setSelectedSubBrand(e.target.value)}
            id="subBrandSelect"
            sizing={"sm"}
          >
            <option value="default">All</option>
            {selectedBrand !== "default" &&
              activeSubBrands
                ?.filter((ele) => ele?.brandId?._id == selectedBrand)
                ?.map((sb) => (
                  <option key={sb._id} value={sb._id}>
                    {sb.name} ({sb.desc})
                  </option>
                ))}
            {selectedBrand === "default" &&
              activeSubBrands.map((sb) => (
                <option key={sb._id} value={sb._id}>
                  {sb.name} ({sb.desc})
                </option>
              ))}
          </Select>
        </div>
        <div className="w-56">
          <Label htmlFor="categorySelect" value="Select Category" className="text-white dark:text-white" />
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            id="categorySelect"
            sizing={"sm"}
          >
            <option value="default">All</option>
            {activeCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-56">
          <Label htmlFor="collectionSelect" value="Select Collection" className="text-white dark:text-white" />
          <Select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            id="collectionSelect"
            sizing={"sm"}
          >
            <option value="default">All</option>
            {activeCollections
              ?.filter(
                (col) =>
                  selectedCategory === "default" ||
                  col?.cat_id?._id === selectedCategory
              )
              .map((col) => (
                <option key={col?._id} value={col?._id}>
                  {col?.name}
                </option>
              ))}
          </Select>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end w-full">
        {!paginatedLoading && filteredCount > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showIcons
            sizing={"sm"}
          />
        )}
      </div>

      {/* Table */}
      {paginatedLoading ? (
        <div className="w-full flex justify-center items-center" role="status">
          <Spinner aria-label="Loading data" size="xl" />
        </div>
      ) : (
        <div className="overflow-x-auto w-full mt-2">
          <Table className="text-sm whitespace-nowrap bg-white dark:bg-gray-800">
            <Table.Head className="text-center text-sm bg-white dark:bg-gray-800 border-b-2 border-gray-700 dark:border-gray-700">
              <Table.HeadCell className="px-2 py-1 sticky left-0 bg-white dark:bg-gray-800 border-r border-gray-700 dark:border-gray-700">Select</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1 whitespace-nowrap">Product Code</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">Product Name</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">Brand</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">Sub Brand</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">Category</Table.HeadCell>
              <Table.HeadCell className="px-2 py-1">Collection</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y bg-white dark:bg-gray-800">
              {paginatedProducts.map((product) => (
                <Table.Row
                  key={product._id}
                  className="hover-row text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Table.Cell className="px-2 py-1 text-gray-900 dark:text-gray-200 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
                    <Checkbox
                      checked={productId?._id === product._id}
                      onChange={() => handleCheckboxChange(product)}
                      size={"sm"}
                    />
                  </Table.Cell>
                  <Table.Cell className="px-2 py-1 text-gray-900 dark:text-gray-200 whitespace-nowrap">
                    <UniqueCode
                      text={product.product_code}
                      codeName="Product"
                    />
                  </Table.Cell>
                  <Table.Cell className="px-2 py-1">{product.name}</Table.Cell>
                  <Table.Cell className="px-2 py-1">{product?.brand?.name}</Table.Cell>
                  <Table.Cell className="px-2 py-1">{product?.subBrand?.name}</Table.Cell>
                  <Table.Cell className="px-2 py-1">{product?.cat_id?.name}</Table.Cell>
                  <Table.Cell className="px-2 py-1">{product?.collection_id?.name}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Selected Summary (Optional) */}
      {selectedProductIds.length > 0 && (
        <div className="w-full text-right text-sm text-gray-300 mt-2">
          Selected Products: {selectedProductIds.length}
        </div>
      )}
    </div>
  );
};

export default PriceProductModal;
