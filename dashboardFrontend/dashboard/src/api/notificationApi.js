import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const fetchNotifications = async () => {
  const res = await fetch(`${BASE_URL}/notifications`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const markAllNotificationsRead = async () => {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const markNotificationRead = async (id) => {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
