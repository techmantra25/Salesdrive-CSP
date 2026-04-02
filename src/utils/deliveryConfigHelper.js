import moment from "moment";

/**
 * Check if bill delivery configuration is active for a distributor
 * @param {Object} setting - Bill delivery setting object
 * @returns {boolean} - True if configuration is active/enabled
 */
export const isDeliveryConfigActive = (setting) => {
  if (!setting) return false;
  return setting?.isActive !== false;
};

/**
 * Calculate delivery deadline for a bill
 * @param {Object} billDate - Bill created date
 * @param {number} durationDays - Duration in days from bill creation
 * @returns {Object} - { deadline: Date, remainingDays: number, isOverdue: boolean }
 */
export const calculateDeliveryDeadline = (billDate, durationDays) => {
  if (!billDate || !durationDays || durationDays <= 0) {
    return null;
  }

  const deadline = moment(billDate).add(durationDays, "days");
  const now = moment();
  const remainingDays = deadline.diff(now, "days");
  const isOverdue = now.isAfter(deadline);

  return {
    deadline: deadline.toDate(),
    deadlineFormatted: deadline.format("DD-MMM-YYYY"),
    remainingDays,
    isOverdue,
    daysOverdue: isOverdue ? Math.abs(remainingDays) : 0,
  };
};

/**
 * Get delivery status badge info
 * @param {Object} setting - Bill delivery setting
 * @returns {Object} - { color, label, icon }
 */
export const getDeliveryStatusBadge = (setting) => {
  if (!setting) {
    return {
      color: "gray",
      label: "Not Configured",
      icon: "⚙️",
      isActive: false,
    };
  }

  if (setting?.isActive === false) {
    return {
      color: "gray",
      label: "OFF",
      icon: "⭕",
      isActive: false,
    };
  }

  return {
    color: "success",
    label: "ON",
    icon: "⚫",
    isActive: true,
  };
};

/**
 * Check if bill should display delivery deadline info
 * @param {Object} bill - Bill object
 * @param {Object} deliverySetting - Delivery configuration setting
 * @returns {boolean} - True if deadline should be shown
 */
export const shouldShowDeliveryDeadline = (bill, deliverySetting) => {
  if (!bill || !deliverySetting) return false;
  if (deliverySetting?.isActive === false) return false;
  if (!bill?.createdAt || !deliverySetting?.deliveryDurationDays) return false;
  return true;
};

/**
 * Filter and format bills based on delivery configuration
 * @param {Array} bills - Array of bills
 * @param {Object} deliverySetting - Delivery configuration
 * @returns {Array} - Enhanced bills with deadline info
 */
export const enhanceBillsWithDeliveryInfo = (bills, deliverySetting) => {
  if (!Array.isArray(bills) || !deliverySetting?.isActive) {
    return bills || [];
  }

  return bills.map((bill) => {
    const deadline = calculateDeliveryDeadline(
      bill.createdAt,
      deliverySetting.deliveryDurationDays,
    );

    return {
      ...bill,
      deliveryDeadline: deadline,
      deliveryStatus: getDeliveryStatus(deadline),
    };
  });
};

/**
 * Get human-readable delivery status
 * @param {Object} deadline - Deadline object from calculateDeliveryDeadline
 * @returns {string} - Status string
 */
const getDeliveryStatus = (deadline) => {
  if (!deadline) return "Unknown";
  if (deadline.isOverdue) {
    return `${deadline.daysOverdue} days overdue`;
  }
  if (deadline.remainingDays === 0) {
    return "Due today";
  }
  return `${deadline.remainingDays} days remaining`;
};

/**
 * Get color for delivery status
 * @param {Object} deadline - Deadline object
 * @returns {string} - Color class/code
 */
export const getDeliveryStatusColor = (deadline) => {
  if (!deadline) return "gray";
  if (deadline.isOverdue) return "failure"; // Red
  if (deadline.remainingDays <= 2) return "warning"; // Yellow
  return "success"; // Green
};
