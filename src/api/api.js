import axios from "axios";
import { BACKEND_URL } from "../constants";

export function setAuthHeader() {
  return {
    "Content-Type": "application/json",
  };
}

export const AllCategoryList = async () => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/category/list", {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const DashBoardStats = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/dashboard/count`, {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    // console.error("Error fetching store collection list:", error);
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const PricingList = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/price/list`, {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    // console.error("Error fetching store collection list:", error);
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const AllZoneList = async () => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/zone/list", {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addZone = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/zone/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateZone = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/zone/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const AllRegionList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/Region/list",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addRegion = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/Region/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateRegion = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/Region/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const AllStateList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/State/list",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addState = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/State/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateState = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/State/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addCategory = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/category/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateCategory = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/category/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const AllBrandList = async () => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/brand/list", {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addBrand = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/brand/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateBrand = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/brand/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

// Sub Brand api

export const AllSubBrandList = async () => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/sub-brand/sub-brand-list",
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get List, try again",
    );
  }
};

export const getDistributorSubBrandList = async (distributorId) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/sub-brand/distributor-subbrand/${distributorId}`
    );

    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get distributor subbrand list"
    );
  }
};

export const addSubBrand = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/sub-brand/sub-brand-create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add sub brand, try again",
    );
  }
};

export const updateSubBrand = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/sub-brand/sub-brand-update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update sub brand, try again",
    );
  }
};

export const AllCollectionList = async () => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/collection/list", {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addCollection = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/collection/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateCollection = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/collection/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const AllProductList = async () => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/product/list", {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addProduct = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/product/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const bulkUploadProduct = async (payload) => {

  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/product/bulk-upload-product",
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
        "Failed to bulk upload products"
    );
  }
};

export const updateProduct = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/product/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const getAllProductPaginated = async (queryParams) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/product/product-paginated-list`,
      {
        headers: setAuthHeader(),
        params: queryParams,
      },
    );
    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};

export const AllPricingList = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/price/all-list`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addPricing = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/price/add",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updatePricing = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/price/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const AllDistributorList = async () => {
  try {
    const response = await axios.get(BACKEND_URL + `/api/v1/distributor/list`, {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addDistributor = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/distributor/add",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateDistributor = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/distributor/update`,
      { _id: id, ...payload },
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const bulkUpload = async (payload, type) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/bulk/save/${type}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const bulkUpload2 = async (payload, type) => {
  const response = await axios.post(
    BACKEND_URL + `/api/v1/bulk/save_v2/${type}`,
    payload,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const BrandbulkUpload = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/brand/brand-bulk`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

//sub-brand/bulk-sub-brand-create

export const SubBrandbulkUpload = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/sub-brand/bulk-sub-brand-create`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

// temporary function will be removed after successful product ean code upload

export const bulkUpdateEan = async (rows) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/product/bulk-update-ean`,
      { rows },
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "failed to update EAN codes, try again",
    );
  }
};

export const priceLog = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/changelog/list/Price/${id}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const getDistributorPassword = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/password/data/${id}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const sendCredentialMail = async (id) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/distributor/send-credential/${id}`,
      {},
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const getEmployeePassword = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/employee/get-employee-password/${id}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const sendEmployeeCredentialMail = async (id) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/employee/send-credential-email/${id}`,
      {},
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const pricingStatusBulkUpdate = async () => {
  try {
    const response = await axios.put(
      BACKEND_URL + `/api/v1/price/bulk-update-status`,
      {},
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

// Sales Hierarchy

export const AllDesignationList = async () => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/designation/list", {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addDesignation = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/designation/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateDesignation = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/designation/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const AllEmployeeList = async () => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/employee/list");
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addEmployee = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/employee/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateEmployee = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/employee/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const getBeats = async () => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/beat/list");
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addBeat = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/beat/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateBeat = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/beat/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update beat, try again",
    );
  }
};

export const getBeatDetails = async (id) => {
  try {
    const response = await axios.get(BACKEND_URL + `/api/v1/beat/detail/${id}`);
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const bulkUploadBeats = async (payload) => {
  try {
    // const response = await axios.post(`/api/beat/bulk-upload`, payload, {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // });
    // return response;
    console.log(payload);
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add beats, try again",
    );
  }
};

export const getFieldUser = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/fieldUser/list",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const addUserBeat = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/fieldUser/create",
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add user beat, try again",
    );
  }
};

export const getBeatsByEmployee = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/fieldUser/list-by-emp/${id}`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const updateFieldUser = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/fieldUser/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const getDistributorsBeats = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/beat/list-by-distributor/${id}`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const getRegionBeats = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/beat/list-by-region/${id}`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const EmployeeBeatMapping = async (id, payload) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/employee/map-beat-id-to-employee-id/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export const EmployerListByBeat = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/employee/list-by-beat/${id}`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

export async function getOutletDetails(id) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/outlet/detail/${id}`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function getEmployeeList(payload) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/employee/all-list-paginated?limit=${payload?.limit}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function createOutlet(payload) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/outlet/create`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function outletUpdate(payload, id) {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/outlet/update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function outletStatusUpdate(payload, id) {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/outlet/status-update/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function getEmployeeByDesignation(desgId) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/employee/employee-by-designation?desgId=${desgId}`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function BulkOutletApproval(payload) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/outlet/bulk-approve-reject-outlet`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function getApprovedOutletList() {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/outletApproved/list`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function ApprovedOutletDetails(id) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/outletApproved/detail/${id}`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function ApprovedOutletPaginated(payload) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/outletApproved/paginated-list`,
      {
        params: payload,
      },
    );

    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to retrieve data, try again",
    );
  }
}
//paginated outlets search function
export const SearchOutletsDropdown = (query) => {
  return axios.get(`${BACKEND_URL}/api/v1/outletApproved/search-dropdown`, {
    params: query,
  });
};

export async function outletApprovedUpdate(payload, id) {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/outletApproved/outlet-edit/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}


export async function getOutletDistributors(id) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/outletApproved/outlet-distributors/${id}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch distributors"
    );
  }
}


export async function TransferOutlets(payload) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/outletApproved/transfer-copy`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
}

export async function BulkUploadOutletMaster(payload) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/outletApproved/bulk-add`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add Outlet, try again",
    );
  }
}

export async function beatListPaginated(payload) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/beat/beat-list-paginated`,
      {
        params: payload,
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to retrieve data, try again",
    );
  }
}

//  Reasons api

export async function getReasonsList() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/v1/reason/list`);
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to retrieve data, try again",
    );
  }
}

export async function addReason(payload) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/reason/create`,
      payload,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to retrieve data, try again",
    );
  }
}

export async function updateReason(payload, id) {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/reason/status-update/${id}`,
      payload,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to retrieve data, try again",
    );
  }
}

export async function deleteReason(id) {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/reason/delete/${id}`,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to retrieve data, try again",
    );
  }
}

// Suppliers api

export async function getSuppliersList(payload) {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/supplier/paginated-list-supplier`,
      {
        params: payload,
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to retrieve data, try again",
    );
  }
}

export async function createSupplier(payload) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/supplier/create-supplier`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add Supplier, try again",
    );
  }
}

export const editSupplier = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/supplier/update-supplier/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update Supplier, try again",
    );
  }
};

export async function BulkUploadSupplierMaster(payload) {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/supplier/bulk-upload-supplier`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add Supplier, try again",
    );
  }
}

// purchase order Api

export const getPurchaseOrderList = async (payload) => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/purchase-order/paginated-purchase-order-list`,
    {
      headers: setAuthHeader(),
      params: payload,
    },
  );
  return response;
};

export const getPurchaseOrderDetails = async (id) => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/purchase-order/detail-purchase-order/${id}`,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const updatePurchaseOrder = async (id, payload) => {
  const response = await axios.patch(
    `${BACKEND_URL}/api/v1/purchase-order/update-purchase-order/${id}`,
    payload,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const getProductByProductCode = async (code) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/product/dis-product-by-code/${code}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const getPurchasProductList = async (payload) => {
  const response = await axios.get(
    BACKEND_URL +
      `/api/v1/product/dis_prod_price_paginated_list_for_central-portal`,
    {
      headers: setAuthHeader(),
      params: payload,
    },
  );
  return response;
};

export const getPurchaseOrderListForEmp = async (payload) => {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/purchase-order/paginated-purchase-order-list-for-emp`,
    {
      headers: setAuthHeader(),
      params: payload,
    },
  );
  return response;
};

export const updatePurchaseOrderStatusByEmp = async (id, payload) => {
  const response = await axios.patch(
    `${BACKEND_URL}/api/v1/purchase-order/status-update-by-emp-or-admin/${id}`,
    payload,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
};

export const updatePurchaseOrderByEmp = async (id, payload) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/purchase-order/update-purchase-order-by-emp-or-admin/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update purchase order",
    );
  }
};

export const getEmployeeDetailsById = async (id) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/employee/detail/${id}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

//{{base_url}}/v1/product/dis-product-by-code-and-distributor/COV01-90/66b1e270e2d6cbfc3cbddb58

export const getProductByProductCodeOutside = async (
  productCode,
  distributorId,
) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/product/dis-product-by-code-and-distributor/${productCode}/${distributorId}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add price, try again",
    );
  }
};

// district api

export const AllDistrictList = async () => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/district/district-list",
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get District, try again",
    );
  }
};

export const addDistrict = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/district/district-create",
      payload,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add district, try again",
    );
  }
};

export const updateDistrict = async (payload, id) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/district/district-update/${id}`,
      payload,
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update District, try again",
    );
  }
};

export const AllPlantList = async (query) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/plant/paginated-list-plant`,
      {
        params: query,
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Plant, try again",
    );
  }
};

export const addPlant = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/plant/create-plant`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to add Plant, try again",
    );
  }
};

//{{base_url}}/v1/plant/update-plant/pid

export const updatePlant = async (payload, id) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/plant/update-plant/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update Plant, try again",
    );
  }
};

export async function getPriceCSV(query) {
  const response = await axios.get(
    `${BACKEND_URL}/api/v1/price-csv/paginated-list`,
    {
      params: query,
      headers: setAuthHeader(),
    },
  );
  return response;
}

export async function PriceCSVStatusUpdate(body) {
  const response = await axios.post(
    `${BACKEND_URL}/api/v1/price-csv/handle-status-update`,
    body,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}

export async function createHelpDesk(payload) {
  const response = await axios.post(
    BACKEND_URL + "/api/v1/help-desk/create-help-desk",
    payload,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}

export async function getAllHelpDeskList() {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/help-desk/help-desk-list",
  );
  return response;
}

export async function getHelpDeskById(id) {
  const response = await axios.get(
    BACKEND_URL + `/api/v1/help-desk/help-desk-detail/${id}`,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}

export async function updateHelpDeskById(id, payload) {
  const response = await axios.patch(
    BACKEND_URL + `/api/v1/help-desk/update-help-desk/${id}`,
    payload,
  );
  return response;
}

export async function deleteHelpDeskById(id) {
  const response = await axios.delete(
    BACKEND_URL + `/api/v1/help-desk/delete-help-desk/${id}`,
  );
  return response;
}

export async function createPrimarySlab(payload) {
  const response = await axios.post(
    BACKEND_URL + "/api/v1/primary-target/create-primary-slab",
    payload,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}

export async function updatePrimarySlab(id, payload) {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/primary-target/edit-delete-primary-slabs/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update primary slab",
    );
  }
}

export async function deletePrimarySlab(id) {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/primary-target/edit-delete-primary-slabs/${id}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to delete primary slab",
    );
  }
}

export async function createSlab(payload) {
  const response = await axios.post(
    BACKEND_URL + "/api/v1/secondary-target/create-slab",
    payload,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}

export async function editSlab(payload, id) {
  const response = await axios.patch(
    BACKEND_URL + `/api/v1/secondary-target/edit-slab/${id}`,
    payload,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}

export async function deleteSlab(id) {
  const response = await axios.delete(
    BACKEND_URL + `/api/v1/secondary-target/delete-slab/${id}`,
    {
      headers: setAuthHeader(),
    },
  );
  return response;
}

export async function getAllSecondarySlab(params) {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/secondary-target/paginated-slab-list",
    {
      params: params, // This passes query parameters to the backend
    },
  );
  return response;
}

export async function getAllPrimarySlab(query = {}) {
  const response = await axios.get(
    BACKEND_URL + "/api/v1/primary-target/active-primary-slabs",
    {
      params: query, 
    }
  );
  return response;
}

export const secondaryTargetPaginatedList = async (params) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/secondary-target/paginated-list`,
      {
        params,
        headers: setAuthHeader(), // keep this if route is protected
      },
    );
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const OutletListMinimalByDistributor = async (did) => {
  try {
    const response = await axios.get(
      BACKEND_URL +
        `/api/v1/outletApproved/outlet-by-distributor/minimal/${did}`,
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const SearchOutletsByDistributor = async (did, searchTerm) => {
  try {
    const response = await axios.get(
      BACKEND_URL +
        `/api/v1/outletApproved/outlet-by-distributor/search/${did}?search=${searchTerm}&limit=50`,
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const GetOutletDetailById = async (id) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/outletApproved/outlet-by-distributor/detail/${id}`,
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const secondaryTargetReportDownload = async (params) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/secondary-target/secondary-target-report`,
      {
        params,
        headers: setAuthHeader(),
        responseType: "blob",
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to download secondary target report",
    );
  }
};
export const getDistributorUsageReport = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/db-transaction/distributor-usage-report`,
      payload,
      {
        headers: setAuthHeader(),
        responseType: "blob",
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to download usage report",
    );
  }
};


 export const handleCreatePage = async (pageData, token) => {
  try {
    const res = await axios.post(
      BACKEND_URL + "/api/v1/users/create-page",
      pageData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data; // ✅ IMPORTANT
  } catch (error) {
    throw error; // ✅ let component handle error
  }
};

export const getUserPermission = async (userId) => {
  console.log("User ID in API:", userId);

  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/users/get-permissions/${userId}`,
      {
        headers: setAuthHeader(),
      },
    );
    console.log("Permission API Data:", response.data);
    return response.data;
  } catch (error) {
    console.log("Permission API Error:", error);
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch user permissions",
    );
  }
};
// // retailer transaction edit


export const editRetailerOutletTransaction = async (id, payload) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/outlet-retailer-transaction/edit-transaction/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to edit transaction, try again",
    );
  }
};

// retailer transaction delete

export const deleteRetailerOutletTransaction = async (id) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/outlet-retailer-transaction/delete-transaction/${id}`,
      {
        headers: setAuthHeader(),
      },
    );

    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to delete transaction",
    );
  }
};

export const bulkUploadSecondaryTargetsWithDbCode = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/secondary-target/bulk-upload-with-db-code`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to bulk upload secondary targets",
    );
  }
};

export const createSecondaryTarget = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/secondary-target/create`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    console.log("Permission API Data:", response.data);
    return response.data;
  } catch (error) {
    console.log("Permission API Error:", error);
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch user permissions",
    );
  }
};

export const deleteSecondaryTarget = async (id) => {
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/secondary-target/delete-secondary-target/${id}`,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to delete secondary target");
  }
};

export const editTarget = async (payload, id) => {
  try {
    const response = await axios.patch(
      `${BACKEND_URL}/api/v1/secondary-target/edit/${id}`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};



export const getSecondaryTargetDropdown = async (payload) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/secondary-target/secondary-target-dropdown`,
      payload,
      {
        headers: setAuthHeader(),
      }
    );
    console.log("Permission API Data:", response.data);
    return response.data;

  } catch (error) {
    console.log("Permission API Error:", error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch user permissions"
    );

  };
}

export const downloadProductList = async (queryParams = {}) => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/product/product-download`,
      {
        headers: setAuthHeader(),
        params: queryParams,
        responseType: 'blob',
      },
    );
    return response;
  } catch (error) {
    throw new Error(error.message || "Failed to download product list");
  }
};

// /api/v1/distributor-rlp/bulk-update

export const bulkUpdateRlp = async (payload) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/distributor-rlp/bulk-update`,
      payload,
      {
        headers: setAuthHeader(),
      },
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        "Failed to add price, try again",
    );
  }
};

