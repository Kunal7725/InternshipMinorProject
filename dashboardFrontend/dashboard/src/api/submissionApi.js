import { BASE_URL, getAuthHeaders, handleResponse } from "./config";

const multipartHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchSubmissions = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/submissions?${q}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createSubmission = async (formData) => {
  const res = await fetch(`${BASE_URL}/submissions`, {
    method: "POST",
    headers: multipartHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const updateSubmission = async (id, formData) => {
  const res = await fetch(`${BASE_URL}/submissions/${id}`, {
    method: "PUT",
    headers: multipartHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const reviewSubmission = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/submissions/${id}/review`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};
