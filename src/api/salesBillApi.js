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

export const AllBillListReport = async (payload) => {
  const response = await axios.get(
    
    BACKEND_URL + `/api/v1/bill/paginated_bill_report`,
    {
      headers: setAuthHeader(),
      params: payload,
    }
  );
  return response;
};
