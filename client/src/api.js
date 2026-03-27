const base = import.meta.env.VITE_API_URL || "";

export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${base}${path}`;
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("bees_token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  getMembers: () => request("/api/members"),
  getMember: (slug) => request(`/api/members/${encodeURIComponent(slug)}`),
  loginStart: (password) =>
    request("/api/auth/login/start", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  loginVerify: (challengeId, code) =>
    request("/api/auth/login/verify", {
      method: "POST",
      body: JSON.stringify({ challengeId, code }),
    }),
  createMember: (body) =>
    request("/api/members", { method: "POST", body: JSON.stringify(body) }),
  updateMember: (id, body) =>
    request(`/api/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteMember: (id) =>
    request(`/api/members/${id}`, { method: "DELETE" }),
  uploadPhoto: (id, file) => {
    const fd = new FormData();
    fd.append("photo", file);
    return request(`/api/members/${id}/photo`, { method: "POST", body: fd });
  },
  getSuggestions: () => request("/api/suggestions"),
  deleteSuggestion: (id) =>
    request(`/api/suggestions/${id}`, { method: "DELETE" }),
  postSuggestion: (body) =>
    request("/api/suggestions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getSettings: () => request("/api/settings"),
  patchSettings: (body) =>
    request("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append("logo", file);
    return request("/api/settings/logo", { method: "POST", body: fd });
  },
  getMedia: () => request("/api/media"),
  uploadMedia: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return request("/api/media", { method: "POST", body: fd });
  },
  deleteMedia: (id) => request(`/api/media/${id}`, { method: "DELETE" }),
};
