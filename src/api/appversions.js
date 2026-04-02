import axios from "axios";
import { BACKEND_URL } from "../constants";
import { setAuthHeader } from "./api";

export const createAppVersion = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + `/api/v1/app-version/create`,
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
        "Failed to create app version, try again"
    );
  }
};

export const getAppVersionDetail = async (appVersionId) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/app-version/detail/${appVersionId}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get app version detail, try again"
    );
  }
};

export const updateAppVersion = async (appVersionId, payload) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/app-version/update/${appVersionId}`,
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
        "Failed to update app version, try again"
    );
  }
};

export const listAppVersions = async (payload) => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/app-version/list`,
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
        "Failed to list app versions, try again"
    );
  }
};

export const getLatestAppVersion = async () => {
  try {
    const response = await axios.get(
      BACKEND_URL + `/api/v1/app-version/latest`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get latest app version, try again"
    );
  }
};
