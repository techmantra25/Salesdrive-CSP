import { useState, useRef, useEffect } from "react";
import {
  Button,
  Card,
  Label,
  Select,
  TextInput,
  Spinner,
  Table,
  Badge,
} from "flowbite-react";

const TargetPopover = ({ targets }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!targets || targets.length === 0) {
    return <span className="text-gray-400 text-xs">No Targets</span>;
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
      >
        {targets.length} Target{targets.length > 1 ? "s" : ""}
        <span
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 min-w-max bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg py-1">
          {/* header row */}
          <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 grid grid-cols-4 gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span>Target Name</span>
            <span>Type</span>
            <span>Retailer</span>
            <span>Distributor</span>
          </div>

          {/* targets */}
          {targets.map((t) => (
            <div
              key={t._id}
              className="px-3 py-1.5 grid grid-cols-4 gap-3 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
            >
              <span className="font-medium">{t.name}</span>

              <span>
                <Badge
                  color={t.target_type === "volume" ? "info" : "purple"}
                  className="inline-flex w-fit text-[10px] px-2 py-0.5"
                >
                  {t.target_type?.toUpperCase()}
                </Badge>
              </span>
              <span>
                {t.retailerName}{" "}
                <span className="text-gray-400">({t.retailerUID})</span>
              </span>
              <span>{t.distributorName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TargetPopover;
