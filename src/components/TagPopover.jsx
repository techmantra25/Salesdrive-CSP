import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const TagPopover = ({ items, label, color = "blue" }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recalculate position on scroll or resize
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
          top:  rect.bottom + window.scrollY + 4,
          left: rect.left  + window.scrollX,
        });
      }
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top:  rect.bottom + window.scrollY + 4,
        left: rect.left  + window.scrollX,
      });
    }
    setOpen((prev) => !prev);
  };

  if (!items || items.length === 0) {
    return <span className="text-gray-400 text-xs">—</span>;
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors
          ${color === "indigo"
            ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            : "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
          }`}
      >
        {items.length} {label}
        <span className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && createPortal(
        <div
          style={{
            position: "absolute",
            top:      coords.top,
            left:     coords.left,
            zIndex:   9999,
          }}
          className="min-w-max bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1"
        >
          {items.map((item) => (
            <div
              key={item._id}
              className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
            >
              {item.name}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
};

export default TagPopover;