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

// Called by a logged-in Admin to create a new user under themselves
export const createUser = async (payload) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: getAuthHeaders(), // sends Bearer token so backend sets createdBy = admin._id
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};
