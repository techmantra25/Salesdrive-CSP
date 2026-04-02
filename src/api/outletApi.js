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

export const ApprovedRejectOutlet = async (data) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/outlet/outlet-approve-reject",
      data,
      {
        headers: setAuthHeader(),
      },
    );
    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        error: true,
        message: "Error fetching products",
      }
    );
  }
};

export const getOutletSynced = async (queryParams) => {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/external/fetch-outlets",
    {
      params: queryParams,
    },
  );
  return response;
};

export const getCustomOutletSynced = async (queryParams) => {
  const response = await axios.get(
    BACKEND_URL + "/api/v1//outletApproved/fetch-outlets-by-date",
    {
      params: queryParams,
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const fetchOutletsCurrentPointBalance = async () => {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/external/fetch-all-outlets-current-balance",
  );
  return response;
};

//{{base_url}}/v1/outletApproved/count-mobile1

export const getDuplicateOutlet = async () => {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/outletApproved/count-mobile1",
  );
  return response;
};

//http://localhost:10000/api/v1/outletApproved/merge-outlets-by-mobile

export const mergeOutletsByMobile = async (data) => {
  const response = await axios.post(
    BACKEND_URL + "/api/v1/outletApproved/merge-outlets-by-mobile",
    data,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const addManualPointsToOutlet = async (outletId, data) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/outletApproved/addManualPoints/${outletId}`,
      data,
      {
        headers: setAuthHeader(),
      },
    );

    return response;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Failed to add manual points",
      }
    );
  }
};

export const mergeOutletPoints = async (data) => {
  const response = await axios.get(
    BACKEND_URL + `/api/v1/outletApproved/merge-outlet-points/${data}`,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const updateOutletStatus = async (outletId, status) => {
  try {
    console.log("Updating outlet status:", outletId, status);

    const response = await axios.get(
      `${BACKEND_URL}/api/v1/outletApproved/active-inactive`,
      {
        params: {
          outletId,
          status,
        },
        headers: setAuthHeader(),
      },
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Failed to update outlet status",
      }
    );
  }
};

// // Bulk Outlet Modification
// export const bulkOutletModification = async (data) => {
//   try {
//     const response = await axios.get(
//       `${BACKEND_URL}/api/v1/outletApproved/bulk-modify-outlets`,
//       {
//         params: {
//           data: JSON.stringify(data),
//         },
//         headers: setAuthHeader(),
//       }
//     );

//     return response.data;
//   } catch (error) {
//     return (
//       error.response?.data || {
//         success: false,
//         message: "Bulk modification failed",
//       }
//     );
//   }
// };

// Bulk Outlet Modification (BODY based)
export const bulkOutletModification = async (rows) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/outletApproved/bulk-modify-outlets`,
      {
        rows,
      },
      {
        headers: setAuthHeader(),
      },
    );

    return response.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        message: "Bulk modification failed",
      }
    );
  }
};

//api/v1/outletApproved/clean-current-balance

export const cleanCurrentBalance = async () => {
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/outletApproved/clean-current-balance`,
    {},
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};


//http://localhost:10000/api/v1/outlet-retailer-transaction/rebuild-balance/

export const rebuildBalance = async (id) => {
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/outlet-retailer-transaction/rebuild-balance/${id}`,
    {},
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

///api/v1/external/sync-outlet-code-updates

export const syncOutletCodeUpdates = async () => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/external/sync-outlet-code-updates`,
    {},
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};