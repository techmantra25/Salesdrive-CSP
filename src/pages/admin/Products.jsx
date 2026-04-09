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
import { useContext, useEffect, useState, useRef } from "react";
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
  // bulkUpload,
  bulkUploadProduct,
  getSuppliersList,
  updateProduct,
  bulkUpdateEan, //temporary import will delete after usage
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
import Datepicker from "react-tailwindcss-datepicker";
import { downloadFile } from "../../utils/downloadFile";
import { getPagePermission } from "../../utils/permissionHelper";


import * as XLSX from "xlsx"; //temporatry impart

const Product = () => {
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
const [uploadModalOpen, setUploadModalOpen] = useState(false);
const [uploadFile, setUploadFile] = useState(null);
const [uploadLoading, setUploadLoading] = useState(false);
  // Pagination state
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [paginatedLoading, setPaginatedLoading] = useState(false);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (permissionState) {
      const permission = getPagePermission(permissionState, "product");
      setPagePermission(permission);
    }
  }, [permissionState]);

  const [eanUploading, setEanUploading] = useState(false);

  const eanFileInputRef = useRef(null); // temporary chage

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
        response?.data?.data?.filter(
          (supllier) => supllier.status === "active",
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch suppliers",
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
    500,
  );

  let fetchSuppliersPaginated = useDebounce(
    fetchSuppliersPaginatedWithOutDebounce,
    500,
  );

  // Add this utility function at the top of your component
  const sortByName = (list) =>
    [...list].sort((a, b) => a.name.localeCompare(b.name));

  // Then use it for all your lists
  const { categories: categoryList } = useSelector((state) => state.category);
  const sortedCategoryList = sortByName(categoryList);
  const activeCategories = sortedCategoryList.filter(
    (cat) => cat.status === true,
  );

  const { brands: brandList } = useSelector((state) => state.brand);
  const sortedBrandList = sortByName(brandList);
  const activeBrands = sortedBrandList.filter((brand) => brand.status === true);

  const { collections: collectionList } = useSelector(
    (state) => state.collection,
  );
  const sortedCollectionList = sortByName(collectionList);
  const activeCollections = sortedCollectionList.filter(
    (collection) => collection.status === true,
  );

  // Update subBrandList sorting
  const sortedSubBrandList = sortByName(subBrandList);
  const activeSubBrands = sortedSubBrandList.filter(
    (subBrand) => subBrand.status === true,
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
        "Failed to fetch Sub-Brands, try again",
      );
    }
  };

  const [formData, setFormData] = useState({
    s4hana_code: "",
    name: "",
    cat_id: "",
    supplier: "",
    brand: "",
    subBrand: "",
    collection_id: "",
    sku_group__name: "",
    sku_group_id: "",
    pack: "",
    size: "",
    color: "",
    img_path: "",
    no_of_pieces_in_a_box: "",
    wp_pc: "", // ✅ NEW
    product_type: "",
    product_valuation_type: "",
    product_hsn_code: "",
    cgst: "",
    sgst: "",
    igst: "",
    sbu: "",
    base_point: "",
    uom: "pcs",
  });
  const [modalMode, setModalMode] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  const validate = () => {
    if (!formData.product_code.trim()) {
      toast.error("product_code is required");
      return false;
    }

    if (!formData.name.trim()) {
      toast.error("Description is required");
      return false;
    }

    // if (!formData.supplier.trim()) {
    //   toast.error("Supplier is required");
    //   return false;
    // }

    if (!formData.subBrand.trim()) {
      toast.error("subBrand is required");
      return false;
    }

    if (!formData.brand.trim()) {
      toast.error("Brand is required");
      return false;
    }

    if (!formData.cat_id.trim()) {
      toast.error("Category is required");
      return false;
    }

    if (!formData.collection_id.trim()) {
      toast.error("Collection is required");
      return false;
    }

    // if (!formData.sku_group_id.trim()) {
    //   toast.error("SKU Group Code is required");
    //   return false;
    // }

    // if (!formData.sku_group__name.trim()) {
    //   toast.error("SKU Group Name is required");
    //   return false;
    // }

    return true;
  };

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

    // Use downloadFile utility for CSV export toast notification
    downloadFile({
      url: url,
      queryParams: params,
      fileName: "products.csv",
    });
  };

const handleCSVTemplateDownload = () => {
  const headers = [
    "product_code",
    "Name",
    "Category Code",
    "Collection Code",
    "Brand Code",
    "subBrand Code",
    "Supplier Code",
    "SKU Group Code",
    "SKU Group Name",
    "Pack",
    "Std Pkg in Pc",
    "W/P Pc",
    "Product Type",
    "Product Valuation Type",
    "HSN Code",
    "CGST",
    "SGST",
    "IGST",
    "SBU",
    "Base Point",
    "UOM",
    "Image Path",
    "EAN",
    "Status",
  ];

  const exampleRow = [
    "Example: RBMBUSJRNMP0115060",
    "Example: Product Description",
    "Example: BERMUDA",
    "Example: BERMUDA",
    "Example: BM",
    "Example: BMBU",
    "Example: C1011",
    "Example: RBMBUSJRNMP0115",
    "Example: SKU Name",
    "Example: 01",
    "Example: 10",
    "Example: 5",
    "Example: inner_wear",
    "Example: standard",
    "Example: 61034200",
    "Example: 2.5",
    "Example: 2.5",
    "Example: 5",
    "",
    "Example: 40",
    "Example: pcs",
    "",
    "Example: 8901234567890",
    "Example: true",
  ];

  const csv = [headers.join(","), exampleRow.join(",")].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "product_template.csv";
  a.click();
};
  const handleErrorLogDownload = () => {
    // Define headers
    const headers = [
      "Product Code",
      "Product Name",
      "Supplier Code",
      "Supplier Name",
      "Image Path",
      "Brand Code",
      "Brand Name",
      "Sub Brand Code",
      "Sub Brand Name",
      "Collection Code",
      "Collection Name",
      "Category Code",
      "Category Name",
      "SKU Group Code",
      "SKU Group Name",
      "Product Type",
      "Product Valuation Type",
      "Product Size",
      "Product Color",
      "Product Pack",
      "Pieces in a box",
      "Product HSN Code",
      "CGST",
      "SGST",
      "IGST",
      "SBU",
      "Base Points",
      "Unit of Measure",
      "Index",
      "Reason",
    ];

    // Create CSV rows with proper escaping
    const csvRows = [
      // Header row
      headers.map((header) => escapeCSVValue(header)).join(","),
      // Data rows
      ...errorLog.map((data) =>
        headers
          .map((header) => {
            let value = "";

            // Handle different field mappings
            switch (header) {
              case "Index":
                value = data["index"] || data["Index"] || "";
                break;
              case "Reason":
                value = data["reason"] || data["Reason"] || "";
                break;
              case "SKU Group Code":
                value = data["SKU Group Code"] || "";
                break;
              case "SKU Group Name":
                value = data["SKU Group Name"] || "";
                break;
              case "Sub Brand Code":
                value = data["Sub Brand Code"] || "";
                break;
              case "Sub Brand Name":
                value = data["Sub Brand Name"] || "";
                break;
              default:
                value = data[header] || "";
            }

            return escapeCSVValue(value);
          })
          .join(","),
      ),
    ];

    const csvString = csvRows.join("\n");

    // Create and download the file using Blob (more reliable than data URI)
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "products-error-log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    URL.revokeObjectURL(link.href);

    // Clear error log if necessary
    setErrorLog([]);
  };


const handleCSVImport = async (file) => {
  try {
    if (!file) return;

    // STEP 1: convert to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // STEP 2: parse Excel/CSV
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });

    console.log("Parsed rows:", rows);

    // STEP 3: SEND RAW DATA (NO URL)
    const response = await bulkUploadProduct({
      data: rows,
    });

    console.log("Upload response:", response);

  } catch (error) {
    console.error("CSV Import Error:", error);
  }
};


const handleSetEdit = (product) => {
  setSelectedProduct(product);
  setModalMode("edit");

  setFormData({
    s4hana_code: product?.s4hana_code || "",
    name: product?.name || "",

    cat_id: product?.cat_id?._id || "",
    collection_id: product?.collection_id?._id || "",
    brand: product?.brand?._id || "",
    subBrand: product?.subBrand?._id || "",

    supplier: product?.supplier?._id || "",

    sku_group__name: product?.sku_group__name || "",
    sku_group_id: product?.sku_group_id || "",

    size: product?.size || "",
    color: product?.color || "",
    pack: product?.pack || "",

    img_path: product?.img_path || "",

    no_of_pieces_in_a_box: product?.no_of_pieces_in_a_box || "",
    wp_pc: product?.wp_pc || "",

    product_type: product?.product_type || "",
    product_valuation_type: product?.product_valuation_type || "",
    product_hsn_code: product?.product_hsn_code || "",

    cgst: product?.cgst || "",
    sgst: product?.sgst || "",
    igst: product?.igst || "",

    sbu: product?.sbu || "",
    base_point: product?.base_point || "",

    uom: product?.uom || "pcs",
  });

  setOpenModal(true);
};
  const handleAddProduct = async () => {
    try {
      if (!validate()) return;

      setFormLoading(true);

      await addProduct({
        ...formData,
      });

      onCloseModal();
      toast.success("Product added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add product, try again"
      );
    } finally {
      setFormLoading(false);
      fetchProductsPaginated();
    }
  };

 const handleEditProduct = async () => {
  openConfirmationModel({
    question: "Are you sure you want to update this product?",
    answer: ["Yes", "No"],
    onClose: async (result) => {
      console.log("CONFIRM RESULT:", result);

      if (result === true || result === "Yes") {
        try {
          if (!validate()) return;

          setFormLoading(true);

          const payload = {
            name: formData.name,

            cat_id: formData.cat_id,
            collection_id: formData.collection_id,
            brand: formData.brand,
            subBrand: formData.subBrand,

            supplier: formData.supplier,

            sku_group_id: formData.sku_group_id,
            sku_group__name: formData.sku_group__name,

            size: formData.size,
            color: formData.color,
            pack: formData.pack,

            img_path: formData.img_path,

            no_of_pieces_in_a_box: formData.no_of_pieces_in_a_box,
            wp_pc: formData.wp_pc,

            product_type: formData.product_type,
            product_valuation_type: formData.product_valuation_type,
            product_hsn_code: formData.product_hsn_code,

            cgst: formData.cgst,
            sgst: formData.sgst,
            igst: formData.igst,

            sbu: formData.sbu,
            base_point: formData.base_point,

            uom: formData.uom,
          };

          console.log("PAYLOAD:", payload);
          console.log("ID:", selectedProduct?._id);

          await updateProduct(payload, selectedProduct._id);

          toast.success("Product updated successfully");
          onCloseModal();
          fetchProductsPaginated();

        } catch (error) {
          console.error(error);
          toast.error(
            error?.response?.data?.message ||
            "Failed to update product"
          );
        } finally {
          setFormLoading(false);
        }
      } else {
        onCloseModal();
      }
    },
  });
};

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");

    setFormData({
      s4hana_code: "",
      name: "",
      cat_id: "",
      supplier: "",
      brand: "",
      subBrand: "",
      collection_id: "",
      sku_group__name: "",
      sku_group_id: "",
      pack: "",
      size: "",
      color: "",
      img_path: "",
      no_of_pieces_in_a_box: "",
      wp_pc: "",
      product_type: "",
      product_valuation_type: "",
      product_hsn_code: "",
      cgst: "",
      sgst: "",
      igst: "",
      sbu: "",
      base_point: "",
      uom: "pcs",
    });

    setSelectedProduct(null);
  };

  const handleStatusUpdate = async (product) => {
    openConfirmationModel({
      question: `Are you sure you want to ${product.status ? "deactivate" : "activate"
        } this product?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !product.status,
            };
            const res = await updateProduct(payload, product._id);
            fetchProductsPaginated();
            if (res?.data?.statusUpdateError) {
              const error = res?.data?.message;
              toast.error(`${error}`);
            } else {
              toast.success("Status updated successfully");
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update product status",
            );
          } finally {
            fetchProductsPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  // temporary code
  const handleEanUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setEanUploading(true);
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
        raw: false,
      });

      const res = await bulkUpdateEan(rows);
      toast.success(
        `EAN update done. Updated: ${res.data.updated}, Skipped: ${res.data.skipped}, Failed: ${res.data.failed}`,
      );
      fetchProductsPaginated();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "EAN upload failed",
      );
    } finally {
      setEanUploading(false);
      if (eanFileInputRef.current) eanFileInputRef.current.value = "";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const [syncingProducts, setSyncingProducts] = useState(false);

  const handleSyncProducts = async () => {
    openConfirmationModel({
      question: "Are you sure you want to sync products?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setSyncingProducts(true);
            const res = await getProductsSync();
            toast.success(
              `${res?.data?.data?.totalInserted} Added.
              ${res?.data?.data?.totalUpdated} Updated.
              ${res?.data?.data?.totalSkipped} skipped.`,
              { duration: 10000 },
            );

            if (res?.data?.data?.skippedRows.length > 0) {
              setErrorLog(res?.data?.data?.skippedRows);
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message || "Failed to sync products",
            );
          } finally {
            setSyncingProducts(false);
            fetchProductsPaginated();
          }
        } else {
          return;
        }
      },
    });
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

const handleUploadSubmit = async () => {
  try {
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    setUploadLoading(true);
    toast.loading("Uploading...");

    const arrayBuffer = await uploadFile.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });

    if (!rows.length) {
      toast.dismiss();
      toast.error("File is empty");
      return;
    }

    // ✅ GET RESPONSE
    const res = await bulkUploadProduct({
      data: rows,
    });

    toast.dismiss();

    console.log("Backend Response:", res);

    // ✅ SHOW REAL RESULT (NOT FAKE SUCCESS)
    const inserted = res?.data?.insertedCount || 0;
    const skipped = res?.data?.skippedCount || 0;

    toast.success(
      `Inserted: ${inserted}, Skipped: ${skipped}`,
      { duration: 6000 }
    );

    // ✅ SET ERROR LOG (VERY IMPORTANT)
    if (res?.data?.skippedRows?.length > 0) {
      setErrorLog(res.data.skippedRows);
    }

    // reset
    setUploadModalOpen(false);
    setUploadFile(null);

    // refresh table
    fetchProductsPaginated();

  } catch (error) {
    toast.dismiss();
    console.error("Upload failed:", error);

    toast.error(
      error?.response?.data?.message || "Upload failed"
    );
  } finally {
    setUploadLoading(false);
  }
};
  return (
    <>
      {pagePermission?.view && (
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
                              (brand) => brand._id === selectedBrand,
                            ),
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

                  <div className="w-56 mb-2">
                    <div className="block">
                      <Label
                        htmlFor="effectiveDateSelect"
                        value="Filter By Created At Date Range"
                      />
                    </div>
                    <Datepicker
                      showShortcuts={true}
                      value={dateRange}
                      onChange={handleDateRangeChange}
                      popoverDirection="down" // or "up" depending on your layout
                      inputClassName={
                        "w-full rounded-md focus:ring-0 font-normal text-white bg-gray-800 dark:bg-gray-800 border-gray-600 dark:border-gray-600"
                      }
                      containerClassName={`relative ${openModal ? "z-0" : "z-[1000]"
                        }`}
                    />
                  </div>

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

                  {pagePermission?.create && (
                    <Button
                      size="xs"
                      onClick={() => setOpenModal(true)}

                      aria-label="Add Product"
                      className="text-[11px]"
                    >
                      <span className="flex items-center gap-1">
                        <IoMdAddCircle size={16} />
                        <span className="hidden sm:inline">Add Product</span>
                      </span>
                    </Button>)}

                  <Button
                    size="xs"
                    color="light"
                    onClick={handleCSVTemplateDownload}
                    aria-label="Download Template"
                    className="text-[11px]"
                  >
                    <span className="flex items-center gap-1">
                      <MdSimCardDownload size={16} />
                      <span className="hidden sm:inline">Template</span>
                    </span>
                  </Button>

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

                  {pagePermission?.update && (
                    <Button
                      size="xs"
                      color="blue"
                      disabled={syncingProducts}
                      onClick={handleSyncProducts}

                      aria-label="Sync Products"
                      className="text-[11px]"
                    >
                      <span className="flex items-center gap-1">
                        <IoSyncCircleSharp size={16} />
                        <span className="hidden sm:inline">
                          {syncingProducts ? "Syncing..." : "Sync Products"}
                        </span>
                      </span>
                    </Button>)}

                  {pagePermission?.create && (
            <Button
  size="xs"
  color="purple"
  onClick={() => setUploadModalOpen(true)}
>
  Upload File
</Button>
                  )}


                  {/* <Label className="text-black">EAN Code Upload</Label> */}
                  <input
                    type="file"
                    accept=".xlsx,.csv"
                    ref={eanFileInputRef}
                    onChange={handleEanUpload}
                    className="hidden"
                  />
                  <Button
                    size="xs"
                    color="warning"
                    disabled={eanUploading}
                    onClick={() => eanFileInputRef.current?.click()}
                    className="text-[11px]"
                  >
                    {eanUploading ? "Uploading..." : "Upload EAN File"}
                  </Button>

                  {errorLog.length > 0 && (
                    <Button
                      size="xs"
                      color="red"
                      onClick={handleErrorLogDownload}
                      aria-label="Download Error Log"
                      className="text-[11px]"
                    >
                      <span className="flex items-center gap-1">
                        <MdDownloadForOffline size={16} />
                        <span className="hidden sm:inline">Error Log</span>
                        <Badge color="gray" className="ml-1 px-2 py-0.5">
                          {errorLog.length}
                        </Badge>
                      </span>
                    </Button>
                  )}
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

                    {/* ================= HEAD ================= */}
                    <Table.Head className="text-center text-sm">
                      <Table.HeadCell>SKU Group</Table.HeadCell>
                      <Table.HeadCell>product_code</Table.HeadCell>
                      <Table.HeadCell>EAN</Table.HeadCell>
                      <Table.HeadCell>Description</Table.HeadCell>
                      <Table.HeadCell>Size</Table.HeadCell>
                      <Table.HeadCell>Color</Table.HeadCell>
                      <Table.HeadCell>Pack</Table.HeadCell>
                      <Table.HeadCell>Supplier</Table.HeadCell>
                      <Table.HeadCell>Brand</Table.HeadCell>
                      <Table.HeadCell>subBrand</Table.HeadCell>
                      <Table.HeadCell>Category</Table.HeadCell>
                      <Table.HeadCell>Collection</Table.HeadCell>
                      <Table.HeadCell>SKU GROUPE NAME</Table.HeadCell>
                      <Table.HeadCell>Product Type</Table.HeadCell>
                      <Table.HeadCell>Valuation</Table.HeadCell>
                      <Table.HeadCell>UOM</Table.HeadCell>
                      <Table.HeadCell>Std Pkg</Table.HeadCell>
                      <Table.HeadCell>HSN CODE</Table.HeadCell>
                      <Table.HeadCell>CGST</Table.HeadCell>
                      <Table.HeadCell>SGST</Table.HeadCell>
                      <Table.HeadCell>IGST</Table.HeadCell>
                      <Table.HeadCell>Base Point</Table.HeadCell>
                      <Table.HeadCell>Created</Table.HeadCell>
                      <Table.HeadCell>Updated</Table.HeadCell>
                      <Table.HeadCell>Status</Table.HeadCell>
                      <Table.HeadCell>Action</Table.HeadCell>
                    </Table.Head>

                    {/* ================= BODY ================= */}
                    <Table.Body className="divide-y bg-white dark:bg-gray-800">
                      {filteredProducts?.length > 0 ? (
                        filteredProducts.map((product) => (
                          <Table.Row
                            key={product?._id}
                            className="text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                          >

                            {/* SKU */}
                            <Table.Cell className="px-2 py-1">
                              <UniqueCode
                                text={product?.sku_group_id}
                                codeName="SKU Group"
                              />
                            </Table.Cell>

                            {/* S4HANA */}
                            <Table.Cell className="px-2 py-1">
                              <UniqueCode
                                text={product?.s4hana_code || "-"}
                                codeName="Product"
                              />
                            </Table.Cell>

                            {/* EAN */}
                            <Table.Cell>{product?.ean11 || "-"}</Table.Cell>

                            {/* DESCRIPTION */}
                            <Table.Cell>{product?.name || "-"}</Table.Cell>

                            {/* SIZE */}
                            <Table.Cell>{product?.size || "-"}</Table.Cell>

                            {/* COLOR */}
                            <Table.Cell>{product?.color || "-"}</Table.Cell>

                            {/* PACK */}
                            <Table.Cell>{product?.pack || "-"}</Table.Cell>

                            {/* SUPPLIER */}
                            <Table.Cell>
                              {product?.supplier &&
                                typeof product?.supplier === "object" && (
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

                            {/* BRAND */}
                            <Table.Cell>
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

                            {/* subBrand */}
                            <Table.Cell>
                              {product?.subBrand &&
                                (typeof product?.subBrand === "object" ? (
                                  <>
                                    <UniqueCode
                                      text={product?.subBrand?.code}
                                      codeName="subBrand"
                                    />{" "}
                                    ({product?.subBrand?.desc})
                                  </>
                                ) : (
                                  product?.subBrand
                                ))}
                            </Table.Cell>

                            {/* CATEGORY */}
                            <Table.Cell>
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

                            {/* COLLECTION */}
                            <Table.Cell>
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

                            {/* SKU NAME */}
                            <Table.Cell>{product?.sku_group__name || "-"}</Table.Cell>

                            {/* PRODUCT TYPE */}
                            <Table.Cell>{product?.product_type || "-"}</Table.Cell>

                            {/* VALUATION */}
                            <Table.Cell>{product?.product_valuation_type || "-"}</Table.Cell>

                            {/* UOM */}
                            <Table.Cell>{product?.uom || "-"}</Table.Cell>

                            {/* STD PKG */}
                            <Table.Cell>{product?.no_of_pieces_in_a_box || "-"}</Table.Cell>

                            {/* HSN */}
                            <Table.Cell>
                              <UniqueCode
                                text={product?.product_hsn_code || "-"}
                                codeName="HSN"
                              />
                            </Table.Cell>

                            {/* TAX */}
                            <Table.Cell>{product?.cgst || "-"}</Table.Cell>
                            <Table.Cell>{product?.sgst || "-"}</Table.Cell>
                            <Table.Cell>{product?.igst || "-"}</Table.Cell>

                            {/* BASE POINT */}
                            <Table.Cell>{product?.base_point || "-"}</Table.Cell>

                            {/* CREATED */}
                            <Table.Cell>
                              {product?.createdAt
                                ? moment(product?.createdAt)
                                  .tz("Asia/Kolkata")
                                  .format("DD-MM-YYYY hh:mm A")
                                : "-"}
                            </Table.Cell>

                            {/* UPDATED */}
                            <Table.Cell>
                              {product?.updatedAt
                                ? moment(product?.updatedAt)
                                  .tz("Asia/Kolkata")
                                  .format("DD-MM-YYYY hh:mm A")
                                : "-"}
                            </Table.Cell>

                            {/* STATUS */}
                            <Table.Cell>
                              <StatusIndicator
                                status={product.status}
                                // onClick={
                                //   pagePermission?.update
                                //     ? () => handleStatusUpdate(product)
                                //     : undefined
                                // }

                                onClick={() => handleSetEdit(product)}
                              />
                            </Table.Cell>

                            {/* ACTION */}
                            <Table.Cell>
                              <div className="flex gap-1 justify-center items-center">
                                {pagePermission?.update && (
                                  <EditButton
                                    onClick={() => handleSetEdit(product)}
                                  />
                                )}
                              </div>
                            </Table.Cell>

                          </Table.Row>
                        ))
                      ) : (
                        <Table.Row>
                          <Table.Cell colSpan="100%" className="text-center">
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

          {/* Your existing code for displaying the product list and modal */}
          <Modal show={openModal} onClose={onCloseModal}>
            <Modal.Header>
              {modalMode === "add" ? "Add Product" : "Edit Product"}
            </Modal.Header>
            <Modal.Body>
              <form>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="s4hana_code">product_code</Label>
                    <span className="text-red-500">*</span>
                  </div>
                  <TextInput
                    id="s4hana_code"
                    name="s4hana_code"
                    value={formData.s4hana_code}
                    onChange={handleChange}
                    placeholder="Enter product_code"
                    required
                    readOnly={modalMode !== "add" ? true : false}
                    disabled={modalMode !== "add" ? true : false}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="name">Description</Label>
                    <span className="text-red-500">*</span>
                  </div>
                  <TextInput
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Description"
                    required
                  />
                </div>
                {/* <div className="mb-4">
              <div className="mb-2 block text-gray-700 dark:text-gray-100">
                <Label htmlFor="supplier">Supplier</Label>
                <span className="text-red-500">*</span>
              </div>
              <Select
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              >
                <option value="">Select Supplier</option>
                {supplierList?.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.supplierCode}({supplier?.supplierName})
                  </option>
                ))}
              </Select>
            </div> */}
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="brand">Brand</Label>
                    <span className="text-red-500">*</span>
                  </div>
                  <Select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                  >
                    <option value="">Select Brand</option>
                    {modalMode === "add"
                      ? activeBrands?.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}({brand?.desc})
                        </option>
                      ))
                      : sortedBrandList?.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}({brand?.desc})
                        </option>
                      ))}
                  </Select>
                </div>
                {formData?.brand ? (
                  <div className="mb-4">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label htmlFor="brand">subBrand</Label>
                      <span className="text-red-500">*</span>
                    </div>
                    <Select
                      id="subBrand"
                      name="subBrand"
                      value={formData.subBrand}
                      onChange={handleChange}
                      disabled={formData.brand_id}
                    >
                      <option value="">Select Sub Brand</option>

                      {modalMode === "add"
                        ? activeSubBrands
                          ?.filter((ele) => ele?.brandId?._id == formData?.brand)
                          ?.map((ele) => (
                            <option key={ele?._id} value={ele?._id}>
                              {ele?.name}({ele?.desc})
                            </option>
                          ))
                        : sortedSubBrandList
                          ?.filter((ele) => ele?.brandId?._id == formData?.brand)
                          ?.map((subBrand) => (
                            <option key={subBrand._id} value={subBrand._id}>
                              {subBrand.name} ({subBrand.desc})
                            </option>
                          ))}
                    </Select>
                  </div>
                ) : null}
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="cat_id">Category</Label>
                    <span className="text-red-500">*</span>
                  </div>
                  <Select
                    id="cat_id"
                    name="cat_id"
                    value={formData?.cat_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {modalMode === "add"
                      ? activeCategories?.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))
                      : sortedCategoryList?.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </Select>
                </div>
                {formData?.cat_id ? (
                  <div className="mb-4">
                    <div className="mb-2 block text-gray-700 dark:text-gray-100">
                      <Label htmlFor="collection_id">Collection</Label>
                      <span className="text-red-500">*</span>
                    </div>
                    <Select
                      id="collection_id"
                      name="collection_id"
                      value={formData.collection_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Collection</option>
                      {modalMode === "add"
                        ? activeCollections
                          ?.filter((ele) => ele?.cat_id?._id == formData?.cat_id)
                          ?.map((collection) => (
                            <option key={collection._id} value={collection._id}>
                              {collection.name}
                            </option>
                          ))
                        : sortedCollectionList
                          ?.filter((ele) => ele?.cat_id?._id == formData?.cat_id)
                          ?.map((collection) => (
                            <option key={collection._id} value={collection._id}>
                              {collection.name}
                            </option>
                          ))}
                    </Select>
                  </div>
                ) : null}
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="sku_group__name">SKU Group Name</Label>
                    <span className="text-red-500"></span>
                  </div>

                  <TextInput
                    placeholder="Enter SKU Group Name"
                    id="sku_group__name"
                    name="sku_group__name"
                    value={formData.sku_group__name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="sku_group_id">SKU Group Code</Label>
                    <span className="text-red-500"></span>
                  </div>

                  <TextInput
                    placeholder="Enter Code"
                    id="sku_group_id"
                    name="sku_group_id"
                    value={formData.sku_group_id}
                    onChange={handleChange}
                    readOnly={modalMode !== "add" ? true : false}
                    disabled={modalMode !== "add" ? true : false}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="product_type">Collection/Product Type</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <TextInput
                    id="product_type"
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    placeholder="Enter Collection / Product Type"
                  />
                </div>

                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="valuation_type">Product Valuation Type</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <TextInput
                    id="product_valuation_type"
                    name="product_valuation_type"
                    value={formData.product_valuation_type}
                    onChange={handleChange}
                    placeholder="Enter Product Valuation Type"
                  />
                </div>
                <div className="w-full mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="img_path">Product Image</Label>
                  </div>
                  <div className="flex justify-center items-center gap-2 w-full">
                    <TextInput
                      placeholder="Enter Image Path"
                      id="img_path"
                      name="img_path"
                      value={formData?.img_path}
                      className="w-full"
                      onChange={handleChange}
                    />
                    <FileUpload
                      onSetFileUrl={(url) => {
                        setFormData({ ...formData, img_path: url });
                      }}
                      type="single-image"
                      page="modal-form"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="size">Size</Label>
                  </div>
                  <TextInput
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="color">Color</Label>
                  </div>
                  <TextInput
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>
                {/* add pack input field  */}
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="pack">Pack</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <TextInput
                    id="pack"
                    name="pack"
                    value={formData.pack}
                    onChange={handleChange}
                    placeholder="Enter Pack"
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="no_of_pieces_in_a_box">Std Pkg in Pc</Label>
                  </div>
                  <TextInput
                    id="no_of_pieces_in_a_box"
                    name="no_of_pieces_in_a_box"
                    value={formData.no_of_pieces_in_a_box}
                    onChange={handleChange}
                    type="number"
                  />
                </div>


                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="no_of_pieces_in_a_box">W/P Pc</Label>
                  </div>
                  <TextInput
                    id="wp_pc"
                    name="wp_pc"
                    value={formData.wp_pc}
                    onChange={handleChange}
                    placeholder="Enter W/P Pc"
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="product_hsn_code">Product HSN Code</Label>
                    <span className="text-red-500">*</span>
                  </div>
                  <TextInput
                    id="product_hsn_code"
                    name="product_hsn_code"
                    value={formData.product_hsn_code}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="cgst">CGST</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <TextInput
                    id="cgst"
                    name="cgst"
                    value={formData.cgst}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="sgst">SGST</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <TextInput
                    id="sgst"
                    name="sgst"
                    value={formData.sgst}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="igst">IGST</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <TextInput
                    id="igst"
                    name="igst"
                    value={formData.igst}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="sbu">SBU</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <TextInput
                    id="sbu"
                    name="sbu"
                    value={formData.sbu}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="sbu">Base point</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <TextInput
                    id="base_point"
                    name="base_point"
                    value={formData.base_point}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label htmlFor="uom">Unit of Measure(UOM)</Label>
                    {/* <span className="text-red-500">*</span> */}
                  </div>
                  <Select
                    id="uom"
                    name="uom"
                    value={formData.uom}
                    onChange={handleChange}
                  >
                    <option value="pcs">pcs</option>
                    <option value="bndl">bndl</option>
                    <option value="box">box</option>
                    <option value="coil">coil</option>
                  </Select>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              {modalMode === "add" ? (
                <Button
                  onClick={() => {
                    if (modalMode === "add" && pagePermission?.create) {
                      handleAddProduct();
                    }
                  }}
                  disabled={formLoading}
                >

                  {formLoading ? (
                    <Spinner size="sm" aria-label="Loading spinner" />
                  ) : (
                    "Add Product"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (modalMode === "edit" && pagePermission?.update) {
                      handleEditProduct();
                    }
                  }}
                  disabled={formLoading}
                >

                  {formLoading ? (
                    <Spinner size="sm" aria-label="Loading spinner" />
                  ) : (
                    "Update Product"
                  )}
                </Button>
              )}
            </Modal.Footer>
          </Modal>
          <Modal show={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
  <Modal.Header>Upload Product File</Modal.Header>

  <Modal.Body>
    <div className="flex flex-col gap-4">

      {/* File Input */}
      <input
        type="file"
        accept=".xlsx,.csv"
        onChange={(e) => setUploadFile(e.target.files[0])}
      />

      {/* Show file name */}
      {uploadFile && (
        <p className="text-sm text-green-600">
          Selected: {uploadFile.name}
        </p>
      )}

    </div>
  </Modal.Body>

  <Modal.Footer>
    <Button
      color="gray"
      onClick={() => {
        setUploadModalOpen(false);
        setUploadFile(null);
      }}
    >
      Cancel
    </Button>

    <Button
      onClick={handleUploadSubmit}
      disabled={uploadLoading}
    >
      {uploadLoading ? <Spinner size="sm" /> : "Upload"}
    </Button>
  </Modal.Footer>
</Modal>

        </>
      )}
    </>
  );

};

export default Product;
