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

export const GiftOrderList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/gift-order/list`,
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

///api/v1/gift-order/detail/:id

export const GiftOrderDetail = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/gift-order/detail/${payload}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const GiftOrderStatusUpdate = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/gift-order/status-update/${id}`,
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


///api/v1/gift-order/remove-product/:id

export const GiftOrderRemoveProduct = async (payload, id) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/gift-order/remove-product/${id}`,
      {
        headers: setAuthHeader(),
        data: payload,
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

//api/v1/gift-order/cancel/:orderId

export const GiftOrderCancel = async (orderId, reason) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/gift-order/cancel/${orderId}`,
      { reason },
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const GiftOrderCsvDownload = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/gift-order/download-csv`,
      {
        headers: setAuthHeader(),
        params: payload,
        responseType: "blob",
      }
    );
    return response;
  }
  catch (error) {
    throw new Error(error);
  }
};

// /api/v1/configure-gift-flow/get-flow

export const GiftFlowGet = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/configure-gift-flow/get-flow`,
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

export const GiftFlowToggleCancel = async (payload) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/configure-gift-flow/toggle-cancel`,
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

///api/v1/configure-gift-flow/toggle-cancel



export const GiftOrderFixMissingApprovals = async (orderId) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/gift-order/fix-missing-approvals/${orderId}`,
      {},
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};