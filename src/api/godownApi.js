import axios from "axios";
import { BACKEND_URL } from "../constants";

export function setAuthHeader() {
  return {
    "Content-Type": "application/json",
  };
}

// Add Godown
export const addGodown = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/inventory/add-godown",
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
        "Failed to add godown, try again",
    );
  }
};
 
// View Godown List (paginated, with optional godownName search)
export const viewGodownList = async (queryParams) => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/inventory/view-godown",
      {
        headers: setAuthHeader(),
        params: queryParams, // e.g. { page, limit, godownName }
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch godown list, try again",
    );
  }
};

// Get Single Godown Detail
// export const getGodownDetail = async (godownId) => {
//   try {
//     const response = await axios.get(
//       BACKEND_URL + `/api/v1/inventory/godown-detail/${godownId}`,
//       {
//         headers: setAuthHeader(),
//       }
//     );
//     return response;
//   } catch (error) {
//     return (
//       error.response?.data || {
//         error: true,
//         message: "Error fetching Godown detail",
//       }
//     );
//   }
// };

// Update Godown
// export const updateGodown = async (godownId, data) => {
//   try {
//     const response = await axios.put(
//       BACKEND_URL + `/api/v1/inventory/update-godown/${godownId}`,
//       data,
//       {
//         headers: setAuthHeader(),
//       }
//     );
//     return response;
//   } catch (error) {
//     return (
//       error.response?.data || {
//         error: true,
//         message: "Error updating godown",
//       }
//     );
//   }
// };

// Delete Godown
// export const deleteGodown = async (godownId) => {
//   try {
//     const response = await axios.delete(
//       BACKEND_URL + `/api/v1/inventory/delete-godown/${godownId}`,
//       {
//         headers: setAuthHeader(),
//       }
//     );
//     return response;
//   } catch (error) {
//     return (
//       error.response?.data || {
//         error: true,
//         message: "Error deleting godown",
//       }
//     );
//   }
// };

// Toggle Godown Active/Inactive Status
// export const toggleGodownStatus = async (godownId) => {
//   try {
//     const response = await axios.patch(
//       BACKEND_URL + `/api/v1/inventory/toggle-godown-status/${godownId}`,
//       {},
//       {
//         headers: setAuthHeader(),
//       }
//     );
//     return response;
//   } catch (error) {
//     return (
//       error.response?.data || {
//         error: true,
//         message: "Error updating godown status",
//       }
//     );
//   }
// };

// Get All Godowns for a Distributor (e.g. for dropdowns)
// export const getGodownsByDistributor = async (distributorId) => {
//   try {
//     const response = await axios.get(
//       BACKEND_URL + `/api/v1/inventory/godowns-by-distributor/${distributorId}`,
//       {
//         headers: setAuthHeader(),
//       }
//     );
//     return response;
//   } catch (error) {
//     return (
//       error.response?.data || {
//         error: true,
//         message: "Error fetching distributor godowns",
//       }
//     );
//   }
// };