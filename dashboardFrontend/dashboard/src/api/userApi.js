import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

export const fetchAllUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const fetchUserById = async (id) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const updateUserById = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteUserById = async (id) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
