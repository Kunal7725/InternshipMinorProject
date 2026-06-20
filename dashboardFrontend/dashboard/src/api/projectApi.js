import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

const multipartHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchProjects = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/projects?${q}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const fetchProjectById = async (id) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const fetchProjectStats = async () => {
  const res = await fetch(`${BASE_URL}/projects/stats`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createProject = async (formData) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: multipartHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const updateProject = async (id, formData) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: multipartHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const deleteProject = async (id) => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
