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

export async function getAllTransactionListReport(payload) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/transaction/all-list-report`,
      {
        headers: setAuthHeader(),
        params: payload,
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
}
