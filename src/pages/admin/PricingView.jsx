import axios from "axios";
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
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import { pricingStatusBulkUpdate } from "../../api/api";
import { checkDateForPrice } from "../../assets/common/DateChecking";
import UniqueCode from "../../assets/common/UniqueCode";
import { BACKEND_URL } from "../../constants";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBrands } from "../../redux/brandSlice";
import { fetchCategories } from "../../redux/categorySlice";
import { fetchCollections } from "../../redux/collectionSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { BiSolidFileExport } from "react-icons/bi";
import { downloadFile } from "../../utils/downloadFile";

const PricingView = () => {
  const dispatch = useDispatch();

  const { regions } = useSelector((state) => state.region);

  const { distributors } = useSelector((state) => state.distributors);

  const sortByName = (list) =>
    [...list].sort((a, b) => a.name.localeCompare(b.name));

  const { categories: categoryList } = useSelector((state) => state.category);

  const { brands: brandList } = useSelector((state) => state.brand);

  const sortedBrandList = sortByName(brandList);
  const sortedCategoryList = sortByName(categoryList);
  const activeBrands = sortedBrandList.filter((brand) => brand.status === true);
  const activeCategories = sortedCategoryList.filter(
    (category) => category.status === true
  );

  const { collections: collectionList } = useSelector(
    (state) => state.collection
  );

  const sortedCollectionList = sortByName(collectionList);
  const activeCollections = sortedCollectionList.filter(
    (collection) => collection.status === true
  );

  const [pricing, setPricing] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [activePricingListCount, setActivePricingListCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const [productId, setProductId] = useState("");

  const [selectedPriceCode, setSelectedPriceCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("default");
  const [selectedBrand, setSelectedBrand] = useState("default");
  const [selectedCollection, setSelectedCollection] = useState("default");
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectDistributor, setSelectDistributor] = useState("default");
  const [selectedPriceType, setSelctedPriceType] = useState("default");
  const [selectedProductCode, setSelectedProductCode] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedProduct, setSelectedProduct] = useState("default");
  const [errorLog, setErrorLog] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [createdAtRange, setCreatedAtRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [expiresAtRange, setExpiresAtRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [priceModal, setPriceModal] = useState(false);

  const onPageChange = (page) => setCurrentPage(page);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleCreatedAtRangeChange = (range) => {
    setCreatedAtRange(range);
  };

  const handleExpiresAtRangeChange = (range) => {
    setExpiresAtRange(range);
  };

  let fetchPricingPaginatedWithOutDebounce = async () => {
    try {
      setPricingLoading(true);
      const query = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (selectedProduct !== "default") {
        query.selectedProduct = selectedProduct;
      }

      if (selectedProductCode.trim() !== "") {
        query.productCode = selectedProductCode.trim();
      }

      if (selectedPriceCode.trim() !== "") {
        query.priceCode = selectedPriceCode.trim();
      }

      if (selectedCategory !== "default") {
        query.selectedCategory = selectedCategory;
      }

      if (selectedBrand !== "default") {
        query.selectedBrand = selectedBrand;
      }

      if (selectedCollection !== "default") {
        query.selectedCollection = selectedCollection;
      }

      if (selectedRegion !== "default") {
        query.selectedRegion = selectedRegion;
      }

      if (selectDistributor !== "default") {
        query.selectDistributor = selectDistributor;
      }

      if (selectedPriceType !== "default") {
        query.selectedPriceType = selectedPriceType;
      }

      if (selectedStatus !== "default") {
        query.selectedStatus = selectedStatus === "active" ? true : false;
      }

      if (dateRange.startDate && dateRange.endDate) {
        query.dateRange = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        };
      }

      if (createdAtRange.startDate && createdAtRange.endDate) {
        query.createdAtRange = {
          startDate: createdAtRange.startDate,
          endDate: createdAtRange.endDate,
        };
      }

      if (expiresAtRange.startDate && expiresAtRange.endDate) {
        query.expiresAtRange = {
          startDate: expiresAtRange.startDate,
          endDate: expiresAtRange.endDate,
        };
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/price/all-list-paginated`,
        {
          params: query,
        }
      );

      setPricing(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setActivePricingListCount(response?.data?.pagination?.totalActivePrices);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalItems);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch pricing"
      );
    } finally {
      setPricingLoading(false);
    }
  };

  let fetchPricingPaginated = useDebounce(
    fetchPricingPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    pricingStatusBulkUpdate();
    setSelectedStatus("active");
    setSelectedCategory("default");
    setSelectedBrand("default");
    setSelectedCollection("default");
    setSelectedRegion("default");
    setSelectDistributor("default");
    setSelctedPriceType("default");
    setSelectedProduct("default");
    setSelectedProductCode("");
    setSelectedPriceCode("");
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setExpiresAtRange({
      startDate: null,
      endDate: null,
    });
    setCreatedAtRange({
      startDate: null,
      endDate: null,
    });
    // fetchPricingPaginated();
    // dispatch(fetchProducts());
    dispatch(fetchRegions());
    dispatch(fetchDistributors());
  };

  useEffect(() => {
    // fetchPricingPaginated();
    // dispatch(fetchProducts());
    dispatch(fetchRegions());
    dispatch(fetchDistributors());
    dispatch(fetchCategories());
    dispatch(fetchCollections());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    fetchPricingPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedCategory,
    selectedBrand,
    selectedCollection,
    selectedRegion,
    selectedProduct,
    selectedProductCode,
    selectedPriceCode,
    selectDistributor,
    selectedPriceType,
    selectedStatus,
    dateRange,
    createdAtRange,
    expiresAtRange,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedBrand,
    selectedCollection,
    selectedRegion,
    selectDistributor,
    selectedPriceType,
    selectedStatus,
    dateRange,
    createdAtRange,
    expiresAtRange,
    selectedProductCode,
    selectedPriceCode,
  ]);

  console.log(productId, "productId");

  // export to csv
  const handleExportToCSV = () => {
    const queryParams = {};
    if (selectedProduct !== "default")
      queryParams.selectedProduct = selectedProduct;
    if (selectedProductCode && selectedProductCode.trim() !== "")
      queryParams.productCode = selectedProductCode.trim();
    if (selectedCategory !== "default")
      queryParams.selectedCategory = selectedCategory;
    if (selectedBrand !== "default") queryParams.selectedBrand = selectedBrand;
    if (selectedCollection !== "default")
      queryParams.selectedCollection = selectedCollection;
    if (selectedRegion !== "default")
      queryParams.selectedRegion = selectedRegion;
    if (selectDistributor !== "default")
      queryParams.selectDistributor = selectDistributor;
    if (selectedPriceType !== "default")
      queryParams.selectedPriceType = selectedPriceType;
    if (selectedStatus !== "default")
      queryParams.selectedStatus = selectedStatus === "active" ? true : false;
    if (dateRange.startDate && dateRange.endDate) {
      queryParams.dateRange = JSON.stringify({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }
    if (createdAtRange.startDate && createdAtRange.endDate) {
      queryParams.createdAtRange = JSON.stringify({
        startDate: createdAtRange.startDate,
        endDate: createdAtRange.endDate,
      });
    }
    if (expiresAtRange.startDate && expiresAtRange.endDate) {
      queryParams.expiresAtRange = JSON.stringify({
        startDate: expiresAtRange.startDate,
        endDate: expiresAtRange.endDate,
      });
    }

    const params = new URLSearchParams(queryParams).toString();
    const url = `${BACKEND_URL}/api/v1/price/price-download?${params}`;
   // window.open(url, "_blank");
    downloadFile({
      url,
      queryParams: queryParams,
      fileName: "PriceReport",
      showToast: false,
    });
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-2 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Pricing Master</h1>
          </div>
        </div>

        {/* filters */}
        <div className="flex justify-start items-center flex-col gap-2 w-full p-4">
          <Card className="w-full flex justify-center items-center flex-col">
            {/* filter card header */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">Total Count : {totalItems} </Badge>
              <Badge color="warning">
                Active Count : {activePricingListCount}
              </Badge>
              <Badge color="warning">Filtered Count : {filteredCount}</Badge>
            </div>
            <div className="flex justify-center w-full items-center gap-2 flex-wrap">
              {/* filter : 1 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="statusSelect" value="Select Status" />
                </div>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  id="statusSelect"
                  required
                >
                  <option value="default">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              {/** filter 2 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="priceSelect" value="Select Price Type" />
                </div>
                <Select
                  value={selectedPriceType}
                  onChange={(e) => setSelctedPriceType(e.target.value)}
                  id="priceSelect"
                  required
                >
                  <option value="default">All</option>
                  <option value="regional">Regional</option>
                  <option value="distributor">Distributor</option>
                  <option value="national">National</option>
                </Select>
              </div>
              {/** filter 3 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="regionSelect" value="Select Region" />
                </div>
                <Select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  id="regionSelect"
                  required
                >
                  <option value="default">All</option>
                  {regions.map((option, index) => (
                    <option key={index} value={option?._id}>
                      {option?.name} ({option?.code})
                    </option>
                  ))}
                </Select>
              </div>
              {/* filter : 4 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="disSelect" value="Select Distributor" />
                </div>
                <Select
                  value={selectDistributor}
                  onChange={(event) => setSelectDistributor(event.target.value)}
                >
                  <option value="default">All</option>
                  {distributors?.map((option, index) => (
                    <option key={index} value={option?._id}>
                      {option?.name} ({option?.dbCode})
                    </option>
                  ))}
                </Select>
              </div>
              {/* filter : 5 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="brandSelect" value="Select Brand" />
                </div>
                <Select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  id="brandSelect"
                  required
                >
                  <option value="default">All</option>
                  {activeBrands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name} ({brand.desc})
                    </option>
                  ))}
                </Select>
              </div>
              {/* filter : 6 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="categorySelect" value="Select Category" />
                </div>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  id="categorySelect"
                  required
                >
                  <option value="default">All</option>
                  {activeCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.code}
                    </option>
                  ))}
                </Select>
              </div>
              {/* filter : 7 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="collectionSelect" value="Select Collection" />
                </div>
                <Select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  id="collectionSelect"
                  required
                >
                  <option value="default">All</option>
                  {activeCollections.map((collection) => (
                    <option key={collection._id} value={collection._id}>
                      {collection.name} ({collection.code})
                    </option>
                  ))}
                </Select>
              </div>
              {/* filter : 8 */}
              {/* <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="productionSelect" value="Select Product" />
                </div>
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  id="productionSelect"
                  required
                >
                  <option value="default">All</option>
                  {productList.map((ele) => (
                    <option key={ele?._id} value={ele?._id}>
                      {`${ele?.name} (${ele?.product_code})`}
                    </option>
                  ))}
                </Select>
              </div> */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="productionSelect" value="Select Product" />
                </div>
                {/* input search field with product code search */}
                <TextInput
                  id="productionSelect"
                  placeholder="Search by Product Code"
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="priceCodeSelect" value="Price Code" />
                </div>
                <TextInput
                  id="priceCodeSelect"
                  placeholder="Search by Price Code"
                  value={selectedPriceCode}
                  onChange={(e) => setSelectedPriceCode(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* filter : 9 */}
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
                  inputClassName={
                    "w-full rounded-md focus:ring-0 z-40 font-normal text-white bg-gray-800 dark:bg-gray-800 border-gray-600 dark:border-gray-600"
                  }
                />
              </div>
              {/* filter : 10 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label
                    htmlFor="createdAtSelect"
                    value="Filter By Created Date"
                  />
                </div>
                <Datepicker
                  showShortcuts={true}
                  value={createdAtRange}
                  onChange={handleCreatedAtRangeChange}
                />
              </div>
              {/* filter : 11 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label
                    htmlFor="expiresAtSelect"
                    value="Filter By Expires Date"
                  />
                </div>
                <Datepicker
                  showShortcuts={true}
                  value={expiresAtRange}
                  onChange={handleExpiresAtRangeChange}
                />
              </div>
            </div>
            {/* btns */}
            <div className="flex justify-center w-full items-center gap-2 flex-wrap">
              <Button
                className={`text-xs`}
                size="sm"
                color="blue"
                onClick={() => {
                  handleExportToCSV();
                }}
              >
                <span className="flex justify-center items-center gap-2">
                  <BiSolidFileExport size={20} />
                  CSV Download
                </span>
              </Button>

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
          </Card>
        </div>

        {/* paginated table */}
        <div className="flex justify-end items-center w-full px-4 ">
          <div className="flex overflow-x-auto sm:justify-center">
            {!pricingLoading && filteredCount > itemsPerPage && (
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
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <div className="overflow-x-auto w-full overflow-y-auto">
            <Table className="text-sm whitespace-nowrap bg-white dark:bg-gray-800">
              <Table.Head className="text-center text-sm bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                {/* Sticky Column 1 */}
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 sticky left-0 bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
                  Price Code
                </Table.HeadCell>

                {/* Sticky Column 2 */}
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 sticky left-[99px] bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
                  Product Code
                </Table.HeadCell>

                {/* Sticky Column 3 */}
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 sticky left-[280px] bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
                  Price Type
                </Table.HeadCell>

                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Region Code
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Region Name
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Distributor Code
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Distributor Name
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Product Name
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Brand
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Category
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  UOM
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Pieces in a box
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  MRP
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  DLP
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  RLP
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Created Date
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Effective Date
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Expires At
                </Table.HeadCell>
                <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                  Days Left
                </Table.HeadCell>
              </Table.Head>

              <Table.Body className="divide-y bg-white dark:bg-gray-800">
                {pricingLoading ? (
                  <Table.Row>
                    <Table.Cell
                      colSpan={"100%"}
                      className="text-center px-2 py-1 text-sm"
                    >
                      <div
                        className="w-full flex justify-center items-center"
                        role="status"
                      >
                        <Spinner aria-label="Loading data" size="xl" />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : pricing?.length > 0 ? (
                  pricing?.map((price, index) => {
                    const { remainingDays } = checkDateForPrice(
                      price?.effective_date
                    );
                    return (
                      <Table.Row
                        key={index}
                        className="hover-row text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {/* Sticky Column 1 */}
                        <Table.Cell className="px-2 py-1 text-gray-900 dark:text-gray-200 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
                          <UniqueCode text={price?.code} codeName="Price" />
                        </Table.Cell>

                        {/* Sticky Column 2 */}
                        <Table.Cell className="px-2 py-1 text-gray-900 dark:text-gray-200 whitespace-nowrap sticky left-[99px] bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
                          <UniqueCode
                            text={price?.productId?.product_code}
                            codeName="Product"
                          />
                        </Table.Cell>

                        {/* Sticky Column 3 */}
                        <Table.Cell className="px-2 py-1 text-gray-900 dark:text-gray-200 whitespace-nowrap sticky left-[280px] bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700">
                          {price?.price_type}
                        </Table.Cell>

                        <Table.Cell className="px-2 py-1">
                          <UniqueCode
                            text={price?.regionId?.code}
                            codeName="Region"
                          />
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.regionId?.name ?? ""}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          <UniqueCode
                            text={price?.distributorId?.dbCode}
                            codeName="DB"
                          />
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.distributorId?.name ?? ""}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.productId?.name}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.productId?.brand?.name} (
                          {price?.productId?.brand?.desc})
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.productId?.cat_id?.name}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.productId?.uom}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.productId?.no_of_pieces_in_a_box}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {Number(price.mrp_price).toLocaleString()}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {Number(price.dlp_price)?.toLocaleString() || ""}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {Number(price.rlp_price)?.toLocaleString() || ""}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {moment(price?.createdAt)
                            .tz("Asia/Kolkata")
                            .format("YYYY-MM-DD hh:mm A")}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.effective_date
                            ? moment(price?.effective_date)
                                .tz("Asia/Kolkata")
                                .format("DD-MM-YYYY")
                            : ""}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1">
                          {price?.expiresAt
                            ? moment(price?.expiresAt)
                                .tz("Asia/Kolkata")
                                .format("DD-MM-YYYY  hh:mm A")
                            : ""}
                        </Table.Cell>
                        <Table.Cell className="px-2 py-1 font-bold">
                          {remainingDays < 0 && price?.status === true ? (
                            <span className="text-blue-500">{`Applied ${Math.abs(
                              remainingDays
                            )} days ago`}</span>
                          ) : remainingDays < 0 && price?.status === false ? (
                            <span className="text-red-500">Expired</span>
                          ) : remainingDays === 0 ? (
                            <span className="text-blue-500">Applied today</span>
                          ) : (
                            <span className="text-yellow-500">{`${remainingDays} days left`}</span>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                ) : (
                  <Table.Row>
                    <Table.Cell
                      colSpan={"100%"}
                      className="text-center px-2 py-1 text-sm"
                    >
                      No data found
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingView;
