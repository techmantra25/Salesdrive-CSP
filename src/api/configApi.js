import axios from "axios";
import { BACKEND_URL } from "../constants";
import { setAuthHeader } from "./api";

// export function setAuthHeader() {
//   const userInfo = JSON.parse(localStorage.getItem("DMS_USERINFO"));
//   // Try multiple possible locations for the token
//   const token = userInfo?.token || userInfo?.data?.token;

//   if (!token) {
//     console.warn("No authentication token found");
//   }

//   return {
//     "Content-Type": "application/json",
//     Authorization: token ? "Bearer " + token : "",
//   };
// }

export const getConfig = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/config/get-config`, {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch config"
    );
  }
};

export const updateConfig = async (data) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/config/update-config`,
      data,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update config"
    );
  }
};

//purchase-order-excel-view

export const getPurchaseOrderExcelView = async (payload) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/purchase-order/purchase-order-excel-view`,
      {
        headers: setAuthHeader(),
        params: payload,
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch purchase order excel view"
    );
  }
};

export const getAutoPendingBillCron = async () => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/config/auto-pending-bill-cron`,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};

export const updateAutoPendingBillCron = async (data) => {
  const response = await axios.patch(
    `${BACKEND_URL}/api/v1/config/auto-pending-bill-cron`,
    data,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};

export const getPortalLockCheckCron = async () => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/config/portal-lock-check-cron`,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};

export const updatePortalLockCheckCron = async (data) => {
  const response = await axios.patch(
    `${BACKEND_URL}/api/v1/config/portal-lock-check-cron`,
    data,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};

export const getPartiallyDeliveredBillRetryCron = async () => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/config/partially-delivered-bill-retry-cron`,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const updatePartiallyDeliveredBillRetryCron = async (data) => {
  const response = await axios.patch(
    `${BACKEND_URL}/api/v1/config/partially-delivered-bill-retry-cron`,
    data,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const rebuildDistributorBalance = async () => {
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/config/rebuild-distributor-balance`,
    {},
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const rebuildRetailerBalance = async () => {
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/config/rebuild-retailer-balance`,
    {},
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const fixStockLedgerAllDistributors = async (startDate) => {
  const body = startDate ? { startDate } : {};
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/config/fix-stock-ledger-all-distributors`,
    body,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

// export const getPurchaseOrderExcelView = async (payload) => {
//   const response = await axios.get(
//     `${BACKEND_URL}/api/v1/purchase-order/purchase-order-excel-view`,
//     {
//       headers: setAuthHeader(),
//       params: payload,
//     },
//   );
//   return response;
// };

//purchase-order-excel-view-by-emp

export const getPurchaseOrderExcelViewForEmp = async (payload) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/purchase-order/purchase-order-excel-view-by-emp`,
      {
        headers: setAuthHeader(),
        params: payload,
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch purchase order excel view for employee"
    );
  }
};
