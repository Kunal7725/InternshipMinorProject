const BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (res.status === 401) {
    // Token expired or invalid — force logout
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (res.status === 403) {
    // Authenticated but not authorized — redirect to dashboard
    window.location.href = "/dashboard";
    throw new Error(data.message || "You do not have permission to perform this action.");
  }
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

export { BASE_URL, getAuthHeaders, handleResponse };
