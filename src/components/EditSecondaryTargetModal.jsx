import { useState, useEffect } from "react";
import { Modal, Label, TextInput, Button, Spinner } from "flowbite-react";
import toast from "react-hot-toast";
import Datepicker from "react-tailwindcss-datepicker";
import SearchableSelect from "./SearchableSelect";
import { editTarget, getDistributorSubBrandList } from "../api/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchDistributors } from "../redux/distributorListSlice";

const EditSecondaryTargetModal = ({
  openModal,
  onCloseModal,
  currentUser,
  targetData,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [formLoading, setFormLoading] = useState(false);
  const [isPopulated, setIsPopulated] = useState(false);

  // brand and sub-brands states
  const [brandList, setBrandList] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [subBrandList, setSubBrandList] = useState([]);
  const [selectedSubBrands, setSelectedSubBrands] = useState([]);
  const [subBrandLoading, setSubBrandLoading] = useState(false);

  // form states
  const [formData, setFormData] = useState({
    name: "",
    start_date: null,
    end_date: null,
    target: "",
  });

  // Date states
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // populate form when targetData changes
  useEffect(() => {
    if (targetData && openModal) {
      setIsPopulated(false);

      setFormData({
        name: targetData.name || "",
        start_date: targetData.start_date || null,
        end_date: targetData.end_date || null,
        target: targetData.target || "",
      });

      setDateRange({
        startDate: targetData.start_date || null,
        endDate: targetData.end_date || null,
      });

      const existingBrandIds = (targetData.brands || []).map((b) => b._id);
      const existingSubBrandIds = (targetData.subBrands || []).map((b) => b._id);

      setSelectedBrands(existingBrandIds);
      setSelectedSubBrands(existingSubBrandIds);

      const distributorId =
        targetData.distributorId?._id || targetData.distributorId;
      if (distributorId) fetchBrandsAndSubBrands(distributorId);
      dispatch(fetchDistributors());

      setIsPopulated(true);
    }
  }, [targetData, openModal]);

  // fetch brands and sub-brands for this distributor
  const fetchBrandsAndSubBrands = async (distributorId) => {
    if (!distributorId) return;

    setSubBrandLoading(true);
    try {
      const res = await getDistributorSubBrandList(distributorId);
      const subBrands = res?.data?.data || [];
      setSubBrandList(subBrands);

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

  // clear sub-brands that no longer belong when brands change
  // guard with isPopulated so this does NOT fire during initial data load
  useEffect(() => {
    if (!isPopulated) return;

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

  // sync daterange with form date
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      setFormData((prev) => ({
        ...prev,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      }));
    }
  }, [dateRange]);

  // check if target has ended
  const hasTargetEnded = () => {
    const endDate = targetData?.end_date || targetData?.target_to;
    if (!endDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetEndDate = new Date(endDate);
    targetEndDate.setHours(0, 0, 0, 0);
    return targetEndDate < today;
  };

  // validation
  const validate = () => {
    if (!formData.name.trim()) {
      toast.error("Target name is required");
      return false;
    }
    if (
      !formData.target ||
      isNaN(Number(formData.target)) ||
      Number(formData.target) < 0
    ) {
      toast.error("Valid target value is required");
      return false;
    }
    if (selectedSubBrands.length > 0 && selectedBrands.length === 0) {
      toast.error("At least one brand is required when selecting sub-brands");
      return false;
    }
    if (!formData.start_date || !formData.end_date) {
      toast.error("Start date and end date are required");
      return false;
    }
    return true;
  };

  // close + reset the form
  const handleClose = () => {
    setFormData({ name: "", start_date: null, end_date: null, target: "" });
    setDateRange({ startDate: null, endDate: null });
    setSelectedBrands([]);
    setSelectedSubBrands([]);
    setBrandList([]);
    setSubBrandList([]);
    setIsPopulated(false);
    onCloseModal();
  };

  // submit function
  const handleUpdateTarget = async () => {
    try {
      if (!validate()) return;

      if (!targetData?._id) {
        toast.error("Target ID is missing");
        return;
      }

      setFormLoading(true);

      const payload = {
        name: formData.name,
        brandIds: selectedBrands,
        subBrandIds: selectedSubBrands,
        start_date: formData.start_date,
        end_date: formData.end_date,
        target: Number(formData.target),
      };

      const response = await editTarget(payload, targetData._id);

      if (response?.status === 200) {
        toast.success(
          response?.data?.message || "Secondary Target Updated Successfully",
        );
        handleClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update Secondary Target, try again",
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal show={openModal} onClose={handleClose} size="4xl">
      <Modal.Header>Edit Secondary Target</Modal.Header>

      <Modal.Body className="overflow-visible">
        <div className="space-y-4">
          {/* ended warning */}
          {hasTargetEnded() && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Warning: </strong>
              This target has already ended and cannot be edited.
            </div>
          )}

          {/* Read-only info — distributor, retailer, target type */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Distributor</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {targetData?.distributorId?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Retailer</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {targetData?.retailerId?.outletName || "—"}
                <span className="text-gray-400 text-xs ml-1">
                  ({targetData?.retailerId?.outletUID || "—"})
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Target Type</p>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  targetData?.target_type === "volume"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {targetData?.target_type?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Target Name */}
          <div>
            <Label htmlFor="edit-target-name">Target Name</Label>
            <TextInput
              id="edit-target-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter Target Name"
              disabled={hasTargetEnded()}
            />
          </div>

          {/* Target Qty / Value */}
          <div>
            <Label htmlFor="edit-target-value">
              Target{" "}
              {targetData?.target_type === "volume" ? "Qty (Pcs)" : "Value (₹)"}
            </Label>
            <TextInput
              id="edit-target-value"
              type="number"
              min={0}
              value={formData.target}
              onChange={(e) =>
                setFormData({ ...formData, target: e.target.value })
              }
              placeholder={`Enter target ${
                targetData?.target_type === "volume" ? "quantity" : "value"
              }`}
              disabled={hasTargetEnded()}
            />
          </div>

          {/* Brand Selection */}
          <div>
            <Label>
              Select Brand(s){" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            {subBrandLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Spinner size="sm" />
                <span>Loading Brands...</span>
              </div>
            ) : (
              <SearchableSelect
                id="edit-brandIds"
                options={brandList}
                value={selectedBrands}
                onChange={(e) => setSelectedBrands(e.target.value)}
                placeholder={
                  brandList.length === 0
                    ? "No brands available"
                    : "Select one or more brands"
                }
                displayKey="name"
                valueKey="_id"
                descKey="code"
                multiple={true}
                disabled={hasTargetEnded() || subBrandLoading}
              />
            )}
          </div>

          {/* Sub-brand Selection */}
          <div>
            <Label>
              Select SubBrand(s){" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <SearchableSelect
              id="edit-subBrandIds"
              options={subBrandList.filter((sb) => {
                const brandId =
                  typeof sb.brandId === "object" ? sb.brandId._id : sb.brandId;
                return selectedBrands.includes(brandId);
              })}
              value={selectedSubBrands}
              onChange={(e) => setSelectedSubBrands(e.target.value)}
              placeholder={
                selectedBrands.length === 0
                  ? "Select brand(s) first"
                  : "Select sub-brands (optional)"
              }
              displayKey="name"
              valueKey="_id"
              descKey="code"
              multiple={true}
              disabled={
                hasTargetEnded() ||
                selectedBrands.length === 0 ||
                subBrandLoading
              }
            />
          </div>

          {/* Date Range */}
          <div>
            <Label>Target Period (Start Date - End Date)</Label>
            <div className="mt-1">
              <Datepicker
                containerClassName="relative"
                inputClassName="relative py-2.5 pl-4 pr-14 w-full border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white/80 text-sm placeholder-gray-400 focus:ring-1 focus:border-cyan-500 focus:outline-none"
                showShortcuts={false}
                value={dateRange}
                onChange={(range) => setDateRange(range)}
                minDate={
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
                placeholder="Select start and end date"
                disabled={hasTargetEnded()}
              />
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end gap-2 w-full">
          <Button color="gray" onClick={handleClose} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleUpdateTarget}
            disabled={formLoading || hasTargetEnded()}
          >
            {formLoading && <Spinner className="mr-2" size="sm" />}
            {formLoading ? "Updating..." : "Update Target"}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSecondaryTargetModal;