import {
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";
import moment from "moment";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { FaRegEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { ImSpinner } from "react-icons/im";
import { IoIosList, IoMdAddCircle } from "react-icons/io";
import {
  MdDownloadForOffline,
  MdEdit,
  MdSimCardDownload,
} from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { VscGitFetch } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import {
  addDistributor,
  AllDistrictList,
  bulkUpload,
  getDistributorPassword,
  updateDistributor,
} from "../../api/api";
import {
  createBillDeliverySetting,
  createBulkBillDeliverySetting,
  getAllBillDeliverySettings,
  unlockDistributorPortal,
} from "../../api/billDeliveryApi";
import { getSalesOrderData } from "../../api/externalApi";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { AccessManagementModal } from "../../components/AccessManagementModal";
import { AutoDeliveryToggle } from "../../components/AutoDeliveryToggle";
import { BrandListModal } from "../../components/BrandListModal";
import BulkRLPEditModal from "../../components/BulkRLPEditModal";
import SearchableSelect from "../../components/SearchableSelect";
import { ShowBeats } from "../../components/ShowBeats";
import { ShowCredential } from "../../components/ShowCredential";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchBrands } from "../../redux/brandSlice";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchStates } from "../../redux/stateSlice";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { getPagePermission } from "../../utils/permissionHelper";

const Distributor = () => {
  const dispatch = useDispatch();

  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors,
  );
  const { states } = useSelector((state) => state.state);
  const activeStates = states.filter((state) => state.status === true);
  const { regions } = useSelector((state) => state.region);
  const activeRegions = regions.filter((region) => region.status === true);
  const { brands } = useSelector((state) => state.brand);
  const activeBrands = brands.filter((brand) => brand.status === true);

  const [districts, setDistricts] = useState([]);
  const activeDistricts = districts.filter(
    (district) => district.status === true,
  );

  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regionId, setRegionId] = useState("");
  const [stateId, setStateId] = useState("");
  const [area, setArea] = useState("");
  const [dbCode, setDbCode] = useState("");
  const [errorLog, setErrorLog] = useState([]);
  const [modalMode, setModalMode] = useState("add");
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedRegion, setSelectedRegion] = useState("default");
  const [selectedState, setSelectedState] = useState("default");
  const [role, setDisType] = useState("GT");
  const [RBPSchemeMapped, setRBPSchemeMapped] = useState("no");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [phone, setPhone] = useState("");
  const [sbu, setSbu] = useState("");
  const [gst_no, setGst] = useState("");
  const [pan_no, setPan] = useState("");
  const [openBrandsModal, setOpenBrandsModal] = useState(false);
  const [selectedDistributorForBrands, setSelectedDistributorForBrands] =
    useState(null);
  const [fetchSalesOrderLoading, setFetchSalesOrderLoading] = useState(false);
  const [showRBPHistoryModal, setShowRBPHistoryModal] = useState(false);
  const [
    selectedDistributorForRBPHistory,
    setSelectedDistributorForRBPHistory,
  ] = useState(null);

  // New fields
  const [ownerName, setOwnerName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [dayOff, setDayOff] = useState([]);

  const [credentialModalLoading, setCredentialModalLoading] = useState(false);
  const [
    selectedDistributorForCredential,
    setSelectedDistributorForCredential,
  ] = useState(null);
  const [disPassword, setDisPassword] = useState(null);
  const [adminPassword, setAdminPassword] = useState(null);
  const [showCredentialModal, setShowCredentialModal] = useState(false);

  const [accessManagementModal, setAccessManagementModal] = useState(false);
  const [
    selectedDistributorForAccessManagement,
    setSelectedDistributorForAccessManagement,
  ] = useState(null);

  const [showBeatsModal, setShowBeatsModal] = useState(false);
  const [selectedDistributorForBeats, setSelectedDistributorForBeats] =
    useState(null);

  const [deliverySettingsMap, setDeliverySettingsMap] = useState({});
  const [deliverySettingsLoading, setDeliverySettingsLoading] = useState(false);
  const [deliveryConfigModal, setDeliveryConfigModal] = useState(false);
  const [deliveryConfigSaving, setDeliveryConfigSaving] = useState(false);
  const [selectedDeliveryDistributor, setSelectedDeliveryDistributor] =
    useState(null);
  const [deliveryConfigForm, setDeliveryConfigForm] = useState({
    isActive: true,
    deliveryDurationDays: 7,
    notes: "",
  });
  const [deliveryConfigStatusSelection, setDeliveryConfigStatusSelection] =
    useState(null);
  const [deliveryConfigInitialState, setDeliveryConfigInitialState] =
    useState(null);
  const [deliveryConfigDraftMap, setDeliveryConfigDraftMap] = useState({});
  const [enableBackdateBilling, setEnableBackdateBilling] = useState(false); // Backdate billing toggle (ON/OFF)
  const [backdateBillingSelection, setBackdateBillingSelection] =
    useState(null);
  const [unlockingDistributorId, setUnlockingDistributorId] = useState(null);

  // Bulk delivery config states
  const [bulkDeliveryConfigModal, setBulkDeliveryConfigModal] = useState(false);
  const [bulkDeliveryConfigForm, setBulkDeliveryConfigForm] = useState({
    isActive: true,
    deliveryDurationDays: "",
    notes: "",
  });
  const [
    bulkDeliveryConfigStatusSelection,
    setBulkDeliveryConfigStatusSelection,
  ] = useState(null);
  const [bulkEnableBackdateBilling, setBulkEnableBackdateBilling] =
    useState(false); // Backdate billing toggle (ON/OFF)
  const [bulkBackdateBillingSelection, setBulkBackdateBillingSelection] =
    useState(null);
  const [bulkDeliveryConfigSaving, setBulkDeliveryConfigSaving] =
    useState(false);

  // Bulk RLP Edit modal state
  const [bulkRLPEditModal, setBulkRLPEditModal] = useState(false);

  // Add state for unlock modal
  const [unlockModal, setUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");
  const [selectedUnlockDistributor, setSelectedUnlockDistributor] =
    useState(null);

  // Add state for brand selection
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [deliveryConfigFilter, setDeliveryConfigFilter] = useState("all");
  const [primaryInvoiceType, setPrimaryInvoiceType] = useState("New");
  const [allowRLPEdit, setAllowRLPEdit] = useState(false);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  // New: oldDate state to store custom date when Primary Invoice Type = "Old"
  const [oldDate, setOldDate] = useState("");

  // ---- Table sorting state ----
  // Sorting is now performed by the backend (GET /distributor/list?sortBy=&sortOrder=).
  // These two just drive the header UI (which column / which direction is active);
  // the actual ordering of `distributors` in the store comes from the API response.
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" | "desc"

  const handleSort = (field) => {
    const nextDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(nextDirection);
    dispatch(fetchDistributors({ sortBy: field, sortOrder: nextDirection }));
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <FaSort className="inline ml-1 text-gray-400" size={10} />;
    }
    return sortDirection === "asc" ? (
      <FaSortUp className="inline ml-1 text-gray-700 dark:text-gray-200" size={10} />
    ) : (
      <FaSortDown className="inline ml-1 text-gray-700 dark:text-gray-200" size={10} />
    );
  };

  const SortableHeadCell = ({ field, children }) => (
    <Table.HeadCell
      className="whitespace-nowrap px-2 py-2 text-xs font-semibold cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center">
        {children}
        <SortIcon field={field} />
      </span>
    </Table.HeadCell>
  );

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "distributor");
    setPagePermission(permission);
  }, [permissionState]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  let filteredDistributors = [...distributors];

  if (selectedStatus !== "default") {
    filteredDistributors = filteredDistributors.filter(
      (ele) => ele.status === (selectedStatus === "active" ? true : false),
    );
  }

  if (selectedRegion !== "default") {
    filteredDistributors = filteredDistributors.filter(
      (ele) => ele?.regionId?._id == selectedRegion,
    );
  }

  if (selectedState !== "default") {
    filteredDistributors = filteredDistributors.filter(
      (ele) => ele?.stateId?._id == selectedState,
    );
  }

  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm?.toLowerCase();
    filteredDistributors = filteredDistributors?.filter(
      (distributor) =>
        distributor?.name?.toLowerCase()?.includes(lowerCaseSearchTerm) ||
        distributor?.dbCode?.toLowerCase()?.includes(lowerCaseSearchTerm),
    );
  }

  if (dateRange.startDate && dateRange.endDate) {
    const start = moment(dateRange.startDate).startOf("day");
    const end = moment(dateRange.endDate).endOf("day");

    filteredDistributors = filteredDistributors?.filter((distributor) =>
      moment(distributor?.createdAt).isBetween(start, end, null, "[]"),
    );
  }

  if (deliveryConfigFilter !== "all") {
    filteredDistributors = filteredDistributors?.filter((distributor) => {
      const isLocked =
        deliverySettingsMap?.[distributor?._id]?.distributorId
          ?.isPortalLocked || distributor?.isPortalLocked;
      if (deliveryConfigFilter === "locked") {
        return isLocked;
      } else if (deliveryConfigFilter === "unlocked") {
        return !isLocked;
      }
      return true;
    });
  }

  // NOTE: `distributors` arrives from Redux already sorted by the backend
  // (see fetchDistributors / disList). The filters above only narrow the
  // array down — they never reorder it — so sort order is preserved
  // through search/status/region/state/date-range/lock-status filtering.

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setDeliveryConfigFilter("all");
    dispatch(fetchDistributors());
    setSelectedRegion("default");
    setSelectedState("default");
    setDateRange({ startDate: null, endDate: null });
    setSearchTerm("");
    setSortField(null);
    setSortDirection("asc");
    dispatch(fetchDistributors()); // no sortBy/sortOrder -> backend default ({ _id: -1 })
  };

  const fetchBillDeliverySettings = async () => {
    try {
      setDeliverySettingsLoading(true);
      const response = await getAllBillDeliverySettings();
      const settings = response?.data?.data || [];
      const nextMap = {};
      settings.forEach((setting) => {
        const distributorId =
          setting?.distributorId?._id || setting?.distributorId;
        if (distributorId) {
          nextMap[distributorId] = setting;
        }
      });
      setDeliverySettingsMap(nextMap);
    } catch (error) {
      console.error("Failed to fetch delivery settings:", error);
      toast.error(error?.message || "Failed to fetch delivery settings");
    } finally {
      setDeliverySettingsLoading(false);
    }
  };

  const handleOpenDeliveryConfig = (distributor) => {
    const draft = deliveryConfigDraftMap?.[distributor?._id];
    const setting = deliverySettingsMap?.[distributor?._id];
    setSelectedDeliveryDistributor(distributor);
    const formData = {
      isActive: draft?.isActive ?? setting?.isActive ?? true,
      deliveryDurationDays:
        draft?.deliveryDurationDays ?? setting?.deliveryDurationDays ?? 7,
      notes: draft?.notes ?? (setting?.notes || ""),
    };
    const backdateBilling =
      draft?.enableBackdateBilling ?? setting?.enableBackdateBilling ?? false;
    setDeliveryConfigForm(formData);
    setEnableBackdateBilling(backdateBilling);
    setBackdateBillingSelection(null);
    setDeliveryConfigStatusSelection(null);
    setDeliveryConfigInitialState({
      ...formData,
      notes: formData.notes || "",
      enableBackdateBilling: backdateBilling,
    });
    setDeliveryConfigModal(true);
  };

  const handleCloseDeliveryConfig = () => {
    setDeliveryConfigModal(false);
    setSelectedDeliveryDistributor(null);
    setBackdateBillingSelection(null);
    setDeliveryConfigStatusSelection(null);
    setDeliveryConfigInitialState(null);
  };

  const handleSaveDeliveryConfig = async () => {
    if (!selectedDeliveryDistributor?._id) return;

    const hasStatusSelection =
      deliveryConfigStatusSelection === true ||
      deliveryConfigStatusSelection === false;
    const hasBackdateSelection =
      backdateBillingSelection === true || backdateBillingSelection === false;

    if (!hasStatusSelection && !hasBackdateSelection) {
      toast.error("Please select at least one setting to update.");
      return;
    }

    const normalizedCurrentState = {
      isActive: deliveryConfigForm.isActive,
      deliveryDurationDays:
        Number(deliveryConfigForm.deliveryDurationDays) || "",
      notes: (deliveryConfigForm.notes || "").trim(),
      enableBackdateBilling,
    };

    const normalizedInitialState = deliveryConfigInitialState
      ? {
          isActive: deliveryConfigInitialState.isActive,
          deliveryDurationDays:
            Number(deliveryConfigInitialState.deliveryDurationDays) || "",
          notes: (deliveryConfigInitialState.notes || "").trim(),
          enableBackdateBilling:
            deliveryConfigInitialState.enableBackdateBilling,
        }
      : null;

    const statusChanged = normalizedInitialState
      ? normalizedCurrentState.isActive !== normalizedInitialState.isActive ||
        normalizedCurrentState.deliveryDurationDays !==
          normalizedInitialState.deliveryDurationDays
      : true;
    const backdateChanged = normalizedInitialState
      ? normalizedCurrentState.enableBackdateBilling !==
        normalizedInitialState.enableBackdateBilling
      : true;

    if (
      (hasStatusSelection && !statusChanged) ||
      (hasBackdateSelection && !backdateChanged)
    ) {
      if (
        normalizedInitialState &&
        normalizedCurrentState.notes === normalizedInitialState.notes
      ) {
        toast("No changes detected. Existing configuration remains unchanged.");
        handleCloseDeliveryConfig();
        return;
      }
    }

    const duration = Number(deliveryConfigForm.deliveryDurationDays);
    if (hasStatusSelection && deliveryConfigForm.isActive) {
      if (!Number.isFinite(duration) || duration < 1 || duration > 30) {
        toast.error("Delivery duration must be between 1 and 30 days");
        return;
      }
    }

    try {
      setDeliveryConfigSaving(true);
      const payload = {
        distributorId: selectedDeliveryDistributor._id,
        notes: deliveryConfigForm.notes?.trim() || "",
        ...(hasStatusSelection
          ? {
              isActive: deliveryConfigForm.isActive,
              ...(deliveryConfigForm.isActive
                ? { deliveryDurationDays: duration }
                : {}),
            }
          : {}),
        ...(hasBackdateSelection
          ? { enableBackdateBilling: enableBackdateBilling }
          : {}),
      };
      await createBillDeliverySetting(payload);
      toast.success("Delivery configuration saved");
      // Clear draft cache so next open reads fresh saved values
      setDeliveryConfigDraftMap((prev) => {
        const next = { ...prev };
        delete next[selectedDeliveryDistributor._id];
        return next;
      });
      handleCloseDeliveryConfig();
      await fetchBillDeliverySettings();
    } catch (error) {
      console.error("Failed to save delivery configuration:", error);
      toast.error(error?.message || "Failed to save delivery configuration");
    } finally {
      setDeliveryConfigSaving(false);
    }
  };

  const handleOpenBulkDeliveryConfig = () => {
    setBulkBackdateBillingSelection(null);
    setBulkDeliveryConfigStatusSelection(null);
    setBulkDeliveryConfigModal(true);
  };

  const handleCloseBulkDeliveryConfig = () => {
    setBulkDeliveryConfigModal(false);
    setBulkBackdateBillingSelection(null);
    setBulkDeliveryConfigStatusSelection(null);
  };

  const handleCloseBulkRLPEdit = () => {
    setBulkRLPEditModal(false);
  };

  useEffect(() => {
    const distributorId = selectedDeliveryDistributor?._id;
    if (!distributorId) return;

    setDeliveryConfigDraftMap((prev) => ({
      ...prev,
      [distributorId]: {
        ...deliveryConfigForm,
        enableBackdateBilling,
      },
    }));
  }, [selectedDeliveryDistributor, deliveryConfigForm, enableBackdateBilling]);

  const handleSaveBulkDeliveryConfig = async () => {
    const hasStatusSelection =
      bulkDeliveryConfigStatusSelection === true ||
      bulkDeliveryConfigStatusSelection === false;
    const hasBackdateSelection =
      bulkBackdateBillingSelection === true ||
      bulkBackdateBillingSelection === false;

    if (!hasStatusSelection && !hasBackdateSelection) {
      toast.error("Please select at least one setting to update.");
      return;
    }

    const duration = Number(bulkDeliveryConfigForm.deliveryDurationDays);
    if (hasStatusSelection && bulkDeliveryConfigForm.isActive) {
      if (!Number.isFinite(duration) || duration < 1 || duration > 30) {
        toast.error("Delivery duration must be between 1 and 30 days");
        return;
      }
    }

    openConfirmationModel({
      question: "Apply this configuration to all distributors?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setBulkDeliveryConfigSaving(true);
            const payload = {
              notes: bulkDeliveryConfigForm.notes?.trim() || "",
              ...(hasStatusSelection
                ? {
                    isActive: bulkDeliveryConfigForm.isActive,
                    ...(bulkDeliveryConfigForm.isActive
                      ? { deliveryDurationDays: duration }
                      : {}),
                  }
                : {}),
              ...(hasBackdateSelection
                ? { enableBackdateBilling: bulkEnableBackdateBilling }
                : {}),
            };
            await createBulkBillDeliverySetting(payload);
            toast.success("Bill delivery configuration applied successfully");
            setDeliveryConfigDraftMap({});
            handleCloseBulkDeliveryConfig();
            fetchBillDeliverySettings();
            dispatch(fetchDistributors());
          } catch (error) {
            console.error("Failed to save bill delivery configuration:", error);
            toast.error(
              error?.message || "Failed to save bill delivery configuration",
            );
          } finally {
            setBulkDeliveryConfigSaving(false);
          }
        }
      },
    });
  };

  const handleUnlockDistributor = (distributor) => {
    setSelectedUnlockDistributor(distributor);
    setUnlockReason("");
    setUnlockModal(true);
  };

  const handleCloseUnlockModal = () => {
    setUnlockModal(false);
    setSelectedUnlockDistributor(null);
    setUnlockReason("");
  };

  const handleConfirmUnlock = async () => {
    if (!unlockReason.trim()) {
      toast.error("Please enter a reason for unlocking");
      return;
    }

    try {
      setUnlockingDistributorId(selectedUnlockDistributor?._id);
      await unlockDistributorPortal({
        distributorId: selectedUnlockDistributor?._id,
        reason: unlockReason.trim(),
      });
      toast.success("Distributor portal unlocked");
      handleCloseUnlockModal();
      // Refresh both settings and distributor list
      fetchBillDeliverySettings();
      dispatch(fetchDistributors());
    } catch (error) {
      console.error("Failed to unlock distributor portal:", error);
      toast.error(error?.message || "Failed to unlock distributor portal");
    } finally {
      setUnlockingDistributorId(null);
    }
  };

  const validate = () => {
    if (
      name.trim() === "" ||
      email.trim() === "" ||
      dbCode.trim() === "" ||
      regionId === "" ||
      stateId === "" ||
      address1.trim() === "" ||
      phone.trim() === "" ||
      role.trim() === "" ||
      RBPSchemeMapped.trim() === "" ||
      selectedBrands.length === 0
    ) {
      toast.error("Please fill all the mandatory fields");
      return false;
    }

    return true;
  };

  const handleSetEdit = (distributor) => {
    let area = distributor?.area?.join(", ");
    setSelectedDistributor(distributor);
    setModalMode("edit");
    setName(distributor?.name);
    setEmail(distributor?.email);
    setRegionId(distributor?.regionId?._id || "");
    setStateId(distributor?.stateId?._id || "");
    setArea(area);
    setDbCode(distributor?.dbCode || "");
    setDisType(distributor?.role || "GT");
    setRBPSchemeMapped(distributor?.RBPSchemeMapped);
    setAddress1(distributor?.address1 || "");
    setAddress2(distributor?.address2 || "");
    setPhone(distributor?.phone || "");
    setSbu(distributor?.sbu || "");
    setGst(distributor?.gst_no || "");
    setPan(distributor?.pan_no || "");

    // Set new fields
    setOwnerName(distributor?.ownerName || "");
    setDistrictId(distributor?.district?._id ?? "");
    setCity(distributor?.city || "");
    setPincode(distributor?.pincode || "");
    setDayOff(distributor?.dayOff || []);

    // Set brand selection
    setSelectedBrands(distributor?.brandId?.map((brand) => brand._id) || []);

    // Set primary invoice type
    setPrimaryInvoiceType(distributor?.primaryInvoiceType || "New");

    // Set allowRLPEdit
    setAllowRLPEdit(distributor?.allowRLPEdit || false);

    // Set oldDate if present (NEW)
    setOldDate(
      distributor?.oldDate
        ? moment(distributor.oldDate).format("YYYY-MM-DD")
        : "",
    );

    setOpenModal(true);
  };

  const handleAddDistributor = async () => {
    try {
      setFormLoading(true);
      if (!validate()) return;

      let areaArray = area
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const payload = {
        name,
        email,
        regionId,
        stateId,
        area: areaArray,
        dbCode,
        role,
        RBPSchemeMapped,
        address1,
        address2,
        phone,
        sbu,
        gst_no,
        pan_no,
        ownerName,
        dayOff,
        city,
        pincode,
        brandId: selectedBrands,
        primaryInvoiceType,
        allowRLPEdit,
      };

      if (districtId) {
        payload.district = districtId;
      }

      // Include oldDate only when primaryInvoiceType is "Old"
      if (primaryInvoiceType === "All") {
        payload.oldDate = oldDate;
      }

      await addDistributor(payload);
      dispatch(fetchDistributors());
      onCloseModal();
      toast.success("Distributor added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to add distributor, try again",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const resetDistributorForm = () => {
    setModalMode("add");
    setSelectedDistributor(null);
    setName("");
    setEmail("");
    setRegionId("");
    setStateId("");
    setArea("");
    setDbCode("");
    setDisType("GT");
    setAddress1("");
    setAddress2("");
    setPhone("");
    setSbu("");
    setGst("");
    setPan("");
    setOwnerName("");
    setDistrictId("");
    setCity("");
    setPincode("");
    setDayOff([]);
    setSelectedBrands([]);
    setRBPSchemeMapped("no");
    setPrimaryInvoiceType("New");
    setAllowRLPEdit(false);
    setOldDate("");
  };

  const handleOpenAddModal = () => {
    resetDistributorForm();
    setOpenModal(true);
  };

  const onCloseModal = () => {
    setOpenModal(false);
    resetDistributorForm();
  };

  const handleEditDistributor = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this distributor?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);

            if (!validate()) return;

            // ✅ REQUIRED VALIDATION (ONLY CHANGE)
            if (primaryInvoiceType === "All" && !oldDate) {
              toast.error("Please select Old Invoice Date");
              setFormLoading(false);
              return;
            }

            let areaArray = area
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "");

            const payload = {
              name,
              email,
              regionId,
              stateId,
              area: areaArray,
              dbCode,
              address1,
              address2,
              role,
              RBPSchemeMapped,
              phone,
              sbu,
              gst_no,
              pan_no,
              ownerName,
              dayOff,
              city,
              pincode,
              brandId: selectedBrands,
              primaryInvoiceType,
              allowRLPEdit,
            };

            if (districtId) {
              payload.district = districtId;
            }

            // Include oldDate only when Primary Invoice Type is "All"
            if (primaryInvoiceType === "All") {
              payload.oldDate = oldDate;
            }

            await updateDistributor(payload, selectedDistributor._id);
            dispatch(fetchDistributors());
            toast.success("Distributor updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
                "Failed to update distributor, try again",
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

  const handleStatusUpdate = async (distributor) => {
    openConfirmationModel({
      question: `Are you sure you want to ${
        distributor.status ? "deactivate" : "activate"
      } this distributor?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !distributor.status,
            };
            await updateDistributor(payload, distributor._id);
            dispatch(fetchDistributors());
            toast.success("Distributor status updated successfully");
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
                "Failed to update distributor status",
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleFetchSalesOrder = async (distributor) => {
    const query = {
      dbCode: distributor?.dbCode,
    };

    setFetchSalesOrderLoading(true);

    try {
      await toast.promise(getSalesOrderData(query), {
        loading: `Fetching sales order for ${distributor?.name} (${distributor?.dbCode}) ...`,
        success: () => "Sales order fetched successfully!",
        error: (err) =>
          err?.response?.data?.message ||
          "Failed to fetch sales order data, try again",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setFetchSalesOrderLoading(false);
    }
  };

  const handleShowCredential = async (distributor) => {
    try {
      setCredentialModalLoading(true);
      setSelectedDistributorForCredential(distributor);
      setShowCredentialModal(true);
      const res = await getDistributorPassword(distributor?._id);
      setDisPassword(res?.data?.data?.password);
      setAdminPassword(res?.data?.data?.genPassword);
    } catch (error) {
      console.error(error);
    } finally {
      setCredentialModalLoading(false);
    }
  };

  const onCloseCredentialModal = () => {
    setShowCredentialModal(false);
    setSelectedDistributorForCredential(null);
    setDisPassword(null);
    setAdminPassword(null);
  };

  const onCloseAccessManagementModal = () => {
    setAccessManagementModal(false);
    setSelectedDistributorForAccessManagement(null);
  };

  const onCloseBeatsModal = () => {
    setShowBeatsModal(false);
    setSelectedDistributorForBeats(null);
  };

  const handleShowBeats = async (distributor) => {
    setSelectedDistributorForBeats(distributor);
    setShowBeatsModal(true);
  };

  const handleCSVTemplateDownload = () => {
    // Define headers
    const headers = [
      "DB Code (Required)",
      "Distributor Type (Required)",
      "Name (Required)",
      "Email (Required)",
      "Phone (Required)",
      "State Code (Required)",
      "State (Required)",
      "Brands (Required)",
      "RBP Schema Mapped (Required)",
      "Owner Name",
      "Address 1",
      "Address 2",
      "City",
      "Pincode",
      "District",
      "Day Off",
      "GST No",
      "PAN No",
      "Area",
    ];

    // Sample row (example values for guidance)
    const sampleRows = [
      {
        "DB Code (Required)": "DWB001",
        "Distributor Type (Required)": "GT",
        "Name (Required)": "ABC Distributors",
        "Email (Required)": "abcdistributors@example.com",
        "Phone (Required)": "9876543210",
        "State Code (Required)": "WB",
        "State (Required)": "West Bengal",
        "Brands (Required)": "MS,BM",
        "RBP Schema Mapped (Required)": "yes no",
        "Owner Name": "Kiran Seth",
        "Address 1": "123 Main Street",
        "Address 2": "Near Market",
        City: "Kolkata",
        Pincode: "700001",
        District: "Kolkata",
        "Day Off": "Sunday",
        "GST No": "19ABCDE1234F1Z5",
        "PAN No": "ABCDE1234F",
        Area: "Barasat, Sodepur",
      },
    ];

    // Function to escape CSV values
    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return "";

      const stringValue = String(value);

      // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    };

    // Create CSV rows
    const csvRows = [
      // Header row
      headers.map((header) => escapeCsvValue(header)).join(","),
      // Sample data rows
      ...sampleRows.map((row) =>
        headers.map((header) => escapeCsvValue(row[header] || "")).join(","),
      ),
    ];

    const csvString = csvRows.join("\n");

    // Create and download the file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.setAttribute("download", "distributor_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const getRBPSchemeMappedDate = (distributor) => {
    const history = distributor?.RBPSchemeMappedHistory;

    if (!Array.isArray(history) || history.length === 0) return "";

    const lastEntry = history[history.length - 1];

    return lastEntry?.updatedAt
      ? moment(lastEntry.updatedAt).format("YYYY-MM-DD")
      : "";
  };

  const handleExportToCSV = async () => {
    try {
      // 🔹 DIRECT API CALL (UNCHANGED)
      const res = await axios.get(`${BACKEND_URL}/api/v1/distributor/listdata`);

      const apiDistributors = res?.data?.data || [];

      if (apiDistributors.length === 0) {
        toast.error("No data found to export");
        return;
      }
      const csvData = apiDistributors.map((distributor) => {
        return {
          "DB Code": distributor.dbCode || "",
          "DB Name": distributor.name || "",
          "Owner Name": distributor.ownerName || "",
          "RBP Schema Mapped": distributor.RBPSchemeMapped || "",
          "RBP Schema Mapped Date": getRBPSchemeMappedDate(distributor),
          "Distributor Type": distributor.role || "",
          Email: distributor.email || "",
          Phone: distributor.phone || "",
          Address: distributor.address1 || "",
          City: distributor.city || "",
          Pincode: distributor.pincode || "",
          District: distributor.district?.name || "",
          "GST No": distributor.gst_no || "",
          "PAN No": distributor.pan_no || "",
          "Region Code": distributor.regionId?.code || "",
          Region: distributor.regionId?.name || "",
          "State Code": distributor.stateId?.slug || "",
          State: distributor.stateId?.name || "",
          Area: distributor.area ? distributor.area.join(", ") : "",
          Brands: distributor.brandId
            ? distributor.brandId
                .map((brand) => `${brand.name} (${brand.desc})`)
                .join(", ")
            : "",
          Beat: Array.isArray(distributor.beats)
            ? distributor.beats.map((b) => b.code).join(", ")
            : "",

          "Invoice Type": distributor.primaryInvoiceType || "",
          "Created Date": distributor.createdAt
            ? moment(distributor.createdAt).format("YYYY-MM-DD")
            : "",
          "Updated Date": distributor.updatedAt
            ? moment(distributor.updatedAt).format("YYYY-MM-DD")
            : "",
          Status: distributor.status ? "Active" : "Inactive",
        };
      });

      // 🔹 CSV generation (UNCHANGED)
      const csv = csvData.map((row) =>
        Object.values(row).map(escapeCSVValue).join(","),
      );
      csv.unshift(Object.keys(csvData[0]).map(escapeCSVValue).join(","));

      const csvString = csv.join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
      a.setAttribute("download", "distributors.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to download CSV");
    }
  };

  const handleCSVImport = async (url) => {
    try {
      openConfirmationModel({
        question: "Are you sure you want to import this Distributors CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };
              setFormLoading(true);
              const res = await bulkUpload(payload, "Distributor");

              if (
                res?.data?.data?.length === 0 &&
                res?.data?.skippedRows?.length === 0
              ) {
                toast.error("No data found in the file to import");
                return;
              } else if (res?.data?.skippedRows?.length > 0) {
                toast.error(
                  `${res?.data?.skippedRows?.length} rows skipped, ${
                    res?.data?.data?.length ? res?.data?.data?.length : 0
                  } rows imported in the Distributor Master`,
                );
                setErrorLog(res?.data?.skippedRows);
              } else {
                toast.success(
                  `${res?.data?.data?.length} rows imported in the Distributor Master`,
                );
              }
              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                  "Failed to import Distributors, try again",
              );
            } finally {
              setFormLoading(false);
              dispatch(fetchDistributors());
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

  const handleErrorLogDownload = () => {
    if (!errorLog || errorLog.length === 0) {
      toast.error("No error data to download");
      return;
    }

    try {
      // Distributor template headers + Error Reason
      const headers = [
        "Row Number",
        "DB Code (Required)",
        "Distributor Type (Required)",
        "Name (Required)",
        "Email (Required)",
        "Phone (Required)",
        "State Code (Required)",
        "State (Required)",
        "Brands (Required)",
        "RBP Schema Mapped (Required)",
        "Owner Name",
        "Address 1",
        "Address 2",
        "City",
        "Pincode",
        "District",
        "Day Off",
        "GST No",
        "PAN No",
        "Area",
        "Error Reason",
      ];

      // Escape CSV values
      const escapeCsvValue = (value) => {
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Build CSV rows
      const csvRows = [
        headers.map((header) => escapeCsvValue(header)).join(","), // header row
        ...errorLog.map((err) => {
          const row = new Array(headers.length).fill("");

          // Fill Row Number
          row[0] = err.row || "";

          // Fill Error Reason (last column)
          row[headers.length - 1] = err.reason || "";

          return row.map((cell) => escapeCsvValue(cell)).join(",");
        }),
      ];

      const csvString = csvRows.join("\n");

      // Create and download file
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `distributor_error_log_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Error log downloaded successfully");
    } catch (error) {
      console.error("Error downloading error log:", error);
      toast.error("Failed to download error log");
    } finally {
      setErrorLog([]);
    }
  };

  // get all the districts
  const getAllDistricts = async () => {
    try {
      const response = await AllDistrictList();
      const data = response?.data?.data || [];
      setDistricts(data);
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    }
  };

  useEffect(() => {
    getAllDistricts();
    dispatch(fetchDistributors());
    dispatch(fetchStates());
    dispatch(fetchRegions());
    dispatch(fetchBrands());
    fetchBillDeliverySettings();
  }, [dispatch]);

  const handleShowBrands = (distributor) => {
    setSelectedDistributorForBrands(distributor);
    setOpenBrandsModal(true);
  };

  const onCloseRBPHistoryModal = () => {
    setShowRBPHistoryModal(false);
    setSelectedDistributorForRBPHistory(null);
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Distributor Master</h1>
          </div>
        </div>

        {/* filters */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <Card className="w-full flex justify-center items-center flex-col">
            {/* filter card header */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">
                Total Count : {distributors?.length}{" "}
              </Badge>
              <Badge color="warning">
                Filtered Count : {filteredDistributors?.length}{" "}
              </Badge>
            </div>
            <div className="flex justify-center w-full items-center gap-4 flex-wrap">
              {/* filter : 1 */}
              <div className="w-44">
                <div className="block">
                  <Label value="Search" />
                </div>
                <TextInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search"
                />
              </div>

              {/* filter : 2 */}
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

              <div className="w-64">
                <div className="mb-2 block">
                  <Label
                    htmlFor="dateRangeSelect"
                    value="Select Created Date Range"
                  />
                </div>
                <Datepicker
                  showShortcuts={true}
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </div>

              {/** filter 3 */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="disSelect" value="Select State" />
                </div>
                <Select
                  value={selectedState}
                  onChange={(event) => setSelectedState(event.target.value)}
                >
                  <option value="default">All</option>
                  {states?.map((option, index) => (
                    <option key={index} value={option?._id}>
                      {option?.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/** filter 4 */}
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
                  {selectedState !== "default"
                    ? regions
                        ?.filter(
                          (regions) => regions?.stateId?._id === selectedState,
                        )
                        .map((option, index) => (
                          <option key={index} value={option?._id}>
                            {option?.name}
                          </option>
                        ))
                    : regions.map((option, index) => (
                        <option key={index} value={option?._1d}>
                          {option?.name}
                        </option>
                      ))}
                </Select>
              </div>

              {/** filter Delivery Configuration Lock Status */}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label
                    htmlFor="deliveryConfigSelect"
                    value="Delivery Configuration Status"
                  />
                </div>
                <Select
                  value={deliveryConfigFilter}
                  onChange={(e) => setDeliveryConfigFilter(e.target.value)}
                  id="deliveryConfigSelect"
                >
                  <option value="all">All</option>
                  <option value="locked">Locked</option>
                  <option value="unlocked">Unlocked</option>
                </Select>
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
                  onClick={handleOpenAddModal}
                >
                  <span className="flex justify-center items-center gap-2">
                    <IoMdAddCircle size={20} />
                    Add Distributor
                  </span>
                </Button>
              )}

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

        {/* table */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          {distributorsLoading ? (
            <div
              className="w-full flex justify-center items-center"
              role="status"
            >
              <Spinner aria-label="Default status example" size="xl" />
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table striped className="text-sm">
                <Table.Head className="text-center">
                  <SortableHeadCell field="dbCode">DB Code</SortableHeadCell>
                  <SortableHeadCell field="name">Name</SortableHeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Creds
                  </Table.HeadCell>
                  <SortableHeadCell field="role">Type</SortableHeadCell>
                  <SortableHeadCell field="ownerName">Owner</SortableHeadCell>
                  <SortableHeadCell field="email">Email</SortableHeadCell>
                  <SortableHeadCell field="phone">Phone</SortableHeadCell>
                  <SortableHeadCell field="address">Address</SortableHeadCell>
                  <SortableHeadCell field="city">City</SortableHeadCell>
                  <SortableHeadCell field="pincode">PIN</SortableHeadCell>
                  <SortableHeadCell field="district">District</SortableHeadCell>
                  <SortableHeadCell field="dayOff">Day Off</SortableHeadCell>
                  <SortableHeadCell field="sbu">SBU</SortableHeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Brands
                  </Table.HeadCell>
                  <SortableHeadCell field="gst_no">GST</SortableHeadCell>
                  <SortableHeadCell field="pan_no">PAN</SortableHeadCell>
                  <SortableHeadCell field="state">State</SortableHeadCell>
                  <SortableHeadCell field="area">Area</SortableHeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Beats
                  </Table.HeadCell>
                  <SortableHeadCell field="createdAt">
                    Created Date Time
                  </SortableHeadCell>
                  <SortableHeadCell field="updatedAt">
                    Updated Date Time
                  </SortableHeadCell>
                  <SortableHeadCell field="status">Status</SortableHeadCell>
                  <Table.HeadCell className="whitespace-nowrap px-2 py-2 text-xs font-semibold">
                    Action
                  </Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {filteredDistributors?.map((distributor, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Table.Cell className="px-2 py-2 text-xs font-medium text-gray-900 dark:text-gray-200">
                        <UniqueCode
                          text={distributor?.dbCode}
                          codeName="Distributor"
                        />
                      </Table.Cell>

                      <Table.Cell className="px-2 py-2 text-xs font-medium text-gray-900 dark:text-gray-200 max-w-32 truncate">
                        <span title={distributor.name}>{distributor.name}</span>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2">
                        <div className="flex justify-center items-center text-green-600 dark:text-green-400 cursor-pointer hover:text-green-800 dark:hover:text-green-300">
                          {credentialModalLoading &&
                          selectedDistributorForCredential?._id ===
                            distributor._id ? (
                            <ImSpinner className="animate-spin" size={16} />
                          ) : (
                            <FaRegEye
                              size={18}
                              onClick={() => {
                                handleShowCredential(distributor);
                              }}
                            />
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.role || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-28 truncate">
                        <span title={distributor?.ownerName}>
                          {distributor?.ownerName || ""}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-32 truncate">
                        <span title={distributor?.email}>
                          {distributor?.email || ""}
                        </span>
                      </Table.Cell>

                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.phone || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-40 truncate">
                        <span
                          title={`${distributor?.address1 || ""} ${
                            distributor?.address2 || ""
                          }`}
                        >
                          {distributor?.address1 || ""}
                          {distributor?.address2 && `, ${distributor.address2}`}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.city || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.pincode || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.district?.name || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.dayOff?.join(", ") || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.sbu || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-48 truncate">
                        {distributor?.brandId?.length > 0 ? (
                          <div
                            className="flex justify-center items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                            onClick={() => handleShowBrands(distributor)}
                          >
                            <IoIosList size={18} />
                          </div>
                        ) : null}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.gst_no || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        {distributor?.pan_no || ""}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col items-center gap-1">
                          <UniqueCode
                            text={distributor?.stateId?.code}
                            codeName="State"
                          />

                          <span
                            className="text-xs truncate max-w-20"
                            title={distributor?.stateId?.name}
                          >
                            {distributor?.stateId?.name || ""}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2 text-xs text-gray-700 dark:text-gray-300 max-w-32 truncate">
                        <span title={distributor?.area?.join(", ")}>
                          {distributor?.area ? distributor.area.join(", ") : ""}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2">
                        <div
                          className="flex justify-center items-center text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                          onClick={() => handleShowBeats(distributor)}
                        >
                          <IoIosList size={18} />
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2">
                        {moment(distributor?.createdAt)
                          .tz("Asia/Kolkata")
                          .format("DD-MM-YYYY hh:mm:ss A")}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2">
                        {moment(distributor?.updatedAt)
                          .tz("Asia/Kolkata")
                          .format("DD-MM-YYYY hh:mm:ss A")}
                      </Table.Cell>

                      <Table.Cell className="px-2 py-2">
                        {pagePermission?.update ? (
                          <StatusIndicator
                            status={distributor?.status}
                            onClick={() => handleStatusUpdate(distributor)}
                          />
                        ) : (
                          <StatusIndicator status={distributor?.status} />
                        )}
                      </Table.Cell>
                      <Table.Cell className="px-2 py-2">
                        <div className="flex justify-center items-center gap-2">
                          {pagePermission?.update && (
                            <Button
                              size="xs"
                              color="blue"
                              onClick={() => handleSetEdit(distributor)}
                              title="Edit Distributor"
                            >
                              <MdEdit size={14} />
                            </Button>
                          )}
                          {pagePermission?.update && (
                            <Button
                              size="xs"
                              color="green"
                              onClick={() => handleFetchSalesOrder(distributor)}
                              disabled={fetchSalesOrderLoading}
                              title="Fetch Sales Order"
                            >
                              <VscGitFetch size={14} />
                            </Button>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {filteredDistributors?.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan={22}
                        className="px-2 py-8 text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        No distributors found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Unlock Reason Modal */}
      <Modal show={unlockModal} onClose={handleCloseUnlockModal}>
        <Modal.Header>Unlock Distributor Portal</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <div className="text-sm">
              <span className="bg-blue-100 dark:bg-green-500 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg inline-block">
                <span className="font-semibold">
                  {selectedUnlockDistributor?.name || ""}
                </span>
                {selectedUnlockDistributor?.dbCode
                  ? ` (${selectedUnlockDistributor.dbCode})`
                  : ""}
              </span>
            </div>
            <div>
              <div className="mb-2 block">
                <Label value="Reason for Unlocking" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                type="text"
                placeholder="Enter reason for unlocking"
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="blue"
            onClick={handleConfirmUnlock}
            disabled={unlockingDistributorId === selectedUnlockDistributor?._id}
          >
            {unlockingDistributorId === selectedUnlockDistributor?._id
              ? "Unlocking..."
              : "Confirm Unlock"}
          </Button>
          <Button color="gray" onClick={handleCloseUnlockModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delivery Config Modal - Single */}
      <Modal show={deliveryConfigModal} onClose={handleCloseDeliveryConfig}>
        <Modal.Header>Bill Delivery Configuration</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            {/* Distributor Info */}
            <div className="text-sm">
              <span className="bg-blue-100 dark:bg-green-500 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg inline-block">
                <span className="font-semibold">
                  {selectedDeliveryDistributor?.name || ""}
                </span>
                {selectedDeliveryDistributor?.dbCode
                  ? ` (${selectedDeliveryDistributor.dbCode})`
                  : ""}
              </span>
            </div>

            {/* Backdate Billing Configuration - FIRST BUTTON (INDEPENDENT) */}
            <div className="border border-blue-300 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <div className="mb-3 block">
                <Label value="Backdate Billing (ON/OFF)" />
              </div>
              <AutoDeliveryToggle
                isAuto={enableBackdateBilling}
                selectedValue={backdateBillingSelection}
                onChange={(value) => {
                  setBackdateBillingSelection(value);
                  setEnableBackdateBilling(value);
                }}
                disabled={false}
              />
            </div>

            {/* ON/OFF Configuration - SECOND BUTTON (INDEPENDENT) */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="mb-3 block">
                <Label value="Enable Bill Delivery Configuration" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
                  <input
                    type="radio"
                    name="deliveryConfigStatus"
                    value="on"
                    checked={deliveryConfigStatusSelection === true}
                    onChange={() => {
                      setDeliveryConfigStatusSelection(true);
                      setDeliveryConfigForm((prev) => ({
                        ...prev,
                        isActive: true,
                      }));
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ON
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Enable delivery deadline tracking
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
                  <input
                    type="radio"
                    name="deliveryConfigStatus"
                    value="off"
                    checked={deliveryConfigStatusSelection === false}
                    onChange={() => {
                      setDeliveryConfigStatusSelection(false);
                      setDeliveryConfigForm((prev) => ({
                        ...prev,
                        isActive: false,
                      }));
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      OFF
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Disable deadline tracking
                    </span>
                  </div>
                </label>
              </div>
            </div>
            {deliveryConfigForm.isActive && (
              <div>
                <div className="mb-3">
                  <div className="flex items-center gap-1">
                    <Label value="Delivery Duration (Days)" />
                    <span className="text-red-500">*</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Select a duration between 1 and 30 days.
                  </p>
                </div>
                <TextInput
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  value={deliveryConfigForm.deliveryDurationDays}
                  onChange={(e) =>
                    setDeliveryConfigForm((prev) => ({
                      ...prev,
                      deliveryDurationDays: parseInt(e.target.value) || "",
                    }))
                  }
                />
              </div>
            )}
            <div>
              <div className="mb-2 block">
                <Label value="Notes" />
              </div>
              <TextInput
                type="text"
                placeholder="Optional notes"
                value={deliveryConfigForm.notes}
                onChange={(e) =>
                  setDeliveryConfigForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="blue"
            onClick={handleSaveDeliveryConfig}
            disabled={deliveryConfigSaving}
          >
            {deliveryConfigSaving ? "Saving..." : "Save"}
          </Button>
          <Button color="gray" onClick={handleCloseDeliveryConfig}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bill Delivery Config Modal */}
      <Modal
        show={bulkDeliveryConfigModal}
        onClose={handleCloseBulkDeliveryConfig}
      >
        <Modal.Header>Bill Delivery Configuration</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            {/* Warning */}
            <div className="text-sm bg-yellow-100 dark:bg-yellow-900 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <span className="font-semibold">⚠️ Critical:</span> This
              configuration will be applied to <strong>ALL distributors</strong>
              . Proceed with caution.
            </div>

            {/* Backdate Billing Configuration - FIRST BUTTON (INDEPENDENT) */}
            <div className="border border-blue-300 dark:border-blue-600 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <div className="mb-3 block">
                <Label value="Backdate Billing (ON/OFF)" />
              </div>
              <AutoDeliveryToggle
                isAuto={bulkEnableBackdateBilling}
                selectedValue={bulkBackdateBillingSelection}
                onChange={(value) => {
                  setBulkBackdateBillingSelection(value);
                  setBulkEnableBackdateBilling(value);
                }}
                disabled={false}
              />
            </div>

            {/* ON/OFF Configuration - SECOND BUTTON (INDEPENDENT) */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="mb-3 block">
                <Label value="Enable Bill Delivery Configuration" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
                  <input
                    type="radio"
                    name="bulkDeliveryConfigStatus"
                    value="on"
                    checked={bulkDeliveryConfigStatusSelection === true}
                    onChange={() => {
                      setBulkDeliveryConfigStatusSelection(true);
                      setBulkDeliveryConfigForm((prev) => ({
                        ...prev,
                        isActive: true,
                      }));
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ON
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Enable delivery duration
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
                  <input
                    type="radio"
                    name="bulkDeliveryConfigStatus"
                    value="off"
                    checked={bulkDeliveryConfigStatusSelection === false}
                    onChange={() => {
                      setBulkDeliveryConfigStatusSelection(false);
                      setBulkDeliveryConfigForm((prev) => ({
                        ...prev,
                        isActive: false,
                      }));
                    }}
                    className="w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      OFF
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Disable delivery duration
                    </span>
                  </div>
                </label>
              </div>
            </div>
            {bulkDeliveryConfigStatusSelection === true && (
              <div>
                <div className="mb-2 block">
                  <Label value="Delivery Duration (Days)" />
                  <span className="text-red-500">*</span>
                </div>
                <TextInput
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  placeholder="Enter a value between 1 and 30"
                  value={bulkDeliveryConfigForm.deliveryDurationDays}
                  onChange={(e) =>
                    setBulkDeliveryConfigForm((prev) => ({
                      ...prev,
                      deliveryDurationDays: parseInt(e.target.value) || "",
                    }))
                  }
                />
              </div>
            )}
            <div>
              <div className="mb-2 block">
                <Label value="Notes" />
              </div>
              <TextInput
                type="text"
                placeholder="Optional notes"
                value={bulkDeliveryConfigForm.notes}
                onChange={(e) =>
                  setBulkDeliveryConfigForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="blue"
            onClick={handleSaveBulkDeliveryConfig}
            disabled={bulkDeliveryConfigSaving}
          >
            {bulkDeliveryConfigSaving ? "Saving..." : "Save"}
          </Button>
          <Button color="gray" onClick={handleCloseBulkDeliveryConfig}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk RLP Edit Modal */}
      <BulkRLPEditModal
        show={bulkRLPEditModal}
        onClose={handleCloseBulkRLPEdit}
      />

      {/* form add/edit model */}
      <Modal show={openModal} onClose={onCloseModal}>
        <Modal.Header>
          {modalMode === "add" ? "Add Distributor" : "Edit Distributor"}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Distributor Name" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="name"
                type="text"
                placeholder="Enter distributor name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="ownerName" value="Owner Name" />
              </div>
              <TextInput
                id="ownerName"
                type="text"
                placeholder="Enter owner name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="Enter distributor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="phone" value="Phone Number" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="phone"
                type="number"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="dbCode" value="DB Code" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="dbCode"
                type="text"
                placeholder="Enter distributor DB Code"
                value={dbCode}
                onChange={(e) => setDbCode(e.target.value)}
                readOnly={modalMode !== "add" ? true : false}
                disabled={modalMode !== "add" ? true : false}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="regionId" value="State" />
                <span className="text-red-500">*</span>
              </div>
              <SearchableSelect
                id="regionId"
                options={activeRegions}
                value={regionId}
                onChange={(e) => {
                  const selectedRegionId = e.target.value;
                  setRegionId(selectedRegionId);
                  // Auto-fill state from selected region's stateId
                  if (selectedRegionId) {
                    const foundRegion = activeRegions.find(
                      (r) => r._id === selectedRegionId,
                    );
                    if (foundRegion?.stateId?._id) {
                      setStateId(foundRegion.stateId._id);
                    }
                  } else {
                    setStateId("");
                  }
                }}
                placeholder="Select State"
                displayKey="name"
                valueKey="_id"
                disabled={false}
              />
            </div>

            {/* Show oldDate only when "All" is selected */}
            {primaryInvoiceType === "All" && (
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="oldDate" value="Old Invoice Date" />
                </div>
                <TextInput
                  id="oldDate"
                  type="date"
                  value={oldDate}
                  onChange={(e) => setOldDate(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <div className="mb-2 block">
                <Label htmlFor="address1" value="Address Line 1" />
                <span className="text-red-500">*</span>
              </div>
              <TextInput
                id="address1"
                type="text"
                placeholder="Enter address line 1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
            </div>

            {/* Add brand selection */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="brandId" value="Brands" />
                <span className="text-red-500">*</span>
              </div>
              <SearchableSelect
                id="brandId"
                options={activeBrands}
                value={selectedBrands}
                onChange={(e) => setSelectedBrands(e.target.value)}
                placeholder="Select Brands"
                displayKey="name"
                valueKey="_id"
                descKey="desc"
                multiple={true}
              />
            </div>
            {stateId && (
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="districtId" value="District" />
                </div>
                <SearchableSelect
                  id="districtId"
                  options={activeDistricts.filter(
                    (district) => district?.stateId?._id === stateId,
                  )}
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  placeholder="Select District"
                  displayKey="name"
                  valueKey="_id"
                  disabled={false}
                />
              </div>
            )}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="city" value="City" />
              </div>
              <TextInput
                id="city"
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="pincode" value="Pincode" />
              </div>
              <TextInput
                id="pincode"
                type="number"
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="dayOff" value="Day Off" />
              </div>
              <SearchableSelect
                id="dayOff"
                options={[
                  { _id: "Sunday", name: "Sunday" },
                  { _id: "Monday", name: "Monday" },
                  { _id: "Tuesday", name: "Tuesday" },
                  { _id: "Wednesday", name: "Wednesday" },
                  { _id: "Thursday", name: "Thursday" },
                  { _id: "Friday", name: "Friday" },
                  { _id: "Saturday", name: "Saturday" },
                ]}
                value={dayOff}
                onChange={(e) => setDayOff(e.target.value)}
                placeholder="Select Day Off"
                displayKey="name"
                valueKey="_id"
                multiple={true}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="address2" value="Address Line 2" />
              </div>
              <TextInput
                id="address2"
                type="text"
                placeholder="Enter address line 2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="sbu" value="SBU" />
              </div>
              <TextInput
                id="sbu"
                type="text"
                placeholder="Enter SBU"
                value={sbu}
                onChange={(e) => setSbu(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="gst_no" value="GST Number" />
              </div>
              <TextInput
                id="gst_no"
                type="text"
                placeholder="Enter GST number"
                value={gst_no}
                onChange={(e) => setGst(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="pan_no" value="PAN Number" />
              </div>
              <TextInput
                id="pan_no"
                type="text"
                placeholder="Enter PAN number"
                value={pan_no}
                onChange={(e) => setPan(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="area" value="Area (Comma Separated)" />
              </div>
              <TextInput
                id="area"
                type="text"
                placeholder="Enter area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {/* ADD DISTRIBUTOR BUTTON */}
          {modalMode === "add" && pagePermission?.create && (
            <Button disabled={formLoading} onClick={handleAddDistributor}>
              {formLoading ? (
                <>
                  <Spinner size="sm" light className="mr-2" />
                  Adding...
                </>
              ) : (
                "Add Distributor"
              )}
            </Button>
          )}

          {/* UPDATE DISTRIBUTOR BUTTON */}
          {modalMode === "edit" && pagePermission?.update && (
            <Button disabled={formLoading} onClick={handleEditDistributor}>
              {formLoading ? (
                <>
                  <Spinner size="sm" light className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Distributor"
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* credential modal */}
      {showCredentialModal && (
        <ShowCredential
          showCredentialModal={showCredentialModal}
          selectedDistributorForCredential={selectedDistributorForCredential}
          credentialModalLoading={credentialModalLoading}
          disPassword={disPassword}
          adminPassword={adminPassword}
          onCloseCredentialModal={onCloseCredentialModal}
        />
      )}

      {/* access management modal */}
      {accessManagementModal && (
        <AccessManagementModal
          showAccessManagementModal={accessManagementModal}
          onCloseAccessManagementModal={onCloseAccessManagementModal}
          selectedDistributorForAccessManagement={
            selectedDistributorForAccessManagement
          }
        />
      )}

      {/* show beats modal */}
      {showBeatsModal && (
        <ShowBeats
          showBeatsModal={showBeatsModal}
          onCloseBeatsModal={onCloseBeatsModal}
          usedIn={"distributor"}
          config={{
            distributor: selectedDistributorForBeats,
          }}
        />
      )}

      {/* Brand List Modal */}
      {openBrandsModal && (
        <BrandListModal
          openBrandsModal={openBrandsModal}
          setOpenBrandsModal={setOpenBrandsModal}
          brandList={selectedDistributorForBrands}
        />
      )}

      {/* RBP Scheme History Modal */}
      {showRBPHistoryModal && (
        <Modal
          show={showRBPHistoryModal}
          onClose={onCloseRBPHistoryModal}
          size="lg"
        >
          <Modal.Header>
            <div>
              <h5 className="text-sm font-semibold">
                RBP Scheme Mapping History
              </h5>
              <p className="text-xs text-gray-700 dark:text-gray-100">
                {selectedDistributorForRBPHistory?.name} (
                {selectedDistributorForRBPHistory?.dbCode})
              </p>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-2">
              {selectedDistributorForRBPHistory?.RBPSchemeMappedHistory
                ?.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table striped>
                    <Table.Head>
                      <Table.HeadCell className="text-center">
                        S.No
                      </Table.HeadCell>
                      <Table.HeadCell className="text-center">
                        Value
                      </Table.HeadCell>
                      <Table.HeadCell className="text-center">
                        Updated Date & Time
                      </Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                      {selectedDistributorForRBPHistory?.RBPSchemeMappedHistory?.map(
                        (history, index) => (
                          <Table.Row
                            key={history._id || index}
                            className="text-center"
                          >
                            <Table.Cell className="px-3 py-2 text-sm">
                              {index + 1}
                            </Table.Cell>
                            <Table.Cell className="px-3 py-2">
                              <span
                                className={
                                  history.value === "yes"
                                    ? "inline-flex px-2 py-1 text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full"
                                    : "inline-flex px-2 py-1 text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full"
                                }
                              >
                                {history.value === "yes" ? "YES" : "NO"}
                              </span>
                            </Table.Cell>
                            <Table.Cell className="px-3 py-2 text-sm">
                              {moment(history.updatedAt)
                                .tz("Asia/Kolkata")
                                .format("DD-MM-YYYY hh:mm A")}
                            </Table.Cell>
                          </Table.Row>
                        ),
                      )}
                    </Table.Body>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No history records available</p>
                </div>
              )}
            </div>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default Distributor;
