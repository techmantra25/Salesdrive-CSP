import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";

const StatusIndicator = ({ status, onClick, isDisabled = false }) => (
  <span
    className={`flex items-center justify-center gap-2 ${
      status
        ? "dark:text-emerald-300 text-emerald-500"
        : "dark:text-red-400 text-red-500"
    }
    ${
      isDisabled
        ? "cursor-not-allowed opacity-50"
        : "cursor-pointer opacity-100"
    }    
    `}
    onClick={() => {
      if (!isDisabled && onClick) onClick();
    }}
  >
    {status ? (
      <>
        <span>
          <FaCheckCircle size={15} />
        </span>
        Active
      </>
    ) : (
      <>
        <span>
          <FaMinusCircle size={15} />
        </span>
        Inactive
      </>
    )}
  </span>
);

export const StatusIndicatorNew = ({ status, onClick, isDisabled = false }) => (
  <span
    className={`flex items-center justify-center gap-2 ${
      status === "active"
        ? "dark:text-emerald-300 text-emerald-500"
        : status === "inactive"
        ? "dark:text-red-300 text-red-500"
        : "dark:text-amber-300 text-amber-500"
    }
    ${
      isDisabled
        ? "cursor-not-allowed opacity-50"
        : "cursor-pointer opacity-100"
    }    
    `}
    onClick={() => {
      if (!isDisabled && onClick) onClick();
    }}
  >
    {status === "active" ? (
      <>
        <span>
          <FaCheckCircle size={15} />
        </span>
        Active
      </>
    ) : status === "inactive" ? (
      <>
        <span>
          <FaMinusCircle size={15} />
        </span>
        Inactive
      </>
    ) : (
      <>
        <span>
          <FaClockRotateLeft size={15} />
        </span>
        {status === "draft" ? "Draft" : status}
      </>
    )}
  </span>
);

export const StatusIndicator2 = ({ status }) => (
  <span
    className={`flex items-center justify-center gap-2 ${
      status === "Approved"
        ? "dark:text-emerald-400 text-emerald-600"
        : status === "Rejected"
        ? "dark:text-red-400 text-red-600"
        : "dark:text-amber-400 text-amber-600"
    }
    `}
  >
    {status === "Approved" ? (
      <>
        <span>
          <FaCheckCircle size={15} />
        </span>
        Active
      </>
    ) : (
      <>
        <span>
          <FaMinusCircle size={15} />
        </span>
        {status}
      </>
    )}
  </span>
);

export const StatusIndicator3 = ({ status }) => (
  <span
    className={`flex items-center justify-center gap-2 ${
      status === "Confirmed"
        ? "dark:text-emerald-400 text-emerald-600"
        : status === "Ignored"
        ? "dark:text-red-400 text-red-600"
        : status === "In-Transit"
        ? "dark:text-amber-400 text-amber-600"
        : "dark:text-gray-400 text-gray-600"
    }
    `}
  >
    {status === "Confirmed" ? (
      <>
        <span>
          <FaCheckCircle size={15} />
        </span>
        {status}
      </>
    ) : (
      <>
        <span>
          <FaMinusCircle size={15} />
        </span>
        {status}
      </>
    )}
  </span>
);

export const PurchaseOrderStatusIndicator = ({ status }) => {
  return (
    <span
      className={`flex items-center justify-center gap-2 ${
        status === "Draft"
          ? "dark:text-amber-400 text-amber-600" // Amber for draft
          : status === "Cancelled"
          ? "dark:text-red-500 text-red-600" // Red for cancelled
          : status === "Confirmed"
          ? "dark:text-emerald-400 text-emerald-600" // Green for confirmed
          : "dark:text-gray-400 text-gray-600" // Default color for other statuses
      }`}
    >
      {status === "Draft" ? (
        <>
          <span>
            <FaClockRotateLeft size={15} />
          </span>
          Draft
        </>
      ) : status === "Cancelled" ? (
        <>
          <span>
            <FaMinusCircle size={15} />
          </span>
          Cancelled
        </>
      ) : status === "Confirmed" ? (
        <>
          <span>
            <FaCheckCircle size={15} />
          </span>
          Confirmed
        </>
      ) : (
        <>
          <span>
            <FaMinusCircle size={15} />
          </span>
          {status}
        </>
      )}
    </span>
  );
};

export default StatusIndicator;
