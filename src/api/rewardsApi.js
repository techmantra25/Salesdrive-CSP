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

export const getTermsAndConditions = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/retailer-tnc/get-retailer-tnc`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get Terms&Conditions, try again"
    );
  }
};

export const updateTermsAndConditions = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/retailer-tnc/upsert-retailer-tnc`,
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
        "Failed to Create/update Terms&Conditions, try again"
    );
  }
};

export const getGiftProductListPaginated = async (payload) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/gift-product/paginated-gift-product-list`,
      {
        headers: setAuthHeader(),
        params: payload,
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get Gift Product List, try again"
    );
  }
};

export const createGiftProduct = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/gift-product/create-gift-product`,
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
        "Failed to Create Gift Product, try again"
    );
  }
};

export const getGiftProductDetail = async (payload) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/gift-product/detail-gift-product/${payload}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get Gift Product Detail, try again"
    );
  }
};

export const updateGiftProductDetail = async (id, payload) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/gift-product/update-gift-product/${id}`,
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
        "Failed to update Gift Product Detail, try again"
    );
  }
};

export const addCatalogue = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/catalogue/create-catalogue`,
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
        "Failed to Create Gift Product, try again"
    );
  }
};

export const updateCatalogue = async (id, payload) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/catalogue/update-catalogue/${id}`,
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
        "Failed to update Catalogue, try again"
    );
  }
};

export const getAllCatalogues = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/catalogue/catalogue-list`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get Catalogues, try again"
    );
  }
};

export const catalogueDetail = async (id) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/catalogue/detail-catalogue/${id}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get Catalogue detail, try again"
    );
  }
};

export const appBannerList = async (payload) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/banner/banner-list`,
      {
        headers: setAuthHeader(),
        params: payload,
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get App Banner, try again"
    );
  }
};

export const createAppBanner = async (data) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/banner/banner-create`,
      data,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to create App Banner, try again"
    );
  }
};

export const updateAppBanner = async (id, data) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/banner/banner-update/${id}`,
      data,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update App Banner, try again"
    );
  }
};

export const fileUpload = async (data) => {
  try {
    const response = await axios.post("/api/fileUpload", data, {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to upload file, try again"
    );
  }
};

// export async function retailerMultiplierTransactionList(payload) {
//   const response = await axios.get(
//     `${BACKEND_URL}/api/v1/retailer-transaction/paginated-retailer-transaction`,
//     {
//       params: payload,
//     }
//   );
//   return response;
// }

export async function retailerMultiplierTransactionList(payload) {
  const response = await axios.get(
    `${BACKEND_URL}/api/v2/retailer-transaction/paginated-retailer-transaction`,
    {
      headers: setAuthHeader(),
      params: payload,
    }
  );
  return response;
}

export async function retryRetailerTransaction(payload) {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/retailer-transaction/retry-retailer-transaction`,
    {
      headers: setAuthHeader(),
      params: payload,
    }
  );
  return response;
}

export async function getSlab() {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/reward-slab/get-reward-slabs`,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
}

export async function updateSlab(payload) {
  const response = await axios.patch(
    `${BACKEND_URL}/api/v1/reward-slab/update-reward-slabs`,
    payload,
    {
      headers: setAuthHeader(),
    }
  );
  return response;
}

export const getGiftProductBulkUpload = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/gift-product/bulk-add-gift-product`,
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
        "Failed to upload gift products, try again"
    );
  }
};
//retailer-transaction/delete-retailer-multiplier-transaction/:id

export async function deleteRetailerMultiplierTransaction(payload) {
  const response = await axios.delete(
    `${BACKEND_URL}/api/v1/retailerMultiplier/delete-retailer-multiplier-transaction/${payload}`,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}
