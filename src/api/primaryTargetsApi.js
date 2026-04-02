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

export const getPrimaryTargetsList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/primary-target/primary-target-list-paginated`,
      {
        headers: setAuthHeader(),
        params: payload,
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};
export const downloadPrimaryTargetsCSV = async (params) => {
  const response = await axios.get(
    BACKEND_URL + `/api/v1/primary-target/primary-target-list-paginated`,
    {
      params: {
        ...params,
        download: "csv",
      },
      responseType: "blob", 
      headers: setAuthHeader(),
    }
  );

  return response;
};


export async function createPrimaryTarget(payload) {
  const response = await axios.post(
    BACKEND_URL + "/api/v1/primary-target/create",
    payload,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
}
export async function createBulkPrimaryTargets(payload) {
  const response = await axios.post(
    BACKEND_URL + "/api/v1/primary-target/create-bulk",
    payload,
    {
      headers: setAuthHeader(), 
    }
  );
  return response;
}



export const editPrimaryTarget = (id, payload) => {
  return axios.patch(
    `${BACKEND_URL}/api/v1/primary-target/edit--delete-primary-target/${id}`,
    payload,
    { headers: setAuthHeader() }
  );
};

export const deletePrimaryTarget = (id) => {
  return axios.delete(
    `${BACKEND_URL}/api/v1/primary-target/edit--delete-primary-target/${id}`,
    { headers: setAuthHeader() }
  );
};

export async function updatePrimaryTargetStatus(id, payload) {
  const response = await axios.patch(
    BACKEND_URL + `/api/v1/primary-target/update-status/${id}`,
    payload,
    { headers: setAuthHeader() }
  );
  return response;
}
