// import axios from "axios";

// const api = axios.create({ baseURL: "/api" });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export const errMsg = (e) => e.response?.data?.message || "Network error";
// export default api;

// import axios from "axios";

// const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// const api = axios.create({
//   baseURL: API_URL ? `${API_URL}/api` : "/api",
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export const errMsg = (e) => e.response?.data?.message || "Network error";

// export default api;

// import axios from "axios";

// const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// const api = axios.create({
//   baseURL: API_URL ? `${API_URL}/api` : "/api",
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export const errMsg = (e) => e.response?.data?.message || "Network error";

// export default api;

import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e.response?.data?.message || "Network error";

export default api;
