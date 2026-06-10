import axios from "axios";
import { BACKEND_URL } from "../constants";

const setAuthHeader = () => {
  return {
    "Content-Type": "application/json",
  };
};

// POST /sub-division/sub-division-create
export const createSubDivision = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/sub-division/sub-division-create`,
      payload,
      {
        headers: setAuthHeader(),
      }
    );

    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to create sub-division"
    );
  }
};

// GET /sub-division/sub-division-list
// Optional: pass query params via `params` (page, limit, search, etc.)
export const getSubDivisionList = async (params = undefined) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/sub-division/sub-division-list`,
      {
        headers: setAuthHeader(),
        params,
      }
    );

    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get sub-division list"
    );
  }
};

// GET /sub-division/sub-division-detail/:sid
export const getSubDivisionDetail = async (sid) => {
  if (!sid) throw new Error("sub-division sid is required");

  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/sub-division/sub-division-detail/${sid}`,
      {
        headers: setAuthHeader(),
      }
    );

    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get sub-division detail"
    );
  }
};

// PATCH /sub-division/sub-division-update/:sid
export const updateSubDivision = async (payload, sid) => {
  if (!sid) throw new Error("sub-division sid is required");

  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/sub-division/sub-division-update/${sid}`,
      payload,
      {
        headers: setAuthHeader(),
      }
    );

    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update sub-division"
    );
  }
};

