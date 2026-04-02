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

export const getAllProductPaginated = async (queryParams) => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/product/product-paginated-list",
      {
        headers: setAuthHeader(),
        params: queryParams,
      }
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
