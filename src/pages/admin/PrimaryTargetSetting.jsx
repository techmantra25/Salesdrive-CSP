import React, { useContext, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchStates } from "../../redux/stateSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchZones } from "../../redux/zoneSlice";
import Datepicker from "react-tailwindcss-datepicker";
import { BrandListModal } from "../../components/BrandListModal";
import toast from "react-hot-toast";
import { getDistributorSubBrandList } from "../../api/api";
import SearchableSelect from "../../components/SearchableSelect";

import {
  getPrimaryTargetsList,
  createPrimaryTarget,
  editPrimaryTarget,
  updatePrimaryTargetStatus,
  createBulkPrimaryTargets,
  deletePrimaryTarget,
  downloadPrimaryTargetsCSV
} from "../../api/primaryTargetsApi";
import { useDebounce } from "../../hooks/useDebounce";
// import toast from "react-hot-toast";
// import brandslice from "../../redux/brandSlice";
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
  Textarea,
  TextInput,
} from "flowbite-react";
import { RiRefreshFill } from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";
import { FiEdit, FiCheck, FiX } from "react-icons/fi";
import moment from "moment";
import UniqueCode from "../../assets/common/UniqueCode";
import Papa from "papaparse";
import { getAllPrimarySlab } from "../../api/api";
import { IoIosList } from "react-icons/io";
import { getPagePermission } from "../../utils/permissionHelper";
import { fetchBrands } from "../../redux/brandSlice";



const PrimaryTargetSetting = () => {

  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );
  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );
  const { regions } = useSelector((state) => state.region);
  const { zones } = useSelector((state) => state.zone);

  const activeDistributors = distributors.filter(
    (distributor) => distributor.status === true
  );
  const [selectedBrand, setSelectedBrand] = useState("default");
  const [allTargetNames, setAllTargetNames] = useState([]);
  const activeStates = [...states].filter((state) => state.status === true);
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [slabs, setSlabs] = useState([]);
  const [selectedTargetName, setSelectedTargetName] = useState("default");
  const [formLoading, setFormLoading] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [primaryTargets, setPrimaryTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [selectedTargetForReject, setSelectedTargetForReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedState, setSelectedState] = useState("default");
  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [selectedApprovalStatus, setSelectedApprovalStatus] =
    useState("default");
  const [selectedTargetType, setSelectedTargetType] = useState("default");
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [targetPeriod, setTargetPeriod] = useState({
    startDate: null,
    endDate: null,
  });
  const [openBulkModal, setOpenBulkModal] = useState(false);
  const [modalDistributor, setModalDistributor] = useState("");
  const [selectedSlab, setSelectedSlab] = useState("default");
  const [openBrandsModal, setOpenBrandsModal] = useState(false);
  const [selectedDistributorForBrands, setSelectedDistributorForBrands] =
    useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [failedCSV, setFailedCSV] = useState(null);
  const [failedCount, setFailedCount] = useState(0);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [subBrands, setSubBrands] = useState([]);
  const { brands: reduxBrands } = useSelector((state) => state.brand);
  const [filterBrands, setFilterBrands] = useState([]);
  const [modalBrands, setModalBrands] = useState([]);
  const [openBrandModal, setOpenBrandModal] = useState(false);
  const [selectedBrandData, setSelectedBrandData] = useState(null);
  const [activeBrandId, setActiveBrandId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("true");
  const [filterDateRange, setFilterDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [createdDateRange, setCreatedDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    distributorId: "",
    target_type: "",
    targetValue: "",
    targetVolume: "",
    brandId: [],
    subBrandId: [],
    target_start_date: "",
    target_end_date: "",
    regionId: "",
    zoneId: "",
    stateId: "",
  });

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "primary-target-vs-achievement-setting"
    );

    setPagePermission(permission);
  }, [permissionState]);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);



  const onPageChange = (page) => setCurrentPage(page);

  let fetchPrimaryTargetsPaginatedWithOutDebounce = async () => {
    try {
      setTargetsLoading(true);
      const query = {
        page: currentPage,
        limit: 10,
      };
      if (selectedBrand !== "default") {
        query.brandId = selectedBrand;
      }
      if (selectedRegion !== "default") {
        query.regionId = selectedRegion;
      }


      if (selectedApprovalStatus !== "default") {
        query.approval_status = selectedApprovalStatus;
      }
      if (selectedTargetName !== "default") {
        query.search = selectedTargetName;
      }
      if (selectedStatus !== "default") {
        query.isActive = selectedStatus;
      }

      if (selectedState !== "default") {
        query.stateId = selectedState;
      }

      if (selectedDistributor !== "default") {
        query.distributorId = selectedDistributor;
      }

      if (selectedTargetType !== "default") {
        query.target_type = selectedTargetType;
      }
      if (selectedSlab !== "default") {
        query.slabId = selectedSlab;
      }


      if (filterDateRange.startDate && filterDateRange.endDate) {
        const start = new Date(filterDateRange.startDate);
        const end = new Date(filterDateRange.endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        query.fromDate = start.toISOString();
        query.toDate = end.toISOString();
      }
      if (createdDateRange.startDate && createdDateRange.endDate) {
        const cStart = new Date(createdDateRange.startDate);
        const cEnd = new Date(createdDateRange.endDate);

        cStart.setHours(0, 0, 0, 0);
        cEnd.setHours(23, 59, 59, 999);

        query.createdFrom = cStart.toISOString();
        query.createdTo = cEnd.toISOString();
      }


      const response = await getPrimaryTargetsList(query);
      setPrimaryTargets(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Primary Targets"
      );
    } finally {
      setTargetsLoading(false);
    }
  };

  let fetchPrimaryTargetsPaginated = useDebounce(
    fetchPrimaryTargetsPaginatedWithOutDebounce,
    500
  );
  const fetchAllTargetNames = async () => {
    try {
      const res = await getPrimaryTargetsList({
        page: 1,
        limit: 10000, // safe upper bound
      });

      const names = res?.data?.data
        ?.map((t) => t.name)
        .filter(Boolean);

      setAllTargetNames(Array.from(new Set(names)));
    } catch (err) {
      console.error("Failed to fetch target names");
    }
  };

  const handleResetFilter = () => {
    setSelectedApprovalStatus("default");
    setSelectedState("default");
    setSelectedDistributor("default");
    setSelectedBrand("default");
    setSelectedTargetType("default");
    setSelectedRegion("default");
    setFilterDateRange({ startDate: null, endDate: null });
    setCreatedDateRange({ startDate: null, endDate: null });
    setSelectedSlab("default");
    setCurrentPage(1);
    dispatch(fetchStates());
    dispatch(fetchDistributors());
    setSelectedStatus("default");
    dispatch(fetchRegions());
    dispatch(fetchZones());
    fetchPrimaryTargetsPaginated();
  };

  const validate = () => {
    if (!formData.name.trim()) {
      toast.error("Target name is required");
      return false;
    }
    if (!formData.distributorId) {
      toast.error("Distributor is required");
      return false;
    }
    if (!formData.target_type) {
      toast.error("Target type is required");
      return false;
    }

    if (
      (formData.target_type === "value" &&
        (!formData.targetValue || formData.targetValue <= 0)) ||
      (formData.target_type === "volume" &&
        (!formData.targetVolume || formData.targetVolume <= 0))
    ) {
      toast.error("Target must be greater than 0");
      return false;
    }

    if (!formData.target_start_date || !formData.target_end_date) {
      toast.error("Target Period is required");
      return false;
    }

    return true;
  };

  useEffect(() => {
    fetchAllTargetNames();
  }, []);

  useEffect(() => {
    if (!reduxBrands || reduxBrands.length === 0) return;

    const activeBrands = reduxBrands.filter((b) => b.status === true);

    setFilterBrands(activeBrands);
  }, [reduxBrands]);
  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedTarget(null);
    setModalDistributor("");

    setFormData({
      name: "",
      distributorId: "",
      target_type: "",
      targetValue: "",
      targetVolume: "",
      brandId: [],
      subBrandId: [],
      target_start_date: "",
      target_end_date: "",
      regionId: "",
      zoneId: "",
      stateId: "",
    });

    setTargetPeriod({ startDate: null, endDate: null });
    setModalBrands([]);
    setSubBrands([]);

    fetchPrimaryTargetsPaginated();
  };


  const handleSetEdit = (target) => {

    setSelectedTarget(target);
    setModalMode("edit");

    const distributorId = target?.distributorId?._id ?? "";

    // ✅ SET DISTRIBUTOR FIRST
    setModalDistributor(distributorId);

    setTargetPeriod({
      startDate: target.target_start_date,
      endDate: target.target_end_date,
    });

    // ✅ DELAY brandId setting until brandOptions ready
    setTimeout(() => {

      setFormData({
        name: target?.name ?? "",
        distributorId: distributorId,
        target_type: target?.target_type ?? "",
        targetValue: target?.targetValue ?? "",
        targetVolume: target?.targetVolume ?? "",
        brandId: Array.isArray(target?.brandId)
          ? target.brandId.map(b => b._id)
          : target?.brandId?._id
            ? [target.brandId._id]
            : [],
        target_start_date: target?.target_start_date ?? "",
        target_end_date: target?.target_end_date ?? "",
        regionId: target?.regionId?._id ?? "",
        zoneId: target?.zoneId?._id ?? "",
        stateId: target?.stateId?._id ?? "",
      });

    }, 0);

    setOpenModal(true);
  };


  const [allTargets, setAllTargets] = useState([]);

  const fetchAllTargets = async () => {
    try {
      const res = await getPrimaryTargetsList({
        page: 1,
        limit: 10000,
      });

      setAllTargets(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch all targets");
    }
  };

  useEffect(() => {
    fetchAllTargets();
  }, []);

  const targetNameOptions = React.useMemo(() => {
    return allTargets.map((t) => ({
      _id: t.targetUid,
      searchLabel: `${t.name} (${t.targetUid})`,
    }));
  }, [allTargets]);
  const handleAddTarget = async () => {
    try {
      if (!validate()) return;

      setFormLoading(true);

      const payload = {
        name: formData.name,
        distributorId: formData.distributorId,
        brandId: formData.brandId,
        subBrandId: formData.subBrandId,
        target_type: formData.target_type,
        targetValue:
          formData.target_type === "value"
            ? Number(formData.targetValue)
            : null,
        targetVolume:
          formData.target_type === "volume"
            ? Number(formData.targetVolume)
            : null,
        target_start_date: formData.target_start_date,
        target_end_date: formData.target_end_date,
        regionId: formData.regionId || null,
        zoneId: formData.zoneId || null,
        stateId: formData.stateId || null,
      };



      const response = await createPrimaryTarget(payload);

      if (response?.status === 200 || response?.status === 201) {
        toast.success("Primary Target Created Successfully");
        onCloseModal(); // 🔥 modal closes here
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to add Primary Target, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };


  const handleEditTarget = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this Primary Target?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            if (!validate()) return;
            setFormLoading(true);
            const payload = {
              name: formData.name,
              brandId: formData.brandId,
              distributorId: formData.distributorId,
              target_type: formData.target_type,
              targetValue:
                formData.target_type === "value"
                  ? Number(formData.targetValue)
                  : null,
              targetVolume:
                formData.target_type === "volume"
                  ? Number(formData.targetVolume)
                  : null,
              target_start_date: formData.target_start_date,
              target_end_date: formData.target_end_date,
              regionId: formData.regionId || null,
              zoneId: formData.zoneId || null,
              stateId: formData.stateId || null,
            };

            const res = await editPrimaryTarget(selectedTarget?._id, payload);
            if (res?.status === 201) {
              toast.success("Primary Target Updated Successfully");
              setFormLoading(false);
              onCloseModal();
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update Primary Target, try again"
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

  const handleModalDistributorChange = async (distributorId) => {

    setModalDistributor(distributorId);

    setFormData((prev) => ({
      ...prev,
      distributorId: distributorId,
      brandId: [],
      subBrandId: []
    }));

    if (!distributorId) return;

    try {

      const res = await getDistributorSubBrandList(distributorId);

      const list = res?.data?.data || [];

      // store all subbrands
      setSubBrands(list);

      // extract unique brands from subbrands
      const uniqueBrands = [
        ...new Map(
          list
            .filter((s) => s.brandId)
            .map((s) => [s.brandId._id, s.brandId])
        ).values(),
      ];

      setModalBrands(uniqueBrands);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load distributor brands");
    }
  };
  // const handleApproveTarget = async (target) => {
  //   openConfirmationModel({
  //     question: "Are you sure you want to approve this Primary Target?",
  //     answer: ["Yes", "No"],
  //     onClose: async (result) => {
  //       if (result) {
  //         try {
  //           const payload = {
  //             approval_status: "Approved",
  //           };
  //           const res = await updatePrimaryTargetStatus(target._id, payload);
  //           if (res?.status === 201) {
  //             toast.success("Primary Target approved successfully");
  //             fetchPrimaryTargetsPaginated();
  //           }
  //         } catch (error) {
  //           console.error(error);
  //           toast.error(
  //             error?.response?.data?.message ||
  //             "Failed to approve Primary Target"
  //           );
  //         }
  //       }
  //     },
  //   });
  // };

  // const handleRejectTarget = (target) => {
  //   setSelectedTargetForReject(target);
  //   setOpenRejectModal(true);
  // };

  const handleSubmitReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Reject reason is required");
      return;
    }

    try {
      const payload = {
        approval_status: "Rejected",
        reject_reason: rejectReason,
      };
      const res = await updatePrimaryTargetStatus(
        selectedTargetForReject._id,
        payload
      );
      if (res?.status === 201) {
        toast.success("Primary Target rejected successfully");
        setOpenRejectModal(false);
        setRejectReason("");
        setSelectedTargetForReject(null);
        fetchPrimaryTargetsPaginated();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to reject Primary Target"
      );
    }
  };

  // const getApprovalStatusBadge = (status) => {
  //   switch (status) {
  //     case "Approved":
  //       return <Badge color="success">Approved</Badge>;
  //     case "Rejected":
  //       return <Badge color="failure">Rejected</Badge>;
  //     case "Pending":
  //       return <Badge color="warning">Pending</Badge>;
  //     default:
  //       return <Badge color="gray">Unknown</Badge>;
  //   }
  // };

  // const getMonthName = (monthNumber) => {
  //   const month = months.find((m) => m.value === monthNumber);
  //   return month ? month.label : monthNumber;
  // };

  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchDistributors());
    dispatch(fetchRegions());
    dispatch(fetchZones());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    fetchPrimaryTargetsPaginated();
  }, [
    currentPage,
    selectedBrand,
    selectedRegion,
    selectedApprovalStatus,
    selectedTargetName,
    selectedSlab,
    selectedState,
    selectedDistributor,
    selectedTargetType,
    filterDateRange,
    selectedStatus,
    createdDateRange,
  ]);


  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedApprovalStatus,
    selectedStatus,
    selectedBrand,
    selectedState,
    selectedDistributor,
    selectedRegion,
    selectedTargetName,
    selectedSlab,
    selectedTargetType,
    selectedStatus,
    filterDateRange,
    createdDateRange,
  ]);

  const handleBulkUpload = async () => {
    if (!bulkFile) return;

    setBulkUploading(true);   // 🔥 start loading

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const rows = result.data;
          if (!rows.length) {
            setBulkUploading(false);
            return;
          }

          const payload = { targets: rows };
          const res = await createBulkPrimaryTargets(payload);

          const { inserted, updated, failed, failedCSV } = res.data;

          setFailedCSV(failedCSV || null);
          setFailedCount(failed || 0);

          toast.success(
            `Inserted: ${inserted}, Updated: ${updated}, Failed: ${failed}`
          );

          setOpenBulkModal(false);
          fetchPrimaryTargetsPaginated();

        } catch (error) {
          toast.error(error?.response?.data?.message || "Bulk upload failed");
        } finally {
          setBulkUploading(false);
          setBulkFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }

      },
    });
  };



  const downloadBulkTemplate = () => {
    const headers = [
      "Distributor Code",
      "Brand",
      "Sub Brand",
      "Target Name",
      "Target Type",
      "Target Qty (PC)/Value (INR)",
      "Target  Tenure  (from)",
      "Target  Tenure  (to)",
    ];

    const rules = [
      '"Required  [Example: DDDU0101}"',
      '"Required [Example: MC,BM,BR]"',
      '"Required [Example: SB001,MLML]"',
      '"Required "',
      '"Required [Example: Volume/Value]"',
      '"Required [Example: 1000 | NOTE: Volume = PCS, Value = INR]"',
      '"Required  [Example: 11-02-2026]"',
      '"Required [Example: 10-03-2026]"',
    ];


    const csvContent =
      headers.join(",") + "\n" +
      rules.join(",") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "primary-target-bulk-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFailedCSV = (base64CSV) => {
    const link = document.createElement("a");
    link.href = "data:text/csv;base64," + base64CSV;
    link.download = "primary-target-failed.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const distributorOptions = activeDistributors.map((d) => ({
    _id: d._id,
    name: d.name,
    code: d.dbCode,
    searchLabel: `${d.name} (${d.dbCode})`
  }));

  const brandOptions = React.useMemo(() => {
    return modalBrands.map((brand) => ({
      _id: brand._id,
      name: brand.code,
      desc: brand.desc,
      searchLabel: `${brand.code} (${brand.desc})`
    }));
  }, [modalBrands]);


  const subBrandOptions = React.useMemo(() => {
    if (!formData.brandId?.length) return [];

    return subBrands
      .filter((sub) => formData.brandId.includes(sub.brandId?._id))
      .map((sub) => ({
        _id: sub._id,
        searchLabel: `${sub.brandId?.code} → ${sub.code} (${sub.desc})`,
      }));
  }, [subBrands, formData.brandId]);
  // const syncReduxBrandsToLocal = () => {
  //   if (!reduxBrands || reduxBrands.length === 0) return;

  //   const activeBrands = reduxBrands.filter((b) => b.status === true);

  //   setBrands(activeBrands);
  // };

  // useEffect(() => {
  //   syncReduxBrandsToLocal();
  // }, [reduxBrands]);


  const brandFilterOptions = React.useMemo(() => {

    return filterBrands.map((brand) => ({
      _id: brand._id,
      searchLabel: `${brand.name}${brand.desc ? ` (${brand.desc})` : ""}`,
      name: brand.name,
    }));

  }, [filterBrands]);


  const handleDeleteTarget = (target) => {
    openConfirmationModel({
      question: "Are you sure you want to permanently delete this Primary Target?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (!result) return;

        try {
          const res = await deletePrimaryTarget(target._id);

          if (res.status === 200) {
            toast.success("Primary Target deleted successfully");
            fetchPrimaryTargetsPaginated();
          }
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete Primary Target"
          );
        }
      },
    });
  };
  // const hasTargetStarted = (startDate) => {
  //   const now = new Date();
  //   const start = new Date(startDate);
  //   return now >= start;
  // };

  const hasTargetEnded = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return now > end;
  };

  const stateOptions = activeStates.map((s) => ({
    _id: s._id,
    name: s.name,
    code: s.code,
    searchLabel: `${s.name}${s.code ? ` (${s.code})` : ""}`,
  }));
  const regionOptions = regions
    ?.filter((r) => r.status !== false) // safe guard
    .map((r) => ({
      _id: r._id,
      name: r.name,
      code: r.code,
      searchLabel: `${r.name}${r.code ? ` (${r.code})` : ""}`,
    })) || [];


  const getAchievedPercentage = (target) => {
    if (!target?.achivedTarget) return 0;

    const total =
      target.target_type === "volume"
        ? target.targetVolume
        : target.targetValue;

    if (!total || total <= 0) return 0;

    return (target.achivedTarget / total) * 100;
  };
  const tableSlabs = slabs
    .filter(slab => slab.is_active)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));


  useEffect(() => {
    setSelectedBrand("default");
    setSelectedRegion("default");
  }, [selectedDistributor]);


  useEffect(() => {
    const fetchSlabs = async () => {
      try {
        const res = await getAllPrimarySlab();
        setSlabs(res?.data?.data || []);
      } catch (err) {
        toast.error("Failed to load slabs");
      }
    };

    fetchSlabs();
  }, []);

  const handleShowBrands = (target) => {
    setSelectedDistributorForBrands(target?.distributorId);
    setOpenBrandsModal(true);
  };

  const handleDownloadCSV = () => {
    try {
      if (!primaryTargets || primaryTargets.length === 0) {
        toast.error("No data to download");
        return;
      }

      const data = primaryTargets.map((target) => ({
        "Target UID": target?.targetUid || "-", // ✅ FIRST COLUMN

        "Target Name": target?.name || "-",
        "Target Type": target?.target_type?.toUpperCase() || "-",

        "Distributor":
          target?.distributorId
            ? `${target.distributorId.name} (${target.distributorId.dbCode})`
            : "-",

        "Brand":
          target?.brandId && target.brandId.length > 0
            ? target.brandId.map(b => b.code || b.name).join(", ")
            : "All Brands",

        "Sub Brand":
          target?.subBrandId && target.subBrandId.length > 0
            ? target.subBrandId.map(sb => sb.code || sb.name).join(", ")
            : "All Sub Brands",

        "Status": target?.isActive ? "Active" : "Inactive",

        "Target Qty/Value":
          target?.target_type === "value"
            ? target?.targetValue?.toLocaleString()
            : target?.targetVolume?.toLocaleString(),

        "Target Tenure (From)": moment(target?.target_start_date).format("DD MMM YYYY"),
        "Target Tenure (To)": moment(target?.target_end_date).format("DD MMM YYYY"),

        "State":
          target?.stateId
            ? `${target.stateId.name} (${target.stateId.code})`
            : target?.distributorId?.stateId
              ? `${target.distributorId.stateId.name} (${target.distributorId.stateId.code})`
              : "-",

        "Region":
          target?.regionId
            ? `${target.regionId.name} (${target.regionId.code})`
            : target?.distributorId?.regionId
              ? `${target.distributorId.regionId.name} (${target.distributorId.regionId.code})`
              : "-",

        "Slab": target?.achievedSlab?.name || "-",

        "Slab Range / %":
          target?.achievedSlab?.slab_type === "percentage"
            ? `${target?.achievedSlab?.total_percentage}%`
            : target?.achievedSlab
              ? `${target?.achievedSlab?.min_range} - ${target?.achievedSlab?.max_range}`
              : "-",

        "Scheme %": `${target?.achievedSlab?.discount_percentage ?? 0}%`,

        // ✅ UPDATED PART
        "Total Achieved":
          target?.achivedTarget?.toLocaleString() || 0,

        "Unit":
          target?.target_type === "value" ? "INR" : "PCS",

        "Achievement %": `${getAchievedPercentage(target).toFixed(0)}%`,
      }));

      const csv = Papa.unparse(data);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "primary-targets.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download CSV");
    }
  };




  return (
    <>
      <div>
        {pagePermission?.view ? (
          <div className="flex justify-start items-center flex-col gap-4 w-full">
            {/* page header */}
            <div className="flex justify-between w-full items-center border-b-2 py-4">
              <div className="flex justify-center items-center">
                <h1 className="text-2xl font-bold">Primary Target VS Achievement Setting</h1>
              </div>
            </div>

            {/* filters */}
            <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
              <Card className="w-full flex justify-center items-center flex-col">
                {/* filter card header */}
                <div className="w-full flex flex-wrap justify-center items-center gap-2">
                  <Badge color="warning">Total Count : {totalItems} </Badge>
                  <Badge color="warning">Filtered Count : {filteredCount} </Badge>
                </div>
                {/* filter div */}
                <div className="flex justify-center w-full items-end gap-4 flex-wrap">
                  {/* <div className="w-40">
                    <div className="mb-2 block">
                      <Label
                        htmlFor="approvalStatusSelect"
                        value="Approval Status"
                      />
                    </div>
                    <Select
                      value={selectedApprovalStatus}
                      onChange={(e) => setSelectedApprovalStatus(e.target.value)}
                      id="approvalStatusSelect"
                      required
                    >
                      <option value="default">All</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Select>
                  </div> */}

                  <div className="w-56 flex flex-col">
                    <Label value="Target Name/UID" />
                    <SearchableSelect
                      placeholder="Search Target Name / UID"
                      options={[
                        { _id: "default", searchLabel: "All Targets" },
                        ...targetNameOptions,
                      ]}
                      value={selectedTargetName === "default" ? "" : selectedTargetName}
                      onChange={(e) =>
                        setSelectedTargetName(e.target.value === "" ? "default" : e.target.value)
                      } displayKey="searchLabel"
                      valueKey="_id"
                      className="h-10"
                    />

                  </div>


                  <div className="w-56 flex flex-col">
                    <div className="mb-2 block">
                      <Label htmlFor="targetTypeSelect" value="Target Type" />
                    </div>
                    <Select
                      className="h-10"
                      value={selectedTargetType}
                      onChange={(e) => setSelectedTargetType(e.target.value)}
                      id="targetTypeSelect"
                      required
                    >
                      <option value="default">All</option>
                      <option value="volume">Volume</option>
                      <option value="value">Value</option>
                    </Select>
                  </div>
                  <div className="w-56 flex flex-col">
                    <Label value="Distributor" />

                    <SearchableSelect
                      placeholder="Search Distributor"
                      options={
                        selectedState !== "default"
                          ? distributorOptions.filter((opt) =>
                            activeDistributors.some(
                              (d) =>
                                d._id === opt._id &&
                                d?.stateId?._id === selectedState
                            )
                          )
                          : distributorOptions
                      }
                      value={selectedDistributor === "default" ? "" : selectedDistributor}
                      onChange={(e) => setSelectedDistributor(e.target.value)}
                      displayKey="searchLabel"
                      valueKey="_id"
                      className="h-10"
                    />
                  </div>
                  <div className="w-56 flex flex-col">
                    <Label value="Brand" />

                    <SearchableSelect
                      placeholder="Search Brand"
                      options={brandFilterOptions}
                      value={selectedBrand === "default" ? "" : selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      displayKey="searchLabel"
                      valueKey="_id"
                      className="h-10"
                      disabled={brandFilterOptions.length === 0}
                    />
                  </div>

                  <div className="w-56 flex flex-col">
                    <Label value="State" />

                    <SearchableSelect
                      placeholder="Search State"
                      options={stateOptions}
                      value={selectedState === "default" ? "" : selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      displayKey="searchLabel"
                      valueKey="_id"
                      className="h-10"
                    />
                  </div>
                  <div className="w-56 flex flex-col">
                    <Label value="Region" />

                    <SearchableSelect
                      placeholder="Search Region"
                      options={
                        selectedState !== "default"
                          ? regionOptions.filter(
                            (r) =>
                              regions.find(
                                (reg) =>
                                  reg._id === r._id &&
                                  reg?.stateId?._id === selectedState
                              )
                          )
                          : regionOptions
                      }
                      value={selectedRegion === "default" ? "" : selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      displayKey="searchLabel"
                      valueKey="_id"
                      className="h-10"
                    />
                  </div>
                  <div className="w-56 flex flex-col">
                    <Label value="Status" />
                    <Select
                      className="h-10"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="default">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Select>
                  </div>

                  <div className="w-56 flex flex-col">
                    <div className="mb-2 block">
                      <Label value="Slab" />
                    </div>

                    <Select
                      className="h-10"
                      value={selectedSlab}
                      onChange={(e) => setSelectedSlab(e.target.value)}
                    >
                      <option value="default">All Slabs</option>

                      {tableSlabs.map((slab) => (
                        <option key={slab._id} value={slab._id}>
                          {slab.name} ({slab.min_range}-{slab.max_range})
                        </option>
                      ))}

                      <option value="no-slab">No Slab</option>
                    </Select>
                  </div>


                  {/* <div className="w-40">
                    <div className="mb-2 block">
                      <Label htmlFor="yearSelect" value="Target Year" />
                    </div>
                    <Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      id="yearSelect"
                      required
                    >
                      <option value="default">All Years</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Select>
                  </div> */}

                  {/* <div className="w-40">
                    <div className="mb-2 block">
                      <Label htmlFor="monthSelect" value="Target Monthcx" />
                    </div>
                    <Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      id="monthSelect"
                      required
                    >
                      <option value="default">All Months</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </Select>
                  </div> */}

                  <div className="w-56 flex flex-col">
                    <Label value="Tenure Date range" />
                    <Datepicker
                      useRange={true}
                      asSingle={false}
                      value={filterDateRange}
                      onChange={(value) => setFilterDateRange(value)}
                      displayFormat="DD/MM/YYYY"
                      showShortcuts={true}
                    />
                  </div>

                  {/* <div className="w-56 flex flex-col">
                    <Label value="Created Date Range" />
                    <Datepicker
                      useRange={true}
                      asSingle={false}
                      value={createdDateRange}
                      onChange={(value) => setCreatedDateRange(value)}
                      displayFormat="DD/MM/YYYY"
                      showShortcuts={true}
                    />
                  </div> */}




                  {selectedState !== "default" ? (
                    <div className="w-56 flex flex-col">
                      <div className="mb-2 block">
                        <Label
                          htmlFor="distributorSelect"
                          value="Select Distributor"
                        />
                      </div>
                      <Select
                        value={selectedDistributor}
                        onChange={(event) =>
                          setSelectedDistributor(event.target.value)
                        }
                        id="distributorSelect"
                      >
                        <option value="default">Select Distributor</option>
                        {selectedState
                          ? activeDistributors
                            .filter(
                              (distributor) =>
                                distributor?.stateId?._id === selectedState
                            )
                            .map((distributor) => (
                              <option
                                key={distributor._id}
                                value={distributor._id}
                              >
                                {distributor.name} ({distributor.dbCode})
                              </option>
                            ))
                          : null}
                      </Select>
                    </div>
                  ) : null}
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
                        Add Primary Target
                      </span>
                    </Button>
                  )}

                  {pagePermission?.create && (
                    <Button
                      className="text-xs"
                      size="sm"
                      color="purple"
                      onClick={() => setOpenBulkModal(true)}
                    >
                      <span className="flex justify-center items-center gap-2">
                        <IoMdAddCircle size={20} />
                        Add Bulk Primary Targets
                      </span>
                    </Button>
                  )}

                  {pagePermission?.view && (
                    <Button
                      className="text-xs"
                      size="sm"
                      color="info"
                      onClick={handleDownloadCSV}
                    >
                      Download CSV
                    </Button>
                  )}

                  {failedCSV && (
                    <div className="flex items-center bg-red-600 text-white rounded-lg overflow-hidden text-xs">

                      {/* Download button */}
                      <button
                        onClick={() => downloadFailedCSV(failedCSV)}
                        className="px-3 py-2 flex items-center gap-2 hover:bg-red-700"
                      >
                        Download Failed ({failedCount})
                      </button>

                      {/* Close (clear) button */}
                      <button
                        onClick={() => {
                          setFailedCSV(null);
                          setFailedCount(0);
                        }}
                        className="px-2 py-2 border-l border-red-400 hover:bg-red-700"
                        title="Clear error log"
                      >
                        <FiX size={14} />
                      </button>

                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="flex justify-end items-center w-full px-4 ">
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

            {/* table */}
            <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
              <div className="overflow-x-auto w-full">
                <Table striped>
                  <Table.Head className="text-center">
                    <Table.HeadCell>Target UID</Table.HeadCell>

                    <Table.HeadCell>Target Name</Table.HeadCell>
                    <Table.HeadCell>Target Type</Table.HeadCell>
                    <Table.HeadCell>Distributor</Table.HeadCell>
                    <Table.HeadCell>Brand</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>


                    <Table.HeadCell>Target  Qty/Value</Table.HeadCell>
                    <Table.HeadCell>Target Tenure (From)</Table.HeadCell>
                    <Table.HeadCell>Target Tenure (To)</Table.HeadCell>
                    <Table.HeadCell>State</Table.HeadCell>
                    <Table.HeadCell>Region</Table.HeadCell>
                    {/* <Table.HeadCell>Zone</Table.HeadCell> */}

                    <Table.HeadCell>Slab</Table.HeadCell>
                    <Table.HeadCell>Slab Range / %</Table.HeadCell>
                    <Table.HeadCell>Scheme %</Table.HeadCell>
                    <Table.HeadCell>Total Achieved</Table.HeadCell>
                    <Table.HeadCell>Unit</Table.HeadCell>
                    <Table.HeadCell>Achievement %</Table.HeadCell>

                    {pagePermission?.update && (
                      <Table.HeadCell>Action</Table.HeadCell>
                    )}
                  </Table.Head>
                  <Table.Body>
                    {targetsLoading ? (
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
                        {primaryTargets?.map((target) => (
                          <Table.Row
                            key={target._id}
                            className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                          >
                            <Table.Cell className="whitespace-nowrap font-medium text-blue-600 hover:!text-blue-800 cursor-pointer">
                              <UniqueCode
                                text={target?.targetUid || "-"}
                                codeName="Target UID"
                                className="text-yellow-300 font-semibold"

                              />
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {target?.name}
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <Badge
                                color={
                                  target?.target_type === "volume"
                                    ? "info"
                                    : "purple"
                                }
                              >
                                {target?.target_type?.toUpperCase()}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {target?.distributorId ? (
                                <>
                                  {target?.distributorId?.name} (
                                  <UniqueCode
                                    text={target?.distributorId?.dbCode}
                                    codeName="DB Code"
                                  />
                                  )
                                </>
                              ) : (
                                ""
                              )}
                            </Table.Cell>

                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              <Button
                                size="xs"
                                color="info"
                                onClick={() => {
                                  setSelectedBrandData(target);
                                  setOpenBrandModal(true);
                                }}
                              >
                                View
                              </Button>
                            </Table.Cell>


                            <Table.Cell>
                              <Badge color={target?.isActive ? "success" : "failure"}>
                                {target?.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {target?.target_type === "value"
                                ? target?.targetValue?.toLocaleString()
                                : target?.targetVolume?.toLocaleString()}

                            </Table.Cell>
                            <Table.Cell className="whitespace-nowrap font-medium">
                              {moment(target?.target_start_date).format("DD MMM YYYY")}
                            </Table.Cell>

                            <Table.Cell className="whitespace-nowrap font-medium">
                              {moment(target?.target_end_date).format("DD MMM YYYY")}
                            </Table.Cell>

                            <Table.Cell className="whitespace-nowrap font-medium text-white-900">
                              {target?.stateId ? (
                                <>
                                  {target.stateId.name} (
                                  <UniqueCode text={target.stateId.code} codeName="State Code" />
                                  )
                                </>
                              ) : target?.distributorId?.stateId ? (
                                <>
                                  {target.distributorId.stateId.name} (
                                  <UniqueCode
                                    text={target.distributorId.stateId.code}
                                    codeName="State Code"
                                  />
                                  )
                                </>
                              ) : (
                                "-"
                              )}
                            </Table.Cell>

                            <Table.Cell className="whitespace-nowrap font-medium text-white-900">
                              {target?.regionId ? (
                                <>
                                  {target.regionId.name} (
                                  <UniqueCode text={target.regionId.code} codeName="Region Code" />
                                  )
                                </>
                              ) : target?.distributorId?.regionId ? (
                                <>
                                  {target.distributorId.regionId.name} (
                                  <UniqueCode
                                    text={target.distributorId.regionId.code}
                                    codeName="Region Code"
                                  />
                                  )
                                </>
                              ) : (
                                "-"
                              )}
                            </Table.Cell>


                            {/* <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                              {target?.zoneId?.name ? (
                                <>
                                  {target?.zoneId?.name} (
                                  <UniqueCode
                                    text={target?.zoneId?.code}
                                    codeName="Zone Code"
                                  />
                                  )
                                </>
                              ) : (
                                "-"
                              )}
                            </Table.Cell> */}
                            <Table.Cell className="font-medium">
                              {target?.achievedSlab?.name || "-"}
                            </Table.Cell>

                            <Table.Cell className="font-medium">
                              {target?.achievedSlab?.slab_type === "percentage"
                                ? `${target?.achievedSlab?.total_percentage}%`
                                : target?.achievedSlab
                                  ? `${target?.achievedSlab?.min_range} - ${target?.achievedSlab?.max_range}`
                                  : "-"}
                            </Table.Cell>

                            <Table.Cell className="font-medium">
                              {target?.achievedSlab?.discount_percentage ?? 0}%
                            </Table.Cell>

                            <Table.Cell className="font-medium whitespace-nowrap">
                              {target?.target_type === "value"
                                ? `₹ ${target?.achivedTarget?.toLocaleString() || 0}`
                                : `PCS ${target?.achivedTarget?.toLocaleString() || 0}`}
                            </Table.Cell>

                            <Table.Cell className="font-medium whitespace-nowrap">
                              {target?.target_type === "value" ? "INR" : "PCS"}
                            </Table.Cell>
                            <Table.Cell className="p-0">
                              <div className="flex items-center justify-center h-full">
                                <Badge
                                  color={getAchievedPercentage(target) >= 100 ? "success" : "info"}
                                  size="sm"
                                >
                                  {getAchievedPercentage(target).toFixed(0)}%
                                </Badge>
                              </div>
                            </Table.Cell>

                            {(pagePermission?.update || pagePermission?.delete) && (
                              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                                <div className="flex gap-2 justify-center items-center">

                                  {/* EDIT */}
                                  <Button
                                    size="xs"
                                    color="blue"
                                    disabled={hasTargetEnded(target?.target_end_date)}
                                    onClick={() => handleSetEdit(target)}
                                    title={
                                      hasTargetEnded(target?.target_end_date)
                                        ? "Target already ended – cannot edit"
                                        : "Edit Target"
                                    }
                                  >
                                    <FiEdit size={14} />
                                  </Button>

                                  {/* DELETE */}
                                  {pagePermission?.delete && target?.isActive && (
                                    <Button
                                      size="xs"
                                      color="failure"
                                      onClick={() => handleDeleteTarget(target)}
                                    >
                                      Deactivate
                                    </Button>
                                  )}

                                </div>
                              </Table.Cell>
                            )}

                          </Table.Row>

                        ))}
                        {primaryTargets?.length === 0 && (
                          <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                            <Table.Cell
                              colSpan={"100%"}
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

            {/* Add/Edit Modal  */}
            <Modal show={openModal} onClose={onCloseModal} size="3xl">

              <Modal.Header>
                {modalMode === "add" ? "Add Primary Target" : "Edit Primary Target"}
              </Modal.Header>
              <Modal.Body className="max-h-[80vh] overflow-y-auto">

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-name">Target Name*</Label>
                    <TextInput
                      id="target-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter Target Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target-type">Target Type*</Label>
                      <Select
                        id="target-type"
                        value={formData.target_type}
                        onChange={(e) =>
                          setFormData({ ...formData, target_type: e.target.value })
                        }
                      >
                        <option value="">Select Target Type</option>
                        <option value="volume">Volume</option>
                        <option value="value">Value</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="target-value">
                        {formData.target_type === "value"
                          ? "Target Value (INR)"
                          : formData.target_type === "volume"
                            ? "Target Value (Pc)*"
                            : "Target Value*"}
                      </Label>

                      <TextInput
                        id="target-value"
                        type="number"
                        value={
                          formData.target_type === "value"
                            ? formData.targetValue
                            : formData.targetVolume
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (formData.target_type === "value") {
                            setFormData({ ...formData, targetValue: val, targetVolume: "" });
                          } else {
                            setFormData({ ...formData, targetVolume: val, targetValue: "" });
                          }
                        }}
                      />


                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <Label>Target Period*</Label>

                      <Datepicker
                        useRange={true}
                        asSingle={false}
                        value={targetPeriod}
                        onChange={(value) => {
                          setTargetPeriod(value);
                          setFormData({
                            ...formData,
                            target_start_date: value?.startDate,
                            target_end_date: value?.endDate,
                          });
                        }}
                        displayFormat="DD/MM/YYYY"
                        showShortcuts={false}
                        portal={true}


                        // minDate={modalMode === "edit" ? null : new Date()}

                        popoverDirection="down"
                        popoverClassName="max-w-[320px] scale-90 origin-top"
                        classNames={{
                          calendar: "bg-gray-800 text-white rounded-lg shadow-xl p-1 text-xs",
                        }}
                      />


                    </div>

                  </div>

                  {modalMode === "add" && (
                    <div className="grid grid-cols-2 gap-4">

                      {/* Distributor */}
                      <div>
                        <Label htmlFor="distributor">Distributor*</Label>

                        <SearchableSelect
                          id="distributor"
                          placeholder="Select Distributor"
                          options={distributorOptions}
                          value={modalDistributor}
                          onChange={(e) =>
                            handleModalDistributorChange(e.target.value)
                          }
                          displayKey="searchLabel"
                          valueKey="_id"
                        />
                      </div>

                      {/* Brand */}
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        {console.log("BRAND OPTIONS IN MODAL:", brandOptions)}
                        <SearchableSelect
                          id="brand"
                          placeholder="Select Brand"
                          options={brandOptions}
                          value={formData.brandId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              brandId: e.target.value,
                              subBrandId: []
                            })
                          }
                          displayKey="name"
                          descKey="desc"
                          valueKey="_id"
                          multiple={true}
                          disabled={false}
                        />
                      </div>
                      <div>
                        <Label htmlFor="subbrand">Sub Brand</Label>

                        <SearchableSelect
                          id="subbrand"
                          placeholder="Select Sub Brand"
                          options={subBrandOptions}
                          value={formData.subBrandId}
                          onChange={(e) =>
                            setFormData({ ...formData, subBrandId: e.target.value })
                          }
                          displayKey="searchLabel"
                          valueKey="_id"
                          multiple={true}
                          disabled={!formData.brandId?.length}
                        />
                      </div>

                    </div>
                  )}



                  <div className="grid grid-cols-3 gap-4">
                    {/* <div>
                      <Label htmlFor="state">State (Optional)</Label>
                      <Select
                        id="state"
                        value={formData.stateId}
                        onChange={(e) =>
                          setFormData({ ...formData, stateId: e.target.value })
                        }
                      >
                        <option value="">Select State</option>
                        {activeStates?.map((state) => (
                          <option key={state._id} value={state._id}>
                            {state.name}
                          </option>
                        ))}
                      </Select>
                    </div> */}

                    {/* <div>
                      <Label htmlFor="region">Region (Optional)</Label>
                      <Select
                        id="region"
                        value={formData.regionId}
                        onChange={(e) =>
                          setFormData({ ...formData, regionId: e.target.value })
                        }
                      >
                        <option value="">Select Region</option>
                        {regions?.map((region) => (
                          <option key={region._id} value={region._id}>
                            {region.name}
                          </option>
                        ))}
                      </Select>
                    </div> */}

                    {/* <div>
                      <Label htmlFor="zone">Zone (Optional)</Label>
                      <Select
                        id="zone"
                        value={formData.zoneId}
                        onChange={(e) =>
                          setFormData({ ...formData, zoneId: e.target.value })
                        }
                      >
                        <option value="">Select Zone</option>
                        {zones?.map((zone) => (
                          <option key={zone._id} value={zone._id}>
                            {zone.name}
                          </option>
                        ))}
                      </Select>
                    </div> */}
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <div className="flex justify-end space-x-2">
                  <Button onClick={onCloseModal} color="gray">
                    Cancel
                  </Button>
                  {modalMode === "add" ? (
                    <Button onClick={handleAddTarget} disabled={formLoading}>
                      {formLoading && <Spinner className="mr-2" />}
                      Add Target
                    </Button>
                  ) : (
                    <Button onClick={handleEditTarget} disabled={formLoading}>
                      {formLoading && <Spinner className="mr-2" />}
                      Update Target
                    </Button>
                  )}
                </div>
              </Modal.Footer>
            </Modal>

            {/* Reject Modal */}
            <Modal show={openRejectModal} onClose={() => setOpenRejectModal(false)}>
              <Modal.Header>Reject Primary Target</Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reject-reason">Reject Reason</Label>
                    <Textarea
                      id="reject-reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter reason for rejection"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => setOpenRejectModal(false)} color="gray">
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitReject} color="failure">
                      Reject Target
                    </Button>
                  </div>
                </div>
              </Modal.Body>
            </Modal>

            <Modal show={openBulkModal} onClose={() => setOpenBulkModal(false)} size="lg">
              <Modal.Header>Bulk Primary Target Upload</Modal.Header>

              <Modal.Body>
                <div className="space-y-4">

                  {/* Download Template */}
                  <div className="flex justify-between items-center border p-3 rounded-lg">
                    <Button color="info" onClick={downloadBulkTemplate}>
                      Download Template
                    </Button>

                  </div>

                  {/* Upload */}
                  <div className="border p-4 rounded-lg space-y-3">
                    <Label>Upload Filled Template</Label>

                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="bulkFileInput"
                        accept=".xlsx,.csv"
                        onChange={(e) => setBulkFile(e.target.files[0])}
                        className="hidden"
                      />


                      <label
                        htmlFor="bulkFileInput"
                        className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600"
                      >
                        Choose File
                      </label>

                      <span className="text-sm text-gray-400">
                        {bulkUploading
                          ? "Uploading..."
                          : bulkFile
                            ? bulkFile.name
                            : "No file chosen"}
                      </span>
                    </div>

                    <Button
                      color="success"
                      disabled={!bulkFile || bulkUploading}
                      onClick={handleBulkUpload}
                    >
                      {bulkUploading ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" /> Uploading...
                        </span>
                      ) : (
                        "Upload Template"
                      )}
                    </Button>

                  </div>

                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button color="gray" onClick={() => setOpenBulkModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>


            <Modal
              show={openBrandModal}
              onClose={() => {
                setOpenBrandModal(false);
                setActiveBrandId(null); // reset when closing
              }}
              size="md"
            >
              {/* HEADER */}
              <Modal.Header className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                Brand & SubBrand
              </Modal.Header>

              {/* BODY */}
              <Modal.Body className="bg-white dark:bg-gray-900">
                <div className="space-y-3 text-sm">

                  {selectedBrandData?.groupedBrands?.length ? (
                    selectedBrandData.groupedBrands.map((g) => (
                      <div
                        key={g.brand._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden"
                      >

                        {/* CLICKABLE BRAND HEADER */}
                        <div
                          onClick={() =>
                            setActiveBrandId(
                              activeBrandId === g.brand._id ? null : g.brand._id
                            )
                          }
                          className="cursor-pointer px-3 py-2 flex justify-between items-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {g.brand.name}
                          </span>

                          <span className="text-lg font-bold">
                            {activeBrandId === g.brand._id ? "−" : "+"}
                          </span>
                        </div>

                        {/* SUBBRAND LIST (TOGGLE) */}
                        {activeBrandId === g.brand._id && (
                          <div className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800">

                            {g.subBrands.length > 0 ? (
                              g.subBrands.map((sb) => (
                                <div
                                  key={sb._id}
                                  className="flex items-center gap-2 py-1"
                                >
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                  <span>{sb.name || sb.code}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">
                                All SubBrand
                              </span>
                            )}

                          </div>
                        )}

                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400">
                      All Brand
                    </div>
                  )}

                </div>
              </Modal.Body>

              {/* FOOTER */}
              <Modal.Footer className="bg-gray-100 dark:bg-gray-800">
                <Button onClick={() => setOpenBrandModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
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
      </div>

      {openBrandsModal && (
        <BrandListModal
          openBrandsModal={openBrandsModal}
          setOpenBrandsModal={setOpenBrandsModal}
          brandList={selectedDistributorForBrands}
        />
      )}

    </>

  );
};

export default PrimaryTargetSetting;