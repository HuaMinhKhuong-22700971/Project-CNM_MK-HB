const AUTH_STORAGE_KEY = "cnm_auth";

export function getStoredAuth() {
  const rawValue = window.sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    return null;
  }
}

export function setStoredAuth(value) {
  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
}

export function clearStoredAuth() {
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
