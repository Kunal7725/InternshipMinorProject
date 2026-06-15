import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const fetchDashboardStats = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() });
  return handleResponse(res);
};
