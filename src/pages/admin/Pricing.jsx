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
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { MdDownloadForOffline, MdSimCardDownload } from "react-icons/md";
import { RiPassExpiredLine, RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import {
  addPricing,
  bulkUpload,
  bulkUpload2,
  pricingStatusBulkUpdate,
  updatePricing,
} from "../../api/api";
import { checkDateForPrice } from "../../assets/common/DateChecking";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import PriceProductModal from "../../components/PriceProductModal";
import { BACKEND_URL } from "../../constants";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchBrands } from "../../redux/brandSlice";
import { fetchCategories } from "../../redux/categorySlice";
import { fetchCollections } from "../../redux/collectionSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { getPagePermission } from "../../utils/permissionHelper";
import { downloadFile } from "../../utils/downloadFile";

const Pricing = () => {
  const dispatch = useDispatch();

  const { regions } = useSelector((state) => state.region);

  const { distributors } = useSelector((state) => state.distributors);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

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

  const [openModal, setOpenModal] = useState(false);
  const [productId, setProductId] = useState("");
  const [mrpPrice, setMrpPrice] = useState("");
  const [dlpPrice, setDlpPrice] = useState("");
  const [rlpPrice, setRlpPrice] = useState("");
  const [regionId, setRegionId] = useState("");
  const [distributorId, setDistributorId] = useState("");
  const [modalMode, setModalMode] = useState("add");
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [priceType, setPriceType] = useState("regional");
  const [effectiveDate, setEffectiveDate] = useState(new Date());
  const [priceInactiveModal, setPriceInactiveModal] = useState(false);
  const [inactiveType, setInactiveType] = useState("");

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
  useEffect(() => {
    if (permissionState) {
      const permission = getPagePermission(permissionState, "pricing");
      setPagePermission(permission);
    }
  }, [permissionState]);

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

  const { openConfirmationModel } = useContext(ConfirmationModelContext);

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

  const validate = () => {
    // Handle productId validation - it can be an object with _id or a string
    const productIdValue =
      typeof productId === "object" ? productId?._id : productId;

    if (
      !productIdValue ||
      productIdValue.trim() === "" ||
      mrpPrice.trim() === ""
    ) {
      toast.error("Please enter mandatory fields");
      return false;
    }

    // Region is required for regional and distributor pricing, but not for national
    if (priceType !== "national" && regionId.trim() === "") {
      toast.error("Please select region");
      return false;
    }

    if (priceType === "distributor" && !distributorId) {
      toast.error("Please select distributor");
      return false;
    }

    return true;
  };

  const handleSetEdit = (pricing) => {
    console.log(pricing, "pricing");
    setOpenModal(true);
    setModalMode("edit");
    setProductId(pricing?.productId ? pricing?.productId : "");
    setPriceType(pricing?.price_type ? pricing.price_type : "");
    setMrpPrice(pricing?.mrp_price ? pricing.mrp_price : "");
    setDlpPrice(pricing?.dlp_price ? pricing.dlp_price : "");
    setRlpPrice(pricing?.rlp_price ? pricing.rlp_price : "");
    setRegionId(pricing?.regionId?._id ? pricing.regionId._id : "");
    setDistributorId(
      pricing?.distributorId?._id ? pricing.distributorId._id : ""
    );
    setSelectedPricing(pricing ? pricing : "");
    setEffectiveDate(
      new Date(pricing?.effective_date).toISOString().split("T")[0]
    );
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setProductId("");
    setMrpPrice("");
    setDlpPrice("");
    setRlpPrice("");
    setRegionId("");
    setDistributorId("");
    setSelectedPricing(null);
    setPriceType("regional");
    setEffectiveDate("");
  };

  const handleAddPricing = async () => {
    try {
      setFormLoading(true);
      if (!validate()) return;
      const payload = {
        productId: typeof productId === "object" ? productId._id : productId,
        mrp_price: mrpPrice,
        dlp_price: dlpPrice,
        rlp_price: rlpPrice,
        price_type: priceType,
        effective_date: effectiveDate,
      };

      // Only add regionId and distributorId for non-national pricing
      if (priceType !== "national") {
        payload.regionId = regionId;
        if (priceType === "distributor") {
          payload.distributorId = distributorId;
        }
      }

      await addPricing(payload);
      selectDistributor;
      fetchPricingPaginated();
      onCloseModal();
      toast.success("Price added successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to add price, try again");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditPricing = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this pricing?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;
            const payload = {
              productId: productId?._id,
              mrp_price: mrpPrice,
              dlp_price: dlpPrice ? dlpPrice : "",
              rlp_price: rlpPrice ? rlpPrice : "",
              price_type: priceType,
              effective_date: effectiveDate,
            };

            // Only add regionId and distributorId for non-national pricing
            if (priceType !== "national") {
              payload.regionId = regionId;
              if (priceType === "distributor") {
                payload.distributorId = distributorId;
              }
            }
            await updatePricing(payload, selectedPricing._id);
            fetchPricingPaginated();
            toast.success("Price updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update price, try again"
            );
          } finally {
            setFormLoading(false);
          }
        } else {
          onCloseModal();
          return;
        }
      },
    });
  };

  const handleStatusUpdate = async (pricing) => {
    openConfirmationModel({
      question: `Are you sure you want to ${pricing.status ? "deactivate" : "activate"
        } this pricing?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            console.log("pricing");
            const payload = {
              status: !pricing.status,
            };
            const res = await updatePricing(payload, pricing._id);
            fetchPricingPaginated();
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.message ??
              error?.response?.data?.message ??
              "Failed to update pricing status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

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

    const url = `${BACKEND_URL}/api/v1/price/price-download`;
    downloadFile({
      url,
      queryParams: queryParams,
      fileName: "PriceReport",
      showToast: true,
    });
  };

  const handleCSVTemplateDownload = () => {
    const csv = [
      "Region Code,Region Name,Distributor Code,Distributor Name,Product Code,MRP,DLP,RLP,Effective Date",
      "REG-LX-007,Region1,DB07 (Optional Field),Rahul Dutta (Optional Field),VOL-25,100,90,80,31-12-2024",
    ];
    const csvString = csv.join("\n");
    const a = document.createElement("a");

    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "pricing_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleErrorLogDownload = async () => {
    try {
      if (!errorLog || errorLog.length === 0) {
        toast.error("No error log to download.");
        return;
      }

      // Dynamically get all unique keys from the errorLog array
      const headers = Array.from(
        new Set(errorLog.flatMap((obj) => Object.keys(obj)))
      );

      // CSV header
      const csv = [headers.join(",")];

      // CSV rows
      errorLog.forEach((row) => {
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
      setErrorLog([]);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to export error log, try again"
      );
    }
  };

  const [importingCsv, setImportingCsv] = useState(false);
  const [importingCsvForPriceInactive, setImportingCsvForPriceInactive] =
    useState(false);

  const handleCSVImport = async (url) => {
    try {
      openConfirmationModel({
        question: "Are you sure you want to import this Pricing CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };
              setImportingCsv(true);
              const res = await bulkUpload(payload, "Price");

              if (res?.data?.skippedRows?.length > 0) {
                toast.error(
                  `${res?.data?.skippedRows?.length} rows skipped, ${res?.data?.data?.length ? res?.data?.data?.length : 0
                  } rows imported`
                );
                setErrorLog(res?.data?.skippedRows);
              } else {
                toast.success(`${res?.data?.data?.length} rows imported`);
              }
              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                "Failed to import pricing, try again"
              );
            } finally {
              setImportingCsv(false);
              fetchPricingPaginated();
            }
          } else {
            onCloseModal();
            return;
          }
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const duplicatePriceHandler = (pricing) => {
    setModalMode("add");
    setOpenModal(true);
    // setProductId(pricing?.productId?._id ? pricing.productId._id : "");
    setProductId(pricing?.productId ? pricing.productId : "");
    setPriceType(pricing?.price_type ? pricing.price_type : "");
    setMrpPrice(pricing?.mrp_price ? pricing.mrp_price : "");
    setDlpPrice(pricing?.dlp_price ? pricing.dlp_price : "");
    setRlpPrice(pricing?.rlp_price ? pricing.rlp_price : "");
    setRegionId(pricing?.regionId?._id ? pricing.regionId._id : "");
    setDistributorId(
      pricing?.distributorId?._id ? pricing.distributorId._id : ""
    );
    setSelectedPricing(pricing ? pricing : "");
    setEffectiveDate(
      new Date(pricing?.effective_date).toISOString().split("T")[0]
    );
  };

  const handleInactiveTemplateDownload = () => {
    let csv = [];
    if (inactiveType === "priceCode") {
      csv = [
        "Price Code,Expiry",
        "PR-2003457,31-12-2025", // example row
      ];
    } else if (inactiveType === "productCode") {
      csv = [
        "Product Code,Price Type,Expiry",
        "RBMTS08050P0142XXL,regional,31-10-2025", // example row
        "RBMTS08050P0142XXP,national,31-10-2025", // example row
        "RBMTS08050P0142XXL,distributor,31-10-2025", // example row
      ];
    } else {
      toast.error("Please select a type first");
      return;
    }

    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute(
      "download",
      inactiveType === "priceCode"
        ? "inactive_by_price_code_template.csv"
        : "inactive_by_product_code_template.csv"
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCSVImportForPriceInactive = async (url) => {
    try {
      if (!inactiveType) {
        toast.error("Please select a type first");
        return;
      }
      openConfirmationModel({
        question: "Are you sure you want to inactive this Pricing CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };

              // Determine API type based on inactiveType
              let apiType = "";
              if (inactiveType === "priceCode") {
                apiType = "InactivePriceByPriceCode";
              } else if (inactiveType === "productCode") {
                apiType = "InactivePriceByProductCodeAndPriceType";
              }
              setImportingCsvForPriceInactive(true);
              const res = await bulkUpload2(payload, apiType);

              if (res?.data?.skippedRows?.length > 0) {
                toast.error(
                  `${res?.data?.skippedRows?.length} rows skipped, ${res?.data?.data?.length ? res?.data?.data?.length : 0
                  } rows success`
                );
                setErrorLog(res?.data?.skippedRows);
              } else {
                toast.success(`${res?.data?.data?.length} rows processed`);
              }

              setPriceInactiveModal(false);
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                "Failed to import inactive pricing, try again"
              );
            } finally {
              setImportingCsvForPriceInactive(false);
              fetchPricingPaginated();
            }
          } else {
            setPriceInactiveModal(false);
            return;
          }
        },
      });
    } catch (error) {
      console.error(error);
    }
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

  return (
    <>
      {pagePermission?.view ? (
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
                {pagePermission?.create && (
                  <Button
                    className="text-xs"
                    size="sm"
                    onClick={() => setOpenModal(true)}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <IoMdAddCircle size={20} />
                      Add Pricing
                    </span>
                  </Button>
                )}

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

                {pagePermission?.create && (
                  importingCsv ? (
                    <Button className="text-xs" size="sm" color="warning">
                      <span className="flex justify-center items-center gap-2">
                        <Spinner size="sm" />
                        Importing CSV...
                      </span>
                    </Button>
                  ) : (
                    <FileUpload
                      type="single-file"
                      page="bulk-import"
                      onSetFileUrl={(url) => {
                        handleCSVImport(url);
                      }}
                    />
                  )
                )}



                {pagePermission?.update && (
                  <Button
                    className="text-xs"
                    color="purple"
                    size="sm"
                    onClick={() => setPriceInactiveModal(true)}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <RiPassExpiredLine size={20} />
                      Inactive Price
                    </span>
                  </Button>
                )}

                {errorLog.length > 0 && (
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
                    Days Left
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Expires At
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Create New From Existing
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Status
                  </Table.HeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-1 dark:bg-gray-800">
                    Action
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
                          <Table.Cell className="px-2 py-1 font-bold">
                            {remainingDays < 0 && price?.status === true ? (
                              <span className="text-blue-500">N/A</span>
                            ) : remainingDays < 0 && price?.status === false ? (
                              <span className="text-red-500">Expired</span>
                            ) : remainingDays === 0 ? (
                              <span className="text-blue-500">Applied today</span>
                            ) : (
                              <span className="text-yellow-500">{`${remainingDays} days left`}</span>
                            )}
                          </Table.Cell>
                          <Table.Cell className="px-2 py-1">
                            {price?.expiresAt
                              ? moment(price?.expiresAt)
                                .tz("Asia/Kolkata")
                                .format("DD-MM-YYYY  hh:mm A")
                              : ""}
                          </Table.Cell>
                          <Table.Cell className="px-2 py-1 flex justify-center items-center">
                            {pagePermission?.create && (
                              <button
                                onClick={() => duplicatePriceHandler(price)}
                                className="flex items-center justify-center gap-2 text-blue-400"
                              >
                                <FaPlus size={15} /> Create
                              </button>
                            )}

                          </Table.Cell>
                          <Table.Cell className="px-2 py-1">
                            <StatusIndicator
                              status={price.status}
                              onClick={
                                pagePermission?.update
                                  ? () => handleStatusUpdate(price)
                                  : undefined
                              }
                              isDisabled={
                                !pagePermission?.update ||
                                (remainingDays < 0 && price?.status === false)
                              }
                            />
                          </Table.Cell>

                          <Table.Cell className="px-2 py-1">
                            <EditButton
                              onClick={
                                pagePermission?.update
                                  ? () => handleSetEdit(price)
                                  : undefined
                              }
                              isDisabled={
                                !pagePermission?.update ||
                                (remainingDays < 0 && price?.status === false)
                              }
                            />

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

          {/* Add/Edit Modal */}
          <Modal show={openModal} onClose={onCloseModal}>
            <Modal.Header>
              {modalMode === "add" ? "Add New Pricing" : "Edit Pricing"}
            </Modal.Header>
            <Modal.Body>
              <div className="space-y-5">
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Product" />{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <Select
                    value={productId?._id}
                    onChange={(event) => {
                      event.target.value === "choose"
                        ? setPriceModal(true)
                        : setProductId(event.target.value);
                    }}
                    required
                    disabled={modalMode === "edit"}
                  >
                    <option value="">Select Product</option>
                    <option value="choose">Choose New Product</option>
                    {productId && (
                      <option key={productId?._id} value={productId?._id}>
                        {productId?.name}
                      </option>
                    )}
                  </Select>
                </div>
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Price Type" />{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex space-x-4 text-gray-700 dark:text-gray-100">
                    <label>
                      <input
                        type="radio"
                        value="regional"
                        checked={priceType === "regional"}
                        onChange={(e) => setPriceType(e.target.value)}
                      />{" "}
                      Regional
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="distributor"
                        checked={priceType === "distributor"}
                        onChange={(e) => setPriceType(e.target.value)}
                      />{" "}
                      Distributor
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="national"
                        checked={priceType === "national"}
                        onChange={(e) => setPriceType(e.target.value)}
                      />{" "}
                      National
                    </label>
                  </div>
                </div>
                {priceType === "regional" && (
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Region" />{" "}
                      <span className="text-red-500">*</span>
                    </div>
                    <Select
                      value={regionId}
                      onChange={(event) => setRegionId(event.target.value)}
                      required
                    >
                      <option value="">Select Region</option>
                      {regions.map((option, index) => (
                        <option key={index} value={option?._id}>
                          {option?.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {priceType === "distributor" && (
                  <div className="w-full">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label value="Region" />{" "}
                      <span className="text-red-500">*</span>
                    </div>
                    <Select
                      value={regionId}
                      onChange={(event) => setRegionId(event.target.value)}
                      required
                    >
                      <option value="">Select Region</option>
                      {regions.map((option, index) => (
                        <option key={index} value={option?._id}>
                          {option?.name}
                        </option>
                      ))}
                    </Select>
                    {regionId && (
                      <div className="mt-4">
                        <div className="mb-2 block text-gray-700 dark:text-gray-100">
                          <Label value="Distributor" />
                        </div>
                        <Select
                          value={distributorId}
                          onChange={(event) =>
                            setDistributorId(event.target.value)
                          }
                        >
                          <option value="">Select Distributor</option>
                          {distributors
                            .filter((ele) => ele?.regionId?._id === regionId)
                            .map((option, index) => (
                              <option key={index} value={option?._id}>
                                {option?.name} ({option?.dbCode})
                              </option>
                            ))}
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {priceType === "national" && (
                  <div className="w-full">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>National Pricing:</strong> This pricing will apply
                        across all regions and distributors in the country.
                      </p>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="MRP" /> <span className="text-red-500">*</span>
                  </div>
                  <TextInput
                    placeholder="Enter MRP"
                    value={mrpPrice}
                    onChange={(event) => setMrpPrice(event.target.value)}
                    required
                  />
                </div>
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="DLP" />
                  </div>
                  <TextInput
                    placeholder="Enter DLP"
                    value={dlpPrice}
                    onChange={(event) => setDlpPrice(event.target.value)}
                  />
                </div>
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="RLP" />
                  </div>
                  <TextInput
                    placeholder="Enter RLP"
                    value={rlpPrice}
                    onChange={(event) => setRlpPrice(event.target.value)}
                  />
                </div>
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Effective Date" />
                  </div>
                  <TextInput
                    type="date"
                    disabled={modalMode === "edit"}
                    name="effective_date"
                    className=" text-gray-700 dark:text-gray-100"
                    value={effectiveDate}
                    onChange={(event) => setEffectiveDate(event.target.value)}
                  />
                </div>

                <div className="w-full">
                  <Button
                    onClick={
                      modalMode === "add" ? handleAddPricing : handleEditPricing
                    }
                    disabled={formLoading}
                    className={`${formLoading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                  >
                    {formLoading ? (
                      <Spinner size="sm" aria-label="Loading spinner" />
                    ) : modalMode === "add" ? (
                      "Add Pricing"
                    ) : (
                      "Update Pricing"
                    )}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={priceModal}
            onClose={() => setPriceModal(false)}
            size="7xl"
          >
            <Modal.Header>Select Product</Modal.Header>
            <Modal.Body>
              <div className="space-y-5">
                <PriceProductModal
                  setProductId={setProductId}
                  productId={productId}
                  setPriceModal={setPriceModal}
                />
              </div>
            </Modal.Body>
          </Modal>

          {/* Price Inactive Modal  */}

          <Modal
            show={priceInactiveModal}
            onClose={() => {
              setPriceInactiveModal(false);
              setInactiveType("");
            }}
            className=" text-gray-700 dark:text-gray-100"
          >
            <Modal.Header>Inactive Price</Modal.Header>
            <Modal.Body>
              <div className="space-y-4">
                {/* Radio Buttons */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="priceCode"
                      checked={inactiveType === "priceCode"}
                      onChange={(e) => setInactiveType(e.target.value)}
                    />
                    Inactive Price by Price Code
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="productCode"
                      checked={inactiveType === "productCode"}
                      onChange={(e) => setInactiveType(e.target.value)}
                    />
                    Inactive Price by Product Code
                  </label>
                </div>

                {/* Buttons appear only when a type is selected */}
                {inactiveType && (
                  <div className="flex gap-4 mt-4">
                    {/* Template Download */}
                    <Button
                      color="light"
                      size="sm"
                      onClick={handleInactiveTemplateDownload}
                    >
                      <span className="flex items-center gap-2">
                        <MdSimCardDownload size={20} /> Template
                      </span>
                    </Button>

                    {/* File Upload */}

                    {importingCsvForPriceInactive ? (
                      <Button className="text-xs" size="sm" color="warning">
                        <span className="flex justify-center items-center gap-2">
                          <Spinner size="sm" />
                          Importing CSV...
                        </span>
                      </Button>
                    ) : (
                      <FileUpload
                        type="single-file"
                        page="bulk-import"
                        onSetFileUrl={(url) => {
                          handleCSVImportForPriceInactive(url); // reuse existing import function
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </Modal.Body>
          </Modal>
        </div>
      ) : (
        <div className="w-full h-[70vh] flex justify-center items-center">
          <h1 className="text-xl font-semibold text-red-500">
            Access Denied
          </h1>
        </div>
      )}
    </>
  );

};

export default Pricing;
