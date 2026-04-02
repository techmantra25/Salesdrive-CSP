import axios from "axios";
import { BACKEND_URL } from "../constants";

export function setAuthHeader() {
  const userInfo = JSON.parse(localStorage.getItem("DMS_USERINFO"));
  // Try multiple possible locations for the token
  const token = userInfo?.token || userInfo?.data?.token;

  if (!token) {
    console.warn("No authentication token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: token ? "Bearer " + token : "",
  };
}

export const createBillDeliverySetting = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/bill-delivery-settings`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to save delivery setting",
    );
  }
};

export const createBulkBillDeliverySetting = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/bill-delivery-settings/bulk`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to save bulk delivery setting",
    );
  }
};

export const getAllBillDeliverySettings = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/admin/bill-delivery-settings`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch delivery settings",
    );
  }
};

export const deleteBillDeliverySetting = async (distributorId) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/admin/bill-delivery-settings/${distributorId}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to delete delivery setting",
    );
  }
};

export const unlockDistributorPortal = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/unlock-distributor-portal`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to unlock distributor portal",
    );
  }
};

export const getLockedDistributors = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/admin/locked-distributors`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch locked distributors",
    );
  }
};
