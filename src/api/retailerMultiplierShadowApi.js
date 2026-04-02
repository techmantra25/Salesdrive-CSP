import axios from "axios";
import { BACKEND_URL } from "../constants";

export const processShadowMultiplier = async (payload) => {
  return axios.post(
    `${BACKEND_URL}/api/v2/retailerMultiplier-shadow/process-shadow-multiplier`,
    payload,
  );
};

export const startShadowRun = async (payload) => {
  return axios.post(
    `${BACKEND_URL}/api/v2/retailerMultiplier-shadow/start-shadow-run`,
    payload,
  );
};

export const resumeShadowRun = async (runId) => {
  return axios.post(
    `${BACKEND_URL}/api/v2/retailerMultiplier-shadow/resume-shadow-run/${runId}`,
  );
};

export const getShadowRunStatus = async (runId) => {
  return axios.get(
    `${BACKEND_URL}/api/v2/retailerMultiplier-shadow/shadow-run-status/${runId}`,
  );
};
