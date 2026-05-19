import { TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  className,
  displayKey = "name",
  valueKey = "_id",
  descKey = "desc",
  defaultValue = "",
  label,
  id,
  multiple = false,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);

  const internalValue = multiple ? (Array.isArray(value) ? value : []) : value;

  useEffect(() => {
    console.log("OPTIONS RECEIVED:", options);        // add this
    console.log("DISPLAY KEY:", displayKey);
    const filtered = options.filter(
      (option) =>
        option[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option[descKey] &&
          option[descKey]?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options, displayKey, descKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    let newValue;
    if (multiple) {
      if (internalValue.includes(option[valueKey])) {
        newValue = internalValue.filter((val) => val !== option[valueKey]);
      } else {
        newValue = [...internalValue, option[valueKey]];
      }
      onChange({ target: { value: newValue } });
    } else {
      onChange({ target: { value: option[valueKey] } });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange({ target: { value: multiple ? [] : defaultValue } });
    setIsOpen(false);
    setSearchTerm("");
  };

  // const handleSelectAll = () => {
  //   const allValues = filteredOptions.map((option) => option[valueKey]);
  //   onChange({ target: { value: allValues } });
  // };

  const handleSelectAll = () => {
    // Instead of returning all IDs, just return `"all"`
    onChange({ target: { value: ["all"] } });
    setIsOpen(false); // close dropdown after selecting all
  };

  const selectedDisplay = () => {
    if (multiple) {
      if (internalValue.length === 0) {
        return placeholder;
      } else if (internalValue.includes("all")) {
        return "All selected";
      } else {
        return `${internalValue.length} selected`;
      }
    } else {
      const selectedOption = options.find(
        (option) => option[valueKey] === internalValue
      );
      return selectedOption
        ? `${selectedOption[displayKey]}${selectedOption[descKey] ? ` (${selectedOption[descKey]})` : ""
        }`
        : placeholder;
    }
  };

  const isOptionSelected = (option) => {
    return multiple
      ? internalValue.includes(option[valueKey])
      : internalValue === option[valueKey];
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        setIsOpen(true);
        e.preventDefault();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      e.preventDefault();
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <div
        id={id}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        tabIndex={disabled ? -1 : 0}
        className={`flex h-[42px] items-center justify-between rounded-xl border border-slate-900 bg-slate-700 px-4 text-sm text-white shadow-sm transition-all duration-200 outline-none focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 ${
  disabled
    ? "cursor-not-allowed opacity-70"
    : "hover:border-slate-500"
} ${isOpen ? "ring-2 ring-indigo-500 border-indigo-500" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={label || placeholder}
        title={title || placeholder}
      >
        <span
          className={
            (selectedDisplay() !== placeholder
              ? "text-white"
              : "text-slate-400") +
            " truncate block max-w-[calc(100%-1.5rem)]"
          }
          title={selectedDisplay()}
        >
          {selectedDisplay()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
            } dark:text-gray-300`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-[#1e293b] shadow-2xl"
        >
         <div className="border-b border-slate-700 p-2 bg-[#0f172a]">
            <TextInput
              sizing="sm"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              aria-label={`Search ${placeholder}`}
            />
          </div>
          <div className="max-h-48 overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
              {multiple && (
                <div
                  className="px-3 py-1 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={handleSelectAll}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSelectAll();
                  }}
                >
                  <span className="text-gray-500 text-xs dark:text-gray-400">
                    Select All
                  </span>
                </div>
              )}
              <div
                className="px-3 py-1 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={handleClear}
                role="option"
                aria-selected={
                  multiple ? internalValue.length === 0 : internalValue === ""
                }
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleClear();
                }}
              >
                <span className="text-gray-500 text-xs dark:text-gray-400">
                  Clear
                </span>
              </div>
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
               <div
  key={option[valueKey]}
  className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-all duration-150 hover:bg-slate-700 ${
    isOptionSelected(option)
      ? "bg-indigo-600/20 text-indigo-300"
      : "text-slate-200"
  }`}
  role="option"
  aria-selected={isOptionSelected(option)}
  tabIndex={0}
  onClick={() => handleSelect(option)}
  onKeyDown={(e) => {
    if (e.key === "Enter") handleSelect(option);
  }}
>
  <span
    className="truncate"
    title={
      option[descKey]
        ? `${option[displayKey]} (${option[descKey]})`
        : option[displayKey]
    }
  >
    {option[displayKey]}

    {option[descKey] && (
      <span className="ml-1 text-xs text-slate-400">
        ({option[descKey]})
      </span>
    )}
  </span>

  {multiple && isOptionSelected(option) && (
    <svg
      className="w-4 h-4 text-indigo-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )}
</div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
