import { useState, useEffect, useRef, useCallback } from "react";
import {
  Badge,
  Button,
  Card,
  Label,
  Select,
  Table,
  Pagination,
  Spinner,
} from "flowbite-react";
import Papa from "papaparse";
import { RiRefreshFill } from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { FiX } from "react-icons/fi";
import { FaDownload } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { secondaryTargetPaginatedList } from "../../api/api";
import toast from "react-hot-toast";
import { useDebounce } from "../../hooks/useDebounce";
import {
  OutletListMinimalByDistributor,
  SearchOutletsByDistributor,
  getAllSecondarySlab,
  SearchOutletsDropdown,
  secondaryTargetReportDownload,
  bulkUploadSecondaryTargetsWithDbCode,
} from "../../api/api";
// import { getAllSecondarySlab } from "../../api/api";
import SearchableSelect from "../../components/SearchableSelect";
import { fetchStates } from "../../redux/stateSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchBrands } from "../../redux/brandSlice";
import moment from "moment";
import Datepicker from "react-tailwindcss-datepicker";
import PaginatedSearchableSelect from "../../components/PaginatedSearchableSelect";
import BulkUploadWithDbCodeModal from "../../components/BulkUploadWithDbCodeModal";
import TagPopover from "../../components/TagPopover";
import CreateSingleTargetModal from "../../components/CreateSingleTargetModal";

import { FaTrash } from "react-icons/fa";
import { deleteSecondaryTarget } from "../../api/api";
import { useContext } from "react";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import EditSecondaryTargetModal from "../../components/EditSecondaryTargetModal";
import { getPagePermission } from "../../utils/permissionHelper";

const SecondaryTarget = () => {
  const dispatch = useDispatch();
  const [selectedReatiler, setSelectedRetailer] = useState("");
  const [selectedTargetType, setSelectedTargetType] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [targetLoading, setTargetLoading] = useState(false);

  // New filter states
  const [selectedTargetName, setSelectedTargetName] = useState("");
  const [targetNameSearchTerm, setTargetNameSearchTerm] = useState("");
  const [targetNameList, setTargetNameList] = useState([]);
  const [targetNameSearchResults, setTargetNameSearchResults] = useState([]);
  const [isSearchingTargetName, setIsSearchingTargetName] = useState(false);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [regionSearchTerm, setRegionSearchTerm] = useState("");
  const [regionList, setRegionList] = useState([]);
  const [regionSearchResults, setRegionSearchResults] = useState([]);
  const [isSearchingRegion, setIsSearchingRegion] = useState(false);
  const [selectedSlab, setSelectedSlab] = useState("");

  const [selectedAchievementSlab, setSelectedAchievementSlab] = useState("");

  const [selectedActiveStatus, setSelectedActiveStatus] = useState("");

  // Changed to object for Datepicker component
  const [tenureDateRange, setTenureDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [stateSearchTerm, setStateSearchTerm] = useState("");
  const [stateSearchResults, setStateSearchResults] = useState([]);
  const [isSearchingState, setIsSearchingState] = useState(false);

  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [secondaryTargets, setSecondaryTargets] = useState([]);
  const [openBulkWithDbCodeModal, setOpenBulkWithDbCodeModal] = useState(false);

  const [selectedBrands, setSelectedBrands] = useState([]);

  // const [outletList, setOutletList] = useState([]);
  // const [outletLoading, setOutletLoading] = useState(false);
  // const [outletSearchTerm, setOutletSearchTerm] = useState("");
  // const [outletSearchResults, setOutletSearchResults] = useState([]);
  // const [isSearchingOutlet, setIsSearchingOutlet] = useState(false);

  const { states, loading: statesLoading } = useSelector(
    (state) => state.state,
  );
  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.region,
  );

  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors,
  );
  const [openBulkModal, setOpenBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [failedCSV, setFailedCSV] = useState(null);
  const [failedCount, setFailedCount] = useState(0);
  const [bulkUploading, setBulkUploading] = useState(false);

  const [oepnEditModal, setOpenEditModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const [slabList, setSlabList] = useState([]);
  const [slabLoading, setSlabLoading] = useState(false);

  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [distributorSearchTerm, setDistributorSearchTerm] = useState("");
  const [distributorList, setDistributorList] = useState([]);
  const [distributorSearchResults, setDistributorSearchResults] = useState([]);
  const [isSearchingDistributor, setIsSearchingDistributor] = useState(false);

  const [openCreateSingleTargetModal, setOpenCreateSingleTargetModal] =
    useState(false); //staate to handle the opening of create single modal

  const handleEditClick = (target) => {
    setSelectedTarget(target);
    setOpenEditModal(true);
  };

  const fileInputRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const currentUser = useSelector((state) => state?.user?.userInfo);

  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(
      permissionState,
      "secondary-target-vs-achievement-setting",
    );
    setPagePermission(permission);
  }, [permissionState]);

  // const getOutletList = async (distributorId) => {
  //   if (!distributorId) return;

  //   setOutletLoading(true);
  //   try {
  //     const res = await OutletListMinimalByDistributor(distributorId);
  //     setOutletList(res?.data?.data || []);
  //   } catch (error) {
  //     toast.error("Failed to fetch Retailer List");
  //   } finally {
  //     setOutletLoading(false);
  //   }
  // };

  //   const searchOutlets = async (searchTerm) => {
  //   if (!searchTerm || searchTerm.length < 2 || !selectedDistributor) {
  //     setOutletSearchResults([]);
  //     return;
  //   }

  //   setIsSearchingOutlet(true);
  //   try {
  //     const res = await SearchOutletsByDistributor(
  //       selectedDistributor,
  //       searchTerm.trim()
  //     );
  //     setOutletSearchResults(res?.data?.data || []);
  //   } catch (error) {
  //     setOutletSearchResults([]);
  //   } finally {
  //     setIsSearchingOutlet(false);
  //   }
  // };

  const searchDistributors = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setDistributorSearchResults([]);
      setIsSearchingDistributor(false);
      return;
    }
    setIsSearchingDistributor(true);
    const filtered = distributors.filter(
      (dist) =>
        dist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dist.dbCode.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setDistributorSearchResults(filtered);
    setIsSearchingDistributor(false);
  };

  // Search functions for new filters
  const searchTargetNames = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setTargetNameSearchResults([]);
      setIsSearchingTargetName(false);
      return;
    }
    setIsSearchingTargetName(true);
    const filtered = targetNameList.filter((name) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setTargetNameSearchResults(filtered);
    setIsSearchingTargetName(false);
  };

  const searchStates = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setStateSearchResults([]);
      setIsSearchingState(false);
      return;
    }
    setIsSearchingState(true);
    const filtered = states.filter((state) =>
      state.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setStateSearchResults(filtered);
    setIsSearchingState(false);
  };

  const searchRegions = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setRegionSearchResults([]);
      setIsSearchingRegion(false);
      return;
    }
    setIsSearchingRegion(true);
    const filtered = regions.filter((region) =>
      region.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setRegionSearchResults(filtered);
    setIsSearchingRegion(false);
  };

  const getDisplayDistributorList = () => {
    if (distributorSearchTerm.trim().length >= 2) {
      return distributorSearchResults;
    }
    return distributors;
  };
  const { brands, loading: brandsLoading } = useSelector(
    (state) => state.brand,
  );

  const handleDeleteTarget = (targetId) => {
    openConfirmationModel({
      question: "Are you sure you want to delete this target?",
      answer: ["Yes, Delete", "Cancel"],
      onClose: async (confirmed) => {
        if (confirmed) {
          try {
            await deleteSecondaryTarget(targetId);
            toast.success("Target deleted successfully");
            fetchSecondaryTargetsPaginated();
          } catch (error) {
            toast.error(
              error?.response?.data?.message ||
                error?.message ||
                "Failed to delete target",
            );
          }
        }
      },
    });
  };
  const getSlabList = async () => {
    setSlabLoading(true);
    try {
      const res = await getAllSecondarySlab();
      setSlabList(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch slabs", error);
      setSlabList([]);
    } finally {
      setSlabLoading(false);
    }
  };

  // Extract unique values from targets for dropdowns
  useEffect(() => {
    if (secondaryTargets.length > 0) {
      const uniqueTargetNames = [
        ...new Set(secondaryTargets.map((t) => t.name).filter(Boolean)),
      ];

      const regionMap = new Map();
      secondaryTargets.forEach((t) => {
        if (t.regionId && t.regionId._id) {
          regionMap.set(t.regionId._id, {
            _id: t.regionId._id,
            name: t.regionId.name,
          });
        }
      });
      const uniqueRegions = Array.from(regionMap.values());

      setTargetNameList(uniqueTargetNames);
      setRegionList(uniqueRegions);
    }
  }, [secondaryTargets]);

  // useEffect(() => {
  //   if (selectedDistributor) {
  //     getOutletList(selectedDistributor);
  //     setSelectedRetailer(""); // reset retailer
  //   } else {
  //     setOutletList([]);
  //   }
  // }, [selectedDistributor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchDistributors(distributorSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [distributorSearchTerm, distributors]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (outletSearchTerm) {
  //       searchOutlets(outletSearchTerm);
  //     } else {
  //       setOutletSearchResults([]);
  //     }
  //   }, 300);
  //   return () => clearTimeout(timer);
  // }, [outletSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchTargetNames(targetNameSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [targetNameSearchTerm, targetNameList]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStates(stateSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [stateSearchTerm, states]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchRegions(regionSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [regionSearchTerm, regions]);

  // const getDisplayOutletList = () => {
  //   if (outletSearchTerm.trim().length >= 2) {
  //     return outletSearchResults;
  //   }
  //   return outletList;
  // };

  const getDisplayTargetNameList = () => {
    if (targetNameSearchTerm.trim().length >= 2) {
      return targetNameSearchResults;
    }
    return targetNameList;
  };

  const getDisplayStateList = () => {
    if (stateSearchTerm.trim().length >= 2) {
      return stateSearchResults;
    }
    return states;
  };

  const getDisplayRegionList = () => {
    if (regionSearchTerm.trim().length >= 2) {
      return regionSearchResults;
    }
    return regions;
  };

  // Helper function to format target names for display
  const formatTargetNameOption = (name) => {
    return { _id: name, name: name };
  };

  // Helper function to format regions for display
  const formatRegionOption = (region) => {
    return region;
  };

  const fetchOutletsWithSearch = useCallback(
    async (searchTerm = "", page = 1) => {
      try {
        const query = {
          page: page,
          limit: 50,
          ...(searchTerm && { search: searchTerm }),
          ...(selectedDistributor && { distributorId: selectedDistributor }),
        };

        const response = await SearchOutletsDropdown(query);
        const totalPages = response?.data?.pagination?.totalPages || 0;

        return {
          data: response?.data?.data || [],
          hasMore: page < totalPages,
        };
      } catch (error) {
        console.error(error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch outlet list",
        );
        return { data: [], hasMore: false };
      }
    },
    [selectedDistributor],
  );

  const handleRetailerChange = (e) => {
    setSelectedRetailer(e.target.value);
  };

  const fetchSecondaryTargetsPaginatedWithoutDebounce = async () => {
    try {
      setTargetLoading(true);

      const query = {
        page: currentPage,
        limit: 10,
      };

      if (selectedTargetType && selectedTargetType !== "default") {
        query.target_type = selectedTargetType;
      }
      if (selectedState && selectedState !== "default") {
        query.stateId = selectedState;
      }
      if (selectedDistributor && selectedDistributor !== "default") {
        query.distributorId = selectedDistributor;
      }
      if (selectedReatiler && selectedReatiler !== "default") {
        query.retailerId = selectedReatiler;
      }
      if (selectedTargetName) {
        query.targetName = selectedTargetName;
      }

      if (selectedRegion && selectedRegion !== "default") {
        query.region = selectedRegion;
      }
      if (selectedSlab && selectedSlab !== "default") {
        query.slabId = selectedSlab; // ← ADD THIS
      }
      if (selectedAchievementSlab) {
        query.achievementSlab = selectedAchievementSlab;
      }

      if (selectedBrands && selectedBrands.length > 0) {
        query.brandIds = selectedBrands.join(",");
      }
      if (tenureDateRange.startDate) {
        query.tenureDateFrom = moment(tenureDateRange.startDate).format(
          "YYYY-MM-DD",
        );
      }
      if (tenureDateRange.endDate) {
        query.tenureDateTo = moment(tenureDateRange.endDate).format(
          "YYYY-MM-DD",
        );
      }

      if (selectedActiveStatus !== "") {
        query.is_active = selectedActiveStatus;
      }

      const response = await secondaryTargetPaginatedList(query);
      setSecondaryTargets(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch Secondary Targets",
      );
    } finally {
      setTargetLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const params = {};

      // 🔹 SAME FILTERS AS PAGINATION (no page / limit)
      if (selectedTargetType) params.target_type = selectedTargetType;
      if (selectedState) params.stateId = selectedState;
      if (selectedDistributor) params.distributorId = selectedDistributor;
      if (selectedReatiler) params.retailerId = selectedReatiler;
      if (selectedTargetName) params.name = selectedTargetName;
      if (selectedRegion) params.regionId = selectedRegion;
      if (selectedSlab) params.slabId = selectedSlab;

      if (selectedBrands?.length > 0) {
        params.brandIds = selectedBrands.join(",");
      }

      if (tenureDateRange.startDate) {
        params.tenureDateFrom = moment(tenureDateRange.startDate).format(
          "YYYY-MM-DD",
        );
      }

      if (tenureDateRange.endDate) {
        params.tenureDateTo = moment(tenureDateRange.endDate).format(
          "YYYY-MM-DD",
        );
      }

      // 🔹 Call API
      const response = await secondaryTargetReportDownload(params);

      // 🔹 Create downloadable CSV
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `secondary-target-report-${moment().format("DD-MM-YYYY")}.csv`,
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully");
    } catch (error) {
      toast.error(
        error?.message || "Failed to download secondary target report",
      );
    }
  };

  const fetchSecondaryTargetsPaginated = useDebounce(
    fetchSecondaryTargetsPaginatedWithoutDebounce,
    500,
  );

  const handleResetFilter = () => {
    setSelectedRetailer("");
    setSelectedTargetType("");
    setSelectedState("");
    setSelectedTargetName("");
    setSelectedRegion("");
    setSelectedAchievementSlab("");
    setSelectedSlab("");
    setTenureDateRange({ startDate: null, endDate: null });
    setCurrentPage(1);
    // setOutletSearchTerm("");
    // setOutletSearchResults([]);
    setTargetNameSearchTerm("");
    setStateSearchTerm("");
    setSelectedActiveStatus("");
    setDistributorSearchTerm("");
    setRegionSearchTerm("");
    setSelectedBrands([]);
    fetchSecondaryTargetsPaginated();
  };

  // const handleBulkUpload = async () => {
  //   if (!bulkFile) return;
  //   setBulkUploading(true);

  //   Papa.parse(bulkFile, {
  //     header: true,
  //     skipEmptyLines: true,
  //     comments: "#",
  //     complete: async (result) => {
  //       try {
  //         const rows = result.data;
  //         if (!rows.length) {
  //           setBulkUploading(false);
  //           return;
  //         }
  //         const payload = { targets: rows };
  //         const res = await bulkcreateSecondaryTarget(
  //           currentUser?._id,
  //           payload,
  //         );

  //         const { inserted, failed, failedCSV } = res.data;
  //         setFailedCSV(failedCSV || null);
  //         setFailedCount(failed || 0);

  //         toast.success(`Inserted: ${inserted}, failed ${failed}`);
  //         setOpenBulkModal(false);
  //         fetchSecondaryTargetsPaginated();
  //       } catch (error) {
  //         toast.error(error?.response?.data?.message || "Bulk upload failed");
  //       } finally {
  //         setBulkUploading(false);
  //         setBulkFile(null);
  //         if (fileInputRef.current) {
  //           fileInputRef.current.value = "";
  //         }
  //       }
  //     },
  //   });
  // };

  // const downloadBulkTemplate = () => {
  //   const headers = [
  //     "Retailer UID",
  //     "Retailer Name",
  //     "Target Name",
  //     "Target Type",
  //     "Target Qty/Value",
  //     "Start Date",
  //     "End Date",
  //   ];

  //   const instructions = [
  //     "# Instructions:",
  //     "# Target Name: Required",
  //     "# Target Type: Required (volume/value)",
  //     "# Quantity: Required (Example: 1000)",
  //     "# Start Date: Required (Format: DD-MM-YYYY, Example: 01-01-2026)",
  //     "# End Date: Required (Format: DD-MM-YYYY, Example: 31-03-2026)",
  //     "# Retailer UID: Required (Example: RET001)",
  //     "# Retailer Name: Optional",
  //     "#",
  //   ];

  //   const csvContent =
  //     instructions.join("\n") + "\n" + headers.join(",") + "\n";

  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", "secondary-target-bulk-template.csv");
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // const downloadFailedCSV = (base64CSV) => {
  //   const link = document.createElement("a");
  //   link.href = "data:text/csv;base64," + base64CSV;
  //   link.download = "secondary-target-failed.csv";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  useEffect(() => {
    if (currentUser?._id) {
      fetchSecondaryTargetsPaginated();
    }
  }, [
    currentPage,
    selectedTargetType,
    selectedState,
    selectedReatiler,
    selectedTargetName,
    selectedRegion,
    selectedSlab,
    selectedBrands,
    selectedAchievementSlab,
    selectedActiveStatus,
    selectedDistributor,
    tenureDateRange.startDate,
    tenureDateRange.endDate,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedTargetType,
    selectedState,
    selectedReatiler,
    selectedTargetName,
    selectedRegion,
    selectedSlab,
    selectedBrands,
    selectedDistributor,
    selectedAchievementSlab,
    selectedActiveStatus,
    tenureDateRange.startDate,
    tenureDateRange.endDate,
  ]);

  // useEffect(() => {
  //   if (currentUser?._id) {
  //     getOutletList();
  //   }
  // }, [currentUser?._id]);

  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchRegions());
    dispatch(fetchDistributors());
    dispatch(fetchBrands());
    getSlabList();
  }, [dispatch]);

  const onPageChange = (page) => setCurrentPage(page);

  return (
    <>
      {pagePermission?.view ? (
        <div className="flex justify-start items-center flex-col gap-4 w-full ">
          {/* Page Header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4 ">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Secondary Target Setting</h1>
            </div>
          </div>

          {/* filter box */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count : {totalItems}</Badge>
                <Badge color="warning">Filtered Count : {filteredCount}</Badge>
              </div>

              {/* filter dropdowns - Row 1 */}
              <div className="flex justify-center w-full items-center gap-4 flex-wrap ">
                {/* Retailer dropdown */}
                {/* <div className="w-45">
              <div className="mb-2 block">
                <Label htmlFor="retailerSelect" value="Select Retailer" />
              </div>
              <SearchableSelect
                options={getDisplayOutletList()}
                value={selectedReatiler}
                onChange={(e) => setSelectedRetailer(e.target.value)}
                onSearchChange={(term) => setOutletSearchTerm(term)}
                isSearching={isSearchingOutlet}
                placeholder={
                  outletLoading ? "Loading..." : "Type to search retailer..."
                }
                disabled={outletLoading}
                displayKey="outletName"
                descKey="outletUID"
                valueKey="_id"
                className="w-full"
                id="retailer-select"
                label="Retailer Name"
                defaultValue=""
              />
            </div> */}
                {/* Retailer dropdown */}
                <div className="w-45">
                  <div className="mb-2 block">
                    <Label htmlFor="retailerSelect" value="Select Retailer" />
                  </div>
                  <PaginatedSearchableSelect
                    id="retailer-select"
                    className="w-full"
                    fetchOptions={fetchOutletsWithSearch}
                    value={selectedReatiler}
                    onChange={handleRetailerChange}
                    disabled={false}
                    placeholder="Select Retailer"
                    displayKey="outletName"
                    descKey="outletUID"
                    valueKey="_id"
                    searchPlaceholder="Search Retailer..."
                  />
                </div>

                {/* Target Name - SearchableSelect */}
                <div className="w-45">
                  <div className="mb-2 block">
                    <Label htmlFor="targetNameSelect" value="Target Name" />
                  </div>
                  <SearchableSelect
                    options={getDisplayTargetNameList().map(
                      formatTargetNameOption,
                    )}
                    value={selectedTargetName}
                    onChange={(e) => setSelectedTargetName(e.target.value)}
                    onSearchChange={(term) => setTargetNameSearchTerm(term)}
                    isSearching={isSearchingTargetName}
                    placeholder="Type to search target name..."
                    disabled={false}
                    displayKey="name"
                    valueKey="_id"
                    className="w-full"
                    id="targetName-select"
                    label="Target Name"
                    defaultValue=""
                  />
                </div>

                {/* Target Type dropdown */}
                <div className="w-40">
                  <div className="mb-2 block">
                    <Label htmlFor="targetTypeSelect" value="Target Type" />
                  </div>
                  <Select
                    id="targetTypeSelect"
                    value={selectedTargetType}
                    onChange={(e) => setSelectedTargetType(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="volume">Volume</option>
                    <option value="value">Value</option>
                  </Select>
                </div>

                {/* Distributor dropdown */}
                <div className="w-45">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="distributorSelect"
                      value="Select Distributor"
                    />
                  </div>
                  <SearchableSelect
                    options={getDisplayDistributorList()}
                    value={selectedDistributor}
                    onChange={(e) => setSelectedDistributor(e.target.value)}
                    onSearchChange={(term) => setDistributorSearchTerm(term)}
                    isSearching={isSearchingDistributor}
                    placeholder={
                      distributorsLoading
                        ? "Loading..."
                        : "Type to search distributor..."
                    }
                    disabled={distributorsLoading}
                    displayKey="name"
                    descKey="dbCode"
                    valueKey="_id"
                    className="w-full"
                    id="distributor-select"
                    label="Distributor Name"
                    defaultValue=""
                  />
                </div>

                <div className="w-45">
                  <div className="mb-2 block">
                    <Label htmlFor="brandSelect" value="Select Brands" />
                  </div>
                  <SearchableSelect
                    options={brands}
                    value={selectedBrands}
                    onChange={(e) => setSelectedBrands(e.target.value)}
                    placeholder={
                      brandsLoading ? "Loading..." : "selected brands"
                    }
                    disabled={brandsLoading}
                    displayKey="name"
                    descKey="code"
                    valueKey="_id"
                    className="w-full"
                    id="brand-select"
                    label="Brand"
                    multiple={true}
                    defaultValue={[]}
                  />
                </div>
              </div>

              {/* filter dropdowns - Row 2 */}
              <div className="flex justify-center w-full items-center gap-4 flex-wrap mt-2">
                {/* State - SearchableSelect */}
                <div className="w-44">
                  <div className="mb-2 block">
                    <Label htmlFor="stateSelect" value="Select State" />
                  </div>
                  <SearchableSelect
                    options={getDisplayStateList()}
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    onSearchChange={(term) => setStateSearchTerm(term)}
                    isSearching={isSearchingState}
                    placeholder={
                      statesLoading ? "Loading..." : "Type to search state..."
                    }
                    disabled={statesLoading}
                    displayKey="name"
                    valueKey="_id"
                    className="w-full"
                    id="state-select"
                    label="State"
                    defaultValue=""
                  />
                </div>
                {/* Region - SearchableSelect */}
                <div className="w-44">
                  <div className="mb-2 block">
                    <Label htmlFor="regionSelect" value="Region" />
                  </div>
                  <SearchableSelect
                    options={getDisplayRegionList()}
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    onSearchChange={(term) => setRegionSearchTerm(term)}
                    isSearching={isSearchingRegion}
                    placeholder={
                      regionsLoading ? "Loading..." : "Type to search region..."
                    }
                    disabled={regionsLoading}
                    displayKey="name"
                    valueKey="_id"
                    className="w-full"
                    id="region-select"
                    label="Region"
                    defaultValue=""
                  />
                </div>
                {/* Achievement Slab Dropdown */}

                <div className="w-44">
                  <div className="mb-2 block">
                    <Label htmlFor="activeStatusSelect" value="Status" />
                  </div>
                  <Select
                    id="activeStatusSelect"
                    value={selectedActiveStatus}
                    onChange={(e) => setSelectedActiveStatus(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </div>

                {/* Target Slab Dropdown - NEW */}
                <div className="w-44">
                  <div className="mb-2 block">
                    <Label htmlFor="slabSelect" value="Target Slab" />
                  </div>
                  <Select
                    id="slabSelect"
                    value={selectedSlab}
                    onChange={(e) => setSelectedSlab(e.target.value)}
                    disabled={slabLoading}
                  >
                    <option value="">All Slabs</option>
                    {slabList.map((slab) => (
                      <option key={slab._id} value={slab._id}>
                        {slab.name}{" "}
                        {slab.slab_type === "percentage"
                          ? `(${slab.perc_slab}%)`
                          : `(${slab.min_range}–${slab.max_range})`}
                      </option>
                    ))}
                  </Select>
                </div>
                {/* Tenure Date Range using Datepicker */}
                <div className="w-64">
                  <div className="block">
                    <Label value="Tenure Date" />
                  </div>
                  <Datepicker
                    inputClassName="relative py-1.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500"
                    showShortcuts={true}
                    value={tenureDateRange}
                    onChange={(newValue) => setTenureDateRange(newValue)}
                    size="sm"
                  />
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-center w-full items-center gap-2 flex-wrap mt-3">
                {/* Reset button */}
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
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="info"
                    onClick={handleDownloadCSV}
                  >
                    <FaDownload size={15} className="mx-2" />
                    <span className="flex justify-center items-center gap-2">
                      Download CSV
                    </span>
                  </Button>
                )}

                {/* create single target at once */}
                {pagePermission?.create && (
                  <Button
                    className="text-xs"
                    color="blue"
                    onClick={() => setOpenCreateSingleTargetModal(true)}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <IoMdAddCircle size={20} />
                      Create Single Target
                    </span>
                  </Button>
                )}
                {pagePermission?.create && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="purple"
                    onClick={() => setOpenBulkWithDbCodeModal(true)}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <IoMdAddCircle size={20} />
                      Bulk Upload (DB Code)
                    </span>
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Pagination*/}
          <div className="flex justify-end items-center w-full px-4">
            <div className="flex overflow-x-auto sm:justify-center">
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  showIcons
                />
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <div className="overflow-x-auto w-full">
              <Table striped>
                <Table.Head className="text-center">
                  <Table.HeadCell>Target Name</Table.HeadCell>
                  <Table.HeadCell>Target UID</Table.HeadCell>
                  <Table.HeadCell>Retailer UID</Table.HeadCell>
                  <Table.HeadCell>Retailer Code (SFA)</Table.HeadCell>
                  <Table.HeadCell>Retailer Name</Table.HeadCell>
                  <Table.HeadCell>Distributor Name</Table.HeadCell>
                  <Table.HeadCell>Brands</Table.HeadCell>
                  <Table.HeadCell>Sub Brands</Table.HeadCell>
                  <Table.HeadCell>Target Type</Table.HeadCell>
                  <Table.HeadCell>Target Qty/Value</Table.HeadCell>
                  <Table.HeadCell>Target Tenure (from)</Table.HeadCell>
                  <Table.HeadCell>Target Tenure (To)</Table.HeadCell>
                  <Table.HeadCell>State</Table.HeadCell>
                  <Table.HeadCell>Region</Table.HeadCell>
                  <Table.HeadCell>Current Slab</Table.HeadCell>
                  <Table.HeadCell>Slab Range / %</Table.HeadCell>
                  <Table.HeadCell>Discount %</Table.HeadCell>
                  <Table.HeadCell>Target Achieved</Table.HeadCell>
                  <Table.HeadCell>Sales Return</Table.HeadCell>
                  <Table.HeadCell>Achievement %</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  {pagePermission?.update && (
                    <Table.HeadCell>Actions</Table.HeadCell>
                  )}
                </Table.Head>

                {/* Table body */}
                <Table.Body>
                  {targetLoading ? (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="100%"
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
                      {secondaryTargets?.map((target) => (
                        <Table.Row
                          key={target._id}
                          className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.name}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.target_code}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.retailerId.outletUID}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.retailerId.outletCode}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.retailerId.outletName}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.distributorId.name}
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <TagPopover
                              items={target.brands}
                              label="Brands"
                              color="indigo"
                            />
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <TagPopover
                              items={target.subBrands}
                              label="Sub Brands"
                              color="cyan"
                            />
                          </Table.Cell>

                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <Badge
                              color={
                                target?.target_type === "volume"
                                  ? "info"
                                  : "purple"
                              }
                              size="sm"
                              className="justify-center items-center w-22 font-semibold text-white dark:text-blue-700 bg-opacity-90"
                            >
                              {target?.target_type?.toUpperCase()}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.target}{" "}
                            {target?.target_type === "volume" ? "Pcs" : "₹ "}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.target_from}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.target_to}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.state}
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.region}
                          </Table.Cell>
                          {/* Current Slab Name */}
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-center">
                            {target.currentSlab ? (
                              <Badge
                                color={
                                  target.currentSlab.slab_type === "volume"
                                    ? "info"
                                    : target.currentSlab.slab_type === "value"
                                      ? "purple"
                                      : "success"
                                }
                                size="sm"
                                className="justify-center"
                              >
                                {target.currentSlab.name}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No Slab
                              </span>
                            )}
                          </Table.Cell>

                          {/* Slab Range or Percentage */}
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-center">
                            {target.currentSlab ? (
                              target.currentSlab.slab_type === "percentage" ? (
                                <span className="text-green-600 font-semibold text-sm">
                                  {target.currentSlab.perc_slab}%
                                </span>
                              ) : (
                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                  {target.currentSlab.min_range} –{" "}
                                  {target.currentSlab.max_range}
                                </span>
                              )
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </Table.Cell>

                          {/* Discount */}
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 text-center">
                            {target.currentSlab?.discount != null ? (
                              <Badge
                                color="warning"
                                size="sm"
                                className="justify-center"
                              >
                                {target.currentSlab.discount}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </Table.Cell>
                          {/* Target Achieved */}
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.achivedTarget || 0}{" "}
                            {target?.target_type === "volume" ? "Pcs" : "₹"}
                          </Table.Cell>

                          {/* Sales Return */}
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.returnedQty || 0}{" "}
                            {target?.target_type === "volume" ? "Pcs" : "₹"}
                          </Table.Cell>
                          

                          {/* Achievement % */}
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            {target?.target > 0
                              ? Math.min(
                                  ((target?.achivedTarget || 0) /
                                    target?.target) *
                                    100,
                                  100,
                                ).toFixed(2)
                              : "0.00"}
                            %
                          </Table.Cell>

                          {/* Status */}
                          <Table.Cell className="whitespace-nowrap font-medium text-center">
                            <Badge
                              color={target?.is_active ? "success" : "failure"}
                              size="sm"
                              className="justify-center"
                            >
                              {target?.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit Button */}
                              {pagePermission?.update && (
                                <button
                                  onClick={() => handleEditClick(target)}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  title="Edit Target"
                                >
                                  <FiEdit size={16} />
                                </button>
                              )}

                              {/* Delete Button */}
                              {pagePermission?.delete && (
                                <button
                                  onClick={() => handleDeleteTarget(target._id)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Delete Target"
                                >
                                  <FaTrash size={16} />
                                </button>
                              )}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                      {secondaryTargets?.length === 0 && (
                        <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell
                            colSpan="100%"
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
          <BulkUploadWithDbCodeModal
            openModal={openBulkWithDbCodeModal}
            onCloseModal={() => setOpenBulkWithDbCodeModal(false)}
            onSuccess={() => fetchSecondaryTargetsPaginated()}
          />

          <CreateSingleTargetModal
            openModal={openCreateSingleTargetModal}
            onCloseModal={() => setOpenCreateSingleTargetModal(false)}
            onSuccess={() => fetchSecondaryTargetsPaginated()}
          />

          <EditSecondaryTargetModal
            openModal={oepnEditModal}
            onCloseModal={() => {
              setOpenEditModal(false);
              setSelectedTarget(null);
            }}
            currentUser={currentUser}
            targetData={selectedTarget}
            onSuccess={() => fetchSecondaryTargetsPaginated()}
          />
        </div>
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
    </>
  );
};

export default SecondaryTarget;
