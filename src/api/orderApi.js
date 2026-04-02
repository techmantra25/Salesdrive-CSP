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

export const OrderEntryPaginatedReportList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/order-entry/paginated-report-for-csp`,
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
export const paginatedOrderToBillReport = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/bill/paginated-order-to-bill-report`,
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
export const AllDBpaginatedOrderList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/order-entry/all-distributors-order-list`,
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
