import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const fetchDashboardStats = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const fetchProjectStats = async () => {
  const res = await fetch(`${BASE_URL}/projects/stats`, { headers: getAuthHeaders() });
  return handleResponse(res);
};
