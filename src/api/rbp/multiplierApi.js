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

//http://localhost:10000/api/v2/retailer-transaction/update-retailer-multiplier-transaction/692C96B983755CE6C3C3E652

export const updateRetailerMultiplierTransaction = async (id) => {
  try {
    const response = await axios.put(
      `${BACKEND_URL}/api/v2/retailer-transaction/update-retailer-multiplier-transaction/${id}`,
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
export const editRetailerMultiplierPoint = async (id, payload) => {
  try {
    const response = await axios.put(
      `${BACKEND_URL}/api/v2/retailer-transaction/edit-retailer-multiplier-point/${id}`,
      payload, // { point, monthTotalPoints }
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};


export const rebuildRetailerBalance = async (retailerId) => {
  return axios.post(
    `${BACKEND_URL}/api/v1/outlet-retailer-transaction/rebuild-balance/${retailerId}`,
    {}, 
    {
      headers: setAuthHeader(), 
    }
  );
};



///api/v2/retailer-transaction/bulk-sync-retailer-multiplier-transactions


export const bulkSyncRetailerMultiplierTransactions = async () => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v2/retailer-transaction/bulk-sync-retailer-multiplier-transactions`,
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

//http://localhost:10000/api/v1/retailerMultiplier/missing-retailer-multiplier-txn-count

export const getMissingRetailerMultiplierTxnCount = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/retailerMultiplier/missing-retailer-multiplier-txn-count`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};