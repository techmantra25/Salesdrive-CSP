import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function getPageNumbers(current, total) {
  // Show up to 5 page numbers, with ellipsis if needed
  const delta = 2;
  const range = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }
  if (current - delta > 2) range.unshift("...");
  if (current + delta < total - 1) range.push("...");
  range.unshift(1);
  if (total > 1) range.push(total);
  return range;
}

export default function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="inline-flex items-center gap-1 select-none"
      aria-label="Pagination"
    >
      <button
        className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous"
      >
        <FaChevronLeft size={14} />
      </button>
      {pageNumbers.map((num, idx) =>
        num === "..." ? (
          <span
            key={idx}
            className="px-2 py-1 text-gray-400 dark:text-gray-500"
          >
            ...
          </span>
        ) : (
          <button
            key={num}
            className={`px-2 py-1 rounded ${
              num === currentPage
                ? "bg-blue-600 text-white font-bold"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => onPageChange(num)}
            aria-current={num === currentPage ? "page" : undefined}
          >
            {num}
          </button>
        )
      )}
      <button
        className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next"
      >
        <FaChevronRight size={14} />
      </button>
    </nav>
  );
}
