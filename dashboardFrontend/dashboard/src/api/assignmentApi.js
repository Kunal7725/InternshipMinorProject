import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

const multipartHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchAssignments = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/assignments?${q}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const fetchAssignmentById = async (id) => {
  const res = await fetch(`${BASE_URL}/assignments/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createAssignment = async (formData) => {
  const res = await fetch(`${BASE_URL}/assignments`, {
    method: "POST",
    headers: multipartHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const updateAssignment = async (id, formData) => {
  const res = await fetch(`${BASE_URL}/assignments/${id}`, {
    method: "PUT",
    headers: multipartHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const deleteAssignment = async (id) => {
  const res = await fetch(`${BASE_URL}/assignments/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
