import React from "react";

export const AutoDeliveryToggle = ({
  isAuto = false,
  selectedValue,
  onChange,
  disabled = false,
}) => {
  // Check if selectedValue prop was provided (even if null)
  const hasSelectedValueProp = selectedValue !== undefined;
  const hasExplicitSelection =
    selectedValue === true || selectedValue === false;
  const effectiveValue = hasExplicitSelection ? selectedValue : isAuto;
  const showNotSelected = hasSelectedValueProp && !hasExplicitSelection;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toggle Switch Container with Status Badge */}
      <div className="flex items-center justify-between gap-6">
        {/* Left Side - ON/OFF Toggle Buttons */}
        <div className="flex gap-3 items-center">
          {/* OFF Button */}
          <button
            onClick={() => !disabled && onChange(false)}
            disabled={disabled}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
              !showNotSelected && !effectiveValue
                ? "bg-blue-500 dark:bg-blue-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            title="Do not apply backdate billing logic. Uses actual delivery date."
          >
            OFF
          </button>

          {/* ON Button */}
          <button
            onClick={() => !disabled && onChange(true)}
            disabled={disabled}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
              !showNotSelected && effectiveValue
                ? "bg-green-500 dark:bg-green-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            title="Apply backdate billing logic for previous-month bills delivered in the next month."
          >
            ON
          </button>
        </div>

        {/* Right Side - Status Badge */}
        <div
          className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
            showNotSelected
              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
              : effectiveValue
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-700"
                : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700"
          }`}
        >
          {showNotSelected ? "Not Selected" : effectiveValue ? "ON" : "OFF"}
        </div>
      </div>
    </div>
  );
};

export default AutoDeliveryToggle;
