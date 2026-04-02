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

export const getSalesOrderData = async (queryParams) => {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/external/fetch-sap-secondary-order-entry-data",
    {
      params: queryParams,
    }
  );
  return response;
};

export const getProductsSync = async (queryParams) => {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/external/sync-product-master",
    {
      params: queryParams,
    }
  );
  return response;
};
