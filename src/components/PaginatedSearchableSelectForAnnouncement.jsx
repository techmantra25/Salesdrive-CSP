import { TextInput, Spinner } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

const PaginatedSearchableSelectForAnnouncement = ({
  fetchOptions,
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
  searchPlaceholder = "Search...",
  initialOptions = [],
  onSelectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const wrapperRef = useRef(null);
  const loadingRef = useRef(false);
  const selectedItemsMap = useRef(new Map());

  const internalValue = multiple ? (Array.isArray(value) ? value : []) : value;

  const fetchData = async (search, pageNum) => {
    if (!fetchOptions || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await fetchOptions(search, pageNum);

      setOptions(prev => pageNum === 1 ? result.data : [...prev, ...result.data]);
      setHasMore(result.pagination?.hasMore || false);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const performSearch = useDebounce(fetchData, 500);

  useEffect(() => {
    if (searchTerm === "") {
      setOptions(initialOptions);
      setHasMore(false);
      setPage(1);
    } else {
      setPage(1);
      setHasMore(true);
      performSearch(searchTerm, 1);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isOpen && searchTerm === "" && options.length === 0 && fetchOptions) {
      setPage(1);
      setHasMore(true);
      fetchData("", 1);
    }
  }, [isOpen]);

  const handleScroll = (e) => {
    const { target } = e;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 5;

    if (bottom && !loading && hasMore && !loadingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(searchTerm, nextPage);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setPage(1);
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
        selectedItemsMap.current.delete(option[valueKey]);
      } else {
        newValue = [...internalValue, option[valueKey]];
        selectedItemsMap.current.set(option[valueKey], option);
      }
      onChange({ target: { value: newValue } });
      
      if (onSelectionChange) {
        const selectedItems = Array.from(selectedItemsMap.current.values());
        onSelectionChange(selectedItems);
      }
    } else {
      onChange({ target: { value: option[valueKey] } });
      setIsOpen(false);
      
      if (onSelectionChange) {
        onSelectionChange([option]);
      }
    }
  };

  const handleClear = () => {
    const newValue = multiple ? [] : defaultValue;
    onChange({ target: { value: newValue } });
    setIsOpen(false);
    setSearchTerm("");
    setPage(1);
    selectedItemsMap.current.clear();

    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const handleSelectAll = () => {
    const allIds = options.map(opt => opt[valueKey]);
    onChange({ target: { value: allIds } });
    
    options.forEach(opt => {
      selectedItemsMap.current.set(opt[valueKey], opt);
    });
    
    setIsOpen(false);
    
    if (onSelectionChange) {
      const selectedItems = Array.from(selectedItemsMap.current.values());
      onSelectionChange(selectedItems);
    }
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
        ? `${selectedOption[displayKey]}${
            selectedOption[descKey] ? ` (${selectedOption[descKey]})` : ""
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

  useEffect(() => {
    // Sync selected items map with current value
    internalValue.forEach(id => {
      if (!selectedItemsMap.current.has(id) && options.length > 0) {
        const found = options.find(opt => opt[valueKey] === id);
        if (found) {
          selectedItemsMap.current.set(id, found);
        }
      }
    });
    
    // Remove items from map that are no longer in internalValue
    selectedItemsMap.current.forEach((_, key) => {
      if (!internalValue.includes(key)) {
        selectedItemsMap.current.delete(key);
      }
    });
  }, [internalValue, options]);

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
        className={`flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 ${
          disabled
            ? "bg-gray-100 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
            : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        } ${isOpen ? "ring-1 ring-lavender-600" : ""} dark:border-gray-600`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label={label || placeholder}
        title={title || placeholder}
      >
        <span
          className={
            (selectedDisplay() !== placeholder
              ? "text-gray-900 dark:text-white/80"
              : "text-gray-500 dark:text-gray-400") +
            " truncate block max-w-[calc(100%-1.5rem)]"
          }
          title={selectedDisplay()}
        >
          {selectedDisplay()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
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
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-hidden"
        >
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <TextInput
              sizing="sm"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              aria-label={searchPlaceholder}
            />
          </div>
          <div
            className="max-h-48 overflow-y-auto text-xs"
            onScroll={handleScroll}
          >
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
              {multiple && options.length > 0 && (
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
            {options.length > 0 ? (
              <>
                {options.map((option) => (
                  <div
                    key={option[valueKey]}
                    className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                      isOptionSelected(option)
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                        : "text-gray-900 dark:text-white/80"
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
                      title={
                        option[descKey]
                          ? `${option[displayKey]} (${option[descKey]})`
                          : option[displayKey]
                      }
                    >
                      {option[displayKey]}
                      {option[descKey] && (
                        <span className="text-gray-500 text-xs dark:text-gray-400">
                          {" "}
                          ({option[descKey]})
                        </span>
                      )}
                    </span>
                    {multiple && isOptionSelected(option) && (
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-300"
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
                ))}
                {loading && (
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-center">
                    <Spinner size="sm" />
                  </div>
                )}
                {!loading && hasMore && (
                  <div className="px-3 py-2 text-xs text-center text-gray-500 dark:text-gray-400 italic">
                    Scroll for more...
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                {loading ? (
                  <div className="flex justify-center">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  "No options found"
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginatedSearchableSelectForAnnouncement;
