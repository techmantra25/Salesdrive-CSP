import { useState, useEffect } from "react";
import {
  Modal,
  Label,
  TextInput,
  Select,
  Button,
  Spinner,
} from "flowbite-react";
import toast from "react-hot-toast";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "./SearchableSelect";
import {
  OutletListMinimalByDistributor,
  SearchOutletsByDistributor,
  getDistributorSubBrandList,
} from "../api/api";
import { createSecondaryTarget } from "../api/api";
import { fetchBrands } from "../redux/brandSlice";
import { fetchDistributors } from "../redux/distributorListSlice";
import { useDispatch, useSelector } from "react-redux";

const CreateSingleTargetModal = ({ openModal, onCloseModal, onSuccess }) => {
  const dispatch = useDispatch();
  const [formLoading, setFormLoading] = useState(false);

  //testing cicd change push

  // Distributor states
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [distributorSearchTerm, setDistributorSearchTerm] = useState("");
  const [distributorSearchResults, setDistributorSearchResults] = useState([]);
  const [isSearchingDistributor, setIsSearchingDistributor] = useState(false);

  // Outlet states
  const [outletList, setOutletList] = useState([]);
  const [outletLoading, setOutletLoading] = useState(false);
  const [outletSearchTerm, setOutletSearchTerm] = useState("");
  const [outletSearchResults, setOutletSearchResults] = useState([]);
  const [isSearchingOutlet, setIsSearchingOutlet] = useState(false);

  // Brand states
  const [brandList, setBrandList] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // sub brands

  const [subBrandList, setSubBrandList] = useState([]);
  const [selectedSubBrands, setSelectedSubBrands] = useState([]);
  const [subBrandLoading, setSubBrandLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    retailerId: "",
    brandIds: [],
    subBrandIds: [],
    target_type: "",
    target: "",
    start_date: null,
    end_date: null,
  });

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // Get from Redux
  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors,
  );
  const { brands } = useSelector((state) => state.brand);

  // Search distributors
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

  const getDisplayDistributorList = () => {
    if (distributorSearchTerm.trim().length >= 2) {
      return distributorSearchResults;
    }
    return distributors;
  };

  // Fetch outlets when distributor changes
  const getOutletList = async (distributorId) => {
    if (!distributorId) {
      setOutletList([]);
      return;
    }

    setOutletLoading(true);
    try {
      const res = await OutletListMinimalByDistributor(distributorId);
      const activeOutletList = res?.data?.data || [];
      setOutletList(activeOutletList);
    } catch (error) {
      toast.error("Failed to fetch Retailer List");
      setOutletList([]);
    } finally {
      setOutletLoading(false);
    }
  };

  // Search outlets
  const searchOutlets = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2 || !selectedDistributor) {
      setOutletSearchResults([]);
      setIsSearchingOutlet(false);
      return;
    }
    setIsSearchingOutlet(true);
    try {
      const res = await SearchOutletsByDistributor(
        selectedDistributor,
        searchTerm.trim(),
      );
      setOutletSearchResults(res?.data?.data || []);
    } catch (error) {
      console.log("Outlet search Error", error);
      setOutletSearchResults([]);
    } finally {
      setIsSearchingOutlet(false);
    }
  };

  const getDisplayOutletList = () => {
    if (outletSearchTerm.trim().length >= 2) {
      return outletSearchResults;
    }
    return outletList;
  };

  // Update brands when distributor changes
  useEffect(() => {
    if (!selectedDistributor) {
      setBrandList([]);
      setSubBrandList([]);
      setSelectedSubBrands([]);
      return;
    }

    const fetchBrandsAndSubBrands = async () => {
      setSubBrandLoading(true);
      try {
        const res = await getDistributorSubBrandList(selectedDistributor);
        const subBrands = res?.data?.data || [];
        setSubBrandList(subBrands);

        // Extract unique brands from subBrand results
        const uniqueBrandsMap = new Map();
        subBrands.forEach((sb) => {
          if (sb.brandId && sb.brandId._id) {
            uniqueBrandsMap.set(sb.brandId._id, sb.brandId);
          }
        });
        setBrandList(Array.from(uniqueBrandsMap.values()));
      } catch (error) {
        toast.error("Failed to fetch brands and sub-brands");
        setBrandList([]);
        setSubBrandList([]);
      } finally {
        setSubBrandLoading(false);
      }
    };

    fetchBrandsAndSubBrands();
  }, [selectedDistributor]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, subBrandIds: selectedSubBrands }));
  }, [selectedSubBrands]);

  //useEffect for subBrands

  useEffect(() => {
    if (selectedBrands.length === 0) {
      setSelectedSubBrands([]);
    }
    // Optionally clear subBrand selections that no longer belong to selected brands
    setSelectedSubBrands((prev) =>
      prev.filter((sbId) => {
        const sb = subBrandList.find((s) => s._id === sbId);
        return (
          sb &&
          selectedBrands.includes(
            typeof sb.brandId === "object" ? sb.brandId._id : sb.brandId,
          )
        );
      }),
    );
  }, [selectedBrands]);

  // Fetch outlets when distributor changes
  useEffect(() => {
    if (selectedDistributor) {
      getOutletList(selectedDistributor);
      setFormData((prev) => ({ ...prev, retailerId: "" }));
      setOutletSearchTerm("");
      setOutletSearchResults([]);
      setSelectedBrands([]);
      setSelectedSubBrands([]); // ← ADD
      setSubBrandList([]);
    } else {
      setOutletList([]);
      setBrandList([]);
      setSubBrandList([]);
    }
  }, [selectedDistributor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchDistributors(distributorSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [distributorSearchTerm, distributors]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (outletSearchTerm) {
        searchOutlets(outletSearchTerm);
      } else {
        setOutletSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [outletSearchTerm, selectedDistributor]);

  // Fetch data when modal opens
  useEffect(() => {
    if (openModal) {
      dispatch(fetchDistributors());
      dispatch(fetchBrands());
    }
  }, [openModal, dispatch]);

  // Update formData when dateRange changes
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      setFormData((prev) => ({
        ...prev,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      }));
    }
  }, [dateRange]);

  // Update formData when selectedBrands changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      brandIds: selectedBrands,
    }));
  }, [selectedBrands]);

  const validate = () => {
    if (!selectedDistributor) {
      toast.error("Distributor is required");
      return false;
    }
    if (!formData.name.trim()) {
      toast.error("Target name is required");
      return false;
    }
    if (!formData.retailerId) {
      toast.error("Retailer is required");
      return false;
    }
    if (
      formData.subBrandIds &&
      formData.subBrandIds.length > 0 &&
      (!formData.brandIds || formData.brandIds.length === 0)
    ) {
      toast.error("At least one brand is required when selecting sub-brands");
      return false;
    }
    if (!formData.target_type) {
      toast.error("Target type is required");
      return false;
    }
    if (!formData.target || formData.target <= 0) {
      toast.error("Target value must be greater than 0");
      return false;
    }
    if (!formData.start_date || !formData.end_date) {
      toast.error("Start date and end date are required");
      return false;
    }
    return true;
  };

  const handleClose = () => {
    setSelectedDistributor("");
    setDistributorSearchTerm("");
    setDistributorSearchResults([]);
    setFormData({
      name: "",
      retailerId: "",
      brandIds: [],
      target_type: "",
      target: "",
      start_date: null,
      end_date: null,
    });
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setOutletSearchTerm("");
    setOutletSearchResults([]);
    setOutletList([]);
    setBrandList([]);
    setSelectedBrands([]);
    setSelectedSubBrands([]); // ← ADD
    setSubBrandList([]);
    onCloseModal();
  };

  const handleAddTarget = async () => {
    try {
      if (!validate()) return;
      setFormLoading(true);

      const payload = {
        distributorId: selectedDistributor,
        retailerId: formData.retailerId,
        brandIds: formData.brandIds,
        subBrandIds: formData.subBrandIds,
        name: formData.name,
        target_type: formData.target_type,
        target: Number(formData.target),
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      const data = await createSecondaryTarget(payload); // ← returns response.data

      toast.success(data?.message || "Secondary Target Created Successfully");
      handleClose(); // ← closes modal
      onSuccess?.(); // ← refreshes table
    } catch (error) {
      toast.error(
        error?.message || "Failed to add Secondary Target, try again",
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal show={openModal} onClose={handleClose} size="4xl">
      <Modal.Header>Create Single Target (Select Distributor)</Modal.Header>
      <Modal.Body className="overflow-visible">
        <div className="space-y-4 max-h-[calc(100vh-200px)]">
          {/* Distributor Selection */}
          <div>
            <Label htmlFor="distributor">Distributor</Label>
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

          {/* Target Name */}
          <div>
            <Label htmlFor="target-name">Target Name</Label>
            <TextInput
              id="target-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter Target Name"
              disabled={!selectedDistributor}
            />
          </div>

          {/* Retailer */}
          <div>
            <Label htmlFor="retailer">Retailer</Label>
            <SearchableSelect
              options={getDisplayOutletList()}
              value={formData.retailerId}
              onChange={(e) =>
                setFormData({ ...formData, retailerId: e.target.value })
              }
              onSearchChange={(term) => setOutletSearchTerm(term)}
              isSearching={isSearchingOutlet}
              placeholder={
                !selectedDistributor
                  ? "Select distributor first"
                  : outletLoading
                    ? "Loading..."
                    : "Type to search retailer..."
              }
              disabled={outletLoading || !selectedDistributor}
              displayKey="outletName"
              descKey="outletUID"
              valueKey="_id"
              className="w-full"
              id="retailer-select"
              label="Retailer Name"
              defaultValue=""
            />
          </div>

          {/* Brand Selection */}
          <div>
            <Label htmlFor="brand">Select Brand(s)</Label>
            <SearchableSelect
              id="brandId"
              options={brandList}
              value={selectedBrands}
              onChange={(e) => setSelectedBrands(e.target.value)}
              placeholder={
                !selectedDistributor
                  ? "Select distributor first"
                  : "Select one or more brands"
              }
              displayKey="name"
              valueKey="_id"
              descKey="code"
              multiple={true}
              disabled={!selectedDistributor}
            />
          </div>

          {/* SubBrand Selection */}
          <div>
            <Label htmlFor="subBrand">
              Select SubBrand(s){" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <SearchableSelect
              id="subBrandId"
              options={subBrandList.filter((sb) => {
                const brandId =
                  typeof sb.brandId === "object" ? sb.brandId._id : sb.brandId;
                return selectedBrands.includes(brandId);
              })}
              value={selectedSubBrands}
              onChange={(e) => setSelectedSubBrands(e.target.value)}
              placeholder={
                !selectedDistributor
                  ? "Select distributor first"
                  : selectedBrands.length === 0
                    ? "Select brand(s) first"
                    : subBrandLoading
                      ? "Loading..."
                      : "Select sub-brands (optional)"
              }
              displayKey="name"
              valueKey="_id"
              descKey="code"
              multiple={true}
              disabled={
                !selectedDistributor ||
                selectedBrands.length === 0 ||
                subBrandLoading
              }
            />
          </div>

          {/* Target Type and Target Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target-type">Target Type</Label>
              <Select
                id="target-type"
                value={formData.target_type}
                onChange={(e) =>
                  setFormData({ ...formData, target_type: e.target.value })
                }
                disabled={!selectedDistributor}
              >
                <option value="">Select Target Type</option>
                <option value="volume">Volume</option>
                <option value="value">Value</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="target-value">
                Target Value{" "}
                {formData.target_type && (
                  <span className="text-gray-400 text-xs font-normal">
                    ({formData.target_type === "volume" ? "Pcs" : "INR"})
                  </span>
                )}
              </Label>
              <div className="relative">
                <TextInput
                  id="target-value"
                  type="number"
                  value={formData.target}
                  onChange={(e) =>
                    setFormData({ ...formData, target: e.target.value })
                  }
                  placeholder={
                    formData.target_type === "volume"
                      ? "e.g. 1000 (Pcs)"
                      : formData.target_type === "value"
                        ? "e.g. 1000 (INR)"
                        : "Enter Target Value"
                  }
                  disabled={!selectedDistributor}
                />
                {formData.target && formData.target_type && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {formData.target_type === "volume" ? "Pcs" : "INR"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label htmlFor="date-range">
              Target Period (Start Date - End Date)
            </Label>
            <div className="mt-1">
              <Datepicker
                containerClassName="relative"
                inputClassName="relative py-2.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 rounded-xs tracking-wide text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none dark:placeholder-gray-400 dark:focus:border-cyan-500"
                showShortcuts={true}
                value={dateRange}
                onChange={(range) => setDateRange(range)}
                minDate={
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
                placeholder="Select start and end date"
                disabled={!selectedDistributor}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex flex-wrap justify-end gap-2 w-full">
          <Button
            onClick={handleClose}
            color="gray"
            disabled={formLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddTarget}
            disabled={formLoading}
            className="w-full sm:w-auto"
          >
            {formLoading && <Spinner className="mr-2" size="sm" />}
            Create Target
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateSingleTargetModal;
