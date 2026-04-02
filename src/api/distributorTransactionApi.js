import axios from "axios";
import { BACKEND_URL } from "../constants";

export function setAuthHeader() {
  const userInfo = JSON.parse(localStorage?.getItem("DMS_USERINFO"));
  const token = userInfo?.token || userInfo?.data?.token;

  if (!token) {
    console.warn("No authentication token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: token ? "Bearer " + token : "",
  };
}

// export async function AllDistributorTransactionList(payload) {
//   const response = await axios.get(
//     `${BACKEND_URL}/api/v1/db-transaction/paginated-distributor-transaction`,
//     {
//       params: payload,
//     }
//   );
//   return response;
// }

export async function AllDistributorTransactionList(payload) {
  const response = await axios.get(
    `${BACKEND_URL}/api/v2/db-transaction/paginated-distributor-transaction`,
    {
      params: payload,
    },
  );
  return response;
}

export async function countRetailerIdMissingTransactions(payload) {
  const response = await axios.get(
    `${BACKEND_URL}/api/v2/db-transaction/count-retaielrid`,
    {
      params: payload, // { distributorId: "6852960e46b03048aef32025" }
    },
  );
  return response;
}

export async function CountSalesSalesReturn() {
  const response = await axios.get(
    `${BACKEND_URL}/api/v2/db-transaction/count-retaielrid`,
  );
  return response;
}

export const bulkRetryDistributorTransactions = async (payload) => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/db-transaction/cron-all-retry-distributor-transaction`,
    {
      headers: setAuthHeader(),
      params: payload,
    },
  );
  return response;
};

export async function createDistributorTransaction(payload) {
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/db-transaction/create-distributor-transaction`,
    payload,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}

export const singleRetryDistributorTransactions = async (payload) => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/db-transaction/single-retry-distributor-transaction`,
    {
      headers: setAuthHeader(),
      params: payload,
    },
  );
  return response;
};

//Added the admin protected route DELETE /delete-distributor-transaction/:id

export const deleteDistributorTransaction = async (payload) => {
  const response = await axios.delete(
    `${BACKEND_URL}/api/v1/db-transaction/delete-distributor-transaction/${payload}`,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};
export const updateDistributorTransaction = async (id, payload = {}) => {
  const response = await axios.patch(
    `${BACKEND_URL}/api/v2/db-transaction/update-distributor-transaction/${id}`,
    payload,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};

export const editDistributorTransaction = async (id, payload = {}) => {
  const response = await axios.patch(
    `${BACKEND_URL}/api/v2/db-transaction/edit-distributor-transaction/${id}`,
    payload,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};



export const rebuildDistributorBalance = async (distributorId) => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/db-transaction/rebuild-distributor-balance/${distributorId}`,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
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


export const countRetailerIdMissingTransactionsV2 = async () => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v2/db-transaction/count-retaielrid`,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const bulkSyncRetailerOutletTransactions = async () => {
  const response = await axios.post(
    `${BACKEND_URL}/api/v2/db-transaction/bulk-sync-retailer-outlet-transactions`,
    {},
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};
