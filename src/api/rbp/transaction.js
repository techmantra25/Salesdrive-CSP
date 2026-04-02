import axios from "axios";
import { BACKEND_URL } from "../../constants";

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

export const getRetailerTransactionHistory = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL +
        `/api/v1/outlet-retailer-transaction/retailer-transaction-paginated`,
      {
        headers: setAuthHeader(),
        params: payload,
      },
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};
//outlet-retailer-transaction/bulk-opening-balance-upload

export const getRetailerTransactionBulkUpload = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL +
        `/api/v1/outlet-retailer-transaction/bulk-opening-balance-upload`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Bulk Manual Points Upload (Validate → Commit)
 * Returns skippedData if ANY error exists
 */
export const getRetailerManualPointBulkUpload = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL +
        `/api/v1/outlet-retailer-transaction/manual-points-bulk-upload`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

//api/v1/outlet-retailer-transaction/remove/:id

export const DeleteRetailerTransaction = async (id) => {
  try {
    const response = await axios.delete(
      BACKEND_URL + `/api/v1/outlet-retailer-transaction/remove/${id}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};


///api/v1/outlet-retailer-transaction/rebuild-all-balances

export const BulkRebuildRetailerTransaction = async () => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/outlet-retailer-transaction/rebuild-all-balances`,
      {},
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};