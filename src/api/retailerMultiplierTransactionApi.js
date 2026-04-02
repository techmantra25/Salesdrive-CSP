import axios from "axios";
import { BACKEND_URL } from "../constants";

const ROOT = BACKEND_URL + "/api/v2/retailerMultiplier-shadow";

const COMPARE_URL = ROOT + "/compare-retailer-multiplier-transactions";
const FIX_URL = ROOT + "/fix-shadow-main-multiplier";
const PROCESS_URL = ROOT + "/process-shadow-multiplier";
const START_RUN_URL = ROOT + "/start-shadow-run";
const RESUME_RUN_URL = (runId) => `${ROOT}/resume-shadow-run/${runId}`;
const RUN_STATUS_URL = (runId) => `${ROOT}/shadow-run-status/${runId}`;

export const compareRetailerMultiplierTransactions = async (params = {}) => {
  try {
    const response = await axios.get(COMPARE_URL, { params });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to compare transactions",
    );
  }
};

export const downloadCompareRetailerMultiplierCSV = async (params = {}) => {
  try {
    const response = await axios.get(COMPARE_URL, {
      params: { ...params, download: "csv" },
      responseType: "blob",
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to download CSV report",
    );
  }
};

export const downloadCompareRetailerMultiplierXLSX = async (params = {}) => {
  try {
    const response = await axios.get(COMPARE_URL, {
      params: { ...params, download: "xlsx" },
      responseType: "arraybuffer",
    });
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to download Excel audit report",
    );
  }
};

export const processShadowMultiplier = async (payload = {}) => {
  try {
    const response = await axios.post(PROCESS_URL, payload);
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to process shadow multiplier",
    );
  }
};

export const startShadowMultiplierRun = async (payload = {}) => {
  try {
    const response = await axios.post(START_RUN_URL, payload);
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to start shadow multiplier run",
    );
  }
};

export const resumeShadowMultiplierRun = async (runId, payload = {}) => {
  try {
    const response = await axios.post(RESUME_RUN_URL(runId), payload);
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to resume shadow multiplier run",
    );
  }
};

export const getShadowMultiplierRunStatus = async (runId) => {
  try {
    const response = await axios.get(RUN_STATUS_URL(runId));
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to get shadow run status",
    );
  }
};

export const fixShadowVsMainMultiplier = async (params = {}) => {
  try {
    const response = await axios.post(FIX_URL, params);
    return response;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fix shadow vs main multipliers",
    );
  }
};
