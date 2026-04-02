import axios from "axios";
import { BACKEND_URL } from "../constants";

export function setAuthHeader() {
  const userInfo = JSON.parse(localStorage.getItem("DMS_USERINFO"));
  const token = userInfo?.token || userInfo?.data?.token;

  if (!token) {
    console.warn("No authentication token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: token ? "Bearer " + token : "",
  };
}

export const getSalesOrderEntryLog = async (queryParams) => {
  try {
    const response = await axios.get(
      BACKEND_URL +
        "/api/v1/external/secondary-order-entry-data-import-log-paginated",
      {
        headers: setAuthHeader(),
        params: queryParams,
      }
    );
    return response;
  } catch (error) {
    return (
      error.response?.data || {
        error: true,
        message: "Error fetching Sales Order Log",
      }
    );
  }
};


// Find bill and Orders of inactive outlets
export const getInactiveOutletOrder = async () => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/outletApproved/inactive-outlet-order",
      {
        headers: setAuthHeader(), // ✅ Added
      }
    );
    return response;
  } catch (error) {
    throw (
      error.response?.data || {
        error: true,
        message: "Error fetching inactive outlet orders",
      }
    );
  }
};

// Swap Order + Bills Automatically
export const swapOutletOrder = async (data) => {
  return axios.post(
    BACKEND_URL + "/api/v1/outletApproved/swap-order-retailer",
    data,
    {
      headers: setAuthHeader(),
    },
  );
};
