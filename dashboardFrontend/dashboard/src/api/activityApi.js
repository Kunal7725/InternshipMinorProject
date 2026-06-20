import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const fetchActivityLogs = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/activity?${q}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};
