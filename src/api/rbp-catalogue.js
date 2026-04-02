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


///v1/rbp-catalogue/list

export const RBPCatalogueList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/rbp-catalogue/list`,
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

export const createRBPCatalogue = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/rbp-catalogue/create`,
      payload,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getRBPCatalogueDetail = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/rbp-catalogue/detail/${id}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateRBPCatalogue = async (id, payload) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/rbp-catalogue/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteRBPCatalogue = async (id) => {
  try {
    const response = await axios.delete(
      BACKEND_URL + `/api/v1/rbp-catalogue/delete/${id}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};
