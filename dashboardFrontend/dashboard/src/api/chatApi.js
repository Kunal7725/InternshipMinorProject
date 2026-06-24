import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

// Direct messages
export const fetchChatUsers    = async () => {
  const res = await fetch(`${BASE_URL}/chat/users`, { headers: getAuthHeaders() });
  return handleResponse(res);
};
export const fetchMessages     = async (userId) => {
  const res = await fetch(`${BASE_URL}/chat/messages/${userId}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};
export const markMessagesRead  = async (userId) => {
  const res = await fetch(`${BASE_URL}/chat/messages/${userId}/read`, { method: "PUT", headers: getAuthHeaders() });
  return handleResponse(res);
};

// Groups
export const fetchGroups = async () => {
  const res = await fetch(`${BASE_URL}/chat/groups`, { headers: getAuthHeaders() });
  return handleResponse(res);
};
export const createGroup = async (body) => {
  const res = await fetch(`${BASE_URL}/chat/groups`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};
export const fetchGroupMessages = async (groupId) => {
  const res = await fetch(`${BASE_URL}/chat/groups/${groupId}/messages`, { headers: getAuthHeaders() });
  return handleResponse(res);
};
export const updateGroup = async (groupId, body) => {
  const res = await fetch(`${BASE_URL}/chat/groups/${groupId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};
export const deleteGroup = async (groupId) => {
  const res = await fetch(`${BASE_URL}/chat/groups/${groupId}`, { method: "DELETE", headers: getAuthHeaders() });
  return handleResponse(res);
};
export const markGroupRead = async (groupId) => {
  const res = await fetch(`${BASE_URL}/chat/groups/${groupId}/read`, { method: "PUT", headers: getAuthHeaders() });
  return handleResponse(res);
};
