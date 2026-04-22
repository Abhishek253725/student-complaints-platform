import axios from "axios";

const API = axios.create({
  // /api hata do kyunki .env mein already hai
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Request interceptor - token add karo
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("vr_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;