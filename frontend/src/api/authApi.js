import api from "./axios";
export function loginRequest(credentials) {
  return api.post("/auth/login", credentials);
}

export function registerRequest(payload) {
  return api.post("/auth/register", payload);
}