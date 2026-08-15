// Single home for the deployed API origin. Same value the components used
// inline before the redesign — collected here so new screens don't add more
// copies of it.
export const API_BASE = "https://game-accessories-api.onrender.com/api/v1";

export function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}
