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

export const getPurchaseOrderEntryLog = async (queryParams) => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/external/fetch-sap-grn-data-import-log-paginated",
      {
        params: queryParams,
      }
    );
    return response;
  } catch (error) {
    return (
      error.response?.data || {
        error: true,
        message: "Error fetching Sales Order Log",
      }
    );
  }
};

export const invoiceReportPaginated = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/invoice/paginated-invoice-report`,
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

export const fetchQuotationStatus = async (payload) => {
  const response = await axios.post(
    BACKEND_URL + "/api/v1/external/fetch-quotation-status",
    payload
  );
  return response;
};
export const POReport = async (payload) => {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/purchase-order/po-report",
    {
      params: payload,
    }
  );
  return response;
};

export const syncGRNDate = async () => {
  const response = await axios.get(
    BACKEND_URL + `/api/v1/invoice/sync-grn-original-date`,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};

//api/v1/purchase-return/paginated-purchase-return-list?

export const getPurchaseReturnList = async (payload) => {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/purchase-return/paginated-purchase-return-list",
    {
      params: payload,
    }
  );
  return response;
};

//update-purchase-return/:prId

export const updatePurchaseReturn = async (returnId, data) => {
  const response = await axios.patch(
    BACKEND_URL + `/api/v1/purchase-return/update-purchase-return/${returnId}`,
    data,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};

//http://localhost:10000/api/v1/invoice/find-and-remove-invoice

export const findAndRemoveInvoice = async (payload) => {
  const response = await axios.post(
    BACKEND_URL + "/api/v1/invoice/find-and-remove-invoice",
    payload,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
};

//paginated-deleted-invoice-list

export const getDeletedInvoiceList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/invoice/paginated-deleted-invoice-list",
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

///api/v1/external/delete-grn-log/:id 

export const deleteGRNLog = async (id) => {
  try {
    const response = await axios.delete(
      BACKEND_URL + `/api/v1/external/delete-grn-log/${id}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

///v1/external/fetch-sap-grn-data

export const fetchSAPGRNData = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/external/fetch-sap-grn-data",
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
