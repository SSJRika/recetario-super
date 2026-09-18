function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "/login";
  }
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(url, options);
  if (res.status === 401) {
    logout();
    return null;
  }
  return res;
}